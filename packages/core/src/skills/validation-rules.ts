/**
 * Skill Validation Rules Interface
 * Defines the structure and types for validation rules used in skill validation
 */

import { SkillDefinition, ValidationError, ValidationCategory } from './types';

/**
 * Skill validation rule interface
 */
export interface SkillValidationRule {
  /** Rule identifier */
  id: string;

  /** Rule category */
  category: ValidationCategory;

  /** Rule description */
  description: string;

  /** Validation function */
  validate: (skill: SkillDefinition) => ValidationError[];

  /** Rule severity */
  severity: 'error' | 'warning';

  /** Whether this rule is required */
  required: boolean;
}

/**
 * Validation rule builder utility
 */
export class ValidationRuleBuilder {
  private rule: Partial<SkillValidationRule> = {};

  /**
   * Set rule ID
   * @param {string} id - Rule identifier
   * @returns {ValidationRuleBuilder} The builder instance for method chaining
   */
  withId(id: string): ValidationRuleBuilder {
    this.rule.id = id;
    return this;
  }

  /**
   * Set rule category
   * @param {ValidationCategory} category - Validation category
   * @returns {ValidationRuleBuilder} The builder instance for method chaining
   */
  withCategory(category: ValidationCategory): ValidationRuleBuilder {
    this.rule.category = category;
    return this;
  }

  /**
   * Set rule description
   * @param {string} description - Rule description
   * @returns {ValidationRuleBuilder} The builder instance for method chaining
   */
  withDescription(description: string): ValidationRuleBuilder {
    this.rule.description = description;
    return this;
  }

  /**
   * Set validation function
   * @param {(skill: SkillDefinition) => ValidationError[]} validateFn - Validation function
   * @returns {ValidationRuleBuilder} The builder instance for method chaining
   */
  withValidator(validateFn: (skill: SkillDefinition) => ValidationError[]): ValidationRuleBuilder {
    this.rule.validate = validateFn;
    return this;
  }

  /**
   * Set rule severity
   * @param {'error'|'warning'} severity - Rule severity level
   * @returns {ValidationRuleBuilder} The builder instance for method chaining
   */
  withSeverity(severity: 'error' | 'warning'): ValidationRuleBuilder {
    this.rule.severity = severity;
    return this;
  }

  /**
   * Set whether rule is required
   * @param {boolean} required - Whether rule is required
   * @returns {ValidationRuleBuilder} The builder instance for method chaining
   */
  withRequired(required: boolean): ValidationRuleBuilder {
    this.rule.required = required;
    return this;
  }

  /**
   * Build the validation rule
   * @returns {SkillValidationRule} Complete validation rule
   */
  build(): SkillValidationRule {
    if (
      !this.rule.id ||
      !this.rule.category ||
      !this.rule.description ||
      !this.rule.validate ||
      !this.rule.severity ||
      this.rule.required === undefined
    ) {
      throw new Error('Missing required rule properties');
    }

    return this.rule as SkillValidationRule;
  }
}

/**
 * Create a validation rule with builder pattern
 * @returns {ValidationRuleBuilder} Validation rule builder instance
 */
export function createValidationRule(): ValidationRuleBuilder {
  return new ValidationRuleBuilder();
}

/**
 * Rule registry for managing validation rules
 */
export class ValidationRuleRegistry {
  private rules: Map<string, SkillValidationRule> = new Map();

  /**
   * Register a validation rule
   * @param {SkillValidationRule} rule - Rule to register
   * @returns {void}
   */
  register(rule: SkillValidationRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Unregister a validation rule
   * @param {string} ruleId - ID of rule to unregister
   * @returns {void}
   */
  unregister(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  /**
   * Get a validation rule by ID
   * @param {string} ruleId - Rule ID to retrieve
   * @returns {SkillValidationRule|undefined} Validation rule or undefined if not found
   */
  get(ruleId: string): SkillValidationRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Get all registered rules
   * @returns {SkillValidationRule[]} Array of all validation rules
   */
  getAll(): SkillValidationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get rules by category
   * @param {ValidationCategory} category - Category to filter by
   * @returns {SkillValidationRule[]} Array of rules in specified category
   */
  getByCategory(category: ValidationCategory): SkillValidationRule[] {
    return this.getAll().filter(rule => rule.category === category);
  }

  /**
   * Get required rules
   * @returns {SkillValidationRule[]} Array of required validation rules
   */
  getRequired(): SkillValidationRule[] {
    return this.getAll().filter(rule => rule.required);
  }

  /**
   * Get optional rules
   * @returns {SkillValidationRule[]} Array of optional validation rules
   */
  getOptional(): SkillValidationRule[] {
    return this.getAll().filter(rule => !rule.required);
  }

  /**
   * Clear all registered rules
   * @returns {void}
   */
  clear(): void {
    this.rules.clear();
  }

  /**
   * Get rule count
   * @returns {number} Number of registered rules
   */
  count(): number {
    return this.rules.size;
  }
}
