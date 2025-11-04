import { QUALITY_THRESHOLDS, TECHNICAL_DOMAINS } from '../constants.js';
import { PromptTechnique, PromptAnalysis } from '../types.js';

/**
 * Utility functions for handling prompt techniques
 */

/**
 *
 * @param technique
 */
export function getTechniqueEnhancement(technique: PromptTechnique): string | null {
  switch (technique) {
    case 'cot':
      return 'Add step-by-step reasoning instructions';
    case 'tot':
      return 'Structure as branching thought process';
    case 'self-consistency':
      return 'Request multiple approaches and consensus';
    case 'react':
      return 'Add thought-action-observation cycle';
    case 'graph-of-thought':
      return 'Structure as interconnected concept graph';
    default:
      return null;
  }
}

/**
 *
 * @param technique
 */
export function getTechniqueOptimization(technique: PromptTechnique): string | null {
  switch (technique) {
    case 'cot':
      return 'Structure with step-by-step reasoning format';
    case 'tot':
      return 'Add branching decision points and evaluation criteria';
    case 'self-consistency':
      return 'Request multiple approaches and consensus building';
    case 'react':
      return 'Include thought-action-observation cycle instructions';
    case 'graph-of-thought':
      return 'Structure as interconnected concept relationships';
    default:
      return null;
  }
}

/**
 *
 * @param analysis
 * @param techniques
 */
export function addComplexityBasedTechniques(
  analysis: PromptAnalysis,
  techniques: PromptTechnique[]
): void {
  if (analysis.complexity === 'high') {
    techniques.push('tot', 'graph-of-thought');
  }
}

/**
 *
 * @param analysis
 * @param techniques
 */
export function addDomainBasedTechniques(
  analysis: PromptAnalysis,
  techniques: PromptTechnique[]
): void {
  if (TECHNICAL_DOMAINS.includes(analysis.domain as string)) {
    techniques.push('cot');
  }
}

/**
 *
 * @param analysis
 * @param techniques
 */
export function addIntentBasedTechniques(
  analysis: PromptAnalysis,
  techniques: PromptTechnique[]
): void {
  if (analysis.intent.includes('solve') || analysis.intent.includes('create')) {
    techniques.push('react');
  }
}

/**
 *
 * @param analysis
 * @param techniques
 */
export function addQualityBasedTechniques(
  analysis: PromptAnalysis,
  techniques: PromptTechnique[]
): void {
  if (analysis.clarity < QUALITY_THRESHOLDS.ACCEPTABLE || analysis.specificity < QUALITY_THRESHOLDS.ACCEPTABLE) {
    techniques.push('self-consistency');
  }
}