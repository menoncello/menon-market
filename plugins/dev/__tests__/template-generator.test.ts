/**
 * Template Generator Tests
 *
 * Tests for the Handlebars-based template generation system
 */

import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import {
  generateTemplate,
  parseParams,
  generateOutputPath,
  type TemplateOptions,
} from "../scripts/template-generator";

describe("Template Generator", () => {
  describe("parseParams", () => {
    test("should parse empty parameters", () => {
      const result = parseParams(undefined);
      expect(result).toEqual([]);
    });

    test("should parse single parameter", () => {
      const result = parseParams("name:string");
      expect(result).toEqual([{ name: "name", type: "string", docs: "name" }]);
    });

    test("should parse multiple parameters", () => {
      const result = parseParams("userId:string,userData:object,enabled:boolean");
      expect(result).toEqual([
        { name: "userId", type: "string", docs: "user id" },
        { name: "userData", type: "object", docs: "user data" },
        { name: "enabled", type: "boolean", docs: "enabled" },
      ]);
    });

    test("should handle parameter without type", () => {
      const result = parseParams("simpleParam");
      expect(result).toEqual([{ name: "simpleParam", type: "unknown", docs: "simple param" }]);
    });

    test("should handle complex type names", () => {
      const result = parseParams("data:UserData[],callback:Function");
      expect(result).toEqual([
        { name: "data", type: "UserData[]", docs: "data" },
        { name: "callback", type: "Function", docs: "callback" },
      ]);
    });
  });

  describe("generateOutputPath", () => {
    test("should use custom output when provided", () => {
      const options = {
        template: "ai-function",
        name: "testFunction",
        output: "/custom/path/function.ts",
      } as TemplateOptions;

      const result = generateOutputPath("ai-function", options);
      expect(result).toBe("/custom/path/function.ts");
    });

    test("should generate default path for ai-function", () => {
      const options = {
        template: "ai-function",
        name: "createUser",
      } as TemplateOptions;

      const result = generateOutputPath("ai-function", options);
      expect(result).toBe("createUser.ts");
    });

    test("should generate default path for bun-server", () => {
      const options = {
        template: "bun-server",
        name: "api",
      } as TemplateOptions;

      const result = generateOutputPath("bun-server", options);
      expect(result).toBe("api-server.ts");
    });

    test("should use template name when no name provided", () => {
      const options = {
        template: "test-suite",
      } as TemplateOptions;

      const result = generateOutputPath("test-suite", options);
      expect(result).toBe("test-suite.test.ts");
    });
  });

  describe("generateTemplate", () => {
    beforeAll(() => {
      // Ensure templates exist for testing
      console.log("Setting up template generation tests...");
    });

    test("should generate AI function template", async () => {
      const options: TemplateOptions = {
        template: "ai-function",
        name: "processUserData",
        params: "userId:string,userData:object",
        returnType: "UserResult",
      };

      const result = await generateTemplate("ai-function", options);

      expect(result).toContain("processUserData");
      expect(result).toContain("userId: string");
      expect(result).toContain("userData: object");
      expect(result).toContain("UserResult");
      expect(result).toContain("AI-Safe Function Template");
      expect(result).toContain("Early validation");
    });

    test("should generate AI function with no parameters", async () => {
      const options: TemplateOptions = {
        template: "ai-function",
        name: "healthCheck",
        returnType: "HealthStatus",
      };

      const result = await generateTemplate("ai-function", options);

      expect(result).toContain("healthCheck");
      expect(result).toContain("HealthStatus");
      expect(result).toContain("performHealthCheck()");
    });

    test("should handle function with complex parameters", async () => {
      const options: TemplateOptions = {
        template: "ai-function",
        name: "complexHandler",
        params: "data:UserData[],options:ProcessingOptions,callback:Function",
        returnType: "ProcessedData",
      };

      const result = await generateTemplate("ai-function", options);

      expect(result).toContain("data: UserData[]");
      expect(result).toContain("options: ProcessingOptions");
      expect(result).toContain("callback: Function");
      expect(result).toContain("ProcessedData");
    });

    test("should generate test suite template", async () => {
      const options: TemplateOptions = {
        template: "test-suite",
        component: "UserService",
        withMocks: true,
      };

      const result = await generateTemplate("test-suite", options);

      expect(result).toContain('describe("UserService"');
      expect(result).toContain("beforeAll");
      expect(result).toContain("afterAll");
      expect(result).toContain("mockDatabase");
      expect(result).toContain('test("should');
    });

    test("should generate test suite without mocks", async () => {
      const options: TemplateOptions = {
        template: "test-suite",
        component: "SimpleService",
        withMocks: false,
      };

      const result = await generateTemplate("test-suite", options);

      expect(result).toContain('describe("SimpleService"');
      // Should not contain mock-specific content
      expect(result).not.toContain("mockDatabase");
    });

    test("should include current date in generated templates", async () => {
      const options: TemplateOptions = {
        template: "ai-function",
        name: "testFunction",
      };

      const result = await generateTemplate("ai-function", options);
      const currentDate = new Date().toISOString().split("T")[0];

      expect(result).toContain(currentDate);
    });

    test("should reject invalid template names", async () => {
      const options: TemplateOptions = {
        template: "invalid-template",
        name: "testFunction",
      };

      await expect(generateTemplate("invalid-template", options)).rejects.toThrow();
    });

    test("should generate unique IDs in templates", async () => {
      const options1: TemplateOptions = {
        template: "ai-function",
        name: "function1",
      };

      const options2: TemplateOptions = {
        template: "ai-function",
        name: "function2",
      };

      const result1 = await generateTemplate("ai-function", options1);
      const result2 = await generateTemplate("ai-function", options2);

      // Results should be different due to unique IDs
      expect(result1).not.toBe(result2);

      // Both should contain IDs but they should be different
      const id1Match = result1.match(/id:\s*['"]([^'"]+)['"]/);
      const id2Match = result2.match(/id:\s*['"]([^'"]+)['"]/);

      if (id1Match && id2Match) {
        expect(id1Match[1]).not.toBe(id2Match[1]);
      }
    });
  });

  describe("Template Content Validation", () => {
    test("AI function should include ESLint rule comments", async () => {
      const options: TemplateOptions = {
        template: "ai-function",
        name: "testFunction",
      };

      const result = await generateTemplate("ai-function", options);

      expect(result).toContain("@typescript-eslint/no-explicit-any");
      expect(result).toContain("max-lines-per-function");
      expect(result).toContain("complexity");
    });

    test("AI function should include early validation pattern", async () => {
      const options: TemplateOptions = {
        template: "ai-function",
        name: "validateUser",
        params: "userId:string",
      };

      const result = await generateTemplate("ai-function", options);

      expect(result).toContain("Early validation");
      expect(result).toContain("if (!userId");
      expect(result).toContain("return { success: false");
    });

    test("AI function should include error handling pattern", async () => {
      const options: TemplateOptions = {
        template: "ai-function",
        name: "processData",
      };

      const result = await generateTemplate("ai-function", options);

      expect(result).toContain("try {");
      expect(result).toContain("} catch (error) {");
      expect(result).toContain("getErrorCode(error)");
    });

    test("Test suite should include proper test structure", async () => {
      const options: TemplateOptions = {
        template: "test-suite",
        component: "TestComponent",
      };

      const result = await generateTemplate("test-suite", options);

      expect(result).toContain('describe("TestComponent"');
      expect(result).toContain('test("should');
      expect(result).toContain("expect(");
      expect(result).toContain("afterAll");
      expect(result).toContain("beforeEach");
    });
  });
});
