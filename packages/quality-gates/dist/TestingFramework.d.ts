/**
 * Testing Framework for Agent Configurations
 * Comprehensive testing suite for agent types, validation, and performance
 */
export interface TestResult {
    testName: string;
    passed: boolean;
    duration: number;
    message: string;
    details?: Record<string, unknown>;
}
export interface TestSuite {
    name: string;
    tests: TestResult[];
    duration: number;
    passed: boolean;
    passRate: number;
}
export interface EdgeCaseTestResult {
    passed: boolean;
    message: string;
    details?: Record<string, unknown>;
}
export interface ValidationReport {
    timestamp: Date;
    suites: TestSuite[];
    overallPassed: boolean;
    overallPassRate: number;
    totalDuration: number;
    summary: {
        totalTests: number;
        passedTests: number;
        failedTests: number;
    };
}
/**
 *
 */
export declare class TestingFramework {
    private agentCreationService;
    private validationService;
    private testBuilders;
    private edgeCaseTests;
    /**
     *
     */
    constructor();
    /**
     * Run comprehensive validation suite for all agent types
     */
    runComprehensiveValidation(): Promise<ValidationReport>;
    /**
     * Test predefined agents
     */
    private testPredefinedAgents;
    /**
     * Test agent templates
     */
    private testAgentTemplates;
    /**
     * Test custom agent creation scenarios
     */
    private testCustomAgentCreation;
    /**
     * Get custom agent creation scenarios
     */
    private getCustomScenarios;
    /**
     * Run custom agent creation scenarios
     */
    private runCustomScenarios;
    /**
     * Run a single custom scenario
     */
    private runCustomScenario;
    /**
     * Test performance targets (<30 seconds)
     */
    private testPerformanceTargets;
    /**
     * Get agent types for performance testing
     */
    private getPerformanceTestAgentTypes;
    /**
     * Run performance tests for all agent types
     */
    private runPerformanceTests;
    /**
     * Run performance test for a specific agent type
     */
    private runPerformanceTest;
    /**
     * Test validation framework
     */
    private testValidationFramework;
    /**
     * Test edge cases and error handling
     */
    private testEdgeCases;
    /**
     * Get edge case test definitions
     */
    private getEdgeCases;
    /**
     * Run all edge case tests
     */
    private runEdgeCases;
    /**
     * Run a single edge case test
     */
    private runEdgeCase;
    /**
     * Create test suite result helper
     */
    private createTestSuiteResult;
    private testInvalidAgentValidation;
}
//# sourceMappingURL=TestingFramework.d.ts.map