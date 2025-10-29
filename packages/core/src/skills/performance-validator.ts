/**
 * Skill Performance Validator
 * Provides validation for skill performance characteristics and resource usage
 */

import {
  validateExecutionTimeExpectations,
  validateResourceUsagePatterns,
  validateComplexityResourceAlignment,
  validateSuccessRateExpectations,
  validateErrorHandling,
  validateCachingStrategy,
} from './performance-rules';
import { calculateOverallPerformanceScore } from './performance-scoring';
import { SkillDefinition, type SkillPerformance, ValidationError } from './types';

/**
 * Performance validation result
 */
export interface PerformanceValidationResult {
  /** Whether performance characteristics are valid */
  valid: boolean;

  /** Performance issues found */
  issues: ValidationError[];

  /** Performance score (0-100) */
  score: number;

  /** Performance recommendations */
  recommendations: string[];
}

/**
 * Performance metrics and thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  EXECUTION_TIME: {
    /** Warning threshold for execution time (1 hour in minutes) */
    WARNING_MINUTES: 60,
    /** Error threshold for execution time (5 hours in minutes) */
    ERROR_MINUTES: 300,
  },
  RESOURCE_USAGE: {
    /** Number of high resource usage areas before warning */
    HIGH_COUNT_THRESHOLD: 2,
  },
  COMPLEXITY_MISMATCH: {
    /** Resources that shouldn't be high for simple skills */
    SIMPLE_MAX_RESOURCES: ['memory', 'CPU', 'network'],
  },
  SCORING: {
    EXECUTION_TIME_PENALTIES: {
      /** Penalty for execution time over 300 minutes */
      OVER_300_MINUTES: 30,
      /** Penalty for execution time over 60 minutes */
      OVER_60_MINUTES: 15,
      /** Penalty for execution time over 10 minutes */
      OVER_10_MINUTES: 5,
    },
    /** Penalty for high resource usage */
    RESOURCE_HIGH_PENALTY: 10,
    COMPLEXITY_PENALTIES: {
      /** Penalty for expert complexity */
      EXPERT: 5,
      /** Penalty for complex complexity */
      COMPLEX: 3,
    },
    SUCCESS_RATE_PENALTIES: {
      /** Penalty for success rate below 70% */
      BELOW_70: 20,
      /** Penalty for success rate below 80% */
      BELOW_80: 10,
      /** Penalty for success rate below 90% */
      BELOW_90: 5,
    },
  },
} as const;

/**
 * Performance recommendation thresholds
 */
const PERFORMANCE_RECOMMENDATIONS = {
  /** Long execution time threshold (minutes) */
  LONG_EXECUTION_THRESHOLD: 60,
  /** Multiple high resources threshold */
  MULTIPLE_HIGH_RESOURCES_THRESHOLD: 1,
  /** Low success rate threshold */
  LOW_SUCCESS_RATE_THRESHOLD: 0.8,
} as const;

/**
 * Performance validator for skill definitions
 */
export class PerformanceValidator {
  /**
   * Validates skill performance characteristics
   * @param {SkillDefinition} skill - The skill definition to validate
   * @returns {PerformanceValidationResult} Performance validation result
   */
  validatePerformance(skill: SkillDefinition): PerformanceValidationResult {
    const issues: ValidationError[] = [];

    // Run all validation rules
    this.performValidationSteps(skill, issues);

    const score = calculateOverallPerformanceScore(skill);
    const recommendations = this.generateRecommendations(skill, issues);

    return {
      valid: issues.filter(issue => issue.severity === 'error').length === 0,
      issues,
      score,
      recommendations,
    };
  }

  /**
   * Perform all validation steps for performance characteristics
   * @param {SkillDefinition} skill - The skill definition to validate
   * @param {ValidationError[]} issues - Array to collect validation issues
   * @private
   */
  private performValidationSteps(skill: SkillDefinition, issues: ValidationError[]): void {
    validateExecutionTimeExpectations(skill, issues);
    validateResourceUsagePatterns(skill, issues);
    validateComplexityResourceAlignment(skill, issues);
    validateSuccessRateExpectations(skill, issues);
    validateErrorHandling(skill, issues);
    validateCachingStrategy(skill, issues);
  }

  /**
   * Generate performance improvement recommendations
   * @param {SkillDefinition} skill - The skill definition
   * @param {ValidationError[]} issues - Validation issues found
   * @returns {string[]} Array of recommendations
   * @private
   */
  private generateRecommendations(skill: SkillDefinition, issues: ValidationError[]): string[] {
    const recommendations: string[] = [];

    this.addIssueBasedRecommendations(issues, recommendations);
    this.addExecutionTimeRecommendations(skill, recommendations);
    this.addResourceUsageRecommendations(skill, recommendations);
    this.addSuccessRateRecommendations(skill, recommendations);

    return recommendations;
  }

  /**
   * Add recommendations based on validation issues
   * @param {ValidationError[]} issues - Validation issues found
   * @param {string[]} recommendations - Array to collect recommendations
   * @private
   */
  private addIssueBasedRecommendations(issues: ValidationError[], recommendations: string[]): void {
    for (const issue of issues) {
      if (issue.severity === 'error') {
        recommendations.push(`Critical: ${issue.message}`);
      } else if (issue.severity === 'warning') {
        recommendations.push(`Consider: ${issue.message}`);
      }
    }
  }

  /**
   * Add recommendations based on execution time
   * @param {SkillDefinition} skill - The skill definition
   * @param {string[]} recommendations - Array to collect recommendations
   * @private
   */
  private addExecutionTimeRecommendations(skill: SkillDefinition, recommendations: string[]): void {
    if (
      skill.estimatedExecutionTime &&
      skill.estimatedExecutionTime > PERFORMANCE_RECOMMENDATIONS.LONG_EXECUTION_THRESHOLD
    ) {
      recommendations.push('Consider breaking down long-running skills into smaller components');
    }
  }

  /**
   * Add recommendations based on resource usage
   * @param {SkillDefinition} skill - The skill definition
   * @param {string[]} recommendations - Array to collect recommendations
   * @private
   */
  private addResourceUsageRecommendations(skill: SkillDefinition, recommendations: string[]): void {
    if (!skill.resourceRequirements) return;

    const highResources = Object.entries(skill.resourceRequirements)
      .filter(([_, level]) => level === 'high')
      .map(([resource]) => resource);

    if (highResources.length > PERFORMANCE_RECOMMENDATIONS.MULTIPLE_HIGH_RESOURCES_THRESHOLD) {
      recommendations.push(`Monitor ${highResources.join(', ')} usage closely during execution`);
    }
  }

  /**
   * Add recommendations based on success rate
   * @param {SkillDefinition} skill - The skill definition
   * @param {string[]} recommendations - Array to collect recommendations
   * @private
   */
  private addSuccessRateRecommendations(skill: SkillDefinition, recommendations: string[]): void {
    if (
      skill.expectedSuccessRate !== undefined &&
      skill.expectedSuccessRate < PERFORMANCE_RECOMMENDATIONS.LOW_SUCCESS_RATE_THRESHOLD
    ) {
      recommendations.push('Implement comprehensive error handling to improve success rate');
    }
  }

  /**
   * Calculate performance score for a skill's performance characteristics
   * @param {SkillPerformance} performance - Performance characteristics to score
   * @returns {number} Performance score (0-100)
   */
  calculatePerformanceScore(performance: SkillPerformance): number {
    return calculateOverallPerformanceScore({ performance } as SkillDefinition);
  }
}

/**
 * Create a performance validator instance
 * @returns {PerformanceValidator} Performance validator instance
 */
export function createPerformanceValidator(): PerformanceValidator {
  return new PerformanceValidator();
}

/**
 * Validate skill performance characteristics (convenience function)
 * @param {SkillDefinition} skill - The skill definition to validate
 * @returns {PerformanceValidationResult} Performance validation result
 */
export function validateSkillPerformance(skill: SkillDefinition): PerformanceValidationResult {
  const validator = createPerformanceValidator();
  return validator.validatePerformance(skill);
}
