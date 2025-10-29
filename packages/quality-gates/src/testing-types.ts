/**
 * Testing Framework Types and Constants
 * Shared types and constants used across the testing framework
 */

/** Constant for percentage calculation */
export const PERCENTAGE_MULTIPLIER = 100;

/** Common test messages */
export const TestMessages = {
  CUSTOM_AGENT_CREATED_SUCCESSFULLY: 'Custom agent created successfully',
  UNKNOWN_ERROR: 'Unknown error',
  PERFORMANCE_TARGET_MET: 'Performance target met',
  PERFORMANCE_TARGET_MISSED: 'Performance target missed',
  PERFORMANCE_TEST_FAILED: 'Performance test failed',
  EDGE_CASE_TEST_FAILED: 'Edge case test failed',
  INVALID_AGENT_INCORRECTLY_ACCEPTED: 'Invalid agent was incorrectly accepted',
  INVALID_AGENT_CORRECTLY_REJECTED: 'Invalid agent correctly rejected',
  INVALID_AGENT_CORRECTLY_REJECTED_WITH_EXCEPTION:
    'Invalid agent correctly rejected with exception',
} as const;

export interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  duration: number;
  passed: boolean;
  passRate: number;
}

export interface EdgeCaseTestResult {
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationReport {
  timestamp: Date;
  suites: TestSuite[];
  overallPassed: boolean;
  overallPassRate: number;
  totalDuration: number;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
  };
}
