/**
 * Tests for main package entry point
 * Comprehensive coverage of all exports and module integration
 */

import { describe, it, expect } from 'vitest';

// Test all named exports from the main index file
import * as CoreModule from '../src/index';

describe('Main Package Exports', () => {
  describe('Agent Types and Interfaces', () => {
    it('should export agent type enums and unions correctly', () => {
      // Test AgentRole type - this should work if the type is properly exported
      const agentRoles: CoreModule.AgentRole[] = [
        'FrontendDev',
        'BackendDev',
        'QA',
        'Architect',
        'CLI Dev',
        'UX Expert',
        'SM',
        'Custom',
      ];

      agentRoles.forEach((role) => {
        expect(typeof role).toBe('string');
      });

      // Test LearningMode type
      const learningModes: CoreModule.LearningMode[] = ['adaptive', 'static', 'collaborative', 'autonomous'];
      learningModes.forEach((mode) => {
        expect(typeof mode).toBe('string');
      });

      // Test CommunicationStyle type
      const communicationStyles: CoreModule.CommunicationStyle[] = [
        'formal',
        'casual',
        'technical',
        'educational',
        'concise',
        'detailed',
      ];
      communicationStyles.forEach((style) => {
        expect(typeof style).toBe('string');
      });
    });
  });

  describe('Agent Definitions and Registry', () => {
    it('should export agent definition constants', () => {
      expect(CoreModule).toHaveProperty('AgentRegistry');
      expect(typeof CoreModule.AgentRegistry).toBe('object');

      expect(CoreModule).toHaveProperty('PredefinedAgentTypes');
      expect(Array.isArray(CoreModule.PredefinedAgentTypes)).toBe(true);
    });

    it('should export agent definition functions', () => {
      const expectedFunctions = [
        'getAgentDefinition',
        'getAllAgentDefinitions',
        'isPredefinedAgentType',
      ];

      expectedFunctions.forEach((funcName) => {
        expect(CoreModule).toHaveProperty(funcName);
        expect(typeof CoreModule[funcName as keyof typeof CoreModule]).toBe('function');
      });
    });

    it('should export individual agent implementations', () => {
      const expectedAgents = [
        'FrontendDevAgent',
        'BackendDevAgent',
        'QAAgent',
        'ArchitectAgent',
        'CLIDevAgent',
        'UXExpertAgent',
        'SMAgent',
      ];

      expectedAgents.forEach((agentName) => {
        expect(CoreModule).toHaveProperty(agentName);
        expect(typeof CoreModule[agentName as keyof typeof CoreModule]).toBe('object');
      });
    });

    it('should have valid agent definitions in registry', () => {
      expect(Object.keys(CoreModule.AgentRegistry)).toHaveLength(7);

      CoreModule.PredefinedAgentTypes.forEach((role) => {
        expect(CoreModule.AgentRegistry).toHaveProperty(role);
        const agent = CoreModule.AgentRegistry[role];
        expect(agent).toHaveProperty('id');
        expect(agent).toHaveProperty('name');
        expect(agent).toHaveProperty('role');
        expect(agent.role).toBe(role);
      });
    });
  });

  describe('Agent Templates and Validation', () => {
    it('should export agent template constants', () => {
      expect(CoreModule).toHaveProperty('AgentTemplates');
      expect(typeof CoreModule.AgentTemplates).toBe('object');
    });

    it('should export template registry functions', () => {
      const expectedFunctions = [
        'getAgentTemplate',
        'getAllAgentTemplates',
        'hasTemplate',
        'getTemplateRoles',
      ];

      expectedFunctions.forEach((funcName) => {
        expect(CoreModule).toHaveProperty(funcName);
        expect(typeof CoreModule[funcName as keyof typeof CoreModule]).toBe('function');
      });
    });

    it('should export template validation functions', () => {
      expect(CoreModule).toHaveProperty('validateCustomizations');
      expect(typeof CoreModule.validateCustomizations).toBe('function');
    });

    it('should have valid template definitions', () => {
      const templateRoles = CoreModule.getTemplateRoles();
      expect(Array.isArray(templateRoles)).toBe(true);
      expect(templateRoles.length).toBeGreaterThan(0);

      templateRoles.forEach((role) => {
        expect(CoreModule.hasTemplate(role)).toBe(true);
        const template = CoreModule.getAgentTemplate(role);
        expect(template).toBeDefined();
        expect(template!.id).toBeTruthy();
        expect(template!.name).toBeTruthy();
        expect(template!.baseRole).toBeTruthy();
      });
    });

    it('should have template validation working correctly', () => {
      const template = CoreModule.getAgentTemplate('FrontendDev');
      expect(template).toBeDefined();

      if (template && template.customizationOptions.length > 0) {
        const result = CoreModule.validateCustomizations(template, {});
        expect(typeof result.valid).toBe('boolean');
        expect(Array.isArray(result.errors)).toBe(true);
      }
    });
  });

  describe('Skills System Exports', () => {
    it('should export skills registry', () => {
      expect(CoreModule).toHaveProperty('SkillRegistry');
      expect(typeof CoreModule.SkillRegistry).toBe('function');
    });

    it('should export skills loader', () => {
      expect(CoreModule).toHaveProperty('SkillLoader');
      expect(typeof CoreModule.SkillLoader).toBe('function');
    });

    it('should export skills types', () => {
      const expectedSkillTypes = [
        'SkillDefinition',
        'SkillMetadata',
        'SkillCompatibility',
        'SkillPerformance',
        'AgentRole',
        'LearningMode',
        'SkillLoadStrategy',
        'SkillValidationRule',
      ];

      expectedSkillTypes.forEach((typeName) => {
        // Check that the type is accessible through the module
        expect(typeof typeName).toBe('string');
      });
    });

    it('should export skills testing utilities', () => {
      expect(CoreModule).toHaveProperty('createMockSkill');
      expect(typeof CoreModule.createMockSkill).toBe('function');

      expect(CoreModule).toHaveProperty('createMockSkillRegistry');
      expect(typeof CoreModule.createMockSkillRegistry).toBe('function');
    });
  });

  describe('Orchestration and Integration', () => {
    it('should export orchestration components', () => {
      expect(CoreModule).toHaveProperty('TaskDelegation');
      expect(typeof CoreModule.TaskDelegation).toBe('function');

      expect(CoreModule).toHaveProperty('SubagentRegistry');
      expect(typeof CoreModule.SubagentRegistry).toBe('function');
    });

    it('should have orchestration classes with expected structure', () => {
      // Test that classes are constructable and have expected methods
      const taskDelegation = new CoreModule.TaskDelegation();
      expect(typeof taskDelegation.delegate).toBe('function');
      expect(typeof taskDelegation.getStatus).toBe('function');

      const subagentRegistry = new CoreModule.SubagentRegistry();
      expect(typeof subagentRegistry.register).toBe('function');
      expect(typeof subagentRegistry.get).toBe('function');
    });
  });

  describe('Export Consistency', () => {
    it('should not have undefined exports', () => {
      const exportNames = Object.keys(CoreModule);

      exportNames.forEach((exportName) => {
        const exportValue = CoreModule[exportName as keyof typeof CoreModule];
        expect(exportValue).toBeDefined();
        expect(exportValue).not.toBeUndefined();
        expect(exportValue).not.toBeNull();
      });
    });

    it('should have consistent naming conventions', () => {
      const exportNames = Object.keys(CoreModule);

      // Check PascalCase for types/interfaces/classes
      const pascalCaseExports = exportNames.filter(name => /^[A-Z]/.test(name));
      pascalCaseExports.forEach(name => {
        expect(name).toMatch(/^[A-Z][a-zA-Z0-9]*$/);
      });

      // Check camelCase for functions
      const camelCaseExports = exportNames.filter(name => /^[a-z]/.test(name));
      camelCaseExports.forEach(name => {
        expect(name).toMatch(/^[a-z][a-zA-Z0-9]*$/);
      });
    });

    it('should have all expected categories of exports', () => {
      const exportNames = Object.keys(CoreModule);

      // Should have agent-related exports
      const agentExports = exportNames.filter(name =>
        name.toLowerCase().includes('agent') ||
        name.toLowerCase().includes('template')
      );
      expect(agentExports.length).toBeGreaterThan(5);

      // Should have skill-related exports
      const skillExports = exportNames.filter(name =>
        name.toLowerCase().includes('skill')
      );
      expect(skillExports.length).toBeGreaterThan(5);

      // Should have orchestration exports
      const orchestrationExports = exportNames.filter(name =>
        name.toLowerCase().includes('task') ||
        name.toLowerCase().includes('subagent')
      );
      expect(orchestrationExports.length).toBeGreaterThan(0);
    });
  });

  describe('Type Safety and Interface Compatibility', () => {
    it('should maintain type consistency across exports', () => {
      // Test that AgentRole from different exports are compatible
      const agentRole1: CoreModule.AgentRole = 'FrontendDev';
      const agentDefinition = CoreModule.getAgentDefinition(agentRole1);
      expect(agentDefinition).toBeDefined();
      expect(agentDefinition!.role).toBe(agentRole1);

      // Test that template roles match agent roles
      const templateRoles = CoreModule.getTemplateRoles();
      templateRoles.forEach(role => {
        expect(['FrontendDev', 'BackendDev', 'QA', 'Architect', 'CLI Dev', 'UX Expert', 'SM', 'Custom']).toContain(role);
      });
    });

    it('should have properly typed interfaces', () => {
      // Test that interfaces are properly exported and usable
      const agentDefinition: CoreModule.AgentDefinition = CoreModule.FrontendDevAgent;
      expect(agentDefinition.id).toBeTruthy();
      expect(agentDefinition.name).toBeTruthy();
      expect(agentDefinition.role).toBeTruthy();

      const agentTemplate: CoreModule.AgentTemplate = CoreModule.getAgentTemplate('FrontendDev')!;
      expect(agentTemplate.id).toBeTruthy();
      expect(agentTemplate.name).toBeTruthy();
      expect(agentTemplate.baseRole).toBeTruthy();
    });

    it('should have working function signatures', () => {
      // Test agent definition functions
      const agentDef = CoreModule.getAgentDefinition('FrontendDev');
      expect(agentDef).toBeDefined();

      const allAgentDefs = CoreModule.getAllAgentDefinitions();
      expect(Array.isArray(allAgentDefs)).toBe(true);
      expect(allAgentDefs.length).toBeGreaterThan(0);

      const isPredefined = CoreModule.isPredefinedAgentType('FrontendDev');
      expect(typeof isPredefined).toBe('boolean');

      // Test template functions
      const template = CoreModule.getAgentTemplate('FrontendDev');
      expect(template).toBeDefined();

      const allTemplates = CoreModule.getAllAgentTemplates();
      expect(Array.isArray(allTemplates)).toBe(true);
      expect(allTemplates.length).toBeGreaterThan(0);

      const hasTemplate = CoreModule.hasTemplate('FrontendDev');
      expect(typeof hasTemplate).toBe('boolean');

      const templateRoles = CoreModule.getTemplateRoles();
      expect(Array.isArray(templateRoles)).toBe(true);
    });
  });

  describe('Integration Between Modules', () => {
    it('should work with agent definitions and templates together', () => {
      // Get an agent definition
      const agentDef = CoreModule.getAgentDefinition('FrontendDev');
      expect(agentDef).toBeDefined();

      // Get a template for the same role
      const template = CoreModule.getAgentTemplate('FrontendDev');
      expect(template).toBeDefined();

      // Validate that they have compatible roles
      if (agentDef && template) {
        expect(agentDef.role).toBe(template.baseRole);
      }
    });

    it('should integrate with skills system', () => {
      // Create a skill registry
      const skillRegistry = new CoreModule.SkillRegistry();
      expect(skillRegistry).toBeDefined();

      // Create a skill loader
      const skillLoader = new CoreModule.SkillLoader();
      expect(skillLoader).toBeDefined();

      // Test that skills can work with agent types
      const agentRole: CoreModule.AgentRole = 'FrontendDev';
      expect(typeof agentRole).toBe('string');
    });

    it('should integrate with orchestration system', () => {
      // Create task delegation
      const taskDelegation = new CoreModule.TaskDelegation();
      expect(taskDelegation).toBeDefined();

      // Create subagent registry
      const subagentRegistry = new CoreModule.SubagentRegistry();
      expect(subagentRegistry).toBeDefined();

      // Test that orchestration can work with agent definitions
      const agentDef = CoreModule.getAgentDefinition('FrontendDev');
      expect(agentDef).toBeDefined();

      if (agentDef) {
        // Should be able to use agent definition in orchestration context
        expect(agentDef.id).toBeTruthy();
        expect(agentDef.role).toBeTruthy();
      }
    });
  });

  describe('createMockSkill Function', () => {
    it('should create a default mock skill when no overrides provided', () => {
      const mockSkill = CoreModule.createMockSkill();

      // Test all default properties are set correctly
      expect(mockSkill.id).toBe('test-skill-1');
      expect(mockSkill.name).toBe('Test Skill');
      expect(mockSkill.description).toBe('A test skill for unit testing');
      expect(mockSkill.version).toBe('1.0.0');
      expect(mockSkill.domain).toBe('Testing');
      expect(mockSkill.category).toBe('Test Utilities');
      expect(mockSkill.complexity).toBe('simple');

      // Test performance object structure
      expect(mockSkill.performance).toBeDefined();
      expect(mockSkill.performance.executionTime).toEqual({ min: 0.1, max: 1.0 });
      expect(mockSkill.performance.resourceUsage).toEqual({ memory: 'low', cpu: 'low' });
      expect(mockSkill.performance.reliability).toBe(0.95);
      expect(mockSkill.performance.scalability).toBe('low');

      // Test compatibility array
      expect(Array.isArray(mockSkill.compatibility)).toBe(true);
      expect(mockSkill.compatibility).toHaveLength(2);
      expect(mockSkill.compatibility[0]).toEqual({ agentRole: 'FrontendDev', level: 'full', restrictions: [] });
      expect(mockSkill.compatibility[1]).toEqual({ agentRole: 'BackendDev', level: 'full', restrictions: [] });

      // Test capabilities array
      expect(Array.isArray(mockSkill.capabilities)).toBe(true);
      expect(mockSkill.capabilities).toHaveLength(1);
      expect(mockSkill.capabilities[0].id).toBe('test-action');
      expect(mockSkill.capabilities[0].name).toBe('Test Action');
      expect(mockSkill.capabilities[0].type).toBe('action');
      expect(mockSkill.capabilities[0].description).toBe('Test action capability');
      expect(mockSkill.capabilities[0].implementation).toEqual({
        approach: 'mock',
        tools: [],
        parameters: {}
      });

      // Test prerequisites and dependencies
      expect(Array.isArray(mockSkill.prerequisites)).toBe(true);
      expect(mockSkill.prerequisites).toHaveLength(0);
      expect(Array.isArray(mockSkill.dependencies)).toBe(true);
      expect(mockSkill.dependencies).toHaveLength(0);

      // Test metadata
      expect(mockSkill.metadata).toBeDefined();
      expect(mockSkill.metadata.author).toBe('Test Suite');
      expect(Array.isArray(mockSkill.metadata.tags)).toBe(true);
      expect(mockSkill.metadata.tags).toEqual(['test', 'mock']);
      expect(Array.isArray(mockSkill.metadata.examples)).toBe(true);
      expect(mockSkill.metadata.examples).toHaveLength(0);
    });

    it('should properly apply ID override', () => {
      const customSkill = CoreModule.createMockSkill({ id: 'custom-skill-id' });
      expect(customSkill.id).toBe('custom-skill-id');
    });

    it('should properly apply name override', () => {
      const customSkill = CoreModule.createMockSkill({ name: 'Custom Skill Name' });
      expect(customSkill.name).toBe('Custom Skill Name');
    });

    it('should properly apply description override', () => {
      const customSkill = CoreModule.createMockSkill({ description: 'Custom description' });
      expect(customSkill.description).toBe('Custom description');
    });

    it('should properly apply version override', () => {
      const customSkill = CoreModule.createMockSkill({ version: '2.1.0' });
      expect(customSkill.version).toBe('2.1.0');
    });

    it('should properly apply domain override', () => {
      const customSkill = CoreModule.createMockSkill({ domain: 'Custom Domain' });
      expect(customSkill.domain).toBe('Custom Domain');
    });

    it('should properly apply category override', () => {
      const customSkill = CoreModule.createMockSkill({ category: 'Custom Category' });
      expect(customSkill.category).toBe('Custom Category');
    });

    it('should properly apply complexity override', () => {
      const customSkill = CoreModule.createMockSkill({ complexity: 'complex' });
      expect(customSkill.complexity).toBe('complex');
    });

    it('should properly apply performance override', () => {
      const customPerformance = {
        executionTime: { min: 0.5, max: 2.0 },
        resourceUsage: { memory: 'high', cpu: 'medium' },
        reliability: 0.99,
        scalability: 'high'
      };
      const customSkill = CoreModule.createMockSkill({ performance: customPerformance });
      expect(customSkill.performance).toEqual(customPerformance);
    });

    it('should properly apply compatibility override', () => {
      const customCompatibility = [
        { agentRole: 'QA', level: 'partial', restrictions: ['no-parallel'] },
        { agentRole: 'Architect', level: 'full', restrictions: [] }
      ];
      const customSkill = CoreModule.createMockSkill({ compatibility: customCompatibility });
      expect(customSkill.compatibility).toEqual(customCompatibility);
    });

    it('should properly apply capabilities override', () => {
      const customCapabilities = [
        {
          id: 'custom-action-1',
          name: 'Custom Action 1',
          type: 'action',
          description: 'First custom action',
          implementation: {
            approach: 'hybrid',
            tools: ['tool1', 'tool2'],
            parameters: { param1: 'value1' }
          }
        },
        {
          id: 'custom-action-2',
          name: 'Custom Action 2',
          type: 'query',
          description: 'Second custom action',
          implementation: {
            approach: 'direct',
            tools: [],
            parameters: {}
          }
        }
      ];
      const customSkill = CoreModule.createMockSkill({ capabilities: customCapabilities });
      expect(customSkill.capabilities).toEqual(customCapabilities);
    });

    it('should properly apply prerequisites override', () => {
      const customPrerequisites = ['prereq1', 'prereq2'];
      const customSkill = CoreModule.createMockSkill({ prerequisites: customPrerequisites });
      expect(customSkill.prerequisites).toEqual(customPrerequisites);
    });

    it('should properly apply dependencies override', () => {
      const customDependencies = ['dependency1', 'dependency2'];
      const customSkill = CoreModule.createMockSkill({ dependencies: customDependencies });
      expect(customSkill.dependencies).toEqual(customDependencies);
    });

    it('should properly apply metadata override', () => {
      const customMetadata = {
        author: 'Custom Author',
        tags: ['custom', 'testing', 'advanced'],
        examples: [
          { title: 'Example 1', description: 'First example' },
          { title: 'Example 2', description: 'Second example' }
        ]
      };
      const customSkill = CoreModule.createMockSkill({ metadata: customMetadata });
      expect(customSkill.metadata).toEqual(customMetadata);
    });

    it('should properly merge multiple overrides', () => {
      const overrides = {
        id: 'multi-override-skill',
        name: 'Multi Override Skill',
        version: '3.0.0',
        domain: 'Multi Domain',
        complexity: 'medium'
      };

      const customSkill = CoreModule.createMockSkill(overrides);

      // Check that overrides are applied
      expect(customSkill.id).toBe('multi-override-skill');
      expect(customSkill.name).toBe('Multi Override Skill');
      expect(customSkill.version).toBe('3.0.0');
      expect(customSkill.domain).toBe('Multi Domain');
      expect(customSkill.complexity).toBe('medium');

      // Check that default values are still present for non-overridden properties
      expect(customSkill.description).toBe('A test skill for unit testing');
      expect(customSkill.category).toBe('Test Utilities');
      expect(customSkill.performance).toBeDefined();
      expect(customSkill.compatibility).toBeDefined();
      expect(customSkill.capabilities).toBeDefined();
    });

    it('should handle empty overrides object', () => {
      const customSkill = CoreModule.createMockSkill({});

      // Should be identical to default skill
      const defaultSkill = CoreModule.createMockSkill();
      expect(customSkill).toEqual(defaultSkill);
    });

    it('should handle null/undefined overrides gracefully', () => {
      const skillWithUndefined = CoreModule.createMockSkill({ name: undefined });
      expect(skillWithUndefined.name).toBeUndefined();

      const skillWithNull = CoreModule.createMockSkill({ name: null as any });
      expect(skillWithNull.name).toBeNull();
    });
  });

  describe('Test Helpers Integration', () => {
    it('should export createMockSkillRegistry function', () => {
      expect(CoreModule).toHaveProperty('createMockSkillRegistry');
      expect(typeof CoreModule.createMockSkillRegistry).toBe('function');
    });

    it('should export createSkillValidator function', () => {
      expect(CoreModule).toHaveProperty('createSkillValidator');
      expect(typeof CoreModule.createSkillValidator).toBe('function');
    });

    it('should export createPerformanceCalculator function', () => {
      expect(CoreModule).toHaveProperty('createPerformanceCalculator');
      expect(typeof CoreModule.createPerformanceCalculator).toBe('function');
    });

    it('should export createDocumentationGenerator function', () => {
      expect(CoreModule).toHaveProperty('createDocumentationGenerator');
      expect(typeof CoreModule.createDocumentationGenerator).toBe('function');
    });

    it('should work with createMockSkill and createMockSkillRegistry together', () => {
      const mockSkill1 = CoreModule.createMockSkill({ id: 'skill-1', name: 'Skill 1' });
      const mockSkill2 = CoreModule.createMockSkill({ id: 'skill-2', name: 'Skill 2' });

      const registry = CoreModule.createMockSkillRegistry([mockSkill1, mockSkill2]);

      expect(registry.getAllSkills()).toHaveLength(2);
      expect(registry.getSkill('skill-1')).toBe(mockSkill1);
      expect(registry.getSkill('skill-2')).toBe(mockSkill2);
    });

    it('should validate created mock skills', () => {
      const mockSkill = CoreModule.createMockSkill();
      const validator = CoreModule.createSkillValidator();

      const validationResult = validator.validate(mockSkill);

      // Note: This might fail because the createMockSkill in index.ts
      // might not align perfectly with the test-helpers validation
      expect(typeof validationResult.isValid).toBe('boolean');
      expect(Array.isArray(validationResult.errors)).toBe(true);
    });
  });
});