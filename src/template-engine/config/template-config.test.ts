import { test, expect } from "bun:test";
import {
  TemplateConfigSchema,
  validateConfig,
  mergeWithDefaults,
} from "./template-config";

test("Validates correct configuration", () => {
  const config = {
    PLUGIN_NAME: "test-plugin",
    AUTHOR: "Test Author",
    VERSION: "1.0.0",
    DATABASE_TYPE: "sqlite",
  };

  const result = validateConfig(config);
  expect(result.success).toBe(true);
});

test("Rejects invalid version format", () => {
  const config = {
    PLUGIN_NAME: "test-plugin",
    AUTHOR: "Test Author",
    VERSION: "1.0", // Invalid format
  };

  const result = validateConfig(config);
  expect(result.success).toBe(false);
  expect(result.errors).toContain("VERSION: Invalid");
});

test("Merges configuration with defaults", () => {
  const partialConfig = {
    PLUGIN_NAME: "test-plugin",
    AUTHOR: "Test Author",
    VERSION: "1.0.0",
  };

  const result = mergeWithDefaults(partialConfig);

  expect(result.DATABASE_TYPE).toBe("sqlite");
  expect(result.LOG_LEVEL).toBe("info");
  expect(result.STRICT_MODE).toBe(true);
});
