import {
  PromptAnalysis,
  PromptOptimization,
  PromptTechnique,
  OptimizationConfig,
} from '../types.js';

export class OptimizationEngine {
  private config: OptimizationConfig;

  constructor(config: OptimizationConfig) {
    this.config = config;
  }

  /**
   * Optimize a prompt based on analysis
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

  private selectTechniques(analysis: PromptAnalysis, _options: any): PromptTechnique[] {
    const techniques: PromptTechnique[] = [];

    // Select techniques based on analysis
    if (analysis.complexity === 'high') {
      techniques.push('tot', 'graph-of-thought');
    }

    if (analysis.domain === 'technical' || analysis.domain === 'research') {
      techniques.push('cot');
    }

    if (analysis.intent.includes('solve') || analysis.intent.includes('create')) {
      techniques.push('react');
    }

    if (analysis.clarity < 7 || analysis.specificity < 7) {
      techniques.push('self-consistency');
    }

    // Add configured techniques
    techniques.push(...this.config.techniques);

    // Remove duplicates
    return [...new Set(techniques)];
  }

  private async generateEnhancements(
    analysis: PromptAnalysis,
    techniques: PromptTechnique[]
  ): Promise<string[]> {
    const enhancements: string[] = [];

    // Generate enhancements based on analysis
    if (analysis.clarity < 7) {
      enhancements.push('Add specific details and clear action verbs');
      enhancements.push('Define the desired output format explicitly');
    }

    if (analysis.specificity < 7) {
      enhancements.push('Include concrete examples and constraints');
      enhancements.push('Specify success criteria and requirements');
    }

    if (analysis.completeness < 7) {
      enhancements.push('Add context and background information');
      enhancements.push('Include relevant domain-specific terminology');
    }

    // Generate technique-specific enhancements
    for (const technique of techniques) {
      switch (technique) {
        case 'cot':
          enhancements.push('Add step-by-step reasoning instructions');
          break;
        case 'tot':
          enhancements.push('Structure as branching thought process');
          break;
        case 'self-consistency':
          enhancements.push('Request multiple approaches and consensus');
          break;
        case 'react':
          enhancements.push('Add thought-action-observation cycle');
          break;
        case 'graph-of-thought':
          enhancements.push('Structure as interconnected concept graph');
          break;
      }
    }

    return enhancements;
  }

  private async createTemplate(analysis: PromptAnalysis, _enhancements: string[]): Promise<any> {
    const template = {
      structure: this.generateTemplateStructure(analysis),
      placeholders: this.extractPlaceholders(analysis),
      examples: this.generateExamples(analysis),
      framework: this.selectFramework(analysis),
      reusable: true,
    };

    return template;
  }

  private generateTemplateStructure(analysis: PromptAnalysis): string {
    let structure = '';

    // Add role definition
    structure += 'You are an expert {role} with extensive experience in {domain}.\n\n';

    // Add context
    structure += 'Context: {context}\n\n';

    // Add task
    structure += 'Task: {task}\n\n';

    // Add requirements
    structure += 'Requirements:\n- {requirements}\n\n';

    // Add constraints
    structure += 'Constraints:\n- {constraints}\n\n';

    // Add output format
    structure += 'Output Format:\n{outputFormat}\n\n';

    // Add technique-specific structure
    if (analysis.complexity === 'high') {
      structure +=
        'Approach:\n1. Analyze the problem systematically\n2. Consider multiple solution paths\n3. Evaluate and select the best approach\n4. Implement the solution\n\n';
    }

    return structure;
  }

  private extractPlaceholders(_analysis: PromptAnalysis): string[] {
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

  private generateExamples(analysis: PromptAnalysis): string[] {
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

  private selectFramework(analysis: PromptAnalysis): string {
    if (analysis.complexity === 'high') {
      return 'comprehensive-analysis';
    } else if (analysis.domain === 'technical') {
      return 'technical-specification';
    } else if (analysis.domain === 'business') {
      return 'business-framework';
    } 
      return 'general-purpose';
    
  }

  private async generateABTestVariations(
    analysis: PromptAnalysis,
    techniques: PromptTechnique[]
  ): Promise<string[]> {
    const variations: string[] = [];

    // Variation 1: Focus on clarity
    variations.push(this.createClarityVariation(analysis));

    // Variation 2: Focus on specificity
    variations.push(this.createSpecificityVariation(analysis));

    // Variation 3: Focus on technique application
    variations.push(this.createTechniqueVariation(analysis, techniques[0] || 'cot'));

    return variations;
  }

  private createClarityVariation(analysis: PromptAnalysis): string {
    return `As a clear and precise ${analysis.domain} expert, please provide a detailed response with step-by-step instructions, specific examples, and well-defined deliverables.`;
  }

  private createSpecificityVariation(analysis: PromptAnalysis): string {
    return `As a specialized ${analysis.domain} professional, create a comprehensive solution with exact specifications, measurable outcomes, and concrete implementation details.`;
  }

  private createTechniqueVariation(analysis: PromptAnalysis, technique: PromptTechnique): string {
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

  private async predictPerformance(
    analysis: PromptAnalysis,
    techniques: PromptTechnique[]
  ): Promise<number> {
    const baseScore = (analysis.clarity + analysis.specificity + analysis.completeness) / 30;

    // Boost score for applied techniques
    const techniqueBonus = techniques.length * 0.05;

    // Domain-specific adjustments
    let domainBonus = 0;
    if (['technical', 'research'].includes(analysis.domain)) {
      domainBonus = 0.1;
    }

    // Complexity adjustments
    let complexityAdjustment = 0;
    if (analysis.complexity === 'high') {
      complexityAdjustment = 0.1;
    } else if (analysis.complexity === 'low') {
      complexityAdjustment = -0.05;
    }

    const predictedScore = Math.min(
      1,
      baseScore + techniqueBonus + domainBonus + complexityAdjustment
    );

    return predictedScore;
  }

  private async generateOptimizations(
    analysis: PromptAnalysis,
    techniques: PromptTechnique[]
  ): Promise<string[]> {
    const optimizations: string[] = [];

    // Basic optimizations
    if (analysis.clarity < 8) {
      optimizations.push('Add explicit action verbs and clear instructions');
    }

    if (analysis.specificity < 8) {
      optimizations.push('Include specific examples and success criteria');
    }

    if (analysis.completeness < 8) {
      optimizations.push('Add context, constraints, and expected outcomes');
    }

    // Technique-specific optimizations
    for (const technique of techniques) {
      switch (technique) {
        case 'cot':
          optimizations.push('Structure with step-by-step reasoning format');
          break;
        case 'tot':
          optimizations.push('Add branching decision points and evaluation criteria');
          break;
        case 'self-consistency':
          optimizations.push('Request multiple approaches and consensus building');
          break;
        case 'react':
          optimizations.push('Include thought-action-observation cycle instructions');
          break;
        case 'graph-of-thought':
          optimizations.push('Structure as interconnected concept relationships');
          break;
      }
    }

    return optimizations;
  }

  private async generateReasoning(
    analysis: PromptAnalysis,
    techniques: PromptTechnique[]
  ): Promise<string[]> {
    const reasoning: string[] = [];

    reasoning.push(
      `Selected ${techniques.length} optimization techniques based on task complexity and domain requirements`
    );
    reasoning.push(`Applied ${techniques.join(', ')} to improve response quality and consistency`);

    if (analysis.clarity < 7) {
      reasoning.push('Enhanced clarity by adding specific instructions and action verbs');
    }

    if (analysis.specificity < 7) {
      reasoning.push('Improved specificity through concrete examples and constraints');
    }

    if (analysis.completeness < 7) {
      reasoning.push('Increased completeness by adding context and success criteria');
    }

    reasoning.push(
      `Estimated performance improvement: ${Math.round((await this.predictPerformance(analysis, techniques)) * 100)}%`
    );

    return reasoning;
  }
}
