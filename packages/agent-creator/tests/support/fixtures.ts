/**
 * Test Fixtures for DirectoryStructureGenerator Tests
 * Provides reusable test setup and teardown functionality
 */

import { test as base } from 'bun:test';
import { promises as fs } from 'fs';
import { join } from 'path';
import { DirectoryStructureGenerator } from '../src/DirectoryStructureGenerator';

/**
 * Directory fixture interface for test setup
 */
export interface DirectoryFixture {
  generator: DirectoryStructureGenerator;
  testDir: string;
  createTestDir: () => Promise<string>;
  cleanupTestDir: () => Promise<void>;
}

/**
 * Extended test fixture with directory support
 */
export const test = base.extend<DirectoryFixture>({
  generator: async ({}, use) => {
    const generator = new DirectoryStructureGenerator();
    await use(generator);
  },

  testDir: async ({}, use) => {
    const testDir = join(process.cwd(), 'test-output', `test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    await fs.mkdir(testDir, { recursive: true });

    await use(testDir);

    // Auto-cleanup
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  },

  createTestDir: async ({}, use) => {
    const createTestDir = async (): Promise<string> => {
      const testDir = join(process.cwd(), 'test-output', `test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
      await fs.mkdir(testDir, { recursive: true });
      return testDir;
    };

    await use(createTestDir);
  },

  cleanupTestDir: async ({}, use) => {
    const cleanupTestDir = async (testDir: string): Promise<void> => {
      try {
        await fs.rm(testDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    };

    await use(cleanupTestDir);
  },
});

/**
 * Fixture for creating multiple test directories
 */
export interface MultiDirectoryFixture extends DirectoryFixture {
  createMultipleTestDirs: (count: number) => Promise<string[]>;
}

export const multiDirTest = base.extend<MultiDirectoryFixture>({
  generator: async ({}, use) => {
    const generator = new DirectoryStructureGenerator();
    await use(generator);
  },

  testDir: async ({}, use) => {
    const testDir = join(process.cwd(), 'test-output', `test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    await fs.mkdir(testDir, { recursive: true });

    await use(testDir);

    // Auto-cleanup
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  },

  createTestDir: async ({}, use) => {
    const createTestDir = async (): Promise<string> => {
      const testDir = join(process.cwd(), 'test-output', `test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
      await fs.mkdir(testDir, { recursive: true });
      return testDir;
    };

    await use(createTestDir);
  },

  cleanupTestDir: async ({}, use) => {
    const cleanupTestDir = async (testDir: string): Promise<void> => {
      try {
        await fs.rm(testDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    };

    await use(cleanupTestDir);
  },

  createMultipleTestDirs: async ({}, use) => {
    const createMultipleTestDirs = async (count: number): Promise<string[]> => {
      const dirs: string[] = [];
      for (let i = 0; i < count; i++) {
        const testDir = join(process.cwd(), 'test-output', `test-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`);
        await fs.mkdir(testDir, { recursive: true });
        dirs.push(testDir);
      }
      return dirs;
    };

    await use(createMultipleTestDirs);
  },
});