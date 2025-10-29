/**
 * Performance testing helper class
 * Provides functionality to test skill performance characteristics
 */

import { COMMON_CONSTANTS } from './constants';
import { PerformanceTestResult } from './testing-interfaces';
import { SkillDefinition } from './types';

/**
 * Performance testing constants
 */
const PERFORMANCE_TEST_CONSTANTS = {
  /** Performance testing thresholds */
  PERFORMANCE: {
    HIGH_MEMORY_USAGE_MB: COMMON_CONSTANTS.RESOURCE_LIMITS.HIGH_MEMORY_MB,
    PERFORMANCE_PENALTY_HIGH: 30,
    PERFORMANCE_PENALTY_PER_ISSUE: 10,
    MIN_PERFORMANCE_SCORE: 0,
  },
  /** Simulation delays for complexity levels */
  COMPLEXITY_DELAYS: {
    simple: 100,
    moderate: 500,
    complex: 1000,
    expert: 2000,
  },
  /** Memory factors for resource usage simulation */
  MEMORY_FACTORS: {
    low: 1,
    medium: 5,
    high: 10,
  },
  /** Random number generation constants */
  RANDOM: {
    BIT_MASK: 0xFFFFFF,
    MULTIPLIER: 9301,
    INCREMENT: 49297,
    MODULUS: 233280,
  },
  /** Dummy data simulation */
  SIMULATION: {
    DUMMY_DATA_MULTIPLIER: 1000,
  },
} as const;

/**
 * Performance testing helper class
 */
export class PerformanceTestHelper {
  /**
   * Test skill performance characteristics
   * @param {SkillDefinition} skill - Skill definition to test
   * @returns {Promise<PerformanceTestResult>} Performance test result
   */
  async testPerformance(skill: SkillDefinition): Promise<PerformanceTestResult> {
    const { startTime, memoryBefore } = this.capturePerformanceMetrics();
    await this.simulateSkillExecution(skill);
    const { executionTime, memoryUsage } = this.calculatePerformanceMetrics(
      startTime,
      memoryBefore
    );

    const actual = this.createActualPerformanceResult(executionTime, memoryUsage);
    const expected = skill.performance.executionTime;
    const withinExpected = this.isPerformanceWithinExpected(actual.executionTime, expected);
    const issues = this.identifyPerformanceIssues(actual, expected);
    const score = this.calculatePerformanceScore(withinExpected, issues.length);

    return {
      expected: skill.performance,
      actual,
      withinExpected,
      score,
      issues,
    };
  }

  /**
   * Capture initial performance metrics
   * @returns {{startTime: number; memoryBefore: NodeJS.MemoryUsage}} Initial metrics timestamp and memory usage
   */
  private capturePerformanceMetrics(): { startTime: number; memoryBefore: NodeJS.MemoryUsage } {
    return {
      startTime: Date.now(),
      memoryBefore: process.memoryUsage(),
    };
  }

  /**
   * Calculate performance metrics from captured data
   * @param {number} startTime - Start timestamp
   * @param {NodeJS.MemoryUsage} memoryBefore - Initial memory usage
   * @returns {{executionTime: number; memoryUsage: number}} Calculated execution time and memory usage
   */
  private calculatePerformanceMetrics(
    startTime: number,
    memoryBefore: NodeJS.MemoryUsage
  ): { executionTime: number; memoryUsage: number } {
    const endTime = Date.now();
    const memoryAfter = process.memoryUsage();

    const executionTimeMs = endTime - startTime;
    const memoryUsageMB = Math.round(
      (memoryAfter.heapUsed - memoryBefore.heapUsed) / COMMON_CONSTANTS.BYTES_PER_MB
    );

    return {
      executionTime: Math.round(executionTimeMs / COMMON_CONSTANTS.TIME_CONSTANTS.SECOND_IN_MS),
      memoryUsage: memoryUsageMB,
    };
  }

  /**
   * Create actual performance result object
   * @param {number} executionTime - Measured execution time in seconds
   * @param {number} memoryUsage - Measured memory usage in MB
   * @returns {{executionTime: number; memoryUsage: number; cpuUsage: number}} Actual performance result
   */
  private createActualPerformanceResult(
    executionTime: number,
    memoryUsage: number
  ): { executionTime: number; memoryUsage: number; cpuUsage: number } {
    return {
      executionTime,
      memoryUsage,
      cpuUsage: 0, // Would need more complex monitoring
    };
  }

  /**
   * Check if performance is within expected range
   * @param {number} actualExecutionTime - Measured execution time
   * @param {{min: number; max: number}} expected - Expected performance range object
   * @param {number} expected.min - Minimum expected execution time
   * @param {number} expected.max - Maximum expected execution time
   * @returns {boolean} Whether performance is within expected range
   */
  private isPerformanceWithinExpected(
    actualExecutionTime: number,
    expected: { min: number; max: number }
  ): boolean {
    return actualExecutionTime >= expected.min && actualExecutionTime <= expected.max;
  }

  /**
   * Identify performance issues
   * @param {{executionTime: number; memoryUsage: number}} actualMetrics - Actual performance metrics object
   * @param {number} actualMetrics.executionTime - Actual execution time
   * @param {number} actualMetrics.memoryUsage - Actual memory usage
   * @param {{min: number; max: number}} expectedRange - Expected performance range object
   * @param {number} expectedRange.min - Minimum expected execution time
   * @param {number} expectedRange.max - Maximum expected execution time
   * @returns {string[]} Array of performance issues
   */
  private identifyPerformanceIssues(
    actualMetrics: { executionTime: number; memoryUsage: number },
    expectedRange: { min: number; max: number }
  ): string[] {
    const issues: string[] = [];

    if (actualMetrics.executionTime < expectedRange.min) {
      issues.push(
        `Execution time (${actualMetrics.executionTime}s) is faster than expected minimum (${expectedRange.min}s)`
      );
    }

    if (actualMetrics.executionTime > expectedRange.max) {
      issues.push(
        `Execution time (${actualMetrics.executionTime}s) exceeds expected maximum (${expectedRange.max}s)`
      );
    }

    if (actualMetrics.memoryUsage > PERFORMANCE_TEST_CONSTANTS.PERFORMANCE.HIGH_MEMORY_USAGE_MB) {
      issues.push(`High memory usage: ${actualMetrics.memoryUsage}MB`);
    }

    return issues;
  }

  /**
   * Calculate performance score based on results
   * @param {boolean} withinExpected - Whether performance is within expected range
   * @param {number} issueCount - Number of issues found
   * @returns {number} Performance score (0-100)
   */
  private calculatePerformanceScore(withinExpected: boolean, issueCount: number): number {
    let score = COMMON_CONSTANTS.SCORE_VALUES.MAX_SCORE;

    if (!withinExpected) {
      score -= PERFORMANCE_TEST_CONSTANTS.PERFORMANCE.PERFORMANCE_PENALTY_HIGH;
    }

    if (issueCount > 0) {
      score -= issueCount * PERFORMANCE_TEST_CONSTANTS.PERFORMANCE.PERFORMANCE_PENALTY_PER_ISSUE;
    }

    return Math.max(PERFORMANCE_TEST_CONSTANTS.PERFORMANCE.MIN_PERFORMANCE_SCORE, score);
  }

  /**
   * Simulate skill execution for performance testing
   * @param {SkillDefinition} skill - Skill definition to simulate execution for
   * @returns {Promise<void>} Promise that resolves when simulation is complete
   */
  private async simulateSkillExecution(skill: SkillDefinition): Promise<void> {
    await this.simulateWorkDelay(skill);
    this.simulateMemoryUsage(skill);
  }

  /**
   * Simulate work delay based on skill complexity
   * @param {SkillDefinition} skill - Skill definition
   * @returns {Promise<void>} Promise that resolves after simulated delay
   */
  private async simulateWorkDelay(skill: SkillDefinition): Promise<void> {
    const delay =
      PERFORMANCE_TEST_CONSTANTS.COMPLEXITY_DELAYS[skill.performance.complexity] ??
      PERFORMANCE_TEST_CONSTANTS.COMPLEXITY_DELAYS.moderate;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Simulate memory usage based on resource requirements
   * @param {SkillDefinition} skill - Skill definition
   * @returns {void} Simulates memory usage by creating dummy data
   */
  private simulateMemoryUsage(skill: SkillDefinition): void {
    const factor =
      PERFORMANCE_TEST_CONSTANTS.MEMORY_FACTORS[skill.performance.resourceUsage.memory] ??
      PERFORMANCE_TEST_CONSTANTS.MEMORY_FACTORS.low;
    const dummyData = this.generateDummyData(factor);
    // Access array to prevent optimization
    dummyData.toString(); // Access the array to prevent optimization
  }

  /**
   * Generate dummy data for memory simulation
   * @param {number} factor - Memory factor multiplier
   * @returns {number[]} Array of dummy data
   */
  private generateDummyData(factor: number): number[] {
    const size = factor * PERFORMANCE_TEST_CONSTANTS.SIMULATION.DUMMY_DATA_MULTIPLIER;
    return Array.from({ length: size }, () => this.seededRandom());
  }

  /**
   * Seeded random number generator for consistent testing
   * @returns {number} Random number between 0 and 1
   */
  private seededRandom(): number {
    // Use a simple seed based on current time for consistency in tests
    const seed = Date.now() & PERFORMANCE_TEST_CONSTANTS.RANDOM.BIT_MASK;
    return (
      ((seed * PERFORMANCE_TEST_CONSTANTS.RANDOM.MULTIPLIER +
        PERFORMANCE_TEST_CONSTANTS.RANDOM.INCREMENT) %
        PERFORMANCE_TEST_CONSTANTS.RANDOM.MODULUS) /
      PERFORMANCE_TEST_CONSTANTS.RANDOM.MODULUS
    );
  }
}
