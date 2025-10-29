/**
 * Edge Case Test Methods
 * Extracted from TestingFramework to reduce file length
 */

import { AgentCreationService } from '@menon-market/agent-creator';
import {
  CreateAgentRequest,
  AgentDefinition,
  AgentConfiguration,
  AgentMetadata,
  PerformanceConfig,
  CapabilityConfig,
  CommunicationConfig,
} from '@menon-market/core';
import { type TestResult, type EdgeCaseTestResult } from './testing-types';

/** Constants for testing */
const DEFAULT_TEST_ARRAY_SIZE = 5;
const DEFAULT_MAX_EXECUTION_TIME = 60;
const DEFAULT_MEMORY_LIMIT = 512;
const DEFAULT_MAX_CONCURRENT_TASKS = 1;
const DEFAULT_PRIORITY = 5;
const TEST_VERSION = '1.0.0';
const TEST_AUTHOR = 'test';

/**
 * Edge case test methods for agent validation and creation
 */
export class EdgeCaseTests {
  private agentCreationService: AgentCreationService;

  /**
   * Create a new EdgeCaseTests instance
   */
  constructor() {
    this.agentCreationService = new AgentCreationService();
  }

  /**
   * Test empty request
   * @returns {Promise<EdgeCaseTestResult>} Promise resolving to edge case test result
   */
  async testEmptyRequest(): Promise<EdgeCaseTestResult> {
    try {
      const result = await this.agentCreationService.createAgent({} as CreateAgentRequest);
      return {
        passed: !result.success,
        message: 'Empty request correctly rejected',
      };
    } catch {
      return {
        passed: true,
        message: 'Empty request correctly rejected with exception',
      };
    }
  }

  /**
   * Test invalid template ID
   * @returns {Promise<EdgeCaseTestResult>} Promise resolving to edge case test result
   */
  async testInvalidTemplateId(): Promise<EdgeCaseTestResult> {
    try {
      const result = await this.agentCreationService.createAgent({
        definition: 'InvalidTemplate',
        options: { skipValidation: false, dryRun: true },
      });
      return {
        passed: !result.success,
        message: 'Invalid template ID correctly rejected',
      };
    } catch {
      return {
        passed: true,
        message: 'Invalid template ID correctly rejected with exception',
      };
    }
  }

  /**
   * Test invalid customizations
   * @returns {Promise<EdgeCaseTestResult>} Promise resolving to edge case test result
   */
  async testInvalidCustomizations(): Promise<EdgeCaseTestResult> {
    try {
      const validation = this.agentCreationService.validateTemplateCustomizations('FrontendDev', {
        maxExecutionTime: -1,
      });
      return {
        passed: !validation.valid,
        message: 'Invalid customizations correctly rejected',
      };
    } catch {
      return {
        passed: true,
        message: 'Invalid customizations correctly rejected with exception',
      };
    }
  }

  /**
   * Test missing required fields
   * @returns {Promise<EdgeCaseTestResult>} Promise resolving to edge case test result
   */
  async testMissingRequiredFields(): Promise<EdgeCaseTestResult> {
    try {
      const request = this.createMissingFieldsRequest();
      const result = await this.agentCreationService.createAgent(request);
      return {
        passed: !result.success,
        message: 'Missing required fields correctly rejected',
      };
    } catch {
      return {
        passed: true,
        message: 'Missing required fields correctly rejected with exception',
      };
    }
  }

  /**
   * Create request with missing required fields for testing
   * @returns {CreateAgentRequest} CreateAgentRequest with intentionally missing required fields
   */
  private createMissingFieldsRequest(): CreateAgentRequest {
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
   * @returns {AgentConfiguration} Minimal agent configuration
   */
  private createMinimalConfiguration(): AgentConfiguration {
    return {
      performance: this.createPerformanceConfig(),
      capabilities: this.createCapabilityConfig(),
      communication: this.createCommunicationConfig(),
    };
  }

  /**
   * Create performance configuration
   * @returns {PerformanceConfig} Performance configuration object
   */
  private createPerformanceConfig(): PerformanceConfig {
    return {
      maxExecutionTime: DEFAULT_MAX_EXECUTION_TIME,
      memoryLimit: DEFAULT_MEMORY_LIMIT,
      maxConcurrentTasks: DEFAULT_MAX_CONCURRENT_TASKS,
      priority: DEFAULT_PRIORITY,
    };
  }

  /**
   * Create capability configuration
   * @returns {CapabilityConfig} Capability configuration object
   */
  private createCapabilityConfig(): CapabilityConfig {
    return {
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
    };
  }

  /**
   * Create communication configuration
   * @returns {CommunicationConfig} Communication configuration object
   */
  private createCommunicationConfig(): CommunicationConfig {
    return {
      style: 'formal' as const,
      responseFormat: 'markdown' as const,
      collaboration: {
        enabled: false,
        roles: ['contributor' as const],
        conflictResolution: 'collaborative' as const,
      },
    };
  }

  /**
   * Create minimal metadata for testing
   * @returns {AgentMetadata} Minimal agent metadata
   */
  private createMinimalMetadata(): AgentMetadata {
    return {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: TEST_VERSION,
      author: TEST_AUTHOR,
      tags: [],
      dependencies: [],
    };
  }

  /**
   * Test concurrent creation
   * @returns {Promise<EdgeCaseTestResult>} Promise resolving to edge case test result
   */
  async testConcurrentCreation(): Promise<EdgeCaseTestResult> {
    try {
      const requests = Array(DEFAULT_TEST_ARRAY_SIZE)
        .fill(null)
        .map(() => ({
          definition: 'FrontendDev',
          options: { skipValidation: false, dryRun: true },
        }));

      const results = await Promise.all(
        requests.map(request => this.agentCreationService.createAgent(request))
      );

      const successCount = results.filter(result => result.success).length;
      return {
        passed: successCount === requests.length,
        message: `Concurrent creation: ${successCount}/${requests.length} successful`,
        details: { successCount, totalRequests: requests.length },
      };
    } catch {
      return {
        passed: false,
        message: 'Concurrent creation failed with unknown error',
      };
    }
  }

  /**
   * Test valid agent validation
   * @param {AgentDefinition} agent - The agent definition to test
   * @returns {Promise<TestResult>} Promise resolving to test result
   */
  async testValidAgentValidation(agent: AgentDefinition): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const request: CreateAgentRequest = {
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
    } catch {
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
   * @returns {Promise<TestResult>} Promise resolving to test result
   */
  async testTemplateValidationFramework(): Promise<TestResult> {
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
    } catch {
      return {
        testName: 'Template Validation Framework',
        passed: false,
        duration: Date.now() - startTime,
        message: 'Template validation failed with unknown error',
      };
    }
  }
}
