/**
 * Task Tool Delegation Interface for Claude Code Integration
 * Enables agents to be used as subagents with the Claude Code Task tool
 */
import { TaskExecutionService } from './TaskExecutionService';
import { AgentService } from './AgentService';
import { MetadataService } from './MetadataService';
/**
 * Claude Code Task Tool Integration
 * Implements the interface for delegating tasks to agents
 */
export class ClaudeCodeTaskIntegration {
    registeredAgents = new Map();
    runningTasks = new Map();
    taskQueue = [];
    taskExecutionService;
    agentService;
    metadataService;
    constructor() {
        this.taskExecutionService = new TaskExecutionService();
        this.agentService = new AgentService(this.registeredAgents);
        this.metadataService = new MetadataService(this.registeredAgents);
    }
    /**
     * Register an agent for task delegation
     * @param agent
     */
    registerAgent(agent) {
        this.registeredAgents.set(agent.id, agent);
    }
    /**
     * Unregister an agent
     * @param agentId
     */
    unregisterAgent(agentId) {
        this.registeredAgents.delete(agentId);
    }
    /**
     * Get all registered agents
     */
    getRegisteredAgents() {
        return Array.from(this.registeredAgents.values());
    }
    /**
     * Get agent by ID
     * @param agentId
     */
    getAgent(agentId) {
        return this.registeredAgents.get(agentId);
    }
    /**
     * Delegate a task to a specific agent
     * @param request
     */
    async delegateTask(request) {
        const startTime = new Date();
        const taskId = this.generateTaskId();
        try {
            // Validate task request
            const validationResult = await this.validateTaskRequest(request, taskId, startTime);
            if (validationResult) {
                return validationResult;
            }
            // Execute task
            const result = await this.executeTaskWithAgent(request, taskId, startTime);
            return result;
        }
        catch (error) {
            return this.handleTaskExecutionError(error, request, taskId, startTime);
        }
    }
    /**
     * Validate task request before execution
     */
    async validateTaskRequest(request, taskId, startTime) {
        // Validate agent exists
        const agent = this.registeredAgents.get(request.agentId);
        if (!agent) {
            return this.createErrorResponse([`Agent not found: ${request.agentId}`], taskId, request.agentId, startTime);
        }
        // Check agent availability
        const isAvailable = await this.agentService.isAgentAvailable(request.agentId, this.runningTasks);
        if (!isAvailable) {
            return this.createErrorResponse([`Agent not available: ${request.agentId}`], taskId, request.agentId, startTime);
        }
        // Check required tools
        const missingTools = this.getMissingTools(agent, request);
        if (missingTools.length > 0) {
            return this.createErrorResponse([`Missing required tools: ${missingTools.join(', ')}`], taskId, request.agentId, startTime);
        }
        return null;
    }
    /**
     * Execute task with agent
     */
    async executeTaskWithAgent(request, taskId, startTime) {
        const agent = this.registeredAgents.get(request.agentId);
        if (!agent) {
            return this.createErrorResponse([`Agent not found: ${request.agentId}`], taskId, request.agentId, startTime);
        }
        // Setup task execution
        const initialMetadata = this.setupTaskExecution(taskId, request.agentId, startTime);
        // Execute the task
        const result = await this.taskExecutionService.executeTask(agent, request, initialMetadata);
        // Complete task execution
        return this.completeTaskExecution(taskId, request.agentId, startTime, result);
    }
    /**
     * Setup task execution with initial metadata
     */
    setupTaskExecution(taskId, agentId, startTime) {
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
        this.runningTasks.set(taskId, initialMetadata);
        return initialMetadata;
    }
    /**
     * Complete task execution with final metadata
     */
    completeTaskExecution(taskId, agentId, startTime, result) {
        // Update final metadata
        const endTime = new Date();
        const finalMetadata = this.createTaskMetadata(taskId, {
            agentId,
            startTime,
            endTime,
            completedOnTime: true,
            toolsUsed: result.toolsUsed,
            toolInvocations: result.toolInvocations,
            collaborationUsed: result.collaborationUsed,
            confidence: result.confidence,
        });
        this.runningTasks.delete(taskId);
        return {
            success: result.success,
            result: result.output,
            data: result.data,
            metadata: finalMetadata,
            errors: result.errors,
            warnings: result.warnings,
        };
    }
    /**
     * Handle task execution errors
     */
    handleTaskExecutionError(error, request, taskId, startTime) {
        const endTime = new Date();
        const metadata = this.createTaskMetadata(taskId, {
            agentId: request.agentId,
            startTime,
            endTime,
            completedOnTime: false,
            toolsUsed: [],
            toolInvocations: 0,
            collaborationUsed: false,
            confidence: 0,
        });
        this.runningTasks.delete(taskId);
        return {
            success: false,
            metadata,
            errors: [
                `Task execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            ],
        };
    }
    /**
     * Create error response
     */
    createErrorResponse(errors, taskId, agentId, startTime) {
        return {
            success: false,
            metadata: this.createTaskMetadata(taskId, {
                agentId,
                startTime,
                endTime: new Date(),
                completedOnTime: false,
                toolsUsed: [],
                toolInvocations: 0,
                collaborationUsed: false,
                confidence: 0,
            }),
            errors,
        };
    }
    /**
     * Get missing tools for a task
     */
    getMissingTools(agent, request) {
        return (request.requiredTools?.filter(tool => !agent.configuration.capabilities.allowedTools.includes(tool)) || []);
    }
    /**
     * Create task metadata
     */
    createTaskMetadata(taskId, params) {
        return this.metadataService.createMetadata(params);
    }
    /**
     * Get capabilities of an agent
     * @param agentId
     */
    async getAgentCapabilities(agentId) {
        return this.agentService.getAgentCapabilities(agentId);
    }
    /**
     * Find best agent for a given task
     * @param task
     * @param requiredTools
     */
    async findBestAgent(task, requiredTools) {
        return this.agentService.findBestAgent(task, requiredTools);
    }
    /**
     * Check if an agent is available for task delegation
     * @param agentId
     */
    async isAgentAvailable(agentId) {
        return this.agentService.isAgentAvailable(agentId, this.runningTasks);
    }
    /**
     * Get status of running tasks
     * @param taskId
     */
    async getTaskStatus(taskId) {
        return this.runningTasks.get(taskId) || null;
    }
    /**
     * Cancel a running task
     * @param taskId
     */
    async cancelTask(taskId) {
        const task = this.runningTasks.get(taskId);
        if (!task)
            return false;
        // In a real implementation, this would cancel the actual task execution
        this.runningTasks.delete(taskId);
        return true;
    }
    /**
     * Generate unique task ID
     */
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    /**
     * Get system status
     */
    getSystemStatus() {
        const totalAgents = this.registeredAgents.size;
        const runningTasks = this.runningTasks.size;
        const queuedTasks = this.taskQueue.length;
        return {
            totalAgents,
            availableAgents: totalAgents - runningTasks,
            runningTasks,
            queuedTasks,
            systemHealth: runningTasks < totalAgents ? 'healthy' : 'at_capacity',
        };
    }
}
//# sourceMappingURL=TaskDelegation.js.map