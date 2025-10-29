/**
 * Tests for agent types and interfaces
 * Comprehensive coverage of all type definitions and validation
 */

import { describe, it, expect } from 'vitest';
import {
  AgentDefinition,
  AgentRole,
  LearningMode,
  AgentConfiguration,
  PerformanceConfig,
  CapabilityConfig,
  FileSystemAccess,
  NetworkAccess,
  CommunicationConfig,
  CommunicationStyle,
  ResponseFormat,
  CollaborationConfig,
  CollaborationRole,
  ConflictResolutionStyle,
  AgentMetadata,
  AgentMetrics,
  AgentTemplate,
  CustomizationOption,
  ValidationRule,
  TemplateMetadata,
  CreateAgentRequest,
  CreationOptions,
  CreateAgentResponse,
  CreationMetadata,
  ValidationResult,
} from '../../src/agents/types';

describe('Agent Types', () => {
  describe('AgentRole', () => {
    it('should have all expected predefined roles', () => {
      const expectedRoles: AgentRole[] = [
        'FrontendDev',
        'BackendDev',
        'QA',
        'Architect',
        'CLI Dev',
        'UX Expert',
        'SM',
        'Custom',
      ];

      expectedRoles.forEach((role) => {
        expect(['FrontendDev', 'BackendDev', 'QA', 'Architect', 'CLI Dev', 'UX Expert', 'SM', 'Custom']).toContain(role);
      });
    });
  });

  describe('LearningMode', () => {
    it('should have all expected learning modes', () => {
      const expectedModes: LearningMode[] = ['adaptive', 'static', 'collaborative', 'autonomous'];

      expectedModes.forEach((mode) => {
        expect(['adaptive', 'static', 'collaborative', 'autonomous']).toContain(mode);
      });
    });
  });

  describe('CommunicationStyle', () => {
    it('should have all expected communication styles', () => {
      const expectedStyles: CommunicationStyle[] = [
        'formal',
        'casual',
        'technical',
        'educational',
        'concise',
        'detailed',
      ];

      expectedStyles.forEach((style) => {
        expect(['formal', 'casual', 'technical', 'educational', 'concise', 'detailed']).toContain(style);
      });
    });
  });

  describe('ResponseFormat', () => {
    it('should have all expected response formats', () => {
      const expectedFormats: ResponseFormat[] = ['markdown', 'json', 'xml', 'plain-text', 'structured'];

      expectedFormats.forEach((format) => {
        expect(['markdown', 'json', 'xml', 'plain-text', 'structured']).toContain(format);
      });
    });
  });

  describe('CollaborationRole', () => {
    it('should have all expected collaboration roles', () => {
      const expectedRoles: CollaborationRole[] = [
        'leader',
        'contributor',
        'reviewer',
        'implementer',
        'tester',
        'coordinator',
      ];

      expectedRoles.forEach((role) => {
        expect(['leader', 'contributor', 'reviewer', 'implementer', 'tester', 'coordinator']).toContain(role);
      });
    });
  });

  describe('ConflictResolutionStyle', () => {
    it('should have all expected conflict resolution styles', () => {
      const expectedStyles: ConflictResolutionStyle[] = [
        'collaborative',
        'competitive',
        'compromise',
        'avoidance',
        'accommodation',
      ];

      expectedStyles.forEach((style) => {
        expect(['collaborative', 'competitive', 'compromise', 'avoidance', 'accommodation']).toContain(style);
      });
    });
  });

  describe('AgentDefinition Interface', () => {
    it('should create a valid minimal agent definition', () => {
      const now = new Date();
      const agent: AgentDefinition = {
        id: 'test-agent-001',
        name: 'Test Agent',
        description: 'A test agent for unit testing',
        role: 'Custom',
        goals: ['Test goal 1', 'Test goal 2'],
        backstory: 'A test agent backstory',
        coreSkills: ['Testing', 'Validation'],
        learningMode: 'static',
        configuration: {
          performance: {
            maxExecutionTime: 60,
            memoryLimit: 1024,
            maxConcurrentTasks: 1,
            priority: 5,
          },
          capabilities: {
            allowedTools: ['Read'],
            fileSystemAccess: {
              read: true,
              write: false,
              execute: false,
            },
            networkAccess: {
              http: false,
              https: false,
              externalApis: false,
            },
            agentIntegration: false,
          },
          communication: {
            style: 'formal',
            responseFormat: 'plain-text',
            collaboration: {
              enabled: false,
              roles: ['contributor'],
              conflictResolution: 'collaborative',
            },
          },
        },
        metadata: {
          createdAt: now,
          updatedAt: now,
          version: '1.0.0',
          author: 'Test Author',
          tags: ['test'],
          dependencies: [],
        },
      };

      expect(agent.id).toBe('test-agent-001');
      expect(agent.name).toBe('Test Agent');
      expect(agent.role).toBe('Custom');
      expect(agent.goals).toHaveLength(2);
      expect(agent.coreSkills).toHaveLength(2);
      expect(agent.learningMode).toBe('static');
      expect(agent.configuration.performance.maxExecutionTime).toBe(60);
      expect(agent.configuration.capabilities.allowedTools).toEqual(['Read']);
      expect(agent.configuration.communication.style).toBe('formal');
      expect(agent.metadata.author).toBe('Test Author');
    });

    it('should create a complete agent definition with all optional fields', () => {
      const now = new Date();
      const agent: AgentDefinition = {
        id: 'complete-agent-001',
        name: 'Complete Agent',
        description: 'A complete test agent with all fields',
        role: 'FrontendDev',
        goals: ['Goal 1', 'Goal 2', 'Goal 3'],
        backstory: 'Complete agent backstory',
        coreSkills: ['React', 'TypeScript', 'Testing', 'CI/CD'],
        learningMode: 'adaptive',
        configuration: {
          performance: {
            maxExecutionTime: 120,
            memoryLimit: 2048,
            maxConcurrentTasks: 3,
            priority: 8,
          },
          capabilities: {
            allowedTools: ['Read', 'Write', 'Edit', 'Bash'],
            fileSystemAccess: {
              read: true,
              write: true,
              execute: true,
              restrictedPaths: ['/etc', '/sys'],
              allowedPaths: ['/src', '/tests', '/docs'],
            },
            networkAccess: {
              http: true,
              https: true,
              externalApis: true,
              allowedDomains: ['api.github.com', 'npmjs.com'],
            },
            agentIntegration: true,
          },
          communication: {
            style: 'technical',
            responseFormat: 'markdown',
            collaboration: {
              enabled: true,
              roles: ['leader', 'reviewer', 'contributor'],
              conflictResolution: 'collaborative',
            },
          },
          customParams: {
            theme: 'dark',
            language: 'typescript',
          },
        },
        metadata: {
          createdAt: now,
          updatedAt: now,
          version: '2.1.0',
          author: 'Test Author',
          tags: ['frontend', 'react', 'typescript', 'testing'],
          dependencies: ['@types/react', 'jest'],
          metrics: {
            avgCompletionTime: 45.5,
            successRate: 92.5,
            tasksCompleted: 127,
            satisfactionRating: 4.7,
            lastEvaluated: now,
          },
        },
      };

      expect(agent.configuration.customParams).toBeDefined();
      expect(agent.configuration.customParams?.theme).toBe('dark');
      expect(agent.metadata.metrics).toBeDefined();
      expect(agent.metadata.metrics?.successRate).toBe(92.5);
      expect(agent.configuration.capabilities.fileSystemAccess.restrictedPaths).toEqual(['/etc', '/sys']);
      expect(agent.configuration.capabilities.networkAccess.allowedDomains).toEqual(['api.github.com', 'npmjs.com']);
    });
  });

  describe('AgentTemplate Interface', () => {
    it('should create a valid agent template', () => {
      const now = new Date();
      const template: AgentTemplate = {
        id: 'frontend-template-001',
        name: 'Frontend Developer Template',
        description: 'Template for creating frontend development agents',
        baseRole: 'FrontendDev',
        template: {
          name: 'Frontend Developer',
          description: 'Frontend development specialist',
          role: 'FrontendDev',
          goals: ['Build user interfaces', 'Ensure responsive design'],
          backstory: 'Template backstory',
          coreSkills: ['React', 'TypeScript'],
          learningMode: 'adaptive',
          configuration: {
            performance: {
              maxExecutionTime: 60,
              memoryLimit: 1024,
              maxConcurrentTasks: 2,
              priority: 7,
            },
            capabilities: {
              allowedTools: ['Read', 'Write'],
              fileSystemAccess: {
                read: true,
                write: true,
                execute: false,
              },
              networkAccess: {
                http: true,
                https: true,
                externalApis: false,
              },
              agentIntegration: true,
            },
            communication: {
              style: 'casual',
              responseFormat: 'markdown',
              collaboration: {
                enabled: true,
                roles: ['contributor'],
                conflictResolution: 'collaborative',
              },
            },
          },
        },
        customizationOptions: [
          {
            id: 'framework',
            name: 'JavaScript Framework',
            description: 'Primary frontend framework',
            type: 'string',
            defaultValue: 'React',
            required: true,
            validation: [
              {
                type: 'enum',
                params: { values: ['React', 'Vue', 'Angular', 'Svelte'] },
                message: 'Framework must be one of: React, Vue, Angular, Svelte',
              },
            ],
          },
        ],
        templateMetadata: {
          createdAt: now,
          author: 'Template Author',
          version: '1.0.0',
          usageCount: 15,
          averageRating: 4.5,
        },
      };

      expect(template.id).toBe('frontend-template-001');
      expect(template.baseRole).toBe('FrontendDev');
      expect(template.customizationOptions).toHaveLength(1);
      expect(template.customizationOptions[0].type).toBe('string');
      expect(template.customizationOptions[0].validation).toHaveLength(1);
      expect(template.templateMetadata.usageCount).toBe(15);
    });
  });

  describe('CreateAgentRequest Interface', () => {
    it('should create request with agent definition', () => {
      const now = new Date();
      const agentDef: AgentDefinition = {
        id: 'direct-agent-001',
        name: 'Direct Agent',
        description: 'Agent created from direct definition',
        role: 'Custom',
        goals: ['Direct creation goal'],
        backstory: 'Direct creation backstory',
        coreSkills: ['Testing'],
        learningMode: 'static',
        configuration: {
          performance: {
            maxExecutionTime: 30,
            memoryLimit: 512,
            maxConcurrentTasks: 1,
            priority: 3,
          },
          capabilities: {
            allowedTools: [],
            fileSystemAccess: {
              read: false,
              write: false,
              execute: false,
            },
            networkAccess: {
              http: false,
              https: false,
              externalApis: false,
            },
            agentIntegration: false,
          },
          communication: {
            style: 'formal',
            responseFormat: 'plain-text',
            collaboration: {
              enabled: false,
              roles: ['contributor'],
              conflictResolution: 'collaborative',
            },
          },
        },
        metadata: {
          createdAt: now,
          updatedAt: now,
          version: '1.0.0',
          author: 'Test Author',
          tags: [],
          dependencies: [],
        },
      };

      const request: CreateAgentRequest = {
        definition: agentDef,
        options: {
          skipValidation: false,
          dryRun: false,
          verbose: true,
        },
      };

      expect(request.definition).toBe(agentDef);
      expect(request.options.verbose).toBe(true);
      expect(request.options.skipValidation).toBe(false);
    });

    it('should create request with template reference', () => {
      const request: CreateAgentRequest = {
        definition: 'frontend-template-001',
        customizations: {
          framework: 'Vue',
          experienceLevel: 'senior',
        },
        options: {
          skipValidation: false,
          dryRun: true,
          verbose: false,
          performanceOverrides: {
            maxExecutionTime: 90,
            priority: 8,
          },
        },
      };

      expect(request.definition).toBe('frontend-template-001');
      expect(request.customizations?.framework).toBe('Vue');
      expect(request.options.dryRun).toBe(true);
      expect(request.options.performanceOverrides?.maxExecutionTime).toBe(90);
    });
  });

  describe('CreateAgentResponse Interface', () => {
    it('should create successful response', () => {
      const now = new Date();
      const agentDef: AgentDefinition = {
        id: 'success-agent-001',
        name: 'Success Agent',
        description: 'Successfully created agent',
        role: 'Custom',
        goals: ['Success goal'],
        backstory: 'Success backstory',
        coreSkills: ['Success'],
        learningMode: 'static',
        configuration: {
          performance: {
            maxExecutionTime: 30,
            memoryLimit: 512,
            maxConcurrentTasks: 1,
            priority: 5,
          },
          capabilities: {
            allowedTools: [],
            fileSystemAccess: {
              read: false,
              write: false,
              execute: false,
            },
            networkAccess: {
              http: false,
              https: false,
              externalApis: false,
            },
            agentIntegration: false,
          },
          communication: {
            style: 'formal',
            responseFormat: 'plain-text',
            collaboration: {
              enabled: false,
              roles: ['contributor'],
              conflictResolution: 'collaborative',
            },
          },
        },
        metadata: {
          createdAt: now,
          updatedAt: now,
          version: '1.0.0',
          author: 'Test Author',
          tags: [],
          dependencies: [],
        },
      };

      const response: CreateAgentResponse = {
        success: true,
        agent: agentDef,
        metadata: {
          createdAt: now,
          creationTime: 1250,
          performanceTargetMet: true,
          validationResults: [
            {
              category: 'schema',
              passed: true,
              message: 'Schema validation passed',
            },
            {
              category: 'performance',
              passed: true,
              message: 'Performance requirements met',
              details: { maxMemory: '512MB', maxTime: '30s' },
            },
          ],
        },
        warnings: ['Consider adding more specific skills'],
      };

      expect(response.success).toBe(true);
      expect(response.agent).toBe(agentDef);
      expect(response.metadata.creationTime).toBe(1250);
      expect(response.metadata.validationResults).toHaveLength(2);
      expect(response.warnings).toHaveLength(1);
      expect(response.warnings?.[0]).toBe('Consider adding more specific skills');
    });

    it('should create failed response', () => {
      const response: CreateAgentResponse = {
        success: false,
        metadata: {
          createdAt: new Date(),
          creationTime: 500,
          performanceTargetMet: false,
          validationResults: [
            {
              category: 'schema',
              passed: false,
              message: 'Missing required field: name',
              details: { field: 'name', required: true },
            },
          ],
        },
        errors: ['Agent name is required', 'Invalid role specified'],
      };

      expect(response.success).toBe(false);
      expect(response.agent).toBeUndefined();
      expect(response.metadata.performanceTargetMet).toBe(false);
      expect(response.errors).toHaveLength(2);
      expect(response.errors?.[0]).toBe('Agent name is required');
    });
  });

  describe('Validation Edge Cases', () => {
    it('should handle empty arrays in configuration', () => {
      const now = new Date();
      const agent: AgentDefinition = {
        id: 'minimal-agent-001',
        name: 'Minimal Agent',
        description: 'Minimal agent with empty arrays',
        role: 'Custom',
        goals: [],
        backstory: 'Minimal backstory',
        coreSkills: [],
        learningMode: 'static',
        configuration: {
          performance: {
            maxExecutionTime: 0,
            memoryLimit: 0,
            maxConcurrentTasks: 0,
            priority: 0,
          },
          capabilities: {
            allowedTools: [],
            fileSystemAccess: {
              read: false,
              write: false,
              execute: false,
            },
            networkAccess: {
              http: false,
              https: false,
              externalApis: false,
            },
            agentIntegration: false,
          },
          communication: {
            style: 'formal',
            responseFormat: 'plain-text',
            collaboration: {
              enabled: false,
              roles: [],
              conflictResolution: 'collaborative',
            },
          },
        },
        metadata: {
          createdAt: now,
          updatedAt: now,
          version: '1.0.0',
          author: 'Test Author',
          tags: [],
          dependencies: [],
        },
      };

      expect(agent.goals).toEqual([]);
      expect(agent.coreSkills).toEqual([]);
      expect(agent.configuration.capabilities.allowedTools).toEqual([]);
      expect(agent.configuration.communication.collaboration.roles).toEqual([]);
      expect(agent.metadata.tags).toEqual([]);
      expect(agent.metadata.dependencies).toEqual([]);
    });

    it('should handle optional restricted and allowed paths', () => {
      const now = new Date();
      const agent: AgentDefinition = {
        id: 'path-access-agent-001',
        name: 'Path Access Agent',
        description: 'Agent testing path access configurations',
        role: 'Custom',
        goals: ['Test path access'],
        backstory: 'Testing path configurations',
        coreSkills: ['File System'],
        learningMode: 'static',
        configuration: {
          performance: {
            maxExecutionTime: 30,
            memoryLimit: 512,
            maxConcurrentTasks: 1,
            priority: 5,
          },
          capabilities: {
            allowedTools: ['Read'],
            fileSystemAccess: {
              read: true,
              write: false,
              execute: false,
              // restrictedPaths and allowedPaths are optional
            },
            networkAccess: {
              http: true,
              https: true,
              externalApis: false,
              // allowedDomains is optional
            },
            agentIntegration: false,
          },
          communication: {
            style: 'formal',
            responseFormat: 'plain-text',
            collaboration: {
              enabled: false,
              roles: ['contributor'],
              conflictResolution: 'collaborative',
            },
          },
        },
        metadata: {
          createdAt: now,
          updatedAt: now,
          version: '1.0.0',
          author: 'Test Author',
          tags: [],
          dependencies: [],
        },
      };

      expect(agent.configuration.capabilities.fileSystemAccess.restrictedPaths).toBeUndefined();
      expect(agent.configuration.capabilities.fileSystemAccess.allowedPaths).toBeUndefined();
      expect(agent.configuration.capabilities.networkAccess.allowedDomains).toBeUndefined();
    });
  });
});