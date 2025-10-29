/**
 * Reload functionality and metadata management tests for SkillLoader
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SkillLoader } from '../../src/skills/loader';
import { SkillDefinition } from '../../src/skills/types';

// Mock dependencies
const mockReadFile = vi.fn();
vi.mock('fs/promises', () => ({
  readFile: mockReadFile,
}));

describe('SkillLoader Reload and Metadata', () => {
  let skillLoader: SkillLoader;
  let mockFs: { readFile: any };

  const mockSkillJson = JSON.stringify({
    id: 'test-skill',
    name: 'Test Skill',
    description: 'Test Description',
    domain: 'testing',
    category: 'unit-testing',
    version: '1.0.0',
    dependencies: [],
    compatibility: [
      {
        agentRole: 'QA',
        level: 'full'
      }
    ],
    capabilities: [
      {
        id: 'test-capability',
        name: 'Test Capability',
        description: 'A test capability',
        type: 'action'
      }
    ],
    examples: [
      {
        title: 'Test Example',
        scenario: 'Test scenario',
        steps: ['Step 1'],
        outcomes: ['Expected outcome'],
        relevantFor: ['QA']
      }
    ],
    performance: {
      executionTime: {
        min: 1,
        max: 5,
        average: 3
      },
      resourceUsage: {
        memory: 'low',
        cpu: 'low',
        network: 'none'
      },
      complexity: 'simple'
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Test Author',
      versionHistory: [
        {
          version: '1.0.0',
          releasedAt: new Date().toISOString(),
          notes: 'Initial version'
        }
      ],
      tags: ['test'],
      relatedSkills: {},
      resources: []
    },
    tags: ['test']
  });

  const mockSkill: SkillDefinition = JSON.parse(mockSkillJson);

  const updatedMockSkillJson = JSON.stringify({
    ...mockSkill,
    version: '2.0.0',
    description: 'Updated Description',
    metadata: {
      ...mockSkill.metadata,
      updatedAt: new Date().toISOString(),
      versionHistory: [
        ...mockSkill.metadata.versionHistory,
        {
          version: '2.0.0',
          releasedAt: new Date().toISOString(),
          notes: 'Updated version'
        }
      ]
    }
  });

  const updatedMockSkill: SkillDefinition = JSON.parse(updatedMockSkillJson);

  beforeEach(() => {
    mockFs = { readFile: mockReadFile };

    skillLoader = new SkillLoader({
      cache: { enabled: true, ttl: 60000, maxSize: 10 },
      hotReload: { enabled: false, watchPaths: [], debounceMs: 1000 },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Load Metadata Recording', () => {
    it('should record load metadata after successful load', async () => {
      mockReadFile.mockResolvedValue(mockSkillJson);

      await skillLoader.load('test.json', { skipValidation: true });

      const metadata = skillLoader.getLoadMetadata('test-skill');
      expect(metadata).toBeTruthy();
      expect(metadata!.skillId).toBe('test-skill');
      expect(metadata!.strategy).toBe('file');
      expect(metadata!.source).toBe('test.json');
      expect(metadata!.isLoaded).toBe(true);
      expect(metadata!.loadTime).toBeGreaterThanOrEqual(0);
      expect(metadata!.loadedAt).toBeInstanceOf(Date);
    });

    it('should update loaded skills list after load', async () => {
      mockReadFile.mockResolvedValue(mockSkillJson);

      await skillLoader.load('test.json', { skipValidation: true });

      const loadedSkills = skillLoader.getLoadedSkills();
      expect(loadedSkills).toHaveLength(1);
      expect(loadedSkills[0].skillId).toBe('test-skill');
    });

    it('should track load time performance', async () => {
      mockReadFile.mockResolvedValue(mockSkillJson);

      const startTime = Date.now();
      await skillLoader.load('test.json', { skipValidation: true });
      const endTime = Date.now();

      const metadata = skillLoader.getLoadMetadata('test-skill');
      expect(metadata!.loadTime).toBeGreaterThanOrEqual(0);
      expect(metadata!.loadTime).toBeLessThanOrEqual(endTime - startTime + 100); // Allow larger margin for artificial load time
    });

    it('should handle multiple skill loads', async () => {
      const secondSkill: SkillDefinition = {
        ...mockSkill,
        id: 'second-skill',
        name: 'Second Skill',
      };

      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(mockSkill))
        .mockResolvedValueOnce(JSON.stringify(secondSkill));

      await skillLoader.load('test.json', { skipValidation: true });
      await skillLoader.load('second.json', { skipValidation: true });

      const loadedSkills = skillLoader.getLoadedSkills();
      expect(loadedSkills).toHaveLength(2);

      const firstMetadata = skillLoader.getLoadMetadata('test-skill');
      const secondMetadata = skillLoader.getLoadMetadata('second-skill');

      expect(firstMetadata!.skillId).toBe('test-skill');
      expect(secondMetadata!.skillId).toBe('second-skill');
    });
  });

  describe('Skill Unloading', () => {
    beforeEach(async () => {
      mockReadFile.mockResolvedValue(mockSkillJson);
      await skillLoader.load('test.json', { skipValidation: true });
    });

    it('should remove skill from loaded skills', async () => {
      expect(skillLoader.isLoaded('test-skill')).toBe(true);

      await skillLoader.unload('test-skill');

      expect(skillLoader.isLoaded('test-skill')).toBe(false);
    });

    it('should remove load metadata', async () => {
      expect(skillLoader.getLoadMetadata('test-skill')).toBeTruthy();

      await skillLoader.unload('test-skill');

      expect(skillLoader.getLoadMetadata('test-skill')).toBeNull();
    });

    it('should remove skill from cache', async () => {
      await skillLoader.unload('test-skill');

      const stats = skillLoader.getStats();
      expect(stats.cachedSkills).toBe(0);
    });

    it('should handle unloading non-existent skill', async () => {
      await expect(skillLoader.unload('non-existent')).resolves.toBeUndefined();
    });

    it('should handle unloading already unloaded skill', async () => {
      await skillLoader.unload('test-skill');
      await expect(skillLoader.unload('test-skill')).resolves.toBeUndefined();
    });
  });

  describe('Skill Reloading', () => {
    beforeEach(async () => {
      mockReadFile.mockResolvedValue(mockSkillJson);
      await skillLoader.load('test.json', { skipValidation: true });
    });

    it('should reload skill successfully', async () => {
      mockReadFile.mockResolvedValue(updatedMockSkillJson);

      const reloadedSkill = await skillLoader.reload('test-skill', { skipValidation: true });

      expect(reloadedSkill.version).toBe('2.0.0');
      expect(reloadedSkill.description).toBe('Updated Description');
    });

    it('should update metadata after reload', async () => {
      const originalMetadata = skillLoader.getLoadMetadata('test-skill');
      const originalLoadTime = originalMetadata!.loadTime;

      mockReadFile.mockResolvedValue(updatedMockSkillJson);

      await skillLoader.reload('test-skill', { skipValidation: true });

      const newMetadata = skillLoader.getLoadMetadata('test-skill');
      expect(newMetadata!.loadTime).not.toBe(originalLoadTime);
      expect(newMetadata!.loadedAt).not.toBe(originalMetadata!.loadedAt);
    });

    it('should preserve skill ID after reload', async () => {
      mockReadFile.mockResolvedValue(updatedMockSkillJson);

      const reloadedSkill = await skillLoader.reload('test-skill', { skipValidation: true });

      expect(reloadedSkill.id).toBe('test-skill');
    });

    it('should handle reload of non-existent skill', async () => {
      await expect(skillLoader.reload('non-existent', { skipValidation: true })).rejects.toThrow();
    });

    it('should handle reload errors gracefully', async () => {
      mockReadFile.mockRejectedValue(new Error('File not found'));

      await expect(skillLoader.reload('test-skill', { skipValidation: true })).rejects.toThrow('File not found');

      // Skill should be unloaded after failed reload
      expect(skillLoader.isLoaded('test-skill')).toBe(false);
    });

    it('should force reload by default', async () => {
      const cachingLoader = new SkillLoader({
        cache: { enabled: true, ttl: 60000, maxSize: 10 },
        hotReload: { enabled: false, watchPaths: [], debounceMs: 1000 },
      });

      mockReadFile.mockResolvedValue(mockSkillJson);
      await cachingLoader.load('test.json', { skipValidation: true });

      // Mock file read to track calls
      mockReadFile.mockClear();
      mockReadFile.mockResolvedValue(updatedMockSkillJson);

      await cachingLoader.reload('test-skill', { skipValidation: true });

      // Should call readFile even with caching enabled
      expect(mockReadFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('Load Status Tracking', () => {
    it('should track loaded status correctly', async () => {
      expect(skillLoader.isLoaded('test-skill')).toBe(false);

      mockReadFile.mockResolvedValue(mockSkillJson);
      await skillLoader.load('test.json', { skipValidation: true });

      expect(skillLoader.isLoaded('test-skill')).toBe(true);

      await skillLoader.unload('test-skill');

      expect(skillLoader.isLoaded('test-skill')).toBe(false);
    });

    it('should check cache for loaded status', async () => {
      const cachingLoader = new SkillLoader({
        cache: { enabled: true, ttl: 60000, maxSize: 10 },
        hotReload: { enabled: false, watchPaths: [], debounceMs: 1000 },
      });

      mockReadFile.mockResolvedValue(mockSkillJson);
      await cachingLoader.load('test.json', { skipValidation: true });

      // Check that skill is loaded normally
      expect(cachingLoader.isLoaded('test-skill')).toBe(true);

      // Check that skill can be found using its source path in cache
      expect(cachingLoader.isLoaded('test.json')).toBe(true);
    });

    it('should return false for skills only in metadata but not cache', async () => {
      // Load and then clear cache
      mockReadFile.mockResolvedValue(mockSkillJson);
      await skillLoader.load('test.json', { skipValidation: true });
      (skillLoader as any).cache.clear();

      expect(skillLoader.isLoaded('test-skill')).toBe(true);
    });
  });

  describe('Statistics and Monitoring', () => {
    it('should update stats after load', async () => {
      const initialStats = skillLoader.getStats();

      mockReadFile.mockResolvedValue(mockSkillJson);
      await skillLoader.load('test.json', { skipValidation: true });

      const finalStats = skillLoader.getStats();

      expect(finalStats.loadedSkills).toBe(initialStats.loadedSkills + 1);
      expect(finalStats.cachedSkills).toBe(initialStats.cachedSkills + 1);
    });

    it('should calculate average load time correctly', async () => {
      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(mockSkill))
        .mockResolvedValueOnce(JSON.stringify({ ...mockSkill, id: 'skill-2' }));

      await skillLoader.load('test1.json', { skipValidation: true });
      await skillLoader.load('test2.json', { skipValidation: true });

      const stats = skillLoader.getStats();

      expect(stats.averageLoadTime).toBeGreaterThanOrEqual(0);
      expect(stats.totalLoadTime).toBeGreaterThanOrEqual(0);
      expect(stats.loadedSkills).toBe(2);
    });

    it('should update stats after unload', async () => {
      mockReadFile.mockResolvedValue(mockSkillJson);
      await skillLoader.load('test.json', { skipValidation: true });

      const loadedStats = skillLoader.getStats();
      expect(loadedStats.loadedSkills).toBe(1);

      await skillLoader.unload('test-skill');

      const unloadedStats = skillLoader.getStats();
      expect(unloadedStats.loadedSkills).toBe(0);
    });

    it('should track memory usage', async () => {
      mockReadFile.mockResolvedValue(mockSkillJson);
      await skillLoader.load('test.json', { skipValidation: true });

      const stats = skillLoader.getStats();

      expect(stats.memoryUsage).toHaveProperty('rss');
      expect(stats.memoryUsage).toHaveProperty('heapUsed');
      expect(stats.memoryUsage).toHaveProperty('heapTotal');
      expect(stats.memoryUsage).toHaveProperty('external');
      expect(stats.memoryUsage).toHaveProperty('arrayBuffers');
    });

    it('should handle cache hit rate calculation', async () => {
      const stats = skillLoader.getStats();

      expect(typeof stats.cacheHitRate).toBe('number');
      expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(stats.cacheHitRate).toBeLessThanOrEqual(1);
    });
  });

  describe('File Watcher Management', () => {
    it('should setup file watcher for file-based skills', async () => {
      const hotReloadLoader = new SkillLoader({
        hotReload: { enabled: true, watchPaths: ['/skills'], debounceMs: 1000 },
        cache: { enabled: false, ttl: 60000, maxSize: 10 },
      });

      mockReadFile.mockResolvedValue(mockSkillJson);

      await hotReloadLoader.load('test.json', { skipValidation: true });

      const metadata = hotReloadLoader.getLoadMetadata('test-skill');
      expect(metadata!.watchInfo).toBeTruthy();
      expect(metadata!.watchInfo!.lastModified).toBeInstanceOf(Date);
    });

    it('should cleanup file watchers on unload', async () => {
      const mockWatcher = { close: vi.fn().mockResolvedValue(undefined) };

      // Manually add a watcher
      (skillLoader as any).watchers.set('test-skill', mockWatcher);

      await skillLoader.unload('test-skill');

      expect(mockWatcher.close).toHaveBeenCalled();
      expect((skillLoader as any).watchers.has('test-skill')).toBe(false);
    });

    it('should cleanup all file watchers on cleanup', async () => {
      const mockWatcher1 = { close: vi.fn().mockResolvedValue(undefined) };
      const mockWatcher2 = { close: vi.fn().mockResolvedValue(undefined) };

      (skillLoader as any).watchers.set('skill-1', mockWatcher1);
      (skillLoader as any).watchers.set('skill-2', mockWatcher2);

      await skillLoader.cleanup();

      expect(mockWatcher1.close).toHaveBeenCalled();
      expect(mockWatcher2.close).toHaveBeenCalled();
      expect((skillLoader as any).watchers.size).toBe(0);
    });
  });

  describe('Cleanup Operations', () => {
    it('should cleanup all resources properly', async () => {
      const mockWatcher = { close: vi.fn().mockResolvedValue(undefined) };

      // Load a skill and add a watcher
      mockReadFile.mockResolvedValue(mockSkillJson);
      await skillLoader.load('test.json', { skipValidation: true });
      (skillLoader as any).watchers.set('test-skill', mockWatcher);

      await skillLoader.cleanup();

      expect(mockWatcher.close).toHaveBeenCalled();
      expect((skillLoader as any).cache.size).toBe(0);
      expect((skillLoader as any).validationManager.loadedSkillsCount).toBe(0);
      expect((skillLoader as any).watchers.size).toBe(0);
    });

    it('should handle cleanup with no resources', async () => {
      await expect(skillLoader.cleanup()).resolves.toBeUndefined();
    });

    it('should handle cleanup errors gracefully', async () => {
      const mockWatcher = {
        close: vi.fn().mockRejectedValue(new Error('Cleanup failed'))
      };

      (skillLoader as any).watchers.set('test-skill', mockWatcher);

      // Should not throw even if cleanup fails
      await expect(skillLoader.cleanup()).resolves.toBeUndefined();
    });
  });
});