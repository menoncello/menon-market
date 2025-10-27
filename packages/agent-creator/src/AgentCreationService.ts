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
  ValidationResult,
  AgentRole
} from '@menon-market/core';
import { AGENT_REGISTRY, AGENT_TEMPLATES, validateCustomizations } from '@menon-market/core';
import { TemplateEngine } from './TemplateEngine';
import { ValidationService } from './ValidationService';
import { PerformanceMonitor } from './PerformanceMonitor';

export class AgentCreationService {
  private templateEngine: TemplateEngine;
  private validationService: ValidationService;
  private performanceMonitor: PerformanceMonitor;

  constructor() {
    this.templateEngine = new TemplateEngine();
    this.validationService = new ValidationService();
    this.performanceMonitor = new PerformanceMonitor();
  }

  /**
   * Create an agent from a definition or template
   * Performance target: <30 seconds for standard agents
   */
  async createAgent(request: CreateAgentRequest): Promise<CreateAgentResponse> {
    const startTime = Date.now();
    const creationMetadata: CreationMetadata = {
      createdAt: new Date(),
      creationTime: 0,
      performanceTargetMet: false,
      validationResults: []
    };

    try {
      let agent: AgentDefinition;
      const errors: string[] = [];
      const warnings: string[] = [];

      // Determine if we're using a template ID or direct definition
      if (typeof request.definition === 'string') {
        // Using template
        const templateResult = await this.createFromTemplate(
          request.definition,
          request.customizations || {},
          request.options
        );

        if (!templateResult.success) {
          return {
            success: false,
            metadata: creationMetadata,
            errors: templateResult.errors
          };
        }

        agent = templateResult.agent!;
        errors.push(...(templateResult.errors || []));
        warnings.push(...(templateResult.warnings || []));
      } else {
        // Using direct definition
        agent = request.definition;
      }

      // Validate the agent definition
      if (!request.options.skipValidation) {
        const validationResult = await this.validationService.validateAgent(agent);
        creationMetadata.validationResults.push(validationResult);

        if (!validationResult.passed) {
          return {
            success: false,
            metadata: creationMetadata,
            errors: [validationResult.message]
          };
        }
      }

      // Apply performance overrides if provided
      if (request.options.performanceOverrides) {
        agent.configuration.performance = {
          ...agent.configuration.performance,
          ...request.options.performanceOverrides
        };
      }

      // Update metadata
      const creationTime = Date.now() - startTime;
      creationMetadata.creationTime = creationTime;
      creationMetadata.performanceTargetMet = creationTime < 30000; // 30 seconds

      if (!creationMetadata.performanceTargetMet) {
        warnings.push(`Agent creation took ${creationTime}ms, exceeding the 30-second target`);
      }

      // Save the agent configuration to the agents directory
      if (!request.options.dryRun) {
        await this.saveAgentConfiguration(agent);
      }

      return {
        success: true,
        agent,
        metadata: creationMetadata,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      creationMetadata.creationTime = Date.now() - startTime;

      return {
        success: false,
        metadata: creationMetadata,
        errors: [`Unexpected error during agent creation: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Create agent from template with customizations
   */
  private async createFromTemplate(
    templateId: string,
    customizations: Record<string, unknown>,
    options: CreationOptions
  ): Promise<CreateAgentResponse> {
    const template = this.findTemplate(templateId);

    if (!template) {
      return {
        success: false,
        metadata: {
          createdAt: new Date(),
          creationTime: 0,
          performanceTargetMet: false,
          validationResults: []
        },
        errors: [`Template not found: ${templateId}`]
      };
    }

    // Validate customizations against template
    const validation = validateCustomizations(template, customizations);
    if (!validation.valid) {
      return {
        success: false,
        metadata: {
          createdAt: new Date(),
          creationTime: 0,
          performanceTargetMet: false,
          validationResults: []
        },
        errors: validation.errors
      };
    }

    // Generate unique agent ID
    const agentId = this.generateAgentId(template.baseRole);

    // Merge default values with customizations
    const mergedCustomizations = this.mergeCustomizations(template, customizations);

    // Process template with customizations
    const agentDefinition = await this.templateEngine.processTemplate(
      template.template,
      { ...mergedCustomizations, agentId }
    );

    // Set metadata
    agentDefinition.metadata = {
      ...agentDefinition.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      author: mergedCustomizations.author || 'System Generated',
      tags: template.templateMetadata.tags,
      dependencies: template.templateMetadata.dependencies || []
    };

    return {
      success: true,
      agent: agentDefinition,
      metadata: {
        createdAt: new Date(),
        creationTime: 0,
        performanceTargetMet: true,
        validationResults: []
      }
    };
  }

  /**
   * Find template by ID or role
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
   */
  private generateAgentId(role: AgentRole): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${role.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${random}`;
  }

  /**
   * Merge template default values with user customizations
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
   */
  getPredefinedAgent(role: AgentRole): AgentDefinition | undefined {
    return AGENT_REGISTRY[role];
  }

  /**
   * Get template by role
   */
  getTemplate(role: AgentRole): AgentTemplate | undefined {
    return AGENT_TEMPLATES[role];
  }

  /**
   * Validate customizations for a template
   */
  validateTemplateCustomizations(
    templateId: string,
    customizations: Record<string, unknown>
  ): { valid: boolean; errors: string[] } {
    const template = this.findTemplate(templateId);

    if (!template) {
      return {
        valid: false,
        errors: [`Template not found: ${templateId}`]
      };
    }

    return validateCustomizations(template, customizations);
  }

  /**
   * Get performance metrics for agent creation
   */
  getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics();
  }
}