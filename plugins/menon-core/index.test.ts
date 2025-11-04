import { test, expect } from 'bun:test';
import MenonCore from './index';

test('plugin initialization', () => {
  const core = new MenonCore();
  expect(core.name).toBe('menon-core');
  expect(core.version).toBe('1.0.0');
});

test('plugin with custom config', () => {
  const customConfig = {
    version: '2.0.0',
    features: ['test-feature'],
  };
  const core = new MenonCore(customConfig);
  const info = core.getInfo();
  expect(info.version).toBe('2.0.0');
  expect(info.features).toEqual(['test-feature']);
});

test('feature management', () => {
  const core = new MenonCore();

  // Add feature
  core.addFeature('new-feature');
  expect(core.listFeatures()).toContain('new-feature');

  // Don't add duplicate
  core.addFeature('new-feature');
  expect(core.listFeatures().filter((f) => f === 'new-feature')).toHaveLength(
    1
  );

  // Remove feature
  core.removeFeature('new-feature');
  expect(core.listFeatures()).not.toContain('new-feature');
});

test('initialize method', async () => {
  const core = new MenonCore();
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (message: string) => {
    logs.push(message);
  };

  try {
    await core.initialize();
    expect(logs).toContain('Initializing menon-core v1.0.0');
  } finally {
    console.log = originalLog;
  }
});
