export interface AdvancedPromptCrafterConfig {
  analysis: AnalysisConfig;
  optimization: OptimizationConfig;
  customization: CustomizationConfig;
  validation: ValidationConfig;
}

export interface AnalysisConfig {
  nlpProvider: string;
  analysisDepth: 'basic' | 'comprehensive' | 'deep';
  userProfile: UserProfile;
}

export interface OptimizationConfig {
  techniques: PromptTechnique[];
  enableABTesting: boolean;
  performanceThreshold: number;
}

export interface CustomizationConfig {
  domains: string[];
  models: string[];
  outputFormats: string[];
}

export interface ValidationConfig {
  qualityThreshold: number;
  enableBenchmarking: boolean;
  metrics: QualityMetric[];
}

export interface UserProfile {
  expertise: 'beginner' | 'intermediate' | 'expert';
  preferences: string[];
}

export type PromptTechnique =
  | 'cot' // Chain-of-Thought
  | 'tot' // Tree-of-Thought
  | 'self-consistency'
  | 'react' // ReAct (Reason+Act)
  | 'graph-of-thought';

export type QualityMetric =
  | 'clarity'
  | 'specificity'
  | 'completeness'
  | 'efficiency'
  | 'consistency'
  | 'error-rate';

export interface PromptRequest {
  task: string;
  domain: string;
  mode: 'technical' | 'business' | 'creative' | 'research';
  targetModel?: string;
  outputFormat?: 'json' | 'markdown' | 'text';
  requirements?: {
    include?: string[];
    exclude?: string[];
    constraints?: string[];
  };
  context?: string;
}

export interface PromptResponse {
  originalPrompt: string;
  optimizedPrompt: string;
  analysis: PromptAnalysis;
  optimization: PromptOptimization;
  validation: ValidationResult;
  responseTime: number;
  metadata: {
    model: string;
    mode: string;
    domain: string;
    outputFormat: string;
  };
}

export interface PromptAnalysis {
  intent: string;
  domain: string;
  complexity: 'low' | 'medium' | 'high';
  clarity: number; // 1-10
  specificity: number; // 1-10
  completeness: number; // 1-10
  ambiguities: string[];
  suggestions: string[];
  extractedEntities: Record<string, any>;
  userIntent: string;
  contextualFactors: string[];
}

export interface PromptOptimization {
  techniques: PromptTechnique[];
  enhancements: string[];
  template: PromptTemplate;
  abTestVariations: string[];
  performancePrediction: number; // 0-1
  optimizations: string[];
  reasoning: string[];
}

export interface PromptTemplate {
  structure: string;
  placeholders: string[];
  examples: string[];
  framework: string;
  reusable: boolean;
}

export interface ValidationResult {
  qualityScore: number; // 1-10
  metrics: Record<QualityMetric, number>;
  issues: ValidationIssue[];
  recommendations: string[];
  benchmarkComparison: BenchmarkResult;
  approved: boolean;
}

export interface ValidationIssue {
  type: 'warning' | 'error' | 'suggestion';
  message: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
}

export interface BenchmarkResult {
  industryAverage: number;
  percentile: number; // 0-100
  category: 'below-average' | 'average' | 'above-average' | 'excellent';
}

export interface QualityMetrics {
  clarity: number;
  specificity: number;
  completeness: number;
  efficiency: number;
  consistency: number;
  errorRate: number;
  overall: number;
}

export interface AnalysisResult {
  prompt: string;
  analysis: PromptAnalysis;
  suggestions: string[];
  improvements: string[];
}

export interface OptimizationResult {
  originalPrompt: string;
  optimizedPrompt: string;
  techniques: PromptTechnique[];
  improvements: string[];
  performanceIncrease: number;
}

export interface CustomizationResult {
  prompt: string;
  customizations: string[];
  adaptations: string[];
  modelSpecific: Record<string, string>;
  domainSpecific: Record<string, string>;
}

export interface PerformanceMetrics {
  responseTime: number;
  qualityScore: number;
  userSatisfaction: number;
  usageFrequency: number;
  errorRate: number;
  optimizationSuccess: number;
}
