/**
 * Dependency Validation Helpers
 * Contains helper functions and interfaces for dependency validation
 */

import { ValidationError } from './types';

/**
 * Validation context for dependency validation
 */
export interface ValidationContext {
  /** List of available skill IDs */
  availableSkills: string[];

  /** Array to collect missing dependencies */
  dependencies: string[];

  /** Array to collect validation issues */
  issues: ValidationError[];

  /** Set of already seen dependencies */
  seenDependencies: Set<string>;
}

/**
 * Create issue for circular dependency
 * @param {string} cycleStr - Circular dependency string representation
 * @returns {ValidationError} Validation error
 */
export function createCircularDependencyIssue(cycleStr: string): ValidationError {
  return {
    category: 'dependencies',
    message: `Circular dependency detected: ${cycleStr}`,
    severity: 'error',
    suggestion: 'Restructure dependencies to eliminate circular references',
  };
}

/**
 * Create issue for dependency depth
 * @param {string} skillId - Skill ID with deep dependency chain
 * @param {number} depth - Current dependency depth
 * @returns {ValidationError} Validation error
 */
export function createDepthIssue(skillId: string, depth: number): ValidationError {
  return {
    category: 'dependencies',
    message: `Dependency chain for skill '${skillId}' is too deep (${depth} levels)`,
    severity: 'warning',
    suggestion: 'Consider restructuring to reduce dependency complexity',
  };
}

/**
 * Create issue for missing complex dependency
 * @param {string} skillId - Skill ID with missing dependency
 * @param {string} dependencyId - Missing dependency ID
 * @returns {ValidationError} Validation error
 */
export function createMissingComplexDependencyIssue(
  skillId: string,
  dependencyId: string
): ValidationError {
  return {
    category: 'dependencies',
    message: `Required dependency '${dependencyId}' for skill '${skillId}' is not available`,
    severity: 'error',
    suggestion: `Add skill '${dependencyId}' or remove the dependency`,
  };
}

/**
 * Create issue for missing required dependency
 * @param {string} dependencyId - Missing dependency ID
 * @returns {ValidationError} Validation error
 */
export function createRequiredDependencyIssue(dependencyId: string): ValidationError {
  return {
    category: 'dependencies',
    message: `Required dependency '${dependencyId}' is not available`,
    severity: 'error',
    suggestion: `Ensure dependency '${dependencyId}' is available before using this skill`,
  };
}

/**
 * Create issue for missing optional dependency
 * @param {string} dependencyId - Missing dependency ID
 * @returns {ValidationError} Validation error
 */
export function createOptionalDependencyIssue(dependencyId: string): ValidationError {
  return {
    category: 'dependencies',
    message: `Optional dependency '${dependencyId}' is not available`,
    severity: 'warning',
    suggestion: `Some functionality may be limited without '${dependencyId}'`,
  };
}

/**
 * Create issue for self-dependency
 * @param {string} dependencyId - Self-dependency ID
 * @returns {ValidationError} Validation error
 */
export function createSelfDependencyIssue(dependencyId: string): ValidationError {
  return {
    category: 'dependencies',
    message: `Skill cannot depend on itself: ${dependencyId}`,
    severity: 'error',
    suggestion: 'Remove self-dependency from skill definition',
  };
}
