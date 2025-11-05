/**
 * Quality Gates Tests
 *
 * Tests for the AI code quality analysis system
 */

import { test, expect, describe, beforeAll, afterEach } from "bun:test";
import { analyzeCode, type QualityMetrics } from "../scripts/quality-gates";

describe("Quality Gates", () => {
  // Create temporary test files for testing
  const testFiles: string[] = [];

  afterEach(() => {
    // Clean up test files after each test
    for (const filePath of testFiles) {
      try {
        // Note: In a real implementation, you'd clean up files here
        // For now, we'll just track them
      } catch (error) {
        console.error(`Failed to clean up ${filePath}:`, error);
      }
    }
    testFiles.length = 0; // Clear array
  });

  describe("Code Analysis", () => {
    test("should analyze simple valid function", async () => {
      const validCode = `
export async function processUser(userId: string): Promise<UserResult> {
  if (!userId || userId.trim().length === 0) {
    return { success: false, error: 'User ID required' };
  }

  const user = await findUser(userId);
  return { success: true, data: user };
}
`;

      // Create a mock file path for testing
      const mockFilePath = '/tmp/test-valid-function.ts';

      // Mock the file reading since we can't easily create real files in this environment
      const originalFileRead = global.Bun?.file;
      if (global.Bun) {
        global.Bun.file = (path: string) => ({
          text: () => Promise.resolve(validCode),
        });
      }

      try {
        const metrics = await analyzeCode(mockFilePath);

        expect(metrics).toBeDefined();
        expect(metrics.functions).toHaveLength(1);
        expect(metrics.totalLines).toBeGreaterThan(0);
        expect(metrics.score).toBeGreaterThan(80); // Should be high score

        const func = metrics.functions[0];
        expect(func.name).toBe("processUser");
        expect(func.lines).toBeLessThan(15); // Should be under limit
        expect(func.complexity).toBeLessThan(5); // Should be under limit
        expect(func.hasEarlyValidation).toBe(true);
        expect(func.hasAnyTypes).toBe(false);
        expect(func.params).toHaveLength(1);
        expect(func.params[0].name).toBe("userId");
      } finally {
        // Restore original file read
        if (originalFileRead) {
          global.Bun!.file = originalFileRead;
        }
      }
    });

    test("should detect function with 'any' type", async () => {
      const invalidCode = `
export async function processData(data: any): Promise<any> {
  if (!data) return { success: false };
  return { success: true, data };
}
`;

      const mockFilePath = '/tmp/test-invalid-function.ts';

      const originalFileRead = global.Bun?.file;
      if (global.Bun) {
        global.Bun.file = (path: string) => ({
          text: () => Promise.resolve(invalidCode),
        });
      }

      try {
        const metrics = await analyzeCode(mockFilePath);

        expect(metrics.violations.some(v => v.rule === 'any-type')).toBe(true);
        expect(metrics.score).toBeLessThan(90); // Should be penalized for any types

        const func = metrics.functions[0];
        expect(func.hasAnyTypes).toBe(true);
      } finally {
        if (originalFileRead) {
          global.Bun!.file = originalFileRead;
        }
      }
    });

    test("should detect function without early validation", async () => {
      const noValidationCode = `
export async function complexProcess(data: object, options: Config): Promise<Result> {
  console.log("Processing data");
  const processed = await transformData(data, options);
  const validated = await validateData(processed);
  const result = await saveData(validated);
  return { success: true, data: result };
}
`;

      const mockFilePath = '/tmp/test-no-validation.ts';

      const originalFileRead = global.Bun?.file;
      if (global.Bun) {
        global.Bun.file = (path: string) => ({
          text: () => Promise.resolve(noValidationCode),
        });
      }

      try {
        const metrics = await analyzeCode(mockFilePath);

        const func = metrics.functions[0];
        expect(func.hasEarlyValidation).toBe(false);
        expect(func.lines).toBeGreaterThan(10); // Long function without validation

        // Should have early validation warning
        expect(metrics.violations.some(v => v.rule === 'early-validation')).toBe(true);
      } finally {
        if (originalFileRead) {
          global.Bun!.file = originalFileRead;
        }
      }
    });

    test("should detect function that's too long", async () => {
      const longFunction = `
export async function veryLongFunction(input: string): Promise<string> {
  // This function is intentionally long
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
  console.log("Line 15");
  console.log("Line 16");
  console.log("Line 17");
  console.log("Line 18");
  console.log("Line 19");
  console.log("Line 20");
  return input.toUpperCase();
}
`;

      const mockFilePath = '/tmp/test-long-function.ts';

      const originalFileRead = global.Bun?.file;
      if (global.Bun) {
        global.Bun.file = (path: string) => ({
          text: () => Promise.resolve(longFunction),
        });
      }

      try {
        const metrics = await analyzeCode(mockFilePath);

        const func = metrics.functions[0];
        expect(func.lines).toBeGreaterThan(15); // Exceeds limit

        // Should have max-lines violation
        expect(metrics.violations.some(v => v.rule === 'max-lines-per-function')).toBe(true);
        expect(metrics.score).toBeLessThan(90); // Should be penalized
      } finally {
        if (originalFileRead) {
          global.Bun!.file = originalFileRead;
        }
      }
    });

    test("should detect magic numbers", async () => {
      const magicNumbersCode = `
export function calculateTax(amount: number): number {
  const taxRate = 0.0825; // Magic number
  const discount = 15; // Magic number
  const threshold = 1000; // Magic number

  if (amount > threshold) {
    return amount * (1 + taxRate) - discount;
  }
  return amount * taxRate;
}
`;

      const mockFilePath = '/tmp/test-magic-numbers.ts';

      const originalFileRead = global.Bun?.file;
      if (global.Bun) {
        global.Bun.file = (path: string) => ({
          text: () => Promise.resolve(magicNumbersCode),
        });
      }

      try {
        const metrics = await analyzeCode(mockFilePath);

        // Should detect magic numbers (0, 1, -1 are ignored)
        expect(metrics.violations.some(v => v.rule === 'magic-numbers')).toBe(true);
        expect(func.hasMagicNumbers).toBe(true);
      } finally {
        if (originalFileRead) {
          global.Bun!.file = originalFileRead;
        }
      }
    });

    test("should detect too many parameters", async () => {
      const manyParamsCode = `
export async function complexOperation(
  param1: string,
  param2: number,
  param3: boolean,
  param4: object,
  param5: array,
  param6: Function
): Promise<Result> {
  // Function with too many parameters
  return { success: true };
}
`;

      const mockFilePath = '/tmp/test-many-params.ts';

      const originalFileRead = global.Bun?.file;
      if (global.Bun) {
        global.Bun.file = (path: string) => ({
          text: () => Promise.resolve(manyParamsCode),
        });
      }

      try {
        const metrics = await analyzeCode(mockFilePath);

        const func = metrics.functions[0];
        expect(func.params.length).toBeGreaterThan(4); // Exceeds limit

        // Should have max-params violation
        expect(metrics.violations.some(v => v.rule === 'max-params')).toBe(true);
      } finally {
        if (originalFileRead) {
          global.Bun!.file = originalFileRead;
        }
      }
    });

    test("should calculate complexity correctly", async () => {
      const complexCode = `
export function calculateComplexity(input: number): number {
  if (input < 0) return 0;
  if (input > 100) return 100;

  if (input % 2 === 0 && input > 50) {
    for (let i = 0; i < input; i++) {
      if (i % 3 === 0) continue;
      console.log(i);
    }
  }

  return input * 2;
}
`;

      const mockFilePath = '/tmp/test-complexity.ts';

      const originalFileRead = global.Bun?.file;
      if (global.Bun) {
        global.Bun.file = (path: string) => ({
          text: () => Promise.resolve(complexCode),
        });
      }

      try {
        const metrics = await analyzeCode(mockFilePath);

        const func = metrics.functions[0];
        expect(func.complexity).toBeGreaterThan(1); // Should have complexity > 1

        // Check if complexity is calculated reasonably
        expect(func.complexity).toBeGreaterThan(0);
        expect(func.complexity).toBeLessThan(20); // Shouldn't be extremely high
      } finally {
        if (originalFileRead) {
          global.Bun!.file = originalFileRead;
        }
      }
    });

    test("should handle edge case of empty file", async () => {
      const emptyCode = '';

      const mockFilePath = '/tmp/test-empty.ts';

      const originalFileRead = global.Bun?.file;
      if (global.Bun) {
        global.Bun.file = (path: string) => ({
          text: () => Promise.resolve(emptyCode),
        });
      }

      try {
        const metrics = await analyzeCode(mockFilePath);

        expect(metrics).toBeDefined();
        expect(metrics.functions).toHaveLength(0);
        expect(metrics.totalLines).toBe(0);
        expect(metrics.violations).toHaveLength(0);
        expect(metrics.score).toBe(100); // Perfect score for empty file
      } finally {
        if (originalFileRead) {
          global.Bun!.file = originalFileRead;
        }
      }
    });
  });

  describe("Quality Scoring", () => {
    test("should give high score to good code", async () => {
      const goodCode = `
export async function validateEmail(email: string): Promise<ValidationResult> {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email required' };
  }

  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}
`;

      const mockFilePath = '/tmp/test-good-code.ts';

      const originalFileRead = global.Bun?.file;
      if (global.Bun) {
        global.Bun.file = (path: string) => ({
          text: () => Promise.resolve(goodCode),
        });
      }

      try {
        const metrics = await analyzeCode(mockFilePath);

        expect(metrics.score).toBeGreaterThan(85); // Should be high score
        expect(metrics.violations.filter(v => v.severity === 'error')).toHaveLength(0);
      } finally {
        if (originalFileRead) {
          global.Bun!.file = originalFileRead;
        }
      }
    });

    test("should penalize multiple violations", async () => {
      const badCode = `
export async function badFunction(data: any): any {
  console.log("Bad practice");
  /* eslint-disable */
  const result = processData(data);
  return result;
}
`;

      const mockFilePath = '/tmp/test-bad-code.ts';

      const originalFileRead = global.Bun?.file;
      if (global.Bun) {
        global.Bun.file = (path: string) => ({
          text: () => Promise.resolve(badCode),
        });
      }

      try {
        const metrics = await analyzeCode(mockFilePath);

        expect(metrics.score).toBeLessThan(80); // Should be significantly penalized
        expect(metrics.violations.length).toBeGreaterThan(2); // Multiple violations

        // Should detect specific violations
        expect(metrics.violations.some(v => v.rule === 'any-type')).toBe(true);
        expect(metrics.violations.some(v => v.rule === 'eslint-disable')).toBe(true);
        expect(metrics.violations.some(v => v.rule === 'console-log')).toBe(true);
      } finally {
        if (originalFileRead) {
          global.Bun!.file = originalFileRead;
        }
      }
    });
  });
});