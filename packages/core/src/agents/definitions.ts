/**
 * Predefined agent type definitions for the ClaudeCode SuperPlugin ecosystem
 * Defines 7 specialized agent types with complete role specifications
 */

import { AgentDefinition, AgentRole } from './types';
import { FrontendDevAgent } from './frontend-dev.agent';
import { BackendDevAgent } from './backend-dev.agent';
import { QAAgent } from './qa.agent';
import { ArchitectAgent } from './architect.agent';
import { CLIDevAgent } from './cli-dev.agent';
import { UXExpertAgent } from './ux-expert.agent';
import { SMAgent } from './sm.agent';

/**
 * Registry of all predefined agent types
 */
export const AGENT_REGISTRY: Record<string, AgentDefinition> = {
  FrontendDev: FrontendDevAgent,
  BackendDev: BackendDevAgent,
  QA: QAAgent,
  Architect: ArchitectAgent,
  'CLI Dev': CLIDevAgent,
  'UX Expert': UXExpertAgent,
  SM: SMAgent,
};

/**
 * List of all available predefined agent types
 */
export const PREDEFINED_AGENT_TYPES: AgentRole[] = [
  'FrontendDev',
  'BackendDev',
  'QA',
  'Architect',
  'CLI Dev',
  'UX Expert',
  'SM',
];

// Export individual agents for direct access
export { FrontendDevAgent } from './frontend-dev.agent';
export { BackendDevAgent } from './backend-dev.agent';
export { QAAgent } from './qa.agent';
export { ArchitectAgent } from './architect.agent';
export { CLIDevAgent } from './cli-dev.agent';
export { UXExpertAgent } from './ux-expert.agent';
export { SMAgent } from './sm.agent';

/**
 * Get agent definition by role
 * @param role
 */
export function getAgentDefinition(role: AgentRole): AgentDefinition | undefined {
  return AGENT_REGISTRY[role];
}

/**
 * Get all agent definitions
 */
export function getAllAgentDefinitions(): AgentDefinition[] {
  return Object.values(AGENT_REGISTRY);
}

/**
 * Check if a role is a predefined agent type
 * @param role
 */
export function isPredefinedAgentType(role: string): role is AgentRole {
  return PREDEFINED_AGENT_TYPES.includes(role as AgentRole);
}
