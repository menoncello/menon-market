/**
 * Core skill definition types for ClaudeCode SuperPlugin ecosystem
 * Main entry point for all skill-related type definitions
 */

import { AgentRole } from '../agents/types';

// Import all type definitions from modular files
export * from './skill-types';
export * from './performance-types';
export * from './validation-types';
export * from './skill-entities';
export * from './skill-metadata';

// Re-export AgentRole for use in other modules
export type { AgentRole };

/**
 * Comprehensive skill definition interface
 * Encompasses skill metadata, capabilities, dependencies, and compatibility information
 */
export interface SkillDefinition {
  /** Unique identifier for the skill */
  id: string;

  /** Human-readable name of the skill */
  name: string;

  /** Detailed description of the skill's purpose and capabilities */
  description: string;

  /** Skill domain category */
  domain: import('./skill-types').SkillDomain;

  /** Skill category within the domain */
  category: import('./skill-types').SkillCategory;

  /** Skill version following semantic versioning */
  version: string;

  /** List of skills this skill depends on */
  dependencies: Array<import('./skill-entities').SkillDependency>;

  /** Compatibility information for different agent types */
  compatibility: Array<import('./skill-entities').AgentCompatibility>;

  /** Specific capabilities and features provided by this skill */
  capabilities: Array<import('./skill-entities').SkillCapability>;

  /** Usage examples and patterns for this skill */
  examples: Array<import('./skill-entities').SkillExample>;

  /** Performance and execution characteristics */
  performance: import('./performance-types').SkillPerformance;

  /** Skill metadata and management information */
  metadata: import('./skill-metadata').SkillMetadata;

  /** Tags for categorization and discovery */
  tags: string[];

  /** Estimated execution time in minutes */
  estimatedExecutionTime?: number;

  /** Resource requirements for this skill */
  resourceRequirements?: {
    memory: import('./skill-types').ResourceUsageLevel;
    cpu: import('./skill-types').ResourceUsageLevel;
    network: import('./skill-types').NetworkUsageLevel;
  };

  /** Complexity level */
  complexity?: import('./skill-types').ComplexityLevel;

  /** Expected success rate (0-1) */
  expectedSuccessRate?: number;

  /** Error handling capabilities */
  errorHandling?: {
    retries: number;
    fallback: boolean;
    timeout: number;
  };

  /** Whether this skill is cacheable */
  cacheable?: boolean;
}
