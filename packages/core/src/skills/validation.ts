/**
 * Skill Validation Framework
 * Provides comprehensive validation for skill definitions including schema compliance,
 * compatibility checking, dependency resolution, and quality assessment
 *
 * This file acts as a public API facade, re-exporting functionality from specialized validation modules.
 */

// Core validation classes and utilities
export type { SkillValidationResult } from './types';
export type { PerformanceValidationResult } from './performance-validator';
export type { CompatibilityValidationResult } from './compatibility-validator';
export type { DependencyValidationResult } from './dependency-validator';
export type { SkillValidationRule } from './validation-rules';

export { SkillValidator } from './skill-validator';

export {
  ValidationRuleBuilder,
  ValidationRuleRegistry,
  createValidationRule,
} from './validation-rules';

export { CompatibilityValidator } from './compatibility-validator';

export { DependencyValidator } from './dependency-validator';

export { DependencyGraph } from './dependency-graph';

export { PerformanceValidator, PERFORMANCE_THRESHOLDS } from './performance-validator';

// Validation constants and utilities
export {
  VALIDATION_SCORE_MAX,
  PERFORMANCE_THRESHOLD_MS,
  DEPENDENCY_DEPTH_LIMIT,
  isValidVersion,
  VALIDATION_CATEGORY_PRIORITY,
  DEFAULT_VALIDATION_MESSAGES,
} from './validation-constants';

// Default validator instance and convenience functions
import { SkillValidator as SkillValidatorClass } from './skill-validator';
import {
  SkillDefinition,
  SkillValidationResult,
  ValidationError,
  AgentRole,
  CompatibilityLevel,
} from './types';

/**
 * Default validator instance
 */
export const defaultValidator = new SkillValidatorClass();

/**
 * Quick validation function using default validator
 * @param {SkillDefinition} skill - Skill definition to validate
 * @returns {SkillValidationResult} Validation result
 */
export function validateSkill(skill: SkillDefinition): SkillValidationResult {
  return defaultValidator.validate(skill);
}

/**
 * Quick compatibility check using default validator
 * @param {SkillDefinition} skill - Skill definition to check
 * @param {AgentRole} agentRole - Agent role to check compatibility for
 * @returns {{compatible: boolean, level: CompatibilityLevel, issues: ValidationError[]}} Compatibility result
 */
export function checkCompatibility(
  skill: SkillDefinition,
  agentRole: AgentRole
): {
  compatible: boolean;
  level: CompatibilityLevel;
  issues: ValidationError[];
} {
  return defaultValidator.validateCompatibility(skill, agentRole);
}
