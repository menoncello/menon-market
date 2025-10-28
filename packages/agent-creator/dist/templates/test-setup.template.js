/**
 * Test setup template for agent directories
 */
function generateTestImports() {
    return `/**
 * Test setup configuration
 * Configures test environment and global test utilities
 */

import { beforeEach, afterEach, describe, it, expect } from 'bun:test';`;
}
function generateTestHooks() {
    return `// Global test configuration
beforeEach(() => {
  // Setup before each test
  console.log('Setting up test environment...');
});

afterEach(() => {
  // Cleanup after each test
  console.log('Cleaning up test environment...');
});`;
}
function generateMockAgent() {
    return `/**
   * Create a mock agent instance for testing
   */
  createMockAgent: () => ({
    id: 'test-agent-id',
    name: 'Test Agent',
    version: '1.0.0',
    initialize: async () => Promise.resolve(),
    getInfo: () => ({
      id: 'test-agent-id',
      name: 'Test Agent',
      version: '1.0.0',
      type: 'Test',
      specializations: [],
      coreSkills: [],
    }),
  }),`;
}
function generateTempDirUtils() {
    return `/**
   * Create a temporary directory for testing
   */
  createTempDir: async () => {
    const tempDir = \`./temp/test-\${Date.now()}\`;
    await Bun.safely.mkdir(tempDir, { recursive: true });
    return tempDir;
  },

  /**
   * Clean up temporary directory
   */
  cleanupTempDir: async (dir: string) => {
    await Bun.safely.remove(dir);
  },

  /**
   * Wait for a specified amount of time
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),`;
}
function generateTestUtils() {
    return `// Export test utilities for use in test files
export const testUtils = {
  ${generateMockAgent()}
  ${generateTempDirUtils()}
};`;
}
function generateAgentValidator() {
    return `// Global test expectations
expect.extend({
  /**
   * Check if value is a valid agent object
   */
  toBeValidAgent(received: unknown) {
    if (!received || typeof received !== 'object') {
      return {
        message: () => 'Expected value to be an object',
        pass: false,
      };
    }

    const agent = received as Record<string, unknown>;
    const required = ['id', 'name', 'version'];
    const missing = required.filter(prop => !(prop in agent));

    if (missing.length > 0) {
      return {
        message: () => \`Agent is missing required properties: \${missing.join(', ')}\`,
        pass: false,
      };
    }

    return {
      message: () => 'Expected value to be a valid agent',
      pass: true,
    };
  },
});`;
}
function generateTypeDeclarations() {
    return `// Type augmentation for custom matchers
declare module 'bun:test' {
  interface Matchers<T> {
    toBeValidAgent(): T;
  }
}`;
}
export function generateTestSetupTemplate() {
    return `${generateTestImports()}

${generateTestHooks()}

${generateTestUtils()}

${generateAgentValidator()}

${generateTypeDeclarations()}
`;
}
//# sourceMappingURL=test-setup.template.js.map