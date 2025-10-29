/**
 * Main Skill Validator
 * Core validation orchestrator that combines all validation modules
 */

import { CompatibilityValidator, CompatibilityValidationResult } from './compatibility-validator';
import { DependencyValidator, DependencyValidationResult } from './dependency-validator';
import { PerformanceValidator, PerformanceValidationResult } from './performance-validator';
import {
  SkillDefinition,
  SkillValidationResult,
  ValidationError,
  ValidationWarning,
  AgentRole,
} from './types';
import { VALIDATION_SCORE_MAX } from './validation-constants';
import { createDefaultValidationRules } from './validation-rule-definitions';
import { SkillValidationRule, ValidationRuleRegistry } from './validation-rules';

/**
 * Skill validation framework with configurable rules
 */
export class SkillValidator {
  private ruleRegistry: ValidationRuleRegistry;
  private compatibilityValidator: CompatibilityValidator;
  private dependencyValidator: DependencyValidator;
  private performanceValidator: PerformanceValidator;
  private customRules: SkillValidationRule[] = [];

  /**
   * Initialize the skill validator with default validation rules
   */
  constructor() {
    this.ruleRegistry = new ValidationRuleRegistry();
    this.compatibilityValidator = new CompatibilityValidator();
    this.dependencyValidator = new DependencyValidator();
    this.performanceValidator = new PerformanceValidator();

    this.initializeDefaultRules();
  }

  /**
   * Validate a skill definition against all rules
   * @param {SkillDefinition} skill - Skill definition to validate
   * @returns {SkillValidationResult} Comprehensive validation result
   */
  validate(skill: SkillDefinition): SkillValidationResult {
    const { errors, warnings } = this.runValidationRules(skill);
    const score = this.calculateValidationScore(errors.length, warnings.length);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score,
      validatedAt: new Date(),
    };
  }

  /**
   * Run all validation rules against a skill
   * @param {SkillDefinition} skill - Skill definition to validate
   * @returns {{errors: ValidationError[], warnings: ValidationWarning[]}} Validation errors and warnings
   * @private
   */
  private runValidationRules(skill: SkillDefinition): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const rule of this.getAllRules()) {
      const ruleErrors = this.executeValidationRule(rule, skill);
      this.categorizeValidationErrors(ruleErrors, errors, warnings);
    }

    return { errors, warnings };
  }

  /**
   * Execute a single validation rule
   * @param {SkillValidationRule} rule - Validation rule to execute
   * @param {SkillDefinition} skill - Skill definition to validate
   * @returns {ValidationError[]} Validation errors from the rule
   * @private
   */
  private executeValidationRule(
    rule: SkillValidationRule,
    skill: SkillDefinition
  ): ValidationError[] {
    try {
      return rule.validate(skill);
    } catch (validationError) {
      return [
        {
          category: 'schema',
          message: `Validation rule '${rule.id}' failed: ${validationError}`,
          severity: 'error',
          location: rule.id,
          suggestion: 'Check skill definition structure and data types',
        },
      ];
    }
  }

  /**
   * Categorize validation errors into errors and warnings
   * @param {ValidationError[]} ruleErrors - Errors from a validation rule
   * @param {ValidationError[]} errors - Array to accumulate errors
   * @param {ValidationWarning[]} warnings - Array to accumulate warnings
   * @private
   */
  private categorizeValidationErrors(
    ruleErrors: ValidationError[],
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    for (const error of ruleErrors) {
      if (error.severity === 'error') {
        errors.push(error);
      } else {
        warnings.push(error as ValidationWarning);
      }
    }
  }

  /**
   * Calculate validation score based on errors and warnings
   * @param {number} errorCount - Number of errors
   * @param {number} warningCount - Number of warnings
   * @returns {number} Validation score (0-100)
   * @private
   */
  private calculateValidationScore(errorCount: number, warningCount: number): number {
    const totalRules = this.getAllRules().length;
    const failedRules = errorCount + warningCount;
    return Math.max(
      0,
      VALIDATION_SCORE_MAX - Math.round((failedRules / totalRules) * VALIDATION_SCORE_MAX)
    );
  }

  /**
   * Validate skill compatibility with agent types
   * @param {SkillDefinition} skill - Skill definition to check
   * @param {AgentRole} agentRole - Agent role to check compatibility for
   * @returns {CompatibilityValidationResult} Compatibility validation result
   */
  validateCompatibility(
    skill: SkillDefinition,
    agentRole: AgentRole
  ): CompatibilityValidationResult {
    return this.compatibilityValidator.validateCompatibility(skill, agentRole);
  }

  /**
   * Validate skill dependencies
   * @param {SkillDefinition} skill - Skill definition to validate
   * @param {string[]} [availableSkills] - List of available skill IDs to check against
   * @returns {DependencyValidationResult} Dependency validation result
   */
  validateDependencies(
    skill: SkillDefinition,
    availableSkills: string[] = []
  ): DependencyValidationResult {
    return this.dependencyValidator.validateDependencies(skill, availableSkills);
  }

  /**
   * Validate skill performance characteristics
   * @param {SkillDefinition} skill - Skill definition to validate
   * @returns {PerformanceValidationResult} Performance validation result
   */
  validatePerformance(skill: SkillDefinition): PerformanceValidationResult {
    return this.performanceValidator.validatePerformance(skill);
  }

  /**
   * Validate a collection of skills with cross-skill dependency analysis
   * @param {SkillDefinition[]} skills - Array of skill definitions to validate
   * @returns {{individualResults: Map<string, SkillValidationResult>, dependencyAnalysis: DependencyValidationResult, overallValid: boolean}} Comprehensive validation results for all skills
   */
  validateSkillCollection(skills: SkillDefinition[]): {
    individualResults: Map<string, SkillValidationResult>;
    dependencyAnalysis: DependencyValidationResult;
    overallValid: boolean;
  } {
    const individualResults = new Map<string, SkillValidationResult>();
    let overallValid = true;

    // Validate each skill individually
    for (const skill of skills) {
      const result = this.validate(skill);
      individualResults.set(skill.id, result);
      if (!result.valid) {
        overallValid = false;
      }
    }

    // Perform cross-skill dependency analysis
    const dependencyAnalysis = this.dependencyValidator.validateComplexDependencies(skills);
    if (!dependencyAnalysis.valid) {
      overallValid = false;
    }

    return {
      individualResults,
      dependencyAnalysis,
      overallValid,
    };
  }

  /**
   * Add a custom validation rule
   * @param {SkillValidationRule} rule - Custom validation rule to add
   * @returns {void}
   */
  addRule(rule: SkillValidationRule): void {
    this.ruleRegistry.register(rule);
  }

  /**
   * Remove a validation rule
   * @param {string} ruleId - ID of rule to remove
   * @returns {void}
   */
  removeRule(ruleId: string): void {
    this.ruleRegistry.unregister(ruleId);
  }

  /**
   * Get all validation rules
   * @returns {SkillValidationRule[]} Array of all validation rules
   */
  getAllRules(): SkillValidationRule[] {
    return [...this.ruleRegistry.getAll(), ...this.customRules];
  }

  /**
   * Get validation rules by category
   * @param {string} category - Validation category to filter by
   * @returns {SkillValidationRule[]} Array of rules in the specified category
   */
  getRulesByCategory(category: string): SkillValidationRule[] {
    return this.getAllRules().filter(rule => rule.category === category);
  }

  /**
   * Get required validation rules
   * @returns {SkillValidationRule[]} Array of required validation rules
   */
  getRequiredRules(): SkillValidationRule[] {
    return this.getAllRules().filter(rule => rule.required);
  }

  /**
   * Get optional validation rules
   * @returns {SkillValidationRule[]} Array of optional validation rules
   */
  getOptionalRules(): SkillValidationRule[] {
    return this.getAllRules().filter(rule => !rule.required);
  }

  /**
   * Get validation statistics
   * @returns {{totalRules: number, requiredRules: number, optionalRules: number, rulesByCategory: Record<string, number>}} Statistics about validation rules
   */
  getValidationStats(): {
    totalRules: number;
    requiredRules: number;
    optionalRules: number;
    rulesByCategory: Record<string, number>;
  } {
    const allRules = this.getAllRules();
    const rulesByCategory: Record<string, number> = {};

    for (const rule of allRules) {
      rulesByCategory[rule.category] = (rulesByCategory[rule.category] || 0) + 1;
    }

    return {
      totalRules: allRules.length,
      requiredRules: allRules.filter(rule => rule.required).length,
      optionalRules: allRules.filter(rule => !rule.required).length,
      rulesByCategory,
    };
  }

  /**
   * Initialize default validation rules
   * @returns {void}
   * @private
   */
  private initializeDefaultRules(): void {
    const defaultRules = createDefaultValidationRules();
    for (const rule of defaultRules) {
      this.ruleRegistry.register(rule);
    }
  }
}
