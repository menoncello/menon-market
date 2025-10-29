/**
 * Task Validation Utilities for Claude Code Integration
 * Provides validation functionality for task delegation requests
 */

import { AgentDefinition } from '../agents/types';
import { AgentService } from './agent-service';
import {
  validateAgentExistence,
  validateAgentAvailabilityFlow,
  validateTaskRequirements,
  validateAgentCapabilities,
} from './task-validation-steps';
import {
  TaskDelegationRequest,
  TaskDelegationResponse,
  ValidationParams,
  AgentAvailabilityParams,
  TaskValidatorInstance,
} from './types';

/**
 * Task Validator class for validating task delegation requests
 */
export class TaskValidator implements TaskValidatorInstance {
  /** Map of registered agents */
  public registeredAgents: Map<string, AgentDefinition>;

  /** Agent service instance */
  public agentServiceInstance: AgentService;

  /** Map of currently running tasks */
  public runningTasks: Map<string, import('./types').TaskExecutionMetadata> = new Map();

  /**
   * Create a new TaskValidator instance
   *
   * @param {Map<string, AgentDefinition>} registeredAgents - Map of registered agents
   * @param {AgentService} agentServiceInstance - Service for agent operations
   */
  constructor(registeredAgents: Map<string, AgentDefinition>, agentServiceInstance: AgentService) {
    this.registeredAgents = registeredAgents;
    this.agentServiceInstance = agentServiceInstance;
  }

  /**
   * Agent service adapter that implements the expected interface
   */
  public agentService = {
    isAgentAvailable: async (agentId: string): Promise<boolean> => {
      return this.agentServiceInstance.isAgentAvailable(agentId, this.runningTasks);
    },
    getAgentStatus: async (agentId: string): Promise<string> => {
      return this.agentServiceInstance.getAgentStatus(agentId);
    },
  };

  /**
   * Validate task request before execution
   * @param {TaskDelegationRequest} request - The task delegation request to validate
   * @param {string} taskId - The generated task ID
   * @param {Date} startTime - The task start time
   * @param {(errors: string[], taskId: string, agentId: string, startTime: Date) => TaskDelegationResponse} createErrorResponse - Error response creator function
   * @returns {Promise<TaskDelegationResponse | null>} Error response or null if valid
   */
  async validateTaskRequest(
    request: TaskDelegationRequest,
    taskId: string,
    startTime: Date,
    createErrorResponse: (
      errors: string[],
      taskId: string,
      agentId: string,
      startTime: Date
    ) => TaskDelegationResponse
  ): Promise<TaskDelegationResponse | null> {
    return this.performValidationSteps(request, taskId, startTime, createErrorResponse);
  }

  /**
   * Perform all validation steps in sequence
   * @param {TaskDelegationRequest} request - The task delegation request to validate
   * @param {string} taskId - The generated task ID
   * @param {Date} startTime - The task start time
   * @param {Function} createErrorResponse - Error response creator function
   * @returns {Promise<TaskDelegationResponse | null>} Error response or null if valid
   * @private
   */
  private async performValidationSteps(
    request: TaskDelegationRequest,
    taskId: string,
    startTime: Date,
    createErrorResponse: (
      errors: string[],
      taskId: string,
      agentId: string,
      startTime: Date
    ) => TaskDelegationResponse
  ): Promise<TaskDelegationResponse | null> {
    const context = { request, taskId, startTime, createErrorResponse };

    // Validate agent existence
    const agentResult = validateAgentExistence(context, this);
    if (agentResult) return agentResult;

    // Validate agent availability
    const availabilityResult = await validateAgentAvailabilityFlow(context, this);
    if (availabilityResult) return availabilityResult;

    // Validate task requirements
    const taskResult = validateTaskRequirements(context);
    if (taskResult) return taskResult;

    // Validate agent capabilities
    const capabilityResult = validateAgentCapabilities(context, this);
    if (capabilityResult) return capabilityResult;

    return null;
  }

  /**
   * Validate that the agent exists
   * @param {TaskDelegationRequest} request - The task delegation request to validate
   * @param {string} taskId - The generated task ID
   * @param {Date} startTime - The task start time
   * @param {(errors: string[], taskId: string, agentId: string, startTime: Date) => TaskDelegationResponse} createErrorResponse - Error response creator function
   * @returns {TaskDelegationResponse | null} Error response or null if agent exists
   */
  validateAgentExists(
    request: TaskDelegationRequest,
    taskId: string,
    startTime: Date,
    createErrorResponse: (
      errors: string[],
      taskId: string,
      agentId: string,
      startTime: Date
    ) => TaskDelegationResponse
  ): TaskDelegationResponse | null {
    const agent = this.registeredAgents.get(request.agentId);
    if (!agent) {
      return createErrorResponse(
        [`Agent not found: ${request.agentId}`],
        taskId,
        request.agentId,
        startTime
      );
    }
    return null;
  }

  /**
   * Validate agent availability
   * @param {AgentAvailabilityParams} params - The agent availability validation parameters
   * @returns {Promise<TaskDelegationResponse | null>} Error response or null if agent is available
   */
  async validateAgentAvailability(
    params: AgentAvailabilityParams
  ): Promise<TaskDelegationResponse | null> {
    const isAvailable = await this.agentService.isAgentAvailable(params.request.agentId);
    if (!isAvailable) {
      return params.createErrorResponse(
        [`Agent not available: ${params.request.agentId}`],
        params.taskId,
        params.request.agentId,
        params.startTime
      );
    }
    return null;
  }

  /**
   * Validate required tools for the task
   * @param {ValidationParams} params - The validation parameters
   * @returns {TaskDelegationResponse | null} Error response or null if all tools are available
   */
  validateRequiredTools(params: ValidationParams): TaskDelegationResponse | null {
    const agent = this.validateAndGetAgentForTools(params);
    if (!agent) {
      return params.createErrorResponse(
        [`Agent not found: ${params.request.agentId}`],
        params.taskId,
        params.request.agentId,
        params.startTime
      );
    }

    const missingTools = this.getMissingTools(agent, params.request);
    if (missingTools.length > 0) {
      return params.createErrorResponse(
        [`Missing required tools: ${missingTools.join(', ')}`],
        params.taskId,
        params.request.agentId,
        params.startTime
      );
    }

    return null;
  }

  /**
   * Validate and get agent for tool validation
   * @param {ValidationParams} params - The validation parameters
   * @returns {AgentDefinition | null} The agent definition or null if not found
   */
  private validateAndGetAgentForTools(params: ValidationParams): AgentDefinition | null {
    return this.registeredAgents.get(params.request.agentId) || null;
  }

  /**
   * Get missing tools for a task
   * @param {AgentDefinition} agent - The agent definition
   * @param {TaskDelegationRequest} request - The task delegation request
   * @returns {string[]} Array of missing tool names
   */
  getMissingTools(agent: AgentDefinition, request: TaskDelegationRequest): string[] {
    return (
      request.requiredTools?.filter(
        tool => !agent.configuration.capabilities.allowedTools.includes(tool)
      ) || []
    );
  }
}
