/**
 * Skill Loading Constants
 * Shared constants used across skill loading implementations
 */

/** Error message constant */
export const UNKNOWN_ERROR_MESSAGE = 'Unknown error';

/** Skill domain constant */
export const CROSS_CUTTING_DOMAIN = 'cross-cutting' as const;

/** Default version for skills */
export const DEFAULT_VERSION = '1.0.0';

/** Default execution time performance metrics */
export const DEFAULT_EXECUTION_TIME = { min: 1, max: 5, average: 2 };

/** Default resource usage */
export const DEFAULT_RESOURCE_USAGE = { memory: 'low' as const, cpu: 'low' as const };

/** Default complexity level */
export const DEFAULT_COMPLEXITY = 'simple' as const;
