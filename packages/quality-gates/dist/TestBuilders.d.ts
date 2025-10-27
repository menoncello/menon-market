/**
 * Test Request Builders
 * Extracted from TestingFramework to reduce file length
 */
import { AgentDefinition, AgentRole, CreateAgentRequest } from '@menon-market/core';
/**
 * Test Request Builders
 */
export declare class TestBuilders {
    /**
     * Create custom frontend agent request
     */
    createCustomFrontendRequest(): CreateAgentRequest;
    /**
     * Create custom backend agent request
     */
    createCustomBackendRequest(): CreateAgentRequest;
    /**
     * Create custom QA agent request
     */
    createCustomQARequest(): CreateAgentRequest;
    /**
     * Create invalid agent for testing
     */
    createInvalidAgent(): AgentDefinition;
    /**
     * Create invalid agent configuration
     */
    createInvalidAgentConfiguration(): {
        performance: {
            maxExecutionTime: number;
            memoryLimit: number;
            maxConcurrentTasks: number;
            priority: number;
        };
        capabilities: {
            allowedTools: never[];
            fileSystemAccess: {
                read: boolean;
                write: boolean;
                execute: boolean;
            };
            networkAccess: {
                http: boolean;
                https: boolean;
                externalApis: boolean;
            };
            agentIntegration: boolean;
        };
        communication: {
            style: "technical";
            responseFormat: "markdown";
            collaboration: {
                enabled: boolean;
                roles: never[];
                conflictResolution: "collaborative";
            };
        };
    };
    /**
     * Create invalid agent metadata
     */
    createInvalidAgentMetadata(): {
        createdAt: Date;
        updatedAt: Date;
        version: string;
        author: string;
        tags: never[];
        dependencies: never[];
    };
    /**
     * Create invalid agent request
     */
    createInvalidAgentRequest(invalidAgent: AgentDefinition): CreateAgentRequest;
    /**
     * Create performance test request
     */
    createPerformanceTestRequest(role: AgentRole): CreateAgentRequest;
}
//# sourceMappingURL=TestBuilders.d.ts.map