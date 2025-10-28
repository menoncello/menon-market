/**
 * Test Data Factory for DirectoryStructureGenerator Tests
 * Provides factory functions for creating test data with realistic values
 */

import { faker } from '@faker-js/faker';
import type { AgentRole, AgentDefinition } from '@menon-market/core';

/**
 * Factory function to create AgentDefinition with overrides
 * @param overrides - Partial agent definition to override defaults
 * @returns Complete AgentDefinition with realistic test data
 */
export const createAgentDefinition = (overrides: Partial<AgentDefinition> = {}): AgentDefinition => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  description: faker.lorem.sentence(),
  role: 'FrontendDev',
  configuration: {
    model: 'claude-3-sonnet',
    temperature: 0.7,
    maxTokens: 4000,
    performance: {
      timeout: 30000,
      maxRetries: 3,
    },
  },
  metadata: {
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    version: '1.0.0',
    author: 'Test Suite',
    tags: ['test'],
    dependencies: [],
  },
  ...overrides,
});

/**
 * Factory function to create AgentDefinition for specific role
 * @param role - The agent role to create definition for
 * @param overrides - Additional overrides for the agent definition
 * @returns AgentDefinition configured for the specified role
 */
export const createAgentDefinitionForRole = (
  role: AgentRole,
  overrides: Partial<AgentDefinition> = {}
): AgentDefinition =>
  createAgentDefinition({
    role,
    id: `${role.toLowerCase()}-${faker.string.alphanumeric({ length: 8 })}`,
    name: `${role} Test Agent`,
    description: `Test agent for ${role} specialization`,
    metadata: {
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      version: '1.0.0',
      author: 'Test Suite',
      tags: ['test', role.toLowerCase()],
      dependencies: [],
    },
    ...overrides,
  });

/**
 * Factory function to create multiple AgentDefinitions
 * @param roles - Array of agent roles to create definitions for
 * @param overridesFactory - Optional function to provide role-specific overrides
 * @returns Array of AgentDefinitions for specified roles
 */
export const createMultipleAgentDefinitions = (
  roles: AgentRole[],
  overridesFactory?: (role: AgentRole) => Partial<AgentDefinition>
): AgentDefinition[] =>
  roles.map((role) =>
    createAgentDefinitionForRole(role, overridesFactory?.(role))
  );

/**
 * Factory function to create performance configuration
 * @param overrides - Performance configuration overrides
 * @returns Performance configuration with realistic values
 */
export const createPerformanceConfig = (overrides: Partial<AgentDefinition['configuration']['performance']> = {}) => ({
  timeout: faker.number.int({ min: 10000, max: 60000 }),
  maxRetries: faker.number.int({ min: 1, max: 5 }),
  ...overrides,
});

/**
 * Factory function to create agent metadata
 * @param overrides - Metadata overrides
 * @returns Agent metadata with realistic values
 */
export const createAgentMetadata = (overrides: Partial<AgentDefinition['metadata']> = {}) => ({
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  version: faker.system.semver(),
  author: faker.person.fullName(),
  tags: faker.helpers.arrayElements(['test', 'development', 'production', 'experimental'], { min: 1, max: 3 }),
  dependencies: faker.helpers.arrayElements(['@menon-market/core', '@modelcontextprotocol/sdk'], { min: 0, max: 2 }),
  ...overrides,
});