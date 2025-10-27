/**
 * Agent Creation Service
 * Core service for creating agents from templates and custom definitions
 * Optimized for <30 second performance target with comprehensive validation
 */
import { AgentDefinition, AgentTemplate, CreateAgentRequest, CreateAgentResponse, AgentRole } from '@menon-market/core';
/**
 *
 */
export declare class AgentCreationService {
    private templateEngine;
    private validationService;
    private performanceMonitor;
    /**
     *
     */
    constructor();
    /**
     * Create an agent from a definition or template
     * Performance target: <30 seconds for standard agents
     * @param request
     */
    createAgent(request: CreateAgentRequest): Promise<CreateAgentResponse>;
    /**
     * Process agent creation from template or direct definition
     */
    private processAgentCreation;
    /**
     * Handle creation errors
     */
    private handleCreationError;
    /**
     * Create agent from template with customizations
     * @param templateId
     * @param customizations
     * @param options
     */
    private createFromTemplate;
    /**
     * Find template by ID or role
     * @param templateId
     */
    private findTemplate;
    /**
     * Generate unique agent ID based on role
     * @param role
     */
    private generateAgentId;
    /**
     * Merge template default values with user customizations
     * @param template
     * @param customizations
     */
    private mergeCustomizations;
    /**
     * Save agent configuration to file system
     * @param agent
     */
    private saveAgentConfiguration;
    /**
     * Get list of available predefined agents
     */
    getAvailableAgents(): AgentDefinition[];
    /**
     * Get list of available templates
     */
    getAvailableTemplates(): AgentTemplate[];
    /**
     * Get predefined agent by role
     * @param role
     */
    getPredefinedAgent(role: AgentRole): AgentDefinition | undefined;
    /**
     * Get template by role
     * @param role
     */
    getTemplate(role: AgentRole): AgentTemplate | undefined;
    /**
     * Validate customizations for a template
     * @param templateId
     * @param customizations
     */
    validateTemplateCustomizations(templateId: string, customizations: Record<string, unknown>): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Process template-based agent creation
     */
    private processTemplateCreation;
    /**
     * Process direct definition agent creation
     */
    private processDirectCreation;
    /**
     * Validate agent configuration
     */
    private validateAgentConfiguration;
    /**
     * Apply performance overrides to agent
     */
    private applyPerformanceOverrides;
    /**
     * Update creation metadata with timing information
     */
    private updateCreationMetadata;
    /**
     * Save agent configuration if not in dry run mode
     */
    private saveAgentIfNotDryRun;
    /**
     * Validate template customizations and return error response if invalid
     */
    private validateTemplateCustomizationsForResponse;
    /**
     * Build agent definition from template and customizations
     */
    private buildAgentFromTemplate;
    /**
     * Initialize agent creation metadata and variables
     */
    private initializeAgentCreation;
    /**
     * Create agent response object
     */
    private createAgentResponse;
    /**
     * Get performance metrics for agent creation
     */
    getPerformanceMetrics(): import("./PerformanceMonitor").PerformanceMetrics;
}
//# sourceMappingURL=AgentCreationService.d.ts.map