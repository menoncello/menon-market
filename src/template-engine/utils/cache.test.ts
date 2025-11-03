import { test, expect } from "bun:test";
import { TemplateCache } from "./cache";

test("Template cache stores and retrieves compiled templates", () => {
  const cache = new TemplateCache();
  const templateString = "Hello {{name}}!";
  const compiled = (input: any) => `Hello ${input.name}!`;

  cache.set("test-template", compiled);
  const retrieved = cache.get("test-template");

  expect(retrieved).toBe(compiled);
});

test("Template cache returns undefined for missing keys", () => {
  const cache = new TemplateCache();
  const result = cache.get("non-existent");
  expect(result).toBeUndefined();
});

test("Template cache clears all entries", () => {
  const cache = new TemplateCache();
  const compiled = (input: any) => `Hello ${input.name}!`;

  cache.set("test1", compiled);
  cache.set("test2", compiled);

  expect(cache.size()).toBe(2);
  expect(cache.has("test1")).toBe(true);

  cache.clear();

  expect(cache.size()).toBe(0);
  expect(cache.has("test1")).toBe(false);
  expect(cache.get("test1")).toBeUndefined();
});

test("Template cache has method checks existence", () => {
  const cache = new TemplateCache();
  const compiled = (input: any) => `Hello ${input.name}!`;

  expect(cache.has("non-existent")).toBe(false);

  cache.set("test-template", compiled);
  expect(cache.has("test-template")).toBe(true);
});

test("Template cache size tracks entries", () => {
  const cache = new TemplateCache();
  const compiled = (input: any) => `Hello ${input.name}!`;

  expect(cache.size()).toBe(0);

  cache.set("test1", compiled);
  expect(cache.size()).toBe(1);

  cache.set("test2", compiled);
  expect(cache.size()).toBe(2);

  cache.clear();
  expect(cache.size()).toBe(0);
});

test("Template cache respects maxSize limit", () => {
  const cache = new TemplateCache(2, 1000000); // Large TTL to avoid cleanup
  const compiled = (input: any) => `Hello ${input.name}!`;

  cache.set("test1", compiled);
  cache.set("test2", compiled);
  expect(cache.size()).toBe(2);

  // This should remove test1 to make room for test3
  cache.set("test3", compiled);
  expect(cache.size()).toBe(2);
  expect(cache.has("test1")).toBe(false);
  expect(cache.has("test2")).toBe(true);
  expect(cache.has("test3")).toBe(true);
});