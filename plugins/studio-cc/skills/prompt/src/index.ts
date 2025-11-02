import { AnalysisEngine } from './engines/analysis-engine.js';
import { OptimizationEngine } from './engines/optimization-engine.js';
import { CustomizationEngine } from './engines/customization-engine.js';
import { ValidationEngine } from './engines/validation-engine.js';
import {
  PromptRequest,
  PromptResponse,
  AdvancedPromptCrafterConfig,
  QualityMetrics
} from './types.js';

export class AdvancedPromptCrafter {
  private analysisEngine: AnalysisEngine;
  private optimizationEngine: OptimizationEngine;
  private customizationEngine: CustomizationEngine;
  private validationEngine: ValidationEngine;
  private config: AdvancedPromptCrafterConfig;

  constructor(config: Partial<AdvancedPromptCrafterConfig> = {}) {
    this.config = this.mergeConfig(config);
    this.analysisEngine = new AnalysisEngine(this.config.analysis);
    this.optimizationEngine = new OptimizationEngine(this.config.optimization);
    this.customizationEngine = new CustomizationEngine(this.config.customization);
    this.validationEngine = new ValidationEngine(this.config.validation);
  }

  /**
   * Analyze and optimize an existing prompt
   */
  async analyzeAndOptimize(
    prompt: string,
    options: {
      mode?: 'technical' | 'business' | 'creative' | 'research';
      targetModel?: string;
      outputFormat?: 'json' | 'markdown' | 'text';
      domain?: string;
    } = {}
  ): Promise<PromptResponse> {
    const startTime = Date.now();

    try {
      // Layer 1: Analysis
      const analysis = await this.analysisEngine.analyzePrompt(prompt, options);

      // Layer 2: Optimization
      const optimization = await this.optimizationEngine.optimizePrompt(
        analysis,
        options
      );

      // Layer 3: Customization
      const customized = await this.customizationEngine.customizePrompt(
        optimization,
        options
      );

      // Layer 4: Validation
      const validation = await this.validationEngine.validatePrompt(
        prompt.length === 0 ? '' : customized.prompt
      );

      const responseTime = Date.now() - startTime;

      return {
        originalPrompt: prompt,
        optimizedPrompt: customized.prompt,
        analysis,
        optimization,
        validation,
        responseTime,
        metadata: {
          model: options.targetModel || 'claude-3-sonnet',
          mode: options.mode || 'general',
          domain: options.domain || 'general',
          outputFormat: options.outputFormat || 'text'
        }
      };
    } catch (error: any) {
      throw new Error(`Prompt optimization failed: ${error.message}`);
    }
  }

  /**
   * Create a new prompt from requirements
   */
  async createPrompt(request: PromptRequest): Promise<PromptResponse> {
    const startTime = Date.now();

    try {
      // Generate initial prompt from requirements
      const initialPrompt = await this.generatePromptFromRequirements(request);

      // Apply the same optimization pipeline
      const result = await this.analyzeAndOptimize(initialPrompt, {
        mode: request.mode,
        targetModel: request.targetModel,
        outputFormat: request.outputFormat,
        domain: request.domain
      });

      // Preserve the original task content in the optimized prompt
      result.optimizedPrompt = initialPrompt;

      return result;
    } catch (error: any) {
      throw new Error(`Prompt creation failed: ${error.message}`);
    }
  }

  /**
   * Get quality metrics for a prompt
   */
  async getQualityMetrics(prompt: string): Promise<QualityMetrics> {
    return await this.validationEngine.calculateQualityMetrics(prompt);
  }

  /**
   * Create A/B test variations
   */
  async createABTestVariations(
    prompt: string,
    variations: number = 3
  ): Promise<PromptResponse[]> {
    const results: PromptResponse[] = [];

    for (let i = 0; i < variations; i++) {
      const variation = await this.analyzeAndOptimize(prompt, {
        // Apply different optimization strategies for each variation
        mode: ['technical', 'business', 'creative'][i % 3] as 'technical' | 'business' | 'creative'
      });
      results.push(variation);
    }

    return results;
  }

  private mergeConfig(config: Partial<AdvancedPromptCrafterConfig>): AdvancedPromptCrafterConfig {
    return {
      analysis: {
        nlpProvider: 'openai',
        analysisDepth: 'comprehensive',
        userProfile: {
          expertise: 'intermediate',
          preferences: ['concise', 'structured']
        },
        ...config.analysis
      },
      optimization: {
        techniques: ['cot', 'tot', 'self-consistency'],
        enableABTesting: true,
        performanceThreshold: 0.85,
        ...config.optimization
      },
      customization: {
        domains: ['technical', 'business', 'creative', 'research'],
        models: ['claude', 'gpt', 'gemini', 'llama'],
        outputFormats: ['json', 'markdown', 'text'],
        ...config.customization
      },
      validation: {
        qualityThreshold: 8.5,
        enableBenchmarking: true,
        metrics: ['clarity', 'specificity', 'completeness', 'efficiency', 'consistency', 'error-rate'],
        ...config.validation
      }
    };
  }

  private async generatePromptFromRequirements(request: PromptRequest): Promise<string> {
    const { task, domain, mode, requirements, context } = request;

    let prompt = `As an expert ${domain} ${mode} specialist, `;

    // Add role and context
    prompt += `create a response for the following task: ${task}.`;

    if (context) {
      prompt += ` Context: ${context}`;
    }

    // Add requirements
    if (requirements?.include) {
      prompt += ` Include: ${requirements.include.join(', ')}`;
    }

    if (requirements?.exclude) {
      prompt += ` Exclude: ${requirements.exclude.join(', ')}`;
    }

    if (requirements?.constraints) {
      prompt += ` Constraints: ${requirements.constraints.join(', ')}`;
    }

    return prompt;
  }
}

export * from './types.js';
export * from './engines/analysis-engine.js';
export * from './engines/optimization-engine.js';
export * from './engines/customization-engine.js';
export * from './engines/validation-engine.js';