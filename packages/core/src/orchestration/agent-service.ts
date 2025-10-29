/**
 * Agent service for handling agent-related operations
 */

import { AgentDefinition } from '../agents/types';
import { AgentCapability, TaskExecutionMetadata } from './types';

/** Default completion time in milliseconds for agents without metrics */
const DEFAULT_COMPLETION_TIME = 30000;

/** Default success rate percentage for agents without metrics */
const DEFAULT_SUCCESS_RATE = 95;

/** Minimum alignment threshold for agent-task suitability */
const MINIMUM_ALIGNMENT_THRESHOLD = 0;

/** Maximum score for role alignment calculation */
const MAX_ALIGNMENT_SCORE = 15;

/** Base performance score for calculation */
const BASE_PERFORMANCE_SCORE = 60000;

/** Performance weight multiplier */
const PERFORMANCE_WEIGHT_MULTIPLIER = 10;

/** Success rate weight multiplier */
const SUCCESS_RATE_WEIGHT_MULTIPLIER = 15;

/** Tool availability weight multiplier */
const TOOL_AVAILABILITY_WEIGHT_MULTIPLIER = 20;

/** Percentage multiplier for calculations */
const PERCENTAGE_MULTIPLIER = 100;

/**
 * Agent service for handling agent-related operations and capabilities
 */
export class AgentService {
  /**
   * Create a new AgentService instance
   * @param {Map<string, AgentDefinition>} registeredAgents - Map of registered agent definitions keyed by agent ID
   */
  constructor(private registeredAgents: Map<string, AgentDefinition>) {}

  /**
   * Get capabilities of an agent
   * @param {string} agentId - The unique identifier of the agent
   * @returns {Promise<AgentCapability | null>} Agent capabilities or null if agent not found
   */
  async getAgentCapabilities(agentId: string): Promise<AgentCapability | null> {
    const agent = this.registeredAgents.get(agentId);
    if (!agent) return null;

    return {
      tools: agent.configuration.capabilities.allowedTools,
      taskTypes: this.getTaskTypesForRole(agent.role),
      maxConcurrentTasks: agent.configuration.performance.maxConcurrentTasks,
      avgCompletionTime: agent.metadata.metrics?.avgCompletionTime || DEFAULT_COMPLETION_TIME,
      successRate: agent.metadata.metrics?.successRate || DEFAULT_SUCCESS_RATE,
      specializations: agent.coreSkills,
    };
  }

  /**
   * Find best agent for a given task
   * @param {string} task - The task description to find an agent for
   * @param {string[]} [requiredTools] - Optional array of required tool names
   * @returns {Promise<string | null>} The best agent ID or null if no suitable agent found
   */
  async findBestAgent(task: string, requiredTools?: string[]): Promise<string | null> {
    const availableAgents = Array.from(this.registeredAgents.values()).filter(agent =>
      this.isAgentSuitableForTask(agent, task, requiredTools)
    );

    if (availableAgents.length === 0) return null;

    // Score agents based on suitability
    const scoredAgents = availableAgents.map(agent => ({
      agentId: agent.id,
      score: this.scoreAgentForTask(agent, task, requiredTools),
    }));

    // Sort by score (highest first) and return the best
    scoredAgents.sort((a, b) => b.score - a.score);
    return scoredAgents[0].agentId;
  }

  /**
   * Check if an agent is available for task delegation
   * @param {string} agentId - The unique identifier of the agent
   * @param {Map<string, TaskExecutionMetadata>} runningTasks - Map of currently running tasks
   * @returns {Promise<boolean>} True if agent is available, false otherwise
   */
  async isAgentAvailable(
    agentId: string,
    runningTasks: Map<string, TaskExecutionMetadata>
  ): Promise<boolean> {
    const agent = this.registeredAgents.get(agentId);
    if (!agent) return false;

    // Check if agent is at capacity
    const runningTasksCount = Array.from(runningTasks.values()).filter(
      task => task.agentId === agentId
    ).length;

    return runningTasksCount < agent.configuration.performance.maxConcurrentTasks;
  }

  /**
   * Get agent status
   * @param {string} agentId - The unique identifier of the agent
   * @returns {Promise<string>} Agent status ('active', 'offline', 'busy')
   */
  async getAgentStatus(agentId: string): Promise<string> {
    const agent = this.registeredAgents.get(agentId);
    if (!agent) return 'offline';

    // For now, return 'active' if agent exists and 'offline' if not
    // In a more robust implementation, this would check actual agent status
    return 'active';
  }

  /**
   * Check if an agent is suitable for a task
   * @param {AgentDefinition} agent - The agent definition to check
   * @param {string} task - The task description
   * @param {string[]} [requiredTools] - Optional array of required tool names
   * @returns {boolean} True if agent is suitable for the task
   */
  private isAgentSuitableForTask(
    agent: AgentDefinition,
    task: string,
    requiredTools?: string[]
  ): boolean {
    // Check tool requirements
    if (requiredTools && requiredTools.length > 0) {
      const hasAllTools = requiredTools.every(tool =>
        agent.configuration.capabilities.allowedTools.includes(tool)
      );
      if (!hasAllTools) return false;
    }

    // Check role-task alignment (only if task is not empty)
    if (task.trim().length > 0) {
      const alignment = this.getRoleTaskAlignment(agent.role, task);
      return alignment >= MINIMUM_ALIGNMENT_THRESHOLD;
    }

    // If no task description or no specific requirements, consider agent suitable
    return true;
  }

  /**
   * Score an agent for task suitability
   * @param {AgentDefinition} agent - The agent definition to score
   * @param {string} task - The task description
   * @param {string[]} [requiredTools] - Optional array of required tool names
   * @returns {number} The suitability score (higher is better)
   */
  private scoreAgentForTask(
    agent: AgentDefinition,
    task: string,
    requiredTools?: string[]
  ): number {
    let score = 0;

    // Role alignment score
    score += this.getRoleTaskAlignment(agent.role, task);

    // Tool availability score
    if (requiredTools) {
      const availableRequiredTools = requiredTools.filter(tool =>
        agent.configuration.capabilities.allowedTools.includes(tool)
      );
      score +=
        (availableRequiredTools.length / requiredTools.length) *
        TOOL_AVAILABILITY_WEIGHT_MULTIPLIER;
    }

    // Performance score (prefer faster agents)
    const avgTime = agent.metadata.metrics?.avgCompletionTime || DEFAULT_COMPLETION_TIME;
    score +=
      Math.max(0, (BASE_PERFORMANCE_SCORE - avgTime) / BASE_PERFORMANCE_SCORE) *
      PERFORMANCE_WEIGHT_MULTIPLIER;

    // Success rate score
    const successRate = agent.metadata.metrics?.successRate || DEFAULT_SUCCESS_RATE;
    score += (successRate / PERCENTAGE_MULTIPLIER) * SUCCESS_RATE_WEIGHT_MULTIPLIER;

    return score;
  }

  /**
   * Get alignment score between agent role and task
   * @param {string} role - The agent role
   * @param {string} task - The task description
   * @returns {number} The alignment score (0-15)
   */
  private getRoleTaskAlignment(role: string, task: string): number {
    const taskLower = task.toLowerCase();
    const roleTaskMap: Record<string, string[]> = {
      FrontendDev: [
        'frontend',
        'ui',
        'component',
        'react',
        'css',
        'html',
        'javascript',
        'typescript',
      ],
      BackendDev: ['backend', 'api', 'server', 'database', 'node', 'express', 'microservice'],
      QA: ['test', 'testing', 'quality', 'automation', 'jest', 'cypress'],
      Architect: ['architecture', 'design', 'system', 'scalability', 'pattern'],
      'CLI Dev': ['cli', 'command', 'tool', 'script', 'automation'],
      'UX Expert': ['ux', 'user', 'experience', 'design', 'usability'],
      SM: ['scrum', 'agile', 'team', 'planning', 'retrospective'],
    };

    const keywords = roleTaskMap[role] || [];
    const matches = keywords.filter(keyword => taskLower.includes(keyword)).length;
    return (matches / Math.max(keywords.length, 1)) * MAX_ALIGNMENT_SCORE;
  }

  /**
   * Get task types suitable for an agent role
   * @param {string} role - The agent role
   * @returns {string[]} Array of task types suitable for the role
   */
  private getTaskTypesForRole(role: string): string[] {
    const taskTypeMap = this.getTaskTypeMapping();
    return taskTypeMap[role] || ['general'];
  }

  /**
   * Get the complete task type mapping for all agent roles
   * @returns {Record<string, string[]>} Mapping of roles to their task types
   */
  private getTaskTypeMapping(): Record<string, string[]> {
    return {
      FrontendDev: this.getFrontendDevTaskTypes(),
      BackendDev: this.getBackendDevTaskTypes(),
      QA: this.getQATaskTypes(),
      Architect: this.getArchitectTaskTypes(),
      'CLI Dev': this.getCLIDevTaskTypes(),
      'UX Expert': this.getUXExpertTaskTypes(),
      SM: this.getSMTaskTypes(),
    };
  }

  /**
   * Get task types for Frontend Developer role
   * @returns {string[]} Frontend development task types
   */
  private getFrontendDevTaskTypes(): string[] {
    return ['ui-development', 'component-creation', 'styling', 'frontend-testing', 'optimization'];
  }

  /**
   * Get task types for Backend Developer role
   * @returns {string[]} Backend development task types
   */
  private getBackendDevTaskTypes(): string[] {
    return ['api-development', 'database-design', 'server-logic', 'integration', 'performance'];
  }

  /**
   * Get task types for QA role
   * @returns {string[]} QA task types
   */
  private getQATaskTypes(): string[] {
    return ['testing', 'quality-assurance', 'automation', 'validation', 'bug-hunting'];
  }

  /**
   * Get task types for Architect role
   * @returns {string[]} Architect task types
   */
  private getArchitectTaskTypes(): string[] {
    return ['system-design', 'architecture-review', 'planning', 'standards', 'technical-decisions'];
  }

  /**
   * Get task types for CLI Developer role
   * @returns {string[]} CLI development task types
   */
  private getCLIDevTaskTypes(): string[] {
    return ['tool-development', 'scripting', 'automation', 'cli', 'developer-tools'];
  }

  /**
   * Get task types for UX Expert role
   * @returns {string[]} UX expert task types
   */
  private getUXExpertTaskTypes(): string[] {
    return ['user-research', 'design-review', 'usability', 'accessibility', 'user-testing'];
  }

  /**
   * Get task types for Scrum Master role
   * @returns {string[]} Scrum Master task types
   */
  private getSMTaskTypes(): string[] {
    return [
      'facilitation',
      'planning',
      'team-coordination',
      'process-improvement',
      'agile-ceremonies',
    ];
  }
}
