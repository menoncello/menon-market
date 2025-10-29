import { PERFORMANCE_THRESHOLDS } from './performance-validator';
import { SkillDefinition } from './types';

/**
 * Performance scoring calculations
 */

/**
 * Scoring constants
 */
const SCORING_CONSTANTS = {
  MAX_SCORE: 100,
  MINUTES_THRESHOLD: 10,
  ERROR_HANDLING_RETRY_THRESHOLD: 3,
  ERROR_HANDLING_BASIC_RETRY_THRESHOLD: 1,
  SUCCESS_RATE_THRESHOLDS: {
    EXCELLENT: 0.9,
    GOOD: 0.8,
    ACCEPTABLE: 0.7,
  },
  ERROR_HANDLING_SCORES: {
    NO_HANDLING: 80,
    BASIC_HANDLING: 90,
    COMPREHENSIVE_HANDLING: 100,
    MINIMAL_HANDLING: 70,
  },
  CACHING_SCORES: {
    NO_STRATEGY: 80,
    CACHEABLE: 100,
    NOT_CACHEABLE: 90,
  },
} as const;

/**
 * Calculates execution time score component
 * @param {SkillDefinition} skill - The skill definition to score
 * @returns {number} Execution time score (0-100)
 */
export function calculateExecutionTimeScore(skill: SkillDefinition): number {
  if (!skill.estimatedExecutionTime) {
    return SCORING_CONSTANTS.MAX_SCORE; // No execution time specified, no penalty
  }

  const { EXECUTION_TIME_PENALTIES } = PERFORMANCE_THRESHOLDS.SCORING;
  let score = SCORING_CONSTANTS.MAX_SCORE;
  const minutes = skill.estimatedExecutionTime;

  if (minutes > PERFORMANCE_THRESHOLDS.EXECUTION_TIME.ERROR_MINUTES) {
    score -= EXECUTION_TIME_PENALTIES.OVER_300_MINUTES;
  } else if (minutes > PERFORMANCE_THRESHOLDS.EXECUTION_TIME.WARNING_MINUTES) {
    score -= EXECUTION_TIME_PENALTIES.OVER_60_MINUTES;
  } else if (minutes > SCORING_CONSTANTS.MINUTES_THRESHOLD) {
    score -= EXECUTION_TIME_PENALTIES.OVER_10_MINUTES;
  }

  return Math.max(0, score);
}

/**
 * Calculates resource usage score component
 * @param {SkillDefinition} skill - The skill definition to score
 * @returns {number} Resource usage score (0-100)
 */
export function calculateResourceUsageScore(skill: SkillDefinition): number {
  if (!skill.resourceRequirements) {
    return SCORING_CONSTANTS.MAX_SCORE; // No resource requirements specified, no penalty
  }

  const highResourceCount = Object.values(skill.resourceRequirements).filter(
    level => level === 'high'
  ).length;

  let score = SCORING_CONSTANTS.MAX_SCORE;
  score -= highResourceCount * PERFORMANCE_THRESHOLDS.SCORING.RESOURCE_HIGH_PENALTY;

  return Math.max(0, score);
}

/**
 * Calculates complexity score component
 * @param {SkillDefinition} skill - The skill definition to score
 * @returns {number} Complexity score (0-100)
 */
export function calculateComplexityScore(skill: SkillDefinition): number {
  if (!skill.complexity) {
    return SCORING_CONSTANTS.MAX_SCORE; // No complexity specified, no penalty
  }

  const { COMPLEXITY_PENALTIES } = PERFORMANCE_THRESHOLDS.SCORING;
  let score = SCORING_CONSTANTS.MAX_SCORE;

  if (skill.performance.complexity === 'expert') {
    score -= COMPLEXITY_PENALTIES.EXPERT;
  } else if (skill.performance.complexity === 'complex') {
    score -= COMPLEXITY_PENALTIES.COMPLEX;
  }

  return Math.max(0, score);
}

/**
 * Calculates success rate score component
 * @param {SkillDefinition} skill - The skill definition to score
 * @returns {number} Success rate score (0-100)
 */
export function calculateSuccessRateScore(skill: SkillDefinition): number {
  if (skill.expectedSuccessRate === undefined) {
    return SCORING_CONSTANTS.MAX_SCORE; // No success rate specified, no penalty
  }

  const { SUCCESS_RATE_PENALTIES } = PERFORMANCE_THRESHOLDS.SCORING;
  let score = SCORING_CONSTANTS.MAX_SCORE;
  const successRate = skill.expectedSuccessRate;

  if (successRate < SCORING_CONSTANTS.SUCCESS_RATE_THRESHOLDS.ACCEPTABLE) {
    score -= SUCCESS_RATE_PENALTIES.BELOW_70;
  } else if (successRate < SCORING_CONSTANTS.SUCCESS_RATE_THRESHOLDS.GOOD) {
    score -= SUCCESS_RATE_PENALTIES.BELOW_80;
  } else if (successRate < SCORING_CONSTANTS.SUCCESS_RATE_THRESHOLDS.EXCELLENT) {
    score -= SUCCESS_RATE_PENALTIES.BELOW_90;
  }

  return Math.max(0, score);
}

/**
 * Calculates error handling score component
 * @param {SkillDefinition} skill - The skill definition to score
 * @returns {number} Error handling score (0-100)
 */
export function calculateErrorHandlingScore(skill: SkillDefinition): number {
  if (skill.errorHandling === undefined) {
    return SCORING_CONSTANTS.ERROR_HANDLING_SCORES.NO_HANDLING; // No error handling specified, minor penalty
  }

  if (skill.errorHandling && typeof skill.errorHandling === 'object') {
    if (skill.errorHandling.retries > SCORING_CONSTANTS.ERROR_HANDLING_RETRY_THRESHOLD) {
      return SCORING_CONSTANTS.ERROR_HANDLING_SCORES.COMPREHENSIVE_HANDLING;
    } else if (
      skill.errorHandling.retries > SCORING_CONSTANTS.ERROR_HANDLING_BASIC_RETRY_THRESHOLD
    ) {
      return SCORING_CONSTANTS.ERROR_HANDLING_SCORES.BASIC_HANDLING;
    }
    return SCORING_CONSTANTS.ERROR_HANDLING_SCORES.MINIMAL_HANDLING;
  }
  return SCORING_CONSTANTS.ERROR_HANDLING_SCORES.NO_HANDLING; // No error handling specified
}

/**
 * Calculates caching score component
 * @param {SkillDefinition} skill - The skill definition to score
 * @returns {number} Caching score (0-100)
 */
export function calculateCachingScore(skill: SkillDefinition): number {
  if (skill.cacheable === undefined) {
    return SCORING_CONSTANTS.CACHING_SCORES.NO_STRATEGY; // No caching strategy specified, minor penalty
  }

  if (skill.cacheable === true) {
    return SCORING_CONSTANTS.CACHING_SCORES.CACHEABLE;
  }
  return SCORING_CONSTANTS.CACHING_SCORES.NOT_CACHEABLE; // Not cacheable, but strategy defined
}

/**
 * Calculates overall performance score
 * @param {SkillDefinition} skill - The skill definition to score
 * @returns {number} Overall performance score (0-100)
 */
export function calculateOverallPerformanceScore(skill: SkillDefinition): number {
  const scores = [
    calculateExecutionTimeScore(skill),
    calculateResourceUsageScore(skill),
    calculateComplexityScore(skill),
    calculateSuccessRateScore(skill),
    calculateErrorHandlingScore(skill),
    calculateCachingScore(skill),
  ];

  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  return Math.round(totalScore / scores.length);
}
