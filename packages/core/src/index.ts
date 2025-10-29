/**
 * Main export file for @menon-market/core package
 * Provides core types, interfaces, and agent definitions for the ClaudeCode SuperPlugin ecosystem
 */

// Export all types and interfaces
export * from './agents/types';

// Export agent definitions and registry
export * from './agents/definitions';

// Export agent templates and validation
export * from './agents/templates';

// Export skills system with explicit re-exports to resolve conflicts
export type { SkillValidationRule } from './skills/validation';
export * from './skills/types';
export * from './skills/registry';
export * from './skills/loader';
export * from './skills/testing';

// Export orchestration and Claude Code integration
export { ClaudeCodeTaskIntegration as TaskDelegation } from './orchestration/task-delegation';
export * from './orchestration/subagent-registry';
export type {
  TaskDelegationRequest,
  TaskDelegationResponse,
  ValidationParams,
  AgentAvailabilityParams,
  TaskValidatorInstance
} from './orchestration/types';

// Re-export key classes for testing
export { ClaudeCodeTaskIntegration } from './orchestration/task-delegation';
export { SubagentRegistry } from './orchestration/subagent-registry';

// Export test helpers
export * from './skills/test-helpers';

// Mock skill creation utility for testing

/**
 * Creates default performance metrics for mock skills
 * @returns {Record<string, unknown>} Default performance configuration
 */
function createDefaultPerformance(): Record<string, unknown> {
  return {
    executionTime: { min: 0.1, max: 1.0 },
    resourceUsage: { memory: 'low', cpu: 'low' },
    reliability: 0.95,
    scalability: 'low'
  };
}

/**
 * Creates default compatibility configuration for mock skills
 * @returns {Array<Record<string, unknown>>} Default compatibility configuration
 */
function createDefaultCompatibility(): Array<Record<string, unknown>> {
  return [
    { agentRole: 'FrontendDev', level: 'full', restrictions: [] },
    { agentRole: 'BackendDev', level: 'full', restrictions: [] }
  ];
}

/**
 * Creates default capabilities for mock skills
 * @returns {Array<Record<string, unknown>>} Default capability configuration
 */
function createDefaultCapabilities(): Array<Record<string, unknown>> {
  return [
    {
      id: 'test-action',
      name: 'Test Action',
      type: 'action',
      description: 'Test action capability',
      implementation: {
        approach: 'mock',
        tools: [],
        parameters: {}
      }
    }
  ];
}

/**
 * Creates default metadata for mock skills
 * @returns {Record<string, unknown>} Default metadata configuration
 */
function createDefaultMetadata(): Record<string, unknown> {
  return {
    author: 'Test Suite',
    tags: ['test', 'mock'],
    examples: []
  };
}

/**
 * Creates a mock skill for testing purposes
 * @param {Partial<Record<string, unknown>>} overrides - Partial skill definition to override default values
 * @returns {Record<string, unknown>} A complete mock skill definition
 */
export function createMockSkill(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  const defaults = {
    id: 'test-skill-1',
    name: 'Test Skill',
    description: 'A test skill for unit testing',
    version: '1.0.0',
    domain: 'Testing',
    category: 'Test Utilities',
    complexity: 'simple',
    performance: createDefaultPerformance(),
    compatibility: createDefaultCompatibility(),
    capabilities: createDefaultCapabilities(),
    prerequisites: [],
    dependencies: [],
    metadata: createDefaultMetadata()
  };

  return { ...defaults, ...overrides };
}
