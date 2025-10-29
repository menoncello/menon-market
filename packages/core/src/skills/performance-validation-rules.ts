/**
 * Performance Validation Rules
 * Contains performance-specific validation rules for skill validation
 */

import type { SkillDefinition, ValidationError } from './types';
import { SkillValidationRule, createValidationRule } from './validation-rules';

// Performance validation constants
const MAX_EXECUTION_TIME_MINUTES = 300;
const RECOMMENDED_EXECUTION_TIME_MINUTES = 60;
const HIGH_RESOURCES_THRESHOLD = 2;
const EXECUTION_TIME_FIELD = 'performance.executionTime';
const RESOURCE_USAGE_FIELD = 'performance.resourceUsage';

/**
 * Creates validation error for invalid execution time range
 * @returns {ValidationError} Validation error for invalid range
 */
function createInvalidRangeError(): ValidationError {
  return {
    category: 'performance',
    field: EXECUTION_TIME_FIELD,
    message: 'Minimum execution time cannot be greater than maximum execution time',
    code: 'PERF_EXECUTION_TIME_INVALID_RANGE',
    severity: 'error',
  };
}

/**
 * Creates validation error for very long execution time
 * @returns {ValidationError} Validation error for long execution time
 */
function createLongExecutionTimeWarning(): ValidationError {
  return {
    category: 'performance',
    field: EXECUTION_TIME_FIELD,
    message: 'Maximum execution time is very long and may impact user experience',
    code: 'PERF_EXECUTION_TIME_TOO_LONG',
    severity: 'warning',
  };
}

/**
 * Creates validation error for execution time exceeding recommendation
 * @param {number} average - The average execution time
 * @returns {ValidationError} Validation error for exceeding recommendation
 */
function createExceedsRecommendationWarning(average: number): ValidationError {
  return {
    category: 'performance',
    field: EXECUTION_TIME_FIELD,
    message: `Execution time estimate of ${average} minutes is longer than recommended ${RECOMMENDED_EXECUTION_TIME_MINUTES} minutes`,
    code: 'PERF_EXECUTION_TIME_WARNING',
    severity: 'warning',
  };
}

/**
 * Validates execution time ranges and checks for performance issues
 * @param {SkillDefinition['performance']} executionTime - The execution time configuration to validate
 * @returns {ValidationError[]} Array of validation errors found
 */
function validateExecutionTime(
  executionTime: SkillDefinition['performance']['executionTime']
): ValidationError[] {
  const issues: ValidationError[] = [];

  if (executionTime.min > executionTime.max) {
    issues.push(createInvalidRangeError());
  }

  if (executionTime.max > MAX_EXECUTION_TIME_MINUTES) {
    issues.push(createLongExecutionTimeWarning());
  }

  if (executionTime.average > RECOMMENDED_EXECUTION_TIME_MINUTES) {
    issues.push(createExceedsRecommendationWarning(executionTime.average));
  }

  return issues;
}

/**
 * Extracts high resource usage areas from resource usage configuration
 * @param {SkillDefinition['performance']['resourceUsage']} resourceUsage - The resource usage configuration to analyze
 * @returns {string[]} Array of resource names with high usage
 */
function getHighResourceUsage(
  resourceUsage: SkillDefinition['performance']['resourceUsage']
): string[] {
  return Object.entries(resourceUsage)
    .filter(([_, level]) => level === 'high')
    .map(([resource]) => resource);
}

/**
 * Creates validation error for multiple high resource usage
 * @returns {ValidationError} Validation error for multiple high resources
 */
function createMultipleHighResourcesError(): ValidationError {
  return {
    category: 'performance',
    field: RESOURCE_USAGE_FIELD,
    message: 'High resource usage in multiple areas may impact performance',
    code: 'PERF_MULTIPLE_HIGH_RESOURCES',
    severity: 'warning',
  };
}

/**
 * Creates validation error for high resource requirements count
 * @param {number} count - Number of high resource requirements
 * @returns {ValidationError} Validation error for high resource count
 */
function createHighResourceCountError(count: number): ValidationError {
  return {
    category: 'performance',
    field: RESOURCE_USAGE_FIELD,
    message: `Skill has ${count} high resource requirements which may impact performance`,
    code: 'PERF_HIGH_RESOURCE_USAGE',
    severity: 'warning',
  };
}

/**
 * Creates validation error for complexity-resource mismatch
 * @returns {ValidationError} Validation error for complexity-resource mismatch
 */
function createComplexityMismatchError(): ValidationError {
  return {
    category: 'performance',
    field: RESOURCE_USAGE_FIELD,
    message: 'Simple skill has high resource usage',
    code: 'PERF_COMPLEXITY_RESOURCE_MISMATCH',
    severity: 'warning',
  };
}

/**
 * Validates high resource usage patterns
 * @param {string[]} highResources - Array of high resource usage areas
 * @returns {ValidationError[]} Array of validation errors found
 */
function validateHighResourceUsage(highResources: string[]): ValidationError[] {
  const issues: ValidationError[] = [];

  if (highResources.length > 1) {
    issues.push(createMultipleHighResourcesError());
  }

  if (highResources.length >= HIGH_RESOURCES_THRESHOLD) {
    issues.push(createHighResourceCountError(highResources.length));
  }

  return issues;
}

/**
 * Validates complexity and resource usage alignment
 * @param {SkillDefinition['performance']} performance - The performance configuration to validate
 * @returns {ValidationError[]} Array of validation errors found
 */
function validateComplexityResourceAlignment(
  performance: SkillDefinition['performance']
): ValidationError[] {
  const issues: ValidationError[] = [];

  if (performance.complexity === 'simple' && performance.resourceUsage) {
    const hasHighSimpleResources = checkSimpleSkillHighResources(performance.resourceUsage);

    if (hasHighSimpleResources) {
      issues.push(createComplexityMismatchError());
    }
  }

  return issues;
}

/**
 * Checks if a simple skill has high resource usage
 * @param {SkillDefinition['performance']['resourceUsage']} resourceUsage - The resource usage configuration to check
 * @returns {boolean} True if simple skill has high resource usage
 */
function checkSimpleSkillHighResources(
  resourceUsage: SkillDefinition['performance']['resourceUsage']
): boolean {
  const simpleMaxResources = ['memory', 'CPU', 'network'];
  return simpleMaxResources.some(resource => {
    return resourceUsage[resource.toLowerCase() as keyof typeof resourceUsage] === 'high';
  });
}

/**
 * Validates resource usage patterns and checks for performance issues
 * @param {SkillDefinition['performance']} performance - The performance configuration to validate
 * @returns {ValidationError[]} Array of validation errors found
 */
function validateResourceUsage(performance: SkillDefinition['performance']): ValidationError[] {
  if (!performance.resourceUsage) {
    return [];
  }

  const highResources = getHighResourceUsage(performance.resourceUsage);
  const issues = validateHighResourceUsage(highResources);
  const complexityIssues = validateComplexityResourceAlignment(performance);

  return [...issues, ...complexityIssues];
}

/**
 * Create performance validation rule
 * @returns {SkillValidationRule} The performance validation rule that validates execution time and resource usage
 */
export function createPerformanceValidationRule(): SkillValidationRule {
  return createValidationRule()
    .withId('performance-validation')
    .withCategory('performance')
    .withDescription('Validates skill performance characteristics')
    .withValidator((skill: SkillDefinition): ValidationError[] => {
      const issues: ValidationError[] = [];

      if (skill.performance?.executionTime) {
        issues.push(...validateExecutionTime(skill.performance.executionTime));
      }

      if (skill.performance) {
        issues.push(...validateResourceUsage(skill.performance));
      }

      return issues;
    })
    .withSeverity('warning')
    .withRequired(true)
    .build();
}
