/**
 * Basic functionality tests for SkillLoader
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SkillLoader } from '../../src/skills/loader';
import { SkillDefinition, AgentRole } from '../../src/skills/types';
import { defaultLogger } from '../../src/skills/loader-logger';

// Mock dependencies
const mockReadFile = vi.fn();
vi.mock('fs/promises', () => ({
  readFile: mockReadFile,
}));

const mockYamlParse = vi.fn();
vi.mock('yaml', () => ({
  parse: mockYamlParse,
}));

describe('SkillLoader Basic Functionality', () => {
  let skillLoader: SkillLoader;
  let mockFs: { readFile: any };
  let mockYaml: { parse: any };

  beforeEach(() => {
    mockFs = { readFile: mockReadFile };
    mockYaml = { parse: mockYamlParse };

    skillLoader = new SkillLoader({
      cache: { enabled: true, ttl: 60000, maxSize: 10 },
      hotReload: { enabled: false, watchPaths: [], debounceMs: 1000 },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with default configuration', () => {
      const defaultLoader = new SkillLoader();
      const stats = defaultLoader.getStats();

      expect(stats.loadedSkills).toBe(0);
      expect(stats.cachedSkills).toBe(0);
      expect(stats.activeWatchers).toBe(0);
    });

    it('should merge custom configuration with defaults', () => {
      const customLoader = new SkillLoader({
        defaultStrategy: 'package',
        cache: { enabled: false, ttl: 120000, maxSize: 50 },
      });

      const stats = customLoader.getStats();
      expect(stats.cachedSkills).toBe(0);
    });

    it('should setup hot reload if enabled', () => {
      const loggerSpy = vi.spyOn(defaultLogger, 'info').mockImplementation(() => {});

      const hotReloadLoader = new SkillLoader({
        hotReload: { enabled: true, watchPaths: ['/test'], debounceMs: 500 },
      });

      expect(loggerSpy).toHaveBeenCalledWith('Hot reload enabled for paths:', ['/test']);
      loggerSpy.mockRestore();
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      skillLoader.clearCache();
      const stats = skillLoader.getStats();
      expect(stats.cachedSkills).toBe(0);
    });

    it('should handle cache cleanup on cleanup', async () => {
      await skillLoader.cleanup();
      const stats = skillLoader.getStats();
      expect(stats.cachedSkills).toBe(0);
      expect(stats.activeWatchers).toBe(0);
    });
  });

  describe('Load Status Checks', () => {
    it('should return false for non-loaded skill', () => {
      expect(skillLoader.isLoaded('nonexistent')).toBe(false);
    });

    it('should return null for non-existent load metadata', () => {
      const metadata = skillLoader.getLoadMetadata('nonexistent');
      expect(metadata).toBeNull();
    });

    it('should return empty array for no loaded skills', () => {
      const loadedSkills = skillLoader.getLoadedSkills();
      expect(loadedSkills).toEqual([]);
    });
  });

  describe('Stats Collection', () => {
    it('should return comprehensive stats', () => {
      const stats = skillLoader.getStats();

      expect(stats).toHaveProperty('loadedSkills');
      expect(stats).toHaveProperty('cachedSkills');
      expect(stats).toHaveProperty('activeWatchers');
      expect(stats).toHaveProperty('averageLoadTime');
      expect(stats).toHaveProperty('totalLoadTime');
      expect(stats).toHaveProperty('cacheHitRate');
      expect(stats).toHaveProperty('memoryUsage');
      expect(stats.memoryUsage).toHaveProperty('rss');
      expect(stats.memoryUsage).toHaveProperty('heapUsed');
    });

    it('should calculate average load time correctly', async () => {
      // Mock a skill load to generate load time data
      const mockSkill: SkillDefinition = {
        id: 'test-skill',
        name: 'Test Skill',
        description: 'Test Description',
        version: '1.0.0',
        domain: 'testing',
        category: 'unit-testing',
        dependencies: [],
        compatibility: [{ agentRole: 'FrontendDev', level: 'full' }],
        capabilities: [
          {
            id: 'test-capability',
            name: 'Test Capability',
            description: 'A test capability',
            type: 'action'
          }
        ],
        examples: [],
        performance: {
          executionTime: { min: 1, max: 10, average: 5 },
          resourceUsage: { memory: 'low', cpu: 'low', network: 'none' },
          complexity: 'simple',
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          author: 'Test Author',
          versionHistory: [],
          tags: ['test'],
          relatedSkills: {},
          resources: [],
        },
        tags: ['test'],
      };

      mockReadFile.mockResolvedValue(JSON.stringify(mockSkill));

      await skillLoader.load('test.json', { skipValidation: true });
      const stats = skillLoader.getStats();

      expect(stats.averageLoadTime).toBeGreaterThanOrEqual(0);
      expect(stats.totalLoadTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Unload Functionality', () => {
    it('should handle unload of non-existent skill', async () => {
      // Should not throw when unloading a non-existent skill
      await expect(skillLoader.unload('nonexistent')).resolves.toBeUndefined();
    });

    it('should cleanup watchers during unload', async () => {
      const mockWatcher = { close: vi.fn().mockResolvedValue(undefined) };

      // Manually add a watcher to test cleanup
      (skillLoader as any).watchers.set('test-skill', mockWatcher);

      await skillLoader.unload('test-skill');

      expect(mockWatcher.close).toHaveBeenCalled();
    });
  });

  describe('Strategy Determination', () => {
    it('should determine URL strategy for HTTP URLs', () => {
      const strategy = (skillLoader as any).determineStrategy('http://example.com/skill.json');
      expect(strategy).toBe('url');
    });

    it('should determine URL strategy for HTTPS URLs', () => {
      const strategy = (skillLoader as any).determineStrategy('https://example.com/skill.json');
      expect(strategy).toBe('url');
    });

    it('should determine package strategy for npm packages', () => {
      const strategy = (skillLoader as any).determineStrategy('@test/package');
      expect(strategy).toBe('package');
    });

    it('should determine package strategy for paths with slashes', () => {
      const strategy = (skillLoader as any).determineStrategy('test/package');
      expect(strategy).toBe('package');
    });

    it('should determine registry strategy for custom protocols', () => {
      const strategy = (skillLoader as any).determineStrategy('registry://skill-id');
      expect(strategy).toBe('registry');
    });

    it('should determine file strategy for simple paths', () => {
      const strategy = (skillLoader as any).determineStrategy('skill.json');
      expect(strategy).toBe('file');
    });
  });

  describe('Path Resolution', () => {
    it('should resolve relative paths with base path', () => {
      const resolved = (skillLoader as any).resolvePath('skill.json', 'file');
      expect(resolved).toBe('/skills/skill.json');
    });

    it('should return absolute paths unchanged', () => {
      const resolved = (skillLoader as any).resolvePath('/absolute/path/skill.json', 'file');
      expect(resolved).toBe('/absolute/path/skill.json');
    });

    it('should handle missing base path', () => {
      const resolved = (skillLoader as any).resolvePath('skill.json', 'registry');
      expect(resolved).toBe('skill.json');
    });
  });

  describe('Cache Expiration', () => {
    beforeEach(() => {
      skillLoader.clearCache();
    });

    it('should return null for expired cache entries', () => {
      // Manually add an expired entry
      const pastDate = new Date(Date.now() - 1000);
      (skillLoader as any).cache.set('expired', {
        skill: {
          id: 'test',
          name: 'Test Skill',
          description: 'Test Description',
          version: '1.0.0',
          domain: 'testing',
          category: 'unit-testing',
          dependencies: [],
          compatibility: [],
          capabilities: [],
          examples: [],
          performance: {
            executionTime: { min: 1, max: 10, average: 5 },
            resourceUsage: { memory: 'low', cpu: 'low', network: 'none' },
            complexity: 'simple',
          },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            author: 'Test Author',
            versionHistory: [],
            tags: ['test'],
            relatedSkills: {},
            resources: [],
          },
          tags: ['test'],
        } as SkillDefinition,
        expiresAt: pastDate,
      });

      const cached = (skillLoader as any).getCached('expired');
      expect(cached).toBeNull();
    });

    it('should clean up expired entries', () => {
      const pastDate = new Date(Date.now() - 1000);
      (skillLoader as any).cache.set('expired', {
        skill: {
          id: 'test',
          name: 'Test Skill',
          description: 'Test Description',
          version: '1.0.0',
          domain: 'testing',
          category: 'unit-testing',
          dependencies: [],
          compatibility: [],
          capabilities: [],
          examples: [],
          performance: {
            executionTime: { min: 1, max: 10, average: 5 },
            resourceUsage: { memory: 'low', cpu: 'low', network: 'none' },
            complexity: 'simple',
          },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            author: 'Test Author',
            versionHistory: [],
            tags: ['test'],
            relatedSkills: {},
            resources: [],
          },
          tags: ['test'],
        } as SkillDefinition,
        expiresAt: pastDate,
      });

      (skillLoader as any).getCached('expired');

      expect((skillLoader as any).cache.has('expired')).toBe(false);
    });

    it('should return valid cached entries', () => {
      const futureDate = new Date(Date.now() + 60000);
      const validMockSkill = {
        id: 'test',
        name: 'Test Skill',
        description: 'Test Description',
        version: '1.0.0',
        domain: 'testing',
        category: 'unit-testing',
        dependencies: [],
        compatibility: [],
        capabilities: [],
        examples: [],
        performance: {
          executionTime: { min: 1, max: 10, average: 5 },
          resourceUsage: { memory: 'low', cpu: 'low', network: 'none' },
          complexity: 'simple',
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          author: 'Test Author',
          versionHistory: [],
          tags: ['test'],
          relatedSkills: {},
          resources: [],
        },
        tags: ['test'],
      } as SkillDefinition;

      (skillLoader as any).cache.set('valid', {
        skill: validMockSkill,
        expiresAt: futureDate,
      });

      const cached = (skillLoader as any).getCached('valid');
      expect(cached).toBe(validMockSkill);
    });
  });

  describe('Cache Size Management', () => {
    beforeEach(() => {
      skillLoader.clearCache();
    });

    it('should remove oldest entry when cache is full', () => {
      // Fill cache to max size
      const maxSize = 10;
      const customLoader = new SkillLoader({
        cache: { enabled: true, ttl: 60000, maxSize },
        hotReload: { enabled: false, watchPaths: [], debounceMs: 1000 },
      });

      // Add maximum entries
      for (let i = 0; i < maxSize; i++) {
        (customLoader as any).cache.set(`skill-${i}`, {
          skill: {
            id: `skill-${i}`,
            name: `Skill ${i}`,
            description: `Test Skill ${i}`,
            version: '1.0.0',
            domain: 'testing',
            category: 'unit-testing',
            dependencies: [],
            compatibility: [],
            capabilities: [],
            examples: [],
            performance: {
              executionTime: { min: 1, max: 10, average: 5 },
              resourceUsage: { memory: 'low', cpu: 'low', network: 'none' },
              complexity: 'simple',
            },
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
              author: 'Test Author',
              versionHistory: [],
              tags: ['test'],
              relatedSkills: {},
              resources: [],
            },
            tags: ['test'],
          } as SkillDefinition,
          expiresAt: new Date(Date.now() + 60000),
        });
      }

      // Add one more to trigger cleanup
      const newSkill = {
        id: 'new-skill',
        name: 'New Skill',
        description: 'New Test Skill',
        version: '1.0.0',
        domain: 'testing',
        category: 'unit-testing',
        dependencies: [],
        compatibility: [],
        capabilities: [],
        examples: [],
        performance: {
          executionTime: { min: 1, max: 10, average: 5 },
          resourceUsage: { memory: 'low', cpu: 'low', network: 'none' },
          complexity: 'simple',
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          author: 'Test Author',
          versionHistory: [],
          tags: ['test'],
          relatedSkills: {},
          resources: [],
        },
        tags: ['test'],
      } as SkillDefinition;
      (customLoader as any).cacheSkill('new-skill', newSkill);

      expect((customLoader as any).cache.size).toBe(maxSize);
      expect((customLoader as any).cache.has('skill-0')).toBe(false);
      expect((customLoader as any).cache.has('new-skill')).toBe(true);
    });
  });
});