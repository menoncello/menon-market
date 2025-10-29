/**
 * Types and interfaces for task delegation
 */

import { AgentDefinition } from '../agents/types';

export interface TaskDelegationRequest {
  /** Agent ID to delegate the task to */
  agentId: string;

  /** Task description/prompt */
  task: string;

  /** Task priority (1-10) */
  priority?: number;

  /** Maximum execution time in seconds */
  timeout?: number;

  /** Additional context for the task */
  context?: Record<string, unknown>;

  /** Whether this task requires collaboration */
  collaborative?: boolean;

  /** Required tools for this task */
  requiredTools?: string[];

  /** Expected output format */
  outputFormat?: 'markdown' | 'json' | 'structured';
}

export interface TaskDelegationResponse {
  /** Whether the delegation was successful */
  success: boolean;

  /** Task result/output */
  result?: string;

  /** Structured data if requested */
  data?: unknown;

  /** Execution metadata */
  metadata: TaskExecutionMetadata;

  /** Errors if delegation failed */
  errors?: string[];

  /** Warnings if any */
  warnings?: string[];
}

export interface TaskExecutionMetadata {
  /** Agent that executed the task */
  agentId: string;

  /** Agent role */
  agentRole: string;

  /** Task start time */
  startTime: Date;

  /** Task completion time */
  endTime: Date;

  /** Total execution duration in milliseconds */
  duration: number;

  /** Whether the task completed within timeout */
  completedOnTime: boolean;

  /** Tools used during execution */
  toolsUsed: string[];

  /** Number of tool invocations */
  toolInvocations: number;

  /** Whether collaboration was used */
  collaborationUsed: boolean;

  /** Task confidence score (0-100) */
  confidence: number;
}

export interface AgentCapability {
  /** Tool names this agent can use */
  tools: string[];

  /** Task types this agent can handle */
  taskTypes: string[];

  /** Maximum concurrent tasks */
  maxConcurrentTasks: number;

  /** Average task completion time */
  avgCompletionTime: number;

  /** Success rate percentage */
  successRate: number;

  /** Specializations */
  specializations: string[];
}

export interface TaskDelegationInterface {
  /**
   * Delegate a task to a specific agent
   */
  delegateTask: (request: TaskDelegationRequest) => Promise<TaskDelegationResponse>;

  /**
   * Get capabilities of an agent
   */
  getAgentCapabilities: (agentId: string) => Promise<AgentCapability | null>;

  /**
   * Find best agent for a given task
   */
  findBestAgent: (task: string, requiredTools?: string[]) => Promise<string | null>;

  /**
   * Check if an agent is available for task delegation
   */
  isAgentAvailable: (agentId: string) => Promise<boolean>;

  /**
   * Get status of running tasks
   */
  getTaskStatus: (taskId: string) => Promise<TaskExecutionMetadata | null>;

  /**
   * Cancel a running task
   */
  cancelTask: (taskId: string) => Promise<boolean>;
}

export interface TaskExecutionResult {
  success: boolean;
  output: string;
  data?: unknown;
  toolsUsed: string[];
  toolInvocations: number;
  collaborationUsed: boolean;
  confidence: number;
  errors?: string[];
  warnings?: string[];
}

export interface MetadataParams {
  agentId: string;
  startTime: Date;
  endTime: Date;
  completedOnTime: boolean;
  toolsUsed: string[];
  toolInvocations: number;
  collaborationUsed: boolean;
  confidence: number;
}

/**
 * Parameter interface for task execution methods
 */
export interface TaskExecutionParams {
  /** The task delegation request */
  request: TaskDelegationRequest;
  /** The generated task ID */
  taskId: string;
  /** The task start time */
  startTime: Date;
  /** Map of registered agents */
  registeredAgents: Map<string, AgentDefinition>;
  /** Map of currently running tasks */
  runningTasks: Map<string, TaskExecutionMetadata>;
}

/**
 * Parameter interface for task completion methods
 */
export interface TaskCompletionParams {
  /** The generated task ID */
  taskId: string;
  /** The agent ID */
  agentId: string;
  /** The task start time */
  startTime: Date;
  /** The task execution result */
  result: TaskExecutionResult;
  /** Map of currently running tasks */
  runningTasks: Map<string, TaskExecutionMetadata>;
}

/**
 * Parameter interface for validation methods
 */
export interface ValidationParams {
  /** The task delegation request to validate */
  request: TaskDelegationRequest;
  /** The generated task ID */
  taskId: string;
  /** The task start time */
  startTime: Date;
  /** Error response creator function */
  createErrorResponse: (
    errors: string[],
    taskId: string,
    agentId: string,
    startTime: Date
  ) => TaskDelegationResponse;
}

/**
 * Parameter interface for agent availability validation
 */
export interface AgentAvailabilityParams extends ValidationParams {
  /** Current running tasks */
  runningTasks: Map<string, TaskExecutionMetadata>;
}

/**
 * Parameter interface for error response methods
 */
export interface ErrorResponseParams {
  /** Array of error messages */
  errors: string[];
  /** The generated task ID */
  taskId: string;
  /** The agent ID */
  agentId: string;
  /** The task start time */
  startTime: Date;
  /** Task metadata creator function */
  createTaskMetadata: (taskId: string, params: MetadataParams) => TaskExecutionMetadata;
}

/**
 * Parameter interface for task execution error handling
 */
export interface TaskExecutionErrorParams extends ErrorResponseParams {
  /** The error that occurred during task execution */
  error: unknown;
  /** The original task delegation request */
  request: TaskDelegationRequest;
  /** Function to remove task from running tasks */
  removeRunningTask: () => void;
}

/**
 * System status interface for type safety
 */
export interface SystemStatusInfo {
  /** Total number of agents */
  totalAgents: number;
  /** Number of available agents */
  availableAgents: number;
  /** Number of currently running tasks */
  runningTasks: number;
  /** Number of queued tasks */
  queuedTasks: number;
  /** System health status */
  systemHealth: string;
}

/**
 * Task validator instance interface
 */
export interface TaskValidatorInstance {
  /** Map of registered agents */
  registeredAgents: Map<string, AgentDefinition>;
  /** Agent service instance */
  agentService: {
    /** Check if agent is available */
    isAgentAvailable: (agentId: string) => Promise<boolean>;
    /** Check agent status */
    getAgentStatus: (agentId: string) => Promise<string>;
  };
  /** Map of currently running tasks */
  runningTasks: Map<string, TaskExecutionMetadata>;
}

/**
 * ValidationError interface for proper error handling
 */
export interface ValidationError {
  /** Field where error occurred */
  field: string;
  /** Error message */
  message: string;
  /** Error code */
  code: string;
  /** Error severity */
  severity: 'error' | 'warning';
  /** Error category */
  category: string;
}

/**
 * ValidationWarning interface for warning handling
 */
export interface ValidationWarning {
  /** Warning code */
  code: string;
  /** Warning message */
  message: string;
  /** Warning severity */
  severity: 'warning';
  /** Warning category */
  category: string;
}
