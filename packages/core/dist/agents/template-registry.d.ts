/**
 * Template registry functionality for agent templates
 * Provides registry functions and template management utilities
 */
import { AgentTemplate, AgentRole } from './types';
/**
 * Registry of all agent templates
 */
export declare const AGENT_TEMPLATES: Record<AgentRole, AgentTemplate>;
/**
 * Get agent template by role
 * @param role - The agent role to retrieve template for
 * @returns The agent template or undefined if not found
 */
export declare function getAgentTemplate(role: AgentRole): AgentTemplate | undefined;
/**
 * Get all agent templates
 * @returns Array of all available agent templates
 */
export declare function getAllAgentTemplates(): AgentTemplate[];
/**
 * Check if a template exists for the given role
 * @param role - The agent role to check
 * @returns True if template exists, false otherwise
 */
export declare function hasTemplate(role: AgentRole): boolean;
/**
 * Get template roles
 * @returns Array of all available template roles
 */
export declare function getTemplateRoles(): AgentRole[];
//# sourceMappingURL=template-registry.d.ts.map