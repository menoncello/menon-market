/**
 * Skill Factory Utilities
 * Utilities for creating skill definitions from different sources
 */

import {
  UNKNOWN_ERROR_MESSAGE,
  CROSS_CUTTING_DOMAIN,
  DEFAULT_VERSION,
  DEFAULT_EXECUTION_TIME,
  DEFAULT_COMPLEXITY,
} from './loader-constants';
import { BaseSkillConfig } from './loader-types';

/**
 * Factory class for creating skill definitions
 */
export class SkillFactory {
  /**
   * Create base skill definition with common properties
   * @param {BaseSkillConfig} config - Skill configuration object
   * @returns {import('./types').SkillDefinition} Base skill definition
   */
  static createBaseSkill(config: BaseSkillConfig): import('./types').SkillDefinition {
    const now = new Date();
    const performance = SkillFactory.createPerformanceMetrics(config.resourceUsage);
    const metadata = SkillFactory.createMetadata(now, config.author, config.tags);

    return {
      id: SkillFactory.extractSkillId(config.skillPath),
      name: config.name,
      description: config.description,
      domain: CROSS_CUTTING_DOMAIN,
      category: config.category,
      version: DEFAULT_VERSION,
      dependencies: [],
      compatibility: [],
      capabilities: [],
      examples: [],
      performance,
      metadata,
      tags: config.tags,
    };
  }

  /**
   * Create performance metrics object
   * @param {object} resourceUsage - Resource usage configuration
   * @param {import('./skill-types').ResourceUsageLevel} resourceUsage.memory - Memory usage level
   * @param {import('./skill-types').ResourceUsageLevel} resourceUsage.cpu - CPU usage level
   * @param {import('./skill-types').NetworkUsageLevel} resourceUsage.network - Network usage level
   * @returns {import('./performance-types').SkillPerformance} Performance metrics
   */
  static createPerformanceMetrics(resourceUsage: {
    memory: import('./skill-types').ResourceUsageLevel;
    cpu: import('./skill-types').ResourceUsageLevel;
    network: import('./skill-types').NetworkUsageLevel;
  }): import('./performance-types').SkillPerformance {
    return {
      executionTime: DEFAULT_EXECUTION_TIME,
      resourceUsage,
      complexity: DEFAULT_COMPLEXITY,
    };
  }

  /**
   * Create metadata object
   * @param {Date} now - Current timestamp
   * @param {string} author - Skill author
   * @param {string[]} tags - Skill tags
   * @returns {import('./skill-metadata').SkillMetadata} Metadata object
   */
  static createMetadata(
    now: Date,
    author: string,
    tags: string[]
  ): import('./skill-metadata').SkillMetadata {
    return {
      createdAt: now,
      updatedAt: now,
      loadedAt: now,
      author,
      versionHistory: [],
      tags,
      relatedSkills: {},
      resources: [],
    };
  }

  /**
   * Create standardized loading error
   * @param {string} sourceType - Type of source (package, URL, registry)
   * @param {string} sourcePath - Path or identifier of the source
   * @param {unknown} error - Original error
   * @returns {Error} Formatted loading error
   */
  static createLoadingError(sourceType: string, sourcePath: string, error: unknown): Error {
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return new Error(`Failed to load skill from ${sourceType} ${sourcePath}: ${errorMessage}`);
  }

  /**
   * Extract skill ID from path
   * @param {string} skillPath - Skill path
   * @returns {string} Extracted skill ID
   */
  static extractSkillId(skillPath: string): string {
    // Extract filename or last part of path
    const parts = skillPath.split('/');
    const lastPart = parts[parts.length - 1];

    // Remove file extension if present
    const idWithoutExt = lastPart.replace(/\.(ts|js|json)$/, '');

    // Convert to valid identifier
    return idWithoutExt.replace(/[^\w-]/g, '-');
  }

  /**
   * Add source information to skill metadata
   * @param {import('./types').SkillDefinition} skill - Base skill definition
   * @param {string} source - Source information
   * @returns {import('./types').SkillDefinition} Skill with updated metadata
   */
  static addSourceToMetadata(
    skill: import('./types').SkillDefinition,
    source: string
  ): import('./types').SkillDefinition {
    return {
      ...skill,
      metadata: {
        ...skill.metadata,
        source,
      },
    };
  }
}
