/**
 * Test Quality Analyzer - Simplified Version for Integration
 */

import { file } from "bun";
import { spawn } from "bun";

interface TestIssue {
  type: "useless-test" | "mock-loop" | "no-real-behavior" | "trivial-assertion" | "dead-code";
  severity: "error" | "warning" | "info";
  filePath: string;
  lineNumber: number;
  description: string;
  suggestion: string;
  code?: string;
}

interface ParsedTest {
  name: string;
  filePath: string;
  lineNumber: number;
  hasAssertions: boolean;
  hasMocks: boolean;
  hasVerifications: boolean;
  hasRealBehavior: boolean;
  assertions: string[];
  mockCalls: string[];
  complexity: number;
}

interface TestMetrics {
  totalTests: number;
  usefulTests: number;
  uselessTests: number;
  coverage: number;
  qualityScore: number;
}

/**
 * Simplified Test Quality Analyzer
 */
export class TestQualityAnalyzer {
  /**
   * Analyze a single test file for quality issues
   */
  async analyzeTestFile(filePath: string): Promise<TestIssue[]> {
    try {
      const content = await file(filePath).text();
      const lines = content.split("\n");
      const issues: TestIssue[] = [];

      lines.forEach((line, index) => {
        const lineNumber = index + 1;

        // Detect useless test patterns
        if (this.isUselessTest(line)) {
          issues.push({
            type: "useless-test",
            severity: "error",
            filePath,
            lineNumber,
            description: "Test appears to be testing trivial behavior",
            suggestion: "Add meaningful assertions that verify real behavior",
            code: line.trim(),
          });
        }

        // Detect mock loops
        if (this.isMockLoop(line)) {
          issues.push({
            type: "mock-loop",
            severity: "error",
            filePath,
            lineNumber,
            description: "Test may be mocking and verifying the same behavior",
            suggestion: "Test real behavior instead of mock internals",
            code: line.trim(),
          });
        }

        // Detect trivial assertions
        if (this.hasTrivialAssertion(line)) {
          issues.push({
            type: "trivial-assertion",
            severity: "warning",
            filePath,
            lineNumber,
            description: "Assertion only checks basic type or existence",
            suggestion: "Add more specific assertions that validate meaningful behavior",
            code: line.trim(),
          });
        }
      });

      return issues;
    } catch (error) {
      console.warn(`Could not analyze test file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Parse tests in a file to extract metadata
   */
  async parseTestsInFile(filePath: string): Promise<ParsedTest[]> {
    try {
      const content = await file(filePath).text();
      const lines = content.split("\n");
      const tests: ParsedTest[] = [];

      let currentTest: Partial<ParsedTest> | null = null;

      lines.forEach((line, index) => {
        // Find test definitions
        if (this.isTestDefinition(line)) {
          // Complete previous test if exists
          if (currentTest && Object.keys(currentTest).length > 0) {
            tests.push(currentTest as ParsedTest);
          }

          // Start new test
          const testName = this.extractTestName(line);
          currentTest = {
            name: testName || "unnamed",
            filePath,
            lineNumber: index + 1,
            hasAssertions: false,
            hasMocks: false,
            hasVerifications: false,
            hasRealBehavior: false,
            assertions: [],
            mockCalls: [],
            complexity: 0,
          };
        }

        if (currentTest) {
          // Analyze test content
          if (this.hasAssertion(line)) {
            currentTest.hasAssertions = true;
            currentTest.assertions.push(line.trim());
          }

          if (this.hasMock(line)) {
            currentTest.hasMocks = true;
          }

          if (this.hasVerification(line)) {
            currentTest.hasVerifications = true;
          }

          // Check for real behavior
          if (this.testsRealBehavior(line)) {
            currentTest.hasRealBehavior = true;
          }

          // Calculate complexity
          currentTest.complexity += this.calculateLineComplexity(line);
        }
      });

      // Add final test
      if (currentTest && Object.keys(currentTest).length > 0) {
        tests.push(currentTest as ParsedTest);
      }

      return tests;
    } catch (error) {
      console.warn(`Could not parse tests in ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Calculate overall test metrics
   */
  calculateMetrics(tests: ParsedTest[], testFiles: string[]): TestMetrics {
    const totalTests = tests.length;
    const usefulTests = tests.filter(
      test => test.hasAssertions && (test.hasRealBehavior || test.hasVerifications)
    ).length;
    const uselessTests = totalTests - usefulTests;

    // Estimate coverage (simplified)
    const coverage = Math.min(95, (usefulTests / Math.max(totalTests, 1)) * 100);

    // Calculate quality score (0-100)
    const qualityScore = Math.round(
      (usefulTests / Math.max(totalTests, 1)) * 60 + // 60% for useful tests
        Math.min(40, coverage * 0.4) // 40% for coverage
    );

    return {
      totalTests,
      usefulTests,
      uselessTests,
      coverage,
      qualityScore,
    };
  }

  /**
   * Check if line defines a test
   */
  private isTestDefinition(line: string): boolean {
    const patterns = [/test\s*\(\s*['"`]/, /it\s*\(\s*['"`]/, /describe\s*\(\s*['"`]/];

    return patterns.some(pattern => pattern.test(line));
  }

  /**
   * Extract test name from line
   */
  private extractTestName(line: string): string {
    const match = line.match(/['"`]([^'"`]+)['"`]/);
    return match ? match[1] : "unnamed";
  }

  /**
   * Check if line represents a useless test
   */
  private isUselessTest(line: string): boolean {
    const uselessPatterns = [
      /expect\s*\([^)]+\)\.toBe\s*\(\s*[^)]*\s*\)/,
      /expect\s*\([^)]+\)\.toBeTruthy\s*\(\s*\)/,
      /expect\s*\([^)]+\)\.toBeDefined\s*\(\s*\)/,
    ];

    return uselessPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Check if line indicates a mock loop
   */
  private isMockLoop(line: string): boolean {
    return (
      /mock.*toHaveBeenCalled.*toHaveBeenCalled/.test(line) ||
      (line.includes("vi.mock") && line.includes("toHaveBeenCalled"))
    );
  }

  /**
   * Check if line has trivial assertions
   */
  private hasTrivialAssertion(line: string): boolean {
    const trivialPatterns = [/expect\s*\([^)]+\)\.toBe\s*\(\s*(undefined|null|true|false)\s*\)/];

    return trivialPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Check if line contains assertions
   */
  private hasAssertion(line: string): boolean {
    return /expect\s*\(/.test(line) || /assert\./.test(line) || /should\./.test(line);
  }

  /**
   * Check if line contains mocks
   */
  private hasMock(line: string): boolean {
    return /mock\s*\(/.test(line) || /jest\.mock/.test(line) || /vi\.mock/.test(line);
  }

  /**
   * Check if line contains verifications
   */
  private hasVerification(line: string): boolean {
    return /toHaveBeenCalled/.test(line) || /toHaveBeenCalledTimes/.test(line);
  }

  /**
   * Check if line tests real behavior
   */
  private testsRealBehavior(line: string): boolean {
    const realBehaviorPatterns = [
      /expect\s*\([^)]+\.(result|output|response|data|value)/,
      /expect\s*\([^)]+\.(state|status|count|length)/,
      /expect\s*\([^)]*\).toThrow/,
    ];

    return realBehaviorPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Calculate line complexity
   */
  private calculateLineComplexity(line: string): number {
    let complexity = 0;

    complexity += (line.match(/if|for|while|switch|try|catch/g) || []).length;
    complexity += (line.match(/&&|\|\|/g) || []).length * 0.5;
    complexity += (line.match(/\?[^:]*:/g) || []).length;

    return complexity;
  }
}

/**
 * Standalone test quality analysis function
 */
export async function analyzeTestQuality(basePath = process.cwd()): Promise<void> {
  console.log("🧪 Starting Test Quality Analysis...\n");

  try {
    const analyzer = new TestQualityAnalyzer();

    // Find test files
    const findCmd = `find "${basePath}" -name "*.test.*" -o -name "*.spec.*" -o -path "*/__tests__/*" | grep -E "\\.(ts|js|tsx|jsx)$" | grep -v -E "(node_modules|dist|coverage)"`;

    const proc = spawn({
      cmd: ["/bin/bash", "-c", findCmd],
      stdout: "pipe",
      stderr: "pipe",
    });

    const output = await new Response(proc.stdout).text();
    const testFiles = output
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (testFiles.length === 0) {
      console.log("✅ No test files found!");
      return;
    }

    console.log(`📁 Found ${testFiles.length} test files`);

    let totalIssues = 0;
    let totalTests = 0;
    let totalUseful = 0;

    for (const filePath of testFiles) {
      const issues = await analyzer.analyzeTestFile(filePath);
      const tests = await analyzer.parseTestsInFile(filePath);
      const metrics = analyzer.calculateMetrics(tests, [filePath]);

      totalIssues += issues.length;
      totalTests += metrics.totalTests;
      totalUseful += metrics.usefulTests;

      if (issues.length > 0 || metrics.qualityScore < 70) {
        console.log(`\n📄 ${filePath}:`);
        console.log(`   Tests: ${metrics.totalTests}, Quality: ${metrics.qualityScore}/100`);
        if (issues.length > 0) {
          console.log(`   Issues: ${issues.length}`);
        }
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   Total test files: ${testFiles.length}`);
    console.log(`   Total tests: ${totalTests}`);
    console.log(
      `   Useful tests: ${totalUseful} (${Math.round((totalUseful / totalTests) * 100)}%)`
    );
    console.log(`   Quality issues: ${totalIssues}`);

    if (totalIssues > 0) {
      console.log("\n💡 Consider fixing test quality issues to improve reliability.");
    }
  } catch (error) {
    console.error("💥 Test quality analysis failed:", error);
    process.exit(1);
  }
}
