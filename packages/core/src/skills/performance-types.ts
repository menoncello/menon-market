/**
 * Performance-related type definitions for skill monitoring and analysis
 */

import {
  PerformanceTrend,
  PerformanceHealth,
  SkillComplexity,
  NetworkUsageLevel,
} from './skill-types';

/**
 * Execution result from skill performance testing
 */
export interface ExecutionResult {
  /** Whether the execution was successful */
  success: boolean;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Memory usage in bytes */
  memoryUsage: number;
  /** Any error that occurred */
  error?: string;
}

/**
 * Historical performance data point
 */
export interface HistoricalData {
  /** Average execution time for this period */
  avgExecutionTime: number;
  /** Success rate for this period */
  successRate: number;
  /** Number of executions in this period */
  executionCount: number;
  /** Timestamp of this data point */
  timestamp: Date;
}

/**
 * Performance data analysis results
 */
export interface PerformanceData {
  /** Average execution time */
  avgExecutionTime: number;
  /** Success rate (0-1) */
  successRate: number;
  /** Memory usage in bytes */
  memoryUsage: number;
  /** Error rate (0-1) */
  errorRate: number;
  /** Cache hit rate (0-1) */
  cacheHitRate: number;
}

/**
 * Trend analysis results
 */
export interface TrendsResult {
  /** Trend for execution time */
  executionTimeTrend: PerformanceTrend;
  /** Trend for success rate */
  successRateTrend: PerformanceTrend;
  /** Overall performance health */
  overallHealth: PerformanceHealth;
}

/**
 * Complexity levels for performance characteristics
 */
export type PerformanceComplexityLevel = 'low' | 'medium' | 'high';

/**
 * Performance characteristics for capabilities
 */
export interface CapabilityPerformance {
  /** Complexity level */
  complexity: PerformanceComplexityLevel;
  /** Resource usage level */
  resourceUsage: PerformanceComplexityLevel;
}

/**
 * Skill performance characteristics
 */
export interface SkillPerformance {
  /** Estimated execution time range (in minutes) */
  executionTime: {
    min: number;
    max: number;
    average: number;
  };

  /** Resource usage requirements */
  resourceUsage: {
    memory: 'low' | 'medium' | 'high';
    cpu: 'low' | 'medium' | 'high';
    network: NetworkUsageLevel;
  };

  /** Complexity rating */
  complexity: SkillComplexity;

  /** Success rate based on historical data */
  successRate?: number;

  /** Common failure modes or issues */
  knownIssues?: string[];

  /** Resource usage details (numeric) */
  numericResourceUsage?: {
    memory: number;
    cpu: number;
    network: number;
  };
}
