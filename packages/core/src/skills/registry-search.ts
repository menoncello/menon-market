/**
 * Skill Registry Search and Discovery
 * Handles skill searching, filtering, and discovery functionality
 */

import { SkillDefinition, AgentRole, SkillSearchCriteria, CompatibilityLevel } from './types';

/**
 * Skill search and discovery functionality
 */
export class SkillSearchManager {
  public skills: Map<string, SkillDefinition>;

  /**
   * Create skill search manager
   * @param {Map<string, SkillDefinition>} skills - Skills map to search
   */
  constructor(skills: Map<string, SkillDefinition>) {
    this.skills = skills;
  }

  /**
   * Search for skills based on criteria
   * @param {SkillSearchCriteria} criteria - Search criteria
   * @returns {SkillDefinition[]} Array of matching skills
   */
  search(criteria: SkillSearchCriteria): SkillDefinition[] {
    let results = Array.from(this.skills.values());

    results = this.applyFilters(results, criteria);
    results = this.applySortingAndLimiting(results, criteria);

    return results;
  }

  /**
   * Apply all filters to the results
   * @param {SkillDefinition[]} results - Current results
   * @param {SkillSearchCriteria} criteria - Search criteria
   * @returns {SkillDefinition[]} Filtered results
   * @private
   */
  private applyFilters(
    results: SkillDefinition[],
    criteria: SkillSearchCriteria
  ): SkillDefinition[] {
    results = this.applyBasicFilters(results, criteria);
    results = this.applyAdvancedFilters(results, criteria);
    return results;
  }

  /**
   * Apply basic filters (query, domain, category, tags)
   * @param {SkillDefinition[]} results - Current results
   * @param {SkillSearchCriteria} criteria - Search criteria
   * @returns {SkillDefinition[]} Filtered results
   * @private
   */
  private applyBasicFilters(
    results: SkillDefinition[],
    criteria: SkillSearchCriteria
  ): SkillDefinition[] {
    if (criteria.query) {
      results = this.filterByQuery(results, criteria.query);
    }

    if (criteria.domain) {
      results = this.filterByDomain(results, criteria.domain);
    }

    if (criteria.category) {
      results = this.filterByCategory(results, criteria.category);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      results = this.filterByTags(results, criteria.tags);
    }

    return results;
  }

  /**
   * Apply advanced filters (agent role, compatibility, complexity, version)
   * @param {SkillDefinition[]} results - Current results
   * @param {SkillSearchCriteria} criteria - Search criteria
   * @returns {SkillDefinition[]} Filtered results
   * @private
   */
  private applyAdvancedFilters(
    results: SkillDefinition[],
    criteria: SkillSearchCriteria
  ): SkillDefinition[] {
    if (criteria.agentRole) {
      results = this.filterByAgentRole(results, criteria.agentRole);
    }

    if (criteria.compatibilityLevel) {
      results = this.filterByCompatibilityLevel(results, criteria.compatibilityLevel);
    }

    if (criteria.compatibility) {
      results = this.filterByCompatibility(results, criteria.compatibility);
    }

    if (criteria.complexity) {
      results = this.filterByComplexity(results, criteria.complexity);
    }

    if (criteria.minVersion) {
      results = this.filterByMinVersion(results, criteria.minVersion);
    }

    return results;
  }

  /**
   * Apply sorting and limiting to the results
   * @param {SkillDefinition[]} results - Current results
   * @param {SkillSearchCriteria} criteria - Search criteria
   * @returns {SkillDefinition[]} Sorted and limited results
   * @private
   */
  private applySortingAndLimiting(
    results: SkillDefinition[],
    criteria: SkillSearchCriteria
  ): SkillDefinition[] {
    if (criteria.sortBy) {
      results = this.sortResults(results, criteria.sortBy);
    }

    if (criteria.limit && criteria.limit > 0) {
      results = results.slice(0, criteria.limit);
    }

    return results;
  }

  /**
   * Find skill by ID
   * @param {string} id - Skill ID to find
   * @returns {SkillDefinition | undefined} Skill definition or undefined if not found
   */
  findById(id: string): SkillDefinition | undefined {
    return this.skills.get(id);
  }

  /**
   * Find skills by category
   * @param {string} category - Category to filter by
   * @returns {SkillDefinition[]} Array of skills in the category
   */
  findByCategory(category: string): SkillDefinition[] {
    return Array.from(this.skills.values()).filter(skill => skill.category === category);
  }

  /**
   * Find skills by tags
   * @param {string[]} tags - Tags to filter by
   * @returns {SkillDefinition[]} Array of skills with matching tags
   */
  findByTags(tags: string[]): SkillDefinition[] {
    return Array.from(this.skills.values()).filter(skill =>
      tags.some(tag => skill.tags?.includes(tag))
    );
  }

  /**
   * Get all skill categories
   * @returns {string[]} Array of unique category names
   */
  getCategories(): string[] {
    const categories = Array.from(this.skills.values()).map(skill => skill.category);
    return [...new Set(categories)].filter(Boolean);
  }

  /**
   * Get all tags
   * @returns {string[]} Array of unique tag names
   */
  getTags(): string[] {
    const allTags = Array.from(this.skills.values()).flatMap(skill => skill.tags || []);
    return [...new Set(allTags)];
  }

  /**
   * Filter skills by search query
   * @param {SkillDefinition[]} skills - Skills to filter
   * @param {string} query - Search query
   * @returns {SkillDefinition[]} Filtered skills
   * @private
   */
  private filterByQuery(skills: SkillDefinition[], query: string): SkillDefinition[] {
    const lowercaseQuery = query.toLowerCase();
    return skills.filter(
      skill =>
        skill.name.toLowerCase().includes(lowercaseQuery) ||
        skill.description.toLowerCase().includes(lowercaseQuery) ||
        skill.id.toLowerCase().includes(lowercaseQuery) ||
        skill.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Filter skills by category
   * @param {SkillDefinition[]} skills - Skills to filter
   * @param {string} category - Category to filter by
   * @returns {SkillDefinition[]} Filtered skills
   * @private
   */
  private filterByCategory(skills: SkillDefinition[], category: string): SkillDefinition[] {
    return skills.filter(skill => skill.category === category);
  }

  /**
   * Filter skills by tags
   * @param {SkillDefinition[]} skills - Skills to filter
   * @param {string[]} tags - Tags to filter by
   * @returns {SkillDefinition[]} Filtered skills
   * @private
   */
  private filterByTags(skills: SkillDefinition[], tags: string[]): SkillDefinition[] {
    return skills.filter(skill => tags.some(tag => skill.tags?.includes(tag)));
  }

  /**
   * Filter skills by agent role
   * @param {SkillDefinition[]} skills - Skills to filter
   * @param {AgentRole} agentRole - Agent role to filter by
   * @returns {SkillDefinition[]} Filtered skills
   * @private
   */
  private filterByAgentRole(skills: SkillDefinition[], agentRole: AgentRole): SkillDefinition[] {
    return skills.filter(
      skill =>
        skill.compatibility?.some(comp => comp.agentRole === agentRole) ||
        skill.metadata?.compatibleAgents?.includes(agentRole)
    );
  }

  /**
   * Filter skills by minimum version
   * @param {SkillDefinition[]} skills - Skills to filter
   * @param {string} minVersion - Minimum version
   * @returns {SkillDefinition[]} Filtered skills
   * @private
   */
  private filterByMinVersion(skills: SkillDefinition[], minVersion: string): SkillDefinition[] {
    return skills.filter(skill => {
      // Simple version comparison - could be enhanced with semver library
      return this.compareVersions(skill.version, minVersion) >= 0;
    });
  }

  /**
   * Filter skills by compatibility level
   * @param {SkillDefinition[]} skills - Skills to filter
   * @param {CompatibilityLevel} compatibility - Minimum compatibility level
   * @returns {SkillDefinition[]} Filtered skills
   * @private
   */
  private filterByCompatibility(
    skills: SkillDefinition[],
    compatibility: CompatibilityLevel
  ): SkillDefinition[] {
    return skills.filter(skill => {
      const skillCompatibility = skill.metadata?.compatibility || 'unknown';
      return (
        this.getCompatibilityScore(skillCompatibility) >= this.getCompatibilityScore(compatibility)
      );
    });
  }

  /**
   * Compare two version strings
   * @param {string} version1 - First version
   * @param {string} version2 - Second version
   * @returns {number} -1, 0, or 1 for less than, equal, or greater than
   * @private
   */
  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    const maxLength = Math.max(v1Parts.length, v2Parts.length);

    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }

    return 0;
  }

  /**
   * Get numeric score for compatibility level
   * @param {CompatibilityLevel} compatibility - Compatibility level
   * @returns {number} Numeric score
   * @private
   */
  private getCompatibilityScore(compatibility: CompatibilityLevel): number {
    const scores: Record<CompatibilityLevel, number> = {
      unknown: 0,
      limited: 1,
      partial: 2,
      compatible: 3,
      optimal: 4,
      full: 5,
    };
    return scores[compatibility] || 0;
  }

  /**
   * Filter skills by domain
   * @param {SkillDefinition[]} skills - Skills to filter
   * @param {string} domain - Domain to filter by
   * @returns {SkillDefinition[]} Filtered skills
   * @private
   */
  private filterByDomain(skills: SkillDefinition[], domain: string): SkillDefinition[] {
    return skills.filter(skill => skill.domain === domain);
  }

  /**
   * Filter skills by complexity
   * @param {SkillDefinition[]} skills - Skills to filter
   * @param {string} complexity - Complexity to filter by
   * @returns {SkillDefinition[]} Filtered skills
   * @private
   */
  private filterByComplexity(skills: SkillDefinition[], complexity: string): SkillDefinition[] {
    return skills.filter(skill => skill.performance?.complexity === complexity);
  }

  /**
   * Filter skills by compatibility level
   * @param {SkillDefinition[]} skills - Skills to filter
   * @param {CompatibilityLevel} compatibilityLevel - Minimum compatibility level
   * @returns {SkillDefinition[]} Filtered skills
   * @private
   */
  private filterByCompatibilityLevel(
    skills: SkillDefinition[],
    compatibilityLevel: CompatibilityLevel
  ): SkillDefinition[] {
    return skills.filter(skill => {
      return skill.compatibility?.some(
        comp =>
          this.getCompatibilityScore(comp.level) >= this.getCompatibilityScore(compatibilityLevel)
      );
    });
  }

  /**
   * Sort search results
   * @param {SkillDefinition[]} skills - Skills to sort
   * @param {string} sortBy - Sort criteria
   * @returns {SkillDefinition[]} Sorted skills
   * @private
   */
  private sortResults(skills: SkillDefinition[], sortBy: string): SkillDefinition[] {
    const sortedSkills = [...skills];

    switch (sortBy) {
      case 'name':
        return sortedSkills.sort((a, b) => a.name.localeCompare(b.name));

      case 'version':
        return sortedSkills.sort((a, b) => this.compareVersions(a.version, b.version));

      case 'complexity':
        const complexityOrder = { simple: 1, moderate: 2, complex: 3, expert: 4 };
        return sortedSkills.sort((a, b) => {
          const aComplexity =
            complexityOrder[a.performance?.complexity as keyof typeof complexityOrder] || 0;
          const bComplexity =
            complexityOrder[b.performance?.complexity as keyof typeof complexityOrder] || 0;
          return aComplexity - bComplexity;
        });

      case 'usage':
        return sortedSkills.sort((a, b) => {
          const aUsage = a.metadata?.usage?.totalUses || 0;
          const bUsage = b.metadata?.usage?.totalUses || 0;
          return bUsage - aUsage; // Descending order
        });

      default:
        // Default sort by name if invalid sort criteria
        return sortedSkills.sort((a, b) => a.name.localeCompare(b.name));
    }
  }
}
