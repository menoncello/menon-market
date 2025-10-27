/**
 * Subagent Registry and Discovery Service
 * Manages registration, discovery, and lifecycle of subagents
 */

import { AgentDefinition, AgentRole } from '../agents/types';
import { ClaudeCodeTaskIntegration } from './TaskDelegation';

export interface SubagentRegistration {
  /** Agent definition */
  agent: AgentDefinition;

  /** Registration timestamp */
  registeredAt: Date;

  /** Last activity timestamp */
  lastActivity: Date;

  /** Current status */
  status: SubagentStatus;

  /** Health check interval in milliseconds */
  healthCheckInterval: number;

  /** Number of tasks completed */
  tasksCompleted: number;

  /** Average task success rate */
  successRate: number;

  /** Current load (0-100) */
  currentLoad: number;

  /** Capabilities metadata */
  capabilities: SubagentCapabilities;
}

export type SubagentStatus = 'active' | 'inactive' | 'busy' | 'error' | 'maintenance';

export interface SubagentCapabilities {
  /** Primary role specializations */
  specializations: string[];

  /** Supported task categories */
  taskCategories: string[];

  /** Available tools */
  tools: string[];

  /** Integration points */
  integrations: string[];

  /** Performance characteristics */
  performance: {
    avgResponseTime: number;
    maxConcurrentTasks: number;
    reliability: number;
  };
}

export interface DiscoveryFilter {
  /** Role filter */
  role?: AgentRole;

  /** Status filter */
  status?: SubagentStatus;

  /** Capability filter */
  capabilities?: string[];

  /** Minimum success rate */
  minSuccessRate?: number;

  /** Maximum current load */
  maxLoad?: number;

  /** Available tools filter */
  requiredTools?: string[];
}

export interface SubagentDiscovery {
  /** Find subagents matching criteria */
  findSubagents: (filter?: DiscoveryFilter) => SubagentRegistration[];

  /** Get best subagent for a task */
  getBestSubagent: (task: string, requirements?: string[]) => SubagentRegistration | null;

  /** Get subagent by ID */
  getSubagent: (agentId: string) => SubagentRegistration | null;

  /** Get all registered subagents */
  getAllSubagents: () => SubagentRegistration[];

  /** Get subagents by role */
  getSubagentsByRole: (role: AgentRole) => SubagentRegistration[];

  /** Get subagent statistics */
  getStatistics: () => SubagentStatistics;
}

export interface SubagentStatistics {
  /** Total registered subagents */
  totalSubagents: number;

  /** Subagents by status */
  byStatus: Record<SubagentStatus, number>;

  /** Subagents by role */
  byRole: Record<AgentRole, number>;

  /** System-wide metrics */
  systemMetrics: {
    avgSuccessRate: number;
    avgResponseTime: number;
    totalTasksCompleted: number;
    systemLoad: number;
  };
}

/**
 * Subagent Registry Implementation
 */
export class SubagentRegistry implements SubagentDiscovery {
  private registeredSubagents: Map<string, SubagentRegistration> = new Map();
  private taskIntegration: ClaudeCodeTaskIntegration;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  /**
   *
   * @param taskIntegration
   */
  constructor(taskIntegration: ClaudeCodeTaskIntegration) {
    this.taskIntegration = taskIntegration;
    this.startHealthChecks();
  }

  /**
   * Register a new subagent
   * @param agent
   */
  registerSubagent(agent: AgentDefinition): void {
    const registration: SubagentRegistration = {
      agent,
      registeredAt: new Date(),
      lastActivity: new Date(),
      status: 'active',
      healthCheckInterval: 30000, // 30 seconds
      tasksCompleted: 0,
      successRate: 100,
      currentLoad: 0,
      capabilities: this.extractCapabilities(agent),
    };

    this.registeredSubagents.set(agent.id, registration);
    this.taskIntegration.registerAgent(agent);

    console.log(`Subagent registered: ${agent.name} (${agent.role})`);
  }

  /**
   * Unregister a subagent
   * @param agentId
   */
  unregisterSubagent(agentId: string): boolean {
    const registration = this.registeredSubagents.get(agentId);
    if (!registration) return false;

    this.registeredSubagents.delete(agentId);
    this.taskIntegration.unregisterAgent(agentId);

    console.log(`Subagent unregistered: ${agentId}`);
    return true;
  }

  /**
   * Update subagent status
   * @param agentId
   * @param status
   */
  updateSubagentStatus(agentId: string, status: SubagentStatus): boolean {
    const registration = this.registeredSubagents.get(agentId);
    if (!registration) return false;

    registration.status = status;
    registration.lastActivity = new Date();

    console.log(`Subagent status updated: ${agentId} -> ${status}`);
    return true;
  }

  /**
   * Record task completion for a subagent
   * @param agentId
   * @param success
   * @param responseTime
   */
  recordTaskCompletion(agentId: string, success: boolean, responseTime: number): void {
    const registration = this.registeredSubagents.get(agentId);
    if (!registration) return;

    registration.tasksCompleted++;
    registration.lastActivity = new Date();

    // Update success rate (rolling average)
    const weight = 0.1; // Weight for new completion
    const newSuccessValue = success ? 100 : 0;
    registration.successRate = registration.successRate * (1 - weight) + newSuccessValue * weight;

    // Update performance characteristics
    registration.capabilities.performance.avgResponseTime =
      registration.capabilities.performance.avgResponseTime * (1 - weight) + responseTime * weight;

    console.log(
      `Task completed by ${agentId}: ${success ? 'Success' : 'Failure'}, ${responseTime}ms`
    );
  }

  /**
   * Find subagents matching filter criteria
   * @param filter
   */
  findSubagents(filter?: DiscoveryFilter): SubagentRegistration[] {
    let subagents = Array.from(this.registeredSubagents.values());

    if (!filter) return subagents;

    // Apply filters
    if (filter.role) {
      subagents = subagents.filter(reg => reg.agent.role === filter.role);
    }

    if (filter.status) {
      subagents = subagents.filter(reg => reg.status === filter.status);
    }

    if (filter.capabilities && filter.capabilities.length > 0) {
      const capabilities = filter.capabilities;
      subagents = subagents.filter(reg =>
        capabilities.some(cap => reg.capabilities.specializations.includes(cap))
      );
    }

    if (filter.minSuccessRate !== undefined) {
      const minSuccessRate = filter.minSuccessRate;
      subagents = subagents.filter(reg => reg.successRate >= minSuccessRate);
    }

    if (filter.maxLoad !== undefined) {
      const maxLoad = filter.maxLoad;
      subagents = subagents.filter(reg => reg.currentLoad <= maxLoad);
    }

    if (filter.requiredTools && filter.requiredTools.length > 0) {
      const requiredTools = filter.requiredTools;
      subagents = subagents.filter(reg =>
        requiredTools.every(tool => reg.capabilities.tools.includes(tool))
      );
    }

    return subagents;
  }

  /**
   * Get best subagent for a task
   * @param task
   * @param requirements
   */
  getBestSubagent(task: string, requirements?: string[]): SubagentRegistration | null {
    const availableSubagents = this.findSubagents({
      status: 'active',
      maxLoad: 80,
      requiredTools: requirements,
    });

    if (availableSubagents.length === 0) return null;

    // Score subagents based on task suitability
    const scoredSubagents = availableSubagents.map(reg => ({
      registration: reg,
      score: this.scoreSubagentForTask(reg, task, requirements),
    }));

    // Sort by score (highest first) and return the best
    scoredSubagents.sort((a, b) => b.score - a.score);
    return scoredSubagents[0].registration;
  }

  /**
   * Get subagent by ID
   * @param agentId
   */
  getSubagent(agentId: string): SubagentRegistration | null {
    return this.registeredSubagents.get(agentId) || null;
  }

  /**
   * Get all registered subagents
   */
  getAllSubagents(): SubagentRegistration[] {
    return Array.from(this.registeredSubagents.values());
  }

  /**
   * Get subagents by role
   * @param role
   */
  getSubagentsByRole(role: AgentRole): SubagentRegistration[] {
    return Array.from(this.registeredSubagents.values()).filter(reg => reg.agent.role === role);
  }

  /**
   * Get subagent statistics
   */
  getStatistics(): SubagentStatistics {
    const subagents = Array.from(this.registeredSubagents.values());

    // Count by status
    const byStatus: Record<SubagentStatus, number> = {
      active: 0,
      inactive: 0,
      busy: 0,
      error: 0,
      maintenance: 0,
    };

    // Count by role
    const byRole: Record<AgentRole, number> = {
      FrontendDev: 0,
      BackendDev: 0,
      QA: 0,
      Architect: 0,
      'CLI Dev': 0,
      'UX Expert': 0,
      SM: 0,
      Custom: 0,
    };

    let totalTasksCompleted = 0;
    let totalSuccessRate = 0;
    let totalResponseTime = 0;
    let totalLoad = 0;

    for (const reg of subagents) {
      byStatus[reg.status]++;
      byRole[reg.agent.role]++;
      totalTasksCompleted += reg.tasksCompleted;
      totalSuccessRate += reg.successRate;
      totalResponseTime += reg.capabilities.performance.avgResponseTime;
      totalLoad += reg.currentLoad;
    }

    const activeCount = subagents.length;

    return {
      totalSubagents: subagents.length,
      byStatus,
      byRole,
      systemMetrics: {
        avgSuccessRate: activeCount > 0 ? totalSuccessRate / activeCount : 0,
        avgResponseTime: activeCount > 0 ? totalResponseTime / activeCount : 0,
        totalTasksCompleted,
        systemLoad: activeCount > 0 ? totalLoad / activeCount : 0,
      },
    };
  }

  /**
   * Get subagents that need health checks
   */
  private getSubagentsNeedingHealthCheck(): SubagentRegistration[] {
    const now = new Date();
    return Array.from(this.registeredSubagents.values()).filter(reg => {
      const timeSinceLastCheck = now.getTime() - reg.lastActivity.getTime();
      return timeSinceLastCheck >= reg.healthCheckInterval;
    });
  }

  /**
   * Perform health check on a subagent
   * @param registration
   */
  private async performHealthCheck(registration: SubagentRegistration): Promise<void> {
    try {
      // In a real implementation, this would ping the subagent
      // For now, we'll simulate health checks

      const isHealthy = Math.random() > 0.05; // 95% chance of being healthy

      if (isHealthy) {
        registration.status = registration.currentLoad > 80 ? 'busy' : 'active';
      } else {
        registration.status = 'error';
        console.warn(`Health check failed for subagent: ${registration.agent.id}`);
      }

      registration.lastActivity = new Date();
    } catch (error) {
      registration.status = 'error';
      console.error(`Health check error for subagent ${registration.agent.id}:`, error);
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      const subagentsToCheck = this.getSubagentsNeedingHealthCheck();

      for (const registration of subagentsToCheck) {
        await this.performHealthCheck(registration);
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Stop health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Extract capabilities from agent definition
   * @param agent
   */
  private extractCapabilities(agent: AgentDefinition): SubagentCapabilities {
    return {
      specializations: agent.coreSkills,
      taskCategories: this.getTaskCategoriesForRole(agent.role),
      tools: agent.configuration.capabilities.allowedTools,
      integrations: ['claude-code-task-delegation'],
      performance: {
        avgResponseTime: agent.metadata.metrics?.avgCompletionTime || 30000,
        maxConcurrentTasks: agent.configuration.performance.maxConcurrentTasks,
        reliability: agent.metadata.metrics?.successRate || 95,
      },
    };
  }

  /**
   * Get task categories for a role
   * @param role
   */
  private getTaskCategoriesForRole(role: AgentRole): string[] {
    const categoryMap: Record<AgentRole, string[]> = {
      FrontendDev: ['ui-development', 'component-creation', 'styling', 'frontend-testing'],
      BackendDev: ['api-development', 'database-design', 'server-logic', 'integration'],
      QA: ['testing', 'quality-assurance', 'automation', 'validation'],
      Architect: ['system-design', 'architecture-review', 'planning', 'standards'],
      'CLI Dev': ['tool-development', 'scripting', 'automation', 'cli'],
      'UX Expert': ['user-research', 'design-review', 'usability', 'accessibility'],
      SM: ['facilitation', 'planning', 'team-coordination', 'process-improvement'],
      Custom: ['general'],
    };

    return categoryMap[role] || ['general'];
  }

  /**
   * Score subagent for task suitability
   * @param registration
   * @param task
   * @param requirements
   */
  private scoreSubagentForTask(
    registration: SubagentRegistration,
    task: string,
    requirements?: string[]
  ): number {
    let score = 0;

    const { capabilities, successRate, currentLoad } = registration;

    // Success rate score (40% weight)
    score += (successRate / 100) * 40;

    // Load score (20% weight) - lower load is better
    score += ((100 - currentLoad) / 100) * 20;

    // Tool availability score (20% weight)
    if (requirements && requirements.length > 0) {
      const availableTools = requirements.filter(tool => capabilities.tools.includes(tool));
      score += (availableTools.length / requirements.length) * 20;
    }

    // Specialization alignment score (20% weight)
    const taskLower = task.toLowerCase();
    const matchingSpecializations = capabilities.specializations.filter(spec =>
      taskLower.includes(spec.toLowerCase())
    );
    score += Math.min(20, matchingSpecializations.length * 4);

    return score;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopHealthChecks();
    this.registeredSubagents.clear();
  }
}
