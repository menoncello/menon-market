import { PERFORMANCE_CONSTANTS, TECHNICAL_DOMAINS, REASONING_TEMPLATES } from '../constants.js';
import {
  PromptAnalysis,
  PromptOptimization,
  PromptTechnique,
  OptimizationConfig,
} from '../types.js';
import {
  addQualityBasedEnhancements,
  addTechniqueBasedEnhancements,
  addBasicOptimizations,
  addTechniqueOptimizations,
  addQualityReasoning,
} from '../utils/quality-utils.js';
import {
  addComplexityBasedTechniques,
  addDomainBasedTechniques,
  addIntentBasedTechniques,
  addQualityBasedTechniques,
} from '../utils/technique-utils.js';
import {
  generateTemplateStructure,
  extractPlaceholders,
  generateExamples,
  selectFramework,
  createClarityVariation,
  createSpecificityVariation,
  createTechniqueVariation,
} from '../utils/template-utils.js';

/**
 * Optimization engine for improving prompts based on analysis
 */
export class OptimizationEngine {
  private config: OptimizationConfig;

  /**
   * Create a new optimization engine
   * @param config - Configuration for optimization
   */
  constructor(config: OptimizationConfig) {
    this.config = config;
  }

  /**
   * Optimize a prompt based on analysis
   * @param analysis - The prompt analysis results
   * @param options - Optimization options
   * @param options.mode - Optimization mode
   * @param options.targetModel - Target AI model
   * @returns Optimized prompt configuration
   */
  async optimizePrompt(
    analysis: PromptAnalysis,
    options: {
      mode?: string;
      targetModel?: string;
    } = {}
  ): Promise<PromptOptimization> {
    // Apply optimization techniques
    const techniques = this.selectTechniques(analysis, options);
    const enhancements = await this.generateEnhancements(analysis, techniques);

    // Create template
    const template = await this.createTemplate(analysis, enhancements);

    // Generate A/B test variations
    const abTestVariations = await this.generateABTestVariations(analysis, techniques);

    // Predict performance
    const performancePrediction = await this.predictPerformance(analysis, techniques);

    // Generate optimizations
    const optimizations = await this.generateOptimizations(analysis, techniques);

    // Generate reasoning
    const reasoning = await this.generateReasoning(analysis, techniques);

    return {
      techniques,
      enhancements,
      template,
      abTestVariations,
      performancePrediction,
      optimizations,
      reasoning,
    };
  }

  /**
   * Select optimization techniques based on analysis
   * @param analysis - The prompt analysis results
   * @param _options - Optimization options (unused)
   * @param _options.mode
   * @param _options.targetModel
   * @returns Array of selected techniques
   */
  private selectTechniques(
    analysis: PromptAnalysis,
    _options: { mode?: string; targetModel?: string }
  ): PromptTechnique[] {
    const techniques: PromptTechnique[] = [];

    addComplexityBasedTechniques(analysis, techniques);
    addDomainBasedTechniques(analysis, techniques);
    addIntentBasedTechniques(analysis, techniques);
    addQualityBasedTechniques(analysis, techniques);

    // Add configured techniques
    techniques.push(...this.config.techniques);

    // Remove duplicates
    return [...new Set(techniques)];
  }

  /**
   * Generate enhancements based on analysis and techniques
   * @param analysis - The prompt analysis results
   * @param techniques - Selected optimization techniques
   * @returns Array of enhancement suggestions
   */
  private async generateEnhancements(
    analysis: PromptAnalysis,
    techniques: PromptTechnique[]
  ): Promise<string[]> {
    const enhancements: string[] = [];

    addQualityBasedEnhancements(analysis, enhancements);
    addTechniqueBasedEnhancements(techniques, enhancements);

    return enhancements;
  }

  /**
   * Create a template based on analysis and enhancements
   * @param analysis - The prompt analysis results
   * @param _enhancements - Enhancement suggestions (unused)
   * @returns Template object
   */
  private async createTemplate(
    analysis: PromptAnalysis,
    _enhancements: string[]
  ): Promise<{
    structure: string;
    placeholders: string[];
    examples: string[];
    framework: string;
    reusable: boolean;
  }> {
    return {
      structure: generateTemplateStructure(analysis),
      placeholders: extractPlaceholders(analysis),
      examples: generateExamples(analysis),
      framework: selectFramework(analysis),
      reusable: true,
    };
  }

  /**
   * Generate A/B test variations
   * @param analysis - The prompt analysis results
   * @param techniques - Selected optimization techniques
   * @returns Array of test variations
   */
  private async generateABTestVariations(
    analysis: PromptAnalysis,
    techniques: PromptTechnique[]
  ): Promise<string[]> {
    const variations: string[] = [];

    // Variation 1: Focus on clarity
    variations.push(createClarityVariation(analysis));

    // Variation 2: Focus on specificity
    variations.push(createSpecificityVariation(analysis));

    // Variation 3: Focus on technique application
    variations.push(createTechniqueVariation(analysis, techniques[0] || 'cot'));

    return variations;
  }

  /**
   * Predict performance score for optimized prompt
   * @param analysis - The prompt analysis results
   * @param techniques - Selected optimization techniques
   * @returns Performance prediction score
   */
  private async predictPerformance(
    analysis: PromptAnalysis,
    techniques: PromptTechnique[]
  ): Promise<number> {
    const baseScore =
      (analysis.clarity + analysis.specificity + analysis.completeness) /
      PERFORMANCE_CONSTANTS.BASE_DIVISOR;

    // Boost score for applied techniques
    const techniqueBonus = techniques.length * PERFORMANCE_CONSTANTS.TECHNIQUE_BONUS;

    // Domain-specific adjustments
    let domainBonus = 0;
    if (TECHNICAL_DOMAINS.includes(analysis.domain as keyof typeof TECHNICAL_DOMAINS)) {
      domainBonus = PERFORMANCE_CONSTANTS.DOMAIN_BONUS;
    }

    // Complexity adjustments
    let complexityAdjustment = 0;
    if (analysis.complexity === 'high') {
      complexityAdjustment = PERFORMANCE_CONSTANTS.HIGH_COMPLEXITY_BONUS;
    } else if (analysis.complexity === 'low') {
      complexityAdjustment = PERFORMANCE_CONSTANTS.LOW_COMPLEXITY_PENALTY;
    }

    return Math.min(
      PERFORMANCE_CONSTANTS.MAX_SCORE,
      baseScore + techniqueBonus + domainBonus + complexityAdjustment
    );
  }

  /**
   * Generate optimization suggestions
   * @param analysis - The prompt analysis results
   * @param techniques - Selected optimization techniques
   * @returns Array of optimization suggestions
   */
  private async generateOptimizations(
    analysis: PromptAnalysis,
    techniques: PromptTechnique[]
  ): Promise<string[]> {
    const optimizations: string[] = [];

    addBasicOptimizations(analysis, optimizations);
    addTechniqueOptimizations(techniques, optimizations);

    return optimizations;
  }

  /**
   * Generate reasoning for optimization choices
   * @param analysis - The prompt analysis results
   * @param techniques - Selected optimization techniques
   * @returns Array of reasoning explanations
   */
  private async generateReasoning(
    analysis: PromptAnalysis,
    techniques: PromptTechnique[]
  ): Promise<string[]> {
    const reasoning: string[] = [];

    reasoning.push(REASONING_TEMPLATES.TECHNIQUE_SELECTION(techniques.length));
    reasoning.push(REASONING_TEMPLATES.TECHNIQUE_APPLICATION(techniques));

    addQualityReasoning(analysis, reasoning);

    const performanceScore = await this.predictPerformance(analysis, techniques);
    reasoning.push(REASONING_TEMPLATES.PERFORMANCE_IMPROVEMENT(performanceScore));

    return reasoning;
  }
}
