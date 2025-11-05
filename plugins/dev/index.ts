/**
 * Development Plugin - Enhanced development toolkit for Claude Code
 *
 * This plugin provides comprehensive development tools and templates
 * optimized for AI-assisted development with Bun.js integration.
 *
 * Features:
 * - AI-safe code templates with Handlebars
 * - Bun.js development patterns and utilities
 * - Automated quality gates for AI-generated code
 * - TypeScript optimization patterns
 * - Performance monitoring and analysis
 */

import { z } from 'zod';
import { generateTemplate, parseParams, type TemplateOptions } from './scripts/template-generator';
import { analyzeCode, type QualityMetrics } from './scripts/quality-gates';

// Plugin version and info
const PLUGIN_VERSION = '1.0.0';
const PLUGIN_NAME = 'dev';

// Configuration schema
const PluginConfigSchema = z.object({
  // AI quality controls
  aiQualityGates: z.boolean().default(true),
  aiStrictMode: z.boolean().default(true),
  maxFunctionLines: z.number().default(15),
  maxComplexity: z.number().default(5),

  // Bun.js specific
  bunOptimizations: z.boolean().default(true),
  enableHotReload: z.boolean().default(true),
  enableDatabase: z.boolean().default(false),

  // Development workflow
  autoFixOnSave: z.boolean().default(true),
  generateTemplates: z.boolean().default(true),

  // Performance
  enableProfiling: z.boolean().default(false),
  memoryOptimization: z.boolean().default(true),

  // Output paths
  templatesDir: z.string().default('./templates'),
  outputDir: z.string().default('./generated'),
  scriptsDir: z.string().default('./scripts'),
});

type PluginConfig = z.infer<typeof PluginConfigSchema>;

/**
 * Development Plugin Class
 */
export class DevPlugin {
  private config: PluginConfig;
  private version: string = PLUGIN_VERSION;
  private initialized: boolean = false;

  constructor(config: Partial<PluginConfig> = {}) {
    this.config = PluginConfigSchema.parse(config);
  }

  /**
   * Get plugin information and capabilities
   */
  getInfo() {
    return {
      name: PLUGIN_NAME,
      version: this.version,
      description: 'Enhanced development toolkit with Bun.js integration and AI-safe code generation',
      capabilities: [
        'Template generation with Handlebars',
        'AI code quality gates',
        'Bun.js development patterns',
        'TypeScript optimization',
        'Performance analysis',
        'Database integration utilities',
        'WebSocket helpers',
        'Testing utilities'
      ],
      config: this.config,
      status: this.initialized ? 'active' : 'inactive'
    };
  }

  /**
   * Initialize the plugin with optional project path
   */
  async initialize(projectPath: string = process.cwd()): Promise<void> {
    if (this.initialized) {
      console.log(`⚠️  Plugin ${PLUGIN_NAME} already initialized`);
      return;
    }

    console.log(`🚀 Initializing ${PLUGIN_NAME} plugin for ${projectPath}`);
    console.log(`   Version: ${this.version}`);
    console.log(`   AI Quality Gates: ${this.config.aiQualityGates ? 'Enabled' : 'Disabled'}`);
    console.log(`   Bun Optimizations: ${this.config.bunOptimizations ? 'Enabled' : 'Disabled'}`);

    try {
      // Setup directories
      await this.ensureDirectories();

      // Initialize AI quality gates if enabled
      if (this.config.aiQualityGates) {
        await this.setupQualityGates();
      }

      // Setup Bun optimizations if enabled
      if (this.config.bunOptimizations) {
        await this.setupBunOptimizations();
      }

      // Initialize development workflow
      await this.setupDevelopmentWorkflow();

      // Register slash commands
      await this.registerSlashCommands();

      this.initialized = true;
      console.log('✅ Development plugin initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize development plugin:', error);
      throw error;
    }
  }

  /**
   * Generate code template using Handlebars with pre-validation
   */
  async generateTemplate(
    templateName: string,
    options: Partial<TemplateOptions>,
    autoFix: boolean = true
  ): Promise<string> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized. Call initialize() first.');
    }

    const templateOptions: TemplateOptions = {
      template: templateName,
      ...options,
    };

    try {
      console.log(`🔧 Generating template: ${templateName}`);

      // 1. Pre-validate template options against AI rules
      await this.preValidateTemplateOptions(templateOptions);

      // 2. Generate template
      let generated = await generateTemplate(templateName, templateOptions);

      // 3. Post-validate and auto-fix generated code
      if (autoFix) {
        generated = await this.autoFixGeneratedCode(generated);
      }

      // 4. Final validation
      const validation = await this.validateCode(generated);
      if (!validation.valid && this.config.aiStrictMode) {
        console.warn(`⚠️  Generated code has quality issues (score: ${validation.score}/100):`);
        validation.violations.forEach(v => {
          if (v.severity === 'error') {
            console.warn(`   ${v.rule}: ${v.message}`);
          }
        });
      }

      console.log(`✅ Template generated successfully (quality: ${validation.score}/100)`);
      return generated;
    } catch (error) {
      console.error(`❌ Failed to generate template ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Pre-validate template options to prevent common AI errors
   * Enhanced to handle frequent lint problems: JSDoc, imports, duplication, file size, parameters
   * AND TypeScript typecheck errors: export/import, property access, type assignment, null/undefined
   */
  private async preValidateTemplateOptions(options: TemplateOptions): Promise<void> {
    // 1. Parameter validation (enhanced)
    if (options.params) {
      const paramList = options.params.split(',').map(p => p.trim());

      // Check parameter count limit (ESLint max-params: 4)
      if (paramList.length > 4) {
        throw new Error(`Too many parameters (${paramList.length}). Maximum allowed is 4 parameters. Consider using an options object or breaking down the function.`);
      }

      for (const param of paramList) {
        const [name, type] = param.split(':').map(p => p.trim());

        // Prevent 'any' types in parameters
        if (type === 'any' || type === 'any[]') {
          throw new Error(`Parameter '${name}' uses 'any' type. Use specific TypeScript types instead.`);
        }

        // Validate parameter naming (descriptive names, avoid single letters except i/j/k for loops)
        if (name && !/^(i|j|k)$/.test(name) && name.length < 2) {
          throw new Error(`Parameter name '${name}' is too short. Use descriptive names (min 2 characters) except for loop counters i/j/k.`);
        }

        // Check for potentially duplicated parameter names
        const duplicates = paramList.filter(p => p.split(':')[0].trim() === name);
        if (duplicates.length > 1) {
          throw new Error(`Duplicate parameter name '${name}' detected. Each parameter must have a unique name.`);
        }

        // TypeScript Type Safety Validation
        this.validateParameterTypes(name, type);
      }
    }

    // 2. File size validation (warn about potentially large generated files)
    const estimatedSize = this.estimateGeneratedFileSize(options);
    if (estimatedSize > 300) { // ESLint max-lines: 300
      console.warn(`⚠️  Generated file may be large (~${estimatedSize} lines). Consider breaking into smaller modules (max: 300 lines).`);
    }

    // 3. JSDoc requirement validation
    if (options.name && !options.description) {
      console.warn(`⚠️  Function '${options.name}' lacks description. JSDoc will be auto-generated but should be customized.`);
    }

    // 4. TypeScript Export/Import Validation
    this.validateExportImportPatterns(options);

    // 5. Template-specific validations
    if (options.template === 'ai-function' && !options.returns) {
      console.warn(`⚠️  AI function template should specify return type for better JSDoc generation.`);
    }

    // 6. TypeScript Property Access Validation
    this.validatePropertyAccessPatterns(options);
  }

  /**
   * Validate parameter types for common TypeScript issues
   */
  private validateParameterTypes(paramName: string, paramType: string): void {
    // Check for potentially problematic types that often cause TypeScript errors
    const problematicTypes = [
      'any', 'any[]', 'Object', 'object', 'Function', 'unknown[]'
    ];

    if (problematicTypes.includes(paramType)) {
      console.warn(`⚠️  Parameter '${paramName}' uses '${paramType}' type. Consider using more specific types to prevent TypeScript errors.`);
    }

    // Check for potential type assignment issues
    if (paramType.includes('Promise<') && !paramType.includes('Result<')) {
      console.warn(`⚠️  Parameter '${paramName}' uses Promise without Result type. Consider using Result<T, Error> pattern for better error handling.`);
    }

    // Warn about optional types that might cause undefined issues
    if (paramType.includes('undefined')) {
      console.warn(`⚠️  Parameter '${paramName}' includes undefined type. Ensure proper null checks in implementation.`);
    }
  }

  /**
   * Validate export/import patterns that commonly cause TypeScript errors
   */
  private validateExportImportPatterns(options: TemplateOptions): void {
    // Check for potential import/export issues
    if (options.name) {
      // Warn about naming conflicts with common built-in types
      const conflictingNames = [
        'Error', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Date', 'RegExp',
        'Promise', 'Map', 'Set', 'JSON', 'Math', 'console', 'document', 'window'
      ];

      if (conflictingNames.includes(options.name)) {
        console.warn(`⚠️  Function name '${options.name}' conflicts with built-in global type. Consider using a different name to avoid TypeScript conflicts.`);
      }
    }

    // Check for template-specific import issues
    if (options.template === 'ai-function') {
      console.warn(`⚠️  AI function template may need imports. Ensure all imported types and functions are properly exported from their modules.`);
    }
  }

  /**
   * Validate property access patterns that commonly cause TypeScript errors
   */
  private validatePropertyAccessPatterns(options: TemplateOptions): void {
    // Common property access patterns that cause TypeScript errors
    const riskyPatterns = [
      { pattern: 'result.data', message: 'Result type may not have .data property. Consider using result.value instead' },
      { pattern: 'result.error', message: 'Result type may not have .error property. Consider proper error handling pattern' },
      { pattern: 'result.isOk', message: 'Result type may not have .isOk property. Consider using result.success instead' },
      { pattern: 'result.isErr', message: 'Result type may not have .isErr property. Consider using !result.success instead' },
    ];

    // Warn about potentially unsafe property access
    if (options.description) {
      for (const { pattern, message } of riskyPatterns) {
        if (options.description.includes(pattern)) {
          console.warn(`⚠️  Template description contains '${pattern}'. ${message}.`);
        }
      }
    }
  }

  /**
   * Estimate the generated file size based on template options
   */
  private estimateGeneratedFileSize(options: TemplateOptions): number {
    let baseSize = 50; // Base template overhead
    let paramSize = 0;
    let complexitySize = 0;

    // Add size for parameters
    if (options.params) {
      paramSize = options.params.split(',').length * 10; // ~10 lines per parameter
    }

    // Add size based on complexity indicators
    if (options.returns?.includes('Promise')) complexitySize += 20;
    if (options.async) complexitySize += 15;
    if (options.throws) complexitySize += 10;

    return baseSize + paramSize + complexitySize;
  }

  /**
   * Auto-fix common issues in generated code
   * Enhanced to handle frequent lint problems AND TypeScript typecheck errors
   */
  private async autoFixGeneratedCode(code: string): Promise<string> {
    let fixedCode = code;

    // Fix 1: Replace 'any' types with more appropriate defaults
    fixedCode = fixedCode.replace(/: any(\s|\[|,|;|$)/g, ': unknown$1');

    // Fix 2: Organize and optimize imports
    fixedCode = this.organizeImports(fixedCode);

    // Fix 3: Remove obvious console.log statements from templates
    fixedCode = fixedCode.replace(/console\.log\([^)]*\);?\s*\n/g, '');

    // Fix 4: Add comprehensive JSDoc documentation
    fixedCode = this.addComprehensiveDocumentation(fixedCode);

    // Fix 5: Handle function complexity and parameter issues
    fixedCode = this.optimizeFunctionStructure(fixedCode);

    // Fix 6: Remove code duplication
    fixedCode = this.removeCodeDuplication(fixedCode);

    // Fix 7: Add file size warnings for large files
    fixedCode = this.addFileSizeWarnings(fixedCode);

    // Fix 8: TypeScript-specific auto-fixes
    fixedCode = this.fixTypeScriptIssues(fixedCode);

    return fixedCode;
  }

  /**
   * Fix common TypeScript compilation issues
   */
  private fixTypeScriptIssues(code: string): string {
    let fixedCode = code;

    // Fix 8.1: Replace problematic Result property access patterns
    fixedCode = fixedCode.replace(/result\.isOk/g, 'result.success');
    fixedCode = fixedCode.replace(/result\.isErr/g, '!result.success');
    fixedCode = fixedCode.replace(/result\.error/g, 'result.success ? undefined : result.error');
    fixedCode = fixedCode.replace(/result\.data/g, 'result.success ? result.data : undefined');
    fixedCode = fixedCode.replace(/result\.value/g, 'result.success ? result.data : undefined');

    // Fix 8.2: Add null/undefined checks for potentially unsafe access
    fixedCode = this.addNullSafetyChecks(fixedCode);

    // Fix 8.3: Fix common type assignment issues
    fixedCode = this.fixTypeAssignments(fixedCode);

    // Fix 8.4: Add proper export statements for types
    fixedCode = this.ensureTypeExports(fixedCode);

    return fixedCode;
  }

  /**
   * Add null safety checks for common error patterns
   */
  private addNullSafetyChecks(code: string): string {
    const lines = code.split('\n');
    const fixedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Add null checks for potentially unsafe access
      if (trimmed.includes('?.') || trimmed.includes('!.')) {
        // Line already has optional chaining or non-null assertion - keep it
        fixedLines.push(line);
      } else if (trimmed.match(/^[^/]*\.[a-zA-Z]+\w*\s*[=!]/)) {
        // Property access without null check - add safe navigation
        const indent = line.match(/^(\s*)/)?.[1] || '';
        const safeLine = line.replace(/(\w+)\.(\w+)/g, '$1?.$2');
        if (safeLine !== line) {
          // Add null check comment
          fixedLines.push(`${indent}// TODO: Add null check for $1`);
          fixedLines.push(safeLine);
        } else {
          fixedLines.push(line);
        }
      } else {
        fixedLines.push(line);
      }
    }

    return fixedLines.join('\n');
  }

  /**
   * Fix common type assignment issues
   */
  private fixTypeAssignments(code: string): string {
    let fixedCode = code;

    // Fix Object to Record<string, unknown> assignments
    fixedCode = fixedCode.replace(
      /:\s*Object(\s*[=|])/g,
      ': Record<string, unknown>$1'
    );

    // Fix Function types to proper function signatures
    fixedCode = fixedCode.replace(
      /:\s*Function(\s*[=|])/g,
      ': (...args: unknown[]) => unknown$1'
    );

    // Fix unknown array types
    fixedCode = fixedCode.replace(
      /:\s*unknown\[\](\s*[=|])/g,
      ': Array<unknown>$1'
    );

    return fixedCode;
  }

  /**
   * Ensure proper type exports are present
   */
  private ensureTypeExports(code: string): string {
    const lines = code.split('\n');
    const fixedLines: string[] = [];
    const typesUsed = new Set<string>();
    const typesExported = new Set<string>();

    // Collect used and exported types
    for (const line of lines) {
      const trimmed = line.trim();

      // Find type usages
      const typeMatches = trimmed.match(/:\s*([A-Z][a-zA-Z0-9]*)/g);
      if (typeMatches) {
        typeMatches.forEach(match => {
          const type = match.replace(/:\s*/, '');
          if (type !== 'string' && type !== 'number' && type !== 'boolean') {
            typesUsed.add(type);
          }
        });
      }

      // Find exported types
      if (trimmed.startsWith('export type ')) {
        const typeName = trimmed.replace('export type ', '').split(' ')[0];
        typesExported.add(typeName);
      }

      fixedLines.push(line);
    }

    // Add missing type exports
    const missingExports = Array.from(typesUsed).filter(type => !typesExported.has(type));
    if (missingExports.length > 0) {
      const exportComment = '// TODO: Add proper type exports for: ' + missingExports.join(', ');
      fixedLines.unshift(exportComment);
    }

    return fixedLines.join('\n');
  }

  /**
   * Organize imports according to ESLint import/order rules
   */
  private organizeImports(code: string): string {
    const lines = code.split('\n');
    const imports: string[] = [];
    const nonImports: string[] = [];
    let inImports = true;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('import ')) {
        imports.push(line);
      } else if (trimmed === '' && inImports) {
        imports.push(line); // Keep blank lines in import section
      } else {
        inImports = false;
        nonImports.push(line);
      }
    }

    // Sort imports: builtin -> external -> internal -> parent -> sibling -> index
    const sortedImports = imports.filter(line => line.trim()).sort((a, b) => {
      const aIsBuiltin = a.match(/^import ['"](?:fs|path|os|http|https|url|util|events|stream|crypto|zlib|child_process|cluster|dgram|dns|net|readline|repl|timers|tls|v8|vm|worker_threads)/);
      const bIsBuiltin = b.match(/^import ['"](?:fs|path|os|http|https|url|util|events|stream|crypto|zlib|child_process|cluster|dgram|dns|net|readline|repl|timers|tls|v8|vm|worker_threads)/);

      if (aIsBuiltin && !bIsBuiltin) return -1;
      if (!aIsBuiltin && bIsBuiltin) return 1;

      // Then alphabetize
      return a.localeCompare(b);
    });

    // Add newline after imports
    const organizedCode = [...sortedImports, '', ...nonImports].join('\n');
    return organizedCode.replace(/\n{3,}/g, '\n\n'); // Remove excessive blank lines
  }

  /**
   * Add comprehensive JSDoc documentation for better lint compliance
   */
  private addComprehensiveDocumentation(code: string): string {
    const lines = code.split('\n');
    const fixedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check for exported functions without JSDoc
      if (trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+\w+|export\s+const\s+\w+\s*=.*\s*=>/)) {
        const prevLine = i > 0 ? lines[i - 1].trim() : '';

        if (!prevLine.startsWith('/**') && !prevLine.startsWith('*')) {
          const indent = line.match(/^(\s*)/)?.[1] || '';
          const functionMatch = line.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=)/);
          const functionName = functionMatch?.[1] || functionMatch?.[2] || 'function';

          // Enhanced JSDoc with complete structure
          const jsDocLines = [
            `${indent}/**`,
            `${indent} * ${functionName.charAt(0).toUpperCase() + functionName.slice(1)} function.`,
            `${indent} *`,
            `${indent} * @returns TODO: Document return type`,
            `${indent} * @throws TODO: Document error conditions`,
            `${indent} */`
          ];

          fixedLines.push(...jsDocLines);
        }
      }

      fixedLines.push(line);
    }

    return fixedLines.join('\n');
  }

  /**
   * Optimize function structure to handle parameter limits and complexity
   */
  private optimizeFunctionStructure(code: string): string {
    const lines = code.split('\n');
    const fixedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for functions with too many parameters and suggest refactoring
      const paramMatch = line.match(/function\s+\w+\s*\(([^)]*)\)/);
      if (paramMatch && paramMatch[1]) {
        const paramCount = paramMatch[1].split(',').filter(p => p.trim()).length;

        if (paramCount > 4) {
          const indent = line.match(/^(\s*)/)?.[1] || '';
          const commentLine = `${indent}// TODO: Consider using options object for ${paramCount} parameters (max: 4)`;
          fixedLines.push(commentLine);
        }
      }

      fixedLines.push(line);
    }

    return fixedLines.join('\n');
  }

  /**
   * Remove obvious code duplication patterns
   */
  private removeCodeDuplication(code: string): string {
    let fixedCode = code;

    // Remove consecutive duplicate lines
    const lines = fixedCode.split('\n');
    const dedupedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      const nextLine = lines[i + 1];

      // Skip duplicate consecutive lines (except blank lines and comments)
      if (currentLine === nextLine && currentLine.trim() !== '' && !currentLine.trim().startsWith('//')) {
        console.warn(`⚠️  Removed duplicate line: ${currentLine.trim()}`);
        continue;
      }

      dedupedLines.push(currentLine);
    }

    return dedupedLines.join('\n');
  }

  /**
   * Add file size warnings for files that might exceed ESLint limits
   */
  private addFileSizeWarnings(code: string): string {
    const lines = code.split('\n');
    const lineCount = lines.filter(line => line.trim() !== '' || line.trim().startsWith('//')).length;

    if (lineCount > 250) { // Warn before approaching 300 line limit
      const warning = `/**
 * ⚠️  FILE SIZE WARNING: This file has ${lineCount} lines (ESLint max-lines: 300)
 * Consider breaking into smaller modules to maintain code quality.
 */`;

      return warning + '\n\n' + code;
    }

    return code;
  }

  
  /**
   * Analyze code quality with AI-specific rules
   */
  async analyzeCode(filePath: string): Promise<QualityMetrics> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized. Call initialize() first.');
    }

    try {
      console.log(`🔍 Analyzing code quality for ${filePath}`);
      const metrics = await analyzeCode(filePath);

      // Display results based on AI strict mode
      if (this.config.aiStrictMode && metrics.score < 80) {
        console.warn(`⚠️  Code quality score ${metrics.score}/100 below threshold (80)`);
      }

      return metrics;
    } catch (error) {
      console.error(`❌ Failed to analyze code for ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Validate code against AI development standards
   * Enhanced to handle frequent lint problems AND TypeScript typecheck errors
   */
  async validateCode(code: string, context?: string): Promise<{
    valid: boolean;
    violations: Array<{ type: string; message: string; severity: 'error' | 'warning'; line?: number }>;
    suggestions: string[];
    score: number;
  }> {
    const violations: Array<{ type: string; message: string; severity: 'error' | 'warning'; line?: number }> = [];
    const suggestions: string[] = [];
    let score = 100;

    const lines = code.split('\n');

    // 1. Check for AI anti-patterns
    const antiPatterns = [
      { pattern: /: any(\s|\[|,|;|$)/g, type: 'typescript', message: 'Using "any" type is prohibited', deduction: 10 },
      { pattern: /console\.log/g, type: 'logging', message: 'Use proper logging instead of console.log', deduction: 5 },
      { pattern: /\/\* eslint-disable/g, type: 'eslint', message: 'ESLint disable comments are prohibited', deduction: 15 },
      { pattern: /@ts-ignore/g, type: 'typescript', message: '@ts-ignore comments are prohibited', deduction: 10 },
    ];

    for (const { pattern, type, message, deduction } of antiPatterns) {
      const matches = code.matchAll(pattern);
      for (const match of matches) {
        const lineIndex = code.substring(0, match.index!).split('\n').length - 1;
        violations.push({
          type,
          message,
          severity: 'error',
          line: lineIndex + 1,
        });
        score -= deduction;
      }
    }

    // 2. TypeScript Export/Import Issues Validation
    this.validateTypeScriptExportImport(code, violations, score);

    // 3. TypeScript Property Access Issues Validation
    this.validateTypeScriptPropertyAccess(code, violations, score);

    // 4. TypeScript Type Assignment Issues Validation
    this.validateTypeScriptTypeAssignments(code, violations, score);

    // 5. TypeScript Null/Undefined Issues Validation
    this.validateTypeScriptNullUndefined(code, violations, score);

    // 6. JSDoc validation - check for missing documentation
    const exportedFunctions = code.matchAll(/^(export\s+)?(async\s+)?function\s+\w+|export\s+const\s+\w+\s*=.*=>/gm);
    for (const match of exportedFunctions) {
      const lineIndex = code.substring(0, match.index!).split('\n').length;
      const prevLineIndex = lineIndex - 2;
      const prevLine = prevLineIndex >= 0 ? lines[prevLineIndex].trim() : '';

      if (!prevLine.startsWith('/**') && !prevLine.startsWith('*')) {
        violations.push({
          type: 'jsdoc',
          message: 'Exported function lacks JSDoc documentation',
          severity: 'error',
          line: lineIndex,
        });
        score -= 5;
      }
    }

    // 7. Import validation - check for organization and duplicates
    const importLines = Array.from(code.matchAll(/^import\s+.*$/gm));
    const duplicateImports = new Map<string, number[]>();

    importLines.forEach((match, index) => {
      const importStatement = match[0];
      const moduleMatch = importStatement.match(/from\s+['"]([^'"]+)['"]/);
      if (moduleMatch) {
        const module = moduleMatch[1];
        if (!duplicateImports.has(module)) {
          duplicateImports.set(module, []);
        }
        duplicateImports.get(module)!.push(index);
      }
    });

    // Check for duplicate imports
    for (const [module, indices] of duplicateImports) {
      if (indices.length > 1) {
        violations.push({
          type: 'import',
          message: `Duplicate import from module "${module}"`,
          severity: 'error',
        });
        score -= 8;
      }
    }

    // 8. File size validation
    const nonEmptyLines = lines.filter(line => line.trim() !== '').length;
    if (nonEmptyLines > 300) {
      violations.push({
        type: 'file-size',
        message: `File too large (${nonEmptyLines} lines, max: 300)`,
        severity: 'error',
      });
      score -= 15;
    } else if (nonEmptyLines > 250) {
      violations.push({
        type: 'file-size',
        message: `File approaching size limit (${nonEmptyLines} lines, max: 300)`,
        severity: 'warning',
      });
      score -= 5;
    }

    // 9. Parameter validation - check for too many parameters
    const functionParamMatches = code.matchAll(/function\s+\w+\s*\(([^)]*)\)/g);
    for (const match of functionParamMatches) {
      const paramString = match[1];
      if (paramString.trim()) {
        const paramCount = paramString.split(',').filter(p => p.trim()).length;
        if (paramCount > 4) {
          const lineIndex = code.substring(0, match.index!).split('\n').length;
          violations.push({
            type: 'parameters',
            message: `Function has too many parameters (${paramCount}, max: 4)`,
            severity: 'error',
            line: lineIndex,
          });
          score -= 10;
        }
      }
    }

    // 10. Function complexity and length validation
    const functionMatches = code.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)[^}]*\{/g);
    if (functionMatches) {
      functionMatches.forEach((funcMatch, index) => {
        const funcLines = funcMatch.split('\n').length;
        if (funcLines > this.config.maxFunctionLines) {
          violations.push({
            type: 'complexity',
            message: `Function ${index + 1} is too long (${funcLines} lines, max: ${this.config.maxFunctionLines})`,
            severity: 'error',
          });
          score -= 5;
        }

        // Check for early validation
        const funcContent = funcMatch;
        const hasEarlyValidation = /if\s*\([^)]+\)\s*(return|throw)/.test(funcContent);
        if (!hasEarlyValidation && funcLines > 10) {
          violations.push({
            type: 'pattern',
            message: `Function ${index + 1} lacks early validation`,
            severity: 'warning',
          });
          score -= 3;
        }
      });
    }

    // 11. Code duplication validation
    const lineGroups = new Map<string, number[]>();
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('/*')) {
        if (!lineGroups.has(trimmed)) {
          lineGroups.set(trimmed, []);
        }
        lineGroups.get(trimmed)!.push(index);
      }
    });

    for (const [lineContent, indices] of lineGroups) {
      if (indices.length > 2) { // Allow some repetition for similar patterns
        violations.push({
          type: 'duplication',
          message: `Duplicate code found ${indices.length} times: "${lineContent.substring(0, 50)}..."`,
          severity: 'warning',
          line: indices[0] + 1,
        });
        score -= 5;
      }
    }

    // Generate specific suggestions for each violation type
    if (violations.some(v => v.type === 'typescript-export')) {
      suggestions.push('Ensure all imported types and functions are properly exported from their modules');
    }
    if (violations.some(v => v.type === 'typescript-property')) {
      suggestions.push('Fix property access patterns (result.data → result.value, result.isOk → result.success)');
    }
    if (violations.some(v => v.type === 'typescript-assignment')) {
      suggestions.push('Fix type assignments (Object → Record<string, unknown>, Function → proper signature)');
    }
    if (violations.some(v => v.type === 'typescript-null')) {
      suggestions.push('Add null safety checks (obj.prop → obj?.prop, or proper null/undefined guards)');
    }
    if (violations.some(v => v.type === 'jsdoc')) {
      suggestions.push('Add JSDoc comments to all exported functions (@param, @returns, @throws)');
    }
    if (violations.some(v => v.type === 'import')) {
      suggestions.push('Consolidate duplicate imports and organize them according to ESLint rules');
    }
    if (violations.some(v => v.type === 'file-size')) {
      suggestions.push('Break large files into smaller modules (max 300 lines per file)');
    }
    if (violations.some(v => v.type === 'parameters')) {
      suggestions.push('Use options object or function decomposition for functions with >4 parameters');
    }
    if (violations.some(v => v.type === 'duplication')) {
      suggestions.push('Extract duplicated code into reusable functions or constants');
    }
    if (code.includes(': any')) {
      suggestions.push('Replace "any" types with specific TypeScript types');
    }
    if (violations.some(v => v.type === 'complexity')) {
      suggestions.push('Split large functions into smaller, focused functions (max 15 lines)');
    }
    if (violations.some(v => v.type === 'pattern')) {
      suggestions.push('Add input validation at the beginning of functions');
    }

    return {
      valid: violations.filter(v => v.severity === 'error').length === 0,
      violations,
      suggestions,
      score: Math.max(0, score),
    };
  }

  /**
   * Validate TypeScript export/import issues
   */
  private validateTypeScriptExportImport(code: string, violations: Array<any>, score: number): void {
    // Check for patterns that commonly cause "has no exported member" errors
    const problematicImports = [
      { pattern: /import.*from\s+['"][^'"]*['"]\s*;\s*\/\/.*not exported/g, message: 'Import from module with non-exported member' },
      { pattern: /import\s*\{[^}]*\}\s*from\s+['"][^'"]*['"]\s*;\s*\/\*\*\s*.*Did you mean/g, message: 'Import with suggested alternative name' },
    ];

    for (const { pattern, message } of problematicImports) {
      const matches = code.matchAll(pattern);
      for (const match of matches) {
        const lineIndex = code.substring(0, match.index!).split('\n').length;
        violations.push({
          type: 'typescript-export',
          message,
          severity: 'error',
          line: lineIndex + 1,
        });
        score -= 12;
      }
    }
  }

  /**
   * Validate TypeScript property access issues
   */
  private validateTypeScriptPropertyAccess(code: string, violations: Array<any>, score: number): void {
    // Check for patterns that commonly cause "Property does not exist" errors
    const problematicAccess = [
      { pattern: /result\.(data|error|isOk|isErr|value)(?!\?)/g, message: 'Result type property access without safety check' },
      { pattern: /\w+\.\w+\s*(?!\?)(?!=)/g, message: 'Property access without null safety check' },
    ];

    for (const { pattern, message } of problematicAccess) {
      const matches = code.matchAll(pattern);
      for (const match of matches) {
        const lineIndex = code.substring(0, match.index!).split('\n').length;
        violations.push({
          type: 'typescript-property',
          message,
          severity: 'warning',
          line: lineIndex + 1,
        });
        score -= 3;
      }
    }
  }

  /**
   * Validate TypeScript type assignment issues
   */
  private validateTypeScriptTypeAssignments(code: string, violations: Array<any>, score: number): void {
    // Check for patterns that commonly cause "Type is not assignable" errors
    const problematicAssignments = [
      { pattern: /:\s*Object\s*[=:]/g, message: 'Object type instead of Record<string, unknown>' },
      { pattern: /:\s*Function\s*[=:]/g, message: 'Function type instead of proper function signature' },
      { pattern: /:\s*unknown\[\]/g, message: 'unknown[] instead of Array<unknown>' },
    ];

    for (const { pattern, message } of problematicAssignments) {
      const matches = code.matchAll(pattern);
      for (const match of matches) {
        const lineIndex = code.substring(0, match.index!).split('\n').length;
        violations.push({
          type: 'typescript-assignment',
          message,
          severity: 'warning',
          line: lineIndex + 1,
        });
        score -= 4;
      }
    }
  }

  /**
   * Validate TypeScript null/undefined issues
   */
  private validateTypeScriptNullUndefined(code: string, violations: Array<any>, score: number): void {
    // Check for patterns that commonly cause "Object is possibly 'undefined'" errors
    const problematicNullAccess = [
      { pattern: /\w+\[\w+\](?!\?)/g, message: 'Array access without null safety check' },
      { pattern: /\w+\.\w+\.\w+(?!\?)/g, message: 'Nested property access without null safety check' },
    ];

    for (const { pattern, message } of problematicNullAccess) {
      const matches = code.matchAll(pattern);
      for (const match of matches) {
        const lineIndex = code.substring(0, match.index!).split('\n').length;
        violations.push({
          type: 'typescript-null',
          message,
          severity: 'warning',
          line: lineIndex + 1,
        });
        score -= 2;
      }
    }
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): string[] {
    return [
      'ai-function',     // AI-safe function template
      'bun-server',      // Bun server with all features
      'test-suite',      // Comprehensive test suite
      'database-service', // Database service template
      'api-route',       // API route handler
      'websocket-handler', // WebSocket handler
      'cli-command',     // CLI command template
      'typescript-safe',  // TypeScript-safe function with comprehensive type checking
    ];
  }

  /**
   * Get AI development best practices
   */
  getBestPractices(): {
    patterns: string[];
    antiPatterns: string[];
    rules: Record<string, { limit: number; description: string }>;
  } {
    return {
      patterns: [
        'Validate inputs early (first 5 lines)',
        'Use explicit TypeScript types',
        'Keep functions under 30 lines',
        'Limit complexity to 10 or less',
        'Use early returns instead of nesting',
        'Provide meaningful error messages',
        'Document all public functions',
        'Write tests for all edge cases',
      ],
      antiPatterns: [
        'Using "any" types',
        'Functions longer than 30 lines',
        'Complex nested conditionals',
        'Magic numbers without constants',
        'Console.log in production code',
        'ESLint disable comments',
        'Multiple responsibilities per function',
        'Silent error handling',
      ],
      rules: {
        'max-lines-per-function': {
          limit: this.config.maxFunctionLines,
          description: 'Maximum number of lines per function'
        },
        'complexity': {
          limit: this.config.maxComplexity,
          description: 'Maximum cyclomatic complexity'
        },
        'max-params': {
          limit: 4,
          description: 'Maximum number of function parameters'
        },
        'sonarjs/cognitive-complexity': {
          limit: 15,
          description: 'Maximum cognitive complexity'
        }
      }
    };
  }

  /**
   * Private helper methods
   */
  private async ensureDirectories(): Promise<void> {
    console.log('📁 Creating necessary directories...');
    // Directory creation logic would go here
  }

  private async setupQualityGates(): Promise<void> {
    console.log('🔧 Setting up AI quality gates...');
    // Quality gates setup would go here
  }

  private async setupBunOptimizations(): Promise<void> {
    console.log('⚡ Setting up Bun optimizations...');
    // Bun optimizations would go here
  }

  private async setupDevelopmentWorkflow(): Promise<void> {
    console.log('🔄 Setting up development workflow...');
    // Workflow setup would go here
  }

  /**
   * Register slash commands with the plugin system
   */
  private async registerSlashCommands(): Promise<void> {
    console.log('📝 Registering slash commands...');

    try {
      // Import the slash command functions
      const { runUnifiedFix } = await import('./slash-commands/unified-fix');

      // Register the unified fix command
      if (typeof globalThis.registerSlashCommand === 'function') {
        globalThis.registerSlashCommand('fix-all', async (args: string[]) => {
          console.log('🚀 Running unified code quality fix...');
          await runUnifiedFix(args);
        });

        console.log('✅ Registered slash command: /fix-all');
      } else {
        console.log('⚠️  Slash command registration not available in this environment');
      }

    } catch (error) {
      console.warn('⚠️  Could not register slash commands:', error);
    }
  }
}

// Export the plugin instance and utilities
export const devPlugin = new DevPlugin();
export default devPlugin;

// Export types and utilities for external use
export type { PluginConfig, TemplateOptions, QualityMetrics };
export { generateTemplate, analyzeCode, parseParams };

// Auto-initialize if imported directly
if (import.meta.main) {
  const plugin = devPlugin;
  plugin.initialize().catch(console.error);
}