/**
 * Minimal test to isolate TaskExecutionService issue
 */

import { TaskExecutionService } from '../../src/orchestration/task-execution-service';
import { AgentDefinition } from '../../src/agents/types';
import { TaskDelegationRequest, TaskExecutionMetadata } from '../../src/orchestration/types';

describe('TaskExecutionService - Isolated Test', () => {
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

  it('should execute a task successfully', async () => {
    const request: TaskDelegationRequest = {
      agentId: 'test-agent-1',
      task: 'Create a React component',
      priority: 5,
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

    console.log('Result:', result);

    expect(result).toBeDefined();
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
});