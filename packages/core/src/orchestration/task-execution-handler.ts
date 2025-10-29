/**
 * Task Execution Handler for Claude Code Integration
 * Handles task execution workflow and metadata management
 */

import { AgentDefinition } from '../agents/types';
import { MetadataService } from './metadata-service';
import { TaskExecutionService } from './task-execution-service';
import {
  TaskDelegationResponse,
  TaskExecutionMetadata,
  TaskExecutionResult,
  MetadataParams,
  TaskExecutionParams,
  TaskCompletionParams,
} from './types';

/**
 * Task Execution Handler class for managing task execution workflow
 */
export class TaskExecutionHandler {
  /**
   * Create a new TaskExecutionHandler instance
   *
   * @param {TaskExecutionService} taskExecutionService - Service for executing tasks
   * @param {MetadataService} metadataService - Service for managing task metadata
   */
  constructor(
    private taskExecutionService: TaskExecutionService,
    private metadataService: MetadataService
  ) {}

  /**
   * Execute task with agent
   * @param {TaskExecutionParams} params - The task execution parameters
   * @param {(errors: string[], taskId: string, agentId: string, startTime: Date) => TaskDelegationResponse} createErrorResponse - Error response creator function
   * @returns {Promise<TaskDelegationResponse>} The task delegation response
   */
  async executeTaskWithAgent(
    params: TaskExecutionParams,
    createErrorResponse: (
      errors: string[],
      taskId: string,
      agentId: string,
      startTime: Date
    ) => TaskDelegationResponse
  ): Promise<TaskDelegationResponse> {
    const agent = this.validateAndGetAgent(params);
    if (!agent) {
      return this.createAgentNotFoundError(params, createErrorResponse);
    }

    const executionParams = this.prepareExecutionParams(params);
    const result = await this.executeTask(agent, executionParams);

    return this.completeTaskExecution({
      taskId: params.taskId,
      agentId: params.request.agentId,
      startTime: params.startTime,
      result,
      runningTasks: params.runningTasks,
    });
  }

  /**
   * Prepare execution parameters for task execution
   * @param {TaskExecutionParams} params - The task execution parameters
   * @returns {{initialMetadata: TaskExecutionMetadata; request: TaskExecutionParams['request']}} Prepared execution parameters
   */
  private prepareExecutionParams(params: TaskExecutionParams): {
    initialMetadata: TaskExecutionMetadata;
    request: TaskExecutionParams['request'];
  } {
    const initialMetadata = this.setupTaskExecution(
      params.taskId,
      params.request.agentId,
      params.startTime,
      params.runningTasks
    );

    return {
      initialMetadata,
      request: params.request,
    };
  }

  /**
   * Execute task with prepared parameters
   * @param {AgentDefinition} agent - The agent to execute the task
   * @param {{initialMetadata: TaskExecutionMetadata; request: TaskExecutionParams['request']}} executionParams - Prepared execution parameters
   * @param {TaskExecutionMetadata} executionParams.initialMetadata - Initial task execution metadata
   * @param {TaskExecutionParams['request']} executionParams.request - Task execution request
   * @returns {Promise<TaskExecutionResult>} The task execution result
   */
  private executeTask(
    agent: AgentDefinition,
    executionParams: {
      initialMetadata: TaskExecutionMetadata;
      request: TaskExecutionParams['request'];
    }
  ): Promise<TaskExecutionResult> {
    return this.taskExecutionService.executeTask(
      agent,
      executionParams.request,
      executionParams.initialMetadata
    );
  }

  /**
   * Create agent not found error response
   * @param {TaskExecutionParams} params - The task execution parameters
   * @param {Function} createErrorResponse - Error response creator function
   * @returns {TaskDelegationResponse} The error response
   */
  private createAgentNotFoundError(
    params: TaskExecutionParams,
    createErrorResponse: (
      errors: string[],
      taskId: string,
      agentId: string,
      startTime: Date
    ) => TaskDelegationResponse
  ): TaskDelegationResponse {
    return createErrorResponse(
      [`Agent not found: ${params.request.agentId}`],
      params.taskId,
      params.request.agentId,
      params.startTime
    );
  }

  /**
   * Validate and get agent from registered agents
   * @param {TaskExecutionParams} params - The task execution parameters
   * @returns {AgentDefinition | null} The agent definition or null if not found
   */
  private validateAndGetAgent(params: TaskExecutionParams): AgentDefinition | null {
    return params.registeredAgents.get(params.request.agentId) || null;
  }

  /**
   * Setup task execution with initial metadata
   * @param {string} taskId - The generated task ID
   * @param {string} agentId - The agent ID
   * @param {Date} startTime - The task start time
   * @param {Map<string, TaskExecutionMetadata>} runningTasks - Running tasks map
   * @returns {TaskExecutionMetadata} The initial task execution metadata
   */
  setupTaskExecution(
    taskId: string,
    agentId: string,
    startTime: Date,
    runningTasks: Map<string, TaskExecutionMetadata>
  ): TaskExecutionMetadata {
    const initialMetadata = this.createTaskMetadata(taskId, {
      agentId,
      startTime,
      endTime: new Date(),
      completedOnTime: true,
      toolsUsed: [],
      toolInvocations: 0,
      collaborationUsed: false,
      confidence: 100,
    });
    runningTasks.set(taskId, initialMetadata);
    return initialMetadata;
  }

  /**
   * Complete task execution with final metadata
   * @param {TaskCompletionParams} params - The task completion parameters
   * @returns {TaskDelegationResponse} The final task delegation response
   */
  completeTaskExecution(params: TaskCompletionParams): TaskDelegationResponse {
    const endTime = new Date();
    const finalMetadata = this.createTaskMetadata(params.taskId, {
      agentId: params.agentId,
      startTime: params.startTime,
      endTime,
      completedOnTime: true,
      toolsUsed: params.result.toolsUsed,
      toolInvocations: params.result.toolInvocations,
      collaborationUsed: params.result.collaborationUsed,
      confidence: params.result.confidence,
    });

    params.runningTasks.delete(params.taskId);

    return {
      success: params.result.success,
      result: params.result.output,
      data: params.result.data,
      metadata: finalMetadata,
      errors: params.result.errors,
      warnings: params.result.warnings,
    };
  }

  /**
   * Create task metadata
   * @param {string} _taskId - The generated task ID (unused in current implementation)
   * @param {MetadataParams} params - Metadata parameters
   * @returns {TaskExecutionMetadata} The created task execution metadata
   */
  createTaskMetadata(_taskId: string, params: MetadataParams): TaskExecutionMetadata {
    return this.metadataService.createMetadata(params);
  }
}
