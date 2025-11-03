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

  const template = manager.compile("{{#ifBunFeature 'sqlite'}}SQLite support{{else}}No SQLite{{/ifBunFeature}}");
  const result = template({});

  expect(result).toBe("SQLite support");
});

test("TemplateManager handles ifBunFeature with unsupported feature", async () => {
  const manager = new TemplateManager();
  await manager.initialize();

  const template = manager.compile("{{#ifBunFeature 'unsupported'}}Feature support{{else}}No support{{/ifBunFeature}}");
  const result = template({});

  expect(result).toBe("No support");
});