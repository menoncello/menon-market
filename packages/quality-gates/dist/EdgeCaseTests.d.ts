/**
 * Edge Case Test Methods
 * Extracted from TestingFramework to reduce file length
 */
import { AgentDefinition } from '@menon-market/core';
import { TestResult, EdgeCaseTestResult } from './TestingFramework';
/**
 * Edge case test methods
 */
export declare class EdgeCaseTests {
    private agentCreationService;
    constructor();
    /**
     * Test empty request
     */
    testEmptyRequest(): Promise<EdgeCaseTestResult>;
    /**
     * Test invalid template ID
     */
    testInvalidTemplateId(): Promise<EdgeCaseTestResult>;
    /**
     * Test invalid customizations
     */
    testInvalidCustomizations(): Promise<EdgeCaseTestResult>;
    /**
     * Test missing required fields
     */
    testMissingRequiredFields(): Promise<EdgeCaseTestResult>;
    /**
     * Create request with missing required fields for testing
     */
    private createMissingFieldsRequest;
    /**
     * Create minimal configuration for testing
     */
    private createMinimalConfiguration;
    /**
     * Create minimal metadata for testing
     */
    private createMinimalMetadata;
    /**
     * Test concurrent creation
     */
    testConcurrentCreation(): Promise<EdgeCaseTestResult>;
    /**
     * Test valid agent validation
     */
    testValidAgentValidation(agent: AgentDefinition): Promise<TestResult>;
    /**
     * Test template validation framework
     */
    testTemplateValidationFramework(): Promise<TestResult>;
}
//# sourceMappingURL=EdgeCaseTests.d.ts.map