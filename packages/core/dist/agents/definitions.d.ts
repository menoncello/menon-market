/**
 * Predefined agent type definitions for the ClaudeCode SuperPlugin ecosystem
 * Defines 7 specialized agent types with complete role specifications
 */
import { AgentDefinition, AgentRole } from './types';
/**
 * Registry of all predefined agent types
 */
export declare const AGENT_REGISTRY: Record<string, AgentDefinition>;
/**
 * List of all available predefined agent types
 */
export declare const PREDEFINED_AGENT_TYPES: AgentRole[];
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
export declare function getAgentDefinition(role: AgentRole): AgentDefinition | undefined;
/**
 * Get all agent definitions
 */
export declare function getAllAgentDefinitions(): AgentDefinition[];
/**
 * Check if a role is a predefined agent type
 * @param role
 */
export declare function isPredefinedAgentType(role: string): role is AgentRole;
//# sourceMappingURL=definitions.d.ts.map