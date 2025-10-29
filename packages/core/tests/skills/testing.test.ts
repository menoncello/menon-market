/**
 * Tests for skills testing module
 * Comprehensive test coverage for SkillTester class and related functionality
 */

import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import type {
  SkillDefinition,
  SkillValidationResult,
  AgentRole,
  SkillPerformance,
  SkillCapability,
  AgentCompatibility,
  SkillMetadata
} from '../../src/skills/types';
import {
  SkillTester,
  TestOptions,
  SkillTestResult,
  TestEnvironment,
  TestError,
  CompatibilityTestResult,
  PerformanceTestResult,
  CapabilityTestResult,
  testSkill,
  defaultSkillTester
} from '../../src/skills/testing';
import { SkillValidator } from '../../src/skills/validation';
import { SkillRegistry } from '../../src/skills/registry';

describe('SkillTester', () => {
  let skillTester: SkillTester;
  let mockValidator: SkillValidator;
  let mockRegistry: SkillRegistry;

  // Sample skill for testing
  const sampleSkill: SkillDefinition = {
    id: 'test-skill-001',
    name: 'Test Skill',
    description: 'A skill for testing purposes',
    domain: 'testing',
    category: 'unit-testing',
    version: '1.0.0',
    dependencies: [],
    compatibility: [
      {
        agentRole: 'FrontendDev',
        level: 'full',
        enhancements: ['enhanced-testing']
      },
      {
        agentRole: 'BackendDev',
        level: 'partial',
        restrictions: ['limited-frontend-features']
      }
    ],
    capabilities: [
      {
        id: 'test-action',
        name: 'Test Action',
        description: 'Action capability for testing',
        type: 'action',
        implementation: {
          approach: 'direct',
          tools: ['jest', 'bun-test']
        }
      },
      {
        id: 'test-knowledge',
        name: 'Test Knowledge',
        description: 'Knowledge capability for testing',
        type: 'knowledge'
      }
    ],
    examples: [],
    performance: {
      executionTime: { min: 1, max: 5, average: 3 },
      resourceUsage: {
        memory: 'low',
        cpu: 'low',
        network: 'none'
      },
      complexity: 'simple',
      successRate: 95
    },
    metadata: {
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      author: 'test-author',
      versionHistory: [],
      tags: ['testing', 'unit-test'],
      relatedSkills: {},
      resources: [],
      quality: {
        testCoverage: 100,
        documentationScore: 90,
        openIssues: 0,
        communityRating: 4.5,
        lastAssessed: new Date('2024-01-01'),
        badges: []
      }
    },
    tags: ['testing', 'unit']
  };

  beforeEach(() => {
    // Create fresh mocks
    mockValidator = {
      validate: mock(() => ({
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      }))
    } as any;

    mockRegistry = {} as any;

    skillTester = new SkillTester(mockValidator, mockRegistry);
  });

  describe('Constructor', () => {
    it('should create instance with provided validator', () => {
      // GIVEN: A custom validator
      const customValidator = new SkillValidator();

      // WHEN: Creating SkillTester with custom validator
      const tester = new SkillTester(customValidator);

      // THEN: Should create instance successfully
      expect(tester).toBeInstanceOf(SkillTester);
    });

    it('should create default validator when none provided', () => {
      // WHEN: Creating SkillTester without validator
      const tester = new SkillTester();

      // THEN: Should create instance successfully
      expect(tester).toBeInstanceOf(SkillTester);
    });
  });

  describe('testSkill', () => {
    it('should run comprehensive test on skill', async () => {
      // GIVEN: A valid skill and mock validation result
      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing the skill
      const result = await skillTester.testSkill(sampleSkill);

      // THEN: Should return complete test result
      expect(result.skillId).toBe('test-skill-001');
      expect(result.validation).toEqual(validationResult);
      expect(result.compatibility).toBeInstanceOf(Array);
      expect(result.performance).toBeInstanceOf(Object);
      expect(result.capabilities).toBeInstanceOf(Array);
      expect(typeof result.executionTime).toBe('number');
      expect(result.environment).toBeInstanceOf(Object);
      expect(result.errors).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.executedAt).toBeInstanceOf(Date);
    });

    it('should handle test execution with skip options', async () => {
      // GIVEN: Test options to skip validation and performance
      const options: TestOptions = {
        skipValidation: true,
        skipPerformance: true,
        skipCompatibility: true,
        skipCapabilities: true
      };

      // WHEN: Testing with skip options
      const result = await skillTester.testSkill(sampleSkill, options);

      // THEN: Should skip specified tests
      expect(result.skillId).toBe('test-skill-001');
      expect(result.success).toBe(true);
      expect(mockValidator.validate).toHaveBeenCalledTimes(0);
    });

    it('should mark test as failed when validation fails', async () => {
      // GIVEN: Mock validation failure
      const validationResult: SkillValidationResult = {
        valid: false,
        errors: [{ category: 'schema', message: 'Invalid skill', severity: 'error' }],
        warnings: [],
        score: 0,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing invalid skill
      const result = await skillTester.testSkill(sampleSkill);

      // THEN: Should mark test as failed
      expect(result.success).toBe(false);
      expect(result.validation.valid).toBe(false);
      expect(result.errors).toContainEqual({
        type: 'validation',
        message: 'Skill validation failed',
        severity: 'critical',
        component: 'validation'
      });
    });

    it('should store test result in internal map', async () => {
      // GIVEN: Mock successful validation
      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing skill
      await skillTester.testSkill(sampleSkill);

      // THEN: Should store result
      const storedResult = skillTester.getTestResult(sampleSkill.id);
      expect(storedResult).toBeTruthy();
      expect(storedResult?.skillId).toBe(sampleSkill.id);
    });
  });

  describe('testSkillsBatch', () => {
    it('should test multiple skills sequentially', async () => {
      // GIVEN: Multiple skills and mock validation
      const skill2 = { ...sampleSkill, id: 'test-skill-002' };
      const skills = [sampleSkill, skill2];

      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing batch without parallel option
      const results = await skillTester.testSkillsBatch(skills);

      // THEN: Should test all skills sequentially
      expect(results).toHaveLength(2);
      expect(results[0].skillId).toBe('test-skill-001');
      expect(results[1].skillId).toBe('test-skill-002');
    });

    it('should test multiple skills in parallel when enabled', async () => {
      // GIVEN: Multiple skills and mock validation
      const skill2 = { ...sampleSkill, id: 'test-skill-002' };
      const skills = [sampleSkill, skill2];

      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing batch with parallel option
      const options = { parallel: true };
      const results = await skillTester.testSkillsBatch(skills, options);

      // THEN: Should test all skills
      expect(results).toHaveLength(2);
      expect(results[0].skillId).toBe('test-skill-001');
      expect(results[1].skillId).toBe('test-skill-002');
    });

    it('should handle empty skill array', async () => {
      // WHEN: Testing empty array
      const results = await skillTester.testSkillsBatch([]);

      // THEN: Should return empty array
      expect(results).toHaveLength(0);
    });
  });

  describe('Result management methods', () => {
    beforeEach(async () => {
      // Setup: Store a test result
      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);
      await skillTester.testSkill(sampleSkill);
    });

    it('should retrieve specific test result', () => {
      // WHEN: Getting test result by ID
      const result = skillTester.getTestResult(sampleSkill.id);

      // THEN: Should return correct result
      expect(result).toBeTruthy();
      expect(result?.skillId).toBe(sampleSkill.id);
    });

    it('should return null for non-existent test result', () => {
      // WHEN: Getting non-existent test result
      const result = skillTester.getTestResult('non-existent');

      // THEN: Should return null
      expect(result).toBeNull();
    });

    it('should retrieve all test results', () => {
      // WHEN: Getting all test results
      const results = skillTester.getAllTestResults();

      // THEN: Should return array with stored results
      expect(results).toHaveLength(1);
      expect(results[0].skillId).toBe(sampleSkill.id);
    });

    it('should clear all test results', () => {
      // WHEN: Clearing results
      skillTester.clearResults();

      // THEN: Should have no results
      const allResults = skillTester.getAllTestResults();
      expect(allResults).toHaveLength(0);

      const specificResult = skillTester.getTestResult(sampleSkill.id);
      expect(specificResult).toBeNull();
    });
  });

  describe('Report generation', () => {
    beforeEach(async () => {
      // Setup: Store test results
      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);
      await skillTester.testSkill(sampleSkill);
    });

    it('should generate report for all skills', () => {
      // WHEN: Generating report without skill ID
      const report = skillTester.generateReport();

      // THEN: Should include summary and skill details
      expect(report).toContain('# Skill Test Report');
      expect(report).toContain('Total Skills Tested: 1');
      expect(report).toContain('## Summary');
      expect(report).toContain('test-skill-001');
    });

    it('should generate report for specific skill', () => {
      // WHEN: Generating report for specific skill
      const report = skillTester.generateReport(sampleSkill.id);

      // THEN: Should include only that skill
      expect(report).toContain('test-skill-001');
      expect(report).toContain('## Summary');
    });

    it('should return message when no results available', () => {
      // GIVEN: Clear all results
      skillTester.clearResults();

      // WHEN: Generating report
      const report = skillTester.generateReport();

      // THEN: Should return no results message
      expect(report).toBe('No test results available');
    });

    it('should include validation section in report', () => {
      // WHEN: Generating report
      const report = skillTester.generateReport();

      // THEN: Should include validation details
      expect(report).toContain('### Validation');
      expect(report).toContain('Valid: Yes');
      expect(report).toContain('Errors: 0');
    });

    it('should include compatibility section in report', () => {
      // WHEN: Generating report
      const report = skillTester.generateReport();

      // THEN: Should include compatibility details
      expect(report).toContain('### Compatibility');
      expect(report).toContain('FrontendDev: full (✅)');
      expect(report).toContain('BackendDev: partial (❌)');
    });

    it('should include performance section in report', () => {
      // WHEN: Generating report
      const report = skillTester.generateReport();

      // THEN: Should include performance details
      expect(report).toContain('### Performance');
      expect(report).toContain('Expected: 1-5s');
      expect(report).toContain('Score:');
    });
  });

  describe('Performance testing', () => {
    it('should test performance within expected ranges', async () => {
      // GIVEN: Mock validation
      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing skill
      const result = await skillTester.testSkill(sampleSkill, {
        skipCompatibility: true,
        skipCapabilities: true
      });

      // THEN: Should measure performance
      expect(result.performance.actual.executionTime).toBeGreaterThanOrEqual(0);
      expect(result.performance.actual.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(result.performance.actual.cpuUsage).toBe(0);
      expect(result.performance.score).toBeGreaterThanOrEqual(0);
      expect(result.performance.withinExpected).toBeDefined();
    });

    it('should generate performance issues when outside expected range', async () => {
      // GIVEN: Skill with very fast expected time
      const fastSkill = {
        ...sampleSkill,
        performance: {
          ...sampleSkill.performance,
          executionTime: { min: 10, max: 20, average: 15 } // Very slow expected time
        }
      };

      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing skill with fast execution
      const result = await skillTester.testSkill(fastSkill, {
        skipCompatibility: true,
        skipCapabilities: true
      });

      // THEN: Should detect performance issues
      expect(result.performance.issues.length).toBeGreaterThan(0);
      expect(result.performance.score).toBeLessThan(100);
    });
  });

  describe('Capability testing', () => {
    it('should test action capabilities', async () => {
      // GIVEN: Mock validation
      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing skill with action capability
      const result = await skillTester.testSkill(sampleSkill, {
        skipValidation: true,
        skipCompatibility: true,
        skipPerformance: true
      });

      // THEN: Should test action capability successfully
      const actionCapability = result.capabilities.find(c => c.capabilityId === 'test-action');
      expect(actionCapability).toBeTruthy();
      expect(actionCapability?.success).toBe(true);
      expect(actionCapability?.result).toContain('executed successfully');
    });

    it('should test knowledge capabilities', async () => {
      // GIVEN: Mock validation
      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing skill with knowledge capability
      const result = await skillTester.testSkill(sampleSkill, {
        skipValidation: true,
        skipCompatibility: true,
        skipPerformance: true
      });

      // THEN: Should test knowledge capability successfully
      const knowledgeCapability = result.capabilities.find(c => c.capabilityId === 'test-knowledge');
      expect(knowledgeCapability).toBeTruthy();
      expect(knowledgeCapability?.success).toBe(true);
      expect(typeof knowledgeCapability?.result).toBe('object');
    });

    it('should handle unknown capability types', async () => {
      // GIVEN: Skill with unknown capability type
      const skillWithUnknownCap = {
        ...sampleSkill,
        capabilities: [
          {
            id: 'unknown-cap',
            name: 'Unknown Capability',
            description: 'Unknown capability type',
            type: 'unknown' as any
          }
        ]
      };

      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing skill with unknown capability
      const result = await skillTester.testSkill(skillWithUnknownCap, {
        skipValidation: true,
        skipCompatibility: true,
        skipPerformance: true
      });

      // THEN: Should handle unknown capability gracefully
      const unknownCapability = result.capabilities.find(c => c.capabilityId === 'unknown-cap');
      expect(unknownCapability).toBeTruthy();
      expect(unknownCapability?.success).toBe(false);
      expect(unknownCapability?.issues).toContain('Unknown capability type: unknown');
    });

    it('should test tool capabilities', async () => {
      // GIVEN: Skill with tool capability
      const skillWithToolCap = {
        ...sampleSkill,
        capabilities: [
          {
            id: 'tool-cap',
            name: 'Tool Capability',
            description: 'Tool capability for testing',
            type: 'tool' as const,
            implementation: {
              approach: 'tool-based',
              tools: ['npm', 'git', 'vscode']
            }
          }
        ]
      };

      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing skill with tool capability
      const result = await skillTester.testSkill(skillWithToolCap, {
        skipValidation: true,
        skipCompatibility: true,
        skipPerformance: true
      });

      // THEN: Should test tool capability successfully
      const toolCapability = result.capabilities.find(c => c.capabilityId === 'tool-cap');
      expect(toolCapability).toBeTruthy();
      expect(toolCapability?.success).toBe(true);
      expect(toolCapability?.result).toContain('Tools available: npm, git, vscode');
    });

    it('should test pattern capabilities', async () => {
      // GIVEN: Skill with pattern capability
      const skillWithPatternCap = {
        ...sampleSkill,
        capabilities: [
          {
            id: 'pattern-cap',
            name: 'Pattern Capability',
            description: 'Pattern capability for testing',
            type: 'pattern' as const,
            implementation: {
              approach: 'design-pattern-based',
              parameters: { pattern: 'observer' }
            }
          }
        ]
      };

      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing skill with pattern capability
      const result = await skillTester.testSkill(skillWithPatternCap, {
        skipValidation: true,
        skipCompatibility: true,
        skipPerformance: true
      });

      // THEN: Should test pattern capability successfully
      const patternCapability = result.capabilities.find(c => c.capabilityId === 'pattern-cap');
      expect(patternCapability).toBeTruthy();
      expect(patternCapability?.success).toBe(true);
      expect(typeof patternCapability?.result).toBe('object');

      const resultObj = patternCapability?.result as any;
      expect(resultObj.type).toBe('pattern');
      expect(resultObj.name).toBe('Pattern Capability');
      expect(resultObj.approach).toBe('design-pattern-based');
    });

    it('should test tool capability with no tools', async () => {
      // GIVEN: Skill with tool capability but no tools
      const skillWithEmptyToolCap = {
        ...sampleSkill,
        capabilities: [
          {
            id: 'empty-tool-cap',
            name: 'Empty Tool Capability',
            description: 'Tool capability with no tools',
            type: 'tool' as const,
            implementation: {
              approach: 'manual'
            }
          }
        ]
      };

      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing skill with empty tool capability
      const result = await skillTester.testSkill(skillWithEmptyToolCap, {
        skipValidation: true,
        skipCompatibility: true,
        skipPerformance: true
      });

      // THEN: Should handle empty tools list
      const toolCapability = result.capabilities.find(c => c.capabilityId === 'empty-tool-cap');
      expect(toolCapability).toBeTruthy();
      expect(toolCapability?.success).toBe(true);
      expect(toolCapability?.result).toBe('Tools available: ');
    });

    it('should test pattern capability with no approach', async () => {
      // GIVEN: Skill with pattern capability but no approach
      const skillWithNoApproachCap = {
        ...sampleSkill,
        capabilities: [
          {
            id: 'no-approach-pattern-cap',
            name: 'No Approach Pattern Capability',
            description: 'Pattern capability with no approach',
            type: 'pattern' as const
          }
        ]
      };

      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing skill with pattern capability without approach
      const result = await skillTester.testSkill(skillWithNoApproachCap, {
        skipValidation: true,
        skipCompatibility: true,
        skipPerformance: true
      });

      // THEN: Should handle missing approach
      const patternCapability = result.capabilities.find(c => c.capabilityId === 'no-approach-pattern-cap');
      expect(patternCapability).toBeTruthy();
      expect(patternCapability?.success).toBe(true);

      const resultObj = patternCapability?.result as any;
      expect(resultObj.type).toBe('pattern');
      expect(resultObj.name).toBe('No Approach Pattern Capability');
      expect(resultObj.approach).toBe('Not specified');
    });
  });

  describe('Compatibility testing', () => {
    it('should test compatibility for all agent roles', async () => {
      // GIVEN: Mock validation
      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing skill compatibility
      const result = await skillTester.testSkill(sampleSkill, {
        skipValidation: true,
        skipPerformance: true,
        skipCapabilities: true
      });

      // THEN: Should test all compatible roles
      expect(result.compatibility).toHaveLength(2);

      const frontendCompat = result.compatibility.find(c => c.agentRole === 'FrontendDev');
      expect(frontendCompat?.success).toBe(true);
      expect(frontendCompat?.compatibilityLevel).toBe('full');

      const backendCompat = result.compatibility.find(c => c.agentRole === 'BackendDev');
      expect(backendCompat?.success).toBe(false); // Has restrictions, so not fully successful
      expect(backendCompat?.compatibilityLevel).toBe('partial');
    });

    it('should handle limited compatibility level', async () => {
      // GIVEN: Skill with limited compatibility
      const limitedSkill = {
        ...sampleSkill,
        compatibility: [
          {
            agentRole: 'FrontendDev',
            level: 'limited',
            restrictions: ['severe-limitations']
          }
        ]
      };

      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing limited compatibility
      const result = await skillTester.testSkill(limitedSkill, {
        skipValidation: true,
        skipPerformance: true,
        skipCapabilities: true
      });

      // THEN: Should identify compatibility issues
      const compatResult = result.compatibility[0];
      expect(compatResult.issues).toContain('Limited compatibility - functionality may be restricted');
      expect(compatResult.issues).toContain('Has 1 restrictions for FrontendDev');
    });

    it('should handle missing compatibility for agent role', async () => {
      // GIVEN: Mock validation and skill tested against role without compatibility
      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Manually testing compatibility for missing role
      // Access private method through any cast for testing
      const tester = skillTester as any;
      const compatResult = await tester.testCompatibility(sampleSkill, 'ProductManager' as AgentRole);

      // THEN: Should return failure result
      expect(compatResult.success).toBe(false);
      expect(compatResult.compatibilityLevel).toBe('none');
      expect(compatResult.issues).toContain('No compatibility defined for ProductManager');
    });
  });

  describe('Error handling', () => {
    it('should handle validation errors gracefully', async () => {
      // GIVEN: Mock validation that throws error
      mockValidator.validate = mock(() => {
        throw new Error('Validation failed');
      });

      // WHEN: Testing skill
      const result = await skillTester.testSkill(sampleSkill);

      // THEN: Should handle error and include in result
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('system');
      expect(result.errors[0].message).toContain('Test execution failed');
      expect(result.errors[0].severity).toBe('critical');
    });

    it('should handle non-Error objects', async () => {
      // GIVEN: Mock validation that throws string
      mockValidator.validate = mock(() => {
        throw 'String error';
      });

      // WHEN: Testing skill
      const result = await skillTester.testSkill(sampleSkill);

      // THEN: Should handle string error
      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('Test execution failed: Unknown error occurred');
    });
  });

  describe('Recommendation generation', () => {
    it('should generate recommendations for validation issues', async () => {
      // GIVEN: Mock validation with warnings
      const validationResult: SkillValidationResult = {
        valid: false,
        errors: [],
        warnings: [{ category: 'documentation', message: 'Missing docs', severity: 'warning' }],
        score: 85,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing skill
      const result = await skillTester.testSkill(sampleSkill, {
        skipCompatibility: true,
        skipPerformance: true,
        skipCapabilities: true
      });

      // THEN: Should generate validation recommendations
      expect(result.recommendations).toContain('Fix validation errors before skill deployment');
      expect(result.recommendations).toContain('Address validation warnings for better quality');
    });

    it('should generate recommendations for performance issues', async () => {
      // GIVEN: Skill with performance issues
      const slowSkill = {
        ...sampleSkill,
        performance: {
          ...sampleSkill.performance,
          executionTime: { min: 0.1, max: 0.2, average: 0.15 } // Very fast expected
        }
      };

      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing skill with performance issues
      const result = await skillTester.testSkill(slowSkill, {
        skipValidation: true,
        skipCompatibility: true,
        skipCapabilities: true
      });

      // THEN: Should generate performance recommendations
      expect(result.recommendations).toContain('Optimize skill performance to meet expected ranges');
    });

    it('should generate recommendations for skill ID format', async () => {
      // GIVEN: Skill with poorly formatted ID
      const poorlyNamedSkill = {
        ...sampleSkill,
        id: 'poorlynamedskill'
      };

      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing skill
      const result = await skillTester.testSkill(poorlyNamedSkill, {
        skipCompatibility: true,
        skipPerformance: true,
        skipCapabilities: true
      });

      // THEN: Should generate ID format recommendation
      expect(result.recommendations).toContain('Use hyphenated naming convention for skill IDs');
    });
  });

  describe('Environment and execution tracking', () => {
    it('should create test environment with required fields', async () => {
      // GIVEN: Mock validation
      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing skill
      const result = await skillTester.testSkill(sampleSkill, {
        skipCompatibility: true,
        skipPerformance: true,
        skipCapabilities: true
      });

      // THEN: Should include environment information
      expect(result.environment).toMatchObject({
        nodeVersion: expect.any(String),
        platform: expect.any(String),
        availableMemory: expect.any(Number),
        frameworkVersion: '1.0.0',
        executionId: expect.stringMatching(/^test_\d+_[a-z0-9]+_\d+$/)
      });
    });

    it('should generate unique execution IDs', async () => {
      // GIVEN: Mock validation
      const validationResult: SkillValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        score: 100,
        validatedAt: new Date()
      };
      mockValidator.validate = mock(() => validationResult);

      // WHEN: Testing skill multiple times
      const result1 = await skillTester.testSkill(sampleSkill, {
        skipCompatibility: true,
        skipPerformance: true,
        skipCapabilities: true
      });
      const result2 = await skillTester.testSkill(sampleSkill, {
        skipCompatibility: true,
        skipPerformance: true,
        skipCapabilities: true
      });

      // THEN: Should generate different execution IDs
      expect(result1.environment.executionId).not.toBe(result2.environment.executionId);
      expect(result1.environment.executionId).toMatch(/^test_\d+_[a-z0-9]+_\d+$/);
      expect(result2.environment.executionId).toMatch(/^test_\d+_[a-z0-9]+_\d+$/);
    });
  });
});

describe('Default skill tester and quick test function', () => {
  const sampleSkill: SkillDefinition = {
    id: 'quick-test-skill',
    name: 'Quick Test Skill',
    description: 'Skill for quick testing',
    domain: 'testing',
    category: 'unit-testing',
    version: '1.0.0',
    dependencies: [],
    compatibility: [
      {
        agentRole: 'FrontendDev',
        level: 'full'
      }
    ],
    capabilities: [
      {
        id: 'quick-cap',
        name: 'Quick Capability',
        description: 'Quick test capability',
        type: 'action'
      }
    ],
    examples: [],
    performance: {
      executionTime: { min: 1, max: 3, average: 2 },
      resourceUsage: {
        memory: 'low',
        cpu: 'low',
        network: 'none'
      },
      complexity: 'simple'
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'test',
      versionHistory: [],
      tags: [],
      relatedSkills: {},
      resources: []
    },
    tags: ['test']
  };

  it('should provide default skill tester instance', () => {
    // THEN: Default tester should be available
    expect(defaultSkillTester).toBeInstanceOf(SkillTester);
  });

  it('should provide quick test function', async () => {
    // WHEN: Using quick test function
    const result = await testSkill(sampleSkill);

    // THEN: Should return test result
    expect(result).toMatchObject({
      skillId: 'quick-test-skill',
      success: true,
      executionTime: expect.any(Number),
      environment: expect.any(Object)
    });
  });

  it('should accept test options in quick function', async () => {
    // WHEN: Using quick test function with options
    const result = await testSkill(sampleSkill, {
      skipValidation: true,
      skipPerformance: true
    });

    // THEN: Should apply options
    expect(result.skillId).toBe('quick-test-skill');
    expect(result.success).toBe(true);
  });
});

describe('Interface type validation', () => {
  it('should accept all valid interface properties', () => {
    // GIVEN: Valid test environment
    const testEnvironment: TestEnvironment = {
      nodeVersion: 'v18.0.0',
      platform: 'darwin',
      availableMemory: 1024,
      frameworkVersion: '1.0.0',
      executionId: 'test_123_abc'
    };

    // THEN: Should match interface
    expect(testEnvironment.nodeVersion).toBe('v18.0.0');
    expect(testEnvironment.platform).toBe('darwin');
    expect(testEnvironment.availableMemory).toBe(1024);
    expect(testEnvironment.frameworkVersion).toBe('1.0.0');
    expect(testEnvironment.executionId).toBe('test_123_abc');
  });

  it('should accept valid test error properties', () => {
    // GIVEN: Valid test error
    const testError: TestError = {
      type: 'validation',
      message: 'Test error',
      severity: 'high',
      component: 'test-component',
      stack: 'Error stack trace'
    };

    // THEN: Should match interface
    expect(testError.type).toBe('validation');
    expect(testError.message).toBe('Test error');
    expect(testError.severity).toBe('high');
    expect(testError.component).toBe('test-component');
    expect(testError.stack).toBe('Error stack trace');
  });

  it('should accept valid compatibility test result', () => {
    // GIVEN: Valid compatibility test result
    const compatResult: CompatibilityTestResult = {
      agentRole: 'FrontendDev',
      compatibilityLevel: 'full',
      success: true,
      issues: [],
      executionTime: 150
    };

    // THEN: Should match interface
    expect(compatResult.agentRole).toBe('FrontendDev');
    expect(compatResult.compatibilityLevel).toBe('full');
    expect(compatResult.success).toBe(true);
    expect(compatResult.issues).toEqual([]);
    expect(compatResult.executionTime).toBe(150);
  });

  it('should accept valid performance test result', () => {
    // GIVEN: Valid performance test result
    const perfResult: PerformanceTestResult = {
      expected: {
        executionTime: { min: 1, max: 5, average: 3 },
        resourceUsage: { memory: 'low', cpu: 'low', network: 'none' },
        complexity: 'simple'
      },
      actual: {
        executionTime: 2,
        memoryUsage: 50,
        cpuUsage: 25
      },
      withinExpected: true,
      score: 95,
      issues: []
    };

    // THEN: Should match interface
    expect(perfResult.expected.executionTime.min).toBe(1);
    expect(perfResult.actual.executionTime).toBe(2);
    expect(perfResult.withinExpected).toBe(true);
    expect(perfResult.score).toBe(95);
    expect(perfResult.issues).toEqual([]);
  });

  it('should accept valid capability test result', () => {
    // GIVEN: Valid capability test result
    const capResult: CapabilityTestResult = {
      capabilityId: 'test-cap',
      capabilityName: 'Test Capability',
      success: true,
      executionTime: 100,
      result: 'success',
      issues: []
    };

    // THEN: Should match interface
    expect(capResult.capabilityId).toBe('test-cap');
    expect(capResult.capabilityName).toBe('Test Capability');
    expect(capResult.success).toBe(true);
    expect(capResult.executionTime).toBe(100);
    expect(capResult.result).toBe('success');
    expect(capResult.issues).toEqual([]);
  });
});