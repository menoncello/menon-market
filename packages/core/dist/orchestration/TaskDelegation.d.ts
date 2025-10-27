/**
 * Task Tool Delegation Interface for Claude Code Integration
 * Enables agents to be used as subagents with the Claude Code Task tool
 */
import { AgentDefinition } from '../agents/types';
import { TaskDelegationRequest, TaskDelegationResponse, TaskExecutionMetadata, AgentCapability, TaskDelegationInterface } from './types';
/**
 * Claude Code Task Tool Integration
 * Implements the interface for delegating tasks to agents
 */
export declare class ClaudeCodeTaskIntegration implements TaskDelegationInterface {
    private registeredAgents;
    private runningTasks;
    private taskQueue;
    private taskExecutionService;
    private agentService;
    private metadataService;
    constructor();
    /**
     * Register an agent for task delegation
     * @param agent
     */
    registerAgent(agent: AgentDefinition): void;
    /**
     * Unregister an agent
     * @param agentId
     */
    unregisterAgent(agentId: string): void;
    /**
     * Get all registered agents
     */
    getRegisteredAgents(): AgentDefinition[];
    /**
     * Get agent by ID
     * @param agentId
     */
    getAgent(agentId: string): AgentDefinition | undefined;
    /**
     * Delegate a task to a specific agent
     * @param request
     */
    delegateTask(request: TaskDelegationRequest): Promise<TaskDelegationResponse>;
    /**
     * Validate task request before execution
     */
    private validateTaskRequest;
    /**
     * Execute task with agent
     */
    private executeTaskWithAgent;
    /**
     * Setup task execution with initial metadata
     */
    private setupTaskExecution;
    /**
     * Complete task execution with final metadata
     */
    private completeTaskExecution;
    /**
     * Handle task execution errors
     */
    private handleTaskExecutionError;
    /**
     * Create error response
     */
    private createErrorResponse;
    /**
     * Get missing tools for a task
     */
    private getMissingTools;
    /**
     * Create task metadata
     */
    private createTaskMetadata;
    /**
     * Get capabilities of an agent
     * @param agentId
     */
    getAgentCapabilities(agentId: string): Promise<AgentCapability | null>;
    /**
     * Find best agent for a given task
     * @param task
     * @param requiredTools
     */
    findBestAgent(task: string, requiredTools?: string[]): Promise<string | null>;
    /**
     * Check if an agent is available for task delegation
     * @param agentId
     */
    isAgentAvailable(agentId: string): Promise<boolean>;
    /**
     * Get status of running tasks
     * @param taskId
     */
    getTaskStatus(taskId: string): Promise<TaskExecutionMetadata | null>;
    /**
     * Cancel a running task
     * @param taskId
     */
    cancelTask(taskId: string): Promise<boolean>;
    /**
     * Generate unique task ID
     */
    private generateTaskId;
    /**
     * Get system status
     */
    getSystemStatus(): {
        totalAgents: number;
        availableAgents: number;
        runningTasks: number;
        queuedTasks: number;
        systemHealth: string;
    };
}
//# sourceMappingURL=TaskDelegation.d.ts.map