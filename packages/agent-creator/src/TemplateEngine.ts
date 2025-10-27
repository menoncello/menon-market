/**
 * Template Engine
 * Processes agent templates with variable substitution and customization
 */

import { AgentDefinition } from '@menon-market/core';

/**
 *
 */
export class TemplateEngine {
  /**
   * Process template with variable substitution
   * @param template
   * @param variables
   */
  async processTemplate(
    template: Omit<AgentDefinition, 'id' | 'metadata'>,
    variables: Record<string, unknown>
  ): Promise<AgentDefinition> {
    const processedTemplate = JSON.parse(JSON.stringify(template));

    // Replace template variables recursively
    this.replaceVariables(processedTemplate, variables);

    // Ensure ID is set
    if (!processedTemplate.id && variables.agentId) {
      processedTemplate.id = variables.agentId as string;
    }

    // Create metadata
    const metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      author: (variables.author as string) || 'System Generated',
      tags: processedTemplate.metadata?.tags || [],
      dependencies: processedTemplate.metadata?.dependencies || [],
    };

    return {
      ...processedTemplate,
      metadata,
    } as AgentDefinition;
  }

  /**
   * Recursively replace template variables
   * @param obj
   * @param variables
   */
  private replaceVariables(obj: unknown, variables: Record<string, unknown>): void {
    if (typeof obj === 'string') {
      // Handle template variable syntax: {{variableName}}
      return; // Strings are handled by parent object processing
    }

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        if (typeof obj[i] === 'string') {
          obj[i] = this.replaceStringVariables(obj[i], variables);
        } else {
          this.replaceVariables(obj[i], variables);
        }
      }
      return;
    }

    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          (obj as Record<string, unknown>)[key] = this.replaceStringVariables(value, variables);
        } else {
          this.replaceVariables(value, variables);
        }
      }
    }
  }

  /**
   * Replace variables in a string
   * @param str
   * @param variables
   */
  private replaceStringVariables(str: string, variables: Record<string, unknown>): string {
    // Handle {{variable}} syntax
    return str.replace(/{{([^}]+)}}/g, (match, variablePath) => {
      const value = this.getNestedValue(variables, variablePath.trim());
      return value === undefined ? match : String(value);
    });
  }

  /**
   * Get nested value from object using dot notation
   * @param obj
   * @param path
   */
  private getNestedValue(obj: unknown, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
      if (current === null || typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return current;
  }
}
