/**
 * Testing Framework for Agent Configurations
 * Comprehensive testing suite for agent types, validation, and performance
 */

import { AgentCreationService } from '@menon-market/agent-creator';
import { AgentValidationService } from './agent-validation-service';
import { EdgeCaseTests } from './edge-case-tests';
import { TestBuilders } from './test-builders';
import { TestRunners } from './test-runners';
import { PERCENTAGE_MULTIPLIER, type ValidationReport, type TestSuite } from './testing-types';

/**
 * Main testing framework class that orchestrates comprehensive validation
 * of agent configurations, templates, and performance targets
 */
export class TestingFramework {
  private agentCreationService: AgentCreationService;
  private validationService: AgentValidationService;
  private testBuilders: TestBuilders;
  private edgeCaseTests: EdgeCaseTests;
  private testRunners: TestRunners;

  /**
   * Initialize the testing framework with all required service dependencies
   */
  constructor() {
    this.agentCreationService = new AgentCreationService();
    this.validationService = new AgentValidationService();
    this.testBuilders = new TestBuilders();
    this.edgeCaseTests = new EdgeCaseTests();
    this.testRunners = new TestRunners(
      this.agentCreationService,
      this.validationService,
      this.testBuilders,
      this.edgeCaseTests
    );
  }

  /**
   * Run comprehensive validation suite for all agent types
   * @returns {Promise<ValidationReport>} Complete validation report with all test suites and metrics
   */
  async runComprehensiveValidation(): Promise<ValidationReport> {
    const timestamp = new Date();
    const suites: TestSuite[] = [];

    // Test Suite 1: Predefined Agents
    suites.push(await this.testRunners.testPredefinedAgents());

    // Test Suite 2: Agent Templates
    suites.push(await this.testRunners.testAgentTemplates());

    // Test Suite 3: Custom Agent Creation
    suites.push(await this.testRunners.testCustomAgentCreation());

    // Test Suite 4: Performance Targets
    suites.push(await this.testRunners.testPerformanceTargets());

    // Test Suite 5: Validation Framework
    suites.push(await this.testRunners.testValidationFramework());

    // Test Suite 6: Edge Cases
    suites.push(await this.testRunners.testEdgeCases());

    const totalTests = suites.reduce((sum, suite) => sum + suite.tests.length, 0);
    const passedTests = suites.reduce(
      (sum, suite) => sum + suite.tests.filter(t => t.passed).length,
      0
    );
    const totalDuration = suites.reduce((sum, suite) => sum + suite.duration, 0);
    const overallPassed = suites.every(suite => suite.passed);
    const overallPassRate = (passedTests / totalTests) * PERCENTAGE_MULTIPLIER;

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
}
