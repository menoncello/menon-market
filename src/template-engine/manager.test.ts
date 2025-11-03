import { test, expect } from "bun:test";
import { TemplateManager } from "./manager";

test("TemplateManager initializes with Bun helpers", async () => {
  const manager = new TemplateManager();
  await manager.initialize();

  const template = manager.compile("{{bun-import 'sqlite'}}");
  const result = template({});

  expect(result).toBe("bun:sqlite");
});

test("TemplateManager handles bun-class helper", async () => {
  const manager = new TemplateManager();
  await manager.initialize();

  const template = manager.compile("{{bun-class 'my-plugin'}}");
  const result = template({});

  expect(result).toBe("MyPlugin");
});

test("TemplateManager handles bun-filename helper", async () => {
  const manager = new TemplateManager();
  await manager.initialize();

  const template = manager.compile("{{bun-filename 'MyClass'}}");
  const result = template({});

  expect(result).toBe("my-class");
});

test("TemplateManager handles ifBunFeature helper", async () => {
  const manager = new TemplateManager();
  await manager.initialize();

  const template = manager.compile(
    "{{#ifBunFeature 'sqlite'}}SQLite support{{else}}No SQLite{{/ifBunFeature}}",
  );
  const result = template({});

  expect(result).toBe("SQLite support");
});

test("TemplateManager handles ifBunFeature with unsupported feature", async () => {
  const manager = new TemplateManager();
  await manager.initialize();

  const template = manager.compile(
    "{{#ifBunFeature 'unsupported'}}Feature support{{else}}No support{{/ifBunFeature}}",
  );
  const result = template({});

  expect(result).toBe("No support");
});

test("TemplateManager loads and generates deploy template", async () => {
  const manager = new TemplateManager();
  await manager.initialize();

  const variables = {
    PLUGIN_NAME: "test-plugin",
    AUTHOR: "Test Author",
    VERSION: "1.0.0",
    description: "Test deployment script",
    currentDate: new Date().toISOString(),
    className: "TestPlugin",
    databaseType: "sqlite",
    author: "Test Author",
  };

  const result = await manager.generate("marketplace-deploy", variables);

  expect(result).toContain("#!/usr/bin/env bun");
  expect(result).toContain("bun:sqlite");
  expect(result).toContain("TestPlugin");
  expect(result).toContain("test-plugin");
});
