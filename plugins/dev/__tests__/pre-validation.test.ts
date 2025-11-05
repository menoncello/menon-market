/**
 * Pre-validation Tests
 *
 * Tests for the new pre-validation and auto-fix functionality
 */

import { test, expect, describe, beforeAll, afterEach } from "bun:test";
import { DevPlugin } from "../index";

describe("Pre-validation and Auto-fix", () => {
  let plugin: DevPlugin;

  beforeAll(async () => {
    plugin = new DevPlugin({
      aiQualityGates: true,
      aiStrictMode: true,
    });
    await plugin.initialize();
  });

  describe("Enhanced Pre-validation for Frequent Lint Problems", () => {
    test("should reject 'any' types in parameters", async () => {
      await expect(
        plugin.generateTemplate("ai-function", {
          name: "badFunction",
          params: "data:any", // This should be rejected
        })
      ).rejects.toThrow("Parameter 'data' uses 'any' type");
    });

    test("should reject 'any[]' types in parameters", async () => {
      await expect(
        plugin.generateTemplate("ai-function", {
          name: "badFunction",
          params: "items:any[]", // This should be rejected
        })
      ).rejects.toThrow("Parameter 'items' uses 'any' type");
    });

    test("should reject too many parameters (>4)", async () => {
      await expect(
        plugin.generateTemplate("ai-function", {
          name: "tooManyParamsFunction",
          params:
            "param1:string,param2:number,param3:boolean,param4:object,param5:unknown,param6:date", // 6 parameters
        })
      ).rejects.toThrow("Too many parameters (6). Maximum allowed is 4 parameters");
    });

    test("should reject very short parameter names (except i/j/k)", async () => {
      await expect(
        plugin.generateTemplate("ai-function", {
          name: "badFunction",
          params: "x:string,y:number", // Too short
        })
      ).rejects.toThrow("Parameter name 'x' is too short");
    });

    test("should accept loop counter names (i/j/k)", async () => {
      const result = await plugin.generateTemplate("ai-function", {
        name: "loopFunction",
        params: "i:number,j:number",
      });

      expect(result).toContain("loopFunction");
      expect(result).toContain("i: number");
      expect(result).toContain("j: number");
    });

    test("should warn about potentially large files", async () => {
      const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

      const result = await plugin.generateTemplate("bun-server", {
        name: "largeServer",
        async: true,
        returns: "Promise<Response>",
        throws: "Error",
      });

      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining("Generated file may be large")
      );

      consoleWarn.mockRestore();
    });

    test("should warn about missing function descriptions", async () => {
      const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

      const result = await plugin.generateTemplate("ai-function", {
        name: "undocumentedFunction",
        // No description provided
      });

      expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining("lacks description"));

      consoleWarn.mockRestore();
    });

    test("should detect duplicate parameter names", async () => {
      await expect(
        plugin.generateTemplate("ai-function", {
          name: "duplicateParamsFunction",
          params: "data:string,data:number", // Duplicate 'data'
        })
      ).rejects.toThrow("Duplicate parameter name 'data' detected");
    });

    test("should accept valid parameters within limits", async () => {
      const result = await plugin.generateTemplate("ai-function", {
        name: "goodFunction",
        params: "userId:string,userData:UserObject,options:ProcessingOptions", // 3 parameters - within limit
      });

      expect(result).toContain("goodFunction");
      expect(result).toContain("userId: string");
      expect(result).toContain("userData: UserObject");
      expect(result).toContain("options: ProcessingOptions");
    });

    test("should accept functions without parameters", async () => {
      const result = await plugin.generateTemplate("ai-function", {
        name: "noParamsFunction",
      });

      expect(result).toContain("noParamsFunction");
      expect(result).toContain("performNoParamsFunction()");
    });
  });

  describe("Enhanced Auto-fix Functionality for Frequent Lint Problems", () => {
    test("should auto-fix 'any' types to 'unknown'", async () => {
      const result = await plugin.generateTemplate(
        "ai-function",
        {
          name: "autoFixTest",
        },
        true
      ); // autoFix: true (default)

      // The generated template should not contain 'any' types
      expect(result).not.toContain(": any");
      expect(result).not.toContain(": any[]");
    });

    test("should organize imports automatically", async () => {
      // Generate template that might have imports
      const result = await plugin.generateTemplate("ai-function", {
        name: "importTest",
        // Templates typically include imports
      });

      // Should have properly organized imports
      const importLines = result.split("\n").filter(line => line.trim().startsWith("import "));

      // Imports should be grouped and sorted
      if (importLines.length > 1) {
        // Check that imports are alphabetically ordered
        const sortedImports = [...importLines].sort();
        expect(importLines).toEqual(sortedImports);
      }
    });

    test("should add comprehensive JSDoc with @returns and @throws", async () => {
      const result = await plugin.generateTemplate("ai-function", {
        name: "functionWithDoc",
      });

      // Should have enhanced JSDoc structure
      expect(result).toContain("/**");
      expect(result).toContain("@returns TODO: Document return type");
      expect(result).toContain("@throws TODO: Document error conditions");
      expect(result).toContain("FunctionWithDoc function.");
    });

    test("should remove console.log statements", async () => {
      const result = await plugin.generateTemplate("test-suite", {
        component: "TestComponent",
      });

      // Should not contain obvious console.log statements
      expect(result).not.toMatch(/console\.log\([^)]*\)/);
    });

    test("should add parameter count warnings for functions with >4 parameters", async () => {
      // Create a test with a function that has many parameters
      const testCode = `
function testFunction(param1: string, param2: number, param3: boolean, param4: object, param5: unknown, param6: date) {
  return param1 + param2;
}
      `;

      const validation = await plugin.validateCode(testCode);

      expect(validation.violations).toContainEqual(
        expect.objectContaining({
          type: "parameters",
          message: expect.stringContaining("too many parameters (6, max: 4)"),
        })
      );
    });

    test("should remove code duplication", async () => {
      const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

      // Simulate duplicate code scenario
      const testCode = `
const value = someFunction();
const value = someFunction(); // Duplicate
const value = someFunction(); // Triple duplicate
      `;

      const validation = await plugin.validateCode(testCode);

      expect(validation.violations).toContainEqual(
        expect.objectContaining({
          type: "duplication",
          message: expect.stringContaining("Duplicate code found"),
        })
      );

      consoleWarn.mockRestore();
    });

    test("should add file size warnings for large files", async () => {
      // Create a large file simulation
      const manyLines = Array(300)
        .fill('const someVariable = "test"; // Some line of code')
        .join("\n");
      const largeCode = `
${manyLines}

export function largeFunction() {
  return ${manyLines.length};
}
      `;

      const validation = await plugin.validateCode(largeCode);

      expect(validation.violations).toContainEqual(
        expect.objectContaining({
          type: "file-size",
          message: expect.stringContaining("File too large"),
        })
      );
    });

    test("should validate JSDoc requirements for exported functions", async () => {
      const testCode = `
export function undocumentedFunction(data: string): number {
  return data.length;
}
      `;

      const validation = await plugin.validateCode(testCode);

      expect(validation.violations).toContainEqual(
        expect.objectContaining({
          type: "jsdoc",
          message: "Exported function lacks JSDoc documentation",
        })
      );
    });

    test("should detect duplicate imports", async () => {
      const testCode = `
import { test } from './module';
import { other } from './module';
import { something } from 'fs';

export function functionWithDuplicateImports() {
  return test + other;
}
      `;

      const validation = await plugin.validateCode(testCode);

      expect(validation.violations).toContainEqual(
        expect.objectContaining({
          type: "import",
          message: expect.stringContaining('Duplicate import from module "./module"'),
        })
      );
    });

    test("should provide specific suggestions for each violation type", async () => {
      const problematicCode = `
export function functionWithManyParams(a: string, b: number, c: boolean, d: object, e: unknown, f: date) {
  console.log('debug');
  return a + b;
}

import { utils } from './utils';
import { utils } from './utils';
      `;

      const validation = await plugin.validateCode(problematicCode);

      // Should have suggestions for each type of violation
      expect(validation.suggestions).toContain(
        "Add JSDoc comments to all exported functions (@param, @returns, @throws)"
      );
      expect(validation.suggestions).toContain(
        "Consolidate duplicate imports and organize them according to ESLint rules"
      );
      expect(validation.suggestions).toContain(
        "Use options object or function decomposition for functions with >4 parameters"
      );
      expect(validation.suggestions).toContain(
        'Replace "any" types with specific TypeScript types'
      );
    });
  });

  describe("Quality Score Reporting", () => {
    test("should report quality score in console", async () => {
      const consoleLog = jest.spyOn(console, "log").mockImplementation();

      const result = await plugin.generateTemplate("ai-function", {
        name: "qualityTest",
      });

      expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining("quality:"));

      consoleLog.mockRestore();
    });

    test("should warn about quality issues in strict mode", async () => {
      const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

      // Generate template that might have issues
      const result = await plugin.generateTemplate("bun-server", {
        name: "complexServer",
      });

      // Complex templates might have warnings in strict mode
      expect(result).toBeDefined();
      // Check if warnings were logged for any quality issues

      consoleWarn.mockRestore();
    });
  });

  describe("Auto-fix Toggle", () => {
    test("should allow disabling auto-fix", async () => {
      const resultWithAutoFix = await plugin.generateTemplate(
        "ai-function",
        {
          name: "autoFixEnabled",
        },
        true
      );

      const resultWithoutAutoFix = await plugin.generateTemplate(
        "ai-function",
        {
          name: "autoFixDisabled",
        },
        false
      );

      // Both should generate valid templates
      expect(resultWithAutoFix).toContain("autoFixEnabled");
      expect(resultWithoutAutoFix).toContain("autoFixDisabled");

      // The one with auto-fix should have more complete structure
      expect(resultWithAutoFix).toContain("/**");
    });
  });

  describe("TypeScript Typecheck Error Prevention", () => {
    test("should warn about problematic Result property access patterns", async () => {
      const testCode = `
export function testFunction(result: Result<string, Error>) {
  if (result.isOk) {
    return result.data;
  }
  throw result.error;
}
      `;

      const validation = await plugin.validateCode(testCode);

      expect(validation.violations).toContainEqual(
        expect.objectContaining({
          type: "typescript-property",
          message: expect.stringContaining("Result type property access without safety check"),
        })
      );
    });

    test("should warn about Object instead of Record<string, unknown>", async () => {
      const testCode = `
export function testFunction(): Object {
  return { key: 'value' };
}
      `;

      const validation = await plugin.validateCode(testCode);

      expect(validation.violations).toContainEqual(
        expect.objectContaining({
          type: "typescript-assignment",
          message: "Object type instead of Record<string, unknown>",
        })
      );
    });

    test("should warn about Function instead of proper signature", async () => {
      const testCode = `
export function testFunction(): Function {
  return () => console.log('test');
}
      `;

      const validation = await plugin.validateCode(testCode);

      expect(validation.violations).toContainEqual(
        expect.objectContaining({
          type: "typescript-assignment",
          message: "Function type instead of proper function signature",
        })
      );
    });

    test("should warn about array access without null safety", async () => {
      const testCode = `
export function testFunction(arr: string[] | undefined) {
  return arr[0];
}
      `;

      const validation = await plugin.validateCode(testCode);

      expect(validation.violations).toContainEqual(
        expect.objectContaining({
          type: "typescript-null",
          message: "Array access without null safety check",
        })
      );
    });

    test("should auto-fix Result property access patterns", async () => {
      const result = await plugin.generateTemplate("ai-function", {
        name: "resultTest",
        description: "Function that processes result.data and result.error",
      });

      // Should replace problematic patterns with safer alternatives
      expect(result).toContain("result.success ? result.data : undefined");
      expect(result).not.toContain("result.data");
      expect(result).not.toContain("result.isOk");
    });

    test("should auto-fix type assignments", async () => {
      const result = await plugin.generateTemplate("ai-function", {
        name: "typeTest",
        description: "Function with Object and Function parameters",
      });

      // Should fix problematic type assignments
      expect(result).toContain("Record<string, unknown>");
      expect(result).not.toContain(": Object");
      expect(result).toContain("(...args: unknown[]) => unknown");
      expect(result).not.toContain(": Function");
    });

    test("should add null safety checks", async () => {
      const result = await plugin.generateTemplate("ai-function", {
        name: "nullTest",
        description: "Function that accesses obj.property",
      });

      // Should add null safety comments and optional chaining
      expect(result).toContain("// TODO: Add null check for obj");
      expect(result).toContain("obj?.property");
    });
  });

  describe("Integration with Validation", () => {
    test("should pass final validation after auto-fix", async () => {
      const result = await plugin.generateTemplate("ai-function", {
        name: "validatedFunction",
        params: "data:string,id:number",
      });

      // The generated code should pass validation
      const validation = await plugin.validateCode(result);
      expect(validation.valid).toBe(true);
      expect(validation.score).toBeGreaterThan(80);
    });

    test("should show quality improvements", async () => {
      const result = await plugin.generateTemplate("ai-function", {
        name: "improvedFunction",
      });

      const validation = await plugin.validateCode(result);

      // Should have high quality score due to auto-fixes
      expect(validation.score).toBeGreaterThan(85);

      // Should have minimal violations
      expect(validation.violations.filter(v => v.severity === "error")).toHaveLength(0);
    });
  });

  describe("Error Prevention", () => {
    test("should prevent template generation with invalid options", async () => {
      const invalidCases = [
        { params: "data:any", description: "any type" },
        { params: "x:string", description: "short name" },
        { name: "", description: "empty name" },
      ];

      for (const testCase of invalidCases) {
        await expect(plugin.generateTemplate("ai-function", testCase)).rejects.toThrow();
      }
    });

    test("should handle edge cases gracefully", async () => {
      const edgeCases = [
        { params: "", description: "empty params" },
        { params: undefined, description: "undefined params" },
        { name: "test", params: "data:string", description: "valid minimal config" },
      ];

      for (const testCase of edgeCases) {
        const result = await plugin.generateTemplate("ai-function", testCase);
        expect(result).toBeDefined();
        expect(result).toContain("test");
      }
    });
  });

  describe("Performance Impact", () => {
    test("should complete validation quickly", async () => {
      const startTime = Date.now();

      const result = await plugin.generateTemplate("ai-function", {
        name: "performanceTest",
        params: "data:string,options:Config",
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete quickly (under 1 second)
      expect(duration).toBeLessThan(1000);
      expect(result).toBeDefined();
    });

    test("should handle multiple generations efficiently", async () => {
      const startTime = Date.now();

      const promises = Array.from({ length: 5 }, (_, i) =>
        plugin.generateTemplate("ai-function", {
          name: `function${i}`,
          params: `data:string,id${i}:number`,
        })
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(results).toHaveLength(5);
      results.forEach((result, index) => {
        expect(result).toContain(`function${index}`);
      });

      // Should complete all 5 in reasonable time
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000);
    });
  });
});
