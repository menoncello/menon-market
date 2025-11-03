/**
 * Type definitions for research tools plugin
 */

import type { ConfidenceScore, RelevanceScore, SourceType } from '../index';

/**
 * Enhanced research workflow types with stricter typing
 */
export type EnhancedResearchWorkflow =
  | 'company-research'
  | 'competitor-analysis'
  | 'market-analysis'
  | 'trend-analysis'
  | 'tool-comparison'
  | 'technical-analysis'
  | 'customer-research'
  | 'financial-analysis';

/**
 * Research validation status
 */
export type ValidationStatus = 'pending' | 'validated' | 'rejected' | 'needs-review';

/**
 * Research priority levels
 */
export type ResearchPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Enhanced research finding with impact assessment
 */
export interface EnhancedResearchFinding {
  readonly category: ResearchCategory;
  readonly insight: string;
  readonly evidence: readonly string[];
  readonly impact: ImpactLevel;
  readonly confidence: ConfidenceScore;
  readonly priority: ResearchPriority;
  readonly validationStatus: ValidationStatus;
  readonly tags: readonly string[];
  readonly relatedFindings: readonly string[]; // IDs of related findings
}

/**
 * Research categories
 */
export type ResearchCategory =
  | 'market'
  | 'financial'
  | 'technical'
  | 'competitive'
  | 'operational'
  | 'strategic'
  | 'regulatory'
  | 'customer';

/**
 * Impact levels with type safety
 */
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Enhanced research source with validation
 */
export interface EnhancedResearchSource {
  readonly id: string;
  readonly title: string;
  readonly url: URL;
  readonly content: string;
  readonly relevanceScore: RelevanceScore;
  readonly type: SourceType;
  readonly author?: string;
  readonly publishedAt?: Date;
  readonly lastAccessed: Date;
  readonly validationStatus: ValidationStatus;
  readonly factCheckScore: number; // 0-1 score for factual accuracy
  readonly biasRating: 'left' | 'center' | 'right' | 'unknown';
  readonly trustLevel: TrustLevel;
}

/**
 * Trust levels for sources
 */
export type TrustLevel = 'low' | 'medium' | 'high' | 'verified';

/**
 * Research query with metadata
 */
export interface ResearchQuery {
  readonly id: string;
  readonly query: string;
  readonly workflow: EnhancedResearchWorkflow;
  readonly priority: ResearchPriority;
  readonly requestedAt: Date;
  readonly requestedBy: string;
  readonly context?: string;
  readonly constraints?: readonly string[];
}

/**
 * Research session tracking
 */
export interface ResearchSession {
  readonly id: string;
  readonly queries: readonly ResearchQuery[];
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly status: 'active' | 'completed' | 'failed';
  readonly totalFindings: number;
  readonly averageConfidence: ConfidenceScore;
}

/**
 * Type guards for enhanced types
 */
export function isValidImpactLevel(level: string): level is ImpactLevel {
  return ['low', 'medium', 'high', 'critical'].includes(level);
}

export function isValidValidationStatus(status: string): status is ValidationStatus {
  return ['pending', 'validated', 'rejected', 'needs-review'].includes(status);
}

export function isValidResearchPriority(priority: string): priority is ResearchPriority {
  return ['low', 'medium', 'high', 'critical'].includes(priority);
}

export function isValidTrustLevel(level: string): level is TrustLevel {
  return ['low', 'medium', 'high', 'verified'].includes(level);
}

/**
 * Enhanced validation utilities
 */
export function validateResearchFinding(finding: unknown): finding is EnhancedResearchFinding {
  return (
    typeof finding === 'object' &&
    finding !== null &&
    'category' in finding &&
    'insight' in finding &&
    'impact' in finding &&
    'confidence' in finding &&
    'priority' in finding &&
    'validationStatus' in finding
  );
}

export function validateResearchSource(source: unknown): source is EnhancedResearchSource {
  return (
    typeof source === 'object' &&
    source !== null &&
    'id' in source &&
    'title' in source &&
    'url' in source &&
    'content' in source &&
    'type' in source &&
    'relevanceScore' in source &&
    'trustLevel' in source
  );
}
