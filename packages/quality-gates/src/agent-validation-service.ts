/**
 * Agent Validation Methods
 * Extracted from TestingFramework to reduce file length
 */

import { AgentDefinition, AgentRole, AgentTemplate } from '@menon-market/core';
import { type TestResult } from './testing-types';

// Constants for magic numbers
const MAX_EXECUTION_TIME = 600;
const MAX_MEMORY_LIMIT = 8192;
const RECOMMENDED_EXECUTION_TIME = 300;
const RECOMMENDED_MEMORY_LIMIT = 4096;
const MIN_CORE_SKILLS = 5;
const ROLE_MATCH_THRESHOLD = 0.6;

// Constants for duplicate strings
const FAILED_SUFFIX = 'failed';
const UNKNOWN_ERROR_MESSAGE = 'Unknown error';
const STRUCTURE_TEST_NAME = 'Agent Structure Validation';
const ROLE_TEST_NAME = 'Agent Role Validation';
const CONFIGURATION_TEST_NAME = 'Agent Configuration Validation';
const PERFORMANCE_TEST_NAME = 'Agent Performance Validation';
const GENERATION_TEST_NAME = 'Agent Generation Validation';

/**
 * Agent Validation Service
 * Provides comprehensive validation for agent definitions and configurations
 */
export class AgentValidationService {
  /**
   * Validate agent structure
   * @param {AgentDefinition} agent - The agent definition to validate
   * @returns {Promise<TestResult>} Promise resolving to test result indicating validation success/failure
   */
  async validateAgentStructure(agent: AgentDefinition): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const missingFieldsResult = this.validateRequiredFields(agent);
      if (!missingFieldsResult.passed) return missingFieldsResult;

      const goalsResult = this.validateGoalsArray(agent);
      if (!goalsResult.passed) return goalsResult;

      const coreSkillsResult = this.validateCoreSkillsArray(agent);
      if (!coreSkillsResult.passed) return coreSkillsResult;

      return {
        testName: STRUCTURE_TEST_NAME,
        passed: true,
        duration: Date.now() - startTime,
        message: 'Agent structure is valid',
      };
    } catch (error) {
      return {
        testName: STRUCTURE_TEST_NAME,
        passed: false,
        duration: Date.now() - startTime,
        message: `Structure validation ${FAILED_SUFFIX}: ${error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE}`,
      };
    }
  }

  /**
   * Validate agent role
   * @param {AgentDefinition} agent - The agent definition to validate
   * @returns {Promise<TestResult>} Promise resolving to test result indicating role validation success/failure
   */
  async validateAgentRole(agent: AgentDefinition): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const validRolesResult = this.validateRoleValue(agent);
      if (!validRolesResult.passed) return validRolesResult;

      const roleMatchResult = this.validateRoleContentMatch(agent);
      if (!roleMatchResult.passed) return roleMatchResult;

      return {
        testName: ROLE_TEST_NAME,
        passed: true,
        duration: Date.now() - startTime,
        message: 'Agent role is valid',
      };
    } catch (error) {
      return {
        testName: ROLE_TEST_NAME,
        passed: false,
        duration: Date.now() - startTime,
        message: `Role validation ${FAILED_SUFFIX}: ${error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE}`,
      };
    }
  }

  /**
   * Validate agent configuration
   * @param {AgentDefinition} agent - The agent definition to validate
   * @returns {Promise<TestResult>} Promise resolving to test result indicating configuration validation success/failure
   */
  async validateAgentConfiguration(agent: AgentDefinition): Promise<TestResult> {
    const startTime = Date.now();

    try {
      return this.validatePerformanceConfiguration(agent, startTime);
    } catch (error) {
      return {
        testName: CONFIGURATION_TEST_NAME,
        passed: false,
        duration: Date.now() - startTime,
        message: `Configuration validation ${FAILED_SUFFIX}: ${error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE}`,
      };
    }
  }

  /**
   * Validate agent performance
   * @param {AgentDefinition} agent - The agent definition to validate
   * @returns {Promise<TestResult>} Promise resolving to test result indicating performance validation success/failure
   */
  async validateAgentPerformance(agent: AgentDefinition): Promise<TestResult> {
    const startTime = Date.now();

    try {
      return this.validatePerformanceLimits(agent, startTime);
    } catch (error) {
      return {
        testName: PERFORMANCE_TEST_NAME,
        passed: false,
        duration: Date.now() - startTime,
        message: `Performance validation ${FAILED_SUFFIX}: ${error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE}`,
      };
    }
  }

  /**
   * Validate agent generation from template
   * @param {AgentTemplate} template - The agent template to validate
   * @returns {Promise<TestResult>} Promise resolving to test result indicating generation validation success/failure
   */
  async validateAgentGeneration(template: AgentTemplate): Promise<TestResult> {
    const startTime = Date.now();

    try {
      if (!template || typeof template !== 'object') {
        return {
          testName: GENERATION_TEST_NAME,
          passed: false,
          duration: Date.now() - startTime,
          message: 'Invalid template object',
        };
      }

      return {
        testName: GENERATION_TEST_NAME,
        passed: true,
        duration: Date.now() - startTime,
        message: 'Agent generation template is valid',
      };
    } catch (error) {
      return {
        testName: GENERATION_TEST_NAME,
        passed: false,
        duration: Date.now() - startTime,
        message: `Generation validation ${FAILED_SUFFIX}: ${error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE}`,
      };
    }
  }

  /**
   * Validate performance configuration limits
   * @param {AgentDefinition} agent - The agent definition to validate
   * @param {number} startTime - The validation start time
   * @returns {TestResult} Test result indicating configuration validation
   */
  private validatePerformanceConfiguration(agent: AgentDefinition, startTime: number): TestResult {
    const { maxExecutionTime, memoryLimit } = agent.configuration.performance;

    if (maxExecutionTime <= 0 || maxExecutionTime > MAX_EXECUTION_TIME) {
      return {
        testName: CONFIGURATION_TEST_NAME,
        passed: false,
        duration: Date.now() - startTime,
        message: `Max execution time must be between 1 and ${MAX_EXECUTION_TIME} seconds`,
      };
    }

    if (memoryLimit <= 0 || memoryLimit > MAX_MEMORY_LIMIT) {
      return {
        testName: CONFIGURATION_TEST_NAME,
        passed: false,
        duration: Date.now() - startTime,
        message: `Memory limit must be between 1 and ${MAX_MEMORY_LIMIT} MB`,
      };
    }

    return {
      testName: CONFIGURATION_TEST_NAME,
      passed: true,
      duration: Date.now() - startTime,
      message: 'Agent configuration is valid',
    };
  }

  /**
   * Validate performance limits against recommendations
   * @param {AgentDefinition} agent - The agent definition to validate
   * @param {number} startTime - The validation start time
   * @returns {TestResult} Test result indicating performance validation
   */
  private validatePerformanceLimits(agent: AgentDefinition, startTime: number): TestResult {
    const { maxExecutionTime, memoryLimit } = agent.configuration.performance;

    if (maxExecutionTime > RECOMMENDED_EXECUTION_TIME) {
      return {
        testName: PERFORMANCE_TEST_NAME,
        passed: false,
        duration: Date.now() - startTime,
        message: `Max execution time exceeds recommended ${RECOMMENDED_EXECUTION_TIME} seconds`,
      };
    }

    if (memoryLimit > RECOMMENDED_MEMORY_LIMIT) {
      return {
        testName: PERFORMANCE_TEST_NAME,
        passed: false,
        duration: Date.now() - startTime,
        message: `Memory limit exceeds recommended ${RECOMMENDED_MEMORY_LIMIT} MB`,
      };
    }

    return {
      testName: PERFORMANCE_TEST_NAME,
      passed: true,
      duration: Date.now() - startTime,
      message: 'Agent performance configuration is valid',
    };
  }

  /**
   * Validate required agent fields
   * @param {AgentDefinition} agent - The agent definition to validate
   * @returns {TestResult} Test result indicating required fields validation
   */
  private validateRequiredFields(agent: AgentDefinition): TestResult {
    const requiredFields = [
      'id',
      'name',
      'description',
      'role',
      'goals',
      'backstory',
      'coreSkills',
      'learningMode',
      'configuration',
      'metadata',
    ];
    const missingFields = requiredFields.filter(field => !(field in agent));

    if (missingFields.length > 0) {
      return {
        testName: STRUCTURE_TEST_NAME,
        passed: false,
        duration: 0,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        details: { missingFields },
      };
    }

    return {
      testName: STRUCTURE_TEST_NAME,
      passed: true,
      duration: 0,
      message: 'Required fields present',
    };
  }

  /**
   * Validate goals array
   * @param {AgentDefinition} agent - The agent definition to validate
   * @returns {TestResult} Test result indicating goals array validation
   */
  private validateGoalsArray(agent: AgentDefinition): TestResult {
    if (!Array.isArray(agent.goals) || agent.goals.length === 0) {
      return {
        testName: STRUCTURE_TEST_NAME,
        passed: false,
        duration: 0,
        message: 'Goals must be a non-empty array',
      };
    }

    return {
      testName: STRUCTURE_TEST_NAME,
      passed: true,
      duration: 0,
      message: 'Goals array valid',
    };
  }

  /**
   * Validate core skills array
   * @param {AgentDefinition} agent - The agent definition to validate
   * @returns {TestResult} Test result indicating core skills array validation
   */
  private validateCoreSkillsArray(agent: AgentDefinition): TestResult {
    if (!Array.isArray(agent.coreSkills) || agent.coreSkills.length < MIN_CORE_SKILLS) {
      return {
        testName: STRUCTURE_TEST_NAME,
        passed: false,
        duration: 0,
        message: `Core skills must be an array with at least ${MIN_CORE_SKILLS} items`,
      };
    }

    return {
      testName: STRUCTURE_TEST_NAME,
      passed: true,
      duration: 0,
      message: 'Core skills array valid',
    };
  }

  /**
   * Validate agent role value
   * @param {AgentDefinition} agent - The agent definition to validate
   * @returns {TestResult} Test result indicating role value validation
   */
  private validateRoleValue(agent: AgentDefinition): TestResult {
    const validRoles: AgentRole[] = [
      'FrontendDev',
      'BackendDev',
      'QA',
      'Architect',
      'CLI Dev',
      'UX Expert',
      'SM',
      'Custom',
    ];

    if (!validRoles.includes(agent.role)) {
      return {
        testName: ROLE_TEST_NAME,
        passed: false,
        duration: 0,
        message: `Invalid role: ${agent.role}`,
        details: { validRoles },
      };
    }

    return {
      testName: ROLE_TEST_NAME,
      passed: true,
      duration: 0,
      message: 'Role value valid',
    };
  }

  /**
   * Validate agent content matches role expectations
   * @param {AgentDefinition} agent - The agent definition to validate
   * @returns {TestResult} Test result indicating role content match validation
   */
  private validateRoleContentMatch(agent: AgentDefinition): TestResult {
    const roleRequirements = this.getRoleRequirements();
    const requirements = roleRequirements[agent.role];

    if (!requirements)
      return {
        testName: ROLE_TEST_NAME,
        passed: true,
        duration: 0,
        message: 'No requirements for role',
      };

    const agentText = this.getAgentText(agent);
    const matches = requirements.filter((req: string) => agentText.includes(req));

    if (matches.length < requirements.length * ROLE_MATCH_THRESHOLD) {
      return {
        testName: ROLE_TEST_NAME,
        passed: false,
        duration: 0,
        message: `Agent content doesn't match role expectations`,
        details: { role: agent.role, requirements, matches },
      };
    }

    return {
      testName: ROLE_TEST_NAME,
      passed: true,
      duration: 0,
      message: 'Role content match valid',
    };
  }

  /**
   * Get role requirements mapping
   * @returns {Record<string, string[]>} Record mapping roles to their required keywords
   */
  private getRoleRequirements(): Record<string, string[]> {
    return {
      FrontendDev: ['react', 'frontend', 'ui'],
      BackendDev: ['api', 'backend', 'server'],
      QA: ['testing', 'quality', 'automation'],
      Architect: ['architecture', 'design', 'system'],
      'CLI Dev': ['cli', 'tools', 'command'],
      'UX Expert': ['ux', 'design', 'user'],
      SM: ['scrum', 'agile', 'team'],
      Custom: ['custom', 'specialized'],
    };
  }

  /**
   * Get agent text for content matching
   * @param {AgentDefinition} agent - The agent definition to analyze
   * @returns {string} Concatenated lowercase text from agent fields
   */
  private getAgentText(agent: AgentDefinition): string {
    return `${agent.name} ${agent.description} ${agent.coreSkills.join(' ')}`.toLowerCase();
  }
}
