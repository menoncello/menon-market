/**
 * Tests for Agent Creation Service
 * Uses Bun test runner for comprehensive testing
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { CreateAgentRequest, AgentRole } from '@menon-market/core';
import { AgentCreationService } from '../src/AgentCreationService';

describe('AgentCreationService', () => {
  let service: AgentCreationService;

  beforeEach(() => {
    service = new AgentCreationService();
  });

  describe('Basic Agent Creation', () => {
    it('should create a FrontendDev agent from template', async () => {
      const request: CreateAgentRequest = {
        definition: 'FrontendDev',
        customizations: {
          name: 'Test Frontend Developer',
          description: 'A test frontend developer agent',
          backstory: 'I am a test frontend developer',
        },
        options: {
          skipValidation: false,
          dryRun: true,
          verbose: false,
        },
      };

      const result = await service.createAgent(request);

      expect(result.success).toBe(true);
      expect(result.agent).toBeDefined();
      expect(result.agent?.role).toBe('FrontendDev');
      expect(result.agent?.name).toBe('Test Frontend Developer');
      expect(result.metadata.performanceTargetMet).toBe(true);
      expect(result.metadata.creationTime).toBeLessThan(30000);
    });

    it('should create a BackendDev agent from template', async () => {
      const request: CreateAgentRequest = {
        definition: 'BackendDev',
        customizations: {
          name: 'Test Backend Developer',
          description: 'A test backend developer agent',
          backstory: 'I am a test backend developer with experience in building scalable APIs and database systems.',
        },
        options: {
          skipValidation: false,
          dryRun: true,
          verbose: false,
        },
      };

      const result = await service.createAgent(request);

      expect(result.success).toBe(true);
      expect(result.agent).toBeDefined();
      expect(result.agent?.role).toBe('BackendDev');
    });

    it('should reject invalid template ID', async () => {
      const request: CreateAgentRequest = {
        definition: 'NonExistentTemplate',
        options: {
          skipValidation: false,
          dryRun: true,
          verbose: false,
        },
      };

      const result = await service.createAgent(request);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some(error => error.includes('Template not found'))).toBe(true);
    });

    it('should validate customizations against template', async () => {
      const request: CreateAgentRequest = {
        definition: 'FrontendDev',
        customizations: {
          maxExecutionTime: 'invalid' as unknown,
          name: null as unknown,
        },
        options: {
          skipValidation: false,
          dryRun: true,
          verbose: false,
        },
      };

      const result = await service.createAgent(request);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('Performance Requirements', () => {
    it('should create agents within 30-second target', async () => {
      const requests: CreateAgentRequest[] = [
        {
          definition: 'FrontendDev',
          options: { skipValidation: false, dryRun: true, verbose: false },
        },
        {
          definition: 'BackendDev',
          options: { skipValidation: false, dryRun: true, verbose: false },
        },
        { definition: 'QA', options: { skipValidation: false, dryRun: true, verbose: false } },
      ];

      for (const request of requests) {
        const startTime = Date.now();
        const result = await service.createAgent(request);
        const duration = Date.now() - startTime;

        expect(result.success).toBe(true);
        expect(duration).toBeLessThan(30000);
        expect(result.metadata.performanceTargetMet).toBe(true);
      }
    });

    it('should handle performance overrides', async () => {
      const request: CreateAgentRequest = {
        definition: 'FrontendDev',
        options: {
          skipValidation: false,
          dryRun: true,
          verbose: false,
          performanceOverrides: {
            maxExecutionTime: 20,
            memoryLimit: 256,
          },
        },
      };

      const result = await service.createAgent(request);

      expect(result.success).toBe(true);
      expect(result.agent?.configuration.performance.maxExecutionTime).toBe(20);
      expect(result.agent?.configuration.performance.memoryLimit).toBe(256);
    });
  });

  describe('Template Validation', () => {
    it('should validate template customizations correctly', () => {
      const validation = service.validateTemplateCustomizations('FrontendDev', {
        name: 'Test Agent',
        maxExecutionTime: 30,
      });

      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should reject invalid customizations', () => {
      const validation = service.validateTemplateCustomizations('FrontendDev', {
        maxExecutionTime: 'invalid' as unknown,
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should reject missing required fields', () => {
      const validation = service.validateTemplateCustomizations('FrontendDev', {
        name: null as unknown,
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(error => error.includes('required') || error.includes('cannot be null'))).toBe(true);
    });
  });

  describe('Predefined Agents', () => {
    it('should return all predefined agents', () => {
      const agents = service.getAvailableAgents();

      expect(agents).toBeDefined();
      expect(agents.length).toBeGreaterThan(0);
      expect(agents.some(agent => agent.role === 'FrontendDev')).toBe(true);
      expect(agents.some(agent => agent.role === 'BackendDev')).toBe(true);
      expect(agents.some(agent => agent.role === 'QA')).toBe(true);
    });

    it('should return predefined agent by role', () => {
      const agent = service.getPredefinedAgent('FrontendDev');

      expect(agent).toBeDefined();
      expect(agent?.role).toBe('FrontendDev');
      expect(agent?.coreSkills.length).toBeGreaterThan(0);
      expect(agent?.goals.length).toBeGreaterThan(0);
    });

    it('should return undefined for unknown role', () => {
      const agent = service.getPredefinedAgent('UnknownRole' as AgentRole);

      expect(agent).toBeUndefined();
    });
  });

  describe('Template Management', () => {
    it('should return all available templates', () => {
      const templates = service.getAvailableTemplates();

      expect(templates).toBeDefined();
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.some(template => template.baseRole === 'FrontendDev')).toBe(true);
    });

    it('should return template by role', () => {
      const template = service.getTemplate('FrontendDev');

      expect(template).toBeDefined();
      expect(template?.baseRole).toBe('FrontendDev');
      expect(template?.customizationOptions.length).toBeGreaterThan(0);
    });

    it('should return undefined for unknown template', () => {
      const template = service.getTemplate('UnknownRole' as AgentRole);

      expect(template).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty request gracefully', async () => {
      const request = {} as CreateAgentRequest;

      const result = await service.createAgent(request);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should handle invalid agent definitions', async () => {
      const invalidAgent = {
        id: '',
        name: '',
        role: 'InvalidRole' as AgentRole,
        goals: [],
        coreSkills: [],
        learningMode: 'adaptive' as const,
        configuration: {
          performance: { maxExecutionTime: 0, memoryLimit: 0, maxConcurrentTasks: 0, priority: 0 },
          capabilities: {
            allowedTools: [],
            fileSystemAccess: { read: false, write: false, execute: false },
            networkAccess: { http: false, https: false, externalApis: false },
            agentIntegration: false,
          },
          communication: {
            style: 'technical' as const,
            responseFormat: 'markdown' as const,
            collaboration: {
              enabled: false,
              roles: [],
              conflictResolution: 'collaborative' as const,
            },
          },
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '',
          author: '',
          tags: [],
          dependencies: [],
        },
      };

      const request: CreateAgentRequest = {
        definition: invalidAgent,
        options: { skipValidation: false, dryRun: true, verbose: false },
      };

      const result = await service.createAgent(request);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should skip validation when requested', async () => {
      const invalidAgent = {
        id: 'test',
        name: 'Test',
        role: 'Custom' as AgentRole,
        goals: ['test'],
        coreSkills: ['test'],
        learningMode: 'adaptive' as const,
        configuration: {
          performance: {
            maxExecutionTime: 10,
            memoryLimit: 128,
            maxConcurrentTasks: 1,
            priority: 5,
          },
          capabilities: {
            allowedTools: ['Read'],
            fileSystemAccess: { read: true, write: false, execute: false },
            networkAccess: { http: false, https: false, externalApis: false },
            agentIntegration: false,
          },
          communication: {
            style: 'technical' as const,
            responseFormat: 'markdown' as const,
            collaboration: {
              enabled: false,
              roles: [],
              conflictResolution: 'collaborative' as const,
            },
          },
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0.0',
          author: 'Test',
          tags: [],
          dependencies: [],
        },
      };

      const request: CreateAgentRequest = {
        definition: invalidAgent,
        options: { skipValidation: true, dryRun: true, verbose: false },
      };

      const result = await service.createAgent(request);

      expect(result.success).toBe(true);
      expect(result.agent).toBeDefined();
    });
  });

  describe('Performance Metrics', () => {
    it('should return performance metrics', () => {
      const metrics = service.getPerformanceMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.totalCreations).toBe('number');
      expect(typeof metrics.averageCreationTime).toBe('number');
      expect(typeof metrics.successRate).toBe('number');
    });
  });
});
