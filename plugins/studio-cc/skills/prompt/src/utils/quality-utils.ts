import { QUALITY_THRESHOLDS, ANALYSIS_THRESHOLDS, REASONING_TEMPLATES } from '../constants.js';
import { PromptTechnique, PromptAnalysis } from '../types.js';
import { getTechniqueEnhancement, getTechniqueOptimization } from './technique-utils.js';

/**
 * Utility functions for handling quality-based enhancements
 */

/**
 *
 * @param analysis
 * @param enhancements
 */
export function addQualityBasedEnhancements(analysis: PromptAnalysis, enhancements: string[]): void {
  if (analysis.clarity < QUALITY_THRESHOLDS.ACCEPTABLE) {
    enhancements.push('Add specific details and clear action verbs');
    enhancements.push('Define the desired output format explicitly');
  }

  if (analysis.specificity < QUALITY_THRESHOLDS.ACCEPTABLE) {
    enhancements.push('Include concrete examples and constraints');
    enhancements.push('Specify success criteria and requirements');
  }

  if (analysis.completeness < QUALITY_THRESHOLDS.ACCEPTABLE) {
    enhancements.push('Add context and background information');
    enhancements.push('Include relevant domain-specific terminology');
  }
}

/**
 *
 * @param techniques
 * @param enhancements
 */
export function addTechniqueBasedEnhancements(techniques: PromptTechnique[], enhancements: string[]): void {
  for (const technique of techniques) {
    const enhancement = getTechniqueEnhancement(technique);
    if (enhancement) {
      enhancements.push(enhancement);
    }
  }
}

/**
 *
 * @param analysis
 * @param optimizations
 */
export function addBasicOptimizations(analysis: PromptAnalysis, optimizations: string[]): void {
  if (analysis.clarity < ANALYSIS_THRESHOLDS.HIGH_QUALITY) {
    optimizations.push('Add explicit action verbs and clear instructions');
  }

  if (analysis.specificity < ANALYSIS_THRESHOLDS.HIGH_QUALITY) {
    optimizations.push('Include specific examples and success criteria');
  }

  if (analysis.completeness < ANALYSIS_THRESHOLDS.HIGH_QUALITY) {
    optimizations.push('Add context, constraints, and expected outcomes');
  }
}

/**
 *
 * @param techniques
 * @param optimizations
 */
export function addTechniqueOptimizations(techniques: PromptTechnique[], optimizations: string[]): void {
  for (const technique of techniques) {
    const optimization = getTechniqueOptimization(technique);
    if (optimization) {
      optimizations.push(optimization);
    }
  }
}

/**
 *
 * @param analysis
 * @param reasoning
 */
export function addQualityReasoning(analysis: PromptAnalysis, reasoning: string[]): void {
  if (analysis.clarity < QUALITY_THRESHOLDS.ACCEPTABLE) {
    reasoning.push(REASONING_TEMPLATES.CLARITY_ENHANCEMENT);
  }

  if (analysis.specificity < QUALITY_THRESHOLDS.ACCEPTABLE) {
    reasoning.push(REASONING_TEMPLATES.SPECIFICITY_IMPROVEMENT);
  }

  if (analysis.completeness < QUALITY_THRESHOLDS.ACCEPTABLE) {
    reasoning.push(REASONING_TEMPLATES.COMPLETENESS_INCREASE);
  }
}