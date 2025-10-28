/**
 * Test fixture for Directory Structure Generator tests
 * Following fixture architecture patterns from knowledge base
 */

import { test as base, type TestFixture } from '@playwright/test';
import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import faker from '@faker-js/faker';
import type { GenerationOptions, GenerationResult } from '../factories/directory-structure.factory';

type DirectoryGeneratorFixture = {
  testDir: string;
  createTestDirectory: (name?: string) => Promise<string>;
  cleanupTestDirectory: (dir: string) => Promise<void>;
  createMockGenerationOptions: (agentType: string, outputPath: string) => GenerationOptions;
  createMockGenerationResult: (success: boolean, duration?: number) => GenerationResult;
};

export const test = base.extend<DirectoryGeneratorFixture>({
  testDir: async ({}, use) => {
    const testDir = join(process.cwd(), 'test-output', `test-${Date.now()}-${faker.string.alphanumeric(8)}`);

    // Create test directory
    await mkdir(testDir, { recursive: true });

    await use(testDir);

    // Auto-cleanup: Remove test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  },

  createTestDirectory: async ({}, use) => {
    const createdDirs: string[] = [];

    const createTestDirectory = async (name?: string): Promise<string> => {
      const dirName = name || `test-${Date.now()}-${faker.string.alphanumeric(6)}`;
      const dirPath = join(process.cwd(), 'test-output', dirName);

      await mkdir(dirPath, { recursive: true });
      createdDirs.push(dirPath);

      return dirPath;
    };

    await use(createTestDirectory);

    // Auto-cleanup: Remove all created directories
    for (const dir of createdDirs) {
      try {
        await rm(dir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
    createdDirs.length = 0;
  },

  cleanupTestDirectory: async ({}, use) => {
    const cleanupTestDirectory = async (dir: string): Promise<void> => {
      try {
        await rm(dir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    };

    await use(cleanupTestDirectory);
  },

  createMockGenerationOptions: async ({}, use) => {
    const createMockGenerationOptions = (agentType: string, outputPath: string) => ({
      agentType: agentType as any,
      outputPath,
      customizations: {
        name: faker.person.fullName(),
        description: faker.lorem.sentence(),
        version: '1.0.0',
      },
    });

    await use(createMockGenerationOptions);
  },

  createMockGenerationResult: async ({}, use) => {
    const createMockGenerationResult = (success: boolean, duration = faker.number.int({ min: 1000, max: 20000 })) => ({
      success,
      structure: success ? {
        'src': {
          'index.ts': '// Main entry point',
          'types.ts': '// Type definitions',
        },
        'tests': {
          'unit': {},
          'integration': {},
        },
        'config': {},
        'docs': {},
      } : undefined,
      errors: success ? undefined : [faker.lorem.sentence()],
      performance: {
        generationTime: duration,
        memoryUsage: faker.number.int({ min: 10_000_000, max: 30_000_000 }),
      },
    });

    await use(createMockGenerationResult);
  },
});