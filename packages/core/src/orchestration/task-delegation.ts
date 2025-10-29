/**
 * Task Tool Delegation Interface for Claude Code Integration
 * Enables agents to be used as subagents with the Claude Code Task tool
 */

import { randomBytes } from 'crypto';
import { TASK_DELEGATION_CONSTANTS } from '../agents/constants';
import { AgentDefinition } from '../agents/types';
import { AgentService } from './agent-service';
import { MetadataService } from './metadata-service';
import { TaskExecutionHandler } from './task-execution-handler';
import { TaskExecutionService } from './task-execution-service';
import { TaskResponseHandler } from './task-response-handler';
import { TaskValidator } from './task-validation';
import {
  TaskDelegationRequest,
  TaskDelegationResponse,
  TaskExecutionMetadata,
  AgentCapability,
  TaskDelegationInterface,
  MetadataParams,
  SystemStatusInfo,
} from './types';

/**
 * Claude Code Task Tool Integration
 * Implements the interface for delegating tasks to agents
 */
export class ClaudeCodeTaskIntegration implements TaskDelegationInterface {
  private registeredAgents: Map<string, AgentDefinition> = new Map();
  private runningTasks: Map<string, TaskExecutionMetadata> = new Map();
  private taskQueue: TaskDelegationRequest[] = [];
  private taskExecutionService: TaskExecutionService;
  private agentService: AgentService;
  private metadataService: MetadataService;
  private taskValidator: TaskValidator;
  private taskExecutionHandler: TaskExecutionHandler;
  private responseHandler: TaskResponseHandler;

  /** Number of bytes to generate for random task ID component */
  private static readonly RANDOM_BYTES_COUNT = TASK_DELEGATION_CONSTANTS.RANDOM_BYTES_COUNT;

  /**
   * Create a new ClaudeCodeTaskIntegration instance
   */
  constructor() {
    this.taskExecutionService = new TaskExecutionService();
    this.agentService = new AgentService(this.registeredAgents);
    this.metadataService = new MetadataService(this.registeredAgents);
    this.taskValidator = new TaskValidator(this.registeredAgents, this.agentService);
    this.taskExecutionHandler = new TaskExecutionHandler(
      this.taskExecutionService,
      this.metadataService
    );
    this.responseHandler = new TaskResponseHandler();
  }

  /**
   * Register an agent for task delegation
   * @param {AgentDefinition} agent - The agent definition to register
   */
  registerAgent(agent: AgentDefinition): void {
    this.registeredAgents.set(agent.id, agent);
  }

  /**
   * Unregister an agent
   * @param {string} agentId - The unique identifier of the agent to unregister
   */
  unregisterAgent(agentId: string): void {
    this.registeredAgents.delete(agentId);
  }

  /**
   * Get all registered agents
   * @returns {AgentDefinition[]} Array of all registered agent definitions
   */
  getRegisteredAgents(): AgentDefinition[] {
    return Array.from(this.registeredAgents.values());
  }

  /**
   * Get agent by ID
   * @param {string} agentId - The unique identifier of the agent
   * @returns {AgentDefinition | undefined} The agent definition or undefined if not found
   */
  getAgent(agentId: string): AgentDefinition | undefined {
    return this.registeredAgents.get(agentId);
  }

  /**
   * Delegate a task to a specific agent
   * @param {TaskDelegationRequest} request - The task delegation request
   * @returns {Promise<TaskDelegationResponse>} The delegation response
   */
  async delegateTask(request: TaskDelegationRequest): Promise<TaskDelegationResponse> {
    const startTime = new Date();
    const taskId = this.generateTaskId();

    try {
      // Validate task request
      const validationResult = await this.taskValidator.validateTaskRequest(
        request,
        taskId,
        startTime,
        this.createErrorResponse.bind(this)
      );
      if (validationResult) {
        return validationResult;
      }

      // Execute task
      return await this.taskExecutionHandler.executeTaskWithAgent(
        {
          request,
          taskId,
          startTime,
          registeredAgents: this.registeredAgents,
          runningTasks: this.runningTasks,
        },
        this.createErrorResponse.bind(this)
      );
    } catch (error) {
      return this.handleTaskExecutionError(error, request, taskId, startTime);
    }
  }

  /**
   * Handle task execution errors
   * @param {unknown} error - The error that occurred during task execution
   * @param {TaskDelegationRequest} request - The original task delegation request
   * @param {string} taskId - The generated task ID
   * @param {Date} startTime - The task start time
   * @returns {TaskDelegationResponse} Error response with metadata
   */
  private handleTaskExecutionError(
    error: unknown,
    request: TaskDelegationRequest,
    taskId: string,
    startTime: Date
  ): TaskDelegationResponse {
    return this.responseHandler.handleTaskExecutionError({
      error,
      request,
      taskId,
      startTime,
      agentId: request.agentId,
      errors: [],
      createTaskMetadata: this.createTaskMetadata.bind(this),
      removeRunningTask: () => this.runningTasks.delete(taskId),
    });
  }

  /**
   * Create error response
   * @param {string[]} errors - Array of error messages
   * @param {string} taskId - The generated task ID
   * @param {string} agentId - The agent ID
   * @param {Date} startTime - The task start time
   * @returns {TaskDelegationResponse} Error response with metadata
   */
  private createErrorResponse(
    errors: string[],
    taskId: string,
    agentId: string,
    startTime: Date
  ): TaskDelegationResponse {
    return this.responseHandler.createErrorResponse({
      errors,
      taskId,
      agentId,
      startTime,
      createTaskMetadata: this.createTaskMetadata.bind(this),
    });
  }

  /**
   * Create task metadata
   * @param {string} _taskId - The generated task ID (unused in current implementation)
   * @param {MetadataParams} params - Metadata parameters
   * @returns {TaskExecutionMetadata} The created task execution metadata
   */
  private createTaskMetadata(_taskId: string, params: MetadataParams): TaskExecutionMetadata {
    return this.metadataService.createMetadata(params);
  }

  /**
   * Get capabilities of an agent
   * @param {string} agentId - The unique identifier of the agent
   * @returns {Promise<AgentCapability | null>} Agent capabilities or null if agent not found
   */
  async getAgentCapabilities(agentId: string): Promise<AgentCapability | null> {
    return this.agentService.getAgentCapabilities(agentId);
  }

  /**
   * Find best agent for a given task
   * @param {string} task - The task description
   * @param {string[]} [requiredTools] - Optional array of required tool names
   * @returns {Promise<string | null>} The best agent ID or null if no suitable agent found
   */
  async findBestAgent(task: string, requiredTools?: string[]): Promise<string | null> {
    return this.agentService.findBestAgent(task, requiredTools);
  }

  /**
   * Check if an agent is available for task delegation
   * @param {string} agentId - The unique identifier of the agent
   * @returns {Promise<boolean>} True if agent is available, false otherwise
   */
  async isAgentAvailable(agentId: string): Promise<boolean> {
    return this.agentService.isAgentAvailable(agentId, this.runningTasks);
  }

  /**
   * Get status of running tasks
   * @param {string} taskId - The unique identifier of the task
   * @returns {Promise<TaskExecutionMetadata | null>} Task execution metadata or null if task not found
   */
  async getTaskStatus(taskId: string): Promise<TaskExecutionMetadata | null> {
    return this.runningTasks.get(taskId) || null;
  }

  /**
   * Cancel a running task
   * @param {string} taskId - The unique identifier of the task to cancel
   * @returns {Promise<boolean>} True if task was cancelled, false if task not found
   */
  async cancelTask(taskId: string): Promise<boolean> {
    const task = this.runningTasks.get(taskId);
    if (!task) return false;

    // In a real implementation, this would cancel the actual task execution
    this.runningTasks.delete(taskId);
    return true;
  }

  /**
   * Delegate task - alias for delegateTask method
   * @param {TaskDelegationRequest} request - Task delegation request
   * @returns {Promise<TaskDelegationResponse>} Task delegation response
   */
  async delegate(request: TaskDelegationRequest): Promise<TaskDelegationResponse> {
    return this.delegateTask(request);
  }

  /**
   * Get status - alias for getSystemStatus method
   * @returns {SystemStatusInfo} System status information
   */
  getStatus(): SystemStatusInfo {
    return this.getSystemStatus();
  }

  /**
   * Generate unique task ID
   * @returns {string} Unique task identifier
   */
  private generateTaskId(): string {
    const randomBytesBuffer = randomBytes(ClaudeCodeTaskIntegration.RANDOM_BYTES_COUNT);
    const randomString = randomBytesBuffer.toString('hex');
    return `task_${Date.now()}_${randomString}`;
  }

  /**
   * Get system status
   * @returns {SystemStatusInfo} System status information
   */
  getSystemStatus(): SystemStatusInfo {
    return this.responseHandler.createSystemStatus(
      this.registeredAgents,
      this.runningTasks,
      this.taskQueue
    );
  }
}
