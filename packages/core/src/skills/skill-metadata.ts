/**
 * Skill metadata and management related interfaces
 * Defines structures for skill lifecycle, usage tracking, and management
 */

import { AgentRole } from '../agents/types';
import { SkillPerformance } from './performance-types';
import { SkillVersion, SkillResource, SkillUsageStats, SkillQuality } from './skill-entities';
import { CompatibilityLevel } from './skill-types';

/**
 * Skill metadata and management information
 */
export interface SkillMetadata {
  /** Creation timestamp */
  createdAt: Date;

  /** Last updated timestamp */
  updatedAt: Date;

  /** Loading timestamp */
  loadedAt?: Date;

  /** Skill author or contributor */
  author: string;

  /** Version history */
  versionHistory: SkillVersion[];

  /** Tags for categorization and discovery */
  tags: string[];

  /** Related skills (similar, complementary, alternative) */
  relatedSkills: {
    similar?: string[];
    complementary?: string[];
    alternative?: string[];
  };

  /** Learning resources and documentation */
  resources: SkillResource[];

  /** Usage statistics and analytics */
  usage?: SkillUsageStats;

  /** Quality indicators and certifications */
  quality?: SkillQuality;

  /** Source of the skill */
  source?: string;

  /** Compatible agents */
  compatibleAgents?: AgentRole[];

  /** Compatibility information */
  compatibility?: CompatibilityLevel;
}

/**
 * Skill loading options
 */
export interface SkillLoadOptions {
  /** Force reload even if already loaded */
  force?: boolean;

  /** Load dependencies automatically */
  loadDependencies?: boolean;

  /** Skip validation (not recommended) */
  skipValidation?: boolean;

  /** Custom configuration parameters */
  config?: Record<string, unknown>;
}

/**
 * Skill request for loading or registration
 */
export interface SkillRequest {
  /** Skill identifier or path */
  identifier: string;

  /** Request options */
  options: SkillLoadOptions;

  /** Input data for the skill */
  input?: Record<string, unknown>;
}

/**
 * Result from skill execution containing output and performance metrics
 */
export interface SkillExecutionResult<TData = unknown> {
  /** Whether the skill execution was successful */
  success: boolean;

  /** The result data from the skill execution */
  result: TData | string;

  /** Performance metrics from the skill execution */
  performance: SkillPerformance;
}

/**
 * Skill search and filter criteria
 */
export interface SkillSearchCriteria {
  /** Search query string */
  query?: string;

  /** Filter by domain */
  domain?: string;

  /** Filter by category */
  category?: string;

  /** Filter by agent role compatibility */
  agentRole?: AgentRole;

  /** Filter by compatibility level */
  compatibilityLevel?: CompatibilityLevel;

  /** Filter by tags */
  tags?: string[];

  /** Filter by complexity */
  complexity?: 'simple' | 'moderate' | 'complex' | 'expert';

  /** Maximum number of results */
  limit?: number;

  /** Sort order */
  sortBy?: string;

  /** Filter by minimum version */
  minVersion?: string;

  /** Filter by compatibility */
  compatibility?: CompatibilityLevel;
}
