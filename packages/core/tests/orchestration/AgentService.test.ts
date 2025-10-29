/**
 * Tests for AgentService
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { AgentService } from '../../src/orchestration/agent-service';
import { AgentDefinition } from '../../src/agents/types';
import { TaskExecutionMetadata } from '../../src/orchestration/types';

describe('AgentService', () => {
  let agentService: AgentService;
  let mockRegisteredAgents: Map<string, AgentDefinition>;

  beforeEach(() => {
    mockRegisteredAgents = new Map<string, AgentDefinition>();

    // Frontend Developer Agent
    const frontendAgent: AgentDefinition = {
      id: 'frontend-agent-1',
      name: 'React Specialist',
      role: 'FrontendDev',
      description: 'Frontend development specialist with React expertise',
      version: '1.0.0',
      coreSkills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'HTML'],
      configuration: {
        capabilities: {
          allowedTools: ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'WebFetch'],
          maxConcurrentTasks: 3,
        },
        communication: {
          collaboration: {
            enabled: true,
            preferredMethods: ['direct', 'slack'],
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
        tags: ['frontend', 'react'],
        metrics: {
          avgCompletionTime: 25000,
          successRate: 94,
        },
      },
    };

    // Backend Developer Agent
    const backendAgent: AgentDefinition = {
      id: 'backend-agent-1',
      name: 'Node.js Specialist',
      role: 'BackendDev',
      description: 'Backend development specialist with Node.js expertise',
      version: '1.0.0',
      coreSkills: ['Node.js', 'Express', 'MongoDB', 'API Design', 'Authentication'],
      configuration: {
        capabilities: {
          allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'WebSearch', 'Grep'],
          maxConcurrentTasks: 2,
        },
        communication: {
          collaboration: {
            enabled: true,
            preferredMethods: ['direct'],
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
        tags: ['backend', 'nodejs'],
        metrics: {
          avgCompletionTime: 35000,
          successRate: 91,
        },
      },
    };

    // QA Specialist Agent
    const qaAgent: AgentDefinition = {
      id: 'qa-agent-1',
      name: 'Testing Expert',
      role: 'QA',
      description: 'Quality assurance and testing specialist',
      version: '1.0.0',
      coreSkills: ['Jest', 'Cypress', 'Testing', 'Automation', 'Quality Assurance'],
      configuration: {
        capabilities: {
          allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Grep'],
          maxConcurrentTasks: 4,
        },
        communication: {
          collaboration: {
            enabled: false,
            preferredMethods: [],
          },
        },
        performance: {
          maxConcurrentTasks: 4,
        },
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'test',
        version: '1.0.0',
        tags: ['qa', 'testing'],
        metrics: {
          avgCompletionTime: 20000,
          successRate: 97,
        },
      },
    };

    mockRegisteredAgents.set('frontend-agent-1', frontendAgent);
    mockRegisteredAgents.set('backend-agent-1', backendAgent);
    mockRegisteredAgents.set('qa-agent-1', qaAgent);

    agentService = new AgentService(mockRegisteredAgents);
  });

  describe('getAgentCapabilities', () => {
    it('should return capabilities for existing agent', async () => {
      const capabilities = await agentService.getAgentCapabilities('frontend-agent-1');

      expect(capabilities).not.toBeNull();
      expect(capabilities?.tools).toEqual(['Read', 'Write', 'Edit', 'Grep', 'Glob', 'WebFetch']);
      expect(capabilities?.taskTypes).toContain('ui-development');
      expect(capabilities?.taskTypes).toContain('component-creation');
      expect(capabilities?.maxConcurrentTasks).toBe(3);
      expect(capabilities?.avgCompletionTime).toBe(25000);
      expect(capabilities?.successRate).toBe(94);
      expect(capabilities?.specializations).toEqual(['React', 'TypeScript', 'CSS', 'JavaScript', 'HTML']);
    });

    it('should return null for non-existent agent', async () => {
      const capabilities = await agentService.getAgentCapabilities('non-existent-agent');
      expect(capabilities).toBeNull();
    });

    it('should use default values when metrics are not available', async () => {
      // Create agent without metrics
      const agentWithoutMetrics: AgentDefinition = {
        id: 'no-metrics-agent',
        name: 'No Metrics Agent',
        role: 'Custom',
        description: 'Agent without metrics',
        version: '1.0.0',
        coreSkills: ['General'],
        configuration: {
          capabilities: {
            allowedTools: ['Read'],
            maxConcurrentTasks: 1,
          },
          communication: {
            collaboration: {
              enabled: false,
              preferredMethods: [],
            },
          },
          performance: {
            maxConcurrentTasks: 1,
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

      mockRegisteredAgents.set('no-metrics-agent', agentWithoutMetrics);

      const capabilities = await agentService.getAgentCapabilities('no-metrics-agent');

      expect(capabilities?.avgCompletionTime).toBe(30000); // Default value
      expect(capabilities?.successRate).toBe(95); // Default value
    });

    it('should return task types specific to each role', async () => {
      const frontendCaps = await agentService.getAgentCapabilities('frontend-agent-1');
      const backendCaps = await agentService.getAgentCapabilities('backend-agent-1');
      const qaCaps = await agentService.getAgentCapabilities('qa-agent-1');

      expect(frontendCaps?.taskTypes).toContain('ui-development');
      expect(frontendCaps?.taskTypes).toContain('component-creation');
      expect(frontendCaps?.taskTypes).toContain('styling');

      expect(backendCaps?.taskTypes).toContain('api-development');
      expect(backendCaps?.taskTypes).toContain('database-design');
      expect(backendCaps?.taskTypes).toContain('server-logic');

      expect(qaCaps?.taskTypes).toContain('testing');
      expect(qaCaps?.taskTypes).toContain('quality-assurance');
      expect(qaCaps?.taskTypes).toContain('automation');
    });
  });

  describe('findBestAgent', () => {
    it('should find best agent for frontend task', async () => {
      const bestAgentId = await agentService.findBestAgent('Create a React component with TypeScript');
      expect(bestAgentId).toBe('frontend-agent-1');
    });

    it('should find best agent for backend task', async () => {
      const bestAgentId = await agentService.findBestAgent('Build a REST API with Node.js');
      expect(bestAgentId).toBe('backend-agent-1');
    });

    it('should find best agent for testing task', async () => {
      const bestAgentId = await agentService.findBestAgent('Write unit tests using Jest');
      expect(bestAgentId).toBe('qa-agent-1');
    });

    it('should return null when no suitable agent found', async () => {
      const bestAgentId = await agentService.findBestAgent('Specialized task requiring specific tool', ['UnavailableTool']);
      expect(bestAgentId).toBeNull();
    });

    it('should respect tool requirements', async () => {
      const bestAgentId = await agentService.findBestAgent('General task', ['Read', 'Write', 'Edit']);
      expect(bestAgentId).toBeTruthy();
      expect(['frontend-agent-1', 'backend-agent-1', 'qa-agent-1']).toContain(bestAgentId!);
    });

    it('should return null when no agents are available', async () => {
      const emptyService = new AgentService(new Map());
      const bestAgentId = await emptyService.findBestAgent('Any task');
      expect(bestAgentId).toBeNull();
    });

    it('should handle empty required tools array', async () => {
      const bestAgentId = await agentService.findBestAgent('General task', []);
      expect(bestAgentId).toBeTruthy();
    });

    it('should handle undefined required tools', async () => {
      const bestAgentId = await agentService.findBestAgent('General task');
      expect(bestAgentId).toBeTruthy();
    });
  });

  describe('isAgentAvailable', () => {
    it('should return true for agent under capacity', async () => {
      const runningTasks = new Map<string, TaskExecutionMetadata>();

      // Add 1 task for frontend agent (capacity is 3)
      runningTasks.set('task-1', {
        agentId: 'frontend-agent-1',
        agentRole: 'FrontendDev',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        completedOnTime: true,
        toolsUsed: ['Read'],
        toolInvocations: 1,
        collaborationUsed: false,
        confidence: 90,
      });

      const isAvailable = await agentService.isAgentAvailable('frontend-agent-1', runningTasks);
      expect(isAvailable).toBe(true);
    });

    it('should return false for agent at capacity', async () => {
      const runningTasks = new Map<string, TaskExecutionMetadata>();

      // Add 3 tasks for frontend agent (max capacity is 3)
      for (let i = 1; i <= 3; i++) {
        runningTasks.set(`task-${i}`, {
          agentId: 'frontend-agent-1',
          agentRole: 'FrontendDev',
          startTime: new Date(),
          endTime: new Date(),
          duration: 1000,
          completedOnTime: true,
          toolsUsed: ['Read'],
          toolInvocations: 1,
          collaborationUsed: false,
          confidence: 90,
        });
      }

      const isAvailable = await agentService.isAgentAvailable('frontend-agent-1', runningTasks);
      expect(isAvailable).toBe(false);
    });

    it('should return false for non-existent agent', async () => {
      const runningTasks = new Map<string, TaskExecutionMetadata>();
      const isAvailable = await agentService.isAgentAvailable('non-existent-agent', runningTasks);
      expect(isAvailable).toBe(false);
    });

    it('should handle empty running tasks map', async () => {
      const runningTasks = new Map<string, TaskExecutionMetadata>();
      const isAvailable = await agentService.isAgentAvailable('frontend-agent-1', runningTasks);
      expect(isAvailable).toBe(true);
    });

    it('should count only tasks for the specific agent', async () => {
      const runningTasks = new Map<string, TaskExecutionMetadata>();

      // Add tasks for different agents
      runningTasks.set('task-1', {
        agentId: 'frontend-agent-1',
        agentRole: 'FrontendDev',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        completedOnTime: true,
        toolsUsed: ['Read'],
        toolInvocations: 1,
        collaborationUsed: false,
        confidence: 90,
      });

      runningTasks.set('task-2', {
        agentId: 'backend-agent-1',
        agentRole: 'BackendDev',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        completedOnTime: true,
        toolsUsed: ['Read'],
        toolInvocations: 1,
        collaborationUsed: false,
        confidence: 90,
      });

      runningTasks.set('task-3', {
        agentId: 'frontend-agent-1',
        agentRole: 'FrontendDev',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000,
        completedOnTime: true,
        toolsUsed: ['Read'],
        toolInvocations: 1,
        collaborationUsed: false,
        confidence: 90,
      });

      // Frontend agent should have 2 tasks, backend agent should have 1 task
      const frontendAvailable = await agentService.isAgentAvailable('frontend-agent-1', runningTasks);
      const backendAvailable = await agentService.isAgentAvailable('backend-agent-1', runningTasks);

      expect(frontendAvailable).toBe(true); // 2 tasks < capacity 3
      expect(backendAvailable).toBe(true); // 1 task < capacity 2
    });
  });

  describe('Private Methods (via public behavior)', () => {
    describe('Agent suitability scoring', () => {
      it('should prefer agents with better tool availability', async () => {
        const bestAgentId = await agentService.findBestAgent('Build a user interface', ['WebFetch']);

        // Only frontend agent has WebFetch tool
        expect(bestAgentId).toBe('frontend-agent-1');
      });

      it('should consider agent performance metrics', async () => {
        // QA agent has highest success rate (97%) and lowest completion time (20s)
        const bestAgentId = await agentService.findBestAgent('Test a component');
        expect(bestAgentId).toBe('qa-agent-1');
      });

      it('should handle role-task alignment correctly', async () => {
        const frontendTask = await agentService.findBestAgent('Create a React component with CSS styling');
        const backendTask = await agentService.findBestAgent('Implement a Node.js server with database');
        const qaTask = await agentService.findBestAgent('Write automated tests with Jest');

        expect(frontendTask).toBe('frontend-agent-1');
        expect(backendTask).toBe('backend-agent-1');
        expect(qaTask).toBe('qa-agent-1');
      });

      it('should handle ambiguous tasks', async () => {
        // This task could fit multiple roles, should return the best scoring agent
        const bestAgentId = await agentService.findBestAgent('Development task');
        expect(bestAgentId).toBeTruthy();
        expect(['frontend-agent-1', 'backend-agent-1', 'qa-agent-1']).toContain(bestAgentId!);
      });
    });

    describe('Edge cases', () => {
      it('should handle empty task description', async () => {
        const bestAgentId = await agentService.findBestAgent('');
        expect(bestAgentId).toBeTruthy();
      });

      it('should handle very long task description', async () => {
        const longTask = 'Create a complex React component with TypeScript, CSS modules, state management, ' +
                         'testing, documentation, accessibility features, performance optimization, ' +
                         'error handling, and responsive design for a modern web application';

        const bestAgentId = await agentService.findBestAgent(longTask);
        expect(bestAgentId).toBe('frontend-agent-1');
      });

      it('should handle case sensitivity in task descriptions', async () => {
        const lowerCase = await agentService.findBestAgent('create a react component');
        const upperCase = await agentService.findBestAgent('CREATE A REACT COMPONENT');
        const mixedCase = await agentService.findBestAgent('Create a React Component');

        expect(lowerCase).toBe('frontend-agent-1');
        expect(upperCase).toBe('frontend-agent-1');
        expect(mixedCase).toBe('frontend-agent-1');
      });

      it('should handle special characters in task descriptions', async () => {
        const taskWithSpecialChars = 'Create a React.js component with TypeScript (TSX) & CSS/Sass styling';
        const bestAgentId = await agentService.findBestAgent(taskWithSpecialChars);
        expect(bestAgentId).toBe('frontend-agent-1');
      });
    });
  });
});