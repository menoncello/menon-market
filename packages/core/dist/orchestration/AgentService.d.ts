/**
 * Agent service for handling agent-related operations
 */
import { AgentDefinition } from '../agents/types';
import { AgentCapability } from './types';
export declare class AgentService {
    private registeredAgents;
    constructor(registeredAgents: Map<string, AgentDefinition>);
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
    isAgentAvailable(agentId: string, runningTasks: Map<string, any>): Promise<boolean>;
    /**
     * Check if an agent is suitable for a task
     * @param agent
     * @param task
     * @param requiredTools
     */
    private isAgentSuitableForTask;
    /**
     * Score an agent for task suitability
     * @param agent
     * @param task
     * @param requiredTools
     */
    private scoreAgentForTask;
    /**
     * Get alignment score between agent role and task
     * @param role
     * @param task
     */
    private getRoleTaskAlignment;
    /**
     * Get task types suitable for an agent role
     * @param role
     */
    private getTaskTypesForRole;
}
//# sourceMappingURL=AgentService.d.ts.map