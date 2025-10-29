/**
 * Loading strategies and error handling tests for SkillLoader
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SkillLoader } from '../../src/skills/loader';
import { SkillDefinition } from '../../src/skills/types';

// Mock dependencies
const mockReadFile = vi.fn();
vi.mock('fs/promises', () => ({
  readFile: mockReadFile,
}));

const mockYamlParse = vi.fn();
vi.mock('yaml', () => ({
  parse: mockYamlParse,
}));

// Mock fetch for URL loading
global.fetch = vi.fn();

describe('SkillLoader Loading Strategies', () => {
  let skillLoader: SkillLoader;
  let mockFs: { readFile: any };
  let mockYaml: { parse: any };
  let mockFetch: any;

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

  beforeEach(() => {
    mockFs = { readFile: mockReadFile };
    mockYaml = { parse: mockYamlParse };
    mockFetch = global.fetch;

    skillLoader = new SkillLoader({
      cache: { enabled: false, ttl: 60000, maxSize: 10 }, // Disable cache for predictable tests
      hotReload: { enabled: false, watchPaths: [], debounceMs: 1000 },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('File Loading - JSON', () => {
    it('should load skill from JSON file', async () => {
      mockFs.readFile.mockResolvedValue(mockSkillJson);

      const result = await skillLoader.load('test.json', { skipValidation: true });

      expect(result).toEqual(mockSkill);
      expect(mockFs.readFile).toHaveBeenCalledWith('/skills/test.json', 'utf-8');
    });

    it('should handle invalid JSON gracefully', async () => {
      mockFs.readFile.mockResolvedValue('invalid json');

      await expect(skillLoader.load('invalid.json', { skipValidation: true })).rejects.toThrow();
    });

    it('should handle file read errors', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(skillLoader.load('nonexistent.json', { skipValidation: true })).rejects.toThrow('File not found');
    });
  });

  describe('File Loading - JavaScript/TypeScript', () => {
    it('should handle module loading errors gracefully', async () => {
      // This test simulates dynamic import failures
      await expect(skillLoader.load('nonexistent.js', { skipValidation: true })).rejects.toThrow();
    });

    it('should reject unsupported module formats', async () => {
      await expect(skillLoader.load('test.xyz', { skipValidation: true })).rejects.toThrow(
        'Unsupported file format: xyz'
      );
    });
  });

  describe('File Loading - YAML', () => {
    it('should load skill from YAML file', async () => {
      mockYaml.parse.mockReturnValue(mockSkill);
      mockFs.readFile.mockResolvedValue('name: Test Skill');

      const result = await skillLoader.load('test.yaml', { skipValidation: true });

      expect(result).toEqual(mockSkill);
      expect(mockYaml.parse).toHaveBeenCalledWith('name: Test Skill');
    });

    it('should load skill from YML file', async () => {
      mockYaml.parse.mockReturnValue(mockSkill);
      mockFs.readFile.mockResolvedValue('name: Test Skill');

      const result = await skillLoader.load('test.yml', { skipValidation: true });

      expect(result).toEqual(mockSkill);
    });

    it('should handle invalid YAML gracefully', async () => {
      mockYaml.parse.mockImplementation(() => {
        throw new Error('Invalid YAML');
      });
      mockFs.readFile.mockResolvedValue('invalid: yaml: content:');

      await expect(skillLoader.load('invalid.yaml', { skipValidation: true })).rejects.toThrow('Invalid YAML');
    });
  });

  describe('File Loading - Unsupported Formats', () => {
    it('should reject unsupported file formats', async () => {
      await expect(skillLoader.load('test.txt', { skipValidation: true })).rejects.toThrow(
        'Unsupported file format: txt'
      );
    });

    it('should handle files without extension', async () => {
      await expect(skillLoader.load('test', { skipValidation: true })).rejects.toThrow(
        'Unsupported file format: /skills/test'
      );
    });
  });

  describe('URL Loading', () => {
    beforeEach(() => {
      mockFetch.mockClear();
    });

    it('should load skill from HTTP URL with JSON content', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn().mockResolvedValue(JSON.stringify(mockSkill)),
      });

      const result = await skillLoader.load('http://example.com/skill.json', { skipValidation: true });

      expect(result).toEqual(mockSkill);
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/skill.json');
    });

    it('should load skill from HTTPS URL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: vi.fn().mockReturnValue('application/json') },
        text: vi.fn().mockResolvedValue(JSON.stringify(mockSkill)),
      });

      const result = await skillLoader.load('https://example.com/skill.json', { skipValidation: true });

      expect(result).toEqual(mockSkill);
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/skill.json');
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(skillLoader.load('http://example.com/notfound.json', { skipValidation: true })).rejects.toThrow(
        'HTTP 404: Not Found'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(skillLoader.load('http://example.com/skill.json', { skipValidation: true })).rejects.toThrow(
        'Network error'
      );
    });

    it('should reject non-JSON content types', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: vi.fn().mockReturnValue('text/html') },
        text: vi.fn().mockResolvedValue('<html></html>'),
      });

      await expect(skillLoader.load('http://example.com/skill.html', { skipValidation: true })).rejects.toThrow(
        'Unsupported content type: text/html'
      );
    });

    it('should handle missing content type header', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: vi.fn().mockReturnValue(null) },
        text: vi.fn().mockResolvedValue('some content'),
      });

      await expect(skillLoader.load('http://example.com/skill', { skipValidation: true })).rejects.toThrow(
        'Unsupported content type: null'
      );
    });
  });

  describe('Package Loading', () => {
    it('should handle package loading errors gracefully', async () => {
      await expect(skillLoader.load('@nonexistent/package', { skipValidation: true })).rejects.toThrow();
    });

    it('should handle invalid package formats', async () => {
      await expect(skillLoader.load('invalid-package-name', { skipValidation: true })).rejects.toThrow();
    });

    it('should handle missing package exports', async () => {
      await expect(skillLoader.load('@test/empty-package', { skipValidation: true })).rejects.toThrow();
    });

    it('should determine package strategy correctly', () => {
      const strategy = (skillLoader as any).determineStrategy('@test/package');
      expect(strategy).toBe('package');
    });

    it('should resolve package paths correctly', () => {
      const resolved = (skillLoader as any).resolvePath('test-package', 'package');
      expect(resolved).toContain('test-package');
    });
  });

  describe('Registry Loading', () => {
    it('should throw error for unimplemented registry loading', async () => {
      await expect(skillLoader.load('registry://skill-id', { skipValidation: true })).rejects.toThrow(
        'Registry loading not yet implemented'
      );
    });
  });

  describe('Unsupported Strategy', () => {
    it('should throw error for unknown strategy', async () => {
      // Mock determineStrategy to return unknown value
      const originalDetermineStrategy = (skillLoader as any).determineStrategy;
      (skillLoader as any).determineStrategy = () => 'unknown' as any;

      await expect(skillLoader.load('test', { skipValidation: true })).rejects.toThrow(
        'Unsupported loading strategy: unknown'
      );

      // Restore original method
      (skillLoader as any).determineStrategy = originalDetermineStrategy;
    });
  });

  describe('Loading Options', () => {
    beforeEach(() => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockSkill));
    });

    it('should skip validation when skipValidation is true', async () => {
      const invalidSkill = { ...mockSkill, id: '' }; // Invalid skill

      mockFs.readFile.mockResolvedValue(JSON.stringify(invalidSkill));

      const result = await skillLoader.load('test.json', { skipValidation: true });

      expect(result).toEqual(invalidSkill);
    });

    it('should force reload when force is true', async () => {
      // Load once to cache
      await skillLoader.load('test.json', { skipValidation: true });

      // Load again with force: true
      await skillLoader.load('test.json', { skipValidation: true, force: true });

      expect(mockFs.readFile).toHaveBeenCalledTimes(2);
    });

    it('should use cache when force is false', async () => {
      const cachingLoader = new SkillLoader({
        cache: { enabled: true, ttl: 60000, maxSize: 10 },
        hotReload: { enabled: false, watchPaths: [], debounceMs: 1000 },
      });

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockSkill));

      // Load once to cache
      await cachingLoader.load('test.json', { skipValidation: true });

      // Load again without force
      await cachingLoader.load('test.json', { skipValidation: true });

      expect(mockFs.readFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('Base Path Resolution', () => {
    it('should use configured base path for file strategy', async () => {
      const customLoader = new SkillLoader({
        basePaths: { file: '/custom/path' },
        cache: { enabled: false, ttl: 60000, maxSize: 10 },
        hotReload: { enabled: false, watchPaths: [], debounceMs: 1000 },
      });

      mockReadFile.mockResolvedValue(JSON.stringify(mockSkill));

      await customLoader.load('skill.json', { skipValidation: true });

      expect(mockReadFile).toHaveBeenCalledWith('/custom/path/skill.json', 'utf-8');
    });

    it('should resolve package paths with base configuration', () => {
      const customLoader = new SkillLoader({
        basePaths: { package: '@custom/skills' },
        cache: { enabled: false, ttl: 60000, maxSize: 10 },
        hotReload: { enabled: false, watchPaths: [], debounceMs: 1000 },
      });

      const resolved = (customLoader as any).resolvePath('test-package', 'package');
      expect(resolved).toBe('@custom/skills/test-package');
    });
  });
});