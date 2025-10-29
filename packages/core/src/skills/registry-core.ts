/**
 * Core Skill Registry Implementation
 * Provides basic skill registration and management functionality
 */

import { SkillLoader } from './loader';
import { SkillSearchManager } from './registry-search';
import { SkillValidator } from './registry-validation';
import { SkillDefinition, SkillValidationResult, AgentRole, CompatibilityLevel } from './types';

/**
 * Memory usage information for registry statistics
 */
interface MemoryUsageInfo {
  /** Number of skills in memory */
  skills: number;
  /** Memory usage in megabytes */
  memoryMB: number;
}

/**
 * Constants for memory calculation and formatting
 */
const MEMORY_CONSTANTS = {
  /** Bytes to kilobytes conversion factor */
  BYTES_TO_KB: 1024,
  /** Kilobytes to megabytes conversion factor */
  KB_TO_MB: 1024,
  /** Decimal precision for memory calculation */
  DECIMAL_PRECISION: 100,
} as const;

/**
 * Interface for dependency resolution parameters
 */
interface DependencyResolutionParams {
  /** Dependency identifier to resolve */
  depId: string;
  /** Whether the dependency is required */
  required: boolean;
  /** Reason for the dependency */
  reason: string;
  /** Set of currently visiting dependencies */
  visiting: Set<string>;
  /** Set of already visited dependencies */
  visited: Set<string>;
}

/**
 * Centralized skill registry for managing all agent skills
 */
export class SkillRegistry {
  private skills: Map<string, SkillDefinition> = new Map();
  private loader: SkillLoader;
  private loadedAt: Date;
  private validator: SkillValidator;
  public searchManager: SkillSearchManager;

  /**
   * Creates a new skill registry instance
   * @param {SkillLoader} [loader] - Optional skill loader instance to use
   */
  constructor(loader?: SkillLoader) {
    this.loader = loader || new SkillLoader();
    this.loadedAt = new Date();
    this.validator = new SkillValidator();
    this.searchManager = new SkillSearchManager(this.skills);
  }

  /**
   * Register a new skill in the registry
   * @param {SkillDefinition} skill - Skill definition to register
   * @throws {Error} Error if skill already exists or validation fails
   */
  register(skill: SkillDefinition): void {
    this.validateSkill(skill);

    if (this.skills.has(skill.id)) {
      throw new Error(`Skill with id '${skill.id}' is already registered`);
    }

    this.skills.set(skill.id, skill);
  }

  /**
   * Unregister a skill from the registry
   * @param {string} skillName - Name or ID of the skill to unregister
   * @throws {Error} Error if skill not found
   */
  unregister(skillName: string): void {
    const skill = this.findSkill(skillName);
    if (!skill) {
      throw new Error(`Skill '${skillName}' not found in registry`);
    }

    this.skills.delete(skill.id);
  }

  /**
   * Validate a skill definition
   * @param {SkillDefinition} skill - Skill to validate
   * @returns {SkillValidationResult} Validation result
   */
  validateSkill(skill: SkillDefinition): SkillValidationResult {
    return this.validator.validateSkill(skill);
  }

  /**
   * Find a skill by ID or name
   * @param {string} skillName - Name or ID of the skill to find
   * @returns {SkillDefinition | undefined} Skill definition or undefined if not found
   */
  findSkill(skillName: string): SkillDefinition | undefined {
    // First try to find by ID
    let skill = this.searchManager.findById(skillName);

    // If not found by ID, try to find by name
    if (!skill) {
      skill = this.getAllSkills().find(s => s.name === skillName);
    }

    return skill;
  }

  /**
   * Find skills compatible with a specific agent type
   * @param {AgentRole} agentType - Agent role to find compatible skills for
   * @param {CompatibilityLevel} [compatibilityLevel] - Minimum compatibility level required
   * @returns {SkillDefinition[]} Array of compatible skill definitions
   */
  findCompatible(
    agentType: AgentRole,
    compatibilityLevel: CompatibilityLevel = 'partial'
  ): SkillDefinition[] {
    const allSkills = Array.from(this.skills.values());
    return allSkills.filter(skill => {
      const compatibility = skill.compatibility?.find(comp => comp.agentRole === agentType);
      return (
        compatibility &&
        this.isCompatibilityLevelSufficient(compatibility.level, compatibilityLevel)
      );
    });
  }

  /**
   * Get all registered skills
   * @returns {SkillDefinition[]} Array of all registered skill definitions
   */
  getAllSkills(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }

  /**
   * Get registry statistics
   * @returns {{totalSkills: number; domains: number; loadedAt: Date; categories: number; tags: string[]; memoryUsage: MemoryUsageInfo}} Registry statistics
   */
  getStats(): {
    totalSkills: number;
    domains: number;
    loadedAt: Date;
    categories: number;
    tags: string[];
    memoryUsage: MemoryUsageInfo;
  } {
    const skills = this.getAllSkills();
    const uniqueCategories = new Set(skills.map(skill => skill.category));

    return {
      totalSkills: this.skills.size,
      domains: new Set(skills.map(skill => skill.domain)).size,
      loadedAt: this.loadedAt,
      categories: uniqueCategories.size,
      tags: this.searchManager.getTags(),
      memoryUsage: {
        skills: this.skills.size,
        memoryMB:
          Math.round(
            (process.memoryUsage().heapUsed /
              MEMORY_CONSTANTS.BYTES_TO_KB /
              MEMORY_CONSTANTS.KB_TO_MB) *
              MEMORY_CONSTANTS.DECIMAL_PRECISION
          ) / MEMORY_CONSTANTS.DECIMAL_PRECISION,
      },
    };
  }

  /**
   * Load and register a skill from path
   * @param {string} skillPath - Path to the skill to load
   * @returns {Promise<SkillDefinition>} Loaded and registered skill definition
   */
  async loadAndRegister(skillPath: string): Promise<SkillDefinition> {
    const skill = await this.loader.load(skillPath);
    this.register(skill);
    return skill;
  }

  /**
   * Check if compatibility level is sufficient
   * @param {CompatibilityLevel} skillLevel - Skill's compatibility level
   * @param {CompatibilityLevel} requiredLevel - Required compatibility level
   * @returns {boolean} Whether the skill level meets or exceeds requirements
   * @private
   */
  private isCompatibilityLevelSufficient(
    skillLevel: CompatibilityLevel,
    requiredLevel: CompatibilityLevel
  ): boolean {
    const levels: Record<CompatibilityLevel, number> = {
      unknown: 0,
      limited: 1,
      partial: 2,
      compatible: 3,
      optimal: 4,
      full: 5,
    };

    return levels[skillLevel] >= levels[requiredLevel];
  }

  /**
   * Clear all skills from registry
   */
  clear(): void {
    this.skills.clear();
  }

  /**
   * Check if registry has any skills
   * @returns {boolean} Whether registry is empty
   */
  isEmpty(): boolean {
    return this.skills.size === 0;
  }

  /**
   * Get number of registered skills
   * @returns {number} Number of skills in registry
   */
  size(): number {
    return this.skills.size;
  }

  /**
   * Get a skill by ID or name (alias for findSkill)
   * @param {string} skillId - ID or name of the skill to retrieve
   * @returns {SkillDefinition | null} Skill definition or null if not found
   */
  getSkill(skillId: string): SkillDefinition | null {
    return this.findSkill(skillId) || null;
  }

  /**
   * Get skills by domain
   * @param {string} domain - Domain to filter skills by
   * @returns {SkillDefinition[]} Array of skills in the specified domain
   */
  getSkillsByDomain(domain: string): SkillDefinition[] {
    return this.getAllSkills().filter(skill => skill.domain === domain);
  }

  /**
   * Get skills by category
   * @param {string} category - Category to filter skills by
   * @returns {SkillDefinition[]} Array of skills in the specified category
   */
  getSkillsByCategory(category: string): SkillDefinition[] {
    return this.getAllSkills().filter(skill => skill.category === category);
  }

  /**
   * Resolve dependencies for a skill
   * @param {SkillDefinition} skill - Skill to resolve dependencies for
   * @returns {SkillDefinition[]} Array of resolved dependency skills
   * @throws {Error} When circular dependency detected or required dependency missing
   */
  resolveDependencies(skill: SkillDefinition): SkillDefinition[] {
    const resolved: SkillDefinition[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    this.processSkillDependencies(skill, resolved, visiting, visited);

    return resolved;
  }

  /**
   * Process all dependencies of a skill
   * @param {SkillDefinition} skill - Skill whose dependencies to process
   * @param {SkillDefinition[]} resolved - Array to store resolved dependencies
   * @param {Set<string>} visiting - Set of currently visiting dependencies
   * @param {Set<string>} visited - Set of already visited dependencies
   */
  private processSkillDependencies(
    skill: SkillDefinition,
    resolved: SkillDefinition[],
    visiting: Set<string>,
    visited: Set<string>
  ): void {
    for (const dep of skill.dependencies) {
      const resolvedDep = this.resolveDependency({
        depId: dep.skillId,
        required: dep.required || false,
        reason: dep.reason,
        visiting,
        visited,
      });
      if (resolvedDep) {
        resolved.push(resolvedDep);
      }
    }
  }

  /**
   * Resolve a single dependency recursively
   * @param {DependencyResolutionParams} params - Dependency resolution parameters
   * @returns {SkillDefinition|null} Resolved dependency or null if optional and not found
   * @throws {Error} When circular dependency detected or required dependency missing
   */
  private resolveDependency(params: DependencyResolutionParams): SkillDefinition | null {
    if (params.visiting.has(params.depId)) {
      throw new Error(`Circular dependency detected involving skill '${params.depId}'`);
    }

    if (params.visited.has(params.depId)) {
      return this.getSkill(params.depId);
    }

    params.visiting.add(params.depId);

    const dependency = this.getSkill(params.depId);
    if (!dependency) {
      if (params.required) {
        throw new Error(
          `Required dependency '${params.depId}' not found in registry: ${params.reason}`
        );
      }
      params.visiting.delete(params.depId);
      return null;
    }

    this.resolveSubDependencies(dependency, params.visiting, params.visited);

    params.visiting.delete(params.depId);
    params.visited.add(params.depId);

    return dependency;
  }

  /**
   * Resolve sub-dependencies of a dependency
   * @param {SkillDefinition} dependency - Dependency whose sub-dependencies to resolve
   * @param {Set<string>} visiting - Set of currently visiting dependencies
   * @param {Set<string>} visited - Set of already visited dependencies
   */
  private resolveSubDependencies(
    dependency: SkillDefinition,
    visiting: Set<string>,
    visited: Set<string>
  ): void {
    for (const subDep of dependency.dependencies) {
      if (subDep.required) {
        this.resolveDependency({
          depId: subDep.skillId,
          required: subDep.required,
          reason: subDep.reason,
          visiting,
          visited,
        });
      }
    }
  }

  /**
   * Load and register a skill from identifier
   * @param {{identifier: string, options?: {skipValidation?: boolean}}} params - Load parameters
   * @param {string} params.identifier - The skill identifier to load
   * @param {{skipValidation?: boolean}} params.options - Optional loading configuration
   * @param {boolean} params.options.skipValidation - Whether to skip skill validation
   * @returns {Promise<SkillDefinition>} Loaded and registered skill definition
   */
  async loadSkill(params: {
    identifier: string;
    options?: { skipValidation?: boolean };
  }): Promise<SkillDefinition> {
    const skill = await this.loader.load(params.identifier);

    // Validate skill unless validation is explicitly skipped
    if (!params.options?.skipValidation) {
      const validation = this.validateSkill(skill);
      if (!validation.valid) {
        throw new Error(
          `Skill validation failed: ${validation.errors.map(e => e.message).join(', ')}`
        );
      }
    }

    this.register(skill);
    return skill;
  }
}
