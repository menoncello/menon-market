/**
 * Validation Rule Definitions
 * Contains all default validation rule definitions used by SkillValidator
 */

import { CompatibilityValidator } from './compatibility-validator';
import { createPerformanceValidationRule } from './performance-validation-rules';
import type { SkillDefinition, ValidationError } from './types';
import { isValidVersion } from './validation-constants';
import { SkillValidationRule, createValidationRule } from './validation-rules';

/**
 * Creates and returns all default validation rules
 * @returns {SkillValidationRule[]} Array of default validation rules
 */
export function createDefaultValidationRules(): SkillValidationRule[] {
  const compatibilityValidator = new CompatibilityValidator();

  return [
    // Basic identity rules
    createSkillIdRequiredRule(),
    createSkillNameRequiredRule(),

    // Content schema rules
    createSkillDescriptionRequiredRule(),
    createSkillVersionFormatRule(),

    // Performance rules
    createPerformanceValidationRule(),

    // Compatibility rules
    createCompatibilityRequiredRule(compatibilityValidator),

    // Capability rules
    createCapabilitiesRequiredRule(),

    // Example rules
    createExamplesRecommendedRule(),

    // Metadata rules
    createResourcesRecommendedRule(),
    createTagsRecommendedRule(),
  ];
}

/**
 * Create skill ID validation rule
 * @returns {SkillValidationRule} The skill ID validation rule that validates presence and non-empty value
 */
function createSkillIdRequiredRule(): SkillValidationRule {
  return createValidationRule()
    .withId('skill-id-required')
    .withCategory('schema')
    .withDescription('Skill ID is required and must be non-empty')
    .withValidator((skill: SkillDefinition): ValidationError[] => {
      if (!skill.id || skill.id.trim() === '') {
        const errors: ValidationError[] = [
          {
            category: 'schema',
            message: 'Skill ID is required',
            severity: 'error',
            suggestion: 'Provide a unique identifier for the skill',
          },
        ];
        return errors;
      }
      return [];
    })
    .withSeverity('error')
    .withRequired(true)
    .build();
}

/**
 * Create skill name validation rule
 * @returns {SkillValidationRule} The skill name validation rule that validates presence and non-empty value
 */
function createSkillNameRequiredRule(): SkillValidationRule {
  return createValidationRule()
    .withId('skill-name-required')
    .withCategory('schema')
    .withDescription('Skill name is required and must be non-empty')
    .withValidator((skill: SkillDefinition): ValidationError[] => {
      if (!skill.name || skill.name.trim() === '') {
        return [
          {
            category: 'schema',
            message: 'Skill name is required',
            severity: 'error',
            suggestion: 'Provide a human-readable name for the skill',
          },
        ];
      }
      return [];
    })
    .withSeverity('error')
    .withRequired(true)
    .build();
}

/**
 * Create skill description validation rule
 * @returns {SkillValidationRule} The skill description validation rule that validates presence and non-empty value
 */
function createSkillDescriptionRequiredRule(): SkillValidationRule {
  return createValidationRule()
    .withId('skill-description-required')
    .withCategory('schema')
    .withDescription('Skill description is required')
    .withValidator((skill: SkillDefinition): ValidationError[] => {
      if (!skill.description || skill.description.trim() === '') {
        return [
          {
            category: 'schema',
            message: 'Skill description is required',
            severity: 'error',
            suggestion: "Provide a detailed description of the skill's purpose and capabilities",
          },
        ];
      }
      return [];
    })
    .withSeverity('error')
    .withRequired(true)
    .build();
}

/**
 * Create skill version format validation rule
 * @returns {SkillValidationRule} The skill version format validation rule that validates semantic versioning compliance
 */
function createSkillVersionFormatRule(): SkillValidationRule {
  return createValidationRule()
    .withId('skill-version-format')
    .withCategory('schema')
    .withDescription('Skill version must follow semantic versioning')
    .withValidator((skill: SkillDefinition): ValidationError[] => {
      if (!skill.version || !isValidVersion(skill.version)) {
        return [
          {
            category: 'schema',
            message: 'Invalid skill version format. Use semantic versioning (e.g., 1.0.0)',
            severity: 'error',
            suggestion: 'Update version to follow semantic versioning pattern',
          },
        ];
      }
      return [];
    })
    .withSeverity('error')
    .withRequired(true)
    .build();
}

/**
 * Create compatibility validation rule
 * @param {CompatibilityValidator} compatibilityValidator - The compatibility validator instance to use for validation
 * @returns {SkillValidationRule} The compatibility validation rule that validates agent compatibility completeness
 */
function createCompatibilityRequiredRule(
  compatibilityValidator: CompatibilityValidator
): SkillValidationRule {
  return createValidationRule()
    .withId('compatibility-required')
    .withCategory('compatibility')
    .withDescription('Skill must have at least one agent compatibility')
    .withValidator((skill: SkillDefinition): ValidationError[] => {
      const result = compatibilityValidator.validateCompatibilityCompleteness(skill);
      return result.issues;
    })
    .withSeverity('error')
    .withRequired(true)
    .build();
}

/**
 * Create capabilities validation rule
 * @returns {SkillValidationRule} The capabilities validation rule that validates presence of at least one capability
 */
function createCapabilitiesRequiredRule(): SkillValidationRule {
  return createValidationRule()
    .withId('capabilities-required')
    .withCategory('schema')
    .withDescription('Skill must have at least one capability')
    .withValidator((skill: SkillDefinition): ValidationError[] => {
      if (!skill.capabilities || skill.capabilities.length === 0) {
        return [
          {
            category: 'schema',
            message: 'Skill must have at least one capability',
            severity: 'error',
            suggestion: 'Define the specific capabilities and features this skill provides',
          },
        ];
      }
      return [];
    })
    .withSeverity('error')
    .withRequired(true)
    .build();
}

/**
 * Create examples recommended rule
 * @returns {SkillValidationRule} The examples recommended rule that validates presence of usage examples
 */
function createExamplesRecommendedRule(): SkillValidationRule {
  return createValidationRule()
    .withId('examples-recommended')
    .withCategory('documentation')
    .withDescription('Skills should have usage examples')
    .withValidator((skill: SkillDefinition): ValidationError[] => {
      if (!skill.examples || skill.examples.length === 0) {
        return [
          {
            category: 'documentation',
            message: 'Skills should include usage examples',
            severity: 'warning',
            suggestion: 'Add examples showing how to use this skill effectively',
          },
        ];
      }
      return [];
    })
    .withSeverity('warning')
    .withRequired(false)
    .build();
}

/**
 * Create resources recommended rule
 * @returns {SkillValidationRule} The resources recommended rule that validates presence of learning resources
 */
function createResourcesRecommendedRule(): SkillValidationRule {
  return createValidationRule()
    .withId('resources-recommended')
    .withCategory('documentation')
    .withDescription('Skills should have learning resources')
    .withValidator((skill: SkillDefinition): ValidationError[] => {
      if (!skill.metadata.resources || skill.metadata.resources.length === 0) {
        return [
          {
            category: 'documentation',
            message: 'Skills should include learning resources',
            severity: 'warning',
            suggestion: 'Add documentation, tutorials, or other learning resources',
          },
        ];
      }
      return [];
    })
    .withSeverity('warning')
    .withRequired(false)
    .build();
}

/**
 * Create tags recommended rule
 * @returns {SkillValidationRule} The tags recommended rule that validates presence of descriptive tags
 */
function createTagsRecommendedRule(): SkillValidationRule {
  return createValidationRule()
    .withId('tags-recommended')
    .withCategory('documentation')
    .withDescription('Skills should have descriptive tags')
    .withValidator((skill: SkillDefinition): ValidationError[] => {
      if (!skill.metadata.tags || skill.metadata.tags.length === 0) {
        return [
          {
            category: 'documentation',
            message: 'Skills should include descriptive tags',
            severity: 'warning',
            suggestion: 'Add tags to help with skill discovery and categorization',
          },
        ];
      }
      return [];
    })
    .withSeverity('warning')
    .withRequired(false)
    .build();
}
