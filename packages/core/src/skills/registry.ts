/**
 * Skill Registry Implementation
 * Provides centralized skill management, registration, discovery, and compatibility checking
 */

import { SKILL_EXECUTION_PERFORMANCE } from './constants';
import { SkillRegistry as CoreSkillRegistry } from './registry-core';
import {
  SkillDefinition,
  SkillSearchCriteria,
  SkillRequest,
  SkillPerformance,
  SkillExecutionResult,
} from './types';

/** Global skill registry instance */
let globalRegistry: SkillRegistry | null = null;

/**
 * Extended skill registry with additional functionality
 */
export class SkillRegistry extends CoreSkillRegistry {
  /**
   * Search for skills based on specified criteria
   * @param {SkillSearchCriteria} criteria - Search criteria including filters for category, tags, etc.
   * @returns {SkillDefinition[]} Array of skills matching the search criteria
   */
  search(criteria: SkillSearchCriteria): SkillDefinition[] {
    // Update search manager's skills map with current skills
    this.searchManager.skills = new Map(this.getAllSkills().map(skill => [skill.id, skill]));
    return this.searchManager.search(criteria);
  }

  /**
   * Find skills by category
   * @param {string} category - Category name to filter skills by
   * @returns {SkillDefinition[]} Array of skills belonging to the specified category
   */
  findByCategory(category: string): SkillDefinition[] {
    // Update search manager's skills map with current skills
    this.searchManager.skills = new Map(this.getAllSkills().map(skill => [skill.id, skill]));
    return this.searchManager.findByCategory(category);
  }

  /**
   * Find skills by tags
   * @param {string[]} tags - Array of tag names to filter skills by
   * @returns {SkillDefinition[]} Array of skills that match all specified tags
   */
  findByTags(tags: string[]): SkillDefinition[] {
    // Update search manager's skills map with current skills
    this.searchManager.skills = new Map(this.getAllSkills().map(skill => [skill.id, skill]));
    return this.searchManager.findByTags(tags);
  }

  /**
   * Get all skill categories available in the registry
   * @returns {string[]} Array of unique category names from all registered skills
   */
  getCategories(): string[] {
    // Update search manager's skills map with current skills
    this.searchManager.skills = new Map(this.getAllSkills().map(skill => [skill.id, skill]));
    return this.searchManager.getCategories();
  }

  /**
   * Get all tags available in the registry
   * @returns {string[]} Array of unique tag names from all registered skills
   */
  getTags(): string[] {
    // Update search manager's skills map with current skills
    this.searchManager.skills = new Map(this.getAllSkills().map(skill => [skill.id, skill]));
    return this.searchManager.getTags();
  }

  /**
   * Execute a skill with the given request
   * @param {string} skillId - ID of the skill to execute
   * @param {SkillRequest} request - Skill execution request containing input parameters
   * @returns {Promise<SkillExecutionResult<string>>} Skill execution result with performance metrics
   * @throws {Error} When skill with specified ID is not found in registry
   */
  async executeSkill(
    skillId: string,
    request: SkillRequest
  ): Promise<SkillExecutionResult<string>> {
    const skill = this.findSkill(skillId);
    if (!skill) {
      throw new Error(`Skill '${skillId}' not found in registry`);
    }

    // This is a placeholder implementation
    // In a real implementation, this would execute the skill
    return this.createSkillExecutionResult(skillId, request);
  }

  /**
   * Create skill execution result with performance metrics
   * @param {string} skillId - ID of the executed skill
   * @param {SkillRequest} request - Skill execution request
   * @returns {SkillExecutionResult<string>} Complete execution result
   * @private
   */
  private createSkillExecutionResult(
    skillId: string,
    request: SkillRequest
  ): SkillExecutionResult<string> {
    return {
      success: true,
      result: this.generateResultMessage(skillId, request),
      performance: this.createPerformanceMetrics(),
    };
  }

  /**
   * Generate result message for skill execution
   * @param {string} skillId - ID of the executed skill
   * @param {SkillRequest} request - Skill execution request
   * @returns {string} Formatted result message
   * @private
   */
  private generateResultMessage(skillId: string, request: SkillRequest): string {
    return `Skill ${skillId} executed with input: ${JSON.stringify(request.input)}`;
  }

  /**
   * Create performance metrics for skill execution
   * @returns {SkillPerformance} Performance metrics object
   * @private
   */
  private createPerformanceMetrics(): SkillPerformance {
    return {
      executionTime: {
        min: SKILL_EXECUTION_PERFORMANCE.EXECUTION_TIME.MIN_MS,
        max: SKILL_EXECUTION_PERFORMANCE.EXECUTION_TIME.MAX_MS,
        average: SKILL_EXECUTION_PERFORMANCE.EXECUTION_TIME.AVERAGE_MS,
      },
      resourceUsage: {
        memory: 'low',
        cpu: 'low',
        network: 'none',
      },
      complexity: 'moderate',
      numericResourceUsage: {
        memory: SKILL_EXECUTION_PERFORMANCE.RESOURCE_USAGE.MEMORY_BYTES,
        cpu: SKILL_EXECUTION_PERFORMANCE.RESOURCE_USAGE.CPU_PERCENTAGE,
        network: 0,
      },
    } as SkillPerformance;
  }
}

/**
 * Get the global skill registry instance
 * Creates a new instance if one doesn't exist
 * @returns {SkillRegistry} The global skill registry instance
 */
export function getSkillRegistry(): SkillRegistry {
  if (!globalRegistry) {
    globalRegistry = new SkillRegistry();
  }
  return globalRegistry;
}

/**
 * Reset the global skill registry instance
 * Clears all registered skills and removes the global instance
 * @returns {void}
 */
export function resetSkillRegistry(): void {
  if (globalRegistry) {
    globalRegistry.clear();
  }
  globalRegistry = null;
}
