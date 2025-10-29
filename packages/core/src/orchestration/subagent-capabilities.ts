/**
 * Capabilities extraction utilities for subagent registry
 */

import { AgentDefinition, AgentRole } from '../agents/types';
import { DEFAULT_AVG_RESPONSE_TIME, DEFAULT_RELIABILITY } from './constants';
import { SubagentCapabilities } from './subagent-registry';

/**
 * Get task categories mapping for different agent roles
 * @returns {Record<AgentRole, string[]>} Role to task categories mapping
 */
export function getTaskCategoriesMap(): Record<AgentRole, string[]> {
  return {
    FrontendDev: ['ui-development', 'component-creation', 'styling', 'frontend-testing'],
    BackendDev: ['api-development', 'database-design', 'server-logic', 'integration'],
    QA: ['testing', 'quality-assurance', 'automation', 'validation'],
    Architect: ['system-design', 'architecture-review', 'planning', 'standards'],
    'CLI Dev': ['tool-development', 'scripting', 'automation', 'cli'],
    'UX Expert': ['user-research', 'design-review', 'usability', 'accessibility'],
    SM: ['facilitation', 'planning', 'team-coordination', 'process-improvement'],
    Custom: ['general'],
  };
}

/**
 * Get task categories for a specific agent role
 * @param {AgentRole} role - The agent role
 * @returns {string[]} Array of task categories for the role
 */
export function getTaskCategoriesForRole(role: AgentRole): string[] {
  const categoryMap = getTaskCategoriesMap();
  return categoryMap[role] || ['general'];
}

/**
 * Extract capabilities from agent definition
 * @param {AgentDefinition} agent - The agent definition to extract capabilities from
 * @returns {SubagentCapabilities} The extracted subagent capabilities
 */
export function extractCapabilities(agent: AgentDefinition): SubagentCapabilities {
  return {
    specializations: agent.coreSkills,
    taskCategories: getTaskCategoriesForRole(agent.role),
    tools: agent.configuration.capabilities.allowedTools,
    integrations: ['claude-code-task-delegation'],
    performance: {
      avgResponseTime: agent.metadata.metrics?.avgCompletionTime || DEFAULT_AVG_RESPONSE_TIME,
      maxConcurrentTasks: agent.configuration.performance.maxConcurrentTasks,
      reliability: agent.metadata.metrics?.successRate || DEFAULT_RELIABILITY,
    },
  };
}
