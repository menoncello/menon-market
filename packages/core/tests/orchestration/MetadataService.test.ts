/**
 * Tests for MetadataService
 */

import { MetadataService } from '../../src/orchestration/metadata-service';
import { AgentDefinition } from '../../src/agents/types';
import { MetadataParams } from '../../src/orchestration/types';

describe('MetadataService', () => {
  let metadataService: MetadataService;
  let mockRegisteredAgents: Map<string, AgentDefinition>;

  beforeEach(() => {
    mockRegisteredAgents = new Map<string, AgentDefinition>();

    // Add mock agents
    const mockAgent1: AgentDefinition = {
      id: 'agent-1',
      name: 'Frontend Developer',
      role: 'FrontendDev',
      description: 'Frontend development specialist',
      version: '1.0.0',
      coreSkills: ['React', 'TypeScript', 'CSS'],
      configuration: {
        capabilities: {
          allowedTools: ['Read', 'Write', 'Edit', 'Bash'],
          maxConcurrentTasks: 3,
        },
        communication: {
          collaboration: {
            enabled: true,
            preferredMethods: ['direct'],
          },
        },
        performance: {
          maxConcurrentTasks: 3,
        },
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'test',
        version: '1.0.0',
        tags: [],
      },
    };

    const mockAgent2: AgentDefinition = {
      id: 'agent-2',
      name: 'Backend Developer',
      role: 'BackendDev',
      description: 'Backend development specialist',
      version: '1.0.0',
      coreSkills: ['Node.js', 'Database', 'API'],
      configuration: {
        capabilities: {
          allowedTools: ['Read', 'Write', 'Bash', 'WebSearch'],
          maxConcurrentTasks: 2,
        },
        communication: {
          collaboration: {
            enabled: false,
            preferredMethods: [],
          },
        },
        performance: {
          maxConcurrentTasks: 2,
        },
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'test',
        version: '1.0.0',
        tags: [],
      },
    };

    mockRegisteredAgents.set('agent-1', mockAgent1);
    mockRegisteredAgents.set('agent-2', mockAgent2);

    metadataService = new MetadataService(mockRegisteredAgents);
  });

  describe('createMetadata', () => {
    it('should create metadata with valid parameters', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:05:00Z');

      const params: MetadataParams = {
        agentId: 'agent-1',
        startTime,
        endTime,
        completedOnTime: true,
        toolsUsed: ['Read', 'Write', 'Edit'],
        toolInvocations: 5,
        collaborationUsed: true,
        confidence: 95,
      };

      const metadata = metadataService.createMetadata(params);

      expect(metadata.agentId).toBe('agent-1');
      expect(metadata.agentRole).toBe('FrontendDev');
      expect(metadata.startTime).toBe(startTime);
      expect(metadata.endTime).toBe(endTime);
      expect(metadata.duration).toBe(300000); // 5 minutes in milliseconds
      expect(metadata.completedOnTime).toBe(true);
      expect(metadata.toolsUsed).toEqual(['Read', 'Write', 'Edit']);
      expect(metadata.toolInvocations).toBe(5);
      expect(metadata.collaborationUsed).toBe(true);
      expect(metadata.confidence).toBe(95);
    });

    it('should handle unknown agent gracefully', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:02:00Z');

      const params: MetadataParams = {
        agentId: 'unknown-agent',
        startTime,
        endTime,
        completedOnTime: false,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 0,
      };

      const metadata = metadataService.createMetadata(params);

      expect(metadata.agentId).toBe('unknown-agent');
      expect(metadata.agentRole).toBe('Unknown');
      expect(metadata.duration).toBe(120000); // 2 minutes in milliseconds
    });

    it('should calculate duration correctly', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:01:30Z'); // 1.5 minutes

      const params: MetadataParams = {
        agentId: 'agent-2',
        startTime,
        endTime,
        completedOnTime: true,
        toolsUsed: ['Read'],
        toolInvocations: 1,
        collaborationUsed: false,
        confidence: 88,
      };

      const metadata = metadataService.createMetadata(params);

      expect(metadata.duration).toBe(90000); // 1.5 minutes in milliseconds
    });

    it('should handle edge case with zero duration', () => {
      const sameTime = new Date('2024-01-01T10:00:00Z');

      const params: MetadataParams = {
        agentId: 'agent-1',
        startTime: sameTime,
        endTime: sameTime,
        completedOnTime: true,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 100,
      };

      const metadata = metadataService.createMetadata(params);

      expect(metadata.duration).toBe(0);
    });

    it('should handle negative duration (end time before start time)', () => {
      const startTime = new Date('2024-01-01T10:05:00Z');
      const endTime = new Date('2024-01-01T10:00:00Z'); // 5 minutes before start

      const params: MetadataParams = {
        agentId: 'agent-1',
        startTime,
        endTime,
        completedOnTime: false,
        toolsUsed: ['Read'],
        toolInvocations: 1,
        collaborationUsed: false,
        confidence: 50,
      };

      const metadata = metadataService.createMetadata(params);

      expect(metadata.duration).toBe(-300000); // Negative duration
      expect(metadata.completedOnTime).toBe(false);
    });

    it('should handle different agent roles', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:03:00Z');

      const params1: MetadataParams = {
        agentId: 'agent-1',
        startTime,
        endTime,
        completedOnTime: true,
        toolsUsed: ['Read', 'Write'],
        toolInvocations: 3,
        collaborationUsed: true,
        confidence: 92,
      };

      const params2: MetadataParams = {
        agentId: 'agent-2',
        startTime,
        endTime,
        completedOnTime: true,
        toolsUsed: ['Bash'],
        toolInvocations: 2,
        collaborationUsed: false,
        confidence: 85,
      };

      const metadata1 = metadataService.createMetadata(params1);
      const metadata2 = metadataService.createMetadata(params2);

      expect(metadata1.agentRole).toBe('FrontendDev');
      expect(metadata2.agentRole).toBe('BackendDev');
    });

    it('should handle edge case values for confidence', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:01:00Z');

      const testCases = [
        { confidence: 0, expected: 0 },
        { confidence: 50, expected: 50 },
        { confidence: 100, expected: 100 },
      ];

      testCases.forEach(({ confidence, expected }) => {
        const params: MetadataParams = {
          agentId: 'agent-1',
          startTime,
          endTime,
          completedOnTime: confidence > 70,
          toolsUsed: [],
          toolInvocations: 0,
          collaborationUsed: false,
          confidence,
        };

        const metadata = metadataService.createMetadata(params);
        expect(metadata.confidence).toBe(expected);
      });
    });

    it('should handle empty tools array', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:01:00Z');

      const params: MetadataParams = {
        agentId: 'agent-1',
        startTime,
        endTime,
        completedOnTime: true,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 75,
      };

      const metadata = metadataService.createMetadata(params);

      expect(metadata.toolsUsed).toEqual([]);
      expect(metadata.toolInvocations).toBe(0);
    });

    it('should handle many tools and high invocation count', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:10:00Z');

      const params: MetadataParams = {
        agentId: 'agent-2',
        startTime,
        endTime,
        completedOnTime: true,
        toolsUsed: ['Read', 'Write', 'Edit', 'Bash', 'WebSearch', 'Grep', 'Glob'],
        toolInvocations: 15,
        collaborationUsed: true,
        confidence: 98,
      };

      const metadata = metadataService.createMetadata(params);

      expect(metadata.toolsUsed).toHaveLength(7);
      expect(metadata.toolInvocations).toBe(15);
      expect(metadata.collaborationUsed).toBe(true);
      expect(metadata.confidence).toBe(98);
    });

    it('should maintain consistency across multiple calls', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:02:00Z');

      const params: MetadataParams = {
        agentId: 'agent-1',
        startTime,
        endTime,
        completedOnTime: true,
        toolsUsed: ['Read'],
        toolInvocations: 1,
        collaborationUsed: false,
        confidence: 90,
      };

      const metadata1 = metadataService.createMetadata(params);
      const metadata2 = metadataService.createMetadata(params);

      expect(metadata1).toEqual(metadata2);
      expect(metadata1).not.toBe(metadata2); // Different object instances
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid date formats gracefully', () => {
      const invalidDate = new Date('invalid');
      const validDate = new Date('2024-01-01T10:00:00Z');

      const params: MetadataParams = {
        agentId: 'agent-1',
        startTime: validDate,
        endTime: invalidDate,
        completedOnTime: false,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 0,
      };

      const metadata = metadataService.createMetadata(params);

      expect(metadata.startTime).toBe(validDate);
      expect(metadata.endTime).toBe(invalidDate);
      // Duration calculation might result in NaN, but the service should handle it
      expect(typeof metadata.duration).toBe('number');
    });

    it('should handle maximum realistic values', () => {
      const startTime = new Date('2024-01-01T00:00:00Z');
      const endTime = new Date('2024-12-31T23:59:59Z'); // Almost a full year

      const params: MetadataParams = {
        agentId: 'agent-1',
        startTime,
        endTime,
        completedOnTime: true,
        toolsUsed: ['Read', 'Write', 'Edit', 'Bash', 'WebSearch', 'Grep', 'Glob', 'WebFetch'],
        toolInvocations: 1000,
        collaborationUsed: true,
        confidence: 100,
      };

      const metadata = metadataService.createMetadata(params);

      expect(metadata.toolsUsed).toHaveLength(8);
      expect(metadata.toolInvocations).toBe(1000);
      expect(metadata.duration).toBeGreaterThan(0);
      expect(metadata.collaborationUsed).toBe(true);
      expect(metadata.confidence).toBe(100);
    });

    it('should handle empty agent registry', () => {
      const emptyService = new MetadataService(new Map());
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:01:00Z');

      const params: MetadataParams = {
        agentId: 'any-agent',
        startTime,
        endTime,
        completedOnTime: true,
        toolsUsed: ['Read'],
        toolInvocations: 1,
        collaborationUsed: false,
        confidence: 80,
      };

      const metadata = emptyService.createMetadata(params);

      expect(metadata.agentId).toBe('any-agent');
      expect(metadata.agentRole).toBe('Unknown');
    });
  });
});