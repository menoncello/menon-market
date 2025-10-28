/**
 * Task execution service for handling agent task execution logic
 */
import { AgentDefinition } from '../agents/types';
import { TaskExecutionResult, TaskDelegationRequest, TaskExecutionMetadata } from './types';
export declare class TaskExecutionService {
    /**
     * Execute a task using an agent (simulated implementation)
     * @param agent
     * @param request
     * @param _metadata
     */
    executeTask(agent: AgentDefinition, request: TaskDelegationRequest, _metadata: TaskExecutionMetadata): Promise<TaskExecutionResult>;
    /**
     * Select appropriate tools for a task based on agent capabilities
     * @param agent
     * @param task
     */
    private selectToolsForTask;
    /**
     * Calculate confidence score for task execution
     * @param agent
     * @param task
     * @param toolsUsed
     */
    private calculateConfidence;
    /**
     * Get alignment score between agent role and task
     * @param role
     * @param task
     */
    private getRoleTaskAlignment;
    /**
     * Generate task output based on agent role and task
     * @param agent
     * @param task
     */
    private generateTaskOutput;
}
//# sourceMappingURL=TaskExecutionService.d.ts.map