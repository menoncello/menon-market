/**
 * Integration Tests
 *
 * Tests for complete workflows and integration between components
 */

import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { DevPlugin } from "../index";

describe("Integration Tests", () => {
  let plugin: DevPlugin;

  beforeAll(async () => {
    // Initialize plugin with development-friendly config
    plugin = new DevPlugin({
      aiQualityGates: true,
      aiStrictMode: false, // Reduce warnings during testing
      maxFunctionLines: 25,
      maxComplexity: 8,
    });

    await plugin.initialize();
  });

  describe("Template Generation to Quality Gates Workflow", () => {
    test("should generate and validate AI function template", async () => {
      // Generate template
      const templateContent = await plugin.generateTemplate("ai-function", {
        name: "processUserData",
        params: "userId:string,userData:object",
        returnType: "UserResult",
      });

      // Template should contain expected elements
      expect(templateContent).toContain("processUserData");
      expect(templateContent).toContain("userId: string");
      expect(templateContent).toContain("userData: object");
      expect(templateContent).toContain("UserResult");

      // Validate generated template
      const validation = await plugin.validateCode(templateContent);
      expect(validation.valid).toBe(true);
      expect(validation.score).toBeGreaterThan(90);
      expect(validation.violations).toHaveLength(0);
    });

    test("should generate and validate test suite template", async () => {
      const templateContent = await plugin.generateTemplate("test-suite", {
        component: "UserService",
        withMocks: true,
      });

      expect(templateContent).toContain('describe("UserService"');
      expect(templateContent).toContain("beforeAll");
      expect(templateContent).toContain("afterAll");
      expect(templateContent).toContain('test("should');

      const validation = await plugin.validateCode(templateContent);
      expect(validation.valid).toBe(true);
      expect(validation.score).toBeGreaterThan(80); // Test files might have some complexity
    });

    test("should generate and validate server template", async () => {
      const templateContent = await plugin.generateTemplate("bun-server", {
        name: "api",
        port: 3000,
        withWebsocket: true,
        withDatabase: true,
      });

      expect(templateContent).toContain("port: 3000");
      expect(templateContent).toContain("websocket:");
      expect(templateContent).toContain("Database");
      expect(templateContent).toContain("Bun.serve");

      const validation = await plugin.validateCode(templateContent);
      expect(validation.valid).toBe(true);
      // Server templates might be complex
      expect(validation.score).toBeGreaterThan(70);
    });
  });

  describe("Quality Gates Integration", () => {
    test("should detect issues in generated code with problems", async () => {
      // Generate intentionally problematic template
      const problematicCode = `
export async function problematicFunction(data: any): any {
  // eslint-disable-next-line
  console.log("Bad practice");
  /* eslint-disable */
  const result = processData(data);
  return result;
}

export function veryLongFunction(): void {
  // Intentionally long function
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

      const validation = await plugin.validateCode(problematicCode);

      expect(validation.valid).toBe(false);
      expect(validation.score).toBeLessThan(70);

      // Should detect specific issues
      expect(validation.violations.some(v => v.type === "typescript")).toBe(true); // any types
      expect(validation.violations.some(v => v.type === "eslint")).toBe(true); // eslint-disable
      expect(validation.violations.some(v => v.type === "logging")).toBe(true); // console.log
      expect(validation.violations.some(v => v.type === "complexity")).toBe(true); // long function

      // Should provide helpful suggestions
      expect(validation.suggestions.length).toBeGreaterThan(0);
      expect(validation.suggestions).toContain(expect.stringContaining("any types"));
    });
  });

  describe("Configuration Integration", () => {
    test("should respect custom configuration in validation", async () => {
      // Create plugin with strict limits
      const strictPlugin = new DevPlugin({
        maxFunctionLines: 10, // Very strict
        maxComplexity: 3, // Very strict
        aiStrictMode: true,
      });

      await strictPlugin.initialize();

      // Generate code that would pass normal limits but fail strict ones
      const mediumComplexityCode = `
export function mediumComplexityFunction(data: string): Result {
  if (!data) return { success: false };
  if (data.length > 10) return { success: false, error: 'Too long' };
  if (data.includes('bad')) return { success: false, error: 'Invalid content' };

  const processed = data.trim();
  const validated = processed.toUpperCase();
  const final = validated.replace(/[^A-Z]/g, '');

  return { success: true, data: final };
}
`;

      const validation = await strictPlugin.validateCode(mediumComplexityCode);

      // Should fail due to strict limits
      expect(validation.score).toBeLessThan(90);
      expect(validation.violations.some(v => v.type === "complexity")).toBe(true);
    });

    test("should handle configuration changes", async () => {
      const initialPractices = plugin.getBestPractices();
      expect(initialPractices.rules["max-lines-per-function"].limit).toBe(25);

      // Re-initialize with different config
      const newPlugin = new DevPlugin({
        maxFunctionLines: 15,
        maxComplexity: 6,
      });

      await newPlugin.initialize();

      const newPractices = newPlugin.getBestPractices();
      expect(newPractices.rules["max-lines-per-function"].limit).toBe(15);
      expect(newPractices.rules["complexity"].limit).toBe(6);
    });
  });

  describe("Template Customization Integration", () => {
    test("should generate templates with various parameter combinations", async () => {
      const testCases = [
        {
          name: "noParams",
          params: undefined,
          expectContains: ["performTestFunction()"],
        },
        {
          name: "singleParam",
          params: "data:string",
          expectContains: ["data: string", "data"],
        },
        {
          name: "multipleParams",
          params: "id:string,name:string,email:string,active:boolean",
          expectContains: ["id: string", "name: string", "email: string", "active: boolean"],
        },
        {
          name: "complexParams",
          params: "data:UserData[],options:ProcessingOptions,callback:Function",
          expectContains: ["data: UserData[]", "options: ProcessingOptions", "callback: Function"],
        },
      ];

      for (const testCase of testCases) {
        const template = await plugin.generateTemplate("ai-function", {
          name: testCase.name,
          params: testCase.params,
        });

        // Verify expected content
        expect(template).toContain(testCase.name);
        testCase.expectContains.forEach(expectedContent => {
          expect(template).toContain(expectedContent);
        });

        // Validate generated template
        const validation = await plugin.validateCode(template);
        expect(validation.valid).toBe(true);
        expect(validation.score).toBeGreaterThan(80);
      }
    });
  });

  describe("Error Handling Integration", () => {
    test("should handle malformed template requests gracefully", async () => {
      // Test with invalid template names
      await expect(plugin.generateTemplate("nonexistent-template", {})).rejects.toThrow();

      // Test with problematic parameters
      await expect(plugin.generateTemplate("", {})).rejects.toThrow();
    });

    test("should handle edge cases in validation", async () => {
      const edgeCases = [
        { code: "", description: "empty string" },
        { code: "   ", description: "whitespace only" },
        { code: "// Just a comment", description: "comment only" },
        { code: "export const CONSTANT = 42;", description: "constant only" },
      ];

      for (const testCase of edgeCases) {
        const validation = await plugin.validateCode(testCase.code);

        // Should handle gracefully without crashing
        expect(validation).toBeDefined();
        expect(typeof validation.valid).toBe("boolean");
        expect(typeof validation.score).toBe("number");
        expect(validation.score).toBeGreaterThanOrEqual(0);
        expect(validation.score).toBeLessThanOrEqual(100);
      }
    });
  });

  describe("Performance Integration", () => {
    test("should handle batch operations efficiently", async () => {
      const startTime = Date.now();

      // Generate multiple templates
      const templates = await Promise.all([
        plugin.generateTemplate("ai-function", { name: "func1", params: "data:string" }),
        plugin.generateTemplate("ai-function", { name: "func2", params: "id:number" }),
        plugin.generateTemplate("ai-function", { name: "func3", params: "config:object" }),
        plugin.generateTemplate("test-suite", { component: "Component1" }),
        plugin.generateTemplate("test-suite", { component: "Component2" }),
      ]);

      const generationTime = Date.now() - startTime;

      // Should complete reasonably quickly (under 5 seconds)
      expect(generationTime).toBeLessThan(5000);
      expect(templates).toHaveLength(5);

      // Validate all templates
      const validationPromises = templates.map(template => plugin.validateCode(template));
      const validations = await Promise.all(validationPromises);

      // All validations should pass
      validations.forEach(validation => {
        expect(validation.valid).toBe(true);
        expect(validation.score).toBeGreaterThan(80);
      });

      const totalTime = Date.now() - startTime;
      // Total time should still be reasonable
      expect(totalTime).toBeLessThan(10000);
    });
  });

  describe("Real-world Scenarios", () => {
    test("should handle complete user registration workflow", async () => {
      // Generate user creation function
      const createUserFunction = await plugin.generateTemplate("ai-function", {
        name: "createUser",
        params: "userData:UserCreateRequest",
        returnType: "UserResponse",
      });

      // Generate user validation function
      const validateUserFunction = await plugin.generateTemplate("ai-function", {
        name: "validateUserData",
        params: "userData:UserCreateRequest",
        returnType: "ValidationResult",
      });

      // Generate test suite for user service
      const userTests = await plugin.generateTemplate("test-suite", {
        component: "UserService",
        withMocks: true,
      });

      // Validate all generated code
      const createUserValidation = await plugin.validateCode(createUserFunction);
      const validateUserValidation = await plugin.validateCode(validateUserFunction);
      const userTestsValidation = await plugin.validateCode(userTests);

      // All should pass validation
      expect(createUserValidation.valid).toBe(true);
      expect(validateUserValidation.valid).toBe(true);
      expect(userTestsValidation.valid).toBe(true);

      // Should have high quality scores
      expect(createUserValidation.score).toBeGreaterThan(85);
      expect(validateUserValidation.score).toBeGreaterThan(85);
      expect(userTestsValidation.score).toBeGreaterThan(75); // Tests might be more complex
    });

    test("should handle API server generation with all features", async () => {
      const serverConfig = {
        name: "userApi",
        port: 8080,
        host: "0.0.0.0",
        withWebsocket: true,
        withDatabase: true,
        withAuth: true,
      };

      const serverCode = await plugin.generateTemplate("bun-server", serverConfig);

      // Verify server includes all requested features
      expect(serverCode).toContain("port: 8080");
      expect(serverCode).toContain('host: "0.0.0.0"');
      expect(serverCode).toContain("websocket:");
      expect(serverCode).toContain("Database");
      expect(serverCode).toContain("authenticateRequest");

      const validation = await plugin.validateCode(serverCode);
      expect(validation.valid).toBe(true);
      expect(validation.score).toBeGreaterThan(70); // Server templates are complex
    });
  });
});
