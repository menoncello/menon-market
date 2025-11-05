import { TEMPLATE_SECTIONS, FRAMEWORK_TYPES } from '../constants.js';
import { PromptAnalysis, PromptTechnique } from '../types.js';

/**
 * Utility functions for template generation
 */

/**
 * Generates a template structure based on the provided analysis
 * @param {PromptAnalysis} analysis - The prompt analysis object containing complexity and domain information
 * @returns {string} The generated template structure string
 */
export function generateTemplateStructure(analysis: PromptAnalysis): string {
  let structure = '';

  structure += TEMPLATE_SECTIONS.ROLE_DEFINITION;
  structure += TEMPLATE_SECTIONS.CONTEXT;
  structure += TEMPLATE_SECTIONS.TASK;
  structure += TEMPLATE_SECTIONS.REQUIREMENTS;
  structure += TEMPLATE_SECTIONS.CONSTRAINTS;
  structure += TEMPLATE_SECTIONS.OUTPUT_FORMAT;

  // Add technique-specific structure
  if (analysis.complexity === 'high') {
    structure += TEMPLATE_SECTIONS.HIGH_COMPLEXITY_APPROACH;
  }

  return structure;
}

/**
 * Extracts placeholder strings from the prompt analysis
 * @param {PromptAnalysis} _analysis - The prompt analysis object (parameter currently unused but kept for future use)
 * @returns {string[]} Array of placeholder strings used in templates
 */
export function extractPlaceholders(_analysis: PromptAnalysis): string[] {
  return [
    'role',
    'domain',
    'context',
    'task',
    'requirements',
    'constraints',
    'outputFormat',
    'examples',
    'expertiseLevel',
  ];
}

/**
 * Generates domain-specific examples based on the analysis
 * @param {PromptAnalysis} analysis - The prompt analysis object containing domain information
 * @returns {string[]} Array of example strings relevant to the domain
 */
export function generateExamples(analysis: PromptAnalysis): string[] {
  const examples: string[] = [];

  // Domain-specific examples
  switch (analysis.domain) {
    case 'technical':
      examples.push(
        'Example: For a REST API, include endpoint documentation, request/response examples, and error handling'
      );
      break;
    case 'business':
      examples.push(
        'Example: For a business strategy, include SWOT analysis, KPIs, and implementation timeline'
      );
      break;
    case 'creative':
      examples.push(
        'Example: For creative writing, include tone, style, target audience, and desired emotional impact'
      );
      break;
    case 'research':
      examples.push(
        'Example: For research analysis, include methodology, data sources, and statistical significance'
      );
      break;
  }

  return examples;
}

/**
 * Selects the appropriate framework type based on the analysis
 * @param {PromptAnalysis} analysis - The prompt analysis object containing complexity and domain information
 * @returns {string} The selected framework type
 */
export function selectFramework(analysis: PromptAnalysis): string {
  if (analysis.complexity === 'high') {
    return FRAMEWORK_TYPES.COMPREHENSIVE;
  } else if (analysis.domain === 'technical') {
    return FRAMEWORK_TYPES.TECHNICAL;
  } else if (analysis.domain === 'business') {
    return FRAMEWORK_TYPES.BUSINESS;
  }
  return FRAMEWORK_TYPES.GENERAL;
}

/**
 * Creates a clarity-focused variation of the prompt template
 * @param {PromptAnalysis} analysis - The prompt analysis object containing domain information
 * @returns {string} A clarity-focused prompt variation
 */
export function createClarityVariation(analysis: PromptAnalysis): string {
  return `As a clear and precise ${analysis.domain} expert, please provide a detailed response with step-by-step instructions, specific examples, and well-defined deliverables.`;
}

/**
 * Creates a specificity-focused variation of the prompt template
 * @param {PromptAnalysis} analysis - The prompt analysis object containing domain information
 * @returns {string} A specificity-focused prompt variation
 */
export function createSpecificityVariation(analysis: PromptAnalysis): string {
  return `As a specialized ${analysis.domain} professional, create a comprehensive solution with exact specifications, measurable outcomes, and concrete implementation details.`;
}

/**
 * Creates a technique-specific variation of the prompt template
 * @param {PromptAnalysis} analysis - The prompt analysis object containing domain information
 * @param {PromptTechnique} technique - The specific reasoning technique to apply
 * @returns {string} A technique-specific prompt variation
 */
export function createTechniqueVariation(
  analysis: PromptAnalysis,
  technique: PromptTechnique
): string {
  switch (technique) {
    case 'cot':
      return `Please think step-by-step to address this ${analysis.domain} task, explaining your reasoning at each stage before proceeding to the next.`;
    case 'tot':
      return `Consider multiple approaches for this ${analysis.domain} challenge, exploring different solution paths and selecting the optimal one through systematic evaluation.`;
    case 'react':
      return `Approach this ${analysis.domain} task using a thought-action-observation cycle: analyze the situation, propose actions, and evaluate results iteratively.`;
    default:
      return `Apply advanced reasoning techniques to this ${analysis.domain} task, ensuring comprehensive analysis and well-supported conclusions.`;
  }
}
