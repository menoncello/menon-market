import { VALIDATION_THRESHOLDS } from './constants';
import { SkillDefinition, ValidationError } from './types';

/**
 * Registry field validation helpers
 */

/**
 * Validate skill ID field
 * @param {SkillDefinition} skill - Skill to validate
 * @param {ValidationError[]} errors - Array to collect errors
 */
export function validateSkillId(skill: SkillDefinition, errors: ValidationError[]): void {
  if (!skill.id || skill.id.trim() === '') {
    errors.push({
      field: 'id',
      message: 'Skill ID is required',
      code: 'MISSING_ID',
      severity: 'error',
      category: 'schema' as const,
    });
  } else if (skill.id.length > VALIDATION_THRESHOLDS.MAX_FIELD_LENGTH) {
    errors.push({
      field: 'id',
      message: `Skill ID cannot exceed ${VALIDATION_THRESHOLDS.MAX_FIELD_LENGTH} characters`,
      code: 'INVALID_ID_LENGTH',
      severity: 'error',
      category: 'schema' as const,
    });
  }
}

/**
 * Validate skill name field
 * @param {SkillDefinition} skill - Skill to validate
 * @param {ValidationError[]} errors - Array to collect errors
 */
export function validateSkillName(skill: SkillDefinition, errors: ValidationError[]): void {
  if (!skill.name || skill.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Skill name is required',
      code: 'MISSING_NAME',
      severity: 'error',
      category: 'schema' as const,
    });
  } else if (skill.name.length > VALIDATION_THRESHOLDS.MAX_FIELD_LENGTH) {
    errors.push({
      field: 'name',
      message: `Skill name cannot exceed ${VALIDATION_THRESHOLDS.MAX_FIELD_LENGTH} characters`,
      code: 'INVALID_NAME_LENGTH',
      severity: 'error',
      category: 'schema' as const,
    });
  }
}

/**
 * Validate skill description field
 * @param {SkillDefinition} skill - Skill to validate
 * @param {ValidationError[]} errors - Array to collect errors
 */
export function validateSkillDescription(skill: SkillDefinition, errors: ValidationError[]): void {
  if (!skill.description || skill.description.trim() === '') {
    errors.push({
      field: 'description',
      message: 'Skill description is required',
      code: 'MISSING_DESCRIPTION',
      severity: 'error',
      category: 'schema' as const,
    });
  }
}

/**
 * Validate skill version field
 * @param {SkillDefinition} skill - Skill to validate
 * @param {ValidationError[]} errors - Array to collect errors
 */
export function validateSkillVersion(skill: SkillDefinition, errors: ValidationError[]): void {
  if (!skill.version || skill.version.trim() === '') {
    errors.push({
      field: 'version',
      message: 'Skill version is required',
      code: 'MISSING_VERSION',
      severity: 'error',
      category: 'schema' as const,
    });
  }
}

/**
 * Validate skill category field
 * @param {SkillDefinition} skill - Skill to validate
 * @param {ValidationError[]} errors - Array to collect errors
 */
export function validateSkillCategory(skill: SkillDefinition, errors: ValidationError[]): void {
  if (!skill.category || skill.category.trim() === '') {
    errors.push({
      field: 'category',
      message: 'Skill category is required',
      code: 'MISSING_CATEGORY',
      severity: 'error',
      category: 'schema' as const,
    });
  }
}

/**
 * Validate skill capabilities field
 * @param {SkillDefinition} skill - Skill to validate
 * @param {ValidationError[]} errors - Array to collect errors
 */
export function validateSkillCapabilities(skill: SkillDefinition, errors: ValidationError[]): void {
  if (!skill.capabilities || skill.capabilities.length === 0) {
    errors.push({
      field: 'capabilities',
      message: 'Skill must have at least one capability',
      code: 'MISSING_CAPABILITIES',
      severity: 'error',
      category: 'schema' as const,
    });
  } else {
    for (const [index, capability] of skill.capabilities.entries()) {
      if (!capability.name || capability.name.trim() === '') {
        errors.push({
          field: `capabilities[${index}].name`,
          message: 'Capability name is required',
          code: 'MISSING_CAPABILITY_NAME',
          severity: 'error',
          category: 'schema' as const,
        });
      }
    }
  }
}

/**
 * Validate skill dependencies field
 * @param {SkillDefinition} skill - Skill to validate
 * @param {ValidationError[]} errors - Array to collect errors
 */
export function validateSkillDependencies(skill: SkillDefinition, errors: ValidationError[]): void {
  if (!skill.dependencies || skill.dependencies.length > VALIDATION_THRESHOLDS.MAX_SKILL_COUNT) {
    errors.push({
      field: 'dependencies',
      message: `Skill cannot have more than ${VALIDATION_THRESHOLDS.MAX_SKILL_COUNT} dependencies`,
      code: 'TOO_MANY_DEPENDENCIES',
      severity: 'error',
      category: 'dependencies' as const,
    });
  }
}

/**
 * Validate skill metadata field
 * @param {SkillDefinition} skill - Skill to validate
 * @param {ValidationError[]} errors - Array to collect errors
 */
export function validateSkillMetadata(skill: SkillDefinition, errors: ValidationError[]): void {
  if (!skill.metadata) {
    errors.push({
      field: 'metadata',
      message: 'Skill metadata is required',
      code: 'MISSING_METADATA',
      severity: 'error',
      category: 'schema' as const,
    });
    return;
  }

  if (!skill.metadata.author || skill.metadata.author.trim() === '') {
    errors.push({
      field: 'metadata.author',
      message: 'Skill author is required',
      code: 'MISSING_AUTHOR',
      severity: 'error',
      category: 'schema' as const,
    });
  }

  if (!skill.metadata.tags || skill.metadata.tags.length === 0) {
    errors.push({
      field: 'metadata.tags',
      message: 'Skill must have at least one tag',
      code: 'MISSING_TAGS',
      severity: 'warning' as const,
      category: 'documentation' as const,
    });
  }
}
