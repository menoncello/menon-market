/**
 * Constants for optimization engine
 */

// Quality thresholds
export const QUALITY_THRESHOLDS = {
  GOOD: 8,
  ACCEPTABLE: 7,
  POOR: 6,
} as const;

// Performance calculations
export const PERFORMANCE_CONSTANTS = {
  BASE_DIVISOR: 30,
  TECHNIQUE_BONUS: 0.05,
  DOMAIN_BONUS: 0.1,
  HIGH_COMPLEXITY_BONUS: 0.1,
  LOW_COMPLEXITY_PENALTY: -0.05,
  MAX_SCORE: 1,
  PERCENTAGE_MULTIPLIER: 100,
} as const;

// Analysis thresholds
export const ANALYSIS_THRESHOLDS = {
  HIGH_QUALITY: 8,
  MEDIUM_QUALITY: 7,
  LOW_QUALITY: 6,
} as const;

// A/B test variations count
export const ABTEST_VARIATIONS_COUNT = 3;

// Domain bonus domains
export const TECHNICAL_DOMAINS = ['technical', 'research'] as const;

// Template structure constants
export const TEMPLATE_SECTIONS = {
  ROLE_DEFINITION: 'You are an expert {role} with extensive experience in {domain}.\n\n',
  CONTEXT: 'Context: {context}\n\n',
  TASK: 'Task: {task}\n\n',
  REQUIREMENTS: 'Requirements:\n- {requirements}\n\n',
  CONSTRAINTS: 'Constraints:\n- {constraints}\n\n',
  OUTPUT_FORMAT: 'Output Format:\n{outputFormat}\n\n',
  HIGH_COMPLEXITY_APPROACH:
    'Approach:\n1. Analyze the problem systematically\n2. Consider multiple solution paths\n3. Evaluate and select the best approach\n4. Implement the solution\n\n',
} as const;

// Framework types
export const FRAMEWORK_TYPES = {
  COMPREHENSIVE: 'comprehensive-analysis',
  TECHNICAL: 'technical-specification',
  BUSINESS: 'business-framework',
  GENERAL: 'general-purpose',
} as const;

// Reasoning templates
export const REASONING_TEMPLATES = {
  TECHNIQUE_SELECTION: (count: number) =>
    `Selected ${count} optimization techniques based on task complexity and domain requirements`,
  TECHNIQUE_APPLICATION: (techniques: string[]) =>
    `Applied ${techniques.join(', ')} to improve response quality and consistency`,
  CLARITY_ENHANCEMENT: 'Enhanced clarity by adding specific instructions and action verbs',
  SPECIFICITY_IMPROVEMENT: 'Improved specificity through concrete examples and constraints',
  COMPLETENESS_INCREASE: 'Increased completeness by adding context and success criteria',
  PERFORMANCE_IMPROVEMENT: (score: number) =>
    `Estimated performance improvement: ${Math.round(score * PERCENTAGE_CONSTANTS.PERCENTAGE_MULTIPLIER)}%`,
} as const;

// Percentage constants
export const PERCENTAGE_CONSTANTS = {
  MULTIPLIER: 100,
} as const;
