/**
 * Comprehensive tests for SkillValidator
 * Tests all validation functionality including schema validation,
 * compatibility checking, dependency resolution, and performance validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SkillValidator, validateSkill, checkCompatibility, isValidVersion } from '../../src/skills/validation';
import {
  SkillDefinition,
  AgentRole,
  ValidationCategory,
  SkillValidationRule,
  ValidationError,
} from '../../src/skills/types';

describe('SkillValidator', () => {
  let validator: SkillValidator;
  let validSkill: SkillDefinition;

  beforeEach(() => {
    validator = new SkillValidator();

    // Create a valid skill for testing
    validSkill = {
      id: 'test-skill',
      name: 'Test Skill',
      description: 'A comprehensive test skill for validation',
      domain: 'frontend',
      category: 'ui-patterns',
      version: '1.0.0',
      dependencies: [],
      compatibility: [
        {
          agentRole: 'FrontendDev' as AgentRole,
          level: 'full',
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
          title: 'Basic Usage',
          scenario: 'Basic test scenario',
          steps: ['Step 1', 'Step 2'],
          outcomes: ['Success'],
          relevantFor: ['FrontendDev' as AgentRole],
        },
      ],
      performance: {
        executionTime: { min: 5, max: 15, average: 10 },
        resourceUsage: { memory: 'low', cpu: 'low', network: 'none' },
        complexity: 'simple',
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'Test Author',
        versionHistory: [
          {
            version: '1.0.0',
            releasedAt: new Date(),
            notes: 'Initial release',
          },
        ],
        tags: ['test', 'validation'],
        relatedSkills: {},
        resources: [
          {
            type: 'documentation',
            title: 'Test Documentation',
            description: 'Test resource',
            level: 'beginner',
            estimatedTime: 10,
          },
        ],
      },
      tags: ['test', 'validation'],
    };
  });

  describe('validate method (lines 56-93)', () => {
    it('should return valid result for a valid skill', () => {
      const result = validator.validate(validSkill);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBe(100);
      expect(result.validatedAt).toBeInstanceOf(Date);
    });

    it('should collect errors from validation rules', () => {
      const invalidSkill = {
        ...validSkill,
        id: '',
        name: '',
        description: '',
      };

      const result = validator.validate(invalidSkill);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(100);
    });

    it('should collect warnings from validation rules', () => {
      const skillWithWarnings = {
        ...validSkill,
        examples: [],
        metadata: {
          ...validSkill.metadata,
          resources: [],
          tags: [],
        },
      };

      const result = validator.validate(skillWithWarnings);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(100);
    });

    it('should handle validation rule exceptions gracefully', () => {
      const faultyRule: SkillValidationRule = {
        id: 'faulty-rule',
        category: 'schema',
        description: 'A rule that throws an error',
        validate: () => {
          throw new Error('Validation error');
        },
        severity: 'error',
        required: true,
      };

      validator.addRule(faultyRule);

      const result = validator.validate(validSkill);

      expect(result.errors.some(e => e.message.includes("Validation rule 'faulty-rule' failed"))).toBe(true);
    });

    it('should calculate validation score correctly', () => {
      const skillWithMixedIssues = {
        ...validSkill,
        id: '', // Error
        examples: [], // Warning
      };

      const result = validator.validate(skillWithMixedIssues);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThan(100);
    });
  });

  describe('validateCompatibility method (lines 103-149)', () => {
    it('should return compatible result for matching agent role', () => {
      const result = validator.validateCompatibility(validSkill, 'FrontendDev' as AgentRole);

      expect(result.compatible).toBe(true);
      expect(result.level).toBe('full');
      expect(result.issues).toHaveLength(0);
    });

    it('should return incompatible for missing agent role', () => {
      const result = validator.validateCompatibility(validSkill, 'BackendDev' as AgentRole);

      expect(result.compatible).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].category).toBe('compatibility');
      expect(result.issues[0].severity).toBe('error');
    });

    it('should warn about restrictions', () => {
      const skillWithRestrictions = {
        ...validSkill,
        compatibility: [
          {
            agentRole: 'FrontendDev' as AgentRole,
            level: 'partial',
            restrictions: ['No access to database', 'Limited API calls'],
          },
        ],
      };

      const result = validator.validateCompatibility(skillWithRestrictions, 'FrontendDev' as AgentRole);

      expect(result.compatible).toBe(true);
      expect(result.issues.some(i => i.message.includes('restrictions'))).toBe(true);
      expect(result.issues.some(i => i.severity === 'warning')).toBe(true);
    });

    it('should warn about limited compatibility', () => {
      const skillWithLimitedCompatibility = {
        ...validSkill,
        compatibility: [
          {
            agentRole: 'FrontendDev' as AgentRole,
            level: 'limited',
          },
        ],
      };

      const result = validator.validateCompatibility(skillWithLimitedCompatibility, 'FrontendDev' as AgentRole);

      expect(result.compatible).toBe(true);
      expect(result.level).toBe('limited');
      expect(result.issues.some(i => i.message.includes('Limited compatibility'))).toBe(true);
    });
  });

  describe('validateDependencies method (lines 159-209)', () => {
    it('should return valid for skill with no dependencies', () => {
      const result = validator.validateDependencies(validSkill, []);

      expect(result.valid).toBe(true);
      expect(result.missingDependencies).toHaveLength(0);
      expect(result.circularDependencies).toHaveLength(0);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect missing required dependencies', () => {
      const skillWithDependencies = {
        ...validSkill,
        dependencies: [
          {
            skillId: 'missing-skill',
            required: true,
            reason: 'Required for testing',
          },
        ],
      };

      const result = validator.validateDependencies(skillWithDependencies, []);

      expect(result.valid).toBe(false);
      expect(result.missingDependencies).toContain('missing-skill');
      expect(result.issues.some(i => i.severity === 'error')).toBe(true);
    });

    it('should warn about missing optional dependencies', () => {
      const skillWithOptionalDependencies = {
        ...validSkill,
        dependencies: [
          {
            skillId: 'optional-skill',
            required: false,
            reason: 'Optional enhancement',
          },
        ],
      };

      const result = validator.validateDependencies(skillWithOptionalDependencies, []);

      expect(result.valid).toBe(true);
      expect(result.issues.some(i => i.severity === 'warning')).toBe(true);
    });

    it('should detect circular dependencies', () => {
      const skillWithCircularDependency = {
        ...validSkill,
        dependencies: [
          {
            skillId: 'test-skill', // Self-dependency
            required: true,
            reason: 'Circular dependency test',
          },
        ],
      };

      const result = validator.validateDependencies(skillWithCircularDependency, []);

      expect(result.valid).toBe(false);
      expect(result.circularDependencies).toContain('test-skill');
      expect(result.issues.some(i => i.message.includes('cannot depend on itself'))).toBe(true);
    });

    it('should validate successfully with available dependencies', () => {
      const skillWithDependencies = {
        ...validSkill,
        dependencies: [
          {
            skillId: 'available-skill',
            required: true,
            reason: 'Required dependency',
          },
          {
            skillId: 'optional-skill',
            required: false,
            reason: 'Optional dependency',
          },
        ],
      };

      const result = validator.validateDependencies(skillWithDependencies, [
        'available-skill',
        'optional-skill',
      ]);

      expect(result.valid).toBe(true);
      expect(result.missingDependencies).toHaveLength(0);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('Rule management methods (lines 225, 233, 242)', () => {
    it('should add custom validation rule', () => {
      const customRule: SkillValidationRule = {
        id: 'custom-test-rule',
        category: 'schema',
        description: 'Custom test rule',
        validate: () => [],
        severity: 'error',
        required: true,
      };

      validator.addRule(customRule);
      const allRules = validator.getAllRules();

      expect(allRules.some(r => r.id === 'custom-test-rule')).toBe(true);
    });

    it('should remove validation rule', () => {
      const initialRuleCount = validator.getAllRules().length;
      validator.removeRule('skill-id-required');

      expect(validator.getAllRules().length).toBe(initialRuleCount - 1);
      expect(validator.getAllRules().some(r => r.id === 'skill-id-required')).toBe(false);
    });

    it('should get rules by category', () => {
      const schemaRules = validator.getRulesByCategory('schema');

      expect(schemaRules.every(r => r.category === 'schema')).toBe(true);
      expect(schemaRules.length).toBeGreaterThan(0);
    });
  });

  describe('validatePerformance method (lines 251-309)', () => {
    it('should validate normal performance characteristics', () => {
      const result = validator.validatePerformance(validSkill);

      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect invalid execution time range', () => {
      const skillWithInvalidPerformance = {
        ...validSkill,
        performance: {
          ...validSkill.performance,
          executionTime: { min: 20, max: 10, average: 15 },
        },
      };

      const result = validator.validatePerformance(skillWithInvalidPerformance);

      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.message.includes('Minimum execution time cannot be greater'))).toBe(true);
    });

    it('should warn about very long execution times', () => {
      const skillWithLongExecution = {
        ...validSkill,
        performance: {
          ...validSkill.performance,
          executionTime: { min: 60, max: 400, average: 200 },
        },
      };

      const result = validator.validatePerformance(skillWithLongExecution);

      expect(result.issues.some(i => i.message.includes('Maximum execution time is very long'))).toBe(true);
      expect(result.issues.some(i => i.severity === 'warning')).toBe(true);
    });

    it('should warn about high resource usage in multiple areas', () => {
      const skillWithHighResourceUsage = {
        ...validSkill,
        performance: {
          ...validSkill.performance,
          resourceUsage: { memory: 'high', cpu: 'high', network: 'high' },
        },
      };

      const result = validator.validatePerformance(skillWithHighResourceUsage);

      expect(result.issues.some(i => i.message.includes('High resource usage in multiple areas'))).toBe(true);
      expect(result.issues.some(i => i.severity === 'warning')).toBe(true);
    });

    it('should warn about simple skills with high resource usage', () => {
      const skillWithMismatchedResources = {
        ...validSkill,
        performance: {
          ...validSkill.performance,
          complexity: 'simple',
          resourceUsage: { memory: 'high', cpu: 'low', network: 'none' },
        },
      };

      const result = validator.validatePerformance(skillWithMismatchedResources);

      expect(result.issues.some(i => i.message.includes('Simple skill has high resource usage'))).toBe(true);
      expect(result.issues.some(i => i.severity === 'warning')).toBe(true);
    });
  });

  describe('Default validation rules (lines 333-343, 354-364, 380-390, 401-411, 427-437, 453-463, 479-489, 505-515, 526-536)', () => {
    it('should validate skill ID requirement', () => {
      const skillWithoutId = { ...validSkill, id: '' };
      const result = validator.validate(skillWithoutId);

      expect(result.errors.some(e => e.message.includes('Skill ID is required'))).toBe(true);
    });

    it('should validate skill name requirement', () => {
      const skillWithoutName = { ...validSkill, name: '' };
      const result = validator.validate(skillWithoutName);

      expect(result.errors.some(e => e.message.includes('Skill name is required'))).toBe(true);
    });

    it('should validate skill description requirement', () => {
      const skillWithoutDescription = { ...validSkill, description: '' };
      const result = validator.validate(skillWithoutDescription);

      expect(result.errors.some(e => e.message.includes('Skill description is required'))).toBe(true);
    });

    it('should validate version format', () => {
      const skillWithInvalidVersion = { ...validSkill, version: 'invalid-version' };
      const result = validator.validate(skillWithInvalidVersion);

      expect(result.errors.some(e => e.message.includes('Invalid skill version format'))).toBe(true);
    });

    it('should accept valid semantic versions', () => {
      const validVersions = ['1.0.0', '2.1.3', '1.0.0-alpha', '1.0.0-beta.1', '1.0.0+build.1'];

      validVersions.forEach(version => {
        const skillWithVersion = { ...validSkill, version };
        const result = validator.validate(skillWithVersion);
        expect(result.errors.some(e => e.message.includes('Invalid skill version format'))).toBe(false);
      });
    });

    it('should validate compatibility requirement', () => {
      const skillWithoutCompatibility = { ...validSkill, compatibility: [] };
      const result = validator.validate(skillWithoutCompatibility);

      expect(result.errors.some(e => e.message.includes('Skill must have at least one agent compatibility'))).toBe(true);
    });

    it('should validate capabilities requirement', () => {
      const skillWithoutCapabilities = { ...validSkill, capabilities: [] };
      const result = validator.validate(skillWithoutCapabilities);

      expect(result.errors.some(e => e.message.includes('Skill must have at least one capability'))).toBe(true);
    });

    it('should warn about missing examples', () => {
      const skillWithoutExamples = { ...validSkill, examples: [] };
      const result = validator.validate(skillWithoutExamples);

      expect(result.warnings.some(w => w.message.includes('Skills should include usage examples'))).toBe(true);
    });

    it('should warn about missing resources', () => {
      const skillWithoutResources = {
        ...validSkill,
        metadata: { ...validSkill.metadata, resources: [] },
      };
      const result = validator.validate(skillWithoutResources);

      expect(result.warnings.some(w => w.message.includes('Skills should include learning resources'))).toBe(true);
    });

    it('should warn about missing tags', () => {
      const skillWithoutTags = {
        ...validSkill,
        metadata: { ...validSkill.metadata, tags: [] },
        tags: [],
      };
      const result = validator.validate(skillWithoutTags);

      expect(result.warnings.some(w => w.message.includes('Skills should include descriptive tags'))).toBe(true);
    });
  });

  describe('Version validation (lines 547-548)', () => {
    it('should validate semantic version patterns', () => {
      expect(isValidVersion('1.0.0')).toBe(true);
      expect(isValidVersion('1.0.0-alpha')).toBe(true);
      expect(isValidVersion('1.0.0-beta.1')).toBe(true);
      expect(isValidVersion('1.0.0+build.1')).toBe(true);
      expect(isValidVersion('1.0.0-alpha.1+build.2')).toBe(true);

      expect(isValidVersion('1.0')).toBe(false);
      expect(isValidVersion('v1.0.0')).toBe(false);
      expect(isValidVersion('1.0.0.0')).toBe(false);
      expect(isValidVersion('invalid')).toBe(false);
    });
  });

  describe('Convenience functions (line 563)', () => {
    it('should provide validateSkill convenience function', () => {
      const result = validateSkill(validSkill);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should provide checkCompatibility convenience function', () => {
      const result = checkCompatibility(validSkill, 'FrontendDev' as AgentRole);

      expect(result.compatible).toBe(true);
      expect(result.level).toBe('full');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null/undefined skill gracefully', () => {
      const nullResult = validator.validate(null as any);
      expect(nullResult.valid).toBe(false);
      expect(nullResult.errors.length).toBeGreaterThan(0);

      const undefinedResult = validator.validate(undefined as any);
      expect(undefinedResult.valid).toBe(false);
      expect(undefinedResult.errors.length).toBeGreaterThan(0);
    });

    it('should handle skill with partial data', () => {
      const partialSkill = {
        id: 'partial-skill',
        // Missing other required fields
      } as any;

      const result = validator.validate(partialSkill);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle skill with extra properties', () => {
      const skillWithExtras = {
        ...validSkill,
        extraProperty: 'extra value',
        anotherExtra: { nested: 'object' },
      };

      const result = validator.validate(skillWithExtras);

      // Should still validate successfully despite extra properties
      expect(result.valid).toBe(true);
    });

    it('should handle empty strings in required fields', () => {
      const skillWithEmptyStrings = {
        ...validSkill,
        id: '   ',
        name: '\t\n',
        description: '   ',
      };

      const result = validator.validate(skillWithEmptyStrings);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
    });
  });

  describe('Complex validation scenarios', () => {
    it('should handle skill with multiple issues', () => {
      const problematicSkill = {
        id: '',
        name: '',
        description: '',
        domain: 'invalid-domain' as any,
        category: 'invalid-category' as any,
        version: 'invalid',
        dependencies: [],
        compatibility: [],
        capabilities: [],
        examples: [],
        performance: {
          executionTime: { min: 100, max: 50, average: 75 },
          resourceUsage: { memory: 'high', cpu: 'high', network: 'high' },
          complexity: 'simple' as const,
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          author: '',
          versionHistory: [],
          tags: [],
          relatedSkills: {},
          resources: [],
        },
        tags: [],
      };

      const result = validator.validate(problematicSkill);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5);
      expect(result.score).toBeLessThan(50);
    });

    it('should handle skill with mixed severity issues', () => {
      const skillWithMixedIssues = {
        ...validSkill,
        id: '', // Error
        examples: [], // Warning
        metadata: {
          ...validSkill.metadata,
          resources: [], // Warning
          tags: [], // Warning
        },
      };

      const result = validator.validate(skillWithMixedIssues);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(100);
    });
  });
});