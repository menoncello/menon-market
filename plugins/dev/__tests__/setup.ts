/**
 * Test Setup
 *
 * Global test configuration and mocks
 */

// Global test timeout
test.setTimeout(30000); // 30 seconds

// Configure Bun test environment
// Add any global test utilities or mocks here

// Mock console methods to reduce noise during tests
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
};

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  console.info = jest.fn();
});

afterAll(() => {
  // Restore console methods
  Object.assign(console, originalConsole);
});

// Add custom matchers if needed
expect.extend({
  // Custom matcher for checking if code contains specific patterns
  toContainPattern(received: string, pattern: string | RegExp) {
    const pass = new RegExp(pattern).test(received);
    return {
      pass,
      message: () => `expected ${received} ${pass ? "not " : ""}to contain pattern ${pattern}`,
    };
  },

  // Custom matcher for checking if a function exists in code
  toContainFunction(received: string, functionName: string) {
    const functionPattern = new RegExp(
      `(?:function\\s+${functionName}|const\\s+${functionName}\\s*=)`
    );
    const pass = functionPattern.test(received);
    return {
      pass,
      message: () =>
        `expected ${received} ${pass ? "not " : ""}to contain function ${functionName}`,
    };
  },
});

// Global test utilities
export const testUtils = {
  createTempFile: (content: string, suffix: string = ".ts"): string => {
    // In a real implementation, this would create temporary files
    return `/tmp/test-${Date.now()}${suffix}`;
  },

  createMockMetrics: (overrides = {}) => ({
    functions: [],
    totalLines: 0,
    violations: [],
    score: 100,
    ...overrides,
  }),

  createMockValidation: (overrides = {}) => ({
    valid: true,
    violations: [],
    suggestions: [],
    score: 100,
    ...overrides,
  }),
};
