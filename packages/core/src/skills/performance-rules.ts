import { PERFORMANCE_THRESHOLDS } from './performance-validator';
import { SkillDefinition, ValidationError } from './types';

/**
 * Performance validation rules implementation
 */

/**
 * Performance validation field constants
 */
const PERFORMANCE_FIELDS = {
  EXECUTION_TIME: 'performance.executionTime',
  RESOURCE_USAGE: 'performance.resourceUsage',
} as const;

/**
 * Maximum execution time threshold in minutes
 */
const MAX_EXECUTION_TIME_MINUTES = 300;

/**
 * Validates execution time range validity
 * @param {SkillDefinition} skill - The skill definition to validate
 * @param {ValidationError[]} issues - Array to collect validation issues
 */
function validateExecutionTimeRange(skill: SkillDefinition, issues: ValidationError[]): void {
  const executionTime = skill.performance?.executionTime;
  if (!executionTime) return;

  if (executionTime.min > executionTime.max) {
    issues.push({
      category: 'performance',
      field: PERFORMANCE_FIELDS.EXECUTION_TIME,
      message: 'Minimum execution time cannot be greater than maximum execution time',
      code: 'PERF_EXECUTION_TIME_INVALID_RANGE',
      severity: 'error',
    });
  }
}

/**
 * Validates execution time against thresholds
 * @param {SkillDefinition} skill - The skill definition to validate
 * @param {ValidationError[]} issues - Array to collect validation issues
 */
function validateExecutionTimeThresholds(skill: SkillDefinition, issues: ValidationError[]): void {
  const executionTime = skill.performance?.executionTime;
  if (!executionTime) return;

  const averageMinutes = executionTime.average;

  if (averageMinutes > PERFORMANCE_THRESHOLDS.EXECUTION_TIME.ERROR_MINUTES) {
    issues.push({
      category: 'performance',
      field: PERFORMANCE_FIELDS.EXECUTION_TIME,
      message: `Execution time estimate of ${averageMinutes} minutes exceeds maximum allowed time of ${PERFORMANCE_THRESHOLDS.EXECUTION_TIME.ERROR_MINUTES} minutes`,
      code: 'PERF_EXECUTION_TIME_EXCEEDED',
      severity: 'error',
    });
  } else if (averageMinutes > PERFORMANCE_THRESHOLDS.EXECUTION_TIME.WARNING_MINUTES) {
    issues.push({
      category: 'performance',
      field: PERFORMANCE_FIELDS.EXECUTION_TIME,
      message: `Execution time estimate of ${averageMinutes} minutes is longer than recommended ${PERFORMANCE_THRESHOLDS.EXECUTION_TIME.WARNING_MINUTES} minutes`,
      code: 'PERF_EXECUTION_TIME_WARNING',
      severity: 'warning',
    });
  }
}

/**
 * Validates maximum execution time length
 * @param {SkillDefinition} skill - The skill definition to validate
 * @param {ValidationError[]} issues - Array to collect validation issues
 */
function validateMaximumExecutionTime(skill: SkillDefinition, issues: ValidationError[]): void {
  const executionTime = skill.performance?.executionTime;
  if (!executionTime) return;

  if (executionTime.max > MAX_EXECUTION_TIME_MINUTES) {
    issues.push({
      category: 'performance',
      field: PERFORMANCE_FIELDS.EXECUTION_TIME,
      message: 'Maximum execution time is very long and may impact user experience',
      code: 'PERF_EXECUTION_TIME_TOO_LONG',
      severity: 'warning',
    });
  }
}

/**
 * Validates execution time expectations
 * @param {SkillDefinition} skill - The skill definition to validate
 * @param {ValidationError[]} issues - Array to collect validation issues
 */
export function validateExecutionTimeExpectations(
  skill: SkillDefinition,
  issues: ValidationError[]
): void {
  if (!skill.performance?.executionTime) {
    return;
  }

  validateExecutionTimeRange(skill, issues);
  validateExecutionTimeThresholds(skill, issues);
  validateMaximumExecutionTime(skill, issues);
}

/**
 * Validates resource usage patterns
 * @param {SkillDefinition} skill - The skill definition to validate
 * @param {ValidationError[]} issues - Array to collect validation issues
 */
export function validateResourceUsagePatterns(
  skill: SkillDefinition,
  issues: ValidationError[]
): void {
  if (!skill.performance?.resourceUsage) {
    return;
  }

  const highResourceCount = Object.entries(skill.performance.resourceUsage).filter(
    ([_, level]) => level === 'high'
  ).length;

  if (highResourceCount >= PERFORMANCE_THRESHOLDS.RESOURCE_USAGE.HIGH_COUNT_THRESHOLD) {
    issues.push({
      category: 'performance',
      field: PERFORMANCE_FIELDS.RESOURCE_USAGE,
      message: `Skill has ${highResourceCount} high resource requirements which may impact performance`,
      code: 'PERF_HIGH_RESOURCE_USAGE',
      severity: 'warning',
    });
  }

  // Check for high resource usage in multiple areas
  if (highResourceCount > 1) {
    issues.push({
      category: 'performance',
      field: PERFORMANCE_FIELDS.RESOURCE_USAGE,
      message: 'High resource usage in multiple areas may impact performance',
      code: 'PERF_MULTIPLE_HIGH_RESOURCES',
      severity: 'warning',
    });
  }
}

/**
 * Validates complexity vs resource usage alignment
 * @param {SkillDefinition} skill - The skill definition to validate
 * @param {ValidationError[]} issues - Array to collect validation issues
 */
export function validateComplexityResourceAlignment(
  skill: SkillDefinition,
  issues: ValidationError[]
): void {
  if (!skill.performance?.complexity || !skill.performance?.resourceUsage) {
    return;
  }

  const { COMPLEXITY_MISMATCH } = PERFORMANCE_THRESHOLDS;
  const hasHighResources = COMPLEXITY_MISMATCH.SIMPLE_MAX_RESOURCES.some(resource => {
    const resourceUsage = skill.performance?.resourceUsage;
    if (!resourceUsage) return false;
    return resourceUsage[resource as keyof typeof resourceUsage] === 'high';
  });

  if (skill.performance.complexity === 'simple' && hasHighResources) {
    issues.push({
      category: 'performance',
      field: PERFORMANCE_FIELDS.RESOURCE_USAGE,
      message: 'Simple skill has high resource usage',
      code: 'PERF_COMPLEXITY_RESOURCE_MISMATCH',
      severity: 'warning',
    });
  }
}

/**
 * Performance validation constants
 */
const PERFORMANCE_VALIDATION_CONSTANTS = {
  /** Minimum success rate threshold (50%) */
  SUCCESS_RATE_THRESHOLD: 0.5,
  /** Low success rate warning threshold */
  LOW_SUCCESS_RATE_THRESHOLD: 50,
} as const;

/**
 * Validates success rate expectations
 * @param {SkillDefinition} skill - The skill definition to validate
 * @param {ValidationError[]} issues - Array to collect validation issues
 */
export function validateSuccessRateExpectations(
  skill: SkillDefinition,
  issues: ValidationError[]
): void {
  if (
    skill.expectedSuccessRate !== undefined &&
    skill.expectedSuccessRate < PERFORMANCE_VALIDATION_CONSTANTS.SUCCESS_RATE_THRESHOLD
  ) {
    issues.push({
      category: 'performance',
      field: 'expectedSuccessRate',
      message: `Expected success rate below ${PERFORMANCE_VALIDATION_CONSTANTS.LOW_SUCCESS_RATE_THRESHOLD}% may indicate reliability issues`,
      code: 'PERF_LOW_SUCCESS_RATE',
      severity: 'warning',
    });
  }
}

/**
 * Validates error handling configuration
 * @param {SkillDefinition} skill - The skill definition to validate
 * @param {ValidationError[]} issues - Array to collect validation issues
 */
export function validateErrorHandling(skill: SkillDefinition, issues: ValidationError[]): void {
  // Only add info level issues for complex or production skills
  if (skill.errorHandling === undefined && skill.performance?.complexity !== 'simple') {
    issues.push({
      category: 'performance',
      field: 'errorHandling',
      message: 'Error handling strategy should be defined for complex skills',
      code: 'PERF_NO_ERROR_HANDLING',
      severity: 'info',
    });
  }
}

/**
 * Validates caching strategy
 * @param {SkillDefinition} skill - The skill definition to validate
 * @param {ValidationError[]} issues - Array to collect validation issues
 */
export function validateCachingStrategy(skill: SkillDefinition, issues: ValidationError[]): void {
  // Only add info level issues for complex or production skills
  if (skill.cacheable === undefined && skill.performance?.complexity !== 'simple') {
    issues.push({
      category: 'performance',
      field: 'cacheable',
      message: 'Cacheability should be defined for optimal performance',
      code: 'PERF_NO_CACHE_STRATEGY',
      severity: 'info',
    });
  }
}
