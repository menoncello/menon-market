/**
 * Agent templates module - Main entry point
 * Re-exports all template functionality from modularized components
 */
export { FrontendDevTemplate, BackendDevTemplate } from './template-definitions';
export { QATemplate, ArchitectTemplate, CLIDevTemplate } from './template-definitions-part2';
export { UXExpertTemplate, SMTemplate } from './template-definitions-part3';
export { AGENT_TEMPLATES, getAgentTemplate, getAllAgentTemplates, hasTemplate, getTemplateRoles, } from './template-registry';
export { validateCustomizations } from './template-validation';
//# sourceMappingURL=templates.d.ts.map