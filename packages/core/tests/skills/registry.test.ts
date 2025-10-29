/**
 * Comprehensive tests for SkillRegistry class
 * Covers all functionality including validation, registration, search, and dependency resolution
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SkillRegistry, getSkillRegistry, resetSkillRegistry } from '../../src/skills/registry';
import { SkillLoader } from '../../src/skills/loader';
import {
  SkillDefinition,
  AgentRole,
  SkillCompatibilityLevel,
  SkillSearchCriteria,
  SkillValidationResult,
  ValidationError,
  ValidationWarning,
  SkillPerformance,
  SkillDependency,
  AgentCompatibility,
  SkillMetadata,
} from '../../src/skills/types';

// Mock SkillLoader
vi.mock('../../src/skills/loader', () => ({
  SkillLoader: vi.fn().mockImplementation(() => ({
    load: vi.fn(),
  })),
}));

describe('SkillRegistry', () => {
  let registry: SkillRegistry;
  let mockLoader: any;

  beforeEach(() => {
    mockLoader = new SkillLoader() as any;
    registry = new SkillRegistry(mockLoader);
    resetSkillRegistry(); // Reset global registry for each test
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to create a valid skill definition
  const createValidSkill = (overrides: Partial<SkillDefinition> = {}): SkillDefinition => ({
    id: 'test-skill-1',
    name: 'Test Skill',
    description: 'A test skill for testing purposes',
    domain: 'testing',
    category: 'unit-testing',
    version: '1.0.0',
    dependencies: [],
    compatibility: [
      {
        agentRole: 'developer' as AgentRole,
        level: 'full' as SkillCompatibilityLevel,
      },
    ],
    capabilities: [
      {
        id: 'test-capability',
        name: 'Test Capability',
        description: 'A test capability',
        type: 'action',
      },
    ],
    examples: [
      {
        title: 'Basic Example',
        scenario: 'Testing basic functionality',
        steps: ['Step 1', 'Step 2'],
        outcomes: ['Success'],
        relevantFor: ['developer' as AgentRole],
      },
    ],
    performance: {
      executionTime: { min: 1, max: 5, average: 3 },
      resourceUsage: { memory: 'low', cpu: 'low', network: 'none' },
      complexity: 'simple',
    },
    metadata: {
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      author: 'Test Author',
      versionHistory: [
        {
          version: '1.0.0',
          releasedAt: new Date('2023-01-01'),
          notes: 'Initial release',
        },
      ],
      tags: ['test', 'testing'],
      relatedSkills: {},
      resources: [],
      quality: {
        testCoverage: 100,
        documentationScore: 90,
        openIssues: 0,
        communityRating: 5,
        lastAssessed: new Date('2023-01-01'),
        badges: [],
      },
    },
    tags: ['test', 'testing'],
    ...overrides,
  });

  describe('Constructor', () => {
    it('should initialize with default loader when none provided', () => {
      const defaultRegistry = new SkillRegistry();
      expect(defaultRegistry).toBeInstanceOf(SkillRegistry);
    });

    it('should initialize with custom loader', () => {
      const customRegistry = new SkillRegistry(mockLoader);
      expect(customRegistry).toBeInstanceOf(SkillRegistry);
    });

    it('should set loadedAt timestamp', () => {
      const beforeCreation = new Date();
      const testRegistry = new SkillRegistry();
      const afterCreation = new Date();

      const stats = testRegistry.getStats();
      expect(stats.loadedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(stats.loadedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });
  });

  describe('register', () => {
    it('should register a valid skill', () => {
      const skill = createValidSkill();
      expect(() => registry.register(skill)).not.toThrow();

      const retrieved = registry.getSkill(skill.id);
      expect(retrieved).toEqual(skill);
    });

    it('should throw error when registering duplicate skill', () => {
      const skill = createValidSkill();
      registry.register(skill);

      expect(() => registry.register(skill)).toThrow(
        `Skill with id '${skill.id}' is already registered`
      );
    });

    it('should register skill even if validation fails', () => {
      const invalidSkill = createValidSkill({ id: '' });

      // Register should not throw even for invalid skills
      expect(() => registry.register(invalidSkill)).not.toThrow();

      // But validation should detect the issues
      const validation = registry.validateSkill(invalidSkill);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('unregister', () => {
    it('should unregister an existing skill', () => {
      const skill = createValidSkill();
      registry.register(skill);

      expect(() => registry.unregister(skill.id)).not.toThrow();
      expect(registry.getSkill(skill.id)).toBeNull();
    });

    it('should unregister skill by name', () => {
      const skill = createValidSkill();
      registry.register(skill);

      expect(() => registry.unregister(skill.name)).not.toThrow();
      expect(registry.getSkill(skill.name)).toBeNull();
    });

    it('should throw error when unregistering non-existent skill', () => {
      expect(() => registry.unregister('non-existent')).toThrow(
        "Skill 'non-existent' not found in registry"
      );
    });
  });

  describe('findCompatible', () => {
    beforeEach(() => {
      // Register multiple skills with different compatibility levels
      registry.register(
        createValidSkill({
          id: 'full-compatible',
          name: 'Full Compatible Skill',
          compatibility: [
            { agentRole: 'developer' as AgentRole, level: 'full' as SkillCompatibilityLevel },
          ],
        })
      );

      registry.register(
        createValidSkill({
          id: 'partial-compatible',
          name: 'Partial Compatible Skill',
          compatibility: [
            { agentRole: 'developer' as AgentRole, level: 'partial' as SkillCompatibilityLevel },
          ],
        })
      );

      registry.register(
        createValidSkill({
          id: 'limited-compatible',
          name: 'Limited Compatible Skill',
          compatibility: [
            { agentRole: 'developer' as AgentRole, level: 'limited' as SkillCompatibilityLevel },
          ],
        })
      );

      registry.register(
        createValidSkill({
          id: 'different-agent',
          name: 'Different Agent Skill',
          compatibility: [
            { agentRole: 'architect' as AgentRole, level: 'full' as SkillCompatibilityLevel },
          ],
        })
      );
    });

    it('should find all compatible skills for full level', () => {
      const compatible = registry.findCompatible('developer' as AgentRole, 'full');
      expect(compatible).toHaveLength(1);
      expect(compatible[0].id).toBe('full-compatible');
    });

    it('should find compatible skills for partial level', () => {
      const compatible = registry.findCompatible('developer' as AgentRole, 'partial');
      expect(compatible).toHaveLength(2);
      expect(compatible.map(s => s.id)).toEqual(expect.arrayContaining(['full-compatible', 'partial-compatible']));
    });

    it('should find all compatible skills for limited level', () => {
      const compatible = registry.findCompatible('developer' as AgentRole, 'limited');
      expect(compatible).toHaveLength(3);
      expect(compatible.map(s => s.id)).toEqual(expect.arrayContaining([
        'full-compatible', 'partial-compatible', 'limited-compatible'
      ]));
    });

    it('should return empty array for agent with no compatible skills', () => {
      const compatible = registry.findCompatible('product-manager' as AgentRole);
      expect(compatible).toHaveLength(0);
    });

    it('should use partial as default compatibility level', () => {
      const compatible = registry.findCompatible('developer' as AgentRole);
      const partialCompatible = registry.findCompatible('developer' as AgentRole, 'partial');
      expect(compatible).toEqual(partialCompatible);
    });
  });

  describe('resolveDependencies', () => {
    it('should handle skill with no dependencies', () => {
      const skillWithNoDeps = createValidSkill({
        id: 'no-deps-skill',
        dependencies: [],
      });

      registry.register(skillWithNoDeps);
      const resolved = registry.resolveDependencies(skillWithNoDeps);
      expect(resolved).toHaveLength(0);
    });

    it('should handle skill with optional dependencies', () => {
      const skillWithOptional = createValidSkill({
        id: 'skill-with-optional',
        dependencies: [
          { skillId: 'optional-dep', required: false, reason: 'Optional dependency' },
        ],
      });

      registry.register(skillWithOptional);
      const resolved = registry.resolveDependencies(skillWithOptional);
      expect(resolved).toHaveLength(0); // Optional dependencies not included by default
    });

    it('should throw error for missing required dependency', () => {
      const skillWithMissingDep = createValidSkill({
        id: 'skill-with-missing',
        dependencies: [
          { skillId: 'non-existent-skill', required: true, reason: 'Needs missing skill' },
        ],
      });

      expect(() => registry.resolveDependencies(skillWithMissingDep)).toThrow();
    });
  });

  describe('search', () => {
    beforeEach(() => {
      // Register various skills for searching
      registry.register(
        createValidSkill({
          id: 'frontend-react',
          name: 'React Frontend Development',
          description: 'Build React applications',
          domain: 'frontend',
          category: 'ui-patterns',
          tags: ['react', 'javascript', 'ui'],
          compatibility: [
            { agentRole: 'ux-designer' as AgentRole, level: 'full' as SkillCompatibilityLevel },
          ],
          performance: {
            executionTime: { min: 5, max: 15, average: 10 },
            resourceUsage: { memory: 'medium', cpu: 'medium', network: 'low' },
            complexity: 'moderate',
          },
        })
      );

      registry.register(
        createValidSkill({
          id: 'backend-nodejs',
          name: 'Node.js Backend Development',
          description: 'Build Node.js servers',
          domain: 'backend',
          category: 'api-design',
          tags: ['nodejs', 'api'], // Removed 'javascript' tag
          compatibility: [
            { agentRole: 'architect' as AgentRole, level: 'full' as SkillCompatibilityLevel },
          ],
          performance: {
            executionTime: { min: 3, max: 8, average: 5 },
            resourceUsage: { memory: 'low', cpu: 'low', network: 'medium' },
            complexity: 'simple',
          },
        })
      );

      registry.register(
        createValidSkill({
          id: 'testing-jest',
          name: 'Jest Testing Framework',
          description: 'Test with Jest framework',
          domain: 'testing',
          category: 'unit-testing',
          tags: ['testing', 'jest', 'javascript'],
          compatibility: [
            { agentRole: 'developer' as AgentRole, level: 'full' as SkillCompatibilityLevel },
          ],
          performance: {
            executionTime: { min: 1, max: 3, average: 2 },
            resourceUsage: { memory: 'low', cpu: 'low', network: 'none' },
            complexity: 'simple',
          },
        })
      );
    });

    it('should return all skills when no criteria provided', () => {
      const results = registry.search({});
      expect(results).toHaveLength(3);
    });

    it('should filter by query string', () => {
      const results = registry.search({ query: 'javascript' });
      expect(results).toHaveLength(2);
      expect(results.map(s => s.id)).toEqual(expect.arrayContaining(['frontend-react', 'testing-jest']));
    });

    it('should filter by domain', () => {
      const results = registry.search({ domain: 'frontend' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('frontend-react');
    });

    it('should filter by category', () => {
      const results = registry.search({ category: 'unit-testing' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('testing-jest');
    });

    it('should filter by agent role', () => {
      const results = registry.search({ agentRole: 'developer' as AgentRole });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('testing-jest');
    });

    it('should filter by compatibility level', () => {
      const results = registry.search({
        agentRole: 'developer' as AgentRole,
        compatibilityLevel: 'full' as SkillCompatibilityLevel
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('testing-jest');
    });

    it('should filter by tags', () => {
      const results = registry.search({ tags: ['javascript'] });
      expect(results).toHaveLength(2);
      expect(results.map(s => s.id)).toEqual(expect.arrayContaining(['frontend-react', 'testing-jest']));
    });

    it('should filter by complexity', () => {
      const results = registry.search({ complexity: 'simple' });
      expect(results).toHaveLength(2);
    });

    it('should sort results by name', () => {
      const results = registry.search({ sortBy: 'name' });
      expect(results.map(s => s.name)).toEqual([
        'Jest Testing Framework',
        'Node.js Backend Development',
        'React Frontend Development',
      ]);
    });

    it('should sort results by complexity', () => {
      const results = registry.search({ sortBy: 'complexity' });
      expect(results.map(s => s.performance.complexity)).toEqual([
        'simple', 'simple', 'moderate'
      ]);
    });

    it('should limit results', () => {
      const results = registry.search({ limit: 2 });
      expect(results).toHaveLength(2);
    });

    it('should apply multiple filters together', () => {
      const results = registry.search({
        query: 'javascript',
        domain: 'frontend',
        sortBy: 'name',
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('frontend-react');
    });
  });

  describe('getSkill', () => {
    beforeEach(() => {
      const skill = createValidSkill({ id: 'test-id', name: 'Test Name' });
      registry.register(skill);
    });

    it('should get skill by ID', () => {
      const skill = registry.getSkill('test-id');
      expect(skill).toBeTruthy();
      expect(skill!.id).toBe('test-id');
    });

    it('should get skill by name', () => {
      const skill = registry.getSkill('Test Name');
      expect(skill).toBeTruthy();
      expect(skill!.name).toBe('Test Name');
    });

    it('should return null for non-existent skill', () => {
      const skill = registry.getSkill('non-existent');
      expect(skill).toBeNull();
    });
  });

  describe('loadSkill', () => {
    it('should load and register a skill', async () => {
      const mockSkill = createValidSkill({ id: 'loaded-skill' });
      mockLoader.load.mockResolvedValue(mockSkill);

      const result = await registry.loadSkill({
        identifier: 'loaded-skill',
        options: {}
      });

      expect(result).toEqual(mockSkill);
      expect(registry.getSkill('loaded-skill')).toEqual(mockSkill);
    });

    it('should skip validation when requested', async () => {
      const invalidSkill = createValidSkill({ id: 'invalid-skill', name: '' });
      mockLoader.load.mockResolvedValue(invalidSkill);

      const result = await registry.loadSkill({
        identifier: 'invalid-skill',
        options: { skipValidation: true }
      });

      expect(result).toEqual(invalidSkill);
      expect(registry.getSkill('invalid-skill')).toEqual(invalidSkill);
    });

    it('should throw error when validation fails', async () => {
      const invalidSkill = createValidSkill({ id: 'invalid-skill', name: '' });
      mockLoader.load.mockResolvedValue(invalidSkill);

      await expect(
        registry.loadSkill({
          identifier: 'invalid-skill',
          options: { skipValidation: false }
        })
      ).rejects.toThrow('Skill validation failed');
    });
  });

  describe('getAllSkills', () => {
    it('should return empty array when no skills registered', () => {
      const skills = registry.getAllSkills();
      expect(skills).toHaveLength(0);
    });

    it('should return all registered skills', () => {
      const skill1 = createValidSkill({ id: 'skill-1' });
      const skill2 = createValidSkill({ id: 'skill-2' });

      registry.register(skill1);
      registry.register(skill2);

      const skills = registry.getAllSkills();
      expect(skills).toHaveLength(2);
      expect(skills.map(s => s.id)).toEqual(expect.arrayContaining(['skill-1', 'skill-2']));
    });
  });

  describe('getSkillsByDomain', () => {
    beforeEach(() => {
      registry.register(createValidSkill({ id: 'frontend-1', domain: 'frontend' }));
      registry.register(createValidSkill({ id: 'frontend-2', domain: 'frontend' }));
      registry.register(createValidSkill({ id: 'backend-1', domain: 'backend' }));
    });

    it('should return skills in specified domain', () => {
      const frontendSkills = registry.getSkillsByDomain('frontend');
      expect(frontendSkills).toHaveLength(2);
      expect(frontendSkills.map(s => s.id)).toEqual(['frontend-1', 'frontend-2']);
    });

    it('should return empty array for domain with no skills', () => {
      const testingSkills = registry.getSkillsByDomain('testing');
      expect(testingSkills).toHaveLength(0);
    });
  });

  describe('getSkillsByCategory', () => {
    beforeEach(() => {
      registry.register(createValidSkill({ id: 'test-1', category: 'unit-testing' }));
      registry.register(createValidSkill({ id: 'test-2', category: 'integration-testing' }));
      registry.register(createValidSkill({ id: 'api-1', category: 'api-design' }));
    });

    it('should return skills in specified category', () => {
      const testSkills = registry.getSkillsByCategory('unit-testing');
      expect(testSkills).toHaveLength(1);
      expect(testSkills[0].id).toBe('test-1');
    });

    it('should return empty array for category with no skills', () => {
      const uxSkills = registry.getSkillsByCategory('user-research');
      expect(uxSkills).toHaveLength(0);
    });
  });

  describe('validateSkill', () => {
    it('should validate a correct skill', () => {
      const skill = createValidSkill();
      const result = registry.validateSkill(skill);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBe(100);
    });

    it('should detect missing required fields', () => {
      const invalidSkill = {
        id: '',
        name: '',
        description: '',
        domain: 'testing',
        category: 'unit-testing',
        version: '1.0.0',
        dependencies: [],
        compatibility: [
          { agentRole: 'developer' as AgentRole, level: 'full' as SkillCompatibilityLevel },
        ],
        capabilities: [],
        examples: [],
        performance: {
          executionTime: { min: 1, max: 5, average: 3 },
          resourceUsage: { memory: 'low', cpu: 'low', network: 'none' },
          complexity: 'simple',
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          author: 'Test',
          versionHistory: [],
          tags: [],
          relatedSkills: {},
          resources: [],
        },
        tags: [],
      } as SkillDefinition;

      const result = registry.validateSkill(invalidSkill);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('Skill ID is required'))).toBe(true);
      expect(result.errors.some(e => e.message.includes('Skill name is required'))).toBe(true);
      expect(result.errors.some(e => e.message.includes('Skill description is required'))).toBe(true);
    });

    it('should validate version format', () => {
      const skill = createValidSkill({ version: 'invalid-version' });
      const result = registry.validateSkill(skill);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Invalid skill version format'))).toBe(true);
    });

    it('should detect missing compatibility', () => {
      const skill = createValidSkill({ compatibility: [] });
      const result = registry.validateSkill(skill);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('at least one agent compatibility'))).toBe(true);
    });

    it('should validate performance information', () => {
      const skill = createValidSkill();
      // Remove performance to make it invalid
      (skill as any).performance = undefined;

      const result = registry.validateSkill(skill);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('performance information is required'))).toBe(true);
    });

    it('should validate execution time values', () => {
      const skill = createValidSkill({
        performance: {
          executionTime: { min: 10, max: 5, average: 3 }, // min > max
          resourceUsage: { memory: 'low', cpu: 'low', network: 'none' },
          complexity: 'simple',
        },
      });

      const result = registry.validateSkill(skill);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Minimum execution time cannot be greater'))).toBe(true);
    });

    it('should validate positive execution time values', () => {
      const skill = createValidSkill({
        performance: {
          executionTime: { min: -1, max: 5, average: 3 }, // negative value
          resourceUsage: { memory: 'low', cpu: 'low', network: 'none' },
          complexity: 'simple',
        },
      });

      const result = registry.validateSkill(skill);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Execution time values must be positive'))).toBe(true);
    });

    it('should warn about optional dependency naming', () => {
      const skill = createValidSkill({
        dependencies: [
          { skillId: 'regular-dep', required: false, reason: 'Test' }, // Not prefixed with 'optional-'
        ],
      });

      const result = registry.validateSkill(skill);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.message.includes('should be prefixed with \'optional-\''))).toBe(true);
    });

    it('should calculate validation score correctly', () => {
      const skill = createValidSkill({ id: '' }); // One error
      const result = registry.validateSkill(skill);

      expect(result.score).toBe(80); // 100 - (1 error * 20)
    });
  });

  describe('clear', () => {
    it('should clear all registered skills', () => {
      registry.register(createValidSkill({ id: 'skill-1' }));
      registry.register(createValidSkill({ id: 'skill-2' }));

      expect(registry.getAllSkills()).toHaveLength(2);

      registry.clear();

      expect(registry.getAllSkills()).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics for empty registry', () => {
      const stats = registry.getStats();

      expect(stats.totalSkills).toBe(0);
      expect(stats.domains).toBe(0);
      expect(stats.categories).toBe(0);
      expect(stats.loadedAt).toBeInstanceOf(Date);
      expect(stats.memoryUsage).toBeDefined();
    });

    it('should return correct statistics for populated registry', () => {
      registry.register(createValidSkill({ id: 'skill-1', domain: 'frontend', category: 'ui-patterns' }));
      registry.register(createValidSkill({ id: 'skill-2', domain: 'frontend', category: 'styling' }));
      registry.register(createValidSkill({ id: 'skill-3', domain: 'backend', category: 'api-design' }));

      const stats = registry.getStats();

      expect(stats.totalSkills).toBe(3);
      expect(stats.domains).toBe(2); // frontend, backend
      expect(stats.categories).toBe(3); // ui-patterns, styling, api-design
    });
  });

  describe('Global Registry Functions', () => {
    it('should return singleton instance', () => {
      const registry1 = getSkillRegistry();
      const registry2 = getSkillRegistry();

      expect(registry1).toBe(registry2);
    });

    it('should reset global registry', () => {
      const registry1 = getSkillRegistry();
      resetSkillRegistry();
      const registry2 = getSkillRegistry();

      expect(registry1).not.toBe(registry2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle skills with no dependencies', () => {
      const simpleSkill = createValidSkill({ id: 'simple-skill', dependencies: [] });
      registry.register(simpleSkill);

      const resolved = registry.resolveDependencies(simpleSkill);
      expect(resolved).toHaveLength(0);
    });

    it('should handle self-referencing dependencies', () => {
      const selfReferencing = createValidSkill({
        id: 'self-ref',
        dependencies: [{ skillId: 'self-ref', required: true, reason: 'References self' }],
      });

      registry.register(selfReferencing);

      expect(() => registry.resolveDependencies(selfReferencing)).toThrow(
        "Circular dependency detected involving skill 'self-ref'"
      );
    });

    it('should handle empty search criteria', () => {
      registry.register(createValidSkill({ id: 'skill-1' }));

      const results = registry.search({});
      expect(results).toHaveLength(1);
    });

    it('should handle search with no matches', () => {
      registry.register(createValidSkill({ id: 'skill-1' }));

      const results = registry.search({ query: 'non-existent-term' });
      expect(results).toHaveLength(0);
    });

    it('should handle invalid sort criteria', () => {
      registry.register(createValidSkill({ id: 'skill-1' }));

      // Should not throw when using invalid sort
      const results = registry.search({ sortBy: 'invalid-sort' });
      expect(results).toHaveLength(1);
    });

    it('should handle skills with metadata usage statistics', () => {
      const skillWithUsage = createValidSkill({
        id: 'skill-with-usage',
        metadata: {
          ...createValidSkill().metadata,
          usage: {
            totalUses: 100,
            uniqueAgents: 10,
            satisfactionRating: 4.5,
            commonUseCases: ['testing', 'development'],
            trend: 'increasing',
            lastUpdated: new Date(),
          },
        },
      });

      registry.register(skillWithUsage);

      // Test sorting by usage
      const results = registry.search({ sortBy: 'usage' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('skill-with-usage');
    });

    it('should handle version comparison correctly', () => {
      const v1Skill = createValidSkill({ id: 'v1-skill', version: '1.0.0' });
      const v2Skill = createValidSkill({ id: 'v2-skill', version: '2.0.0' });

      registry.register(v2Skill);
      registry.register(v1Skill);

      const results = registry.search({ sortBy: 'version' });
      expect(results[0].version).toBe('1.0.0');
      expect(results[1].version).toBe('2.0.0');
    });
  });
});