import { test, expect } from 'bun:test';
import OrchestrationManagementSkill from './skills/orchestration-management';
import ResourceOptimizerSkill from './skills/resource-optimizer';
import OrchestratorAgent from './index';

test('orchestrator initialization', async () => {
  const orchestrator = new OrchestratorAgent();
  await orchestrator.initialize();

  expect(orchestrator.name).toBe('orchestrator');
  expect(orchestrator.version).toBe('1.0.0');

  const status = orchestrator.getSystemStatus();
  expect(status.agents.length).toBeGreaterThan(0);
});

test('task creation and execution', async () => {
  const orchestrator = new OrchestratorAgent();
  await orchestrator.initialize();

  const taskId = await orchestrator.createTaskPlan('Test task', {
    requiredSkills: ['code-analysis'],
    priority: 1,
  });

  expect(taskId).toBeDefined();
  expect(taskId).toMatch(/^task_\d+_[\da-z]+$/);

  const status = orchestrator.getSystemStatus();
  // Tasks with no dependencies are auto-executed, so check completed tasks
  expect(status.completedTasks.length).toBeGreaterThan(0);
});

test('skill discovery and allocation', async () => {
  const orchestrator = new OrchestratorAgent();
  await orchestrator.initialize();

  const skills = orchestrator.getAvailableSkills();
  expect(skills.length).toBeGreaterThan(0);
  expect(skills).toContain('code-analysis');

  // Create a real task first
  const taskId = await orchestrator.createTaskPlan('Test task for skills', {
    requiredSkills: ['code-analysis'],
    priority: 1,
  });

  const allocatedSkills = orchestrator.allocateSkillsToTask(taskId, [
    'code-analysis',
    'web-search', // Using a skill that exists
  ]);
  expect(allocatedSkills.length).toBeGreaterThan(0);
});

test('commands and MCP discovery', async () => {
  const orchestrator = new OrchestratorAgent();
  await orchestrator.initialize();

  const commands = await orchestrator.getAvailableCommands();
  expect(commands.length).toBeGreaterThan(0);
  expect(commands).toContain('/superpowers:brainstorm');

  const mcpServers = await orchestrator.getAvailableMCPServers();
  expect(mcpServers.length).toBeGreaterThan(0);
});

test('orchestration management skill', async () => {
  const orchestrator = new OrchestratorAgent();
  await orchestrator.initialize();

  const orchestrationSkill = new OrchestrationManagementSkill(orchestrator);

  const templates = orchestrationSkill.getWorkflowTemplates();
  expect(templates.length).toBeGreaterThan(0);
  expect(templates[0].id).toBeDefined();

  const strategies = orchestrationSkill.getStrategies();
  expect(strategies.length).toBeGreaterThan(0);
  expect(strategies[0].name).toBeDefined();
});

test('resource optimizer skill', async () => {
  const orchestrator = new OrchestratorAgent();
  await orchestrator.initialize();

  const optimizerSkill = new ResourceOptimizerSkill(orchestrator);

  const optimization = await optimizerSkill.optimizeResources();
  expect(optimization.optimizations).toBeDefined();
  expect(optimization.rebalancing).toBeDefined();
  expect(optimization.beforeMetrics).toBeDefined();
  expect(optimization.afterMetrics).toBeDefined();

  const utilization = optimizerSkill.getResourceUtilization();
  expect(utilization.pools.length).toBeGreaterThan(0);
  expect(utilization.overallStatus).toBeDefined();
});

test('agent selection and scoring', async () => {
  const orchestrator = new OrchestratorAgent();
  await orchestrator.initialize();

  const taskId = await orchestrator.createTaskPlan(
    'Complex task requiring multiple skills',
    {
      requiredSkills: ['code-analysis', 'security-analysis', 'documentation'],
      requiredTools: ['Read', 'Write', 'Bash'],
      priority: 2,
    }
  );

  expect(taskId).toBeDefined();

  const status = orchestrator.getSystemStatus();
  const agents = status.agents;

  // Check that agents have required capabilities
  expect(agents.every((agent) => agent.skills)).toBe(true);
  expect(agents.every((agent) => agent.tools)).toBe(true);
  expect(agents.every((agent) => agent.performance)).toBe(true);
});

test('workflow template execution', async () => {
  const orchestrator = new OrchestratorAgent();
  await orchestrator.initialize();

  const orchestrationSkill = new OrchestrationManagementSkill(orchestrator);

  // Test creating a custom workflow template
  const customTemplateId = orchestrationSkill.createWorkflowTemplate({
    name: 'Test Workflow',
    description: 'A test workflow for unit testing',
    steps: [
      {
        id: 'step1',
        name: 'Test Step 1',
        description: 'First test step',
        agentType: 'general-purpose',
        requiredSkills: ['testing'],
        dependencies: [],
      },
    ],
    defaultAgents: ['general-purpose'],
    requiredSkills: ['testing'],
    estimatedDuration: 5000,
  });

  expect(customTemplateId).toBeDefined();

  const templates = orchestrationSkill.getWorkflowTemplates();
  const customTemplate = templates.find((t) => t.id === customTemplateId);
  expect(customTemplate).toBeDefined();
  expect(customTemplate?.name).toBe('Test Workflow');
});

test('performance monitoring', async () => {
  const orchestrator = new OrchestratorAgent();
  await orchestrator.initialize();

  const status = orchestrator.getSystemStatus();

  // Check that metrics are being tracked
  expect(status.metrics).toBeDefined();
  expect(typeof status.metrics.cpuUsage).toBe('number');
  expect(typeof status.metrics.memoryUsage).toBe('number');
  expect(typeof status.metrics.activeConnections).toBe('number');
  expect(typeof status.metrics.queueSize).toBe('number');
  expect(typeof status.metrics.throughput).toBe('number');
});

test('task dependency management', async () => {
  const orchestrator = new OrchestratorAgent();
  await orchestrator.initialize();

  // Create tasks with dependencies
  const task1Id = await orchestrator.createTaskPlan('First task', {
    priority: 1,
  });

  const task2Id = await orchestrator.createTaskPlan(
    'Second task dependent on first',
    {
      priority: 1,
      dependencies: [task1Id],
    }
  );

  expect(task1Id).toBeDefined();
  expect(task2Id).toBeDefined();

  const status = orchestrator.getSystemStatus();
  const task2 = status.queuedTasks.find((t) => t.id === task2Id);
  expect(task2?.dependencies).toContain(task1Id);
});
