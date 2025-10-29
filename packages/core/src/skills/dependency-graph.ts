/**
 * Dependency Graph Implementation
 * Provides advanced dependency analysis functionality
 */

/**
 * Dependency graph for complex dependency analysis
 */
export class DependencyGraph {
  public nodes: Map<string, Set<string>> = new Map();

  /**
   * Add a dependency relationship
   * @param {string} from - Skill ID that depends on another skill
   * @param {string} to - Skill ID that is depended upon
   */
  addDependency(from: string, to: string): void {
    if (!this.nodes.has(from)) {
      this.nodes.set(from, new Set());
    }
    const dependencies = this.nodes.get(from);
    if (dependencies) {
      dependencies.add(to);
    }
  }

  /**
   * Check for circular dependencies using DFS
   * @param {string} start - Starting skill ID
   * @returns {string[][]} Array of circular dependency paths
   */
  detectCircularDependencies(start: string): string[][] {
    const visited: Set<string> = new Set();
    const recursionStack: Set<string> = new Set();
    const cycles: string[][] = [];

    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        // Found a cycle
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), node]);
        }
        return;
      }

      if (visited.has(node)) {
        return;
      }

      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const dependencies = this.nodes.get(node);
      if (dependencies) {
        for (const dep of dependencies) {
          dfs(dep, [...path]);
        }
      }

      recursionStack.delete(node);
    };

    dfs(start, []);
    return cycles;
  }

  /**
   * Get all dependencies for a skill (transitive)
   * @param {string} skillId - Skill ID to get dependencies for
   * @returns {Set<string>} Set of all transitive dependencies
   */
  getAllDependencies(skillId: string): Set<string> {
    const allDeps: Set<string> = new Set();
    const visited: Set<string> = new Set();

    const collect = (node: string): void => {
      if (visited.has(node)) return;
      visited.add(node);

      const deps = this.nodes.get(node);
      if (deps) {
        for (const dep of deps) {
          allDeps.add(dep);
          collect(dep);
        }
      }
    };

    collect(skillId);
    return allDeps;
  }

  /**
   * Check dependency depth
   * @param {string} skillId - Skill ID to check
   * @returns {number} Maximum dependency depth
   */
  getDependencyDepth(skillId: string): number {
    const visited: Set<string> = new Set();

    const getDepth = (node: string): number => {
      if (visited.has(node)) return 0;
      visited.add(node);

      const deps = this.nodes.get(node);
      if (!deps || deps.size === 0) return 0;

      let maxDepth = 0;
      for (const dep of deps) {
        maxDepth = Math.max(maxDepth, getDepth(dep) + 1);
      }

      return maxDepth;
    };

    return getDepth(skillId);
  }

  /**
   * Get nodes that depend on a given skill (reverse dependencies)
   * @param {string} skillId - Skill ID to find dependents for
   * @returns {string[]} Array of skill IDs that depend on the given skill
   */
  getDependents(skillId: string): string[] {
    const dependents: string[] = [];

    for (const [node, deps] of this.nodes.entries()) {
      if (deps.has(skillId)) {
        dependents.push(node);
      }
    }

    return dependents;
  }

  /**
   * Find all orphan nodes (nodes with no dependencies and no dependents)
   * @returns {string[]} Array of orphan skill IDs
   */
  findOrphans(): string[] {
    const allNodes = new Set(this.nodes.keys());
    const referencedNodes = new Set<string>();

    // Collect all referenced nodes
    for (const deps of this.nodes.values()) {
      for (const dep of deps) {
        referencedNodes.add(dep);
      }
    }

    // Find nodes that are neither dependencies nor have dependents
    const orphans: string[] = [];
    for (const node of allNodes) {
      if (!referencedNodes.has(node) && this.getDependents(node).length === 0) {
        orphans.push(node);
      }
    }

    return orphans;
  }

  /**
   * Get graph statistics
   * @returns {{totalNodes: number, totalEdges: number, maxDepth: number, nodesWithNoDependencies: number, averageDependenciesPerNode: number}} Statistics about the dependency graph
   */
  getStats(): {
    totalNodes: number;
    totalEdges: number;
    maxDepth: number;
    nodesWithNoDependencies: number;
    averageDependenciesPerNode: number;
  } {
    const totalNodes = this.nodes.size;
    let totalEdges = 0;
    let maxDepth = 0;
    let nodesWithNoDependencies = 0;

    for (const [node, deps] of this.nodes.entries()) {
      totalEdges += deps.size;
      const depth = this.getDependencyDepth(node);
      maxDepth = Math.max(maxDepth, depth);
      if (deps.size === 0) {
        nodesWithNoDependencies++;
      }
    }

    return {
      totalNodes,
      totalEdges,
      maxDepth,
      nodesWithNoDependencies,
      averageDependenciesPerNode: totalNodes > 0 ? totalEdges / totalNodes : 0,
    };
  }

  /**
   * Clear all nodes from the graph
   */
  clear(): void {
    this.nodes.clear();
  }

  /**
   * Check if graph is empty
   * @returns {boolean} True if graph has no nodes
   */
  isEmpty(): boolean {
    return this.nodes.size === 0;
  }

  /**
   * Get all nodes in the graph
   * @returns {string[]} Array of all skill IDs in the graph
   */
  getAllNodes(): string[] {
    return Array.from(this.nodes.keys());
  }

  /**
   * Get direct dependencies for a skill
   * @param {string} skillId - Skill ID to get dependencies for
   * @returns {string[]} Array of direct dependency skill IDs
   */
  getDirectDependencies(skillId: string): string[] {
    const deps = this.nodes.get(skillId);
    return deps ? Array.from(deps) : [];
  }
}
