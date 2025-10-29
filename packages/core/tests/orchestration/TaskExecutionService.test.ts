/**
 * Tests for TaskExecutionService
 */

import { TaskExecutionService } from '../../src/orchestration/task-execution-service';
import { AgentDefinition } from '../../src/agents/types';
import { TaskDelegationRequest, TaskExecutionMetadata } from '../../src/orchestration/types';

describe('TaskExecutionService', () => {
  let taskExecutionService: TaskExecutionService;
  let mockAgent: AgentDefinition;

  beforeEach(() => {
    taskExecutionService = new TaskExecutionService();

    mockAgent = {
      id: 'test-agent-1',
      name: 'Test Agent',
      role: 'FrontendDev',
      description: 'Test agent for unit testing',
      version: '1.0.0',
      coreSkills: ['React', 'TypeScript', 'CSS', 'JavaScript'],
      configuration: {
        capabilities: {
          allowedTools: ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'WebFetch', 'Bash', 'WebSearch'],
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
        tags: ['test'],
        metrics: {
          avgCompletionTime: 30000,
          successRate: 90,
        },
      },
    };
  });

  describe('executeTask', () => {
    it('should execute a task successfully', async () => {
      const request: TaskDelegationRequest = {
        agentId: 'test-agent-1',
        task: 'Create a React component',
      };

      const metadata: TaskExecutionMetadata = {
        agentId: 'test-agent-1',
        agentRole: 'FrontendDev',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        completedOnTime: true,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 0,
      };

      const result = await taskExecutionService.executeTask(mockAgent, request, metadata);

      // Debug: Add explicit null/undefined check
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(typeof result).toBe('object');

      expect(result.success).toBe(true);
      expect(result.output).toContain('Task Execution Results');
      expect(result.output).toContain(mockAgent.name);
      expect(result.output).toContain(request.task);
      expect(result.toolsUsed).toBeDefined();
      expect(result.toolInvocations).toBeGreaterThanOrEqual(1);
      expect(result.toolInvocations).toBeLessThanOrEqual(5);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
      expect(typeof result.collaborationUsed).toBe('boolean');
    });

    it('should select appropriate tools based on task content', async () => {
      const testCases = [
        {
          task: 'Read and edit the code file',
          expectedTools: ['Read', 'Write', 'Edit'],
        },
        {
          task: 'Search the web for information',
          expectedTools: ['WebSearch'],
        },
        {
          task: 'Fetch data from a website',
          expectedTools: ['WebFetch'],
        },
        {
          task: 'Run tests and build the project',
          expectedTools: ['Bash'],
        },
        {
          task: 'Create new files and write content',
          expectedTools: ['Write'],
        },
      ];

      const metadata: TaskExecutionMetadata = {
        agentId: 'test-agent-1',
        agentRole: 'FrontendDev',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        completedOnTime: true,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 0,
      };

      for (const { task, expectedTools } of testCases) {
        const request: TaskDelegationRequest = {
          agentId: 'test-agent-1',
          task,
        };

        const result = await taskExecutionService.executeTask(mockAgent, request, metadata);

        expect(result.toolsUsed.length).toBeGreaterThan(0);
        // Check that at least one expected tool is included
        const hasExpectedTool = expectedTools.some(tool => result.toolsUsed.includes(tool));
        expect(hasExpectedTool).toBe(true);
      }
    });

    it('should handle collaboration setting correctly', async () => {
      const collaborativeAgent: AgentDefinition = {
        ...mockAgent,
        configuration: {
          ...mockAgent.configuration,
          communication: {
            collaboration: {
              enabled: true,
              preferredMethods: ['direct', 'slack'],
            },
          },
        },
      };

      const request: TaskDelegationRequest = {
        agentId: 'test-agent-1',
        task: 'Complex task requiring collaboration',
        collaborative: true,
      };

      const metadata: TaskExecutionMetadata = {
        agentId: 'test-agent-1',
        agentRole: 'FrontendDev',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        completedOnTime: true,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 0,
      };

      const result = await taskExecutionService.executeTask(collaborativeAgent, request, metadata);

      // Collaboration is probabilistic, so we just verify it's a boolean
      expect(typeof result.collaborationUsed).toBe('boolean');
    });

    it('should calculate confidence based on multiple factors', async () => {
      const highPerformanceAgent: AgentDefinition = {
        ...mockAgent,
        metadata: {
          ...mockAgent.metadata,
          metrics: {
            avgCompletionTime: 15000, // Fast
            successRate: 98, // High success rate
          },
        },
      };

      const request: TaskDelegationRequest = {
        agentId: 'test-agent-1',
        task: 'Create a React frontend component',
        requiredTools: ['Read', 'Write'], // Tools agent has
      };

      const metadata: TaskExecutionMetadata = {
        agentId: 'test-agent-1',
        agentRole: 'FrontendDev',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        completedOnTime: true,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 0,
      };

      const result = await taskExecutionService.executeTask(highPerformanceAgent, request, metadata);

      expect(result.confidence).toBeGreaterThan(70); // Should be confident
      expect(result.success).toBe(true); // High confidence should lead to success
    });

    it('should fail tasks with low confidence', async () => {
      const lowPerformanceAgent: AgentDefinition = {
        ...mockAgent,
        metadata: {
          ...mockAgent.metadata,
          metrics: {
            avgCompletionTime: 120000, // Very slow
            successRate: 60, // Low success rate
          },
        },
        configuration: {
          ...mockAgent.configuration,
          capabilities: {
            ...mockAgent.configuration.capabilities,
            allowedTools: ['Read'], // Limited tools
          },
        },
      };

      const request: TaskDelegationRequest = {
        agentId: 'test-agent-1',
        task: 'Complex backend task', // Misaligned with agent role
        requiredTools: ['WebSearch', 'Bash', 'Write'], // Tools agent doesn't have
      };

      const metadata: TaskExecutionMetadata = {
        agentId: 'test-agent-1',
        agentRole: 'FrontendDev',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        completedOnTime: true,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 0,
      };

      const result = await taskExecutionService.executeTask(lowPerformanceAgent, request, metadata);

      expect(result.confidence).toBeLessThanOrEqual(70);
      expect(result.success).toBe(false);
    });

    it('should handle empty task description', async () => {
      const request: TaskDelegationRequest = {
        agentId: 'test-agent-1',
        task: '',
      };

      const metadata: TaskExecutionMetadata = {
        agentId: 'test-agent-1',
        agentRole: 'FrontendDev',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        completedOnTime: true,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 0,
      };

      const result = await taskExecutionService.executeTask(mockAgent, request, metadata);

      expect(result.output).toBeDefined();
      expect(result.toolsUsed.length).toBeGreaterThan(0);
    });

    it('should add default tools when no specific tools are matched', async () => {
      const request: TaskDelegationRequest = {
        agentId: 'test-agent-1',
        task: 'Generic task without specific keywords',
      };

      const metadata: TaskExecutionMetadata = {
        agentId: 'test-agent-1',
        agentRole: 'FrontendDev',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        completedOnTime: true,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 0,
      };

      const result = await taskExecutionService.executeTask(mockAgent, request, metadata);

      // Should have at least Read tool
      expect(result.toolsUsed).toContain('Read');
      // Should probably have Write tool since agent has it
      expect(result.toolsUsed).toContain('Write');
    });

    it('should handle agents with limited tool availability', async () => {
      const limitedAgent: AgentDefinition = {
        ...mockAgent,
        configuration: {
          ...mockAgent.configuration,
          capabilities: {
            allowedTools: ['Read'], // Only Read tool
          },
        },
      };

      const request: TaskDelegationRequest = {
        agentId: 'test-agent-1',
        task: 'Create, edit, and test files',
      };

      const metadata: TaskExecutionMetadata = {
        agentId: 'test-agent-1',
        agentRole: 'FrontendDev',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        completedOnTime: true,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 0,
      };

      const result = await taskExecutionService.executeTask(limitedAgent, request, metadata);

      // Should only use available tools
      expect(result.toolsUsed.every(tool => limitedAgent.configuration.capabilities.allowedTools.includes(tool)))
        .toBe(true);
      expect(result.toolsUsed).toContain('Read');
    });

    it('should include proper timestamp and agent information in output', async () => {
      const request: TaskDelegationRequest = {
        agentId: 'test-agent-1',
        task: 'Test task with verification',
      };

      const metadata: TaskExecutionMetadata = {
        agentId: 'test-agent-1',
        agentRole: 'FrontendDev',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        completedOnTime: true,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 0,
      };

      const result = await taskExecutionService.executeTask(mockAgent, request, metadata);

      expect(result.output).toContain(mockAgent.name);
      expect(result.output).toContain(mockAgent.role);
      expect(result.output).toContain(request.task);
      expect(result.output).toContain('Completed:');
      expect(result.output).toContain('Summary');
      expect(result.output).toContain('Key Actions Taken');
      expect(result.output).toContain('Outcome');
      expect(result.output).toContain('Confidence:');
      expect(result.output).toContain('Status:');
    });

    it('should respect the execution delay for simulation', async () => {
      const request: TaskDelegationRequest = {
        agentId: 'test-agent-1',
        task: 'Quick task',
      };

      const metadata: TaskExecutionMetadata = {
        agentId: 'test-agent-1',
        agentRole: 'FrontendDev',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        completedOnTime: true,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 0,
      };

      const startTime = Date.now();
      await taskExecutionService.executeTask(mockAgent, request, metadata);
      const endTime = Date.now();

      // Should take at least 10ms (minimum delay in test environment)
      expect(endTime - startTime).toBeGreaterThanOrEqual(10);
      // Should not take more than 1 second (maximum delay plus processing time in test environment)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle different agent roles appropriately', async () => {
      const roles = ['FrontendDev', 'BackendDev', 'QA', 'Architect', 'CLI Dev', 'UX Expert', 'SM'] as const;

      const results = await Promise.all(
          roles.map(async (role) => {
            const roleAgent: AgentDefinition = {
              ...mockAgent,
              id: `agent-${role}`,
              role,
              name: `${role} Agent`,
              coreSkills: [role.toLowerCase()],
            };

            const request: TaskDelegationRequest = {
              agentId: `agent-${role}`,
              task: `Task for ${role}`,
            };

            const metadata: TaskExecutionMetadata = {
              agentId: `agent-${role}`,
              agentRole: role,
              startTime: new Date(),
              endTime: new Date(),
              duration: 1000,
              completedOnTime: true,
              toolsUsed: [],
              toolInvocations: 0,
              collaborationUsed: false,
              confidence: 0,
            };

            const result = await taskExecutionService.executeTask(roleAgent, request, metadata);
            return { result, role, roleAgent };
          })
        );

        results.forEach(({ result, role, roleAgent }) => {
          expect(result.output).toContain(roleAgent.name);
          expect(result.output).toContain(roleAgent.role);
          expect(result.toolsUsed.length).toBeGreaterThan(0);
        });
    });
  });

  describe('Private Methods (via public behavior)', () => {
    describe('Tool selection logic', () => {
      it('should select tools based on task keywords', async () => {
        const taskToolMapping = [
          { task: 'Read the configuration file', expectedTool: 'Read' },
          { task: 'Write new code', expectedTool: 'Write' },
          { task: 'Edit existing file', expectedTool: 'Edit' },
          { task: 'Build the project', expectedTool: 'Bash' },
          { task: 'Search online', expectedTool: 'WebSearch' },
          { task: 'Fetch API data', expectedTool: 'WebFetch' },
          { task: 'Find all files', expectedTool: 'Glob' },
          { task: 'Search codebase', expectedTool: 'Grep' },
        ];

        const metadata: TaskExecutionMetadata = {
          agentId: 'test-agent-1',
          agentRole: 'FrontendDev',
          startTime: new Date(),
          endTime: new Date(),
          duration: 1000,
          completedOnTime: true,
          toolsUsed: [],
          toolInvocations: 0,
          collaborationUsed: false,
          confidence: 0,
        };

        const results = await Promise.all(
          taskToolMapping.map(async ({ task, expectedTool }) => {
            const request: TaskDelegationRequest = {
              agentId: 'test-agent-1',
              task,
            };

            const result = await taskExecutionService.executeTask(mockAgent, request, metadata);
            return { result, expectedTool };
          })
        );

        results.forEach(({ result, expectedTool }) => {
          expect(result.toolsUsed).toContain(expectedTool);
        });
      });

      it('should be case insensitive when selecting tools', async () => {
        const taskVariations = [
          'read the file',
          'READ THE FILE',
          'Read The File',
          'ReAd ThE FiLe',
        ];

        const metadata: TaskExecutionMetadata = {
          agentId: 'test-agent-1',
          agentRole: 'FrontendDev',
          startTime: new Date(),
          endTime: new Date(),
          duration: 1000,
          completedOnTime: true,
          toolsUsed: [],
          toolInvocations: 0,
          collaborationUsed: false,
          confidence: 0,
        };

        const results = await Promise.all(
          taskVariations.map(async (task) => {
            const request: TaskDelegationRequest = {
              agentId: 'test-agent-1',
              task,
            };

            const result = await taskExecutionService.executeTask(mockAgent, request, metadata);
            return result;
          })
        );

        results.forEach((result) => {
          expect(result.toolsUsed).toContain('Read');
        });
      });
    });

    describe('Confidence calculation', () => {
      it('should boost confidence for role-aligned tasks', async () => {
        const alignedTask = 'Create a React component with TypeScript';
        const misalignedTask = 'Configure database server';

        const metadata: TaskExecutionMetadata = {
          agentId: 'test-agent-1',
          agentRole: 'FrontendDev',
          startTime: new Date(),
          endTime: new Date(),
          duration: 1000,
          completedOnTime: true,
          toolsUsed: [],
          toolInvocations: 0,
          collaborationUsed: false,
          confidence: 0,
        };

        const alignedResult = await taskExecutionService.executeTask(mockAgent, {
          agentId: 'test-agent-1',
          task: alignedTask,
        }, metadata);

        const misalignedResult = await taskExecutionService.executeTask(mockAgent, {
          agentId: 'test-agent-1',
          task: misalignedTask,
        }, metadata);

        // Aligned task should have higher confidence
        expect(alignedResult.confidence).toBeGreaterThan(misalignedResult.confidence);
      });

      it('should cap confidence at 100', async () => {
        const highPerformanceAgent: AgentDefinition = {
          ...mockAgent,
          metadata: {
            ...mockAgent.metadata,
            metrics: {
              avgCompletionTime: 1000, // Very fast
              successRate: 100, // Perfect
            },
          },
        };

        const request: TaskDelegationRequest = {
          agentId: 'test-agent-1',
          task: 'Perfect frontend task with React and TypeScript',
          requiredTools: ['Read', 'Write', 'Edit'], // All available
        };

        const metadata: TaskExecutionMetadata = {
          agentId: 'test-agent-1',
          agentRole: 'FrontendDev',
          startTime: new Date(),
          endTime: new Date(),
          duration: 1000,
          completedOnTime: true,
          toolsUsed: [],
          toolInvocations: 0,
          collaborationUsed: false,
          confidence: 0,
        };

        const result = await taskExecutionService.executeTask(highPerformanceAgent, request, metadata);

        expect(result.confidence).toBeLessThanOrEqual(100);
      });

      it('should ensure confidence is never negative', async () => {
        const lowPerformanceAgent: AgentDefinition = {
          ...mockAgent,
          metadata: {
            ...mockAgent.metadata,
            metrics: {
              avgCompletionTime: 300000, // Very slow
              successRate: 50, // Low success rate
            },
          },
          configuration: {
            ...mockAgent.configuration,
            capabilities: {
              allowedTools: ['Read'], // Minimal tools
            },
          },
        };

        const request: TaskDelegationRequest = {
          agentId: 'test-agent-1',
          task: 'Complex task requiring unavailable tools',
          requiredTools: ['UnavailableTool1', 'UnavailableTool2'],
        };

        const metadata: TaskExecutionMetadata = {
          agentId: 'test-agent-1',
          agentRole: 'FrontendDev',
          startTime: new Date(),
          endTime: new Date(),
          duration: 1000,
          completedOnTime: true,
          toolsUsed: [],
          toolInvocations: 0,
          collaborationUsed: false,
          confidence: 0,
        };

        const result = await taskExecutionService.executeTask(lowPerformanceAgent, request, metadata);

        expect(result.confidence).toBeGreaterThanOrEqual(0);
      });
    });
  });
});