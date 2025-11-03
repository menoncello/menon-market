import { test, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { TemplateManager } from "./manager";
import { validateConfig } from "./config/template-config";

let tempDir: string;
let manager: TemplateManager;

beforeEach(async () => {
  tempDir = join(process.cwd(), "temp-test-" + Date.now());
  await mkdir(tempDir, { recursive: true });
  manager = new TemplateManager();
  await manager.initialize();
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

test("Full template generation workflow", async () => {
  // Test configuration validation
  const config = {
    PLUGIN_NAME: "integration-test-plugin",
    AUTHOR: "Test Author",
    VERSION: "1.0.0",
    DATABASE_TYPE: "sqlite",
    STRICT_MODE: true,
    AUTO_FIX: false,
  };

  const validation = validateConfig(config);
  expect(validation.success).toBe(true);

  // Test template generation
  const templateVariables = {
    ...config,
    description: "Integration test plugin",
    currentDate: new Date().toISOString(),
    className: "IntegrationTestPlugin",
    author: "Test Author",
    databaseType: "sqlite",
    serve: "serve",
  };

  // Test deploy template generation
  const deployResult = await manager.generate(
    "marketplace-deploy",
    templateVariables,
  );

  expect(deployResult).toContain("#!/usr/bin/env bun");
  expect(deployResult).toContain("bun:sqlite");
  expect(deployResult).toContain("IntegrationTestPlugin");
  expect(deployResult).toContain("integration-test-plugin");

  // Test validate template generation
  const validateResult = await manager.generate("marketplace-validate", {
    ...templateVariables,
    VALIDATION_RULES: "strict",
  });

  expect(validateResult).toContain("#!/usr/bin/env bun");
  expect(validateResult).toContain("IntegrationTestPluginValidator");
  expect(validateResult).toContain("strictMode: true");
});

test("Template generation with missing required variables", async () => {
  const incompleteConfig = {
    PLUGIN_NAME: "test-plugin",
    // Missing required AUTHOR and VERSION
  };

  const validation = validateConfig(incompleteConfig);
  expect(validation.success).toBe(false);
  expect(validation.errors).toBeDefined();
});

test("Template generation with invalid data", async () => {
  const invalidConfig = {
    PLUGIN_NAME: "test-plugin",
    AUTHOR: "Test Author",
    VERSION: "1.0.0.0", // Invalid version format
  };

  const validation = validateConfig(invalidConfig);
  expect(validation.success).toBe(false);
});
