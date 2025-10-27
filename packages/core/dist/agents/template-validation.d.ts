/**
 * Template validation utilities
 * Provides validation functionality for agent template customizations
 */
import { AgentTemplate } from './types';
/**
 * Validate customization options against template
 * @param template - The agent template to validate against
 * @param customizations - The customizations to validate
 * @returns Validation result with validity flag and error messages
 */
export declare function validateCustomizations(template: AgentTemplate, customizations: Record<string, unknown>): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=template-validation.d.ts.map