/**
 * Validation-related type definitions for skill validation and error handling
 */

import { ValidationCategory, ValidationSeverity } from './skill-types';

/**
 * Validation error details
 */
export interface ValidationError {
  /** Error category */
  category: ValidationCategory;

  /** Error message */
  message: string;

  /** Error severity */
  severity: ValidationSeverity;

  /** Location of error (if applicable) */
  location?: string;

  /** Suggested fix */
  suggestion?: string;

  /** Field that caused the error */
  field?: string;

  /** Error code for programmatic handling */
  code?: string;
}

/**
 * Validation warning details
 */
export interface ValidationWarning extends ValidationError {
  severity: 'warning';
  code?: string;
}

/**
 * Skill validation result
 */
export interface SkillValidationResult {
  /** Whether validation passed */
  valid: boolean;

  /** Validation errors */
  errors: ValidationError[];

  /** Validation warnings */
  warnings: ValidationWarning[];

  /** Validation score (0-100) */
  score: number;

  /** Validation timestamp */
  validatedAt: Date;
}
