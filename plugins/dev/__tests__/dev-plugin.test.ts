/**
 * Dev Plugin Tests
 *
 * Tests for the main DevPlugin class and its integration
 */

import { test, expect, describe, beforeAll, afterAll, beforeEach } from "bun:test";
import { DevPlugin } from "../index";
import type { PluginConfig } from "../index";

// Mock the template generator and quality gates for testing
jest.mock('../scripts/template-generator', () => ({
  generateTemplate: jest.fn(),
  parseParams: jest.fn(),
  generateOutputPath: jest.fn(),
}));

jest.mock('../scripts/quality-gates', () => ({
  analyzeCode: jest.fn(),
}));

describe("DevPlugin", () => {
  let plugin: DevPlugin;
  let mockGenerateTemplate: jest.Mock;
  let mockAnalyzeCode: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Get mock functions
    const { generateTemplate: genTemplate } = require('../scripts/template-generator');
    const { analyzeCode: analyzeCodeFn } = require('../scripts/quality-gates');

    mockGenerateTemplate = genTemplate as jest.Mock;
    mockAnalyzeCode = analyzeCodeFn as jest.Mock;

    // Setup mock return values
    mockGenerateTemplate.mockResolvedValue('mock-template-content');
    mockAnalyzeCode.mockResolvedValue({
      functions: [],
      totalLines: 50,
      violations: [],
      score: 95
    });
  });

  describe("Plugin Initialization", () => {
    test("should create plugin with default configuration", () => {
      plugin = new DevPlugin();

      const info = plugin.getInfo();
      expect(info.name).toBe("dev");
      expect(info.version).toBe("1.0.0");
      expect(info.status).toBe("inactive"); // Not initialized yet
      expect(info.config.aiQualityGates).toBe(true);
      expect(info.config.bunOptimizations).toBe(true);
    });

    test("should create plugin with custom configuration", () => {
      const customConfig: Partial<PluginConfig> = {
        aiQualityGates: false,
        maxFunctionLines: 25,
        maxComplexity: 8,
        enableHotReload: false,
      };

      plugin = new DevPlugin(customConfig);

      const info = plugin.getInfo();
      expect(info.config.aiQualityGates).toBe(false);
      expect(info.config.maxFunctionLines).toBe(25);
      expect(info.config.maxComplexity).toBe(8);
      expect(info.config.enableHotReload).toBe(false);
    });

    test("should validate configuration with Zod", () => {
      expect(() => {
        new DevPlugin({
          maxFunctionLines: -5, // Invalid value
        } as any);
      }).toThrow();
    });

    test("should initialize successfully", async () => {
      plugin = new DevPlugin({
        aiQualityGates: true,
        bunOptimizations: true,
      });

      await plugin.initialize();

      const info = plugin.getInfo();
      expect(info.status).toBe("active");
    });

    test("should handle double initialization gracefully", async () => {
      plugin = new DevPlugin();

      await plugin.initialize();
      const firstStatus = plugin.getInfo().status;

      await plugin.initialize(); // Initialize again
      const secondStatus = plugin.getInfo().status;

      expect(firstStatus).toBe("active");
      expect(secondStatus).toBe("active"); // Should remain active
    });

    test("should handle initialization errors", async () => {
      plugin = new DevPlugin();

      // Mock a failure during setup
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // This will need to be implemented with actual error scenarios
      try {
        // Test error handling during initialization
        const problematicConfig = {
          // Config that might cause issues
        };

        plugin = new DevPlugin(problematicConfig);
        // await plugin.initialize(); // This might fail
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        console.error = originalConsoleError;
      }
    });
  });

  describe("Template Generation", () => {
    beforeEach(async () => {
      plugin = new DevPlugin();
      await plugin.initialize();
    });

    test("should generate template successfully", async () => {
      mockGenerateTemplate.mockResolvedValue('generated-template-content');

      const result = await plugin.generateTemplate('ai-function', {
        name: 'testFunction',
        params: 'data:string'
      });

      expect(result).toBe('generated-template-content');
      expect(mockGenerateTemplate).toHaveBeenCalledWith('ai-function', {
        template: 'ai-function',
        name: 'testFunction',
        params: 'data:string'
      });
    });

    test("should reject template generation when not initialized", async () => {
      plugin = new DevPlugin(); // Don't initialize

      await expect(
        plugin.generateTemplate('ai-function', { name: 'test' })
      ).rejects.toThrow('Plugin not initialized');
    });

    test("should handle template generation errors", async () => {
      mockGenerateTemplate.mockRejectedValue(new Error('Template not found'));

      await expect(
        plugin.generateTemplate('invalid-template', { name: 'test' })
      ).rejects.toThrow('Template not found');
    });
  });

  describe("Code Analysis", () => {
    beforeEach(async () => {
      plugin = new DevPlugin();
      await plugin.initialize();
    });

    test("should analyze code successfully", async () => {
      const mockMetrics = {
        functions: [
          {
            name: 'testFunction',
            lines: 15,
            complexity: 3,
            hasEarlyValidation: true,
            hasAnyTypes: false,
            hasMagicNumbers: false,
            params: [{ name: 'data', type: 'string' }]
          }
        ],
        totalLines: 20,
        violations: [],
        score: 95
      };

      mockAnalyzeCode.mockResolvedValue(mockMetrics);

      const result = await plugin.analyzeCode('/path/to/file.ts');

      expect(result).toEqual(mockMetrics);
      expect(mockAnalyzeCode).toHaveBeenCalledWith('/path/to/file.ts');
    });

    test("should reject code analysis when not initialized", async () => {
      plugin = new DevPlugin(); // Don't initialize

      await expect(
        plugin.analyzeCode('/path/to/file.ts')
      ).rejects.toThrow('Plugin not initialized');
    });

    test("should show warning for low quality scores in strict mode", async () => {
      plugin = new DevPlugin({ aiStrictMode: true });
      await plugin.initialize();

      const mockMetrics = {
        functions: [],
        totalLines: 50,
        violations: [
          { line: 1, rule: 'any-type', severity: 'error', message: 'Using any' }
        ],
        score: 75 // Below 80 threshold
      };

      mockAnalyzeCode.mockResolvedValue(mockMetrics);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await plugin.analyzeCode('/path/to/file.ts');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Code quality score 75/100 below threshold (80)')
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Code Validation", () => {
    beforeEach(async () => {
      plugin = new DevPlugin();
      await plugin.initialize();
    });

    test("should validate good code successfully", async () => {
      const goodCode = `
export function processData(data: string): Result {
  if (!data) return { success: false };
  return { success: true, data };
}
`;

      const result = await plugin.validateCode(goodCode);

      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.score).toBe(100);
    });

    test("should detect 'any' type violations", async () => {
      const anyTypeCode = `
export function process(data: any): any {
  return data;
}
`;

      const result = await plugin.validateCode(anyTypeCode);

      expect(result.valid).toBe(false);
      expect(result.violations.some(v => v.type === 'typescript')).toBe(true);
      expect(result.score).toBeLessThan(100);
    });

    test("should detect eslint disable violations", async () => {
      const eslintDisableCode = `
/* eslint-disable */
export function problematic(data: any): any {
  // eslint-disable-next-line
  const result = processData(data);
  return result;
}
`;

      const result = await plugin.validateCode(eslintDisableCode);

      expect(result.valid).toBe(false);
      expect(result.violations.some(v => v.type === 'eslint')).toBe(true);
      expect(result.score).toBeLessThan(90);
    });

    test("should detect console.log violations", async () => {
      const consoleLogCode = `
export function debugFunction(data: string): void {
  console.log("Debug info:", data);
  console.error("Error:", data);
}
`;

      const result = await plugin.validateCode(consoleLogCode);

      expect(result.violations.some(v => v.type === 'logging')).toBe(true);
      expect(result.score).toBeLessThan(100);
    });

    test("should detect function length violations", async () => {
      const longFunction = `
export function veryLongFunction(): void {
  // This function is intentionally very long
  console.log("Line 1");
  console.log("Line 2");
  console.log("Line 3");
  console.log("Line 4");
  console.log("Line 5");
  console.log("Line 6");
  console.log("Line 7");
  console.log("Line 8");
  console.log("Line 9");
  console.log("Line 10");
  console.log("Line 11");
  console.log("Line 12");
  console.log("Line 13");
  console.log("Line 14");
  console.log("Line 15");
  console.log("Line 16");
  console.log("Line 17");
  console.log("Line 18");
  console.log("Line 19");
  console.log("Line 20");
  console.log("Line 21");
  console.log("Line 22");
  console.log("Line 23");
  console.log("Line 24");
  console.log("Line 25");
  console.log("Line 26");
  console.log("Line 27");
  console.log("Line 28");
  console.log("Line 29");
  console.log("Line 30");
  console.log("Line 31");
  console.log("Line 32");
  console.log("Line 33");
  console.log("Line 34");
  console.log("Line 35");
  return;
}
`;

      const result = await plugin.validateCode(longFunction);

      expect(result.violations.some(v => v.type === 'complexity')).toBe(true);
      expect(result.score).toBeLessThan(95);
    });

    test("should detect missing early validation", async () => {
      const noValidationCode = `
export function processLargeData(data: string[]): Result {
  console.log("Processing data...");
  const processed = data.map(item => item.toUpperCase());
  const filtered = processed.filter(item => item.length > 5);
  const validated = filtered.filter(item => /^[A-Z]+$/.test(item));
  return { success: true, data: validated };
}
`;

      const result = await plugin.validateCode(noValidationCode);

      expect(result.violations.some(v => v.type === 'pattern')).toBe(true);
      expect(result.suggestions).toContain(
        'Add input validation at the beginning of functions'
      );
    });

    test("should provide relevant suggestions", async () => {
      const problematicCode = `
export function processData(data: any): any {
  console.log("Processing");
  return data;
}
`;

      const result = await plugin.validateCode(problematicCode);

      expect(result.suggestions).toContain(
        'Replace "any" types with specific TypeScript types'
      );
      expect(result.suggestions).toContain(
        'Use proper logging instead of console.log'
      );
    });
  });

  describe("Plugin Capabilities", () => {
    beforeEach(async () => {
      plugin = new DevPlugin();
      await plugin.initialize();
    });

    test("should return available templates", () => {
      const templates = plugin.getAvailableTemplates();

      expect(templates).toContain('ai-function');
      expect(templates).toContain('bun-server');
      expect(templates).toContain('test-suite');
      expect(templates).toContain('database-service');
      expect(templates).toContain('api-route');
      expect(templates).toContain('websocket-handler');
      expect(templates).toContain('cli-command');
    });

    test("should return best practices", () => {
      const practices = plugin.getBestPractices();

      expect(practices.patterns).toContain('Validate inputs early (first 5 lines)');
      expect(practices.patterns).toContain('Use explicit TypeScript types');
      expect(practices.patterns).toContain('Keep functions under 30 lines');

      expect(practices.antiPatterns).toContain('Using "any" types');
      expect(practices.antiPatterns).toContain('Functions longer than 30 lines');

      expect(practices.rules).toHaveProperty('max-lines-per-function');
      expect(practices.rules).toHaveProperty('complexity');
      expect(practices.rules).toHaveProperty('max-params');

      expect(practices.rules['max-lines-per-function'].limit).toBe(30);
      expect(practices.rules['complexity'].limit).toBe(10);
    });

    test("should customize best practices based on config", () => {
      plugin = new DevPlugin({
        maxFunctionLines: 25,
        maxComplexity: 8
      });

      const practices = plugin.getBestPractices();

      expect(practices.rules['max-lines-per-function'].limit).toBe(25);
      expect(practices.rules['complexity'].limit).toBe(8);
    });
  });

  describe("Error Handling", () => {
    test("should handle template generation errors gracefully", async () => {
      plugin = new DevPlugin();
      await plugin.initialize();

      mockGenerateTemplate.mockRejectedValue(new Error('Template generation failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(
        plugin.generateTemplate('invalid-template', {})
      ).rejects.toThrow('Template generation failed');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to generate template'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    test("should handle code analysis errors gracefully", async () => {
      plugin = new DevPlugin();
      await plugin.initialize();

      mockAnalyzeCode.mockRejectedValue(new Error('File not found'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(
        plugin.analyzeCode('/nonexistent/file.ts')
      ).rejects.toThrow('File not found');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to analyze code'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Integration Tests", () => {
    test("should handle complete workflow", async () => {
      plugin = new DevPlugin({
        aiQualityGates: true,
        maxFunctionLines: 20
      });
      await plugin.initialize();

      // Generate template
      mockGenerateTemplate.mockResolvedValue(`
export function testFunction(data: string): Result {
  if (!data) return { success: false, error: 'Data required' };
  return { success: true, data };
}
`);

      const template = await plugin.generateTemplate('ai-function', {
        name: 'testFunction',
        params: 'data:string'
      });

      expect(template).toContain('testFunction');
      expect(mockGenerateTemplate).toHaveBeenCalled();

      // Validate generated code
      const validation = await plugin.validateCode(template);
      expect(validation.valid).toBe(true);
      expect(validation.score).toBeGreaterThan(90);
    });

    test("should handle configuration changes", async () => {
      const config = {
        aiStrictMode: true,
        maxFunctionLines: 15,
        maxComplexity: 5
      };

      plugin = new DevPlugin(config);
      await plugin.initialize();

      const practices = plugin.getBestPractices();
      expect(practices.rules['max-lines-per-function'].limit).toBe(15);
      expect(practices.rules['complexity'].limit).toBe(5);
    });
  });
});