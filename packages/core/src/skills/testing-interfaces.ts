/**
 * Testing system interfaces and types
 * Provides interfaces for the automated skill testing framework
 */

import { SkillPerformance } from './performance-types';
import { AgentRole } from './types';
import { ValidationError, ValidationWarning } from './validation-types';

/**
 * Test execution result
 */
export interface SkillTestResult {
  /** Skill identifier */
  skillId: string;

  /** Test timestamp */
  executedAt: Date;

  /** Overall test success */
  success: boolean;

  /** Validation results */
  validation: {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    score: number;
    validatedAt: Date;
  };

  /** Compatibility test results */
  compatibility: CompatibilityTestResult[];

  /** Performance test results */
  performance: PerformanceTestResult;

  /** Capability test results */
  capabilities: CapabilityTestResult[];

  /** Test execution time in milliseconds */
  executionTime: number;

  /** Test environment information */
  environment: TestEnvironment;

  /** Any errors encountered during testing */
  errors: TestError[];

  /** Test recommendations */
  recommendations: string[];
}

/**
 * Compatibility test result
 */
export interface CompatibilityTestResult {
  /** Agent role tested */
  agentRole: AgentRole;

  /** Compatibility level */
  compatibilityLevel: string;

  /** Test success */
  success: boolean;

  /** Issues found */
  issues: string[];

  /** Test execution time */
  executionTime: number;
}

/**
 * Performance test result
 */
export interface PerformanceTestResult {
  /** Expected performance from skill definition */
  expected: SkillPerformance;

  /** Actual measured performance */
  actual: {
    executionTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };

  /** Performance compliance */
  withinExpected: boolean;

  /** Performance score (0-100) */
  score: number;

  /** Performance issues */
  issues: string[];
}

/**
 * Capability test result
 */
export interface CapabilityTestResult {
  /** Capability identifier */
  capabilityId: string;

  /** Capability name */
  capabilityName: string;

  /** Test success */
  success: boolean;

  /** Test execution time */
  executionTime: number;

  /** Test results or output */
  result?: unknown;

  /** Issues encountered */
  issues: string[];
}

/**
 * Test environment information
 */
export interface TestEnvironment {
  /** Node.js version */
  nodeVersion: string;

  /** Platform information */
  platform: string;

  /** Available memory in MB */
  availableMemory: number;

  /** Test framework version */
  frameworkVersion: string;

  /** Test execution ID */
  executionId: string;
}

/**
 * Test error information
 */
export interface TestError {
  /** Error type */
  type: 'validation' | 'compatibility' | 'performance' | 'capability' | 'system';

  /** Error message */
  message: string;

  /** Error stack trace (if available) */
  stack?: string;

  /** Error severity */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /** Component where error occurred */
  component?: string;
}

/**
 * Test execution options
 */
export interface TestOptions {
  /** Skip validation testing */
  skipValidation?: boolean;

  /** Skip compatibility testing */
  skipCompatibility?: boolean;

  /** Skip performance testing */
  skipPerformance?: boolean;

  /** Skip capability testing */
  skipCapabilities?: boolean;

  /** Run tests in parallel */
  parallel?: boolean;

  /** Test timeout in milliseconds */
  timeout?: number;
}
