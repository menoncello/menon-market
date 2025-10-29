/**
 * Subagent Registry and Discovery Service
 * Manages registration, discovery, and lifecycle of subagents
 */

import { AgentDefinition, AgentRole } from '../agents/types';
import {
  DEFAULT_HEALTH_CHECK_INTERVAL,
  DEFAULT_INITIAL_LOAD,
  DEFAULT_INITIAL_TASKS_COMPLETED,
  DEFAULT_MAX_LOAD_THRESHOLD,
  BUSY_LOAD_THRESHOLD,
  HEALTH_CHECK_FREQUENCY,
  HEALTH_CHECK_SUCCESS_PROBABILITY,
  INITIAL_SUBAGENT_STATUS,
  SUCCESS_RATE_FAILURE_VALUE,
  SUCCESS_RATE_ROLLING_WEIGHT,
  SUCCESS_RATE_SUCCESS_VALUE,
  MAX_LOAD_PERCENTAGE,
} from './constants';
import { logger } from './logger';
import { extractCapabilities } from './subagent-capabilities';
import { applyFilters } from './subagent-filters';
import { scoreSubagentForTask } from './subagent-scoring';
import { calculateStatistics } from './subagent-statistics';
import { ClaudeCodeTaskIntegration } from './task-delegation';
import { secureRandomBoolean } from './utils';

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
  status?: SubagentStatus | SubagentStatus[];

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
   * Create a new SubagentRegistry instance
   * @param {ClaudeCodeTaskIntegration} [taskIntegration] - Optional task integration service
   */
  constructor(taskIntegration?: ClaudeCodeTaskIntegration) {
    this.taskIntegration = taskIntegration || new ClaudeCodeTaskIntegration();
    this.startHealthChecks();
  }

  /**
   * Register a new subagent
   * @param {AgentDefinition} agent - The agent definition to register
   */
  registerSubagent(agent: AgentDefinition): void {
    const registration: SubagentRegistration = {
      agent,
      registeredAt: new Date(),
      lastActivity: new Date(),
      status: INITIAL_SUBAGENT_STATUS,
      healthCheckInterval: DEFAULT_HEALTH_CHECK_INTERVAL,
      tasksCompleted: DEFAULT_INITIAL_TASKS_COMPLETED,
      successRate: SUCCESS_RATE_SUCCESS_VALUE,
      currentLoad: DEFAULT_INITIAL_LOAD,
      capabilities: extractCapabilities(agent),
    };

    this.registeredSubagents.set(agent.id, registration);
    this.taskIntegration.registerAgent(agent);

    logger.info(`Subagent registered: ${agent.name} (${agent.role})`);
  }

  /**
   * Register a new subagent - alias for registerSubagent
   * @param {AgentDefinition} agent - The agent definition to register
   */
  register(agent: AgentDefinition): void {
    this.registerSubagent(agent);
  }

  /**
   * Unregister a subagent
   * @param {string} agentId - The unique identifier of the agent to unregister
   * @returns {boolean} True if agent was successfully unregistered
   */
  unregisterSubagent(agentId: string): boolean {
    const registration = this.registeredSubagents.get(agentId);
    if (!registration) return false;

    this.registeredSubagents.delete(agentId);
    this.taskIntegration.unregisterAgent(agentId);

    logger.info(`Subagent unregistered: ${agentId}`);
    return true;
  }

  /**
   * Unregister a subagent - alias for unregisterSubagent
   * @param {string} agentId - The unique identifier of the agent to unregister
   * @returns {boolean} True if agent was successfully unregistered
   */
  unregister(agentId: string): boolean {
    return this.unregisterSubagent(agentId);
  }

  /**
   * Update subagent status
   * @param {string} agentId - The unique identifier of the agent
   * @param {SubagentStatus} status - The new status to set
   * @returns {boolean} True if status was successfully updated
   */
  updateSubagentStatus(agentId: string, status: SubagentStatus): boolean {
    const registration = this.registeredSubagents.get(agentId);
    if (!registration) return false;

    const previousStatus = registration.status;
    registration.status = status;
    registration.lastActivity = new Date();

    logger.info(`Subagent status updated: ${agentId} -> ${status} (was: ${previousStatus})`);
    return true;
  }

  /**
   * Recover a subagent from error state
   * @param {string} agentId - The unique identifier of the agent
   * @returns {boolean} True if agent was successfully recovered
   */
  recoverSubagent(agentId: string): boolean {
    const registration = this.registeredSubagents.get(agentId);
    if (!registration) return false;

    if (registration.status !== 'error') {
      logger.warn(
        `Attempted to recover subagent ${agentId} which is not in error state (current: ${registration.status})`
      );
      return false;
    }

    // Set to active if load is reasonable, otherwise busy
    const newStatus = registration.currentLoad > BUSY_LOAD_THRESHOLD ? 'busy' : 'active';
    this.updateSubagentStatus(agentId, newStatus);

    logger.info(`Subagent ${agentId} manually recovered from error state to ${newStatus}`);
    return true;
  }

  /**
   * Recover all subagents in error state
   * @returns {number} Number of subagents recovered
   */
  recoverAllErrorSubagents(): number {
    const errorSubagents = Array.from(this.registeredSubagents.values()).filter(
      reg => reg.status === 'error'
    );

    let recoveredCount = 0;
    for (const reg of errorSubagents) {
      if (this.recoverSubagent(reg.agent.id)) {
        recoveredCount++;
      }
    }

    logger.info(`Recovered ${recoveredCount} subagents from error state`);
    return recoveredCount;
  }

  /**
   * Record task completion for a subagent
   * @param {string} agentId - The unique identifier of the agent
   * @param {boolean} success - Whether the task was completed successfully
   * @param {number} responseTime - The time taken to complete the task in milliseconds
   */
  recordTaskCompletion(agentId: string, success: boolean, responseTime: number): void {
    const registration = this.registeredSubagents.get(agentId);
    if (!registration) return;

    registration.tasksCompleted++;
    registration.lastActivity = new Date();

    // Update success rate (rolling average)
    const newSuccessValue = success ? SUCCESS_RATE_SUCCESS_VALUE : SUCCESS_RATE_FAILURE_VALUE;
    registration.successRate =
      registration.successRate * (1 - SUCCESS_RATE_ROLLING_WEIGHT) +
      newSuccessValue * SUCCESS_RATE_ROLLING_WEIGHT;

    // Update performance characteristics
    registration.capabilities.performance.avgResponseTime =
      registration.capabilities.performance.avgResponseTime * (1 - SUCCESS_RATE_ROLLING_WEIGHT) +
      responseTime * SUCCESS_RATE_ROLLING_WEIGHT;

    logger.info(
      `Task completed by ${agentId}: ${success ? 'Success' : 'Failure'}, ${responseTime}ms`
    );
  }

  /**
   * Find subagents matching filter criteria
   * @param {DiscoveryFilter} [filter] - Optional discovery filter criteria
   * @returns {SubagentRegistration[]} Array of matching subagent registrations
   */
  findSubagents(filter?: DiscoveryFilter): SubagentRegistration[] {
    const subagents = Array.from(this.registeredSubagents.values());

    if (!filter) return subagents;

    return applyFilters(subagents, filter);
  }

  /**
   * Get best subagent for a task
   * @param {string} task - The task description
   * @param {string[]} [requirements] - Optional array of required tools
   * @returns {SubagentRegistration | null} The best subagent registration or null if none found
   */
  getBestSubagent(task: string, requirements?: string[]): SubagentRegistration | null {
    // First try to find ideal subagents (active and low load)
    let availableSubagents = this.findSubagents({
      status: 'active',
      maxLoad: DEFAULT_MAX_LOAD_THRESHOLD,
      requiredTools: requirements,
    });

    // If no ideal subagents found, try broader criteria (include busy agents)
    if (availableSubagents.length === 0) {
      availableSubagents = this.findSubagents({
        status: ['active', 'busy'],
        maxLoad: MAX_LOAD_PERCENTAGE, // Allow any load up to 100%
        requiredTools: requirements,
      });
    }

    // If still no subagents found, try even broader criteria (include error agents for critical tasks)
    if (availableSubagents.length === 0) {
      availableSubagents = this.findSubagents({
        requiredTools: requirements,
      });
    }

    if (availableSubagents.length === 0) return null;

    // Score subagents based on task suitability
    const scoredSubagents = availableSubagents.map(reg => ({
      registration: reg,
      score: scoreSubagentForTask(reg, task, requirements),
    }));

    // Sort by score (highest first) and return the best
    scoredSubagents.sort((a, b) => b.score - a.score);
    return scoredSubagents[0].registration;
  }

  /**
   * Get subagent by ID
   * @param {string} agentId - The unique identifier of the agent
   * @returns {SubagentRegistration | null} The subagent registration or null if not found
   */
  getSubagent(agentId: string): SubagentRegistration | null {
    return this.registeredSubagents.get(agentId) || null;
  }

  /**
   * Get subagent by ID - alias for getSubagent
   * @param {string} agentId - The unique identifier of the agent
   * @returns {SubagentRegistration | null} The subagent registration or null if not found
   */
  get(agentId: string): SubagentRegistration | null {
    return this.getSubagent(agentId);
  }

  /**
   * Get all registered subagents
   * @returns {SubagentRegistration[]} Array of all registered subagent registrations
   */
  getAllSubagents(): SubagentRegistration[] {
    return Array.from(this.registeredSubagents.values());
  }

  /**
   * List all registered subagents - alias for getAllSubagents
   * @returns {SubagentRegistration[]} Array of all registered subagent registrations
   */
  listSubagents(): SubagentRegistration[] {
    return this.getAllSubagents();
  }

  /**
   * Get subagents by role
   * @param {AgentRole} role - The agent role to filter by
   * @returns {SubagentRegistration[]} Array of subagent registrations with the specified role
   */
  getSubagentsByRole(role: AgentRole): SubagentRegistration[] {
    return Array.from(this.registeredSubagents.values()).filter(reg => reg.agent.role === role);
  }

  /**
   * Get subagent statistics
   * @returns {SubagentStatistics} Statistics about all registered subagents
   */
  getStatistics(): SubagentStatistics {
    const subagents = Array.from(this.registeredSubagents.values());
    return calculateStatistics(subagents);
  }

  /**
   * Get subagents that need health checks
   * @returns {SubagentRegistration[]} Array of subagent registrations that need health checks
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
   * @param {SubagentRegistration} registration - The subagent registration to health check
   * @returns {Promise<void>} Promise that resolves when health check is complete
   */
  private async performHealthCheck(registration: SubagentRegistration): Promise<void> {
    try {
      const isHealthy = secureRandomBoolean(HEALTH_CHECK_SUCCESS_PROBABILITY);
      const now = new Date();

      if (isHealthy) {
        await this.handleHealthySubagent(registration);
      } else {
        this.handleUnhealthySubagent(registration);
      }

      registration.lastActivity = now;
    } catch (error) {
      registration.status = 'error';
      logger.error(`Health check error for subagent ${registration.agent.id}:`, error);
    }
  }

  /**
   * Handle a healthy subagent state transition
   * @param {SubagentRegistration} registration - The subagent registration
   * @returns {Promise<void>} Promise that resolves when handling is complete
   */
  private async handleHealthySubagent(registration: SubagentRegistration): Promise<void> {
    if (registration.status === 'error') {
      await this.attemptErrorRecovery(registration);
    } else {
      this.setHealthyStatus(registration);
    }
  }

  /**
   * Handle an unhealthy subagent state transition
   * @param {SubagentRegistration} registration - The subagent registration
   * @returns {void}
   */
  private handleUnhealthySubagent(registration: SubagentRegistration): void {
    if (registration.status !== 'error') {
      registration.status = 'error';
      logger.warn(`Health check failed for subagent: ${registration.agent.id}`);
    }
  }

  /**
   * Attempt to recover a subagent from error state
   * @param {SubagentRegistration} registration - The subagent registration
   * @returns {Promise<void>} Promise that resolves when recovery attempt is complete
   */
  private async attemptErrorRecovery(registration: SubagentRegistration): Promise<void> {
    const recoveryChance = registration.successRate / MAX_LOAD_PERCENTAGE;

    if (secureRandomBoolean(recoveryChance)) {
      this.setHealthyStatus(registration);
      logger.info(`Subagent ${registration.agent.id} recovered from error state`);
    } else {
      logger.debug(`Subagent ${registration.agent.id} still in error state, will retry recovery`);
    }
  }

  /**
   * Set healthy status based on current load
   * @param {SubagentRegistration} registration - The subagent registration
   * @returns {void}
   */
  private setHealthyStatus(registration: SubagentRegistration): void {
    registration.status = registration.currentLoad > BUSY_LOAD_THRESHOLD ? 'busy' : 'active';
  }

  /**
   * Start periodic health checks
   * @returns {void}
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      const subagentsToCheck = this.getSubagentsNeedingHealthCheck();

      for (const registration of subagentsToCheck) {
        await this.performHealthCheck(registration);
      }
    }, HEALTH_CHECK_FREQUENCY);
  }

  /**
   * Stop health checks
   * @returns {void}
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Cleanup resources
   * @returns {void}
   */
  dispose(): void {
    this.stopHealthChecks();
    this.registeredSubagents.clear();
  }
}
