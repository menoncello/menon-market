/**
 * Validation Service
 * Comprehensive validation framework for agent configurations
 */

import { z } from 'zod';
import {
  AgentDefinition,
  AgentRole,
  LearningMode,
  CommunicationStyle,
  ResponseFormat,
  ValidationResult
} from '@menon-market/core';

// Zod schemas for validation
const AgentRoleSchema = z.enum([
  'FrontendDev',
  'BackendDev',
  'QA',
  'Architect',
  'CLI Dev',
  'UX Expert',
  'SM',
  'Custom'
]);

const LearningModeSchema = z.enum([
  'adaptive',
  'static',
  'collaborative',
  'autonomous'
]);

const CommunicationStyleSchema = z.enum([
  'formal',
  'casual',
  'technical',
  'educational',
  'concise',
  'detailed'
]);

const ResponseFormatSchema = z.enum([
  'markdown',
  'json',
  'xml',
  'plain-text',
  'structured'
]);

const PerformanceConfigSchema = z.object({
  maxExecutionTime: z.number().min(5).max(600),
  memoryLimit: z.number().min(64).max(8192),
  maxConcurrentTasks: z.number().min(1).max(10),
  priority: z.number().min(1).max(10)
});

const FileSystemAccessSchema = z.object({
  read: z.boolean(),
  write: z.boolean(),
  execute: z.boolean(),
  restrictedPaths: z.array(z.string()).optional(),
  allowedPaths: z.array(z.string()).optional()
});

const NetworkAccessSchema = z.object({
  http: z.boolean(),
  https: z.boolean(),
  externalApis: z.boolean(),
  allowedDomains: z.array(z.string()).optional()
});

const CapabilityConfigSchema = z.object({
  allowedTools: z.array(z.string()).min(1),
  fileSystemAccess: FileSystemAccessSchema,
  networkAccess: NetworkAccessSchema,
  agentIntegration: z.boolean()
});

const CollaborationConfigSchema = z.object({
  enabled: z.boolean(),
  roles: z.array(z.enum(['leader', 'contributor', 'reviewer', 'implementer', 'tester', 'coordinator'])),
  conflictResolution: z.enum(['collaborative', 'competitive', 'compromise', 'avoidance', 'accommodation'])
});

const CommunicationConfigSchema = z.object({
  style: CommunicationStyleSchema,
  responseFormat: ResponseFormatSchema,
  collaboration: CollaborationConfigSchema
});

const AgentConfigurationSchema = z.object({
  performance: PerformanceConfigSchema,
  capabilities: CapabilityConfigSchema,
  communication: CommunicationConfigSchema,
  customParams: z.record(z.unknown()).optional()
});

const AgentMetadataSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.string().min(1),
  author: z.string().min(1),
  tags: z.array(z.string()),
  dependencies: z.array(z.string()),
  metrics: z.object({
    avgCompletionTime: z.number().min(0),
    successRate: z.number().min(0).max(100),
    tasksCompleted: z.number().min(0),
    satisfactionRating: z.number().min(1).max(5),
    lastEvaluated: z.date()
  }).optional()
});

const AgentDefinitionSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().min(10).max(1000),
  role: AgentRoleSchema,
  goals: z.array(z.string().min(5)).min(1).max(10),
  backstory: z.string().min(20).max(2000),
  coreSkills: z.array(z.string().min(3)).min(5).max(20),
  learningMode: LearningModeSchema,
  configuration: AgentConfigurationSchema,
  metadata: AgentMetadataSchema
});

export class ValidationService {
  /**
   * Validate complete agent definition
   */
  async validateAgent(agent: AgentDefinition): Promise<ValidationResult> {
    try {
      // Schema validation
      const schemaResult = AgentDefinitionSchema.safeParse(agent);
      if (!schemaResult.success) {
        return {
          category: 'schema',
          passed: false,
          message: 'Schema validation failed',
          details: {
            errors: schemaResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
          }
        };
      }

      // Business logic validation
      const businessValidation = await this.validateBusinessRules(agent);
      if (!businessValidation.passed) {
        return businessValidation;
      }

      // Performance validation
      const performanceValidation = this.validatePerformance(agent);
      if (!performanceValidation.passed) {
        return performanceValidation;
      }

      // Security validation
      const securityValidation = this.validateSecurity(agent);
      if (!securityValidation.passed) {
        return securityValidation;
      }

      return {
        category: 'schema',
        passed: true,
        message: 'Agent definition is valid'
      };

    } catch (error) {
      return {
        category: 'schema',
        passed: false,
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate business rules
   */
  private async validateBusinessRules(agent: AgentDefinition): Promise<ValidationResult> {
    // Check if goals align with role
    const roleGoalAlignment = this.validateRoleGoalAlignment(agent);
    if (!roleGoalAlignment.passed) {
      return roleGoalAlignment;
    }

    // Check if core skills match role expectations
    const skillAlignment = this.validateSkillAlignment(agent);
    if (!skillAlignment.passed) {
      return skillAlignment;
    }

    // Check configuration consistency
    const configConsistency = this.validateConfigurationConsistency(agent);
    if (!configConsistency.passed) {
      return configConsistency;
    }

    return {
      category: 'compatibility',
      passed: true,
      message: 'Business rules validation passed'
    };
  }

  /**
   * Validate performance requirements
   */
  private validatePerformance(agent: AgentDefinition): ValidationResult {
    const { performance } = agent.configuration;

    // Check performance targets
    if (performance.maxExecutionTime > 60) {
      return {
        category: 'performance',
        passed: false,
        message: 'Maximum execution time exceeds 60 seconds',
        details: {
          currentValue: performance.maxExecutionTime,
          recommendedValue: 60
        }
      };
    }

    if (performance.memoryLimit > 4096) {
      return {
        category: 'performance',
        passed: false,
        message: 'Memory limit exceeds 4GB',
        details: {
          currentValue: performance.memoryLimit,
          recommendedValue: 4096
        }
      };
    }

    return {
      category: 'performance',
      passed: true,
      message: 'Performance validation passed'
    };
  }

  /**
   * Validate security requirements
   */
  private validateSecurity(agent: AgentDefinition): ValidationResult {
    const { capabilities } = agent.configuration;

    // Check file system access restrictions
    if (capabilities.fileSystemAccess.execute && !capabilities.fileSystemAccess.restrictedPaths) {
      return {
        category: 'security',
        passed: false,
        message: 'File system execute access requires restricted paths',
        details: {
          recommendation: 'Define restrictedPaths when execute access is enabled'
        }
      };
    }

    // Check network access restrictions
    if (capabilities.networkAccess.externalApis && capabilities.networkAccess.allowedDomains?.length === 0) {
      return {
        category: 'security',
        passed: false,
        message: 'External API access requires allowed domains',
        details: {
          recommendation: 'Define allowedDomains when externalApis is enabled'
        }
      };
    }

    return {
      category: 'security',
      passed: true,
      message: 'Security validation passed'
    };
  }

  /**
   * Validate role-goal alignment
   */
  private validateRoleGoalAlignment(agent: AgentDefinition): ValidationResult {
    const { role, goals } = agent;

    // Define expected goals for each role
    const expectedGoals: Record<AgentRole, string[]> = {
      'FrontendDev': ['user interface', 'responsive', 'component', 'performance', 'accessibility'],
      'BackendDev': ['api', 'database', 'security', 'scalability', 'integration'],
      'QA': ['testing', 'quality', 'automation', 'reliability', 'defects'],
      'Architect': ['design', 'scalability', 'architecture', 'strategy', 'standards'],
      'CLI Dev': ['cli', 'tools', 'automation', 'productivity', 'developer experience'],
      'UX Expert': ['user experience', 'usability', 'research', 'accessibility', 'design'],
      'SM': ['facilitation', 'agile', 'team', 'process', 'delivery'],
      'Custom': []
    };

    const expected = expectedGoals[role];
    if (expected.length === 0) {
      return {
        category: 'compatibility',
        passed: true,
        message: 'Custom role - no goal validation required'
      };
    }

    const goalText = goals.join(' ').toLowerCase();
    const matches = expected.filter(keyword => goalText.includes(keyword.toLowerCase()));

    if (matches.length < expected.length * 0.6) { // At least 60% of expected keywords
      return {
        category: 'compatibility',
        passed: false,
        message: 'Goals do not align well with role expectations',
        details: {
          role,
          expectedKeywords: expected,
          foundKeywords: matches
        }
      };
    }

    return {
      category: 'compatibility',
      passed: true,
      message: 'Role-goal alignment is acceptable'
    };
  }

  /**
   * Validate skill alignment
   */
  private validateSkillAlignment(agent: AgentDefinition): ValidationResult {
    const { role, coreSkills } = agent;

    // Define expected skills for each role
    const expectedSkills: Record<AgentRole, string[]> = {
      'FrontendDev': ['react', 'typescript', 'css', 'javascript', 'frontend'],
      'BackendDev': ['nodejs', 'api', 'database', 'backend', 'server'],
      'QA': ['testing', 'automation', 'quality', 'test', 'qa'],
      'Architect': ['architecture', 'design', 'scalability', 'system', 'technical'],
      'CLI Dev': ['cli', 'command line', 'tools', 'automation', 'bash'],
      'UX Expert': ['ux', 'design', 'user experience', 'research', 'usability'],
      'SM': ['scrum', 'agile', 'facilitation', 'team', 'coaching'],
      'Custom': []
    };

    const expected = expectedSkills[role];
    if (expected.length === 0) {
      return {
        category: 'compatibility',
        passed: true,
        message: 'Custom role - no skill validation required'
      };
    }

    const skillText = coreSkills.join(' ').toLowerCase();
    const matches = expected.filter(keyword => skillText.includes(keyword.toLowerCase()));

    if (matches.length < Math.min(3, expected.length)) {
      return {
        category: 'compatibility',
        passed: false,
        message: 'Core skills do not align with role expectations',
        details: {
          role,
          expectedSkills: expected,
          foundSkills: matches
        }
      };
    }

    return {
      category: 'compatibility',
      passed: true,
      message: 'Skill alignment is acceptable'
    };
  }

  /**
   * Validate configuration consistency
   */
  private validateConfigurationConsistency(agent: AgentDefinition): ValidationResult {
    const { configuration } = agent;

    // Check learning mode vs collaboration settings
    if (agent.learningMode === 'static' && configuration.communication.collaboration.enabled) {
      return {
        category: 'compatibility',
        passed: false,
        message: 'Static learning mode should not have collaboration enabled',
        details: {
          learningMode: agent.learningMode,
          collaborationEnabled: configuration.communication.collaboration.enabled
        }
      };
    }

    // Check performance vs concurrent tasks
    const { performance } = configuration;
    if (performance.maxConcurrentTasks > 5 && performance.priority < 8) {
      return {
        category: 'compatibility',
        passed: false,
        message: 'High concurrent tasks require higher priority',
        details: {
          maxConcurrentTasks: performance.maxConcurrentTasks,
          priority: performance.priority,
          recommendation: 'Increase priority to 8+ or reduce concurrent tasks'
        }
      };
    }

    return {
      category: 'compatibility',
      passed: true,
      message: 'Configuration consistency validation passed'
    };
  }

  /**
   * Validate template customization options
   */
  validateCustomizationOptions(
    options: unknown,
    schema: z.ZodSchema
  ): ValidationResult {
    try {
      schema.parse(options);
      return {
        category: 'custom',
        passed: true,
        message: 'Customization options are valid'
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          category: 'custom',
          passed: false,
          message: 'Customization options validation failed',
          details: {
            errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
          }
        };
      }

      return {
        category: 'custom',
        passed: false,
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}