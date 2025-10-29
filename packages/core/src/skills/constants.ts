/**
 * Constants for performance validation and testing
 */

import { COMMON_CONSTANTS } from './common-constants';

// Re-export COMMON_CONSTANTS for external use
export { COMMON_CONSTANTS };

/** Multiplier for high execution time threshold */
const HIGH_EXECUTION_MULTIPLIER = 2;

/**
 * Multiplier constants for performance calculations
 */
export const PERFORMANCE_MULTIPLIERS = {
  HIGH_EXECUTION_MULTIPLIER,
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  EXECUTION_TIME_HIGH:
    COMMON_CONSTANTS.TIME_CONSTANTS.SECOND_IN_MS *
    PERFORMANCE_MULTIPLIERS.HIGH_EXECUTION_MULTIPLIER, // 2 seconds in milliseconds
  EXECUTION_TIME_WARNING: COMMON_CONSTANTS.TIME_CONSTANTS.SECOND_IN_MS, // 1 second in milliseconds
  SUCCESS_RATE_GOOD: COMMON_CONSTANTS.SUCCESS_RATE_THRESHOLDS.EXCELLENT, // 90%
  SUCCESS_RATE_WARNING: COMMON_CONSTANTS.SUCCESS_RATE_THRESHOLDS.GOOD, // 80%
  MEMORY_USAGE_HIGH:
    COMMON_CONSTANTS.RESOURCE_LIMITS.HIGH_MEMORY_MB * COMMON_CONSTANTS.BYTES_PER_MB, // 100MB in bytes
  MEMORY_USAGE_WARNING:
    COMMON_CONSTANTS.RESOURCE_LIMITS.WARNING_MEMORY_MB * COMMON_CONSTANTS.BYTES_PER_MB, // 50MB in bytes
} as const;

/** High increase threshold (5% increase) */
const INCREASE_HIGH = 1.05;

/** High decrease threshold (5% decrease) */
const DECREASE_HIGH = 0.95;

/** Success increase threshold (2% increase) */
const SUCCESS_INCREASE = 1.02;

/** Success decrease threshold (2% decrease) */
const SUCCESS_DECREASE = 0.98;

/** Minimum data points for trend analysis */
const MIN_DATA_POINTS_TREND = 2;

// Trend analysis thresholds
export const TREND_THRESHOLDS = {
  INCREASE_HIGH,
  DECREASE_HIGH,
  SUCCESS_INCREASE,
  SUCCESS_DECREASE,
  MIN_DATA_POINTS: MIN_DATA_POINTS_TREND,
} as const;

// Testing limits
export const TESTING_LIMITS = {
  MAX_EXECUTION_TIME:
    COMMON_CONSTANTS.TEST_CONSTANTS.MAX_EXECUTION_TIME_MINUTES *
    COMMON_CONSTANTS.TIME_CONSTANTS.MINUTE_IN_MS, // 5 seconds
  TEST_ITERATIONS: COMMON_CONSTANTS.TEST_CONSTANTS.TEST_ITERATIONS,
  CAPABILITY_TIMEOUT:
    COMMON_CONSTANTS.TEST_CONSTANTS.CAPABILITY_TIMEOUT_SECONDS *
    COMMON_CONSTANTS.TIME_CONSTANTS.SECOND_IN_MS, // 1 second
  PERFORMANCE_ITERATIONS: COMMON_CONSTANTS.TEST_CONSTANTS.PERFORMANCE_ITERATIONS,
  CAPABILITY_ITERATIONS: COMMON_CONSTANTS.TEST_CONSTANTS.CAPABILITY_ITERATIONS,
  SAMPLE_DATA_SIZE: COMMON_CONSTANTS.TEST_CONSTANTS.SAMPLE_SIZE_KB * COMMON_CONSTANTS.BYTES_PER_KB, // 1KB
  SAMPLE_DATA_LARGE:
    COMMON_CONSTANTS.TEST_CONSTANTS.SAMPLE_LARGE_SIZE_KB * COMMON_CONSTANTS.BYTES_PER_KB, // 10KB
} as const;

/** Score multiplier for validation calculations */
const SCORE_MULTIPLIER = 2;

/** Minimum score threshold */
const MIN_SCORE = 1;

// Validation thresholds
export const VALIDATION_THRESHOLDS = {
  MAX_FIELD_LENGTH: COMMON_CONSTANTS.RESOURCE_LIMITS.MAX_FIELD_LENGTH,
  MAX_SKILL_COUNT: COMMON_CONSTANTS.RESOURCE_LIMITS.MAX_SKILL_COUNT,
  SCORE_MULTIPLIER,
  MIN_SCORE,
} as const;

// Random generation ranges
export const RANDOM_RANGES = COMMON_CONSTANTS.RANDOM_RANGES;

// File size constants
export const FILE_SIZES = {
  KB: COMMON_CONSTANTS.BYTES_PER_KB,
  MB: COMMON_CONSTANTS.BYTES_PER_MB,
} as const;

/** Maximum cache size */
const CACHE_MAX_SIZE = 1000;

// Cache configuration
export const CACHE_CONFIG = {
  TTL: COMMON_CONSTANTS.TIME_CONSTANTS.CACHE_TTL_MS, // 5 minutes in milliseconds
  MAX_SIZE: CACHE_MAX_SIZE,
} as const;

/** Minimum execution time in milliseconds */
const EXECUTION_TIME_MIN_MS = 50;

/** Maximum execution time in milliseconds */
const EXECUTION_TIME_MAX_MS = 150;

/** Average execution time in milliseconds */
const EXECUTION_TIME_AVERAGE_MS = 100;

/** Memory usage in bytes */
const MEMORY_USAGE_BYTES = 1024;

/** CPU usage percentage */
const CPU_USAGE_PERCENTAGE = 50;

// Skill execution performance constants
export const SKILL_EXECUTION_PERFORMANCE = {
  EXECUTION_TIME: {
    MIN_MS: EXECUTION_TIME_MIN_MS,
    MAX_MS: EXECUTION_TIME_MAX_MS,
    AVERAGE_MS: EXECUTION_TIME_AVERAGE_MS,
  },
  RESOURCE_USAGE: {
    MEMORY_BYTES: MEMORY_USAGE_BYTES,
    CPU_PERCENTAGE: CPU_USAGE_PERCENTAGE,
  },
} as const;
