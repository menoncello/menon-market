/**
 * Template Engine
 * Processes agent templates with variable substitution and customization
 */
import { AgentDefinition } from '@menon-market/core';
/**
 *
 */
export declare class TemplateEngine {
    /**
     * Process template with variable substitution
     * @param template
     * @param variables
     */
    processTemplate(template: Omit<AgentDefinition, 'id' | 'metadata'>, variables: Record<string, unknown>): Promise<AgentDefinition>;
    /**
     * Recursively replace template variables
     * @param obj
     * @param variables
     */
    private replaceVariables;
    /**
     * Replace variables in a string
     * @param str
     * @param variables
     */
    private replaceStringVariables;
    /**
     * Get nested value from object using dot notation
     * @param obj
     * @param path
     */
    private getNestedValue;
}
//# sourceMappingURL=TemplateEngine.d.ts.map