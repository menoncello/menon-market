/**
 * Edge Case Test Methods
 * Extracted from TestingFramework to reduce file length
 */
import { AgentCreationService } from '@menon-market/agent-creator';
/**
 * Edge case test methods
 */
export class EdgeCaseTests {
    agentCreationService;
    constructor() {
        this.agentCreationService = new AgentCreationService();
    }
    /**
     * Test empty request
     */
    async testEmptyRequest() {
        try {
            const result = await this.agentCreationService.createAgent({});
            return {
                passed: !result.success,
                message: 'Empty request correctly rejected',
            };
        }
        catch {
            return {
                passed: true,
                message: 'Empty request correctly rejected with exception',
            };
        }
    }
    /**
     * Test invalid template ID
     */
    async testInvalidTemplateId() {
        try {
            const result = await this.agentCreationService.createAgent({
                definition: 'InvalidTemplate',
                options: { skipValidation: false, dryRun: true },
            });
            return {
                passed: !result.success,
                message: 'Invalid template ID correctly rejected',
            };
        }
        catch {
            return {
                passed: true,
                message: 'Invalid template ID correctly rejected with exception',
            };
        }
    }
    /**
     * Test invalid customizations
     */
    async testInvalidCustomizations() {
        try {
            const validation = this.agentCreationService.validateTemplateCustomizations('FrontendDev', {
                maxExecutionTime: -1,
            });
            return {
                passed: !validation.valid,
                message: 'Invalid customizations correctly rejected',
            };
        }
        catch {
            return {
                passed: true,
                message: 'Invalid customizations correctly rejected with exception',
            };
        }
    }
    /**
     * Test missing required fields
     */
    async testMissingRequiredFields() {
        try {
            const request = this.createMissingFieldsRequest();
            const result = await this.agentCreationService.createAgent(request);
            return {
                passed: !result.success,
                message: 'Missing required fields correctly rejected',
            };
        }
        catch {
            return {
                passed: true,
                message: 'Missing required fields correctly rejected with exception',
            };
        }
    }
    /**
     * Create request with missing required fields for testing
     */
    createMissingFieldsRequest() {
        return {
            definition: {
                id: 'test',
                name: 'Test',
                description: 'Test',
                role: 'FrontendDev',
                goals: [],
                backstory: '',
                coreSkills: [],
                learningMode: 'adaptive',
                configuration: this.createMinimalConfiguration(),
                metadata: this.createMinimalMetadata(),
            },
            options: { skipValidation: false, dryRun: true },
        };
    }
    /**
     * Create minimal configuration for testing
     */
    createMinimalConfiguration() {
        return {
            performance: {
                maxExecutionTime: 60,
                memoryLimit: 512,
                maxConcurrentTasks: 1,
                priority: 5,
            },
            capabilities: {
                allowedTools: [],
                fileSystemAccess: {
                    read: true,
                    write: false,
                    execute: false,
                },
                networkAccess: {
                    http: false,
                    https: false,
                    externalApis: false,
                },
                agentIntegration: false,
            },
            communication: {
                style: 'formal',
                responseFormat: 'markdown',
                collaboration: {
                    enabled: false,
                    roles: ['contributor'],
                    conflictResolution: 'collaborative',
                },
            },
        };
    }
    /**
     * Create minimal metadata for testing
     */
    createMinimalMetadata() {
        return {
            createdAt: new Date(),
            updatedAt: new Date(),
            version: '1.0.0',
            author: 'test',
            tags: [],
            dependencies: [],
        };
    }
    /**
     * Test concurrent creation
     */
    async testConcurrentCreation() {
        try {
            const requests = Array(5)
                .fill(null)
                .map(() => ({
                definition: 'FrontendDev',
                options: { skipValidation: false, dryRun: true },
            }));
            const results = await Promise.all(requests.map(request => this.agentCreationService.createAgent(request)));
            const successCount = results.filter(result => result.success).length;
            return {
                passed: successCount === requests.length,
                message: `Concurrent creation: ${successCount}/${requests.length} successful`,
                details: { successCount, totalRequests: requests.length },
            };
        }
        catch {
            return {
                passed: false,
                message: 'Concurrent creation failed with unknown error',
            };
        }
    }
    /**
     * Test valid agent validation
     */
    async testValidAgentValidation(agent) {
        const startTime = Date.now();
        try {
            const request = {
                definition: agent,
                options: { skipValidation: false, dryRun: true },
            };
            const result = await this.agentCreationService.createAgent(request);
            return {
                testName: 'Valid Agent Validation',
                passed: result.success,
                duration: Date.now() - startTime,
                message: result.success ? 'Valid agent accepted' : 'Valid agent incorrectly rejected',
            };
        }
        catch {
            return {
                testName: 'Valid Agent Validation',
                passed: false,
                duration: Date.now() - startTime,
                message: 'Valid agent test failed with unknown error',
            };
        }
    }
    /**
     * Test template validation framework
     */
    async testTemplateValidationFramework() {
        const startTime = Date.now();
        try {
            const validation = this.agentCreationService.validateTemplateCustomizations('FrontendDev', {
                name: 'Test Agent',
                maxExecutionTime: 30,
            });
            return {
                testName: 'Template Validation Framework',
                passed: validation.valid,
                duration: Date.now() - startTime,
                message: validation.valid ? 'Template validation works' : 'Template validation failed',
            };
        }
        catch {
            return {
                testName: 'Template Validation Framework',
                passed: false,
                duration: Date.now() - startTime,
                message: 'Template validation failed with unknown error',
            };
        }
    }
}
//# sourceMappingURL=EdgeCaseTests.js.map