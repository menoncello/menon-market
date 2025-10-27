/**
 * Types and interfaces for task delegation
 */
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
//# sourceMappingURL=types.d.ts.map