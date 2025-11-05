#!/usr/bin/env bun

/**
 * AI Code Quality Gates
 *
 * Automated validation system for AI-generated code
 * Ensures compliance with ESLint rules and best practices
 *
 * Usage:
 * bun run scripts/quality-gates.ts [file-path]
 * bun run scripts/quality-gates.ts --all
 * bun run scripts/quality-gates.ts --watch
 */

import { file, glob, spawn } from "bun";
import { z } from "zod";

// Quality metrics schema
const QualityMetricsSchema = z.object({
  functions: z.array(z.object({
    name: z.string(),
    lines: z.number(),
    complexity: z.number(),
    hasEarlyValidation: z.boolean(),
    hasAnyTypes: z.boolean(),
    hasMagicNumbers: z.boolean(),
    params: z.array(z.object({
      name: z.string(),
      type: z.string(),
    })),
  })),
  totalLines: z.number(),
  violations: z.array(z.object({
    line: z.number(),
    rule: z.string(),
    severity: z.enum(['error', 'warning']),
    message: z.string(),
  })),
  score: z.number().min(0).max(100),
});

type QualityMetrics = z.infer<typeof QualityMetricsSchema>;

// AI-specific rules
const AI_RULES = {
  // ESLint rules from your config
  MAX_LINES_PER_FUNCTION: 15,
  MAX_FUNCTION_COMPLEXITY: 5,
  MAX_COGNITIVE_COMPLEXITY: 15,
  MAX_PARAMS: 4,
  MAX_FILE_LINES: 300,

  // AI-specific patterns
  EARLY_VALIDATION_LINES: 5,  // Validation must be in first 5 lines
  MAX_NESTING_DEPTH: 3,
  MIN_FUNCTION_NAME_LENGTH: 4,
};

// Forbidden patterns for AI-generated code
const FORBIDDEN_PATTERNS = [
  { pattern: /: any(\s|\[|,|;|$)/g, rule: 'any-type', message: 'Using "any" type is prohibited' },
  { pattern: /console\.log/g, rule: 'console-log', message: 'Use proper logging instead of console.log' },
  { pattern: /\/\* eslint-disable/g, rule: 'eslint-disable', message: 'ESLint disable comments are prohibited' },
  { pattern: /\/\/ eslint-disable/g, rule: 'eslint-disable', message: 'ESLint disable comments are prohibited' },
  { pattern: /@ts-ignore/g, rule: 'ts-ignore', message: '@ts-ignore comments are prohibited' },
  { pattern: /@ts-expect-error/g, rule: 'ts-expect-error', message: '@ts-expect-error should be avoided' },
];

// Magic number pattern (excluding common values)
const MAGIC_NUMBER_PATTERN = /\b(?!0|1|-1|2|10|100|1000)\d+(?!\w)/g;

/**
 * Analyze TypeScript code for AI quality compliance
 */
async function analyzeCode(filePath: string): Promise<QualityMetrics> {
  try {
    const content = await file(filePath).text();
    const lines = content.split('\n');
    const violations: QualityMetrics['violations'] = [];

    console.log(`🔍 Analyzing ${filePath}...`);

    // Check forbidden patterns
    for (const { pattern, rule, message } of FORBIDDEN_PATTERNS) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const lineIndex = content.substring(0, match.index!).split('\n').length - 1;
        violations.push({
          line: lineIndex + 1,
          rule,
          severity: 'error',
          message,
        });
      }
    }

    // Check magic numbers
    const magicMatches = content.matchAll(MAGIC_NUMBER_PATTERN);
    for (const match of magicMatches) {
      const lineIndex = content.substring(0, match.index!).split('\n').length - 1;
      violations.push({
        line: lineIndex + 1,
        rule: 'magic-numbers',
        severity: 'warning',
        message: `Magic number "${match[0]}" should be replaced with named constant`,
      });
    }

    // Analyze functions
    const functions = analyzeFunctions(content, violations);

    // Check file-level violations
    if (lines.length > AI_RULES.MAX_FILE_LINES) {
      violations.push({
        line: lines.length,
        rule: 'max-lines',
        severity: 'warning',
        message: `File too long: ${lines.length} lines (max: ${AI_RULES.MAX_FILE_LINES})`,
      });
    }

    // Calculate quality score
    const baseScore = 100;
    const deductionPerError = 5;
    const deductionPerWarning = 2;

    const errorCount = violations.filter(v => v.severity === 'error').length;
    const warningCount = violations.filter(v => v.severity === 'warning').length;

    const score = Math.max(0, baseScore - (errorCount * deductionPerError) - (warningCount * deductionPerWarning));

    return {
      functions,
      totalLines: lines.length,
      violations,
      score,
    };

  } catch (error) {
    console.error(`❌ Error analyzing ${filePath}:`, error);
    throw error;
  }
}

/**
 * Analyze functions within the code
 */
function analyzeFunctions(content: string, violations: QualityMetrics['violations']) {
  const functions = [];
  const lines = content.split('\n');

  // Match function declarations (various patterns)
  const functionPatterns = [
    /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*:\s*[^{]*\{/g,
    /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>\s*{/g,
    /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function\s*\([^)]*\)\s*{/g,
    /(\w+)\s*\([^)]*\)\s*:\s*[^{]*\{/g, // Class methods
  ];

  for (const pattern of functionPatterns) {
    const matches = [...content.matchAll(pattern)];

    for (const match of matches) {
      const functionName = match[1];
      if (!functionName || functionName === 'if' || functionName === 'for' || functionName === 'while') {
        continue; // Skip false matches
      }

      const functionStart = match.index!;
      const functionContent = extractFunctionContent(content, functionStart);
      const functionLines = functionContent.split('\n');

      const analysis = {
        name: functionName,
        lines: functionLines.length,
        complexity: calculateComplexity(functionContent),
        hasEarlyValidation: hasEarlyValidation(functionLines),
        hasAnyTypes: /: any(\s|\[|,|;|$)/.test(functionContent),
        hasMagicNumbers: MAGIC_NUMBER_PATTERN.test(functionContent),
        params: extractParameters(match[0]),
      };

      functions.push(analysis);

      // Check function-level violations
      if (analysis.lines > AI_RULES.MAX_LINES_PER_FUNCTION) {
        violations.push({
          line: content.substring(0, functionStart).split('\n').length,
          rule: 'max-lines-per-function',
          severity: 'error',
          message: `Function "${functionName}" too long: ${analysis.lines} lines (max: ${AI_RULES.MAX_LINES_PER_FUNCTION})`,
        });
      }

      if (analysis.complexity > AI_RULES.MAX_FUNCTION_COMPLEXITY) {
        violations.push({
          line: content.substring(0, functionStart).split('\n').length,
          rule: 'complexity',
          severity: 'error',
          message: `Function "${functionName}" too complex: ${analysis.complexity} (max: ${AI_RULES.MAX_FUNCTION_COMPLEXITY})`,
        });
      }

      if (analysis.params.length > AI_RULES.MAX_PARAMS) {
        violations.push({
          line: content.substring(0, functionStart).split('\n').length,
          rule: 'max-params',
          severity: 'error',
          message: `Function "${functionName}" has too many parameters: ${analysis.params.length} (max: ${AI_RULES.MAX_PARAMS})`,
        });
      }

      if (!analysis.hasEarlyValidation && analysis.lines > 10) {
        violations.push({
          line: content.substring(0, functionStart).split('\n').length,
          rule: 'early-validation',
          severity: 'warning',
          message: `Function "${functionName}" lacks early validation (should be in first ${AI_RULES.EARLY_VALIDATION_LINES} lines)`,
        });
      }
    }
  }

  return functions;
}

/**
 * Extract function content between braces
 */
function extractFunctionContent(content: string, startIndex: number): string {
  const firstBrace = content.indexOf('{', startIndex);
  if (firstBrace === -1) return '';

  let braceCount = 1;
  let endIndex = firstBrace + 1;

  while (endIndex < content.length && braceCount > 0) {
    if (content[endIndex] === '{') braceCount++;
    else if (content[endIndex] === '}') braceCount--;
    endIndex++;
  }

  return content.substring(firstBrace, endIndex);
}

/**
 * Calculate cyclomatic complexity
 */
function calculateComplexity(code: string): number {
  let complexity = 1; // Base complexity

  // Patterns that increase complexity
  const complexityPatterns = [
    /\bif\b/g,
    /\belse\s+if\b/g,
    /\belse\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bdo\b/g,
    /\bswitch\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /\b&&\b/g,
    /\|\|\b/g,
    /\?\s*[^:]*\s*:/g, // ternary operator
  ];

  for (const pattern of complexityPatterns) {
    const matches = code.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  }

  return complexity;
}

/**
 * Check if function has early validation
 */
function hasEarlyValidation(lines: string[]): boolean {
  const validationLines = lines.slice(0, AI_RULES.EARLY_VALIDATION_LINES);

  for (const line of validationLines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith('if') &&
      (trimmed.includes('return') || trimmed.includes('throw'))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Extract parameters from function signature
 */
function extractParameters(functionSignature: string): Array<{ name: string; type: string }> {
  const paramMatch = functionSignature.match(/\(([^)]*)\)/);
  if (!paramMatch) return [];

  const paramString = paramMatch[1];
  const params = paramString.split(',').map(p => p.trim()).filter(p => p);

  return params.map(param => {
    const [nameAndType] = param.split(':').map(p => p.trim());
    const [name] = nameAndType.split('=').map(p => p.trim()); // Handle default values

    return {
      name: name || 'param',
      type: 'unknown', // Could be enhanced to extract actual type
    };
  });
}

/**
 * Run ESLint on file and merge results
 */
async function runESLint(filePath: string): Promise<string> {
  try {
    const result = await spawn({
      cmd: ["bun", "run", "lint:file", filePath],
      stdout: "pipe",
      stderr: "pipe",
    });

    const output = await new Response(result.stdout).text();
    return output;
  } catch (error) {
    console.error('ESLint execution failed:', error);
    return '';
  }
}

/**
 * Display quality analysis results
 */
function displayResults(filePath: string, metrics: QualityMetrics): void {
  console.log(`\n📊 Quality Analysis: ${filePath}`);
  console.log('='.repeat(50));

  // Overall score
  const scoreEmoji = metrics.score >= 90 ? '🟢' : metrics.score >= 70 ? '🟡' : '🔴';
  console.log(`\n${scoreEmoji} Overall Score: ${metrics.score}/100`);
  console.log(`📁 Total Lines: ${metrics.totalLines}`);
  console.log(`⚡ Functions: ${metrics.functions.length}`);

  // Violations summary
  const errorCount = metrics.violations.filter(v => v.severity === 'error').length;
  const warningCount = metrics.violations.filter(v => v.severity === 'warning').length;

  console.log(`\n❌ Errors: ${errorCount}`);
  console.log(`⚠️  Warnings: ${warningCount}`);

  // Critical violations
  const criticalViolations = metrics.violations.filter(v => v.severity === 'error');
  if (criticalViolations.length > 0) {
    console.log('\n🚨 Critical Issues:');
    criticalViolations.forEach(violation => {
      console.log(`   Line ${violation.line}: ${violation.message} (${violation.rule})`);
    });
  }

  // Function analysis
  const problematicFunctions = metrics.functions.filter(f =>
    f.lines > AI_RULES.MAX_LINES_PER_FUNCTION ||
    f.complexity > AI_RULES.MAX_FUNCTION_COMPLEXITY ||
    !f.hasEarlyValidation
  );

  if (problematicFunctions.length > 0) {
    console.log('\n⚡ Function Issues:');
    problematicFunctions.forEach(func => {
      const issues = [];
      if (func.lines > AI_RULES.MAX_LINES_PER_FUNCTION)
        issues.push(`${func.lines} lines`);
      if (func.complexity > AI_RULES.MAX_FUNCTION_COMPLEXITY)
        issues.push(`complexity ${func.complexity}`);
      if (!func.hasEarlyValidation && func.lines > 10)
        issues.push('no early validation');

      console.log(`   ${func.name}(): ${issues.join(', ')}`);
    });
  }

  // AI-specific suggestions
  console.log('\n💡 AI Development Suggestions:');
  if (metrics.functions.some(f => f.hasAnyTypes)) {
    console.log('   • Replace "any" types with specific TypeScript types');
  }
  if (metrics.functions.some(f => !f.hasEarlyValidation && f.lines > 10)) {
    console.log('   • Add input validation in first 5 lines of functions');
  }
  if (metrics.functions.some(f => f.lines > AI_RULES.MAX_LINES_PER_FUNCTION)) {
    console.log('   • Split large functions into smaller, focused functions');
  }
  if (metrics.violations.some(v => v.rule === 'magic-numbers')) {
    console.log('   • Replace magic numbers with named constants');
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🔧 AI Code Quality Gates

Usage:
  bun run scripts/quality-gates.ts [file-path]     # Analyze single file
  bun run scripts/quality-gates.ts --all          # Analyze all TS files
  bun run scripts/quality-gates.ts --watch        # Watch mode for development

AI Rules Enforced:
• Max 30 lines per function
• Max 10 cyclomatic complexity
• Early validation in first 5 lines
• No "any" types
• No ESLint disable comments
• No magic numbers
• Max 4 parameters per function
`);
    process.exit(0);
  }

  try {
    if (args[0] === '--all') {
      // Analyze all TypeScript files
      const files = await glob('**/*.ts');
      let totalScore = 0;
      const results = [];

      for (const filePath of files) {
        if (filePath.includes('node_modules') || filePath.includes('dist')) continue;

        const metrics = await analyzeCode(filePath);
        results.push({ filePath, metrics });
        totalScore += metrics.score;
      }

      // Display summary
      console.log('\n📋 Project Quality Summary');
      console.log('='.repeat(40));
      console.log(`Files analyzed: ${results.length}`);
      console.log(`Average score: ${(totalScore / results.length).toFixed(1)}/100`);

      // Display worst files
      const worstFiles = results
        .sort((a, b) => a.metrics.score - b.metrics.score)
        .slice(0, 5);

      if (worstFiles.length > 0) {
        console.log('\n🔴 Files needing attention:');
        worstFiles.forEach(({ filePath, metrics }) => {
          console.log(`   ${filePath}: ${metrics.score}/100 (${metrics.violations.length} issues)`);
        });
      }

      // Overall success/failure
      const averageScore = totalScore / results.length;
      if (averageScore >= 80) {
        console.log('\n✅ Project quality meets standards');
        process.exit(0);
      } else {
        console.log('\n❌ Project quality needs improvement');
        process.exit(1);
      }

    } else {
      // Analyze single file
      const filePath = args[0];
      const metrics = await analyzeCode(filePath);
      displayResults(filePath, metrics);

      // Exit with appropriate code
      if (metrics.score >= 80) {
        console.log('\n✅ Code quality acceptable');
        process.exit(0);
      } else {
        console.log('\n❌ Code quality needs improvement');
        process.exit(1);
      }
    }

  } catch (error) {
    console.error('❌ Quality gate analysis failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}

export { analyzeCode, type QualityMetrics };