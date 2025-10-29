/**
 * Capability testing helper class
 * Provides functionality to test individual skill capabilities
 */

import { CapabilityTestResult } from './testing-interfaces';
import { SkillDefinition, SkillCapability } from './types';

/**
 * Capability testing constants
 */
const CAPABILITY_TEST_CONSTANTS = {
  /** Simulation constants */
  SIMULATION: {
    ACTION_CAPABILITY_DELAY: 100,
  },
} as const;

/**
 * Capability testing helper class
 */
export class CapabilityTestHelper {
  /**
   * Test individual capability
   * @param {SkillDefinition} skill - Skill definition containing the capability
   * @param {SkillCapability} capability - Capability to test
   * @returns {Promise<CapabilityTestResult>} Capability test result
   */
  async testCapability(
    skill: SkillDefinition,
    capability: SkillCapability
  ): Promise<CapabilityTestResult> {
    const startTime = Date.now();
    const { issues, success, result } = await this.executeCapabilityTest(skill, capability);
    const executionTime = Date.now() - startTime;

    return this.createCapabilityTestResult({
      capability,
      success,
      executionTime,
      result,
      issues,
    });
  }

  /**
   * Execute the actual capability test based on type
   * @param {SkillDefinition} skill - Skill definition containing the capability
   * @param {SkillCapability} capability - Capability to test
   * @returns {Promise<{issues: string[]; success: boolean; result: unknown}>} Test execution results
   */
  private async executeCapabilityTest(
    skill: SkillDefinition,
    capability: SkillCapability
  ): Promise<{ issues: string[]; success: boolean; result: unknown }> {
    const issues: string[] = [];
    let success = true;
    let result: unknown;

    try {
      result = await this.executeCapabilityByType(skill, capability);
    } catch (error) {
      const errorResult = this.handleCapabilityTestError(error);
      issues.push(...errorResult.issues);
      success = errorResult.success;
    }

    return { issues, success, result };
  }

  /**
   * Execute capability test based on its type
   * @param {SkillDefinition} skill - Skill definition containing the capability
   * @param {SkillCapability} capability - Capability to test
   * @returns {Promise<unknown>} Capability test result
   */
  private async executeCapabilityByType(
    skill: SkillDefinition,
    capability: SkillCapability
  ): Promise<unknown> {
    switch (capability.type) {
      case 'action':
        return this.testActionCapability(skill, capability);
      case 'knowledge':
        return this.testKnowledgeCapability(skill, capability);
      case 'tool':
        return this.testToolCapability(skill, capability);
      case 'pattern':
        return this.testPatternCapability(skill, capability);
      default:
        throw new Error(`Unknown capability type: ${capability.type}`);
    }
  }

  /**
   * Handle capability test errors
   * @param {unknown} error - Error that occurred during testing
   * @returns {{issues: string[]; success: boolean}} Error handling result
   */
  private handleCapabilityTestError(error: unknown): { issues: string[]; success: boolean } {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      issues: [errorMessage],
      success: false,
    };
  }

  /**
   * Create capability test result object
   * @param {object} params - Parameters for creating the test result
   * @param {SkillCapability} params.capability - Capability that was tested
   * @param {boolean} params.success - Whether the test was successful
   * @param {number} params.executionTime - Test execution time
   * @param {unknown} params.result - Test result
   * @param {string[]} params.issues - Issues found during testing
   * @returns {CapabilityTestResult} Formatted test result
   */
  private createCapabilityTestResult(params: {
    capability: SkillCapability;
    success: boolean;
    executionTime: number;
    result: unknown;
    issues: string[];
  }): CapabilityTestResult {
    const { capability, success, executionTime, result, issues } = params;
    return {
      capabilityId: capability.id,
      capabilityName: capability.name,
      success,
      executionTime,
      result,
      issues,
    };
  }

  /**
   * Test action capability
   * @param {SkillDefinition} _skill - Skill definition (unused for action testing)
   * @param {SkillCapability} capability - Capability to test
   * @returns {Promise<string>} Action execution result
   */
  private async testActionCapability(
    _skill: SkillDefinition,
    capability: SkillCapability
  ): Promise<string> {
    // Simulate action execution
    await new Promise(resolve =>
      setTimeout(resolve, CAPABILITY_TEST_CONSTANTS.SIMULATION.ACTION_CAPABILITY_DELAY)
    );
    return `Action '${capability.name}' executed successfully`;
  }

  /**
   * Test knowledge capability
   * @param {SkillDefinition} skill - Skill definition containing domain knowledge
   * @param {SkillCapability} capability - Knowledge capability to test
   * @returns {Promise<object>} Knowledge structure result
   */
  private async testKnowledgeCapability(
    skill: SkillDefinition,
    capability: SkillCapability
  ): Promise<object> {
    // Return knowledge structure
    return {
      type: 'knowledge',
      domain: skill.domain,
      capability: capability.name,
      description: capability.description,
    };
  }

  /**
   * Test tool capability
   * @param {SkillDefinition} _skill - Skill definition (unused for tool testing)
   * @param {SkillCapability} capability - Tool capability to test
   * @returns {Promise<string>} Tool availability result
   */
  private async testToolCapability(
    _skill: SkillDefinition,
    capability: SkillCapability
  ): Promise<string> {
    // Simulate tool availability check
    const tools = capability.implementation?.tools || [];
    return `Tools available: ${tools.join(', ')}`;
  }

  /**
   * Test pattern capability
   * @param {SkillDefinition} _skill - Skill definition (unused for pattern testing)
   * @param {SkillCapability} capability - Pattern capability to test
   * @returns {Promise<object>} Pattern structure result
   */
  private async testPatternCapability(
    _skill: SkillDefinition,
    capability: SkillCapability
  ): Promise<object> {
    // Return pattern structure
    return {
      type: 'pattern',
      name: capability.name,
      approach: capability.implementation?.approach || 'Not specified',
    };
  }
}
