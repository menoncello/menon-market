/**
 * Tests for template validation functionality
 * Comprehensive coverage of template customization validation
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { validateCustomizations } from '../../src/agents/template-validation';
import { AgentTemplate, CustomizationOption, ValidationRule } from '../../src/agents/types';

describe('Template Validation', () => {
  let mockTemplate: AgentTemplate;
  let simpleTemplate: AgentTemplate;
  let complexTemplate: AgentTemplate;

  beforeEach(() => {
    // Simple template for basic tests
    simpleTemplate = {
      id: 'simple-template-001',
      name: 'Simple Template',
      description: 'A simple template for testing',
      baseRole: 'Custom',
      template: {
        name: 'Simple Agent',
        description: 'Simple agent description',
        role: 'Custom',
        goals: ['Simple goal'],
        backstory: 'Simple backstory',
        coreSkills: ['Simple skill'],
        learningMode: 'static',
        configuration: {
          performance: {
            maxExecutionTime: 30,
            memoryLimit: 512,
            maxConcurrentTasks: 1,
            priority: 5,
          },
          capabilities: {
            allowedTools: [],
            fileSystemAccess: {
              read: false,
              write: false,
              execute: false,
            },
            networkAccess: {
              http: false,
              https: false,
              externalApis: false,
            },
            agentIntegration: false,
          },
          communication: {
            style: 'formal',
            responseFormat: 'plain-text',
            collaboration: {
              enabled: false,
              roles: ['contributor'],
              conflictResolution: 'collaborative',
            },
          },
        },
      },
      customizationOptions: [
        {
          id: 'name',
          name: 'Agent Name',
          description: 'The name of the agent',
          type: 'string',
          defaultValue: 'Default Agent',
          required: true,
        },
        {
          id: 'skill',
          name: 'Primary Skill',
          description: 'The primary skill of the agent',
          type: 'string',
          defaultValue: 'General',
          required: false,
        },
      ],
      templateMetadata: {
        createdAt: new Date(),
        author: 'Test Author',
        version: '1.0.0',
        usageCount: 0,
        averageRating: 0,
      },
    };

    // Template with validation rules
    mockTemplate = {
      id: 'validation-template-001',
      name: 'Validation Template',
      description: 'Template with validation rules',
      baseRole: 'Custom',
      template: {
        name: 'Validation Agent',
        description: 'Agent with validation',
        role: 'Custom',
        goals: ['Validation goal'],
        backstory: 'Validation backstory',
        coreSkills: ['Validation'],
        learningMode: 'static',
        configuration: {
          performance: {
            maxExecutionTime: 30,
            memoryLimit: 512,
            maxConcurrentTasks: 1,
            priority: 5,
          },
          capabilities: {
            allowedTools: [],
            fileSystemAccess: {
              read: false,
              write: false,
              execute: false,
            },
            networkAccess: {
              http: false,
              https: false,
              externalApis: false,
            },
            agentIntegration: false,
          },
          communication: {
            style: 'formal',
            responseFormat: 'plain-text',
            collaboration: {
              enabled: false,
              roles: ['contributor'],
              conflictResolution: 'collaborative',
            },
          },
        },
      },
      customizationOptions: [
        {
          id: 'name',
          name: 'Agent Name',
          description: 'The name of the agent',
          type: 'string',
          defaultValue: 'Default Agent',
          required: true,
          validation: [
            {
              type: 'min',
              params: { length: 3 },
              message: 'Name must be at least 3 characters long',
            },
            {
              type: 'max',
              params: { length: 50 },
              message: 'Name must be no more than 50 characters long',
            },
          ],
        },
        {
          id: 'age',
          name: 'Agent Age',
          description: 'The age of the agent',
          type: 'number',
          defaultValue: 25,
          required: true,
          validation: [
            {
              type: 'min',
              params: { value: 18 },
              message: 'Age must be at least 18',
            },
            {
              type: 'max',
              params: { value: 100 },
              message: 'Age must be no more than 100',
            },
          ],
        },
        {
          id: 'level',
          name: 'Experience Level',
          description: 'The experience level',
          type: 'string',
          defaultValue: 'junior',
          required: true,
          validation: [
            {
              type: 'enum',
              params: { values: ['junior', 'mid', 'senior', 'expert'] },
              message: 'Level must be one of: junior, mid, senior, expert',
            },
          ],
        },
        {
          id: 'active',
          name: 'Active Status',
          description: 'Whether the agent is active',
          type: 'boolean',
          defaultValue: true,
          required: false,
        },
      ],
      templateMetadata: {
        createdAt: new Date(),
        author: 'Test Author',
        version: '1.0.0',
        usageCount: 0,
        averageRating: 0,
      },
    };

    // Complex template with different types
    complexTemplate = {
      id: 'complex-template-001',
      name: 'Complex Template',
      description: 'Template with all data types',
      baseRole: 'Custom',
      template: {
        name: 'Complex Agent',
        description: 'Complex agent description',
        role: 'Custom',
        goals: ['Complex goal'],
        backstory: 'Complex backstory',
        coreSkills: ['Complex skill'],
        learningMode: 'static',
        configuration: {
          performance: {
            maxExecutionTime: 30,
            memoryLimit: 512,
            maxConcurrentTasks: 1,
            priority: 5,
          },
          capabilities: {
            allowedTools: [],
            fileSystemAccess: {
              read: false,
              write: false,
              execute: false,
            },
            networkAccess: {
              http: false,
              https: false,
              externalApis: false,
            },
            agentIntegration: false,
          },
          communication: {
            style: 'formal',
            responseFormat: 'plain-text',
            collaboration: {
              enabled: false,
              roles: ['contributor'],
              conflictResolution: 'collaborative',
            },
          },
        },
      },
      customizationOptions: [
        {
          id: 'textOption',
          name: 'Text Option',
          description: 'A text option',
          type: 'string',
          defaultValue: 'default text',
          required: false,
        },
        {
          id: 'numberOption',
          name: 'Number Option',
          description: 'A number option',
          type: 'number',
          defaultValue: 42,
          required: false,
        },
        {
          id: 'booleanOption',
          name: 'Boolean Option',
          description: 'A boolean option',
          type: 'boolean',
          defaultValue: false,
          required: false,
        },
        {
          id: 'arrayOption',
          name: 'Array Option',
          description: 'An array option',
          type: 'array',
          defaultValue: ['item1', 'item2'],
          required: false,
        },
        {
          id: 'objectOption',
          name: 'Object Option',
          description: 'An object option',
          type: 'object',
          defaultValue: { key: 'value' },
          required: false,
        },
      ],
      templateMetadata: {
        createdAt: new Date(),
        author: 'Test Author',
        version: '1.0.0',
        usageCount: 0,
        averageRating: 0,
      },
    };
  });

  describe('validateCustomizations', () => {
    it('should validate with empty customizations', () => {
      const result = validateCustomizations(simpleTemplate, {});

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should apply default values for missing customizations', () => {
      const result = validateCustomizations(simpleTemplate, {});

      expect(result.valid).toBe(true);
      // The function should internally merge with defaults
    });

    it('should validate with valid customizations', () => {
      const customizations = {
        name: 'Custom Agent',
        skill: 'Custom Skill',
      };

      const result = validateCustomizations(simpleTemplate, customizations);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate with partial customizations', () => {
      const customizations = {
        name: 'Partial Agent',
      };

      const result = validateCustomizations(simpleTemplate, customizations);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject missing required fields', () => {
      const customizations = {}; // Missing required 'name' field

      // Create a template where the required field has no default
      const templateWithoutDefaults = {
        ...simpleTemplate,
        customizationOptions: [
          {
            id: 'name',
            name: 'Agent Name',
            description: 'The name of the agent',
            type: 'string',
            required: true,
            // No default value
          },
          {
            id: 'skill',
            name: 'Primary Skill',
            description: 'The primary skill of the agent',
            type: 'string',
            defaultValue: 'General',
            required: false,
          },
        ],
      };

      const result = validateCustomizations(templateWithoutDefaults, customizations);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Agent Name is required');
    });

    it('should reject null required fields', () => {
      const customizations = {
        name: null,
      };

      const result = validateCustomizations(simpleTemplate, customizations);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Agent Name cannot be null');
    });

    it('should reject empty string required fields', () => {
      const customizations = {
        name: '',
      };

      const result = validateCustomizations(simpleTemplate, customizations);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Agent Name is required');
    });
  });

  describe('Type Validation', () => {
    it('should validate string type', () => {
      const customizations = {
        textOption: 'valid string',
        numberOption: 'invalid string',
      };

      const result = validateCustomizations(complexTemplate, customizations);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Number Option must be a number');
    });

    it('should validate number type', () => {
      const customizations = {
        numberOption: 123,
        textOption: 456, // Invalid: should be string
      };

      const result = validateCustomizations(complexTemplate, customizations);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Text Option must be a string');
    });

    it('should validate boolean type', () => {
      const customizations = {
        booleanOption: true,
        textOption: false, // Invalid: should be string
      };

      const result = validateCustomizations(complexTemplate, customizations);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Text Option must be a string');
    });

    it('should validate array type', () => {
      const customizations = {
        arrayOption: ['item1', 'item2'],
        textOption: ['invalid', 'array'], // Invalid: should be string
      };

      const result = validateCustomizations(complexTemplate, customizations);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Text Option must be a string');
    });

    it('should validate object type', () => {
      const customizations = {
        objectOption: { key: 'value' },
        textOption: { invalid: 'object' }, // Invalid: should be string
      };

      const result = validateCustomizations(complexTemplate, customizations);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Text Option must be a string');
    });

    it('should reject NaN for number type', () => {
      const customizations = {
        numberOption: NaN,
      };

      const result = validateCustomizations(complexTemplate, customizations);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Number Option must be a number');
    });

    it('should use default value for null in non-required fields', () => {
      const customizations = {
        skill: null, // Should use default value "General"
      };

      const result = validateCustomizations(simpleTemplate, customizations);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Validation Rules', () => {
    describe('min validation', () => {
      it('should validate string length minimum', () => {
        const customizations = {
          name: 'ab', // Too short (min 3)
          age: 20,
          level: 'junior',
        };

        const result = validateCustomizations(mockTemplate, customizations);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Name must be at least 3 characters long');
      });

      it('should validate number value minimum', () => {
        const customizations = {
          name: 'Valid Name',
          age: 15, // Too young (min 18)
          level: 'junior',
        };

        const result = validateCustomizations(mockTemplate, customizations);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Age must be at least 18');
      });

      it('should pass minimum validation', () => {
        const customizations = {
          name: 'Valid Name',
          age: 20,
          level: 'junior',
        };

        const result = validateCustomizations(mockTemplate, customizations);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });

    describe('max validation', () => {
      it('should validate string length maximum', () => {
        const customizations = {
          name: 'a'.repeat(51), // Too long (max 50)
          age: 25,
          level: 'junior',
        };

        const result = validateCustomizations(mockTemplate, customizations);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Name must be no more than 50 characters long');
      });

      it('should validate number value maximum', () => {
        const customizations = {
          name: 'Valid Name',
          age: 150, // Too old (max 100)
          level: 'junior',
        };

        const result = validateCustomizations(mockTemplate, customizations);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Age must be no more than 100');
      });

      it('should pass maximum validation', () => {
        const customizations = {
          name: 'Valid Name',
          age: 50,
          level: 'senior',
        };

        const result = validateCustomizations(mockTemplate, customizations);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });

    describe('enum validation', () => {
      it('should validate enum values', () => {
        const customizations = {
          name: 'Valid Name',
          age: 25,
          level: 'invalid', // Not in enum
        };

        const result = validateCustomizations(mockTemplate, customizations);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Level must be one of: junior, mid, senior, expert');
      });

      it('should pass enum validation', () => {
        const validLevels = ['junior', 'mid', 'senior', 'expert'];

        validLevels.forEach((level) => {
          const customizations = {
            name: 'Valid Name',
            age: 25,
            level,
          };

          const result = validateCustomizations(mockTemplate, customizations);

          expect(result.valid).toBe(true);
          expect(result.errors).toEqual([]);
        });
      });

      it('should handle case-sensitive enum validation', () => {
        const customizations = {
          name: 'Valid Name',
          age: 25,
          level: 'Junior', // Wrong case
        };

        const result = validateCustomizations(mockTemplate, customizations);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Level must be one of: junior, mid, senior, expert');
      });
    });
  });

  describe('Complex Validation Scenarios', () => {
    it('should handle multiple validation errors', () => {
      const customizations = {
        name: 'ab', // Too short
        age: 15, // Too young
        level: 'invalid', // Not in enum
        active: 'not a boolean', // Wrong type
      };

      const result = validateCustomizations(mockTemplate, customizations);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
      expect(result.errors).toContain('Name must be at least 3 characters long');
      expect(result.errors).toContain('Age must be at least 18');
      expect(result.errors).toContain('Level must be one of: junior, mid, senior, expert');
      expect(result.errors).toContain('Active Status must be a boolean');
    });

    it('should pass with all valid customizations', () => {
      const customizations = {
        name: 'Valid Agent Name',
        age: 30,
        level: 'senior',
        active: true,
      };

      const result = validateCustomizations(mockTemplate, customizations);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should handle customizations not in template options', () => {
      const customizations = {
        name: 'Valid Name',
        age: 25,
        level: 'junior',
        customField: 'custom value', // Not in template options
      };

      const result = validateCustomizations(mockTemplate, customizations);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      // Should ignore custom fields not in template options
    });

    it('should handle undefined values for non-required fields', () => {
      const customizations = {
        name: 'Valid Name',
        age: 25,
        level: 'junior',
        active: undefined, // Not required, should be fine
      };

      const result = validateCustomizations(mockTemplate, customizations);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty template options', () => {
      const emptyTemplate = {
        ...simpleTemplate,
        customizationOptions: [],
      };

      const result = validateCustomizations(emptyTemplate, { any: 'value' });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should handle template with no validation rules', () => {
      const noValidationTemplate = {
        ...simpleTemplate,
        customizationOptions: [
          {
            id: 'name',
            name: 'Agent Name',
            description: 'The name of the agent',
            type: 'string',
            defaultValue: 'Default Agent',
            required: true,
            // No validation rules
          },
        ],
      };

      const customizations = {
        name: 'Any Name',
      };

      const result = validateCustomizations(noValidationTemplate, customizations);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should handle zero values', () => {
      const customizations = {
        numberOption: 0,
        booleanOption: false,
      };

      const result = validateCustomizations(complexTemplate, customizations);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should handle empty arrays and objects', () => {
      const customizations = {
        arrayOption: [],
        objectOption: {},
      };

      const result = validateCustomizations(complexTemplate, customizations);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should handle special characters in strings', () => {
      const customizations = {
        name: 'Agent with special chars: !@#$%^&*()',
        age: 25,
        level: 'senior',
      };

      const result = validateCustomizations(mockTemplate, customizations);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('Default Value Merging', () => {
    it('should merge with default values for missing options', () => {
      const customizations = {
        name: 'Custom Name',
        // 'age' and 'level' should get defaults
      };

      const result = validateCustomizations(mockTemplate, customizations);

      expect(result.valid).toBe(true);
      // Validation should use defaults (25 for age, 'junior' for level)
    });

    it('should override defaults with provided values', () => {
      const customizations = {
        name: 'Custom Name',
        age: 35, // Override default of 25
        level: 'expert', // Override default of 'junior'
      };

      const result = validateCustomizations(mockTemplate, customizations);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should preserve original customizations when checking for null values', () => {
      const customizations = {
        name: null, // Explicit null for required field
        age: undefined, // Explicit undefined for required field
      };

      const result = validateCustomizations(mockTemplate, customizations);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Agent Name cannot be null');
      // Age should get default value since undefined is not explicitly provided
    });
  });
});