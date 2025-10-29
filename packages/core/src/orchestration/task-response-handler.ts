/**
 * Task Response Handler for Claude Code Integration
 * Handles error responses and response creation utilities
 */

import {
  TaskDelegationRequest,
  TaskDelegationResponse,
  TaskExecutionMetadata,
  ErrorResponseParams,
  TaskExecutionErrorParams,
  SystemStatusInfo,
} from './types';

/**
 * Task Response Handler class for creating error responses and handling response creation
 */
export class TaskResponseHandler {
  /**
   * Handle task execution errors
   * @param {TaskExecutionErrorParams} params - The task execution error parameters
   * @returns {TaskDelegationResponse} Error response with metadata
   */
  handleTaskExecutionError(params: TaskExecutionErrorParams): TaskDelegationResponse {
    const endTime = new Date();
    const metadata = params.createTaskMetadata(params.taskId, {
      agentId: params.request.agentId,
      startTime: params.startTime,
      endTime,
      completedOnTime: false,
      toolsUsed: [],
      toolInvocations: 0,
      collaborationUsed: false,
      confidence: 0,
    });
    params.removeRunningTask();

    return {
      success: false,
      metadata,
      errors: [
        `Task execution failed: ${params.error instanceof Error ? params.error.message : 'Unknown error'}`,
      ],
    };
  }

  /**
   * Create error response
   * @param {ErrorResponseParams} params - The error response parameters
   * @returns {TaskDelegationResponse} Error response with metadata
   */
  createErrorResponse(params: ErrorResponseParams): TaskDelegationResponse {
    return {
      success: false,
      metadata: params.createTaskMetadata(params.taskId, {
        agentId: params.agentId,
        startTime: params.startTime,
        endTime: new Date(),
        completedOnTime: false,
        toolsUsed: [],
        toolInvocations: 0,
        collaborationUsed: false,
        confidence: 0,
      }),
      errors: params.errors,
    };
  }

  /**
   * Create system status response
   * @param {Map<string, AgentDefinition>} registeredAgents - Registered agents map
   * @param {Map<string, TaskExecutionMetadata>} runningTasks - Running tasks map
   * @param {TaskDelegationRequest[]} taskQueue - Task queue array
   * @returns {SystemStatusInfo} System status information
   */
  createSystemStatus(
    registeredAgents: Map<string, import('../agents/types').AgentDefinition>,
    runningTasks: Map<string, TaskExecutionMetadata>,
    taskQueue: TaskDelegationRequest[]
  ): SystemStatusInfo {
    const totalAgents = registeredAgents.size;
    const runningTasksCount = runningTasks.size;
    const queuedTasks = taskQueue.length;

    return {
      totalAgents,
      availableAgents: totalAgents - runningTasksCount,
      runningTasks: runningTasksCount,
      queuedTasks,
      systemHealth: runningTasksCount < totalAgents ? 'healthy' : 'at_capacity',
    };
  }
}
