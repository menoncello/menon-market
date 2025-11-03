import { test, expect } from "bun:test";
import { TEMPLATES, getTemplate, getTemplatesByCategory } from "./registry";

test("Template registry contains marketplace-deploy template", () => {
  const template = getTemplate("marketplace-deploy");

  expect(template).toBeDefined();
  expect(template.id).toBe("marketplace-deploy");
  expect(template.category).toBe("deploy");
  expect(template.requiredVars).toContain("PLUGIN_NAME");
});

test("Template registry filters by category", () => {
  const deployTemplates = getTemplatesByCategory("deploy");
  const validateTemplates = getTemplatesByCategory("validate");

  expect(deployTemplates).toHaveLength(1);
  expect(validateTemplates).toHaveLength(1);
  expect(deployTemplates[0].id).toBe("marketplace-deploy");
});

test("Template registry handles missing template", () => {
  const template = getTemplate("non-existent");
  expect(template).toBeUndefined();
});
