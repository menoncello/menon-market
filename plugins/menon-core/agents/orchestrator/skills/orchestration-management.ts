/**
 * Orchestration Management Skill
 * Advanced skill for managing complex orchestration scenarios
 */

import { OrchestratorAgent } from '../index';

export interface OrchestrationStrategy {
  name: string;
  description: string;
  parallelExecution: boolean;
  resourceAllocation: 'aggressive' | 'conservative' | 'balanced';
  priorityWeighting: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  defaultAgents: string[];
  requiredSkills: string[];
  estimatedDuration: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  agentType: string;
  requiredSkills: string[];
  dependencies: string[];
  parallelGroup?: string;
  timeout?: number;
}

/**
 *
 */
export class OrchestrationManagementSkill {
  private orchestrator: OrchestratorAgent;
  private workflowTemplates: Map<string, WorkflowTemplate> = new Map();
  private strategies: Map<string, OrchestrationStrategy> = new Map();
  private workflowCounter = 1;

  /**
   *
   * @param orchestrator
   */
  constructor(orchestrator: OrchestratorAgent) {
    this.orchestrator = orchestrator;
    this.initializeStrategies();
    this.initializeWorkflowTemplates();
  }

  /**
   * Initialize orchestration strategies
   */
  private initializeStrategies(): void {
    const strategies: OrchestrationStrategy[] = [
      {
        name: 'performance',
        description: 'Optimize for maximum performance and speed',
        parallelExecution: true,
        resourceAllocation: 'aggressive',
        priorityWeighting: 0.8,
      },
      {
        name: 'balanced',
        description: 'Balance between performance and resource usage',
        parallelExecution: true,
        resourceAllocation: 'balanced',
        priorityWeighting: 0.5,
      },
      {
        name: 'conservative',
        description: 'Prioritize stability and resource efficiency',
        parallelExecution: false,
        resourceAllocation: 'conservative',
        priorityWeighting: 0.3,
      },
      {
        name: 'development',
        description: 'Optimized for development workflows',
        parallelExecution: true,
        resourceAllocation: 'balanced',
        priorityWeighting: 0.6,
      },
      {
        name: 'testing',
        description: 'Optimized for testing and validation workflows',
        parallelExecution: true,
        resourceAllocation: 'conservative',
        priorityWeighting: 0.7,
      },
    ];

    for (const strategy of strategies) {
      this.strategies.set(strategy.name, strategy);
    }
  }

  /**
   * Initialize workflow templates
   */
  private initializeWorkflowTemplates(): void {
    const templates: WorkflowTemplate[] = [
      {
        id: 'code-review-workflow',
        name: 'Complete Code Review Workflow',
        description: 'End-to-end code review with multiple analysis stages',
        steps: [
          {
            id: 'static-analysis',
            name: 'Static Code Analysis',
            description: 'Perform static analysis on code changes',
            agentType: 'pr-review-toolkit:code-reviewer',
            requiredSkills: ['code-review', 'static-analysis'],
            dependencies: [],
          },
          {
            id: 'security-analysis',
            name: 'Security Analysis',
            description: 'Analyze security vulnerabilities',
            agentType: 'superpowers:code-reviewer',
            requiredSkills: ['security-analysis', 'vulnerability-assessment'],
            dependencies: [],
            parallelGroup: 'analysis-phase',
          },
          {
            id: 'performance-analysis',
            name: 'Performance Analysis',
            description: 'Analyze performance implications',
            agentType: 'feature-dev:code-reviewer',
            requiredSkills: ['performance-analysis', 'optimization'],
            dependencies: [],
            parallelGroup: 'analysis-phase',
          },
          {
            id: 'documentation-review',
            name: 'Documentation Review',
            description: 'Review documentation completeness',
            agentType: 'pr-review-toolkit:comment-analyzer',
            requiredSkills: ['documentation', 'technical-writing'],
            dependencies: ['static-analysis'],
          },
        ],
        defaultAgents: [
          'pr-review-toolkit:code-reviewer',
          'superpowers:code-reviewer',
          'feature-dev:code-reviewer',
          'pr-review-toolkit:comment-analyzer',
        ],
        requiredSkills: [
          'code-review',
          'security-analysis',
          'performance-analysis',
          'documentation',
        ],
        estimatedDuration: 15000,
      },
      {
        id: 'feature-development-workflow',
        name: 'Feature Development Workflow',
        description: 'Complete feature development from planning to deployment',
        steps: [
          {
            id: 'requirements-analysis',
            name: 'Requirements Analysis',
            description: 'Analyze and clarify requirements',
            agentType: 'feature-dev:code-architect',
            requiredSkills: ['requirements-analysis', 'architecture'],
            dependencies: [],
          },
          {
            id: 'design-planning',
            name: 'Design and Planning',
            description: 'Create detailed design and implementation plan',
            agentType: 'feature-dev:code-architect',
            requiredSkills: ['design-patterns', 'planning'],
            dependencies: ['requirements-analysis'],
          },
          {
            id: 'implementation',
            name: 'Implementation',
            description: 'Implement the feature',
            agentType: 'general-purpose',
            requiredSkills: ['coding', 'implementation'],
            dependencies: ['design-planning'],
          },
          {
            id: 'testing',
            name: 'Testing',
            description: 'Create and run tests',
            agentType: 'general-purpose',
            requiredSkills: ['testing', 'quality-assurance'],
            dependencies: ['implementation'],
          },
          {
            id: 'documentation',
            name: 'Documentation',
            description: 'Create documentation',
            agentType: 'pr-review-toolkit:comment-analyzer',
            requiredSkills: ['documentation', 'technical-writing'],
            dependencies: ['implementation'],
          },
        ],
        defaultAgents: [
          'feature-dev:code-architect',
          'general-purpose',
          'pr-review-toolkit:comment-analyzer',
        ],
        requiredSkills: [
          'requirements-analysis',
          'architecture',
          'design-patterns',
          'coding',
          'testing',
          'documentation',
        ],
        estimatedDuration: 60000,
      },
    ];

    for (const template of templates) {
      this.workflowTemplates.set(template.id, template);
    }
  }

  /**
   * Execute a workflow template
   * @param templateId
   * @param customizations
   * @param customizations.parameters
   * @param customizations.agentOverrides
   * @param customizations.skillOverrides
   */
  async executeWorkflow(
    templateId: string,
    customizations?: {
      parameters?: Record<string, unknown>;
      agentOverrides?: Record<string, string>;
      skillOverrides?: Record<string, string[]>;
    }
  ): Promise<string> {
    const template = this.workflowTemplates.get(templateId);
    if (!template) {
      throw new Error(`Workflow template ${templateId} not found`);
    }

    console.log(`Executing workflow: ${template.name}`);

    // Create main task plan for the workflow
    const workflowTaskId = await this.orchestrator.createTaskPlan(
      `Execute workflow: ${template.name}`,
      {
        priority: 1,
        requiredSkills: template.requiredSkills,
        estimatedDuration: template.estimatedDuration,
      }
    );

    // Create task plans for each step
    const stepTasks: string[] = [];
    const parallelGroups: Map<string, string[]> = new Map();

    for (const step of template.steps) {
      // Apply customizations
      const _agentType =
        customizations?.agentOverrides?.[step.id] || step.agentType;
      const requiredSkills =
        customizations?.skillOverrides?.[step.id] || step.requiredSkills;

      const stepTaskId = await this.orchestrator.createTaskPlan(
        `Workflow step: ${step.name}`,
        {
          priority: 1,
          requiredSkills,
          dependencies: step.dependencies.map((depId) => {
            const depStep = template.steps.find((s) => s.id === depId);
            return depStep ? `${workflowTaskId}_${depId}` : depId;
          }),
        }
      );

      stepTasks.push(stepTaskId);

      // Track parallel groups
      if (step.parallelGroup) {
        if (!parallelGroups.has(step.parallelGroup)) {
          parallelGroups.set(step.parallelGroup, []);
        }
        const groupTasks = parallelGroups.get(step.parallelGroup);
        if (groupTasks) {
          groupTasks.push(stepTaskId);
        }
      }
    }

    // Execute parallel groups
    for (const [, taskIds] of parallelGroups) {
      await this.executeParallelTasks(taskIds);
    }

    // Execute remaining tasks sequentially
    const sequentialTasks = stepTasks.filter(
      (taskId) =>
        !Array.from(parallelGroups.values()).some((group) =>
          group.includes(taskId)
        )
    );

    for (const taskId of sequentialTasks) {
      await this.orchestrator.executeTask(taskId);
    }

    return workflowTaskId;
  }

  /**
   * Execute multiple tasks in parallel
   * @param taskIds
   */
  private async executeParallelTasks(taskIds: string[]): Promise<void> {
    const promises = taskIds.map((taskId) =>
      this.orchestrator.executeTask(taskId)
    );
    await Promise.all(promises);
  }

  /**
   * Apply orchestration strategy to task execution
   * @param strategyName
   * @param taskIds
   */
  async applyStrategy(strategyName: string, taskIds: string[]): Promise<void> {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`Strategy ${strategyName} not found`);
    }

    console.log(`Applying strategy: ${strategy.name}`);

    if (strategy.parallelExecution) {
      await this.executeParallelTasks(taskIds);
    } else {
      for (const taskId of taskIds) {
        await this.orchestrator.executeTask(taskId);
      }
    }
  }

  /**
   * Create custom workflow template
   * @param template
   */
  createWorkflowTemplate(template: Omit<WorkflowTemplate, 'id'>): string {
    const id = `workflow_${Date.now()}_${this.workflowCounter++}`;
    const fullTemplate: WorkflowTemplate = { ...template, id };

    this.workflowTemplates.set(id, fullTemplate);
    return id;
  }

  /**
   * Get available workflow templates
   */
  getWorkflowTemplates(): WorkflowTemplate[] {
    return Array.from(this.workflowTemplates.values());
  }

  /**
   * Get available strategies
   */
  getStrategies(): OrchestrationStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Optimize task allocation based on system performance
   */
  async optimizeTaskAllocation(): Promise<void> {
    const systemStatus = this.orchestrator.getSystemStatus();

    // Analyze agent performance
    const agentPerformance = systemStatus.agents.map((agent) => ({
      name: agent.name,
      efficiency: agent.performance.successRate,
      avgTime: agent.performance.avgExecutionTime,
      utilization: agent.status === 'busy' ? 1 : 0,
    }));

    // Sort by efficiency (success rate / execution time)
    agentPerformance.sort(
      (a, b) => b.efficiency / b.avgTime - a.efficiency / a.avgTime
    );

    // Recommend optimal agents for different task types
    const recommendations = {
      'high-priority': agentPerformance.slice(0, 3).map((a) => a.name),
      'standard-priority': agentPerformance.slice(3, 6).map((a) => a.name),
      'low-priority': agentPerformance.slice(6).map((a) => a.name),
    };

    console.log('Optimization recommendations:', recommendations);
    return recommendations;
  }

  /**
   * Monitor workflow execution and provide insights
   * @param _workflowTaskId
   */
  async monitorWorkflowExecution(_workflowTaskId: string): Promise<{
    progress: number;
    activeSteps: string[];
    completedSteps: string[];
    estimatedCompletion: Date;
    bottlenecks: string[];
  }> {
    const systemStatus = this.orchestrator.getSystemStatus();

    // Find all tasks related to this workflow
    const workflowTasks = systemStatus.activeTasks.filter(
      (task) =>
        task.description.includes('Execute workflow:') ||
        task.description.includes('Workflow step:')
    );

    const completedTasks = systemStatus.queuedTasks.filter(
      (task) =>
        task.status === 'completed' &&
        (task.description.includes('Execute workflow:') ||
          task.description.includes('Workflow step:'))
    );

    const totalSteps = workflowTasks.length + completedTasks.length;
    const completedSteps = completedTasks.length;
    const progress = totalSteps > 0 ? completedSteps / totalSteps : 0;

    // Estimate completion time
    const avgStepTime = 5000; // 5 seconds average
    const remainingSteps = totalSteps - completedSteps;
    const estimatedCompletion = new Date(
      Date.now() + remainingSteps * avgStepTime
    );

    // Identify bottlenecks
    const bottlenecks = workflowTasks
      .filter((task) => Date.now() - (task.startTime?.getTime() || 0) > 30000)
      .map((task) => task.description);

    return {
      progress,
      activeSteps: workflowTasks.map((t) => t.description),
      completedSteps: completedTasks.map((t) => t.description),
      estimatedCompletion,
      bottlenecks,
    };
  }
}

export default OrchestrationManagementSkill;
