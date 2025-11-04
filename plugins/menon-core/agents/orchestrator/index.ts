/**
 * Orchestrator Agent
 * Advanced orchestration agent for managing subagents, commands, MCP servers, and skills
 */

import DynamicDiscoverySystem from './dynamic-discovery';

export interface AgentCapability {
  name: string;
  skills: string[];
  tools: string[];
  status: 'active' | 'inactive' | 'busy';
  currentTask?: string;
  performance: {
    successRate: number;
    avgExecutionTime: number;
    lastUsed: Date;
  };
}

export interface TaskPlan {
  id: string;
  description: string;
  priority: number;
  estimatedDuration: number;
  requiredSkills: string[];
  requiredTools: string[];
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAgents: string[];
  startTime?: Date;
  endTime?: Date;
  result?: unknown;
}

export interface OrchestrationConfig {
  maxParallelAgents: number;
  taskTimeout: number;
  retryAttempts: number;
  skillMatchingThreshold: number;
  resourceAllocation: 'static' | 'dynamic';
}

export interface ResourceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  queueSize: number;
  throughput: number;
}

/**
 *
 */
export class OrchestratorAgent {
  public readonly name = 'orchestrator';
  public readonly version = '1.0.0';

  private agents: Map<string, AgentCapability> = new Map();
  private taskQueue: TaskPlan[] = [];
  private activeTasks: Map<string, TaskPlan> = new Map();
  private completedTasks: TaskPlan[] = [];
  private config: OrchestrationConfig;
  private metrics: ResourceMetrics;
  private discoverySystem: DynamicDiscoverySystem;
  private taskCounter = 1;

  /**
   *
   * @param config
   */
  constructor(config?: Partial<OrchestrationConfig>) {
    this.config = {
      maxParallelAgents: 10,
      taskTimeout: 300000,
      retryAttempts: 3,
      skillMatchingThreshold: 0.7,
      resourceAllocation: 'dynamic',
      ...config,
    };

    this.metrics = {
      cpuUsage: 0,
      memoryUsage: 0,
      activeConnections: 0,
      queueSize: 0,
      throughput: 0,
    };

    this.discoverySystem = new DynamicDiscoverySystem();
  }

  /**
   * Initialize the orchestrator and discover available agents
   */
  async initialize(): Promise<void> {
    console.log(`Initializing ${this.name} v${this.version}`);
    await this.discoverAgents();
    await this.discoverSkills();
    await this.discoverCommands();
    await this.discoverMCPServers();
    console.log(`Discovered ${this.agents.size} agents`);
  }

  /**
   * Discover all available agents in the system (now dynamic!)
   */
  private async discoverAgents(): Promise<void> {
    try {
      console.log('🔍 Discovering agents dynamically...');

      // Use dynamic discovery system
      const discoveredAgents =
        await this.discoverySystem.getDiscoveryData('agents');

      if (discoveredAgents.length > 0) {
        console.log(
          `✅ Discovered ${discoveredAgents.length} agents dynamically`
        );

        for (const agent of discoveredAgents) {
          this.agents.set(agent.name, agent);
        }
      } else {
        console.log('⚠️ No dynamic agents found, using fallback static list');
        await this.discoverAgentsStatic();
      }
    } catch (error) {
      console.error(
        '❌ Error in dynamic agent discovery, using static fallback:',
        error
      );
      await this.discoverAgentsStatic();
    }
  }

  /**
   * Fallback static agent discovery
   */
  private async discoverAgentsStatic(): Promise<void> {
    const agentTypes = [
      'general-purpose',
      'statusline-setup',
      'Explore',
      'Plan',
      'superpowers:code-reviewer',
      'episodic-memory:search-conversations',
      'agent-sdk-dev:agent-sdk-verifier-py',
      'agent-sdk-dev:agent-sdk-verifier-ts',
      'pr-review-toolkit:code-reviewer',
      'pr-review-toolkit:code-simplifier',
      'pr-review-toolkit:comment-analyzer',
      'pr-review-toolkit:pr-test-analyzer',
      'pr-review-toolkit:silent-failure-hunter',
      'pr-review-toolkit:type-design-analyzer',
      'feature-dev:code-architect',
      'feature-dev:code-explorer',
      'feature-dev:code-reviewer',
      'studio-cc:cc-expert-examples',
      'studio-cc:cc-expert',
      'astrojs-specialist',
      'agent-creator',
      'lint-typescript-fixer',
    ];

    for (const agentType of agentTypes) {
      this.agents.set(agentType, {
        name: agentType,
        skills: await this.getAgentSkills(agentType),
        tools: await this.getAgentTools(agentType),
        status: 'inactive',
        performance: {
          successRate: 1.0,
          avgExecutionTime: 0,
          lastUsed: new Date(),
        },
      });
    }
  }

  /**
   * Discover available skills in the system (now dynamic!)
   */
  private async discoverSkills(): Promise<string[]> {
    try {
      console.log('🔍 Discovering skills dynamically...');

      // Use dynamic discovery system
      const discoveredSkills =
        await this.discoverySystem.getDiscoveryData('skills');

      if (discoveredSkills.length > 0) {
        console.log(
          `✅ Discovered ${discoveredSkills.length} skills dynamically`
        );
        return discoveredSkills;
      } 
        console.log('⚠️ No dynamic skills found, using fallback static list');
        return await this.discoverSkillsStatic();
      
    } catch (error) {
      console.error(
        '❌ Error in dynamic skill discovery, using static fallback:',
        error
      );
      return await this.discoverSkillsStatic();
    }
  }

  /**
   * Fallback static skill discovery
   */
  private async discoverSkillsStatic(): Promise<string[]> {
    return [
      'n8n-code-javascript',
      'n8n-code-python',
      'n8n-expression-syntax',
      'n8n-mcp-tools-expert',
      'n8n-node-configuration',
      'n8n-validation-expert',
      'n8n-workflow-patterns',
      'superpowers:brainstorming',
      'superpowers:condition-based-waiting',
      'superpowers:defense-in-depth',
      'superpowers:dispatching-parallel-agents',
      'superpowers:executing-plans',
      'superpowers:finishing-a-development-branch',
      'superpowers:receiving-code-review',
      'superpowers:requesting-code-review',
      'superpowers:root-cause-tracing',
      'superpowers:sharing-skills',
      'superpowers:subagent-driven-development',
      'superpowers:systematic-debugging',
      'superpowers:test-driven-development',
      'superpowers:testing-anti-patterns',
    ];
  }

  /**
   * Discover available commands in the system (now dynamic!)
   */
  private async discoverCommands(): Promise<string[]> {
    try {
      console.log('🔍 Discovering commands dynamically...');

      // Use dynamic discovery system
      const discoveredCommands =
        await this.discoverySystem.getDiscoveryData('commands');

      if (discoveredCommands.length > 0) {
        console.log(
          `✅ Discovered ${discoveredCommands.length} commands dynamically`
        );
        return discoveredCommands;
      } 
        console.log('⚠️ No dynamic commands found, using fallback static list');
        return await this.discoverCommandsStatic();
      
    } catch (error) {
      console.error(
        '❌ Error in dynamic command discovery, using static fallback:',
        error
      );
      return await this.discoverCommandsStatic();
    }
  }

  /**
   * Fallback static command discovery
   */
  private async discoverCommandsStatic(): Promise<string[]> {
    return [
      '/superpowers:brainstorm',
      '/superpowers:execute-plan',
      '/superpowers:write-plan',
      '/episodic-memory:search-conversations',
      '/agent-sdk-dev:new-sdk-app',
      '/pr-review-toolkit:review-pr',
      '/commit-commands:clean_gone',
      '/commit-commands:commit-push-pr',
      '/commit-commands:commit',
      '/feature-dev:feature-dev',
      '/code-review:code-review',
      '/studio-cc:cc-plugin',
    ];
  }

  /**
   * Discover available MCP servers (now dynamic!)
   */
  private async discoverMCPServers(): Promise<string[]> {
    try {
      console.log('🔍 Discovering MCP servers dynamically...');

      // Use dynamic discovery system
      const discoveredMCPServers =
        await this.discoverySystem.getDiscoveryData('mcp');

      if (discoveredMCPServers.length > 0) {
        console.log(
          `✅ Discovered ${discoveredMCPServers.length} MCP servers dynamically`
        );
        return discoveredMCPServers;
      } 
        console.log(
          '⚠️ No dynamic MCP servers found, using fallback static list'
        );
        return await this.discoverMCPServersStatic();
      
    } catch (error) {
      console.error(
        '❌ Error in dynamic MCP server discovery, using static fallback:',
        error
      );
      return await this.discoverMCPServersStatic();
    }
  }

  /**
   * Fallback static MCP server discovery
   */
  private async discoverMCPServersStatic(): Promise<string[]> {
    return ['superpowers-chrome', 'web-search-prime', 'zai-mcp-server'];
  }

  /**
   * Force refresh all discovery data
   */
  async refreshDiscoveryData(): Promise<void> {
    console.log('🔄 Force refreshing all discovery data...');
    await this.discoverySystem.refreshAll();
    console.log('✅ Discovery data refreshed');
  }

  /**
   * Get discovery system status
   */
  getDiscoveryStatus(): {
    sources: Array<{
      name: string;
      type: string;
      lastUpdate: Date;
      status: 'updated' | 'stale' | 'error';
    }>;
    cacheSize: number;
  } {
    return this.discoverySystem.getDiscoveryStatus();
  }

  /**
   * Get skills for a specific agent
   * @param agentType
   */
  private async getAgentSkills(agentType: string): Promise<string[]> {
    const skillMap: Record<string, string[]> = {
      'general-purpose': ['web-search', 'code-analysis'],
      'feature-dev:code-architect': ['architecture', 'design-patterns'],
      'pr-review-toolkit:code-reviewer': ['code-review', 'quality-analysis'],
      'superpowers:code-reviewer': ['security-analysis', 'performance-review'],
      'agent-creator': ['template-generation', 'skill-development'],
    };
    return skillMap[agentType] || [];
  }

  /**
   * Get tools for a specific agent
   * @param agentType
   */
  private async getAgentTools(agentType: string): Promise<string[]> {
    const toolMap: Record<string, string[]> = {
      'general-purpose': ['Read', 'Write', 'Edit', 'Bash', 'WebFetch'],
      'feature-dev:code-architect': ['Glob', 'Grep', 'TodoWrite'],
      'pr-review-toolkit:code-reviewer': ['Read', 'Grep', 'Bash'],
      'superpowers:code-reviewer': ['Task', 'Read', 'Grep'],
      'agent-creator': ['Write', 'WebFetch', 'MultiEdit'],
    };
    return toolMap[agentType] || ['Read', 'Write'];
  }

  /**
   * Create a task plan and orchestrate execution
   * @param description
   * @param requirements
   * @param requirements.priority
   * @param requirements.requiredSkills
   * @param requirements.requiredTools
   * @param requirements.dependencies
   */
  async createTaskPlan(
    description: string,
    requirements?: {
      priority?: number;
      requiredSkills?: string[];
      requiredTools?: string[];
      dependencies?: string[];
    }
  ): Promise<string> {
    const taskPlan: TaskPlan = {
      id: `task_${Date.now()}_${this.taskCounter++}`,
      description,
      priority: requirements?.priority || 1,
      estimatedDuration: this.estimateTaskDuration(description, requirements),
      requiredSkills: requirements?.requiredSkills || [],
      requiredTools: requirements?.requiredTools || [],
      dependencies: requirements?.dependencies || [],
      status: 'pending',
      assignedAgents: [],
    };

    this.taskQueue.push(taskPlan);
    this.metrics.queueSize = this.taskQueue.length;

    // Auto-execute if no dependencies
    if (taskPlan.dependencies.length === 0) {
      await this.executeTask(taskPlan.id);
    }

    return taskPlan.id;
  }

  /**
   * Execute a task plan with optimal agent allocation
   * @param taskId
   */
  async executeTask(taskId: string): Promise<void> {
    const task =
      this.taskQueue.find((t) => t.id === taskId) ||
      this.activeTasks.get(taskId);

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.status = 'in_progress';
    task.startTime = new Date();
    this.activeTasks.set(taskId, task);

    // Remove from queue if it was there
    const queueIndex = this.taskQueue.findIndex((t) => t.id === taskId);
    if (queueIndex >= 0) {
      this.taskQueue.splice(queueIndex, 1);
    }

    try {
      // Find best agents for the task
      const selectedAgents = await this.selectOptimalAgents(task);
      task.assignedAgents = selectedAgents;

      // Execute agents in parallel where possible
      const results = await this.executeAgentsInParallel(selectedAgents, task);

      // Process results and complete task
      task.result = results;
      task.status = 'completed';
      task.endTime = new Date();

      // Move to completed tasks
      this.completedTasks.push(task);
      this.activeTasks.delete(taskId);

      // Check for dependent tasks
      await this.checkDependentTasks(taskId);

      console.log(`Task ${taskId} completed successfully`);
    } catch (error) {
      task.status = 'failed';
      task.endTime = new Date();
      task.result = { error: error.message };

      console.error(`Task ${taskId} failed:`, error);

      // Retry logic
      if (this.shouldRetry(task)) {
        await this.retryTask(taskId);
      }
    }
  }

  /**
   * Select optimal agents for a given task
   * @param _task
   */
  private async selectOptimalAgents(_task: TaskPlan): Promise<string[]> {
    const availableAgents = Array.from(this.agents.entries())
      .filter(([, agent]) => agent.status === 'inactive')
      .map(([name, agent]) => ({ name, agent }));

    // Score agents based on skill and tool matching
    const scoredAgents = availableAgents.map(({ name, agent }) => {
      const skillScore = this.calculateSkillMatch(
        agent.skills,
        _task.requiredSkills
      );
      const toolScore = this.calculateToolMatch(
        agent.tools,
        _task.requiredTools
      );
      const performanceScore = agent.performance.successRate;

      const totalScore =
        skillScore * 0.4 + toolScore * 0.3 + performanceScore * 0.3;

      return { name, score: totalScore };
    });

    // Sort by score and select top agents
    scoredAgents.sort((a, b) => b.score - a.score);

    // Select agents that meet the threshold
    const selectedAgents = scoredAgents
      .filter((agent) => agent.score >= this.config.skillMatchingThreshold)
      .slice(0, this.config.maxParallelAgents)
      .map((agent) => agent.name);

    // Mark selected agents as busy
    for (const agentName of selectedAgents) {
      const agent = this.agents.get(agentName);
      if (agent) {
        agent.status = 'busy';
        agent.currentTask = _task.id;
      }
    }

    return selectedAgents;
  }

  /**
   * Calculate skill match score
   * @param agentSkills
   * @param requiredSkills
   */
  private calculateSkillMatch(
    agentSkills: string[],
    requiredSkills: string[]
  ): number {
    if (requiredSkills.length === 0) return 1.0;

    const matchingSkills = agentSkills.filter((skill) =>
      requiredSkills.some(
        (required) =>
          skill.toLowerCase().includes(required.toLowerCase()) ||
          required.toLowerCase().includes(skill.toLowerCase())
      )
    );

    return matchingSkills.length / requiredSkills.length;
  }

  /**
   * Calculate tool match score
   * @param agentTools
   * @param requiredTools
   */
  private calculateToolMatch(
    agentTools: string[],
    requiredTools: string[]
  ): number {
    if (requiredTools.length === 0) return 1.0;

    const matchingTools = agentTools.filter((tool) =>
      requiredTools.includes(tool)
    );
    return matchingTools.length / requiredTools.length;
  }

  /**
   * Execute multiple agents in parallel
   * @param agentNames
   * @param task
   */
  private async executeAgentsInParallel(
    agentNames: string[],
    task: TaskPlan
  ): Promise<any[]> {
    // Create parallel execution tasks
    const agentTasks = agentNames.map(async (agentName) => {
      const agent = this.agents.get(agentName);
      if (!agent) throw new Error(`Agent ${agentName} not found`);

      const startTime = Date.now();

      try {
        // Execute the agent task
        const result = await this.executeAgentTask(agentName, task);

        // Update agent performance
        const executionTime = Date.now() - startTime;
        this.updateAgentPerformance(agentName, true, executionTime);

        return { agent: agentName, result, success: true };
      } catch (error) {
        // Update agent performance
        const executionTime = Date.now() - startTime;
        this.updateAgentPerformance(agentName, false, executionTime);

        return { agent: agentName, error: error.message, success: false };
      }
    });

    // Wait for all agents to complete
    const results = await Promise.all(agentTasks);

    // Release agents
    for (const agentName of agentNames) {
      const agent = this.agents.get(agentName);
      if (agent) {
        agent.status = 'inactive';
        agent.currentTask = undefined;
      }
    }

    return results;
  }

  /**
   * Execute a specific agent task
   * @param agentName
   * @param task
   */
  private async executeAgentTask(
    agentName: string,
    task: TaskPlan
  ): Promise<any> {
    // This would integrate with the actual agent execution system
    console.log(`Executing agent ${agentName} for task ${task.id}`);

    // Simulate agent execution
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      agent: agentName,
      taskId: task.id,
      output: `Task processed by ${agentName}`,
      timestamp: new Date(),
    };
  }

  /**
   * Update agent performance metrics
   * @param agentName
   * @param success
   * @param executionTime
   */
  private updateAgentPerformance(
    agentName: string,
    success: boolean,
    executionTime: number
  ): void {
    const agent = this.agents.get(agentName);
    if (!agent) return;

    // Update success rate (exponential moving average)
    const alpha = 0.1;
    agent.performance.successRate =
      alpha * (success ? 1 : 0) + (1 - alpha) * agent.performance.successRate;

    // Update average execution time
    agent.performance.avgExecutionTime =
      alpha * executionTime + (1 - alpha) * agent.performance.avgExecutionTime;

    agent.performance.lastUsed = new Date();
  }

  /**
   * Estimate task duration based on complexity
   * @param description
   * @param requirements
   */
  private estimateTaskDuration(
    description: string,
    requirements?: Record<string, unknown>
  ): number {
    // Simple heuristic based on description length and complexity
    const baseTime = 5000; // 5 seconds base
    const complexityMultiplier = Math.max(1, description.length / 100);
    const skillMultiplier = Math.max(
      1,
      (requirements?.requiredSkills?.length || 0) / 2
    );

    return Math.floor(baseTime * complexityMultiplier * skillMultiplier);
  }

  /**
   * Check if task should be retried
   * @param _task
   */
  private shouldRetry(_task: TaskPlan): boolean {
    // This would track retry attempts
    return true; // Simplified for now
  }

  /**
   * Retry a failed task
   * @param taskId
   */
  private async retryTask(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) return;

    task.status = 'pending';
    this.activeTasks.delete(taskId);
    this.taskQueue.push(task);

    await this.executeTask(taskId);
  }

  /**
   * Check for tasks that depend on completed task
   * @param completedTaskId
   */
  private async checkDependentTasks(completedTaskId: string): Promise<void> {
    const dependentTasks = this.taskQueue.filter((task) =>
      task.dependencies.includes(completedTaskId)
    );

    for (const task of dependentTasks) {
      // Check if all dependencies are completed
      const allDependenciesMet = task.dependencies.every((depId) =>
        this.completedTasks.some((completed) => completed.id === depId)
      );

      if (allDependenciesMet) {
        await this.executeTask(task.id);
      }
    }
  }

  /**
   * Get system status and metrics
   */
  getSystemStatus(): {
    agents: AgentCapability[];
    activeTasks: TaskPlan[];
    queuedTasks: TaskPlan[];
    completedTasks: TaskPlan[];
    metrics: ResourceMetrics;
  } {
    return {
      agents: Array.from(this.agents.values()),
      activeTasks: Array.from(this.activeTasks.values()),
      queuedTasks: this.taskQueue,
      completedTasks: this.completedTasks,
      metrics: this.metrics,
    };
  }

  /**
   * Get available skills across all agents
   */
  getAvailableSkills(): string[] {
    const allSkills = new Set<string>();
    for (const [, agent] of this.agents) {
      for (const skill of agent.skills) allSkills.add(skill);
    }
    return Array.from(allSkills);
  }

  /**
   * Get available commands
   */
  async getAvailableCommands(): Promise<string[]> {
    return await this.discoverCommands();
  }

  /**
   * Get available MCP servers
   */
  async getAvailableMCPServers(): Promise<string[]> {
    return await this.discoverMCPServers();
  }

  /**
   * Allocate skills to tasks based on requirements
   * @param taskId
   * @param requiredSkills
   */
  allocateSkillsToTask(taskId: string, requiredSkills: string[]): string[] {
    const task =
      this.activeTasks.get(taskId) ||
      this.taskQueue.find((t) => t.id === taskId) ||
      this.completedTasks.find((t) => t.id === taskId);

    if (!task) return [];

    const availableSkills = this.getAvailableSkills();
    const allocatedSkills = requiredSkills.filter((skill) =>
      availableSkills.includes(skill)
    );

    task.requiredSkills = allocatedSkills;
    return allocatedSkills;
  }

  /**
   * Shutdown the orchestrator
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down orchestrator...');

    // Wait for active tasks to complete or timeout
    const maxWaitTime = 30000; // 30 seconds
    const startTime = Date.now();

    while (this.activeTasks.size > 0 && Date.now() - startTime < maxWaitTime) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Cleanup discovery system
    if (this.discoverySystem) {
      this.discoverySystem.destroy();
    }

    console.log('Orchestrator shutdown complete');
  }
}

export default OrchestratorAgent;
