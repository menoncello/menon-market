/**
 * Tests for Claude Code Integration
 * Tests Task Tool delegation, subagent registration, and discovery
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import {
  ClaudeCodeTaskIntegration,
  TaskDelegationRequest,
} from '../src/orchestration/task-delegation';
import { SubagentRegistry } from '../src/orchestration/subagent-registry';
import { AgentDefinition, AgentRole } from '../src/agents/types';

describe('Claude Code Integration', () => {
  let taskIntegration: ClaudeCodeTaskIntegration;
  let subagentRegistry: SubagentRegistry;
  let testAgents: AgentDefinition[];

  beforeEach(() => {
    taskIntegration = new ClaudeCodeTaskIntegration();
    subagentRegistry = new SubagentRegistry(taskIntegration);
    testAgents = createTestAgents();
  });

  afterEach(() => {
    subagentRegistry.dispose();
  });

  describe('Subagent Registration', () => {
    it('should register subagents successfully', () => {
      for (const agent of testAgents) {
        subagentRegistry.registerSubagent(agent);
      }

      const stats = subagentRegistry.getStatistics();
      expect(stats.totalSubagents).toBe(testAgents.length);
      expect(stats.byStatus.active).toBe(testAgents.length);
    });

    it('should unregister subagents successfully', () => {
      const agent = testAgents[0];
      subagentRegistry.registerSubagent(agent);

      let stats = subagentRegistry.getStatistics();
      expect(stats.totalSubagents).toBe(1);

      const unregistered = subagentRegistry.unregisterSubagent(agent.id);
      expect(unregistered).toBe(true);

      stats = subagentRegistry.getStatistics();
      expect(stats.totalSubagents).toBe(0);
    });

    it('should update subagent status', () => {
      const agent = testAgents[0];
      subagentRegistry.registerSubagent(agent);

      const updated = subagentRegistry.updateSubagentStatus(agent.id, 'busy');
      expect(updated).toBe(true);

      const registration = subagentRegistry.getSubagent(agent.id);
      expect(registration?.status).toBe('busy');
    });
  });

  describe('Task Delegation', () => {
    beforeEach(() => {
      for (const agent of testAgents) {
        subagentRegistry.registerSubagent(agent);
      }
    });

    it('should delegate tasks to appropriate agents', async () => {
      const request: TaskDelegationRequest = {
        agentId: testAgents[0].id,
        task: 'Create a React component for user authentication',
        priority: 8,
        timeout: 30,
      };

      const response = await taskIntegration.delegateTask(request);

      expect(response.success).toBe(true);
      expect(response.result).toBeDefined();
      expect(response.metadata.agentId).toBe(testAgents[0].id);
      expect(response.metadata.duration).toBeGreaterThan(0);
      expect(response.metadata.confidence).toBeGreaterThan(70);
    });

    it('should reject tasks for non-existent agents', async () => {
      const request: TaskDelegationRequest = {
        agentId: 'non-existent-agent',
        task: 'Test task',
      };

      // Test with the taskIntegration directly (not through subagentRegistry)
      const directTaskIntegration = new ClaudeCodeTaskIntegration();
      const response = await directTaskIntegration.delegateTask(request);

      expect(response.success).toBe(false);
      expect(response.errors).toBeDefined();
      expect(response.errors?.some(error => error.includes('not found'))).toBe(true);
    });

    it('should validate required tools', async () => {
      // Use a direct task integration to control which agents are registered
      const directTaskIntegration = new ClaudeCodeTaskIntegration();

      // Register agent with limited tools for testing
      const agentWithLimitedTools: AgentDefinition = {
        ...testAgents[0],
        configuration: {
          ...testAgents[0].configuration,
          capabilities: {
            ...testAgents[0].configuration.capabilities,
            allowedTools: ['Read', 'Write'], // Limited tools
          },
        },
      };

      directTaskIntegration.registerAgent(agentWithLimitedTools);

      const request: TaskDelegationRequest = {
        agentId: agentWithLimitedTools.id,
        task: 'Test task',
        requiredTools: ['NonExistentTool', 'AnotherUnavailableTool'],
      };

      const response = await directTaskIntegration.delegateTask(request);

      expect(response.success).toBe(false);
      expect(response.errors).toBeDefined();
      expect(response.errors?.some(error => error.includes('Missing required tools'))).toBe(true);
    });

    it('should track task execution metrics', async () => {
      const request: TaskDelegationRequest = {
        agentId: testAgents[0].id,
        task: 'Create a TypeScript interface',
      };

      const response = await taskIntegration.delegateTask(request);

      expect(response.metadata.toolsUsed.length).toBeGreaterThan(0);
      expect(response.metadata.toolInvocations).toBeGreaterThan(0);
      expect(response.metadata.startTime).toBeInstanceOf(Date);
      expect(response.metadata.endTime).toBeInstanceOf(Date);
    });
  });

  describe('Subagent Discovery', () => {
    beforeEach(() => {
      for (const agent of testAgents) {
        subagentRegistry.registerSubagent(agent);
      }
    });

    it('should find subagents by role', () => {
      const frontendDevs = subagentRegistry.getSubagentsByRole('FrontendDev');
      expect(frontendDevs.length).toBe(1);
      expect(frontendDevs[0].agent.role).toBe('FrontendDev');
    });

    it('should find subagents by filter criteria', () => {
      const filter = {
        role: 'FrontendDev' as AgentRole,
        status: 'active' as const,
        minSuccessRate: 90,
      };

      const results = subagentRegistry.findSubagents(filter);
      expect(results.length).toBe(1);
      expect(results[0].agent.role).toBe('FrontendDev');
      expect(results[0].status).toBe('active');
      expect(results[0].successRate).toBeGreaterThanOrEqual(90);
    });

    it('should get best subagent for a task', () => {
      const bestAgent = subagentRegistry.getBestSubagent(
        'Create a React component with TypeScript',
        ['Read', 'Write', 'Edit']
      );

      expect(bestAgent).toBeDefined();
      expect(bestAgent?.agent.role).toBe('FrontendDev');
    });

    it('should return null when no suitable subagent found', () => {
      const bestAgent = subagentRegistry.getBestSubagent('Complex database architecture design', [
        'NonExistentTool',
      ]);

      expect(bestAgent).toBeNull();
    });

    it('should provide accurate statistics', () => {
      const stats = subagentRegistry.getStatistics();

      expect(stats.totalSubagents).toBe(testAgents.length);
      expect(stats.byStatus.active).toBe(testAgents.length);
      expect(stats.systemMetrics.avgSuccessRate).toBeGreaterThan(0);
      expect(stats.systemMetrics.totalTasksCompleted).toBe(0);
    });
  });

  describe('Agent Capabilities', () => {
    beforeEach(() => {
      for (const agent of testAgents) {
        subagentRegistry.registerSubagent(agent);
      }
    });

    it('should provide agent capabilities', async () => {
      const agent = testAgents[0];
      const capabilities = await taskIntegration.getAgentCapabilities(agent.id);

      expect(capabilities).toBeDefined();
      expect(capabilities.tools.length).toBeGreaterThan(0);
      expect(capabilities.taskTypes.length).toBeGreaterThan(0);
      expect(capabilities.maxConcurrentTasks).toBeGreaterThan(0);
      expect(capabilities.specializations.length).toBeGreaterThan(0);
    });

    it('should return null for non-existent agent capabilities', async () => {
      const capabilities = await taskIntegration.getAgentCapabilities('non-existent');
      expect(capabilities).toBeNull();
    });

    it('should find best agent for tasks', async () => {
      const bestAgentId = await taskIntegration.findBestAgent(
        'Create a responsive React component with TypeScript',
        ['Read', 'Write', 'Edit']
      );

      expect(bestAgentId).toBeDefined();
      // Find the actual best agent from test agents
      const frontendAgent = testAgents.find(agent => agent.role === 'FrontendDev');
      if (frontendAgent) {
        expect(bestAgentId).toBe(frontendAgent.id);
      }
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      for (const agent of testAgents) {
        subagentRegistry.registerSubagent(agent);
      }
    });

    it('should handle invalid task requests', async () => {
      // Use a direct task integration to test validation
      const directTaskIntegration = new ClaudeCodeTaskIntegration();
      directTaskIntegration.registerAgent(testAgents[0]);

      const request = {
        agentId: testAgents[0].id,
        task: '', // Empty task
      } as TaskDelegationRequest;

      const response = await directTaskIntegration.delegateTask(request);

      expect(response.success).toBe(false); // Empty task should fail validation
      expect(response.errors).toBeDefined();
      expect(response.errors?.some(error => error.includes('Task description is required'))).toBe(true);
    });

    it('should handle busy agents gracefully', async () => {
      // Mark agent as busy
      subagentRegistry.updateSubagentStatus(testAgents[0].id, 'busy');

      const request: TaskDelegationRequest = {
        agentId: testAgents[0].id,
        task: 'Test task',
      };

      const response = await taskIntegration.delegateTask(request);

      // The task should still succeed as busy agents can still work
      expect(response.success).toBe(true);
      expect(response.result).toBeDefined();
    });
  });

  describe('Integration Workflow', () => {
    it('should complete full agent creation and delegation workflow', async () => {
      // 1. Register agent
      const agent = testAgents[0];
      subagentRegistry.registerSubagent(agent);

      // 2. Discover best agent for task
      const bestAgent = subagentRegistry.getBestSubagent(
        'Build a modern React dashboard with TypeScript',
        ['Read', 'Write', 'Edit', 'Glob']
      );

      expect(bestAgent?.agent.id).toBe(agent.id);

      // 3. Delegate task
      const request: TaskDelegationRequest = {
        agentId: agent.id,
        task: 'Build a modern React dashboard with TypeScript',
        requiredTools: ['Read', 'Write', 'Edit'],
        outputFormat: 'markdown',
      };

      const response = await taskIntegration.delegateTask(request);

      expect(response.success).toBe(true);
      expect(response.result).toBeDefined();

      // 4. Record completion
      subagentRegistry.recordTaskCompletion(agent.id, response.success, response.metadata.duration);

      // 5. Verify updated statistics
      const registration = subagentRegistry.getSubagent(agent.id);
      expect(registration?.tasksCompleted).toBe(1);
    });
  });

  // Helper function to create test agents
  function createTestAgents(): AgentDefinition[] {
    return [
      {
        id: 'test-frontend-001',
        name: 'Test Frontend Developer',
        description: 'A test frontend development agent',
        role: 'FrontendDev',
        goals: ['Build great UI', 'Write clean code'],
        backstory: 'I am a test frontend developer',
        coreSkills: ['React', 'TypeScript', 'CSS', 'HTML'],
        learningMode: 'adaptive',
        configuration: {
          performance: {
            maxExecutionTime: 45,
            memoryLimit: 512,
            maxConcurrentTasks: 3,
            priority: 8,
          },
          capabilities: {
            allowedTools: ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'WebSearch'],
            fileSystemAccess: {
              read: true,
              write: true,
              execute: false,
              allowedPaths: ['src', 'components'],
            },
            networkAccess: {
              http: true,
              https: true,
              externalApis: true,
              allowedDomains: [],
            },
            agentIntegration: true,
          },
          communication: {
            style: 'technical',
            responseFormat: 'markdown',
            collaboration: {
              enabled: true,
              roles: ['contributor'],
              conflictResolution: 'collaborative',
            },
          },
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0.0',
          author: 'Test',
          tags: ['test', 'frontend'],
          dependencies: ['@menon-market/core'],
        },
      },
      {
        id: 'test-backend-001',
        name: 'Test Backend Developer',
        description: 'A test backend development agent',
        role: 'BackendDev',
        goals: ['Build scalable APIs', 'Design databases'],
        backstory: 'I am a test backend developer',
        coreSkills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL'],
        learningMode: 'adaptive',
        configuration: {
          performance: {
            maxExecutionTime: 60,
            memoryLimit: 1024,
            maxConcurrentTasks: 4,
            priority: 9,
          },
          capabilities: {
            allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'WebSearch'],
            fileSystemAccess: {
              read: true,
              write: true,
              execute: true,
              allowedPaths: ['src', 'api', 'config'],
            },
            networkAccess: {
              http: true,
              https: true,
              externalApis: true,
              allowedDomains: [],
            },
            agentIntegration: true,
          },
          communication: {
            style: 'technical',
            responseFormat: 'structured',
            collaboration: {
              enabled: true,
              roles: ['implementer', 'leader'],
              conflictResolution: 'collaborative',
            },
          },
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0.0',
          author: 'Test',
          tags: ['test', 'backend'],
          dependencies: ['@menon-market/core'],
        },
      },
    ];
  }
});
