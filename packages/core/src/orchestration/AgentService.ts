/**
 * Agent service for handling agent-related operations
 */

import { AgentDefinition } from '../agents/types';
import { AgentCapability, TaskExecutionMetadata } from './types';

export class AgentService {
  constructor(private registeredAgents: Map<string, AgentDefinition>) {}

  /**
   * Get capabilities of an agent
   * @param agentId
   */
  async getAgentCapabilities(agentId: string): Promise<AgentCapability | null> {
    const agent = this.registeredAgents.get(agentId);
    if (!agent) return null;

    return {
      tools: agent.configuration.capabilities.allowedTools,
      taskTypes: this.getTaskTypesForRole(agent.role),
      maxConcurrentTasks: agent.configuration.performance.maxConcurrentTasks,
      avgCompletionTime: agent.metadata.metrics?.avgCompletionTime || 30000,
      successRate: agent.metadata.metrics?.successRate || 95,
      specializations: agent.coreSkills,
    };
  }

  /**
   * Find best agent for a given task
   * @param task
   * @param requiredTools
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
   * @param agentId
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
   * Check if an agent is suitable for a task
   * @param agent
   * @param task
   * @param requiredTools
   */
  private isAgentSuitableForTask(
    agent: AgentDefinition,
    task: string,
    requiredTools?: string[]
  ): boolean {
    // Check tool requirements
    if (requiredTools) {
      const hasAllTools = requiredTools.every(tool =>
        agent.configuration.capabilities.allowedTools.includes(tool)
      );
      if (!hasAllTools) return false;
    }

    // Check role-task alignment
    const alignment = this.getRoleTaskAlignment(agent.role, task);
    return alignment > 5; // Minimum alignment threshold
  }

  /**
   * Score an agent for task suitability
   * @param agent
   * @param task
   * @param requiredTools
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
      score += (availableRequiredTools.length / requiredTools.length) * 20;
    }

    // Performance score (prefer faster agents)
    const avgTime = agent.metadata.metrics?.avgCompletionTime || 30000;
    score += Math.max(0, (60000 - avgTime) / 60000) * 10;

    // Success rate score
    const successRate = agent.metadata.metrics?.successRate || 95;
    score += (successRate / 100) * 15;

    return score;
  }

  /**
   * Get alignment score between agent role and task
   * @param role
   * @param task
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
    return (matches / Math.max(keywords.length, 1)) * 15;
  }

  /**
   * Get task types suitable for an agent role
   * @param role
   */
  private getTaskTypesForRole(role: string): string[] {
    const taskTypeMap: Record<string, string[]> = {
      FrontendDev: [
        'ui-development',
        'component-creation',
        'styling',
        'frontend-testing',
        'optimization',
      ],
      BackendDev: [
        'api-development',
        'database-design',
        'server-logic',
        'integration',
        'performance',
      ],
      QA: ['testing', 'quality-assurance', 'automation', 'validation', 'bug-hunting'],
      Architect: [
        'system-design',
        'architecture-review',
        'planning',
        'standards',
        'technical-decisions',
      ],
      'CLI Dev': ['tool-development', 'scripting', 'automation', 'cli', 'developer-tools'],
      'UX Expert': ['user-research', 'design-review', 'usability', 'accessibility', 'user-testing'],
      SM: [
        'facilitation',
        'planning',
        'team-coordination',
        'process-improvement',
        'agile-ceremonies',
      ],
    };

    return taskTypeMap[role] || ['general'];
  }
}
