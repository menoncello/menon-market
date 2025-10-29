/**
 * Validation Constants and Utilities
 * Provides shared constants and utility functions for skill validation
 */

// Validation constants
export const VALIDATION_SCORE_MAX = 100;
export const PERFORMANCE_THRESHOLD_MS = 300;
export const DEPENDENCY_DEPTH_LIMIT = 2;

/**
 * Validate semantic version format
 * @param {string} version - Version string to validate
 * @returns {boolean} True if version follows semantic versioning pattern
 */
export function isValidVersion(version: string): boolean {
  const semverRegex = /^\d+\.\d+\.\d+(-[\d.A-Za-z\-]+)?(\+[\d.A-Za-z\-]+)?$/;
  return semverRegex.test(version);
}

/**
 * Validation category priorities for scoring and sorting
 */
export const VALIDATION_CATEGORY_PRIORITY = {
  schema: 1,
  dependencies: 2,
  compatibility: 3,
  performance: 4,
  security: 5,
  documentation: 6,
  testing: 7,
  quality: 8,
} as const;

/**
 * Default validation messages by category
 */
export const DEFAULT_VALIDATION_MESSAGES = {
  schema: {
    required: 'This field is required for skill schema validation',
    format: 'Invalid format for schema field',
  },
  dependencies: {
    missing: 'Required dependency is missing',
    circular: 'Circular dependency detected',
  },
  compatibility: {
    incompatible: 'Skill is not compatible with this agent type',
    restricted: 'Skill has restrictions for this agent type',
  },
  performance: {
    slow: 'Skill performance characteristics may impact user experience',
    resource: 'Resource usage is higher than expected',
  },
  documentation: {
    missing: 'Documentation is recommended for better usability',
    incomplete: 'Documentation is incomplete or unclear',
  },
} as const;
