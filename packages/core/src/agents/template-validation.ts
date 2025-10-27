/**
 * Template validation utilities
 * Provides validation functionality for agent template customizations
 */

import { AgentTemplate, CustomizationOption, ValidationRule } from './types';

/**
 * Merges customizations with default values from template options
 * @param template - The agent template
 * @param customizations - User-provided customizations
 * @returns Merged customizations object
 */
function mergeCustomizationsWithDefaults(
  template: AgentTemplate,
  customizations: Record<string, unknown>
): Record<string, unknown> {
  const mergedCustomizations: Record<string, unknown> = {};

  // Apply default values from template customization options
  for (const option of template.customizationOptions) {
    mergedCustomizations[option.id] = customizations[option.id] ?? option.defaultValue;
  }

  // Apply any additional customizations not in template options
  for (const [key, value] of Object.entries(customizations)) {
    if (!(key in mergedCustomizations)) {
      mergedCustomizations[key] = value;
    }
  }

  return mergedCustomizations;
}

/**
 * Validates if a value matches the expected type
 * @param value - The value to validate
 * @param expectedType - The expected type
 * @param fieldName - Field name for error messages
 * @returns Array of error messages
 */
function validateType(value: unknown, expectedType: string, fieldName: string): string[] {
  const errors: string[] = [];

  switch (expectedType) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push(`${fieldName} must be a string`);
      }
      break;
    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${fieldName} must be a number`);
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`${fieldName} must be a boolean`);
      }
      break;
    case 'array':
      if (!Array.isArray(value)) {
        errors.push(`${fieldName} must be an array`);
      }
      break;
    case 'object':
      if (typeof value !== 'object' || Array.isArray(value) || value === null) {
        errors.push(`${fieldName} must be an object`);
      }
      break;
  }

  return errors;
}

/**
 * Validates custom validation rules for a field
 * @param value - The value to validate
 * @param fieldName - Field name for error messages
 * @param validation - Array of validation rules
 * @returns Array of error messages
 */
function validateMinRule(value: unknown, rule: ValidationRule, _fieldName: string): string[] {
  const errors: string[] = [];

  if (typeof value === 'string') {
    const minLength = rule.params.length as number;
    if (value.length < minLength) {
      errors.push(rule.message);
    }
  } else if (typeof value === 'number') {
    const minValue = rule.params.value as number;
    if (value < minValue) {
      errors.push(rule.message);
    }
  }

  return errors;
}

function validateMaxRule(value: unknown, rule: ValidationRule, _fieldName: string): string[] {
  const errors: string[] = [];

  if (typeof value === 'string') {
    const maxLength = rule.params.length as number;
    if (value.length > maxLength) {
      errors.push(rule.message);
    }
  } else if (typeof value === 'number') {
    const maxValue = rule.params.value as number;
    if (value > maxValue) {
      errors.push(rule.message);
    }
  }

  return errors;
}

function validateEnumRule(value: unknown, rule: ValidationRule, _fieldName: string): string[] {
  const errors: string[] = [];

  if (typeof value === 'string') {
    const allowedValues = rule.params.values as string[];
    if (!Array.isArray(allowedValues) || !allowedValues.includes(value)) {
      errors.push(rule.message);
    }
  }

  return errors;
}

function validateCustomRules(
  value: unknown,
  fieldName: string,
  validation: ValidationRule[]
): string[] {
  const errors: string[] = [];

  for (const rule of validation) {
    switch (rule.type) {
      case 'min':
        errors.push(...validateMinRule(value, rule, fieldName));
        break;
      case 'max':
        errors.push(...validateMaxRule(value, rule, fieldName));
        break;
      case 'enum':
        errors.push(...validateEnumRule(value, rule, fieldName));
        break;
    }
  }

  return errors;
}

/**
 * Validates required fields and null values
 * @param option - Template customization option
 * @param value - The value to validate
 * @param customizations - Original customizations to check for explicit null
 * @returns Array of error messages, or empty if valid
 */
function validateRequiredFields(
  option: CustomizationOption,
  value: unknown,
  customizations: Record<string, unknown>
): string[] {
  const errors: string[] = [];

  // Check required options (after merging with defaults)
  if (option.required && (value === undefined || value === null || value === '')) {
    errors.push(`${option.name} is required`);
    return errors;
  }

  // Check if user explicitly provided null for a required field
  if (option.required && customizations[option.id] === null) {
    errors.push(`${option.name} cannot be null`);
    return errors;
  }

  // Skip validation if value is not provided and not required
  if (value === undefined && !option.required) {
    return [];
  }

  return errors;
}

/**
 * Validates a single customization option
 * @param option - The template customization option
 * @param value - The value to validate
 * @param customizations - Original customizations object
 * @returns Array of error messages
 */
function validateSingleOption(
  option: CustomizationOption,
  value: unknown,
  customizations: Record<string, unknown>
): string[] {
  // First validate required fields
  const requiredErrors = validateRequiredFields(option, value, customizations);
  if (requiredErrors.length > 0) {
    return requiredErrors;
  }

  // Skip type validation if value is undefined (already handled by required check)
  if (value === undefined) {
    return [];
  }

  const errors: string[] = [];

  // Type validation
  const typeErrors = validateType(value, option.type, option.name);
  errors.push(...typeErrors);

  // Custom validation rules
  if (option.validation) {
    const customErrors = validateCustomRules(value, option.name, option.validation);
    errors.push(...customErrors);
  }

  return errors;
}

/**
 * Validate customization options against template
 * @param template - The agent template to validate against
 * @param customizations - The customizations to validate
 * @returns Validation result with validity flag and error messages
 */
export function validateCustomizations(
  template: AgentTemplate,
  customizations: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Merge customizations with default values before validation
  const mergedCustomizations = mergeCustomizationsWithDefaults(template, customizations);

  // Validate each customization option
  for (const option of template.customizationOptions) {
    const value = mergedCustomizations[option.id];
    const optionErrors = validateSingleOption(option, value, customizations);
    errors.push(...optionErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
