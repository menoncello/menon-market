/**
 * Tests for orchestration types and interfaces
 */

import {
  TaskDelegationRequest,
  TaskDelegationResponse,
  TaskExecutionMetadata,
  AgentCapability,
  TaskDelegationInterface,
  TaskExecutionResult,
  MetadataParams,
} from '../../src/orchestration/types';

describe('Orchestration Types', () => {
  describe('TaskDelegationRequest', () => {
    it('should create a valid task delegation request with all fields', () => {
      const request: TaskDelegationRequest = {
        agentId: 'test-agent-1',
        task: 'Create a React component',
        priority: 8,
        timeout: 300,
        context: { projectName: 'test-project' },
        collaborative: true,
        requiredTools: ['Read', 'Write', 'Edit'],
        outputFormat: 'markdown',
      };

      expect(request.agentId).toBe('test-agent-1');
      expect(request.task).toBe('Create a React component');
      expect(request.priority).toBe(8);
      expect(request.timeout).toBe(300);
      expect(request.context).toEqual({ projectName: 'test-project' });
      expect(request.collaborative).toBe(true);
      expect(request.requiredTools).toEqual(['Read', 'Write', 'Edit']);
      expect(request.outputFormat).toBe('markdown');
    });

    it('should create a valid task delegation request with minimal fields', () => {
      const request: TaskDelegationRequest = {
        agentId: 'test-agent-2',
        task: 'Simple task',
      };

      expect(request.agentId).toBe('test-agent-2');
      expect(request.task).toBe('Simple task');
      expect(request.priority).toBeUndefined();
      expect(request.timeout).toBeUndefined();
      expect(request.context).toBeUndefined();
      expect(request.collaborative).toBeUndefined();
      expect(request.requiredTools).toBeUndefined();
      expect(request.outputFormat).toBeUndefined();
    });

    it('should handle different output format types', () => {
      const formats: Array<TaskDelegationRequest['outputFormat']> = [
        'markdown',
        'json',
        'structured',
      ];

      formats.forEach(format => {
        const request: TaskDelegationRequest = {
          agentId: 'test-agent',
          task: 'Test task',
          outputFormat: format,
        };
        expect(request.outputFormat).toBe(format);
      });
    });
  });

  describe('TaskDelegationResponse', () => {
    it('should create a successful response with all fields', () => {
      const metadata: TaskExecutionMetadata = {
        agentId: 'test-agent',
        agentRole: 'FrontendDev',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T10:05:00Z'),
        duration: 300000,
        completedOnTime: true,
        toolsUsed: ['Read', 'Write'],
        toolInvocations: 3,
        collaborationUsed: false,
        confidence: 95,
      };

      const response: TaskDelegationResponse = {
        success: true,
        result: 'Task completed successfully',
        data: { output: 'test data' },
        metadata,
        errors: [],
        warnings: ['Minor warning'],
      };

      expect(response.success).toBe(true);
      expect(response.result).toBe('Task completed successfully');
      expect(response.data).toEqual({ output: 'test data' });
      expect(response.metadata).toEqual(metadata);
      expect(response.errors).toEqual([]);
      expect(response.warnings).toEqual(['Minor warning']);
    });

    it('should create an error response', () => {
      const metadata: TaskExecutionMetadata = {
        agentId: 'test-agent',
        agentRole: 'FrontendDev',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T10:02:00Z'),
        duration: 120000,
        completedOnTime: false,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 0,
      };

      const response: TaskDelegationResponse = {
        success: false,
        metadata,
        errors: ['Agent not found', 'Task timeout'],
      };

      expect(response.success).toBe(false);
      expect(response.result).toBeUndefined();
      expect(response.metadata).toEqual(metadata);
      expect(response.errors).toEqual(['Agent not found', 'Task timeout']);
      expect(response.warnings).toBeUndefined();
    });
  });

  describe('TaskExecutionMetadata', () => {
    it('should create complete metadata', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:05:00Z');

      const metadata: TaskExecutionMetadata = {
        agentId: 'test-agent-123',
        agentRole: 'BackendDev',
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        completedOnTime: true,
        toolsUsed: ['Read', 'Write', 'Bash', 'WebSearch'],
        toolInvocations: 5,
        collaborationUsed: true,
        confidence: 88,
      };

      expect(metadata.agentId).toBe('test-agent-123');
      expect(metadata.agentRole).toBe('BackendDev');
      expect(metadata.startTime).toBe(startTime);
      expect(metadata.endTime).toBe(endTime);
      expect(metadata.duration).toBe(300000);
      expect(metadata.completedOnTime).toBe(true);
      expect(metadata.toolsUsed).toEqual(['Read', 'Write', 'Bash', 'WebSearch']);
      expect(metadata.toolInvocations).toBe(5);
      expect(metadata.collaborationUsed).toBe(true);
      expect(metadata.confidence).toBe(88);
    });

    it('should handle edge cases for confidence values', () => {
      const metadata: TaskExecutionMetadata = {
        agentId: 'test-agent',
        agentRole: 'QA',
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        completedOnTime: true,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 0,
      };

      expect(metadata.confidence).toBe(0);
    });
  });

  describe('AgentCapability', () => {
    it('should create comprehensive agent capability', () => {
      const capability: AgentCapability = {
        tools: ['Read', 'Write', 'Edit', 'Bash', 'WebSearch'],
        taskTypes: ['ui-development', 'component-creation', 'testing'],
        maxConcurrentTasks: 3,
        avgCompletionTime: 45000,
        successRate: 92,
        specializations: ['React', 'TypeScript', 'Testing'],
      };

      expect(capability.tools).toHaveLength(5);
      expect(capability.taskTypes).toContain('ui-development');
      expect(capability.maxConcurrentTasks).toBe(3);
      expect(capability.avgCompletionTime).toBe(45000);
      expect(capability.successRate).toBe(92);
      expect(capability.specializations).toContain('React');
    });

    it('should handle empty capabilities', () => {
      const capability: AgentCapability = {
        tools: [],
        taskTypes: ['general'],
        maxConcurrentTasks: 1,
        avgCompletionTime: 60000,
        successRate: 80,
        specializations: [],
      };

      expect(capability.tools).toEqual([]);
      expect(capability.specializations).toEqual([]);
    });
  });

  describe('TaskExecutionResult', () => {
    it('should create successful task execution result', () => {
      const result: TaskExecutionResult = {
        success: true,
        output: 'Task completed successfully',
        data: { filesCreated: 3, linesOfCode: 150 },
        toolsUsed: ['Read', 'Write', 'Edit'],
        toolInvocations: 4,
        collaborationUsed: false,
        confidence: 94,
      };

      expect(result.success).toBe(true);
      expect(result.output).toContain('completed successfully');
      expect(result.data).toEqual({ filesCreated: 3, linesOfCode: 150 });
      expect(result.toolsUsed).toEqual(['Read', 'Write', 'Edit']);
      expect(result.toolInvocations).toBe(4);
      expect(result.collaborationUsed).toBe(false);
      expect(result.confidence).toBe(94);
      expect(result.errors).toBeUndefined();
      expect(result.warnings).toBeUndefined();
    });

    it('should create failed task execution result with errors', () => {
      const result: TaskExecutionResult = {
        success: false,
        output: 'Task failed to complete',
        toolsUsed: ['Read'],
        toolInvocations: 1,
        collaborationUsed: false,
        confidence: 25,
        errors: ['File not found', 'Permission denied'],
        warnings: ['Approaching timeout'],
      };

      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['File not found', 'Permission denied']);
      expect(result.warnings).toEqual(['Approaching timeout']);
      expect(result.confidence).toBe(25);
    });
  });

  describe('MetadataParams', () => {
    it('should create metadata parameters', () => {
      const startTime = new Date('2024-01-01T09:00:00Z');
      const endTime = new Date('2024-01-01T09:10:00Z');

      const params: MetadataParams = {
        agentId: 'agent-456',
        startTime,
        endTime,
        completedOnTime: true,
        toolsUsed: ['Read', 'Write'],
        toolInvocations: 2,
        collaborationUsed: true,
        confidence: 87,
      };

      expect(params.agentId).toBe('agent-456');
      expect(params.startTime).toBe(startTime);
      expect(params.endTime).toBe(endTime);
      expect(params.completedOnTime).toBe(true);
      expect(params.toolsUsed).toEqual(['Read', 'Write']);
      expect(params.toolInvocations).toBe(2);
      expect(params.collaborationUsed).toBe(true);
      expect(params.confidence).toBe(87);
    });
  });

  describe('TaskDelegationInterface', () => {
    it('should define required interface methods', () => {
      // This test ensures the interface is properly structured
      // We can't instantiate an interface directly, but we can verify its structure

      const interfaceMethods: (keyof TaskDelegationInterface)[] = [
        'delegateTask',
        'getAgentCapabilities',
        'findBestAgent',
        'isAgentAvailable',
        'getTaskStatus',
        'cancelTask',
      ];

      expect(interfaceMethods).toHaveLength(6);
      expect(interfaceMethods).toContain('delegateTask');
      expect(interfaceMethods).toContain('getAgentCapabilities');
      expect(interfaceMethods).toContain('findBestAgent');
      expect(interfaceMethods).toContain('isAgentAvailable');
      expect(interfaceMethods).toContain('getTaskStatus');
      expect(interfaceMethods).toContain('cancelTask');
    });
  });

  describe('Type Compatibility', () => {
    it('should ensure type compatibility between related interfaces', () => {
      const metadata: TaskExecutionMetadata = {
        agentId: 'test-agent',
        agentRole: 'FrontendDev',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        completedOnTime: true,
        toolsUsed: ['Read'],
        toolInvocations: 1,
        collaborationUsed: false,
        confidence: 90,
      };

      const response: TaskDelegationResponse = {
        success: true,
        result: 'Success',
        metadata,
      };

      const result: TaskExecutionResult = {
        success: true,
        output: 'Output',
        toolsUsed: ['Read'],
        toolInvocations: 1,
        collaborationUsed: false,
        confidence: 90,
      };

      // Verify types are compatible
      expect(typeof response.metadata.agentId).toBe('string');
      expect(typeof result.success).toBe('boolean');
      expect(Array.isArray(result.toolsUsed)).toBe(true);
    });

    it('should handle optional fields gracefully', () => {
      const request: TaskDelegationRequest = {
        agentId: 'test-agent',
        task: 'Test task',
        // All optional fields are omitted
      };

      const response: TaskDelegationResponse = {
        success: true,
        result: 'Success',
        metadata: {
          agentId: 'test-agent',
          agentRole: 'Custom',
          startTime: new Date(),
          endTime: new Date(),
          duration: 0,
          completedOnTime: true,
          toolsUsed: [],
          toolInvocations: 0,
          collaborationUsed: false,
          confidence: 100,
        },
        // errors and warnings are omitted
      };

      expect(request.priority).toBeUndefined();
      expect(response.errors).toBeUndefined();
      expect(response.warnings).toBeUndefined();
    });
  });
});