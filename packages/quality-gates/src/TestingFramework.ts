/**
 * Testing Framework for Agent Configurations
 * Comprehensive testing suite for agent types, validation, and performance
 */

import { AgentCreationService } from '@menon-market/agent-creator';
import { AgentRole, CreateAgentRequest } from '@menon-market/core';
import { AgentValidationService } from './AgentValidationService';
import { TestBuilders } from './TestBuilders';
import { EdgeCaseTests } from './EdgeCaseTests';

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
export class TestingFramework {
  private agentCreationService: AgentCreationService;
  private validationService: AgentValidationService;
  private testBuilders: TestBuilders;
  private edgeCaseTests: EdgeCaseTests;

  /**
   *
   */
  constructor() {
    this.agentCreationService = new AgentCreationService();
    this.validationService = new AgentValidationService();
    this.testBuilders = new TestBuilders();
    this.edgeCaseTests = new EdgeCaseTests();
  }

  /**
   * Run comprehensive validation suite for all agent types
   */
  async runComprehensiveValidation(): Promise<ValidationReport> {
    const timestamp = new Date();
    const suites: TestSuite[] = [];

    // Test Suite 1: Predefined Agents
    suites.push(await this.testPredefinedAgents());

    // Test Suite 2: Agent Templates
    suites.push(await this.testAgentTemplates());

    // Test Suite 3: Custom Agent Creation
    suites.push(await this.testCustomAgentCreation());

    // Test Suite 4: Performance Targets
    suites.push(await this.testPerformanceTargets());

    // Test Suite 5: Validation Framework
    suites.push(await this.testValidationFramework());

    // Test Suite 6: Edge Cases
    suites.push(await this.testEdgeCases());

    const totalTests = suites.reduce((sum, suite) => sum + suite.tests.length, 0);
    const passedTests = suites.reduce(
      (sum, suite) => sum + suite.tests.filter(t => t.passed).length,
      0
    );
    const totalDuration = suites.reduce((sum, suite) => sum + suite.duration, 0);
    const overallPassed = suites.every(suite => suite.passed);
    const overallPassRate = (passedTests / totalTests) * 100;

    return {
      timestamp,
      suites,
      overallPassed,
      overallPassRate,
      totalDuration,
      summary: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
      },
    };
  }

  /**
   * Test predefined agents
   */
  private async testPredefinedAgents(): Promise<TestSuite> {
    const tests: TestResult[] = [];
    const startTime = Date.now();

    const predefinedAgents = this.agentCreationService.getAvailableAgents();

    for (const agent of predefinedAgents) {
      const structureTest = await this.validationService.validateAgentStructure(agent);
      tests.push(structureTest);

      const roleTest = await this.validationService.validateAgentRole(agent);
      tests.push(roleTest);

      const configTest = await this.validationService.validateAgentConfiguration(agent);
      tests.push(configTest);

      const perfTest = await this.validationService.validateAgentPerformance(agent);
      tests.push(perfTest);
    }

    return this.createTestSuiteResult('Predefined Agents', tests, startTime);
  }

  /**
   * Test agent templates
   */
  private async testAgentTemplates(): Promise<TestSuite> {
    const tests: TestResult[] = [];
    const startTime = Date.now();

    const templates = this.agentCreationService.getAvailableTemplates();

    for (const template of templates) {
      const generationTest = await this.validationService.validateAgentGeneration(template);
      tests.push(generationTest);
    }

    return this.createTestSuiteResult('Agent Templates', tests, startTime);
  }

  /**
   * Test custom agent creation scenarios
   */
  private async testCustomAgentCreation(): Promise<TestSuite> {
    const startTime = Date.now();
    const customScenarios = this.getCustomScenarios();
    const tests = await this.runCustomScenarios(customScenarios);

    return this.createTestSuiteResult('Custom Agent Creation', tests, startTime);
  }

  /**
   * Get custom agent creation scenarios
   */
  private getCustomScenarios() {
    return [
      {
        name: 'Custom Frontend Agent',
        request: this.testBuilders.createCustomFrontendRequest(),
      },
      {
        name: 'Custom Backend Agent',
        request: this.testBuilders.createCustomBackendRequest(),
      },
      {
        name: 'Custom QA Agent',
        request: this.testBuilders.createCustomQARequest(),
      },
    ];
  }

  /**
   * Run custom agent creation scenarios
   */
  private async runCustomScenarios(
    customScenarios: Array<{ name: string; request: CreateAgentRequest }>
  ): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    for (const scenario of customScenarios) {
      const testResult = await this.runCustomScenario(scenario);
      tests.push(testResult);
    }

    return tests;
  }

  /**
   * Run a single custom scenario
   */
  private async runCustomScenario(scenario: {
    name: string;
    request: CreateAgentRequest;
  }): Promise<TestResult> {
    const testStart = Date.now();

    try {
      const result = await this.agentCreationService.createAgent(scenario.request);

      return {
        testName: scenario.name,
        passed: result.success,
        duration: Date.now() - testStart,
        message: result.success
          ? 'Custom agent created successfully'
          : result.errors?.join(', ') || 'Unknown error',
        details: {
          creationTime: result.metadata.creationTime,
          performanceTargetMet: result.metadata.performanceTargetMet,
          validationResults: result.metadata.validationResults,
        },
      };
    } catch (error) {
      return {
        testName: scenario.name,
        passed: false,
        duration: Date.now() - testStart,
        message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Test performance targets (<30 seconds)
   */
  private async testPerformanceTargets(): Promise<TestSuite> {
    const startTime = Date.now();
    const agentTypes = this.getPerformanceTestAgentTypes();
    const tests = await this.runPerformanceTests(agentTypes);

    return this.createTestSuiteResult('Performance Targets', tests, startTime);
  }

  /**
   * Get agent types for performance testing
   */
  private getPerformanceTestAgentTypes(): AgentRole[] {
    return ['FrontendDev', 'BackendDev', 'QA', 'Architect', 'CLI Dev', 'UX Expert', 'SM'];
  }

  /**
   * Run performance tests for all agent types
   */
  private async runPerformanceTests(agentTypes: AgentRole[]): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    for (const role of agentTypes) {
      const testResult = await this.runPerformanceTest(role);
      tests.push(testResult);
    }

    return tests;
  }

  /**
   * Run performance test for a specific agent type
   */
  private async runPerformanceTest(role: AgentRole): Promise<TestResult> {
    const testStart = Date.now();

    try {
      const request = this.testBuilders.createPerformanceTestRequest(role);
      const result = await this.agentCreationService.createAgent(request);

      return {
        testName: `Performance Test - ${role}`,
        passed: result.success && result.metadata.performanceTargetMet,
        duration: Date.now() - testStart,
        message: result.metadata.performanceTargetMet
          ? 'Performance target met'
          : `Performance target missed (${result.metadata.creationTime}ms)`,
        details: {
          creationTime: result.metadata.creationTime,
          targetMet: result.metadata.performanceTargetMet,
          success: result.success,
        },
      };
    } catch (error) {
      return {
        testName: `Performance Test - ${role}`,
        passed: false,
        duration: Date.now() - testStart,
        message: `Performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Test validation framework
   */
  private async testValidationFramework(): Promise<TestSuite> {
    const tests: TestResult[] = [];
    const startTime = Date.now();

    // Test valid agent
    const validAgent = this.agentCreationService.getPredefinedAgent('FrontendDev');
    if (validAgent) {
      const validTest = await this.edgeCaseTests.testValidAgentValidation(validAgent);
      tests.push(validTest);
    }

    // Test invalid agent validation
    const invalidTest = await this.testInvalidAgentValidation();
    tests.push(invalidTest);

    // Test template validation framework
    const templateValidationTest = await this.edgeCaseTests.testTemplateValidationFramework();
    tests.push(templateValidationTest);

    return this.createTestSuiteResult('Validation Framework', tests, startTime);
  }

  /**
   * Test edge cases and error handling
   */
  private async testEdgeCases(): Promise<TestSuite> {
    const startTime = Date.now();
    const edgeCases = this.getEdgeCases();
    const tests = await this.runEdgeCases(edgeCases);

    return this.createTestSuiteResult('Edge Cases and Error Handling', tests, startTime);
  }

  /**
   * Get edge case test definitions
   */
  private getEdgeCases() {
    return [
      {
        name: 'Empty Request',
        test: () => this.edgeCaseTests.testEmptyRequest(),
      },
      {
        name: 'Invalid Template ID',
        test: () => this.edgeCaseTests.testInvalidTemplateId(),
      },
      {
        name: 'Invalid Customizations',
        test: () => this.edgeCaseTests.testInvalidCustomizations(),
      },
      {
        name: 'Missing Required Fields',
        test: () => this.edgeCaseTests.testMissingRequiredFields(),
      },
      {
        name: 'Concurrent Creation',
        test: () => this.edgeCaseTests.testConcurrentCreation(),
      },
    ];
  }

  /**
   * Run all edge case tests
   */
  private async runEdgeCases(
    edgeCases: Array<{ name: string; test: () => Promise<EdgeCaseTestResult | TestResult> }>
  ): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    for (const edgeCase of edgeCases) {
      const testResult = await this.runEdgeCase(edgeCase);
      tests.push(testResult);
    }

    return tests;
  }

  /**
   * Run a single edge case test
   */
  private async runEdgeCase(edgeCase: {
    name: string;
    test: () => Promise<EdgeCaseTestResult | TestResult>;
  }): Promise<TestResult> {
    const testStart = Date.now();

    try {
      const result = await edgeCase.test();
      return {
        testName: edgeCase.name,
        passed: result.passed,
        duration: Date.now() - testStart,
        message: result.message,
        details: result.details,
      };
    } catch (error) {
      return {
        testName: edgeCase.name,
        passed: false,
        duration: Date.now() - testStart,
        message: `Edge case test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Create test suite result helper
   */
  private createTestSuiteResult(name: string, tests: TestResult[], startTime: number): TestSuite {
    const duration = Date.now() - startTime;
    const passed = tests.filter(test => test.passed).length;

    return {
      name,
      tests,
      duration,
      passed: passed === tests.length,
      passRate: (passed / tests.length) * 100,
    };
  }

  // Additional test methods (moved to EdgeCaseTests service)
  private async testInvalidAgentValidation(): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const invalidAgent = this.testBuilders.createInvalidAgent();
      const request = this.testBuilders.createInvalidAgentRequest(invalidAgent);
      const result = await this.agentCreationService.createAgent(request);

      return {
        testName: 'Invalid Agent Validation',
        passed: !result.success,
        duration: Date.now() - startTime,
        message: result.success
          ? 'Invalid agent was incorrectly accepted'
          : 'Invalid agent correctly rejected',
      };
    } catch {
      return {
        testName: 'Invalid Agent Validation',
        passed: true,
        duration: Date.now() - startTime,
        message: 'Invalid agent correctly rejected with exception',
      };
    }
  }
}
