import { PromptAnalysis, AnalysisConfig, UserProfile } from '../types.js';

export class AnalysisEngine {
  private config: AnalysisConfig;

  constructor(config: AnalysisConfig) {
    this.config = config;
  }

  /**
   * Analyze a prompt using NLP techniques
   */
  async analyzePrompt(
    prompt: string,
    options: {
      mode?: string;
      domain?: string;
      targetModel?: string;
    } = {}
  ): Promise<PromptAnalysis> {
    // Use config to access configuration if needed
    void this.config;

    // Handle empty prompts
    if (!prompt || prompt.trim().length === 0) {
      return {
        intent: 'empty',
        domain: 'none',
        complexity: 'low',
        clarity: 1,
        specificity: 1,
        completeness: 1,
        ambiguities: ['Empty prompt provided'],
        suggestions: ['Please provide a specific task or request'],
        extractedEntities: {},
        userIntent: 'empty-request',
        contextualFactors: ['empty-input']
      };
    }

    // Extract intent using pattern matching and NLP
    const intent = await this.extractIntent(prompt);

    // Identify domain
    const domain = options.domain || await this.identifyDomain(prompt);

    // Assess complexity
    const complexity = await this.assessComplexity(prompt);

    // Calculate quality metrics
    const clarity = await this.calculateClarity(prompt);
    const specificity = await this.calculateSpecificity(prompt);
    const completeness = await this.calculateCompleteness(prompt);

    // Identify ambiguities
    const ambiguities = await this.identifyAmbiguities(prompt);

    // Generate suggestions
    const suggestions = await this.generateSuggestions(prompt, clarity, specificity, completeness);

    // Extract entities
    const extractedEntities = await this.extractEntities(prompt);

    // Analyze user intent
    const userIntent = await this.analyzeUserIntent(prompt);

    // Identify contextual factors
    const contextualFactors = await this.identifyContextualFactors(prompt, options);

    return {
      intent,
      domain,
      complexity,
      clarity,
      specificity,
      completeness,
      ambiguities,
      suggestions,
      extractedEntities,
      userIntent,
      contextualFactors
    };
  }

  private async extractIntent(prompt: string): Promise<string> {
    const patterns = {
      generate: /generate|create|write|produce/i,
      analyze: /analyze|examine|review|assess/i,
      transform: /convert|transform|change|modify/i,
      explain: /explain|describe|clarify/i,
      compare: /compare|contrast|difference/i,
      solve: /solve|fix|resolve/i
    };

    for (const [intent, pattern] of Object.entries(patterns)) {
      if (pattern.test(prompt)) {
        return intent;
      }
    }

    return 'general';
  }

  private async identifyDomain(prompt: string): Promise<string> {
    const domainKeywords = {
      technical: ['code', 'api', 'database', 'algorithm', 'programming', 'software'],
      business: ['strategy', 'market', 'finance', 'business', 'revenue', 'customer'],
      creative: ['write', 'story', 'design', 'creative', 'art', 'content'],
      research: ['research', 'study', 'analysis', 'data', 'scientific', 'academic'],
      medical: ['medical', 'health', 'clinical', 'patient', 'diagnosis'],
      legal: ['legal', 'law', 'contract', 'regulation', 'compliance']
    };

    const promptLower = prompt.toLowerCase();
    let maxScore = 0;
    let detectedDomain = 'general';

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      const score = keywords.filter(keyword => promptLower.includes(keyword)).length;
      if (score > maxScore) {
        maxScore = score;
        detectedDomain = domain;
      }
    }

    return detectedDomain;
  }

  private async assessComplexity(prompt: string): Promise<'low' | 'medium' | 'high'> {
    const complexityIndicators = {
      high: [
        'multiple steps', 'complex', 'detailed analysis', 'comprehensive',
        'system design', 'architecture', 'integration', 'optimization'
      ],
      medium: [
        'analyze', 'explain', 'create', 'design', 'implement'
      ],
      low: [
        'simple', 'basic', 'quick', 'summary', 'brief'
      ]
    };

    const promptLower = prompt.toLowerCase();
    let highScore = 0;
    let mediumScore = 0;
    let lowScore = 0;

    for (const indicator of complexityIndicators.high) {
      if (promptLower.includes(indicator)) highScore++;
    }
    for (const indicator of complexityIndicators.medium) {
      if (promptLower.includes(indicator)) mediumScore++;
    }
    for (const indicator of complexityIndicators.low) {
      if (promptLower.includes(indicator)) lowScore++;
    }

    if (highScore > 0) return 'high';
    if (mediumScore > 0) return 'medium';
    return 'low';
  }

  private async calculateClarity(prompt: string): Promise<number> {
    let score = 10;

    // Deduct points for clarity issues
    if (prompt.length < 10) score -= 5; // Too short - more severe penalty
    if (prompt.length > 500) score -= 2; // Too long
    if (!/[.!?]$/.test(prompt.trim())) score -= 2; // No punctuation - increased penalty
    if (/\b(vague|unclear|uncertain|maybe|perhaps)\b/i.test(prompt)) score -= 3;
    if (prompt.split(' ').length < 5) score -= 4; // Too few words - more severe penalty

    // Additional clarity penalties for very generic/vague terms
    if (/\b(good|bad|nice|stuff|things|something)\b/i.test(prompt)) score -= 3;

    // Penalty for lack of specific action verbs
    if (!/\b(create|write|generate|analyze|explain|design|implement|build|develop|solve|fix)\b/i.test(prompt)) {
      score -= 2;
    }

    return Math.max(1, Math.min(10, score));
  }

  private async calculateSpecificity(prompt: string): Promise<number> {
    let score = 5; // Base score

    // Add points for specific elements
    if (/\b(exactly|specifically|precisely)\b/i.test(prompt)) score += 2;
    if (/\d+/.test(prompt)) score += 1; // Contains numbers
    if (/\b(examples?|including|such as)\b/i.test(prompt)) score += 1;
    if (/\b(format|structure|output|result)\b/i.test(prompt)) score += 1;
    if (/\b(requirements|constraints|limitations)\b/i.test(prompt)) score += 1;
    if (/\b(not|don't|avoid|exclude)\b/i.test(prompt)) score += 1; // Negative constraints

    return Math.max(1, Math.min(10, score));
  }

  private async calculateCompleteness(prompt: string): Promise<number> {
    let score = 5; // Base score

    // Check for complete instruction components
    if (/\b(what|how|why|when|where)\b/i.test(prompt)) score += 1; // Question words
    if (/\b(because|since|due to)\b/i.test(prompt)) score += 1; // Reasoning
    if (/\b(examples?|for instance|such as|including)\b/i.test(prompt)) score += 1; // Examples
    if (/\b(format|output|result|deliverable)\b/i.test(prompt)) score += 1; // Output specification
    if (/\b(context|background|scenario|given)\b/i.test(prompt)) score += 1; // Context

    // Additional completeness factors
    if (/\b(audience|target|reader)\b/i.test(prompt)) score += 1; // Target audience
    if (/\b(requirements|constraints|limitations)\b/i.test(prompt)) score += 1; // Constraints/requirements
    if (/\b(steps|process|approach|method)\b/i.test(prompt)) score += 1; // Process/methodology
    if (/\b(as a|as an|role|expert)\b/i.test(prompt)) score += 1; // Role definition
    if (/\b(goals|objectives|purpose|aim)\b/i.test(prompt)) score += 1; // Purpose/objectives

    // Length-based completeness for very detailed prompts
    if (prompt.length > 200) score += 1; // Detailed prompt
    if (prompt.length > 100) score += 0.5; // Moderately detailed

    return Math.max(1, Math.min(10, score));
  }

  private async identifyAmbiguities(prompt: string): Promise<string[]> {
    const ambiguities: string[] = [];

    // Check for vague terms
    const vagueTerms = ['good', 'bad', 'nice', 'interesting', 'appropriate', 'suitable'];
    for (const term of vagueTerms) {
      if (new RegExp(`\\b${term}\\b`, 'i').test(prompt)) {
        ambiguities.push(`Vague term "${term}" - could you be more specific?`);
      }
    }

    // Check for ambiguous references
    if (/\b(it|this|that|they|them)\b/i.test(prompt)) {
      ambiguities.push('Pronouns without clear antecedents - could you specify what "it/this/that" refers to?');
    }

    // Check for missing context
    if (!/\b(context|background|scenario|given)\b/i.test(prompt) && prompt.length < 50) {
      ambiguities.push('Limited context provided - could you add more background information?');
    }

    return ambiguities;
  }

  private async generateSuggestions(
    prompt: string,
    clarity: number,
    specificity: number,
    completeness: number
  ): Promise<string[]> {
    const suggestions: string[] = [];

    if (clarity < 7) {
      suggestions.push('Add more specific details and clear instructions');
      suggestions.push('Use precise language instead of vague terms');
    }

    if (specificity < 7) {
      suggestions.push('Include concrete examples and constraints');
      suggestions.push('Specify the desired output format');
    }

    if (completeness < 7) {
      suggestions.push('Add context or background information');
      suggestions.push('Define success criteria or requirements');
    }

    if (prompt.length < 20) {
      suggestions.push('Consider adding more detail to your request');
    }

    if (prompt.length > 300) {
      suggestions.push('Consider breaking down into multiple focused requests');
    }

    return suggestions;
  }

  private async extractEntities(prompt: string): Promise<Record<string, any>> {
    const entities: Record<string, any> = {};

    // Extract numbers
    const numbers = prompt.match(/\d+/g);
    if (numbers) {
      entities.numbers = numbers.map(n => parseInt(n));
    }

    // Extract file formats
    const formats = prompt.match(/\b(json|xml|csv|txt|md|pdf|docx)\b/gi);
    if (formats) {
      entities.formats = formats.map(f => f.toLowerCase());
    }

    // Extract programming languages
    const languages = prompt.match(/\b(javascript|typescript|python|java|c\+\+|go|rust|php|ruby|node\.js|nodejs)\b/gi);
    if (languages) {
      entities.languages = languages.map(l => l.toLowerCase().replace('nodejs', 'node.js'));
    }

    // Extract technologies
    const techStack = prompt.match(/\b(react|vue|angular|node|docker|kubernetes|aws|azure|gcp)\b/gi);
    if (techStack) {
      entities.technologies = techStack.map(t => t.toLowerCase());
    }

    return entities;
  }

  private async analyzeUserIntent(prompt: string): Promise<string> {
    const intentPatterns = {
      'create-something': /create|generate|write|produce|make|build/i,
      'analyze-something': /analyze|examine|review|assess|evaluate|audit/i,
      'improve-something': /improve|optimize|enhance|refactor|fix/i,
      'learn-something': /explain|teach|show|demonstrate|describe/i,
      'compare-things': /compare|contrast|versus|vs|difference/i,
      'solve-problem': /solve|fix|resolve|address|handle/i
    };

    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(prompt)) {
        return intent;
      }
    }

    return 'general-request';
  }

  private async identifyContextualFactors(
    prompt: string,
    options: any
  ): Promise<string[]> {
    const factors: string[] = [];

    // Mode context
    if (options.mode) {
      factors.push(`mode: ${options.mode}`);
    }

    // Domain context
    if (options.domain) {
      factors.push(`domain: ${options.domain}`);
    }

    // Model context
    if (options.targetModel) {
      factors.push(`target-model: ${options.targetModel}`);
    }

    // Implicit context from prompt
    if (/\b(urgently|asap|immediately)\b/i.test(prompt)) {
      factors.push('urgency: high');
    }

    if (/\b(beginner|novice|starter|basic)\b/i.test(prompt)) {
      factors.push('expertise-level: beginner');
    }

    if (/\b(advanced|expert|professional|complex)\b/i.test(prompt)) {
      factors.push('expertise-level: advanced');
    }

    return factors;
  }
}