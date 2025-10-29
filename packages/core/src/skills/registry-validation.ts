/**
 * Skill Registry Validation
 * Handles skill validation logic and scoring
 */

import {
  validateSkillId,
  validateSkillName,
  validateSkillDescription,
  validateSkillVersion,
  validateSkillCategory,
  validateSkillCapabilities,
  validateSkillDependencies,
  validateSkillMetadata,
} from './registry-field-validators';
import {
  SkillDefinition,
  SkillValidationResult,
  ValidationError,
  ValidationWarning,
} from './types';

/** Constants for validation scoring */
const VALIDATION_SCORE_BASE = 100;
const VALIDATION_ERROR_PENALTY = 20;
const VALIDATION_WARNING_PENALTY = 5;
const MAX_ID_LENGTH = 100;
const MAX_CATEGORY_LENGTH = 50;

/**
 * Skill validation logic
 */
export class SkillValidator {
  /**
   * Validate a skill definition
   * @param {SkillDefinition} skill - Skill to validate
   * @returns {SkillValidationResult} Validation result with score and issues
   */
  validateSkill(skill: SkillDefinition): SkillValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    this.validateRequiredFields(skill, errors);
    this.validateIdFormat(skill, errors, warnings);
    this.validateVersionFormat(skill, errors, warnings);
    this.validateCategories(skill, warnings);
    this.validateMetadataStructure(skill, errors, warnings);
    this.validateCompatibility(skill, errors);
    this.validatePerformance(skill, errors);
    this.validateDependencies(skill, warnings);

    const score = this.calculateValidationScore(errors, warnings);
    const valid = errors.length === 0;

    return {
      valid,
      score,
      errors,
      warnings,
      validatedAt: new Date(),
    };
  }

  /**
   * Validate required skill fields
   * @param {SkillDefinition} skill - Skill to validate
   * @param {ValidationError[]} errors - Array to collect errors
   * @private
   */
  private validateRequiredFields(skill: SkillDefinition, errors: ValidationError[]): void {
    validateSkillId(skill, errors);
    validateSkillName(skill, errors);
    validateSkillDescription(skill, errors);
    validateSkillVersion(skill, errors);
    validateSkillCategory(skill, errors);
    validateSkillCapabilities(skill, errors);
    validateSkillDependencies(skill, errors);
    validateSkillMetadata(skill, errors);
  }

  /**
   * Validate skill ID format
   * @param {SkillDefinition} skill - Skill to validate
   * @param {ValidationError[]} _errors - Array to collect errors (unused)
   * @param {ValidationWarning[]} warnings - Array to collect warnings
   * @private
   */
  private validateIdFormat(
    skill: SkillDefinition,
    _errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (skill.id && !/^[\w-]+$/.test(skill.id)) {
      _errors.push({
        code: 'INVALID_ID_FORMAT',
        message: 'Skill ID must contain only alphanumeric characters, hyphens, and underscores',
        severity: 'error' as const,
        category: 'schema' as const,
      });
    }

    if (skill.id && skill.id.length > MAX_ID_LENGTH) {
      warnings.push({
        code: 'LONG_ID',
        message: 'Skill ID is very long (over 100 characters)',
        severity: 'warning' as const,
        category: 'documentation' as const,
      });
    }
  }

  /**
   * Validate version format
   * @param {SkillDefinition} skill - Skill to validate
   * @param {ValidationError[]} errors - Array to collect errors
   * @param {ValidationWarning[]} _warnings - Array to collect warnings (unused)
   * @private
   */
  private validateVersionFormat(
    skill: SkillDefinition,
    errors: ValidationError[],
    _warnings: ValidationWarning[]
  ): void {
    if (skill.version && !/^\d+\.\d+\.\d+/.test(skill.version)) {
      errors.push({
        field: 'version',
        message: 'Invalid skill version format. Expected semantic versioning (x.y.z)',
        code: 'INVALID_VERSION_FORMAT',
        severity: 'error' as const,
        category: 'schema' as const,
      });
    }
  }

  /**
   * Validate skill categories
   * @param {SkillDefinition} skill - Skill to validate
   * @param {ValidationWarning[]} warnings - Array to collect warnings
   * @private
   */
  private validateCategories(skill: SkillDefinition, warnings: ValidationWarning[]): void {
    if (skill.category && skill.category.length > MAX_CATEGORY_LENGTH) {
      warnings.push({
        code: 'LONG_CATEGORY',
        message: 'Category name is very long (over 50 characters)',
        severity: 'warning' as const,
        category: 'documentation' as const,
      });
    }
  }

  /**
   * Validate metadata structure
   * @param {SkillDefinition} skill - Skill to validate
   * @param {ValidationError[]} errors - Array to collect errors
   * @param {ValidationWarning[]} _warnings - Array to collect warnings (unused)
   * @private
   */
  private validateMetadataStructure(
    skill: SkillDefinition,
    errors: ValidationError[],
    _warnings: ValidationWarning[]
  ): void {
    if (!skill.metadata || typeof skill.metadata !== 'object') {
      errors.push({
        field: 'metadata',
        message: 'Metadata is required and must be an object',
        code: 'MISSING_METADATA',
        severity: 'error' as const,
        category: 'schema' as const,
      });
      return;
    }

    this.validateRequiredMetadataFields(skill.metadata, errors);
  }

  /**
   * Validate required metadata fields
   * @param {import('./skill-metadata').SkillMetadata} metadata - Metadata to validate
   * @param {ValidationError[]} errors - Array to collect errors
   * @private
   */
  private validateRequiredMetadataFields(
    metadata: import('./skill-metadata').SkillMetadata,
    errors: ValidationError[]
  ): void {
    const requiredFields = [
      { name: 'createdAt', value: metadata.createdAt },
      { name: 'updatedAt', value: metadata.updatedAt },
      { name: 'author', value: metadata.author },
    ];

    for (const field of requiredFields) {
      if (!field.value) {
        errors.push({
          field: `metadata.${field.name}`,
          message: `Metadata field '${field.name}' is required`,
          code: 'MISSING_METADATA_FIELD',
          severity: 'error' as const,
          category: 'schema' as const,
        });
      }
    }
  }

  /**
   * Validate compatibility information
   * @param {SkillDefinition} skill - Skill to validate
   * @param {ValidationError[]} errors - Array to collect errors
   * @private
   */
  private validateCompatibility(skill: SkillDefinition, errors: ValidationError[]): void {
    if (!skill.compatibility || skill.compatibility.length === 0) {
      errors.push({
        field: 'compatibility',
        message: 'Skill must have at least one agent compatibility',
        code: 'MISSING_COMPATIBILITY',
        severity: 'error' as const,
        category: 'schema' as const,
      });
    }
  }

  /**
   * Validate performance information
   * @param {SkillDefinition} skill - Skill to validate
   * @param {ValidationError[]} errors - Array to collect errors
   * @private
   */
  private validatePerformance(skill: SkillDefinition, errors: ValidationError[]): void {
    if (!skill.performance) {
      errors.push({
        field: 'performance',
        message: 'performance information is required',
        code: 'MISSING_PERFORMANCE',
        severity: 'error' as const,
        category: 'schema' as const,
      });
      return;
    }

    this.validateExecutionTime(skill.performance.executionTime, errors);
  }

  /**
   * Validate execution time values
   * @param {ExecutionTime} executionTime - Execution time to validate
   * @param {ValidationError[]} errors - Array to collect errors
   * @private
   */
  private validateExecutionTime(
    executionTime: { min: number; max: number; average: number } | undefined,
    errors: ValidationError[]
  ): void {
    if (!executionTime) return;

    const { min, max, average } = executionTime;

    // Check for positive values
    if (min < 0 || max < 0 || average < 0) {
      errors.push({
        field: 'performance.executionTime',
        message: 'Execution time values must be positive',
        code: 'NEGATIVE_EXECUTION_TIME',
        severity: 'error' as const,
        category: 'schema' as const,
      });
    }

    // Check min <= max
    if (min > max) {
      errors.push({
        field: 'performance.executionTime',
        message: 'Minimum execution time cannot be greater than maximum execution time',
        code: 'INVALID_EXECUTION_TIME_RANGE',
        severity: 'error' as const,
        category: 'schema' as const,
      });
    }
  }

  /**
   * Validate dependencies
   * @param {SkillDefinition} skill - Skill to validate
   * @param {ValidationWarning[]} warnings - Array to collect warnings
   * @private
   */
  private validateDependencies(skill: SkillDefinition, warnings: ValidationWarning[]): void {
    if (skill.dependencies) {
      for (const dep of skill.dependencies) {
        // Check optional dependency naming convention
        if (!dep.required && !dep.skillId.startsWith('optional-')) {
          warnings.push({
            code: 'OPTIONAL_DEPENDENCY_NAMING',
            message: `Optional dependency '${dep.skillId}' should be prefixed with 'optional-'`,
            severity: 'warning' as const,
            category: 'documentation' as const,
          });
        }
      }
    }
  }

  /**
   * Calculate validation score based on errors and warnings
   * @param {ValidationError[]} errors - Validation errors
   * @param {ValidationWarning[]} warnings - Validation warnings
   * @returns {number} Validation score (0-100)
   * @private
   */
  private calculateValidationScore(
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): number {
    let score = VALIDATION_SCORE_BASE;
    score -= errors.length * VALIDATION_ERROR_PENALTY;
    score -= warnings.length * VALIDATION_WARNING_PENALTY;
    return Math.max(0, score);
  }
}
