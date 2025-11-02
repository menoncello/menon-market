import { ValidationResult, ValidationConfig, QualityMetric, BenchmarkResult } from '../types.js';

export class ValidationEngine {
  private config: ValidationConfig;

  constructor(config: ValidationConfig) {
    this.config = config;
  }

  /**
   * Validate a prompt against quality metrics
   */
  async validatePrompt(prompt: string): Promise<ValidationResult> {
    // Special handling for empty prompts
    if (!prompt || prompt.trim().length === 0) {
      const emptyMetrics: Record<QualityMetric, number> = {
        'clarity': 1,
        'specificity': 1,
        'completeness': 1,
        'efficiency': 1,
        'consistency': 1,
        'error-rate': 1
      };

      return {
        qualityScore: 1.0,
        metrics: emptyMetrics,
        issues: [{
          type: 'error',
          message: 'Empty prompt provided',
          severity: 'high',
          suggestion: 'Please provide a specific prompt with clear requirements and context'
        }],
        recommendations: ['Add specific task description', 'Include context and requirements', 'Specify desired output format'],
        benchmarkComparison: {
          industryAverage: 7.5,
          percentile: 5,
          category: 'below-average'
        },
        approved: false
      };
    }

    // Calculate quality metrics
    const metrics = await this.calculateAllMetrics(prompt);
    const qualityScore = this.calculateOverallScore(metrics);

    // Identify issues
    const issues = await this.identifyIssues(prompt, metrics);

    // Generate recommendations
    const recommendations = await this.generateRecommendations(metrics, issues);

    // Benchmark comparison
    const benchmarkComparison = await this.benchmarkComparison(metrics);

    // Determine approval
    const approved = qualityScore >= this.config.qualityThreshold;

    return {
      qualityScore,
      metrics,
      issues,
      recommendations,
      benchmarkComparison,
      approved
    };
  }

  /**
   * Calculate quality metrics for a prompt
   */
  async calculateQualityMetrics(prompt: string): Promise<any> {
    const metrics = await this.calculateAllMetrics(prompt);

    // Convert to expected QualityMetrics format
    return {
      clarity: metrics.clarity || 0,
      specificity: metrics.specificity || 0,
      completeness: metrics.completeness || 0,
      efficiency: metrics.efficiency || 0,
      consistency: metrics.consistency || 0,
      errorRate: metrics['error-rate'] || 0,
      overall: Object.values(metrics).reduce((sum: number, val: number) => sum + val, 0) / Object.keys(metrics).length
    };
  }

  private async calculateAllMetrics(prompt: string): Promise<Record<QualityMetric, number>> {
    const metrics: Record<QualityMetric, number> = {} as Record<QualityMetric, number>;

    for (const metric of this.config.metrics) {
      metrics[metric] = await this.calculateMetric(prompt, metric);
    }

    return metrics;
  }

  private async calculateMetric(prompt: string, metric: QualityMetric): Promise<number> {
    switch (metric) {
      case 'clarity':
        return this.calculateClarity(prompt);
      case 'specificity':
        return this.calculateSpecificity(prompt);
      case 'completeness':
        return this.calculateCompleteness(prompt);
      case 'efficiency':
        return this.calculateEfficiency(prompt);
      case 'consistency':
        return this.calculateConsistency(prompt);
      case 'error-rate':
        return this.calculateErrorRate(prompt);
      default:
        return 5; // Default middle score
    }
  }

  private calculateClarity(prompt: string): number {
    let score = 10;

    // Check for clarity indicators
    if (prompt.length < 10) score -= 3;
    if (prompt.length > 500) score -= 2;
    if (!/[.!?]$/.test(prompt.trim())) score -= 1;
    if (/\b(vague|unclear|uncertain|maybe|perhaps|somehow)\b/i.test(prompt)) score -= 2;
    if (prompt.split(' ').length < 5) score -= 2;

    // Bonus points for clarity elements
    if (/\b(clearly|specifically|exactly|precisely)\b/i.test(prompt)) score += 1;
    if (/\b(step|process|procedure|method)\b/i.test(prompt)) score += 1;

    return Math.max(1, Math.min(10, score));
  }

  private calculateSpecificity(prompt: string): number {
    let score = 5;

    // Check for specificity indicators
    if (/\b(exactly|specifically|precisely|particularly)\b/i.test(prompt)) score += 2;
    if (/\d+/.test(prompt)) score += 1;
    if (/\b(examples?|including|such as|for instance)\b/i.test(prompt)) score += 1;
    if (/\b(format|structure|output|result)\b/i.test(prompt)) score += 1;
    if (/\b(requirements|constraints|limitations)\b/i.test(prompt)) score += 1;
    if (/\b(not|don't|avoid|exclude|should not)\b/i.test(prompt)) score += 1;

    // Check for vagueness
    if (/\b(good|bad|nice|interesting|appropriate|suitable)\b/i.test(prompt)) score -= 2;
    if (/\b(some|many|few|several|various)\b/i.test(prompt)) score -= 1;

    return Math.max(1, Math.min(10, score));
  }

  private calculateCompleteness(prompt: string): number {
    let score = 5;

    // Check for complete instruction components
    if (/\b(what|how|why|when|where)\b/i.test(prompt)) score += 1;
    if (/\b(because|since|due to|given that)\b/i.test(prompt)) score += 1;
    if (/\b(examples?|for instance|such as|e\.g\.)\b/i.test(prompt)) score += 1;
    if (/\b(format|output|result|deliverable|produce)\b/i.test(prompt)) score += 1;
    if (/\b(context|background|scenario|situation)\b/i.test(prompt)) score += 1;
    if (/\b(criteria|requirements|specifications|standards)\b/i.test(prompt)) score += 1;

    return Math.max(1, Math.min(10, score));
  }

  private calculateEfficiency(prompt: string): number {
    let score = 10;

    // Penalize for inefficiency
    if (prompt.length > 300) score -= 2;
    if (prompt.split(' ').length > 100) score -= 1;
    if ((prompt.match(/\b(and|or|but|so|because)\b/gi) || []).length > 10) score -= 1;

    // Bonus for efficiency elements
    if (/\b(concise|brief|summary|key points)\b/i.test(prompt)) score += 1;
    if (prompt.includes('bullet points') || prompt.includes('numbered list')) score += 1;

    return Math.max(1, Math.min(10, score));
  }

  private calculateConsistency(prompt: string): number {
    let score = 10;

    // Check for consistency issues
    const contradictoryPairs = [
      ['include', 'exclude'],
      ['require', 'optional'],
      ['always', 'never'],
      ['all', 'none']
    ];

    for (const [word1, word2] of contradictoryPairs) {
      if (new RegExp(`\\b${word1}\\b.*\\b${word2}\\b`, 'i').test(prompt)) {
        score -= 2;
      }
    }

    // Check for consistent terminology
    const words = prompt.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    if (words.length / uniqueWords.size > 1.5) {
      score -= 1; // Too much repetition
    }

    return Math.max(1, Math.min(10, score));
  }

  private calculateErrorRate(prompt: string): number {
    let errorCount = 0;

    // Check for common errors
    if (!/[.!?]$/.test(prompt.trim())) errorCount++;
    if (prompt.length === 0) errorCount += 3;
    if (prompt.split(' ').length < 3) errorCount++;
    if (/\b\s+\b/.test(prompt)) errorCount++; // Double spaces
    if (/[^a-zA-Z0-9\s.,!?;:()[\]{}'"`\/\\@#$%^&*+=<>|-]/.test(prompt)) errorCount++; // Invalid characters

    // Calculate error rate (lower is better, so we invert)
    const errorRate = Math.max(0, 10 - errorCount * 2);

    return errorRate;
  }

  private calculateOverallScore(metrics: Record<QualityMetric, number>): number {
    const values = Object.values(metrics);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  private async identifyIssues(
    prompt: string,
    metrics: Record<QualityMetric, number>
  ): Promise<any[]> {
    const issues: any[] = [];

    // Identify issues based on metrics
    for (const [metric, value] of Object.entries(metrics)) {
      if (value < 6) {
        issues.push({
          type: value < 4 ? 'error' : 'warning',
          message: `Low ${metric} score: ${value}/10`,
          severity: value < 4 ? 'high' : 'medium',
          suggestion: this.getSuggestionForMetric(metric as QualityMetric)
        });
      } else if (value < 8) {
        issues.push({
          type: 'suggestion',
          message: `Could improve ${metric}: ${value}/10`,
          severity: 'low',
          suggestion: this.getSuggestionForMetric(metric as QualityMetric)
        });
      }
    }

    // Add specific prompt issues
    if (prompt.length < 20) {
      issues.push({
        type: 'warning',
        message: 'Prompt is very short',
        severity: 'medium',
        suggestion: 'Add more context and specific requirements'
      });
    }

    if (prompt.length > 400) {
      issues.push({
        type: 'suggestion',
        message: 'Prompt is quite long',
        severity: 'low',
        suggestion: 'Consider breaking down into multiple focused prompts'
      });
    }

    return issues;
  }

  private getSuggestionForMetric(metric: QualityMetric): string {
    const suggestions: Record<QualityMetric, string> = {
      clarity: 'Add specific details and clear action verbs',
      specificity: 'Include concrete examples and constraints',
      completeness: 'Add context, background information, and requirements',
      efficiency: 'Make more concise while maintaining clarity',
      consistency: 'Ensure consistent terminology and avoid contradictions',
      'error-rate': 'Fix grammar, spelling, and formatting issues'
    };

    return suggestions[metric] || 'Review and improve this aspect of the prompt';
  }

  private async generateRecommendations(
    metrics: Record<QualityMetric, number>,
    issues: any[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Generate recommendations based on lowest scores
    const sortedMetrics = Object.entries(metrics).sort(([, a], [, b]) => a - b);
    const lowestMetrics = sortedMetrics.slice(0, 3);

    for (const [metric, value] of lowestMetrics) {
      if (value < 7) {
        recommendations.push(`Improve ${metric}: ${this.getSuggestionForMetric(metric as QualityMetric)}`);
      }
    }

    // Add recommendations based on issues
    const issueRecommendations = issues
      .filter(issue => issue.type === 'error' || issue.type === 'warning')
      .map(issue => issue.suggestion)
      .filter((suggestion, index, arr) => arr.indexOf(suggestion) === index);

    recommendations.push(...issueRecommendations);

    return recommendations;
  }

  private async benchmarkComparison(metrics: Record<QualityMetric, number>): Promise<BenchmarkResult> {
    // Industry averages (simulated)
    const industryAverages: Record<QualityMetric, number> = {
      clarity: 7.2,
      specificity: 6.8,
      completeness: 7.0,
      efficiency: 7.5,
      consistency: 8.0,
      'error-rate': 8.2
    };

    // Calculate average score
    const promptAverage = this.calculateOverallScore(metrics);
    const industryAverage = Object.values(industryAverages).reduce((a, b) => a + b, 0) / Object.values(industryAverages).length;

    // Calculate percentile (simulated)
    const percentile = Math.min(100, Math.max(0, ((promptAverage - 5) / 5) * 100));

    // Determine category
    let category: 'below-average' | 'average' | 'above-average' | 'excellent';
    if (percentile < 25) category = 'below-average';
    else if (percentile < 50) category = 'average';
    else if (percentile < 75) category = 'above-average';
    else category = 'excellent';

    return {
      industryAverage,
      percentile,
      category
    };
  }
}