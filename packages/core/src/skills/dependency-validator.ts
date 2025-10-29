/**
 * Skill Dependency Validator
 * Provides validation for skill dependencies including circular dependency detection
 */

import { DependencyGraph } from './dependency-graph';
import {
  ValidationContext,
  createCircularDependencyIssue,
  createDepthIssue,
  createMissingComplexDependencyIssue,
  createRequiredDependencyIssue,
  createOptionalDependencyIssue,
  createSelfDependencyIssue,
} from './dependency-validation-helpers';
import { SkillDefinition, ValidationError } from './types';
import { DEPENDENCY_DEPTH_LIMIT } from './validation-constants';

/**
 * Dependency validation result
 */
export interface DependencyValidationResult {
  /** Whether dependencies are valid */
  valid: boolean;

  /** List of missing dependencies */
  missingDependencies: string[];

  /** List of circular dependencies */
  circularDependencies: string[];

  /** List of dependency issues */
  issues: ValidationError[];
}

/**
 * Validates skill dependencies
 */
export class DependencyValidator {
  /**
   * Validate skill dependencies against available skills
   * @param {SkillDefinition} skill - Skill definition to validate
   * @param {string[]} availableSkills - List of available skill IDs
   * @returns {DependencyValidationResult} Dependency validation result
   */
  validateDependencies(
    skill: SkillDefinition,
    availableSkills: string[] = []
  ): DependencyValidationResult {
    const missingDependencyIssues = this.validateMissingDependencies(skill, availableSkills);
    const circularDependencyIssues = this.validateSelfDependencies(skill);

    const missingDependencies = missingDependencyIssues.missing;
    const circularDependencies = circularDependencyIssues.missing;
    const issues = [...missingDependencyIssues.issues, ...circularDependencyIssues.issues];

    return {
      valid: missingDependencies.length === 0 && circularDependencies.length === 0,
      missingDependencies,
      circularDependencies,
      issues,
    };
  }

  /**
   * Validate missing dependencies
   * @param {SkillDefinition} skill - Skill definition to validate
   * @param {string[]} availableSkills - List of available skill IDs
   * @returns {{missing: string[], issues: ValidationError[]}} Missing dependencies and issues
   */
  private validateMissingDependencies(
    skill: SkillDefinition,
    availableSkills: string[]
  ): { missing: string[]; issues: ValidationError[] } {
    const issues: ValidationError[] = [];
    const missing: string[] = [];

    for (const dependency of skill.dependencies) {
      if (!availableSkills.includes(dependency.skillId)) {
        if (dependency.required) {
          missing.push(dependency.skillId);
          issues.push(createRequiredDependencyIssue(dependency.skillId));
        } else {
          issues.push(createOptionalDependencyIssue(dependency.skillId));
        }
      }
    }

    return { missing, issues };
  }

  /**
   * Validate self-dependencies
   * @param {SkillDefinition} skill - Skill definition to validate
   * @returns {{missing: string[], issues: ValidationError[]}} Self-dependencies and issues
   */
  private validateSelfDependencies(skill: SkillDefinition): {
    missing: string[];
    issues: ValidationError[];
  } {
    const issues: ValidationError[] = [];
    const missing: string[] = [];

    for (const dependency of skill.dependencies) {
      if (dependency.skillId === skill.id) {
        missing.push(dependency.skillId);
        issues.push(createSelfDependencyIssue(dependency.skillId));
      }
    }

    return { missing, issues };
  }

  /**
   * Validate complex dependency relationships using a dependency graph
   * @param {SkillDefinition[]} skills - Array of skill definitions to analyze
   * @returns {DependencyValidationResult} Comprehensive dependency validation result
   */
  validateComplexDependencies(skills: SkillDefinition[]): DependencyValidationResult {
    const graph = this.buildDependencyGraph(skills);
    const availableSkills = skills.map(s => s.id);

    const circularDependencyResult = this.validateCircularDependencies(skills, graph);
    const depthIssues = this.validateDependencyDepths(skills, graph);
    const missingDependencyResult = this.validateMissingComplexDependencies(
      skills,
      availableSkills
    );

    const circularDependencies = circularDependencyResult.dependencies;
    const missingDependencies = missingDependencyResult.dependencies;
    const issues = [
      ...circularDependencyResult.issues,
      ...depthIssues,
      ...missingDependencyResult.issues,
    ];

    return {
      valid: missingDependencies.length === 0 && circularDependencies.length === 0,
      missingDependencies,
      circularDependencies,
      issues,
    };
  }

  /**
   * Build dependency graph from skills
   * @param {SkillDefinition[]} skills - Array of skill definitions
   * @returns {DependencyGraph} Built dependency graph
   */
  private buildDependencyGraph(skills: SkillDefinition[]): DependencyGraph {
    const graph = new DependencyGraph();
    this.populateGraphWithSkills(graph, skills);
    return graph;
  }

  /**
   * Populate dependency graph with skill dependencies
   * @param {DependencyGraph} graph - Graph to populate
   * @param {SkillDefinition[]} skills - Skills to add to graph
   */
  private populateGraphWithSkills(graph: DependencyGraph, skills: SkillDefinition[]): void {
    for (const skill of skills) {
      this.addSkillDependenciesToGraph(graph, skill);
    }
  }

  /**
   * Add a single skill's dependencies to the graph
   * @param {DependencyGraph} graph - Graph to add dependencies to
   * @param {SkillDefinition} skill - Skill whose dependencies to add
   */
  private addSkillDependenciesToGraph(graph: DependencyGraph, skill: SkillDefinition): void {
    for (const dep of skill.dependencies) {
      graph.addDependency(skill.id, dep.skillId);
    }
  }

  /**
   * Validate circular dependencies
   * @param {SkillDefinition[]} skills - Array of skill definitions
   * @param {DependencyGraph} graph - Dependency graph to analyze
   * @returns {{dependencies: string[], issues: ValidationError[]}} Circular dependencies and issues
   */
  private validateCircularDependencies(
    skills: SkillDefinition[],
    graph: DependencyGraph
  ): { dependencies: string[]; issues: ValidationError[] } {
    const issues: ValidationError[] = [];
    const dependencies: string[] = [];
    const seenCycles = new Set<string>();

    for (const skill of skills) {
      const cycles = graph.detectCircularDependencies(skill.id);
      for (const cycle of cycles) {
        const cycleStr = cycle.join(' -> ');
        if (!seenCycles.has(cycleStr)) {
          seenCycles.add(cycleStr);
          dependencies.push(cycleStr);
          issues.push(createCircularDependencyIssue(cycleStr));
        }
      }
    }

    return { dependencies, issues };
  }

  /**
   * Validate dependency depths
   * @param {SkillDefinition[]} skills - Array of skill definitions
   * @param {DependencyGraph} graph - Dependency graph to analyze
   * @returns {ValidationError[]} Array of depth validation issues
   */
  private validateDependencyDepths(
    skills: SkillDefinition[],
    graph: DependencyGraph
  ): ValidationError[] {
    const issues: ValidationError[] = [];

    for (const skill of skills) {
      const depth = graph.getDependencyDepth(skill.id);
      if (depth > DEPENDENCY_DEPTH_LIMIT) {
        issues.push(createDepthIssue(skill.id, depth));
      }
    }

    return issues;
  }

  /**
   * Validate missing complex dependencies
   * @param {SkillDefinition[]} skills - Array of skill definitions
   * @param {string[]} availableSkills - List of available skill IDs
   * @returns {{dependencies: string[], issues: ValidationError[]}} Missing dependencies and issues
   */
  private validateMissingComplexDependencies(
    skills: SkillDefinition[],
    availableSkills: string[]
  ): { dependencies: string[]; issues: ValidationError[] } {
    const context: ValidationContext = {
      availableSkills,
      dependencies: [],
      issues: [],
      seenDependencies: new Set<string>(),
    };

    for (const skill of skills) {
      this.validateSkillDependencies(skill, context);
    }

    return { dependencies: context.dependencies, issues: context.issues };
  }

  /**
   * Validate dependencies for a single skill
   * @param {SkillDefinition} skill - Skill to validate
   * @param {ValidationContext} context - Validation context containing collections and configuration
   */
  private validateSkillDependencies(skill: SkillDefinition, context: ValidationContext): void {
    for (const dep of skill.dependencies) {
      if (
        !this.shouldProcessDependency(
          dep,
          context.availableSkills,
          context.seenDependencies,
          skill.id
        )
      ) {
        continue;
      }

      this.addMissingDependency(skill.id, dep.skillId, context);
    }
  }

  /**
   * Check if dependency should be processed
   * @param {{required: boolean, skillId: string}} dependency - Dependency to check
   * @param {boolean} dependency.required - Whether the dependency is required
   * @param {string} dependency.skillId - ID of the dependency skill
   * @param {string[]} availableSkills - List of available skill IDs
   * @param {Set<string>} seenDependencies - Set of already seen dependencies
   * @param {string} skillId - Current skill ID
   * @returns {boolean} True if dependency should be processed
   */
  private shouldProcessDependency(
    dependency: { required: boolean; skillId: string },
    availableSkills: string[],
    seenDependencies: Set<string>,
    skillId: string
  ): boolean {
    if (!dependency.required) {
      return false;
    }

    if (availableSkills.includes(dependency.skillId)) {
      return false;
    }

    const depKey = `${skillId}->${dependency.skillId}`;
    if (seenDependencies.has(depKey)) {
      return false;
    }

    return true;
  }

  /**
   * Add missing dependency to results
   * @param {string} skillId - Current skill ID
   * @param {string} dependencyId - Missing dependency ID
   * @param {ValidationContext} context - Validation context containing collections
   */
  private addMissingDependency(
    skillId: string,
    dependencyId: string,
    context: ValidationContext
  ): void {
    const depKey = `${skillId}->${dependencyId}`;
    context.seenDependencies.add(depKey);
    context.dependencies.push(depKey);
    context.issues.push(createMissingComplexDependencyIssue(skillId, dependencyId));
  }

  /**
   * Get dependency order for skills (topological sort)
   * @param {SkillDefinition[]} skills - Array of skill definitions
   * @returns {string[]|null} Array of skill IDs in dependency order, or null if circular dependencies exist
   */
  getDependencyOrder(skills: SkillDefinition[]): string[] | null {
    const graph = this.buildDependencyGraphForOrdering(skills);
    const availableSkills = skills.map(s => s.id);

    if (this.hasCircularDependencies(skills, graph)) {
      return null;
    }

    return this.performTopologicalSort(skills, graph, availableSkills);
  }

  /**
   * Build dependency graph for ordering
   * @param {SkillDefinition[]} skills - Array of skill definitions
   * @returns {DependencyGraph} Built dependency graph
   */
  private buildDependencyGraphForOrdering(skills: SkillDefinition[]): DependencyGraph {
    const graph = new DependencyGraph();
    const availableSkills = this.extractAvailableSkills(skills);
    this.populateGraphWithFilteredSkills(graph, skills, availableSkills);
    return graph;
  }

  /**
   * Extract available skill IDs from skill definitions
   * @param {SkillDefinition[]} skills - Array of skill definitions
   * @returns {string[]} Array of skill IDs
   */
  private extractAvailableSkills(skills: SkillDefinition[]): string[] {
    return skills.map(s => s.id);
  }

  /**
   * Populate graph with skills filtered by availability
   * @param {DependencyGraph} graph - Graph to populate
   * @param {SkillDefinition[]} skills - Skills to add
   * @param {string[]} availableSkills - Available skill IDs for filtering
   */
  private populateGraphWithFilteredSkills(
    graph: DependencyGraph,
    skills: SkillDefinition[],
    availableSkills: string[]
  ): void {
    for (const skill of skills) {
      this.addAvailableSkillDependenciesToGraph(graph, skill, availableSkills);
    }
  }

  /**
   * Add available skill dependencies to graph
   * @param {DependencyGraph} graph - Graph to add dependencies to
   * @param {SkillDefinition} skill - Skill whose dependencies to add
   * @param {string[]} availableSkills - Available skill IDs for filtering
   */
  private addAvailableSkillDependenciesToGraph(
    graph: DependencyGraph,
    skill: SkillDefinition,
    availableSkills: string[]
  ): void {
    for (const dep of skill.dependencies) {
      if (availableSkills.includes(dep.skillId)) {
        graph.addDependency(skill.id, dep.skillId);
      }
    }
  }

  /**
   * Check if skills have circular dependencies
   * @param {SkillDefinition[]} skills - Array of skill definitions
   * @param {DependencyGraph} graph - Dependency graph to check
   * @returns {boolean} True if circular dependencies exist
   */
  private hasCircularDependencies(skills: SkillDefinition[], graph: DependencyGraph): boolean {
    for (const skill of skills) {
      const cycles = graph.detectCircularDependencies(skill.id);
      if (cycles.length > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Perform topological sort on dependency graph
   * @param {SkillDefinition[]} skills - Array of skill definitions
   * @param {DependencyGraph} graph - Dependency graph to sort
   * @param {string[]} availableSkills - List of available skill IDs
   * @returns {string[]} Array of skill IDs in dependency order
   */
  private performTopologicalSort(
    skills: SkillDefinition[],
    graph: DependencyGraph,
    availableSkills: string[]
  ): string[] {
    const visited: Set<string> = new Set();
    const order: string[] = [];

    const visit = (node: string): void => {
      if (visited.has(node)) {
        return;
      }

      visited.add(node);
      const deps = graph.getDirectDependencies(node);

      for (const dep of deps) {
        if (availableSkills.includes(dep)) {
          visit(dep);
        }
      }

      order.push(node);
    };

    for (const skill of skills) {
      visit(skill.id);
    }

    return order;
  }

  /**
   * Analyze dependency graph statistics
   * @param {SkillDefinition[]} skills - Array of skill definitions
   * @returns {{totalNodes: number, totalEdges: number, maxDepth: number, nodesWithNoDependencies: number, averageDependenciesPerNode: number, orphanNodes: string[]}} Dependency graph statistics
   */
  analyzeDependencyGraph(skills: SkillDefinition[]): {
    totalNodes: number;
    totalEdges: number;
    maxDepth: number;
    nodesWithNoDependencies: number;
    averageDependenciesPerNode: number;
    orphanNodes: string[];
  } {
    const graph = this.buildDependencyGraph(skills);
    return this.compileGraphStatistics(graph);
  }

  /**
   * Compile comprehensive statistics from dependency graph
   * @param {DependencyGraph} graph - Graph to analyze
   * @returns {{totalNodes: number, totalEdges: number, maxDepth: number, nodesWithNoDependencies: number, averageDependenciesPerNode: number, orphanNodes: string[]}} Complete graph statistics
   */
  private compileGraphStatistics(graph: DependencyGraph): {
    totalNodes: number;
    totalEdges: number;
    maxDepth: number;
    nodesWithNoDependencies: number;
    averageDependenciesPerNode: number;
    orphanNodes: string[];
  } {
    const stats = graph.getStats();
    const orphanNodes = graph.findOrphans();

    return {
      ...stats,
      orphanNodes,
    };
  }
}
