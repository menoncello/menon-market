/**
 * Agent Creation Service
 * Core service for creating agents from templates and custom definitions
 * Optimized for <30 second performance target with comprehensive validation
 */

import {
  AgentDefinition,
  AgentTemplate,
  CreateAgentRequest,
  CreateAgentResponse,
  CreationMetadata,
  CreationOptions,
  AgentRole,
  AGENT_REGISTRY,
  AGENT_TEMPLATES,
  validateCustomizations,
} from '@menon-market/core';
import { PerformanceMonitor } from './PerformanceMonitor';
import { TemplateEngine } from './TemplateEngine';
import { ValidationService } from './ValidationService';

/**
 *
 */
export class AgentCreationService {
  private templateEngine: TemplateEngine;
  private validationService: ValidationService;
  private performanceMonitor: PerformanceMonitor;

  /**
   *
   */
  constructor() {
    this.templateEngine = new TemplateEngine();
    this.validationService = new ValidationService();
    this.performanceMonitor = new PerformanceMonitor();
  }

  /**
   * Create an agent from a definition or template
   * Performance target: <30 seconds for standard agents
   * @param request
   */
  async createAgent(request: CreateAgentRequest): Promise<CreateAgentResponse> {
    const { startTime, creationMetadata, errors, warnings } = this.initializeAgentCreation();

    try {
      const agent = await this.processAgentCreation(request, errors, warnings);

      // Validate the agent configuration
      await this.validateAgentConfiguration(agent, request.options, creationMetadata);

      // Apply performance overrides if provided
      this.applyPerformanceOverrides(agent, request.options);

      // Update metadata with timing information
      const timingWarnings = this.updateCreationMetadata(creationMetadata, startTime);
      warnings.push(...timingWarnings);

      // Save the agent configuration if not in dry run mode
      await this.saveAgentIfNotDryRun(agent, request.options);

      return this.createAgentResponse(agent, creationMetadata, errors, warnings);
    } catch (error) {
      return this.handleCreationError(error, creationMetadata, startTime);
    }
  }

  /**
   * Process agent creation from template or direct definition
   */
  private async processAgentCreation(
    request: CreateAgentRequest,
    errors: string[],
    warnings: string[]
  ): Promise<AgentDefinition> {
    if (typeof request.definition === 'string') {
      const result = await this.processTemplateCreation(request);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
      return result.agent;
    }
    const result = this.processDirectCreation(request);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    return result.agent;
  }

  /**
   * Handle creation errors
   */
  private handleCreationError(
    error: unknown,
    creationMetadata: CreationMetadata,
    startTime: number
  ): CreateAgentResponse {
    creationMetadata.creationTime = Date.now() - startTime;

    if (error instanceof Error && error.message.includes('Template creation failed')) {
      return {
        success: false,
        metadata: creationMetadata,
        errors: [`Template creation failed: ${error.message}`],
      };
    }

    if (error instanceof Error && error.message.includes('Validation failed')) {
      return {
        success: false,
        metadata: creationMetadata,
        errors: [`Validation failed: ${error.message}`],
      };
    }

    return {
      success: false,
      metadata: creationMetadata,
      errors: [
        `Unexpected error during agent creation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }

  /**
   * Create agent from template with customizations
   * @param templateId
   * @param customizations
   * @param options
   */
  private async createFromTemplate(
    templateId: string,
    customizations: Record<string, unknown>,
    _options: CreationOptions
  ): Promise<CreateAgentResponse> {
    const template = this.findTemplate(templateId);

    if (!template) {
      return {
        success: false,
        metadata: {
          createdAt: new Date(),
          creationTime: 0,
          performanceTargetMet: false,
          validationResults: [],
        },
        errors: [`Template not found: ${templateId}`],
      };
    }

    // Validate customizations against template
    const validationResult = this.validateTemplateCustomizationsForResponse(
      template,
      customizations
    );
    if (validationResult) {
      return validationResult;
    }

    // Build agent definition from template and customizations
    const agentDefinition = await this.buildAgentFromTemplate(template, customizations);

    return {
      success: true,
      agent: agentDefinition,
      metadata: {
        createdAt: new Date(),
        creationTime: 0,
        performanceTargetMet: true,
        validationResults: [],
      },
    };
  }

  /**
   * Find template by ID or role
   * @param templateId
   */
  private findTemplate(templateId: string): AgentTemplate | null {
    // Try direct template ID lookup
    const template = Object.values(AGENT_TEMPLATES).find(t => t.id === templateId);
    if (template) return template;

    // Try role lookup
    const role = templateId as AgentRole;
    return AGENT_TEMPLATES[role] || null;
  }

  /**
   * Generate unique agent ID based on role
   * @param role
   */
  private generateAgentId(role: AgentRole): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${role.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${random}`;
  }

  /**
   * Merge template default values with user customizations
   * @param template
   * @param customizations
   */
  private mergeCustomizations(
    template: AgentTemplate,
    customizations: Record<string, unknown>
  ): Record<string, unknown> {
    const merged: Record<string, unknown> = {};

    // Apply default values from template customization options
    for (const option of template.customizationOptions) {
      merged[option.id] = customizations[option.id] ?? option.defaultValue;
    }

    // Apply any additional customizations not in template options
    for (const [key, value] of Object.entries(customizations)) {
      if (!(key in merged)) {
        merged[key] = value;
      }
    }

    // Set sensible defaults for required fields
    merged.author = merged.author || 'System Generated';
    merged.communicationStyle = merged.communicationStyle || 'technical';
    merged.responseFormat = merged.responseFormat || 'markdown';
    merged.collaborationEnabled = merged.collaborationEnabled ?? true;
    merged.collaborationRoles = merged.collaborationRoles || ['contributor'];
    merged.conflictResolution = merged.conflictResolution || 'collaborative';
    merged.allowExternalApis = merged.allowExternalApis ?? true;
    merged.allowedDomains = merged.allowedDomains || [];
    merged.allowedPaths = merged.allowedPaths || ['src', 'tests', 'docs'];

    return merged;
  }

  /**
   * Save agent configuration to file system
   * @param agent
   */
  private async saveAgentConfiguration(agent: AgentDefinition): Promise<void> {
    const fileName = `${agent.id}.json`;
    const filePath = `/Users/menoncello/repos/ai/menon-market/agents/${fileName}`;

    // This would typically use Node.js fs module
    // For now, we'll simulate the save operation
    console.log(`[DRY RUN] Would save agent configuration to: ${filePath}`);
    console.log(`[DRY RUN] Agent: ${agent.name} (${agent.role})`);
  }

  /**
   * Get list of available predefined agents
   */
  getAvailableAgents(): AgentDefinition[] {
    return Object.values(AGENT_REGISTRY);
  }

  /**
   * Get list of available templates
   */
  getAvailableTemplates(): AgentTemplate[] {
    return Object.values(AGENT_TEMPLATES);
  }

  /**
   * Get predefined agent by role
   * @param role
   */
  getPredefinedAgent(role: AgentRole): AgentDefinition | undefined {
    return AGENT_REGISTRY[role];
  }

  /**
   * Get template by role
   * @param role
   */
  getTemplate(role: AgentRole): AgentTemplate | undefined {
    return AGENT_TEMPLATES[role];
  }

  /**
   * Validate customizations for a template
   * @param templateId
   * @param customizations
   */
  validateTemplateCustomizations(
    templateId: string,
    customizations: Record<string, unknown>
  ): { valid: boolean; errors: string[] } {
    const template = this.findTemplate(templateId);

    if (!template) {
      return {
        valid: false,
        errors: [`Template not found: ${templateId}`],
      };
    }

    return validateCustomizations(template, customizations);
  }

  /**
   * Process template-based agent creation
   */
  private async processTemplateCreation(
    request: CreateAgentRequest
  ): Promise<{ agent: AgentDefinition; errors: string[]; warnings: string[] }> {
    const templateResult = await this.createFromTemplate(
      request.definition as string,
      request.customizations || {},
      request.options
    );

    if (!templateResult.success) {
      throw new Error((templateResult.errors || []).join('; '));
    }

    if (!templateResult.agent) {
      throw new Error('Template creation succeeded but no agent was returned');
    }

    return {
      agent: templateResult.agent,
      errors: templateResult.errors || [],
      warnings: templateResult.warnings || [],
    };
  }

  /**
   * Process direct definition agent creation
   */
  private processDirectCreation(request: CreateAgentRequest): {
    agent: AgentDefinition;
    errors: string[];
    warnings: string[];
  } {
    return {
      agent: request.definition as AgentDefinition,
      errors: [],
      warnings: [],
    };
  }

  /**
   * Validate agent configuration
   */
  private async validateAgentConfiguration(
    agent: AgentDefinition,
    options: CreationOptions,
    metadata: CreationMetadata
  ): Promise<void> {
    if (!options.skipValidation) {
      const validationResult = await this.validationService.validateAgent(agent);
      metadata.validationResults.push(validationResult);

      if (!validationResult.passed) {
        throw new Error(validationResult.message);
      }
    }
  }

  /**
   * Apply performance overrides to agent
   */
  private applyPerformanceOverrides(agent: AgentDefinition, options: CreationOptions): void {
    if (options.performanceOverrides) {
      agent.configuration.performance = {
        ...agent.configuration.performance,
        ...options.performanceOverrides,
      };
    }
  }

  /**
   * Update creation metadata with timing information
   */
  private updateCreationMetadata(metadata: CreationMetadata, startTime: number): string[] {
    const creationTime = Date.now() - startTime;
    metadata.creationTime = creationTime;
    metadata.performanceTargetMet = creationTime < 30000; // 30 seconds

    const warnings: string[] = [];
    if (!metadata.performanceTargetMet) {
      warnings.push(`Agent creation took ${creationTime}ms, exceeding the 30-second target`);
    }

    return warnings;
  }

  /**
   * Save agent configuration if not in dry run mode
   */
  private async saveAgentIfNotDryRun(
    agent: AgentDefinition,
    options: CreationOptions
  ): Promise<void> {
    if (!options.dryRun) {
      await this.saveAgentConfiguration(agent);
    }
  }

  /**
   * Validate template customizations and return error response if invalid
   */
  private validateTemplateCustomizationsForResponse(
    template: AgentTemplate,
    customizations: Record<string, unknown>
  ): CreateAgentResponse | null {
    const validation = validateCustomizations(template, customizations);
    if (!validation.valid) {
      return {
        success: false,
        metadata: {
          createdAt: new Date(),
          creationTime: 0,
          performanceTargetMet: false,
          validationResults: [],
        },
        errors: validation.errors,
      };
    }
    return null;
  }

  /**
   * Build agent definition from template and customizations
   */
  private async buildAgentFromTemplate(
    template: AgentTemplate,
    customizations: Record<string, unknown>
  ): Promise<AgentDefinition> {
    const agentId = this.generateAgentId(template.baseRole);
    const mergedCustomizations = this.mergeCustomizations(template, customizations);

    const agentDefinition = await this.templateEngine.processTemplate(template.template, {
      ...mergedCustomizations,
      agentId,
    });

    // Set metadata
    agentDefinition.metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      author: 'Agent Creator',
      tags: [template.baseRole, 'generated'],
      dependencies: [],
    };

    return agentDefinition;
  }

  /**
   * Initialize agent creation metadata and variables
   */
  private initializeAgentCreation(): {
    startTime: number;
    creationMetadata: CreationMetadata;
    errors: string[];
    warnings: string[];
  } {
    const startTime = Date.now();
    const creationMetadata: CreationMetadata = {
      createdAt: new Date(),
      creationTime: 0,
      performanceTargetMet: false,
      validationResults: [],
    };
    return {
      startTime,
      creationMetadata,
      errors: [],
      warnings: [],
    };
  }

  /**
   * Create agent response object
   */
  private createAgentResponse(
    agent: AgentDefinition,
    metadata: CreationMetadata,
    errors: string[],
    warnings: string[]
  ): CreateAgentResponse {
    return {
      success: true,
      agent,
      metadata,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Get performance metrics for agent creation
   */
  getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics();
  }
}
