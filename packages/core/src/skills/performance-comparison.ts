/**
 * Performance Comparison Utilities
 * Provides comparison functionality for skill performance characteristics
 */

import { PerformanceValidator, type PerformanceValidationResult } from './performance-validator';
import { SkillDefinition } from './types';

/** Fast execution time threshold in milliseconds */
const FAST_EXECUTION_THRESHOLD_MS = 10;

/** Slow execution time threshold in milliseconds */
const SLOW_EXECUTION_THRESHOLD_MS = 60;

/** High resource usage count threshold */
const HIGH_RESOURCE_COUNT_THRESHOLD = 2;

/**
 * Performance comparison result
 */
export interface PerformanceComparisonResult {
  /** Which skill has better performance */
  better: 'skill1' | 'skill2' | 'equal';

  /** Performance score for skill 1 */
  score1: number;

  /** Performance score for skill 2 */
  score2: number;

  /** Differences found between skills */
  differences: string[];
}

/**
 * Provides performance comparison functionality
 */
export class PerformanceComparisonService {
  private performanceValidator: PerformanceValidator;

  /**
   * Create a new performance comparison service
   */
  constructor() {
    this.performanceValidator = new PerformanceValidator();
  }

  /**
   * Compare performance between two skills
   * @param {SkillDefinition} skill1 - First skill to compare
   * @param {SkillDefinition} skill2 - Second skill to compare
   * @returns {PerformanceComparisonResult} Comparison result indicating which skill has better performance
   */
  comparePerformance(
    skill1: SkillDefinition,
    skill2: SkillDefinition
  ): PerformanceComparisonResult {
    const performanceScores = this.calculatePerformanceScores(skill1, skill2);
    const differences = this.analyzePerformanceDifferences(skill1, skill2);
    const betterResult = this.determineBetterPerformer(
      performanceScores.score1,
      performanceScores.score2
    );

    return {
      better: betterResult,
      score1: performanceScores.score1,
      score2: performanceScores.score2,
      differences,
    };
  }

  /**
   * Calculate performance scores for both skills
   * @param {SkillDefinition} skill1 - First skill
   * @param {SkillDefinition} skill2 - Second skill
   * @returns {{score1: number; score2: number}} Performance scores for both skills
   * @private
   */
  private calculatePerformanceScores(
    skill1: SkillDefinition,
    skill2: SkillDefinition
  ): {
    score1: number;
    score2: number;
  } {
    return {
      score1: this.performanceValidator.calculatePerformanceScore(skill1.performance),
      score2: this.performanceValidator.calculatePerformanceScore(skill2.performance),
    };
  }

  /**
   * Analyze performance differences between skills
   * @param {SkillDefinition} skill1 - First skill
   * @param {SkillDefinition} skill2 - Second skill
   * @returns {string[]} Array of performance difference descriptions
   * @private
   */
  private analyzePerformanceDifferences(
    skill1: SkillDefinition,
    skill2: SkillDefinition
  ): string[] {
    const differences: string[] = [];

    this.compareExecutionTimes(skill1, skill2, differences);
    this.compareResourceUsage(skill1, skill2, differences);
    this.compareComplexityCorrelation(skill1, skill2, differences);

    return differences;
  }

  /**
   * Compare execution times between skills
   * @param {SkillDefinition} skill1 - First skill
   * @param {SkillDefinition} skill2 - Second skill
   * @param {string[]} differences - Array to add difference descriptions to
   * @private
   */
  private compareExecutionTimes(
    skill1: SkillDefinition,
    skill2: SkillDefinition,
    differences: string[]
  ): void {
    if (skill1.performance.executionTime.max !== skill2.performance.executionTime.max) {
      const faster =
        skill1.performance.executionTime.max < skill2.performance.executionTime.max
          ? skill1.name
          : skill2.name;
      differences.push(`${faster} has faster maximum execution time`);
    }
  }

  /**
   * Compare resource usage between skills
   * @param {SkillDefinition} skill1 - First skill
   * @param {SkillDefinition} skill2 - Second skill
   * @param {string[]} differences - Array to add difference descriptions to
   * @private
   */
  private compareResourceUsage(
    skill1: SkillDefinition,
    skill2: SkillDefinition,
    differences: string[]
  ): void {
    const highResources1 = this.getHighResourceCount(skill1);
    const highResources2 = this.getHighResourceCount(skill2);
    if (highResources1 !== highResources2) {
      const lowerUsage = highResources1 < highResources2 ? skill1.name : skill2.name;
      differences.push(`${lowerUsage} has lower resource usage`);
    }
  }

  /**
   * Determine which skill has better performance
   * @param {number} score1 - Performance score of first skill
   * @param {number} score2 - Performance score of second skill
   * @returns {'skill1' | 'skill2' | 'equal'} Which skill has better performance
   * @private
   */
  private determineBetterPerformer(score1: number, score2: number): 'skill1' | 'skill2' | 'equal' {
    if (score1 > score2) {
      return 'skill1';
    }
    if (score2 > score1) {
      return 'skill2';
    }
    return 'equal';
  }

  /**
   * Compare multiple skills and rank them by performance
   * @param {SkillDefinition[]} skills - Array of skills to compare
   * @returns {Array<{skill: SkillDefinition; score: number; rank: number}>} Ranked array of skills from best to worst performance
   */
  rankSkillsByPerformance(skills: SkillDefinition[]): Array<{
    skill: SkillDefinition;
    score: number;
    rank: number;
  }> {
    const skillScores = skills.map(skill => ({
      skill,
      score: this.performanceValidator.calculatePerformanceScore(skill.performance),
    }));

    // Sort by score (descending)
    skillScores.sort((a, b) => b.score - a.score);

    // Add ranks
    return skillScores.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }

  /**
   * Get performance insights for a skill
   * @param {SkillDefinition} skill - Skill to analyze
   * @returns {{score: number; strengths: string[]; weaknesses: string[]; recommendations: string[]}} Detailed performance insights
   */
  getPerformanceInsights(skill: SkillDefinition): {
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } {
    const result: PerformanceValidationResult =
      this.performanceValidator.validatePerformance(skill);
    const score = this.performanceValidator.calculatePerformanceScore(skill.performance);

    const insights = this.analyzePerformanceCharacteristics(skill);

    return {
      score,
      strengths: insights.strengths,
      weaknesses: insights.weaknesses,
      recommendations: result.recommendations,
    };
  }

  /**
   * Analyze performance characteristics of a skill
   * @param {SkillDefinition} skill - Skill to analyze
   * @returns {{strengths: string[]; weaknesses: string[]}} Performance strengths and weaknesses
   * @private
   */
  private analyzePerformanceCharacteristics(skill: SkillDefinition): {
    strengths: string[];
    weaknesses: string[];
  } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Analyze execution time
    if (skill.performance.executionTime.max < FAST_EXECUTION_THRESHOLD_MS) {
      strengths.push('Fast execution time');
    } else if (skill.performance.executionTime.max > SLOW_EXECUTION_THRESHOLD_MS) {
      weaknesses.push('Long execution time');
    }

    // Analyze resource usage
    const highResourceCount = this.getHighResourceCount(skill);
    if (highResourceCount === 0) {
      strengths.push('Low resource usage');
    } else if (highResourceCount >= HIGH_RESOURCE_COUNT_THRESHOLD) {
      weaknesses.push('High resource usage in multiple areas');
    }

    // Analyze complexity
    if (skill.performance.complexity === 'simple') {
      strengths.push('Simple complexity level');
    } else if (skill.performance.complexity === 'expert') {
      weaknesses.push('Expert complexity level may require specialized knowledge');
    }

    return { strengths, weaknesses };
  }

  /**
   * Count high resource usage areas for a skill
   * @param {SkillDefinition} skill - Skill to analyze
   * @returns {number} Number of high resource usage areas
   */
  private getHighResourceCount(skill: SkillDefinition): number {
    let count = 0;
    if (skill.performance.resourceUsage.memory === 'high') count++;
    if (skill.performance.resourceUsage.cpu === 'high') count++;
    if (skill.performance.resourceUsage.network === 'high') count++;
    return count;
  }

  /**
   * Compare complexity vs resource usage correlation between skills
   * @param {SkillDefinition} skill1 - First skill
   * @param {SkillDefinition} skill2 - Second skill
   * @param {string[]} differences - Array to add difference descriptions to
   */
  private compareComplexityCorrelation(
    skill1: SkillDefinition,
    skill2: SkillDefinition,
    differences: string[]
  ): void {
    const skill1Mismatch = this.hasComplexityResourceMismatch(skill1);
    const skill2Mismatch = this.hasComplexityResourceMismatch(skill2);

    if (skill1Mismatch !== skill2Mismatch) {
      const better = skill1Mismatch ? skill2.name : skill1.name;
      differences.push(`${better} has more consistent complexity and resource usage correlation`);
    }
  }

  /**
   * Check if skill has complexity vs resource usage mismatch
   * @param {SkillDefinition} skill - Skill to check
   * @returns {boolean} True if there's a mismatch
   */
  private hasComplexityResourceMismatch(skill: SkillDefinition): boolean {
    return (
      skill.performance.complexity === 'simple' &&
      (skill.performance.resourceUsage.memory === 'high' ||
        skill.performance.resourceUsage.cpu === 'high')
    );
  }
}
