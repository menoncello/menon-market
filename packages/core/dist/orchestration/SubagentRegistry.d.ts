/**
 * Subagent Registry and Discovery Service
 * Manages registration, discovery, and lifecycle of subagents
 */
import { AgentDefinition, AgentRole } from '../agents/types';
import { ClaudeCodeTaskIntegration } from './TaskDelegation';
export interface SubagentRegistration {
    /** Agent definition */
    agent: AgentDefinition;
    /** Registration timestamp */
    registeredAt: Date;
    /** Last activity timestamp */
    lastActivity: Date;
    /** Current status */
    status: SubagentStatus;
    /** Health check interval in milliseconds */
    healthCheckInterval: number;
    /** Number of tasks completed */
    tasksCompleted: number;
    /** Average task success rate */
    successRate: number;
    /** Current load (0-100) */
    currentLoad: number;
    /** Capabilities metadata */
    capabilities: SubagentCapabilities;
}
export type SubagentStatus = 'active' | 'inactive' | 'busy' | 'error' | 'maintenance';
export interface SubagentCapabilities {
    /** Primary role specializations */
    specializations: string[];
    /** Supported task categories */
    taskCategories: string[];
    /** Available tools */
    tools: string[];
    /** Integration points */
    integrations: string[];
    /** Performance characteristics */
    performance: {
        avgResponseTime: number;
        maxConcurrentTasks: number;
        reliability: number;
    };
}
export interface DiscoveryFilter {
    /** Role filter */
    role?: AgentRole;
    /** Status filter */
    status?: SubagentStatus;
    /** Capability filter */
    capabilities?: string[];
    /** Minimum success rate */
    minSuccessRate?: number;
    /** Maximum current load */
    maxLoad?: number;
    /** Available tools filter */
    requiredTools?: string[];
}
export interface SubagentDiscovery {
    /** Find subagents matching criteria */
    findSubagents: (filter?: DiscoveryFilter) => SubagentRegistration[];
    /** Get best subagent for a task */
    getBestSubagent: (task: string, requirements?: string[]) => SubagentRegistration | null;
    /** Get subagent by ID */
    getSubagent: (agentId: string) => SubagentRegistration | null;
    /** Get all registered subagents */
    getAllSubagents: () => SubagentRegistration[];
    /** Get subagents by role */
    getSubagentsByRole: (role: AgentRole) => SubagentRegistration[];
    /** Get subagent statistics */
    getStatistics: () => SubagentStatistics;
}
export interface SubagentStatistics {
    /** Total registered subagents */
    totalSubagents: number;
    /** Subagents by status */
    byStatus: Record<SubagentStatus, number>;
    /** Subagents by role */
    byRole: Record<AgentRole, number>;
    /** System-wide metrics */
    systemMetrics: {
        avgSuccessRate: number;
        avgResponseTime: number;
        totalTasksCompleted: number;
        systemLoad: number;
    };
}
/**
 * Subagent Registry Implementation
 */
export declare class SubagentRegistry implements SubagentDiscovery {
    private registeredSubagents;
    private taskIntegration;
    private healthCheckInterval;
    /**
     *
     * @param taskIntegration
     */
    constructor(taskIntegration: ClaudeCodeTaskIntegration);
    /**
     * Register a new subagent
     * @param agent
     */
    registerSubagent(agent: AgentDefinition): void;
    /**
     * Unregister a subagent
     * @param agentId
     */
    unregisterSubagent(agentId: string): boolean;
    /**
     * Update subagent status
     * @param agentId
     * @param status
     */
    updateSubagentStatus(agentId: string, status: SubagentStatus): boolean;
    /**
     * Record task completion for a subagent
     * @param agentId
     * @param success
     * @param responseTime
     */
    recordTaskCompletion(agentId: string, success: boolean, responseTime: number): void;
    /**
     * Find subagents matching filter criteria
     * @param filter
     */
    findSubagents(filter?: DiscoveryFilter): SubagentRegistration[];
    /**
     * Get best subagent for a task
     * @param task
     * @param requirements
     */
    getBestSubagent(task: string, requirements?: string[]): SubagentRegistration | null;
    /**
     * Get subagent by ID
     * @param agentId
     */
    getSubagent(agentId: string): SubagentRegistration | null;
    /**
     * Get all registered subagents
     */
    getAllSubagents(): SubagentRegistration[];
    /**
     * Get subagents by role
     * @param role
     */
    getSubagentsByRole(role: AgentRole): SubagentRegistration[];
    /**
     * Get subagent statistics
     */
    getStatistics(): SubagentStatistics;
    /**
     * Get subagents that need health checks
     */
    private getSubagentsNeedingHealthCheck;
    /**
     * Perform health check on a subagent
     * @param registration
     */
    private performHealthCheck;
    /**
     * Start periodic health checks
     */
    private startHealthChecks;
    /**
     * Stop health checks
     */
    stopHealthChecks(): void;
    /**
     * Extract capabilities from agent definition
     * @param agent
     */
    private extractCapabilities;
    /**
     * Get task categories for a role
     * @param role
     */
    private getTaskCategoriesForRole;
    /**
     * Score subagent for task suitability
     * @param registration
     * @param task
     * @param requirements
     */
    private scoreSubagentForTask;
    /**
     * Cleanup resources
     */
    dispose(): void;
}
//# sourceMappingURL=SubagentRegistry.d.ts.map