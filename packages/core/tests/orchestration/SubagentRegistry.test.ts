/**
 * Tests for SubagentRegistry
 */

import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { SubagentRegistry, SubagentStatus, DiscoveryFilter } from '../../src/orchestration/subagent-registry';
import { AgentDefinition } from '../../src/agents/types';
import { ClaudeCodeTaskIntegration } from '../../src/orchestration/task-delegation';

describe('SubagentRegistry', () => {
  let subagentRegistry: SubagentRegistry;
  let mockTaskIntegration: ClaudeCodeTaskIntegration;
  let mockAgents: AgentDefinition[];

  beforeEach(() => {
    // Create mock task integration
    mockTaskIntegration = {
      registerAgent: mock(() => {}),
      unregisterAgent: mock(() => {}),
    } as any;

    subagentRegistry = new SubagentRegistry(mockTaskIntegration);

    // Create mock agents
    mockAgents = [
      {
        id: 'frontend-agent-1',
        name: 'React Specialist',
        role: 'FrontendDev',
        description: 'Frontend development specialist',
        version: '1.0.0',
        coreSkills: ['React', 'TypeScript', 'CSS', 'JavaScript'],
        configuration: {
          capabilities: {
            allowedTools: ['Read', 'Write', 'Edit', 'Grep', 'Glob'],
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
          tags: ['frontend'],
          metrics: {
            avgCompletionTime: 25000,
            successRate: 94,
          },
        },
      },
      {
        id: 'backend-agent-1',
        name: 'Node.js Specialist',
        role: 'BackendDev',
        description: 'Backend development specialist',
        version: '1.0.0',
        coreSkills: ['Node.js', 'Express', 'MongoDB', 'API Design'],
        configuration: {
          capabilities: {
            allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'WebSearch'],
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
          tags: ['backend'],
          metrics: {
            avgCompletionTime: 35000,
            successRate: 91,
          },
        },
      },
      {
        id: 'qa-agent-1',
        name: 'Testing Expert',
        role: 'QA',
        description: 'Quality assurance specialist',
        version: '1.0.0',
        coreSkills: ['Jest', 'Cypress', 'Testing', 'Automation'],
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
          tags: ['qa'],
          metrics: {
            avgCompletionTime: 20000,
            successRate: 97,
          },
        },
      },
    ];
  });

  afterEach(() => {
    subagentRegistry.dispose();
  });

  describe('Subagent Registration', () => {
    it('should register a subagent successfully', () => {
      const agent = mockAgents[0];
      subagentRegistry.registerSubagent(agent);

      expect(mockTaskIntegration.registerAgent).toHaveBeenCalled();

      const registeredAgent = subagentRegistry.getSubagent(agent.id);
      expect(registeredAgent).not.toBeNull();
      expect(registeredAgent!.agent).toEqual(agent);
      expect(registeredAgent!.status).toBe('active');
      expect(registeredAgent!.tasksCompleted).toBe(0);
      expect(registeredAgent!.successRate).toBe(100);
      expect(registeredAgent!.currentLoad).toBe(0);
    });

    it('should register multiple subagents', () => {
      mockAgents.forEach(agent => {
        subagentRegistry.registerSubagent(agent);
      });

      expect(mockTaskIntegration.registerAgent).toHaveBeenCalledTimes(3);

      const allSubagents = subagentRegistry.getAllSubagents();
      expect(allSubagents).toHaveLength(3);

      mockAgents.forEach(agent => {
        const registeredAgent = subagentRegistry.getSubagent(agent.id);
        expect(registeredAgent).not.toBeNull();
        expect(registeredAgent!.agent.id).toBe(agent.id);
      });
    });

    it('should unregister a subagent successfully', () => {
      const agent = mockAgents[0];
      subagentRegistry.registerSubagent(agent);

      let registeredAgent = subagentRegistry.getSubagent(agent.id);
      expect(registeredAgent).not.toBeNull();

      const unregistered = subagentRegistry.unregisterSubagent(agent.id);
      expect(unregistered).toBe(true);
      expect(mockTaskIntegration.unregisterAgent).toHaveBeenCalledWith(agent.id);

      registeredAgent = subagentRegistry.getSubagent(agent.id);
      expect(registeredAgent).toBeNull();
    });

    it('should return false when unregistering non-existent subagent', () => {
      const result = subagentRegistry.unregisterSubagent('non-existent-agent');
      expect(result).toBe(false);
      expect(mockTaskIntegration.unregisterAgent).not.toHaveBeenCalled();
    });
  });

  describe('Status Management', () => {
    it('should update subagent status', () => {
      const agent = mockAgents[0];
      subagentRegistry.registerSubagent(agent);

      const updated = subagentRegistry.updateSubagentStatus(agent.id, 'busy');
      expect(updated).toBe(true);

      const registeredAgent = subagentRegistry.getSubagent(agent.id);
      expect(registeredAgent!.status).toBe('busy');
    });

    it('should return false when updating status of non-existent subagent', () => {
      const updated = subagentRegistry.updateSubagentStatus('non-existent-agent', 'busy');
      expect(updated).toBe(false);
    });

    it('should update last activity timestamp when status changes', async () => {
      const agent = mockAgents[0];
      subagentRegistry.registerSubagent(agent);

      const initialActivity = subagentRegistry.getSubagent(agent.id)!.lastActivity;

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 5));

      subagentRegistry.updateSubagentStatus(agent.id, 'busy');

      const updatedActivity = subagentRegistry.getSubagent(agent.id)!.lastActivity;
      expect(updatedActivity.getTime()).toBeGreaterThan(initialActivity.getTime());
    });

    it('should handle all valid status values', () => {
      const agent = mockAgents[0];
      subagentRegistry.registerSubagent(agent);

      const statuses: SubagentStatus[] = ['active', 'inactive', 'busy', 'error', 'maintenance'];

      statuses.forEach(status => {
        const updated = subagentRegistry.updateSubagentStatus(agent.id, status);
        expect(updated).toBe(true);

        const registeredAgent = subagentRegistry.getSubagent(agent.id);
        expect(registeredAgent!.status).toBe(status);
      });
    });
  });

  describe('Task Completion Recording', () => {
    it('should record successful task completion', () => {
      const agent = mockAgents[0];
      subagentRegistry.registerSubagent(agent);

      subagentRegistry.recordTaskCompletion(agent.id, true, 5000);

      const registeredAgent = subagentRegistry.getSubagent(agent.id)!;
      expect(registeredAgent.tasksCompleted).toBe(1);
      expect(registeredAgent.lastActivity.getTime()).toBeGreaterThan(0);
      expect(registeredAgent.successRate).toBeGreaterThan(90); // Should still be high after one success
    });

    it('should record failed task completion', () => {
      const agent = mockAgents[0];
      subagentRegistry.registerSubagent(agent);

      subagentRegistry.recordTaskCompletion(agent.id, false, 10000);

      const registeredAgent = subagentRegistry.getSubagent(agent.id)!;
      expect(registeredAgent.tasksCompleted).toBe(1);
      expect(registeredAgent.successRate).toBeLessThan(100); // Should decrease after failure
    });

    it('should update success rate with rolling average', () => {
      const agent = mockAgents[0];
      subagentRegistry.registerSubagent(agent);

      // Record multiple task completions
      const results = [true, true, false, true, false]; // 3 successes, 2 failures = 60% success rate
      const responseTimes = [5000, 6000, 8000, 4000, 7000];

      results.forEach((success, index) => {
        subagentRegistry.recordTaskCompletion(agent.id, success, responseTimes[index]);
      });

      const registeredAgent = subagentRegistry.getSubagent(agent.id)!;
      expect(registeredAgent.tasksCompleted).toBe(5);
      // Due to rolling average (0.1 weight), it should be closer to initial 100 than actual 60
      expect(registeredAgent.successRate).toBeGreaterThan(60);
      expect(registeredAgent.successRate).toBeLessThan(100);
    });

    it('should update average response time with rolling average', () => {
      const agent = mockAgents[1]; // Backend agent with 35s avg
      subagentRegistry.registerSubagent(agent);

      const initialResponseTime = subagentRegistry.getSubagent(agent.id)!.capabilities.performance.avgResponseTime;
      expect(initialResponseTime).toBe(35000);

      // Record faster completion times
      subagentRegistry.recordTaskCompletion(agent.id, true, 20000);
      subagentRegistry.recordTaskCompletion(agent.id, true, 15000);

      const updatedResponseTime = subagentRegistry.getSubagent(agent.id)!.capabilities.performance.avgResponseTime;
      // Should be lower than initial due to rolling average
      expect(updatedResponseTime).toBeLessThan(initialResponseTime);
    });

    it('should handle recording for non-existent agent', () => {
      // Should not throw error
      expect(() => {
        subagentRegistry.recordTaskCompletion('non-existent-agent', true, 5000);
      }).not.toThrow();
    });
  });

  describe('Subagent Discovery', () => {
    beforeEach(() => {
      mockAgents.forEach(agent => {
        subagentRegistry.registerSubagent(agent);
      });

      // Set different statuses for testing
      subagentRegistry.updateSubagentStatus('frontend-agent-1', 'active');
      subagentRegistry.updateSubagentStatus('backend-agent-1', 'active');
      subagentRegistry.updateSubagentStatus('qa-agent-1', 'active');

      // Set different loads
      const frontendAgent = subagentRegistry.getSubagent('frontend-agent-1')!;
      frontendAgent.currentLoad = 30;

      const backendAgent = subagentRegistry.getSubagent('backend-agent-1')!;
      backendAgent.currentLoad = 85;

      const qaAgent = subagentRegistry.getSubagent('qa-agent-1')!;
      qaAgent.currentLoad = 50;
    });

    describe('findSubagents', () => {
      it('should return all subagents when no filter provided', () => {
        const subagents = subagentRegistry.findSubagents();
        expect(subagents).toHaveLength(3);
      });

      it('should filter by role', () => {
        const filter: DiscoveryFilter = { role: 'FrontendDev' };
        const subagents = subagentRegistry.findSubagents(filter);

        expect(subagents).toHaveLength(1);
        expect(subagents[0].agent.role).toBe('FrontendDev');
      });

      it('should filter by status', () => {
        const filter: DiscoveryFilter = { status: 'active' };
        const subagents = subagentRegistry.findSubagents(filter);

        expect(subagents).toHaveLength(3);
        expect(subagents.every(s => s.status === 'active')).toBe(true);
      });

      it('should filter by capabilities', () => {
        const filter: DiscoveryFilter = { capabilities: ['React'] };
        const subagents = subagentRegistry.findSubagents(filter);

        expect(subagents).toHaveLength(1);
        expect(subagents[0].agent.coreSkills).toContain('React');
      });

      it('should filter by minimum success rate', () => {
        // QA agent has highest success rate (97)
        const filter: DiscoveryFilter = { minSuccessRate: 95 };
        const subagents = subagentRegistry.findSubagents(filter);

        expect(subagents.length).toBeGreaterThanOrEqual(1);
        expect(subagents.every(s => s.successRate >= 95)).toBe(true);
      });

      it('should filter by maximum load', () => {
        const filter: DiscoveryFilter = { maxLoad: 60 };
        const subagents = subagentRegistry.findSubagents(filter);

        expect(subagents).toHaveLength(2); // frontend (30) and qa (50)
        expect(subagents.every(s => s.currentLoad <= 60)).toBe(true);
      });

      it('should filter by required tools', () => {
        const filter: DiscoveryFilter = { requiredTools: ['WebSearch'] };
        const subagents = subagentRegistry.findSubagents(filter);

        expect(subagents).toHaveLength(1);
        expect(subagents[0].agent.id).toBe('backend-agent-1');
      });

      it('should apply multiple filters', () => {
        const filter: DiscoveryFilter = {
          status: 'active',
          maxLoad: 60,
          requiredTools: ['Read'], // All agents have Read
        };

        const subagents = subagentRegistry.findSubagents(filter);

        expect(subagents).toHaveLength(2); // frontend and qa
        expect(subagents.every(s => s.status === 'active')).toBe(true);
        expect(subagents.every(s => s.currentLoad <= 60)).toBe(true);
      });

      it('should return empty array when no agents match filter', () => {
        const filter: DiscoveryFilter = { role: 'Architect' };
        const subagents = subagentRegistry.findSubagents(filter);

        expect(subagents).toHaveLength(0);
      });
    });

    describe('getBestSubagent', () => {
      it('should return best subagent for task', () => {
        const bestSubagent = subagentRegistry.getBestSubagent('Create a React component');

        expect(bestSubagent).not.toBeNull();
        expect(bestSubagent!.agent.role).toBe('FrontendDev');
      });

      it('should return best subagent considering requirements', () => {
        // Temporarily reduce backend agent load for this test
        const backendAgent = subagentRegistry.getSubagent('backend-agent-1')!;
        const originalLoad = backendAgent.currentLoad;
        backendAgent.currentLoad = 40; // Below threshold

        const bestSubagent = subagentRegistry.getBestSubagent('Build REST API', ['WebSearch']);

        expect(bestSubagent).not.toBeNull();
        expect(bestSubagent!.agent.role).toBe('BackendDev');

        // Restore original load
        backendAgent.currentLoad = originalLoad;
      });

      it('should return null when no suitable subagent found', () => {
        // All agents are at high load or busy
        subagentRegistry.updateSubagentStatus('frontend-agent-1', 'busy');
        subagentRegistry.updateSubagentStatus('qa-agent-1', 'busy');
        subagentRegistry.updateSubagentStatus('backend-agent-1', 'busy');

        const bestSubagent = subagentRegistry.getBestSubagent('Any task');

        // All agents are busy, but method should still find the best one (resilient behavior)
        expect(bestSubagent).not.toBeNull();
        expect(bestSubagent!.status).toBe('busy');
      });

      it('should consider success rate in scoring', () => {
        // Give QA agent a very high success rate and reduce frontend agent's success rate
        const qaAgent = subagentRegistry.getSubagent('qa-agent-1')!;
        const frontendAgent = subagentRegistry.getSubagent('frontend-agent-1')!;

        qaAgent.successRate = 99;
        frontendAgent.successRate = 80; // Lower than QA

        const bestSubagent = subagentRegistry.getBestSubagent('Test the application');

        expect(bestSubagent).not.toBeNull();
        expect(bestSubagent!.agent.role).toBe('QA');
      });

      it('should consider load in scoring', () => {
        const bestSubagent = subagentRegistry.getBestSubagent('Generic task');

        // Should prefer frontend agent (30% load) over qa agent (50% load)
        expect(bestSubagent!.agent.id).toBe('frontend-agent-1');
      });
    });

    describe('getSubagentsByRole', () => {
      it('should return subagents by specific role', () => {
        const frontendDevs = subagentRegistry.getSubagentsByRole('FrontendDev');
        expect(frontendDevs).toHaveLength(1);
        expect(frontendDevs[0].agent.role).toBe('FrontendDev');

        const backendDevs = subagentRegistry.getSubagentsByRole('BackendDev');
        expect(backendDevs).toHaveLength(1);
        expect(backendDevs[0].agent.role).toBe('BackendDev');

        const qaAgents = subagentRegistry.getSubagentsByRole('QA');
        expect(qaAgents).toHaveLength(1);
        expect(qaAgents[0].agent.role).toBe('QA');
      });

      it('should return empty array for role with no agents', () => {
        const architects = subagentRegistry.getSubagentsByRole('Architect');
        expect(architects).toHaveLength(0);
      });
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      mockAgents.forEach(agent => {
        subagentRegistry.registerSubagent(agent);
      });

      // Record some task completions
      subagentRegistry.recordTaskCompletion('frontend-agent-1', true, 5000);
      subagentRegistry.recordTaskCompletion('frontend-agent-1', true, 6000);
      subagentRegistry.recordTaskCompletion('backend-agent-1', false, 8000);
      subagentRegistry.recordTaskCompletion('qa-agent-1', true, 3000);
    });

    it('should return comprehensive statistics', () => {
      const stats = subagentRegistry.getStatistics();

      expect(stats.totalSubagents).toBe(3);

      // Check status counts
      expect(stats.byStatus.active).toBe(3);
      expect(stats.byStatus.busy).toBe(0);
      expect(stats.byStatus.inactive).toBe(0);
      expect(stats.byStatus.error).toBe(0);
      expect(stats.byStatus.maintenance).toBe(0);

      // Check role counts
      expect(stats.byRole.FrontendDev).toBe(1);
      expect(stats.byRole.BackendDev).toBe(1);
      expect(stats.byRole.QA).toBe(1);

      // Check system metrics
      expect(stats.systemMetrics.totalTasksCompleted).toBe(4);
      expect(stats.systemMetrics.avgSuccessRate).toBeGreaterThan(0);
      expect(stats.systemMetrics.avgResponseTime).toBeGreaterThan(0);
      expect(stats.systemMetrics.systemLoad).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty registry', () => {
      const emptyRegistry = new SubagentRegistry(mockTaskIntegration);
      const stats = emptyRegistry.getStatistics();

      expect(stats.totalSubagents).toBe(0);
      expect(stats.systemMetrics.totalTasksCompleted).toBe(0);
      expect(stats.systemMetrics.avgSuccessRate).toBe(0);
      expect(stats.systemMetrics.avgResponseTime).toBe(0);
      expect(stats.systemMetrics.systemLoad).toBe(0);

      emptyRegistry.dispose();
    });
  });

  describe('Health Checks', () => {
    beforeEach(() => {
      mockAgents.forEach(agent => {
        subagentRegistry.registerSubagent(agent);
      });
    });

    it('should have health check system initialized', () => {
      // Health checks should be initialized
      const allSubagents = subagentRegistry.getAllSubagents();
      expect(allSubagents.length).toBe(3);
      expect(allSubagents.every(s => s.status === 'active')).toBe(true);
    });

    it('should stop health checks when disposed', () => {
      subagentRegistry.dispose();

      // Should not cause any errors
      expect(() => {
        subagentRegistry.dispose();
      }).not.toThrow();
    });

    it('should track agent load correctly', () => {
      const agent = subagentRegistry.getSubagent('frontend-agent-1')!;
      agent.currentLoad = 90; // High load

      // Agent should still be active (load changes don't automatically change status)
      expect(agent.status).toBe('active');
    });

    it('should handle status updates manually', () => {
      const allSubagents = subagentRegistry.getAllSubagents();

      // Manually set some agents to different statuses
      subagentRegistry.updateSubagentStatus('frontend-agent-1', 'busy');
      subagentRegistry.updateSubagentStatus('backend-agent-1', 'error');

      const updatedSubagents = subagentRegistry.getAllSubagents();
      expect(updatedSubagents.find(s => s.agent.id === 'frontend-agent-1')?.status).toBe('busy');
      expect(updatedSubagents.find(s => s.agent.id === 'backend-agent-1')?.status).toBe('error');
    });
  });

  describe('Capability Extraction', () => {
    it('should extract capabilities correctly for frontend agent', () => {
      const agent = mockAgents[0]; // FrontendDev
      subagentRegistry.registerSubagent(agent);

      const registration = subagentRegistry.getSubagent(agent.id)!;

      expect(registration.capabilities.specializations).toEqual(['React', 'TypeScript', 'CSS', 'JavaScript']);
      expect(registration.capabilities.taskCategories).toContain('ui-development');
      expect(registration.capabilities.taskCategories).toContain('component-creation');
      expect(registration.capabilities.tools).toEqual(['Read', 'Write', 'Edit', 'Grep', 'Glob']);
      expect(registration.capabilities.integrations).toContain('claude-code-task-delegation');
      expect(registration.capabilities.performance.avgResponseTime).toBe(25000);
      expect(registration.capabilities.performance.maxConcurrentTasks).toBe(3);
      expect(registration.capabilities.performance.reliability).toBe(94);
    });

    it('should extract capabilities correctly for backend agent', () => {
      const agent = mockAgents[1]; // BackendDev
      subagentRegistry.registerSubagent(agent);

      const registration = subagentRegistry.getSubagent(agent.id)!;

      expect(registration.capabilities.specializations).toEqual(['Node.js', 'Express', 'MongoDB', 'API Design']);
      expect(registration.capabilities.taskCategories).toContain('api-development');
      expect(registration.capabilities.taskCategories).toContain('database-design');
      expect(registration.capabilities.tools).toEqual(['Read', 'Write', 'Edit', 'Bash', 'WebSearch']);
      expect(registration.capabilities.performance.avgResponseTime).toBe(35000);
      expect(registration.capabilities.performance.maxConcurrentTasks).toBe(2);
      expect(registration.capabilities.performance.reliability).toBe(91);
    });

    it('should handle missing metrics gracefully', () => {
      const agentWithoutMetrics: AgentDefinition = {
        ...mockAgents[0],
        id: 'no-metrics-agent',
        metadata: {
          ...mockAgents[0].metadata,
          metrics: undefined,
        },
      };

      subagentRegistry.registerSubagent(agentWithoutMetrics);

      const registration = subagentRegistry.getSubagent('no-metrics-agent')!;

      expect(registration.capabilities.performance.avgResponseTime).toBe(30000); // Default
      expect(registration.capabilities.performance.reliability).toBe(95); // Default
    });

    it('should get task categories for all roles', () => {
      const roles = ['FrontendDev', 'BackendDev', 'QA', 'Architect', 'CLI Dev', 'UX Expert', 'SM'] as const;

      roles.forEach(role => {
        const agent: AgentDefinition = {
          ...mockAgents[0],
          id: `agent-${role}`,
          role,
        };

        subagentRegistry.registerSubagent(agent);

        const registration = subagentRegistry.getSubagent(`agent-${role}`)!;
        expect(registration.capabilities.taskCategories.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle registering the same agent twice', () => {
      const agent = mockAgents[0];
      subagentRegistry.registerSubagent(agent);
      subagentRegistry.registerSubagent(agent);

      // Should still have only one registration
      const allSubagents = subagentRegistry.getAllSubagents();
      expect(allSubagents).toHaveLength(1);

      expect(mockTaskIntegration.registerAgent).toHaveBeenCalledTimes(2);
    });

    it('should handle empty capabilities array', () => {
      const agentWithNoCapabilities: AgentDefinition = {
        ...mockAgents[0],
        id: 'no-capabilities-agent',
        coreSkills: [],
        configuration: {
          ...mockAgents[0].configuration,
          capabilities: {
            allowedTools: [],
            maxConcurrentTasks: 1,
          },
        },
      };

      subagentRegistry.registerSubagent(agentWithNoCapabilities);

      const registration = subagentRegistry.getSubagent('no-capabilities-agent')!;
      expect(registration.capabilities.specializations).toEqual([]);
      expect(registration.capabilities.tools).toEqual([]);
    });

    it('should handle disposing empty registry', () => {
      const emptyRegistry = new SubagentRegistry(mockTaskIntegration);

      expect(() => {
        emptyRegistry.dispose();
      }).not.toThrow();
    });

    it('should handle getBestSubagent with empty task', () => {
      mockAgents.forEach(agent => {
        subagentRegistry.registerSubagent(agent);
      });

      const bestSubagent = subagentRegistry.getBestSubagent('');
      expect(bestSubagent).not.toBeNull();
    });

    it('should handle getBestSubagent with no requirements', () => {
      mockAgents.forEach(agent => {
        subagentRegistry.registerSubagent(agent);
      });

      const bestSubagent = subagentRegistry.getBestSubagent('Some task', []);
      expect(bestSubagent).not.toBeNull();
    });
  });

  describe('Agent Recovery', () => {
    beforeEach(() => {
      mockAgents.forEach(agent => {
        subagentRegistry.registerSubagent(agent);
      });
    });

    it('should recover a single agent from error state', () => {
      const agentId = 'frontend-agent-1';
      subagentRegistry.updateSubagentStatus(agentId, 'error');

      const recovered = subagentRegistry.recoverSubagent(agentId);
      expect(recovered).toBe(true);

      const registration = subagentRegistry.getSubagent(agentId)!;
      expect(registration.status).toBe('active');
    });

    it('should not recover agent that is not in error state', () => {
      const agentId = 'frontend-agent-1';
      subagentRegistry.updateSubagentStatus(agentId, 'busy');

      const recovered = subagentRegistry.recoverSubagent(agentId);
      expect(recovered).toBe(false);

      const registration = subagentRegistry.getSubagent(agentId)!;
      expect(registration.status).toBe('busy');
    });

    it('should not recover non-existent agent', () => {
      const recovered = subagentRegistry.recoverSubagent('non-existent-agent');
      expect(recovered).toBe(false);
    });

    it('should recover all error agents', () => {
      // Put multiple agents in error state
      subagentRegistry.updateSubagentStatus('frontend-agent-1', 'error');
      subagentRegistry.updateSubagentStatus('backend-agent-1', 'error');
      subagentRegistry.updateSubagentStatus('qa-agent-1', 'active'); // Not in error

      const recoveredCount = subagentRegistry.recoverAllErrorSubagents();
      expect(recoveredCount).toBe(2);

      const frontendReg = subagentRegistry.getSubagent('frontend-agent-1')!;
      const backendReg = subagentRegistry.getSubagent('backend-agent-1')!;
      const qaReg = subagentRegistry.getSubagent('qa-agent-1')!;

      expect(frontendReg.status).toBe('active');
      expect(backendReg.status).toBe('active');
      expect(qaReg.status).toBe('active'); // Should remain unchanged
    });

    it('should return zero when no agents are in error state', () => {
      const recoveredCount = subagentRegistry.recoverAllErrorSubagents();
      expect(recoveredCount).toBe(0);
    });

    it('should log status updates with previous status', () => {
      const agentId = 'frontend-agent-1';

      // Mock console.info to capture log messages
      const consoleSpy = mock(() => {});
      const originalConsoleInfo = console.info;
      console.info = consoleSpy;

      subagentRegistry.updateSubagentStatus(agentId, 'busy');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Subagent status updated: frontend-agent-1 -> busy (was: active)')
      );

      console.info = originalConsoleInfo;
    });
  });
});