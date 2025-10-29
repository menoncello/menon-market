/**
 * Core skill entity interfaces and data structures
 * Defines the main skill definition and related entities
 */

import { AgentRole } from '../agents/types';
import { CapabilityPerformance } from './performance-types';
import { CompatibilityLevel, ResourceType, DifficultyLevel, UsageTrend } from './skill-types';

/**
 * Individual skill capability or feature
 */
export interface SkillCapability {
  /** Capability identifier */
  id: string;

  /** Human-readable capability name */
  name: string;

  /** Detailed description of what this capability provides */
  description: string;

  /** Capability type (action, knowledge, tool, pattern) */
  type: 'action' | 'knowledge' | 'tool' | 'pattern' | 'framework' | 'methodology';

  /** Specific implementation details or parameters */
  implementation?: CapabilityImplementation;

  /** Examples of using this capability */
  usage?: string[];
}

/**
 * Implementation details for capabilities
 */
export interface CapabilityImplementation {
  /** Implementation approach or pattern */
  approach: string;

  /** Required tools or libraries */
  tools?: string[];

  /** Configuration parameters */
  parameters?: Record<string, unknown>;

  /** Performance characteristics */
  performance?: CapabilityPerformance;
}

/**
 * Skill usage example
 */
export interface SkillExample {
  /** Example title or description */
  title: string;

  /** Detailed example scenario */
  scenario: string;

  /** Step-by-step implementation */
  steps: string[];

  /** Code snippets or configuration examples */
  code?: string[];

  /** Expected outcomes or results */
  outcomes: string[];

  /** Agent types this example is most relevant for */
  relevantFor: AgentRole[];
}

/**
 * Skill dependency specification
 */
export interface SkillDependency {
  /** Skill ID that this skill depends on */
  skillId: string;

  /** Minimum version required (semver) */
  minVersion?: string;

  /** Maximum version compatible (semver) */
  maxVersion?: string;

  /** Whether this dependency is required or optional */
  required: boolean;

  /** Reason for this dependency */
  reason: string;
}

/**
 * Agent compatibility information
 */
export interface AgentCompatibility {
  /** Agent role that this skill is compatible with */
  agentRole: AgentRole;

  /** Compatibility level (full, partial, limited) */
  level: CompatibilityLevel;

  /** Any restrictions or modifications for this agent type */
  restrictions?: string[];

  /** Additional capabilities this agent gets from this skill */
  enhancements?: string[];
}

/**
 * Skill version information
 */
export interface SkillVersion {
  /** Version number */
  version: string;

  /** Release date */
  releasedAt: Date;

  /** Release notes */
  notes: string;

  /** Breaking changes in this version */
  breakingChanges?: string[];

  /** New features in this version */
  newFeatures?: string[];
}

/**
 * Learning resources for the skill
 */
export interface SkillResource {
  /** Resource type (documentation, tutorial, example, video) */
  type: ResourceType;

  /** Resource title or name */
  title: string;

  /** Resource URL or reference */
  url?: string;

  /** Brief description */
  description: string;

  /** Difficulty level (beginner, intermediate, advanced) */
  level: DifficultyLevel;

  /** Estimated time to complete/consume */
  estimatedTime: number; // in minutes
}

/**
 * Skill usage statistics
 */
export interface SkillUsageStats {
  /** Total number of times this skill has been used */
  totalUses: number;

  /** Number of unique agents using this skill */
  uniqueAgents: number;

  /** Average user satisfaction rating (1-5) */
  satisfactionRating: number;

  /** Most common use cases */
  commonUseCases: string[];

  /** Usage trend (increasing, stable, decreasing) */
  trend: UsageTrend;

  /** Last updated statistics */
  lastUpdated: Date;
}

/**
 * Quality badges for skills
 */
export interface QualityBadge {
  /** Badge identifier */
  id: string;

  /** Badge name */
  name: string;

  /** Badge description */
  description: string;

  /** Date awarded */
  awardedAt: Date;

  /** Awarding authority */
  authority: string;
}

/**
 * Skill quality indicators
 */
export interface SkillQuality {
  /** Test coverage percentage */
  testCoverage: number;

  /** Documentation completeness score */
  documentationScore: number;

  /** Number of open issues or bugs */
  openIssues: number;

  /** Community ratings or reviews */
  communityRating: number;

  /** Last quality assessment date */
  lastAssessed: Date;

  /** Quality badges or certifications */
  badges: QualityBadge[];
}
