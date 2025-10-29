/**
 * Skill Loader Validation and Metadata Management
 * Handles validation, metadata tracking, and statistics for loaded skills
 */

import { SkillLoadMetadata, SkillLoadStrategy, DEFAULT_CACHE_HIT_RATE } from './loader-config';
import { SkillRegistry } from './registry';
import { SkillDefinition, SkillLoadOptions } from './types';

// Re-export DEFAULT_CACHE_HIT_RATE for other modules
export { DEFAULT_CACHE_HIT_RATE };

/**
 * Validation and metadata manager for skill loading
 */
export class SkillValidationManager {
  private loadMetadata = new Map<string, SkillLoadMetadata>();
  private cacheHits = 0;
  private cacheMisses = 0;

  /**
   * Validate skill definition
   * @param {SkillDefinition} skill - Skill to validate
   * @param {SkillLoadOptions} options - Loading options
   * @throws {Error} If skill validation fails
   */
  validateSkill(skill: SkillDefinition, options: SkillLoadOptions): void {
    if (!options.skipValidation) {
      const registry = new SkillRegistry();
      const validation = registry.validateSkill(skill);
      if (!validation.valid) {
        throw new Error(
          `Skill validation failed: ${validation.errors.map(e => e.message).join(', ')}`
        );
      }
    }
  }

  /**
   * Record load metadata for a skill
   * @param {string} skillPath - Path where skill was loaded from
   * @param {SkillDefinition} skill - Loaded skill definition
   * @param {SkillLoadStrategy} strategy - Loading strategy used
   * @param {number} loadTime - Time taken to load skill in milliseconds
   */
  recordLoadMetadata(
    skillPath: string,
    skill: SkillDefinition,
    strategy: SkillLoadStrategy,
    loadTime: number
  ): void {
    const metadata: SkillLoadMetadata = {
      skillId: skill.id,
      strategy,
      source: skillPath,
      loadedAt: new Date(),
      isLoaded: true,
      loadTime,
    };

    this.loadMetadata.set(skill.id, metadata);
  }

  /**
   * Get load metadata for a skill
   * @param {string} skillName - Name or ID of the skill
   * @returns {SkillLoadMetadata|null} Load metadata or null if not found
   */
  getLoadMetadata(skillName: string): SkillLoadMetadata | null {
    return this.loadMetadata.get(skillName) || null;
  }

  /**
   * Remove load metadata for a skill
   * @param {string} skillName - Name of the skill
   */
  removeLoadMetadata(skillName: string): void {
    this.loadMetadata.delete(skillName);
  }

  /**
   * Get all currently loaded skills
   * @returns {SkillLoadMetadata[]} Array of load metadata for all loaded skills
   */
  getLoadedSkills(): SkillLoadMetadata[] {
    return Array.from(this.loadMetadata.values());
  }

  /**
   * Check if a skill is currently loaded
   * @param {string} skillName - Name or ID of the skill to check
   * @returns {boolean} Whether the skill is loaded
   */
  isLoaded(skillName: string): boolean {
    return this.loadMetadata.has(skillName);
  }

  /**
   * Clear all load metadata
   */
  clearMetadata(): void {
    this.loadMetadata.clear();
  }

  /**
   * Record cache hit
   */
  recordCacheHit(): void {
    this.cacheHits++;
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(): void {
    this.cacheMisses++;
  }

  /**
   * Calculate cache hit rate
   * @returns {number} Cache hit rate as a percentage (0-1)
   */
  calculateCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total > 0 ? this.cacheHits / total : DEFAULT_CACHE_HIT_RATE;
  }

  /**
   * Get loader statistics
   * @returns {object} Loader usage and performance statistics
   */
  getStats(): {
    loadedSkills: number;
    totalLoadTime: number;
    averageLoadTime: number;
    cacheHitRate: number;
  } {
    const loadedSkills = Array.from(this.loadMetadata.values());
    const totalLoadTime = loadedSkills.reduce((sum, meta) => sum + meta.loadTime, 0);
    const averageLoadTime = loadedSkills.length > 0 ? totalLoadTime / loadedSkills.length : 0;

    return {
      loadedSkills: loadedSkills.length,
      totalLoadTime,
      averageLoadTime,
      cacheHitRate: this.calculateCacheHitRate(),
    };
  }

  /**
   * Reset cache statistics
   */
  resetCacheStats(): void {
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Get the number of loaded skills
   * @returns {number} Number of loaded skills
   */
  get loadedSkillsCount(): number {
    return this.loadMetadata.size;
  }
}
