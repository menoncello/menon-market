import { AgentDefinition } from '../agents/types';
import { TaskDelegationRequest, TaskDelegationResponse, TaskValidatorInstance } from './types';

/**
 * Task validation step helpers
 */

interface ValidationContext {
  request: TaskDelegationRequest;
  taskId: string;
  startTime: Date;
  createErrorResponse: (
    errors: string[],
    taskId: string,
    agentId: string,
    startTime: Date
  ) => TaskDelegationResponse;
}

/**
 * Default task type for validation when task type cannot be determined
 */
const DEFAULT_TASK_TYPE = 'general';

/**
 * Error message for unknown errors
 */
const UNKNOWN_ERROR_MESSAGE = 'Unknown error';

/**
 * Agent status values that indicate unavailability
 */
const UNAVAILABLE_AGENT_STATUSES = ['offline', 'busy'] as const;

/**
 * Validate agent existence
 * @param {ValidationContext} context - Validation context
 * @param {TaskValidatorInstance} validator - Task validator instance
 * @returns {TaskDelegationResponse | null} Error response if validation fails, null if passes
 */
export function validateAgentExistence(
  context: ValidationContext,
  validator: TaskValidatorInstance
): TaskDelegationResponse | null {
  const { request, taskId, startTime, createErrorResponse } = context;

  if (!request.agentId) {
    return createErrorResponse(['Agent ID is required'], taskId, 'unknown', startTime);
  }

  const agent = validator.registeredAgents.get(request.agentId);
  if (!agent) {
    return createErrorResponse(
      [`Agent with ID ${request.agentId} not found`],
      taskId,
      request.agentId,
      startTime
    );
  }

  return null;
}

/**
 * Validate agent availability flow
 * @param {ValidationContext} context - Validation context
 * @param {TaskValidatorInstance} validator - Task validator instance
 * @returns {Promise<TaskDelegationResponse | null>} Error response if validation fails, null if passes
 */
export async function validateAgentAvailabilityFlow(
  context: ValidationContext,
  validator: TaskValidatorInstance
): Promise<TaskDelegationResponse | null> {
  const { request, taskId, startTime, createErrorResponse } = context;

  try {
    const isAvailable = await checkAgentAvailability(validator, request.agentId);
    if (!isAvailable) {
      return createUnavailableErrorResponse(request, taskId, startTime, createErrorResponse);
    }

    const statusValid = await validateAgentStatus({
      validator,
      request,
      taskId,
      startTime,
      createErrorResponse,
    });
    if (statusValid) {
      return statusValid;
    }

    return null;
  } catch (error) {
    return createErrorCheckResponse({ request, taskId, startTime, createErrorResponse }, error);
  }
}

/**
 * Check if agent is available
 * @param {TaskValidatorInstance} validator - Task validator instance
 * @param {string} agentId - Agent ID to check
 * @returns {Promise<boolean>} Whether agent is available
 * @private
 */
async function checkAgentAvailability(
  validator: TaskValidatorInstance,
  agentId: string
): Promise<boolean> {
  try {
    return await validator.agentService.isAgentAvailable(agentId);
  } catch {
    return false;
  }
}

/**
 * Create unavailable error response
 * @param {TaskDelegationRequest} request - Task delegation request
 * @param {string} taskId - Task ID
 * @param {Date} startTime - Start time
 * @param {Function} createErrorResponse - Error response creator
 * @returns {TaskDelegationResponse} Error response
 * @private
 */
function createUnavailableErrorResponse(
  request: TaskDelegationRequest,
  taskId: string,
  startTime: Date,
  createErrorResponse: (
    errors: string[],
    taskId: string,
    agentId: string,
    startTime: Date
  ) => TaskDelegationResponse
): TaskDelegationResponse {
  return createErrorResponse(
    [`Agent ${request.agentId} is not available`],
    taskId,
    request.agentId,
    startTime
  );
}

/**
 * Parameters for agent status validation
 */
interface AgentStatusValidationParams {
  validator: TaskValidatorInstance;
  request: TaskDelegationRequest;
  taskId: string;
  startTime: Date;
  createErrorResponse: (
    errors: string[],
    taskId: string,
    agentId: string,
    startTime: Date
  ) => TaskDelegationResponse;
}

/**
 * Validate agent status
 * @param {AgentStatusValidationParams} params - Validation parameters
 * @returns {Promise<TaskDelegationResponse | null>} Error response or null if valid
 * @private
 */
async function validateAgentStatus(
  params: AgentStatusValidationParams
): Promise<TaskDelegationResponse | null> {
  const { validator, request, taskId, startTime, createErrorResponse } = params;

  try {
    const status = await validator.agentService.getAgentStatus(request.agentId);
    if (
      UNAVAILABLE_AGENT_STATUSES.includes(status as (typeof UNAVAILABLE_AGENT_STATUSES)[number])
    ) {
      return createErrorResponse(
        [`Agent ${request.agentId} is ${status}`],
        taskId,
        request.agentId,
        startTime
      );
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Parameters for error check response creation
 */
interface ErrorCheckResponseParams {
  request: TaskDelegationRequest;
  taskId: string;
  startTime: Date;
  createErrorResponse: (
    errors: string[],
    taskId: string,
    agentId: string,
    startTime: Date
  ) => TaskDelegationResponse;
}

/**
 * Create error check response
 * @param {ErrorCheckResponseParams} params - Response parameters
 * @param {unknown} error - Error that occurred
 * @returns {TaskDelegationResponse} Error response
 * @private
 */
function createErrorCheckResponse(
  params: ErrorCheckResponseParams,
  error: unknown
): TaskDelegationResponse {
  const { request, taskId, startTime, createErrorResponse } = params;
  const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;

  return createErrorResponse(
    [`Failed to check availability for agent ${request.agentId}: ${errorMessage}`],
    taskId,
    request.agentId,
    startTime
  );
}

/**
 * Validate task requirements
 * @param {ValidationContext} context - Validation context
 * @returns {TaskDelegationResponse | null} Error response if validation fails, null if passes
 */
export function validateTaskRequirements(
  context: ValidationContext
): TaskDelegationResponse | null {
  const { request, taskId, startTime, createErrorResponse } = context;

  if (!request.task) {
    return createErrorResponse(
      ['Task description is required'],
      taskId,
      request.agentId,
      startTime
    );
  }

  return null;
}

/**
 * Parameters for agent validation operations
 */
interface AgentValidationParams {
  readonly request: TaskDelegationRequest;
  readonly registeredAgents: Map<string, AgentDefinition>;
  readonly createErrorResponse: (
    errors: string[],
    taskId: string,
    agentId: string,
    startTime: Date
  ) => TaskDelegationResponse;
  readonly taskId: string;
  readonly startTime: Date;
}

/**
 * Check if agent exists and return error response if not found
 * @param {AgentValidationParams} params - Validation parameters containing request, agents, and error handling
 * @returns {TaskDelegationResponse | null} Error response if agent not found, null if agent exists
 */
function validateAgentExists(params: AgentValidationParams): TaskDelegationResponse | null {
  const agent = params.registeredAgents.get(params.request.agentId);
  if (!agent) {
    return params.createErrorResponse(
      [`Agent with ID ${params.request.agentId} not found`],
      params.taskId,
      params.request.agentId,
      params.startTime
    );
  }
  return null;
}

/**
 * Validate required tools for agent
 * @param {AgentValidationParams} params - Validation parameters
 * @param {AgentDefinition} agent - The agent to validate tools against
 * @returns {TaskDelegationResponse | null} Error response if tools missing, null if all tools available
 */
function validateRequiredTools(
  params: AgentValidationParams,
  agent: AgentDefinition
): TaskDelegationResponse | null {
  if (!params.request.requiredTools || params.request.requiredTools.length === 0) {
    return null;
  }

  const allowedTools = agent.configuration?.capabilities?.allowedTools || [];
  const missingTools = params.request.requiredTools.filter(tool => !allowedTools.includes(tool));

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
 * Create validation parameters from context and validator
 * @param {ValidationContext} context - Validation context
 * @param {TaskValidatorInstance} validator - Task validator instance
 * @returns {AgentValidationParams} Validation parameters object
 */
function createValidationParams(
  context: ValidationContext,
  validator: TaskValidatorInstance
): AgentValidationParams {
  const { request, taskId, startTime, createErrorResponse } = context;

  return {
    request,
    registeredAgents: validator.registeredAgents,
    createErrorResponse,
    taskId,
    startTime,
  };
}

/**
 * Validate agent capabilities
 * @param {ValidationContext} context - Validation context
 * @param {TaskValidatorInstance} validator - Task validator instance
 * @returns {TaskDelegationResponse | null} Error response if validation fails, null if passes
 */
export function validateAgentCapabilities(
  context: ValidationContext,
  validator: TaskValidatorInstance
): TaskDelegationResponse | null {
  const validationParams = createValidationParams(context, validator);

  // Check if agent exists
  const agentExistsError = validateAgentExists(validationParams);
  if (agentExistsError) {
    return agentExistsError;
  }

  const agent = validator.registeredAgents.get(validationParams.request.agentId);
  if (!agent) {
    return validationParams.createErrorResponse(
      [`Agent with ID ${validationParams.request.agentId} not found`],
      validationParams.taskId,
      validationParams.request.agentId,
      validationParams.startTime
    );
  }

  // Validate required tools
  const toolsError = validateRequiredTools(validationParams, agent);
  if (toolsError) {
    return toolsError;
  }

  return validateTaskType();
}

/**
 * Validate task type (placeholder for future implementation)
 * @returns {TaskDelegationResponse | null} Always returns null for now
 */
function validateTaskType(): TaskDelegationResponse | null {
  // For now, we'll use a simple string-based approach since task is a string
  // In a more robust implementation, we might parse the task string to determine type
  // Note: AgentDefinition doesn't have direct capabilities property, so this validation
  // would need to be implemented based on agent's configuration or role
  const taskType = DEFAULT_TASK_TYPE;
  if (taskType) {
    // Placeholder for future capability validation implementation
    // This would check if agent can handle the specific task type based on its role or configuration
  }

  return null;
}
