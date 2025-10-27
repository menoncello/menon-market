/**
 * Template registry functionality for agent templates
 * Provides registry functions and template management utilities
 */
import { FrontendDevTemplate, BackendDevTemplate, } from './template-definitions';
import { QATemplate, ArchitectTemplate, CLIDevTemplate, } from './template-definitions-part2';
import { UXExpertTemplate, SMTemplate, } from './template-definitions-part3';
/**
 * Registry of all agent templates
 */
export const AGENT_TEMPLATES = {
    FrontendDev: FrontendDevTemplate,
    BackendDev: BackendDevTemplate,
    QA: QATemplate,
    Architect: ArchitectTemplate,
    'CLI Dev': CLIDevTemplate,
    'UX Expert': UXExpertTemplate,
    SM: SMTemplate,
    Custom: SMTemplate, // Using SMTemplate as placeholder for Custom
};
/**
 * Get agent template by role
 * @param role - The agent role to retrieve template for
 * @returns The agent template or undefined if not found
 */
export function getAgentTemplate(role) {
    return AGENT_TEMPLATES[role];
}
/**
 * Get all agent templates
 * @returns Array of all available agent templates
 */
export function getAllAgentTemplates() {
    return Object.values(AGENT_TEMPLATES);
}
/**
 * Check if a template exists for the given role
 * @param role - The agent role to check
 * @returns True if template exists, false otherwise
 */
export function hasTemplate(role) {
    return role in AGENT_TEMPLATES;
}
/**
 * Get template roles
 * @returns Array of all available template roles
 */
export function getTemplateRoles() {
    return Object.keys(AGENT_TEMPLATES);
}
