/**
 * Common constants used across skills module
 */

/** Bytes per kilobyte */
const BYTES_PER_KB_VALUE = 1024;

/** Number of kilobytes in a megabyte */
const KB_IN_MB_VALUE = 1024;

/** Percent multiplier for calculations */
const PERCENT_MULTIPLIER_VALUE = 100;

/**
 * Base calculation constants
 */
export const BYTES_PER_KB = BYTES_PER_KB_VALUE;
export const KB_IN_MB = KB_IN_MB_VALUE; // Number of kilobytes in a megabyte
export const BYTES_PER_MB = BYTES_PER_KB * KB_IN_MB;
export const PERCENT_MULTIPLIER = PERCENT_MULTIPLIER_VALUE;

/**
 * Scoring and validation constants
 */
export const COMMON_CONSTANTS = {
  /** Base calculations */
  BYTES_PER_KB,
  KB_IN_MB,
  BYTES_PER_MB,
  PERCENT_MULTIPLIER,

  /** Performance thresholds */
  EXECUTION_TIME_MINUTES: {
    HIGH_WARNING: 60,
    HIGH_ERROR: 300,
    MODERATE_THRESHOLD: 10,
  },

  /** Success rate thresholds */
  SUCCESS_RATE_THRESHOLDS: {
    EXCELLENT: 0.9,
    GOOD: 0.8,
    ACCEPTABLE: 0.7,
    WARNING_THRESHOLD: 0.5,
  },

  /** Score values */
  SCORE_VALUES: {
    MAX_SCORE: 100,
    HIGH_PENALTY: 20,
    MODERATE_PENALTY: 10,
    LOW_PENALTY: 5,
  },

  /** Resource limits */
  RESOURCE_LIMITS: {
    MAX_FIELD_LENGTH: 100,
    MAX_SKILL_COUNT: 50,
    HIGH_MEMORY_MB: 100,
    WARNING_MEMORY_MB: 50,
  },

  /** Test constants */
  TEST_CONSTANTS: {
    MAX_EXECUTION_TIME_MINUTES: 5,
    TEST_ITERATIONS: 100,
    CAPABILITY_TIMEOUT_SECONDS: 1,
    PERFORMANCE_ITERATIONS: 30,
    CAPABILITY_ITERATIONS: 10,
    SAMPLE_SIZE_KB: 1,
    SAMPLE_LARGE_SIZE_KB: 10,
  },

  /** Time constants */
  TIME_CONSTANTS: {
    HOUR_IN_MS: 3600000,
    MINUTE_IN_MS: 60000,
    SECOND_IN_MS: 1000,
    CACHE_TTL_MS: 300000, // 5 minutes
  },

  /** Random generation ranges */
  RANDOM_RANGES: {
    CHAR_CODE_LOWER_A: 97,
    CHAR_CODE_LOWER_Z: 122,
    STRING_LENGTH_MIN: 5,
    STRING_LENGTH_MAX: 20,
    ARRAY_LENGTH_MIN: 1,
    ARRAY_LENGTH_MAX: 10,
    TIMEOUT_MIN_MS: 100,
    TIMEOUT_MAX_MS: 1000,
  },
} as const;
