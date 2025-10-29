/**
 * Automated Skill Testing System
 * Provides automated testing capabilities for skill definitions including
 * execution testing, compatibility validation, and performance assessment
 */

import { SkillRegistry } from './registry';
import { CapabilityTestHelper } from './testing-capability';
import {
  SkillTestResult,
  CompatibilityTestResult,
  PerformanceTestResult,
  CapabilityTestResult,
  TestEnvironment,
  TestOptions,
} from './testing-interfaces';
import { PerformanceTestHelper } from './testing-performance';
import { TestReportGenerator } from './testing-report';
import { SkillDefinition, AgentRole, SkillCapability } from './types';
import { SkillValidator } from './validation';

/**
 * Additional magic number constants for testing
 */
const ADDITIONAL_TEST_CONSTANTS = {
  /** Memory conversion constants */
  MEMORY_CONVERSION: {
    BYTES_PER_KB: 1024,
    KB_TO_MB_DIVISOR: 1024,
  },
  /** String manipulation constants */
  STRING_SLICE: {
    START_INDEX: 2,
  },
  /** Array access constant */
  ARRAY_ACCESS: {
    ZERO_INDEX: 0,
  },
  /** Random number generation constants */
  RANDOM_GENERATION: {
    RADIX_36: 36,
    RANDOM_ID_LENGTH: 9,
    BIT_MASK: 0xFFFFFF,
    MULTIPLIER: 9301,
    INCREMENT: 49297,
    MODULUS: 233280,
  },
} as const;

/**
 * Automated skill testing framework
 */
export class SkillTester {
  private validator: SkillValidator;
  private testResults: Map<string, SkillTestResult> = new Map();

  /**
   * Creates a new skill tester instance
   * @param {SkillValidator} validator - Optional skill validator instance
   * @param {SkillRegistry} _registry - Optional skill registry (currently unused)
   */
  constructor(validator?: SkillValidator, _registry?: SkillRegistry) {
    this.validator = validator || new SkillValidator();
  }

  /**
   * Run comprehensive tests on a skill
   * @param {SkillDefinition} skill - Skill definition to test
   * @param {TestOptions} options - Test execution options
   * @returns {Promise<SkillTestResult>} Complete test result
   */
  async testSkill(skill: SkillDefinition, options: TestOptions = {}): Promise<SkillTestResult> {
    const startTime = Date.now();
    const executionId = this.generateExecutionId();
    const testResult = this.initializeTestResult(skill, executionId);

    try {
      await this.executeTestPhases(skill, options, testResult);
    } catch (error) {
      this.handleTestError(error, testResult);
    }

    return this.finalizeTestResult(skill, testResult, startTime);
  }

  /**
   * Execute all test phases for a skill
   * @param {SkillDefinition} skill - Skill definition to test
   * @param {TestOptions} options - Test execution options
   * @param {SkillTestResult} testResult - Test result object to update
   * @returns {Promise<void>} Promise that resolves when all test phases are complete
   */
  private async executeTestPhases(
    skill: SkillDefinition,
    options: TestOptions,
    testResult: SkillTestResult
  ): Promise<void> {
    await this.runValidationTest(skill, options, testResult);
    await this.runCompatibilityTests(skill, options, testResult);
    await this.runPerformanceTest(skill, options, testResult);
    await this.runCapabilityTests(skill, options, testResult);
    testResult.recommendations.push(...this.generateRecommendations(testResult));
  }

  /**
   * Finalize test result with execution time and storage
   * @param {SkillDefinition} skill - Skill that was tested
   * @param {SkillTestResult} testResult - Test result to finalize
   * @param {number} startTime - Test start timestamp
   * @returns {SkillTestResult} Finalized test result
   */
  private finalizeTestResult(
    skill: SkillDefinition,
    testResult: SkillTestResult,
    startTime: number
  ): SkillTestResult {
    testResult.executionTime = Date.now() - startTime;
    this.testResults.set(skill.id, testResult);
    return testResult;
  }

  /**
   * Initialize test result with default values
   * @param {SkillDefinition} skill - Skill definition to test
   * @param {string} executionId - Unique execution identifier
   * @returns {SkillTestResult} Initialized test result object
   */
  private initializeTestResult(skill: SkillDefinition, executionId: string): SkillTestResult {
    return {
      skillId: skill.id,
      executedAt: new Date(),
      success: true,
      validation: { valid: true, errors: [], warnings: [], score: 100, validatedAt: new Date() },
      compatibility: [],
      performance: {
        expected: skill.performance,
        actual: { executionTime: 0, memoryUsage: 0, cpuUsage: 0 },
        withinExpected: true,
        score: 100,
        issues: [],
      },
      capabilities: [],
      executionTime: 0,
      environment: this.createTestEnvironment(executionId),
      errors: [],
      recommendations: [],
    };
  }

  /**
   * Run validation testing phase
   * @param {SkillDefinition} skill - Skill definition to test
   * @param {TestOptions} options - Test execution options
   * @param {SkillTestResult} testResult - Test result object to update
   * @returns {Promise<void>} Promise that resolves when validation test is complete
   */
  private async runValidationTest(
    skill: SkillDefinition,
    options: TestOptions,
    testResult: SkillTestResult
  ): Promise<void> {
    if (options.skipValidation === true) return;

    testResult.validation = this.validator.validate(skill);
    if (!testResult.validation.valid) {
      testResult.success = false;
      testResult.errors.push({
        type: 'validation',
        message: 'Skill validation failed',
        severity: 'critical',
        component: 'validation',
      });
    }
  }

  /**
   * Run compatibility testing phase
   * @param {SkillDefinition} skill - Skill definition to test
   * @param {TestOptions} options - Test execution options
   * @param {SkillTestResult} testResult - Test result object to update
   * @returns {Promise<void>} Promise that resolves when compatibility tests are complete
   */
  private async runCompatibilityTests(
    skill: SkillDefinition,
    options: TestOptions,
    testResult: SkillTestResult
  ): Promise<void> {
    if (options.skipCompatibility === true) return;

    const compatibleRoles = skill.compatibility.map(comp => comp.agentRole);
    for (const role of compatibleRoles) {
      const compatibilityResult = await this.testCompatibility(skill, role);
      testResult.compatibility.push(compatibilityResult);
      if (!compatibilityResult.success) {
        testResult.success = false;
      }
    }
  }

  /**
   * Run performance testing phase
   * @param {SkillDefinition} skill - Skill definition to test
   * @param {TestOptions} options - Test execution options
   * @param {SkillTestResult} testResult - Test result object to update
   * @returns {Promise<void>} Promise that resolves when performance test is complete
   */
  private async runPerformanceTest(
    skill: SkillDefinition,
    options: TestOptions,
    testResult: SkillTestResult
  ): Promise<void> {
    if (options.skipPerformance === true) return;

    testResult.performance = await this.testPerformance(skill);
    if (!testResult.performance.withinExpected) {
      testResult.recommendations.push('Performance metrics are outside expected ranges');
    }
  }

  /**
   * Run capability testing phase
   * @param {SkillDefinition} skill - Skill definition to test
   * @param {TestOptions} options - Test execution options
   * @param {SkillTestResult} testResult - Test result object to update
   * @returns {Promise<void>} Promise that resolves when capability tests are complete
   */
  private async runCapabilityTests(
    skill: SkillDefinition,
    options: TestOptions,
    testResult: SkillTestResult
  ): Promise<void> {
    if (options.skipCapabilities === true) return;

    for (const capability of skill.capabilities) {
      const capabilityResult = await this.testCapability(skill, capability);
      testResult.capabilities.push(capabilityResult);
      if (!capabilityResult.success && capabilityResult.issues.length > 0) {
        testResult.recommendations.push(
          `Capability '${capability.name}' has implementation issues`
        );
      }
    }
  }

  /**
   * Handle test execution errors with proper type checking
   * @param {unknown} error - Error that occurred during testing
   * @param {SkillTestResult} testResult - Test result object to update
   * @returns {void} Updates test result with error information
   */
  private handleTestError(error: unknown, testResult: SkillTestResult): void {
    testResult.success = false;

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    testResult.errors.push({
      type: 'system',
      message: `Test execution failed: ${errorMessage}`,
      stack: errorStack,
      severity: 'critical',
      component: 'test-execution',
    });
  }

  /**
   * Test multiple skills in batch
   * @param {SkillDefinition[]} skills - Array of skill definitions to test
   * @param {TestOptions} options - Test execution options
   * @returns {Promise<SkillTestResult[]>} Array of test results
   */
  async testSkillsBatch(
    skills: SkillDefinition[],
    options: TestOptions = {}
  ): Promise<SkillTestResult[]> {
    const results: SkillTestResult[] = [];

    // Run tests in parallel if enabled
    if (options.parallel === true) {
      const testPromises = skills.map(skill => this.testSkill(skill, options));
      const batchResults = await Promise.all(testPromises);
      results.push(...batchResults);
    } else {
      // Run sequentially
      for (const skill of skills) {
        const result = await this.testSkill(skill, options);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Get test result for a specific skill
   * @param {string} skillId - ID of skill to get results for
   * @returns {SkillTestResult | null} Test result or null if not found
   */
  getTestResult(skillId: string): SkillTestResult | null {
    return this.testResults.get(skillId) || null;
  }

  /**
   * Get all test results
   * @returns {SkillTestResult[]} Array of all test results
   */
  getAllTestResults(): SkillTestResult[] {
    return Array.from(this.testResults.values());
  }

  /**
   * Clear test results
   * @returns {void} Clears all stored test results
   */
  clearResults(): void {
    this.testResults.clear();
  }

  /**
   * Generate test report
   * @param {string} [skillId] - ID of skill to generate report for (optional)
   * @returns {string} Formatted test report
   */
  generateReport(skillId?: string): string {
    const reportGenerator = new TestReportGenerator();
    return reportGenerator.generateReport(
      skillId,
      this.getAllTestResults(),
      this.getTestResult.bind(this)
    );
  }

  /**
   * Test skill compatibility with agent role
   * @param {SkillDefinition} skill - Skill definition to test
   * @param {AgentRole} agentRole - Agent role to test compatibility with
   * @returns {Promise<CompatibilityTestResult>} Compatibility test result
   */
  private async testCompatibility(
    skill: SkillDefinition,
    agentRole: AgentRole
  ): Promise<CompatibilityTestResult> {
    const startTime = Date.now();
    const compatibility = skill.compatibility.find(comp => comp.agentRole === agentRole);

    if (!compatibility) {
      return {
        agentRole,
        compatibilityLevel: 'none',
        success: false,
        issues: [`No compatibility defined for ${agentRole}`],
        executionTime: Date.now() - startTime,
      };
    }

    const issues: string[] = [];

    // Check compatibility level requirements
    if (compatibility.level === 'limited') {
      issues.push('Limited compatibility - functionality may be restricted');
    }

    // Check restrictions
    if (compatibility.restrictions && compatibility.restrictions.length > 0) {
      issues.push(`Has ${compatibility.restrictions.length} restrictions for ${agentRole}`);
    }

    return {
      agentRole,
      compatibilityLevel: compatibility.level,
      success: issues.length === 0,
      issues,
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Test skill performance characteristics
   * @param {SkillDefinition} skill - Skill definition to test
   * @returns {Promise<PerformanceTestResult>} Performance test result
   */
  private async testPerformance(skill: SkillDefinition): Promise<PerformanceTestResult> {
    const performanceHelper = new PerformanceTestHelper();
    return performanceHelper.testPerformance(skill);
  }

  /**
   * Test individual capability
   * @param {SkillDefinition} skill - Skill definition containing the capability
   * @param {SkillCapability} capability - Capability to test
   * @returns {Promise<CapabilityTestResult>} Capability test result
   */
  private async testCapability(
    skill: SkillDefinition,
    capability: SkillCapability
  ): Promise<CapabilityTestResult> {
    const capabilityHelper = new CapabilityTestHelper();
    return capabilityHelper.testCapability(skill, capability);
  }

  /**
   * Create test environment information
   * @param {string} executionId - Unique execution identifier for the test
   * @returns {TestEnvironment} Test environment information
   */
  private createTestEnvironment(executionId: string): TestEnvironment {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      availableMemory: Math.round(
        process.memoryUsage().heapTotal /
          ADDITIONAL_TEST_CONSTANTS.MEMORY_CONVERSION.BYTES_PER_KB /
          ADDITIONAL_TEST_CONSTANTS.MEMORY_CONVERSION.KB_TO_MB_DIVISOR
      ),
      frameworkVersion: '1.0.0',
      executionId,
    };
  }

  /**
   * Generate unique execution ID
   * @returns {string} Unique execution identifier
   */
  private generateExecutionId(): string {
    const timestamp = Date.now();
    const randomComponent = this.seededRandom()
      .toString(ADDITIONAL_TEST_CONSTANTS.RANDOM_GENERATION.RADIX_36)
      .slice(
        ADDITIONAL_TEST_CONSTANTS.STRING_SLICE.START_INDEX,
        ADDITIONAL_TEST_CONSTANTS.STRING_SLICE.START_INDEX +
          ADDITIONAL_TEST_CONSTANTS.RANDOM_GENERATION.RANDOM_ID_LENGTH
      );
    const nanoseconds = process.hrtime.bigint();
    return `test_${timestamp}_${randomComponent}_${nanoseconds}`;
  }

  /**
   * Generate test recommendations based on results
   * @param {SkillTestResult} result - Test result to analyze
   * @returns {string[]} Array of recommendations
   */
  private generateRecommendations(result: SkillTestResult): string[] {
    const recommendations: string[] = [];

    // Validation recommendations
    if (!result.validation.valid) {
      recommendations.push('Fix validation errors before skill deployment');
    }

    if (result.validation.warnings.length > 0) {
      recommendations.push('Address validation warnings for better quality');
    }

    // Performance recommendations
    if (!result.performance.withinExpected) {
      recommendations.push('Optimize skill performance to meet expected ranges');
    }

    // Capability recommendations
    const failedCapabilities = result.capabilities.filter(cap => !cap.success);
    if (failedCapabilities.length > 0) {
      recommendations.push(`${failedCapabilities.length} capabilities need attention`);
    }

    // Documentation recommendations
    if (result.skillId && !result.skillId.includes('-')) {
      recommendations.push('Use hyphenated naming convention for skill IDs');
    }

    return recommendations;
  }

  /**
   * Seeded random number generator for consistent testing
   * @returns {number} Random number between 0 and 1
   */
  private seededRandom(): number {
    // Use a simple seed based on current time for consistency in tests
    const seed = Date.now() & ADDITIONAL_TEST_CONSTANTS.RANDOM_GENERATION.BIT_MASK;
    return (
      ((seed * ADDITIONAL_TEST_CONSTANTS.RANDOM_GENERATION.MULTIPLIER +
        ADDITIONAL_TEST_CONSTANTS.RANDOM_GENERATION.INCREMENT) %
        ADDITIONAL_TEST_CONSTANTS.RANDOM_GENERATION.MODULUS) /
      ADDITIONAL_TEST_CONSTANTS.RANDOM_GENERATION.MODULUS
    );
  }
}

/**
 * Default tester instance
 */
export const defaultSkillTester = new SkillTester();

/**
 * Quick test function using default tester
 * @param {SkillDefinition} skill - Skill definition to test
 * @param {TestOptions} [options] - Test options
 * @returns {Promise<SkillTestResult>} Test result
 */
export async function testSkill(
  skill: SkillDefinition,
  options?: TestOptions
): Promise<SkillTestResult> {
  return defaultSkillTester.testSkill(skill, options);
}
