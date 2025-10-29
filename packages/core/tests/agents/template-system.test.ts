/**
 * Integration tests for the complete template system
 * Tests the interaction between template definitions, registry, and validation
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import {
  AgentTemplates,
  getAgentTemplate,
  getAllAgentTemplates,
  hasTemplate,
  getTemplateRoles,
} from '../../src/agents/template-registry';
import { validateCustomizations } from '../../src/agents/template-validation';
import { AgentRole } from '../../src/agents/types';

describe('Template System Integration', () => {
  describe('Template Definition and Registry Integration', () => {
    it('should have templates for all agent roles', () => {
      const allRoles: AgentRole[] = [
        'FrontendDev',
        'BackendDev',
        'QA',
        'Architect',
        'CLI Dev',
        'UX Expert',
        'SM',
        'Custom',
      ];

      allRoles.forEach((role) => {
        expect(hasTemplate(role)).toBe(true);
        const template = getAgentTemplate(role);
        expect(template).toBeDefined();
        expect(template!.id).toBeTruthy();
        expect(template!.name).toBeTruthy();
      });
    });

    it('should have consistent template metadata across all templates', () => {
      const allTemplates = getAllAgentTemplates();

      allTemplates.forEach((template) => {
        const meta = template.templateMetadata;

        expect(meta.createdAt).toBeInstanceOf(Date);
        expect(typeof meta.author).toBe('string');
        expect(typeof meta.version).toBe('string');
        expect(typeof meta.usageCount).toBe('number');
        expect(typeof meta.averageRating).toBe('number');

        // Version should follow semantic versioning
        expect(/^\d+\.\d+\.\d+(-.*)?$/.test(meta.version)).toBe(true);

        // Usage count should be non-negative
        expect(meta.usageCount).toBeGreaterThanOrEqual(0);

        // Average rating should be within valid range
        expect(meta.averageRating).toBeGreaterThanOrEqual(0);
        expect(meta.averageRating).toBeLessThanOrEqual(5);
      });
    });

    it('should have valid template structure for all templates', () => {
      const allTemplates = getAllAgentTemplates();

      allTemplates.forEach((template) => {
        const agentTemplate = template.template;

        expect(agentTemplate.name).toBeTruthy();
        expect(agentTemplate.description).toBeTruthy();
        expect(agentTemplate.role).toBeTruthy();
        expect(Array.isArray(agentTemplate.goals)).toBe(true);
        expect(agentTemplate.goals.length).toBeGreaterThan(0);
        expect(agentTemplate.backstory).toBeTruthy();
        expect(Array.isArray(agentTemplate.coreSkills)).toBe(true);
        expect(agentTemplate.coreSkills.length).toBeGreaterThan(0);
        expect(['adaptive', 'static', 'collaborative', 'autonomous']).toContain(agentTemplate.learningMode);

        // Configuration validation
        expect(agentTemplate.configuration).toBeDefined();
        expect(agentTemplate.configuration.performance).toBeDefined();
        expect(agentTemplate.configuration.capabilities).toBeDefined();
        expect(agentTemplate.configuration.communication).toBeDefined();
      });
    });

    it('should have consistent role mapping between templates and registry', () => {
      const templateRoles = getTemplateRoles();

      templateRoles.forEach((role) => {
        const template = getAgentTemplate(role);
        expect(template).toBeDefined();

        if (role !== 'Custom') {
          expect(template!.baseRole).toBe(role);
          expect(template!.template.role).toBe(role);
        }
      });
    });
  });

  describe('Template Validation Integration', () => {
    it('should validate customizations for all available templates', () => {
      const allTemplates = getAllAgentTemplates();

      allTemplates.forEach((template) => {
        // Test with empty customizations (should use defaults)
        const emptyResult = validateCustomizations(template, {});
        expect(emptyResult.valid).toBe(true);

        // Test with valid customizations
        const validCustomizations: Record<string, unknown> = {};
        template.customizationOptions.forEach((option) => {
          // Use appropriate valid values based on type and validation rules
          switch (option.type) {
            case 'string':
              // Check for enum validation first
              const enumRule = option.validation?.find(rule => rule.type === 'enum');
              if (enumRule && enumRule.params.values) {
                validCustomizations[option.id] = enumRule.params.values[0] as string;
              } else {
                // Check for min length validation
                const minRule = option.validation?.find(rule => rule.type === 'min');
                const minLength = minRule && minRule.params.length ? minRule.params.length as number : 3;
                validCustomizations[option.id] = 'a'.repeat(Math.max(minLength, 10));
              }
              break;
            case 'number':
              // Check for min value validation
              const minNumRule = option.validation?.find(rule => rule.type === 'min');
              const minValue = minNumRule && minNumRule.params.value ? minNumRule.params.value as number : 1;
              validCustomizations[option.id] = Math.max(minValue, 100);
              break;
            case 'boolean':
              validCustomizations[option.id] = true;
              break;
            case 'array':
              validCustomizations[option.id] = ['item1', 'item2'];
              break;
            case 'object':
              validCustomizations[option.id] = { key: 'value' };
              break;
          }
        });

        const validResult = validateCustomizations(template, validCustomizations);
        expect(validResult.valid).toBe(true);
      });
    });

    it('should handle invalid customizations for all templates', () => {
      const allTemplates = getAllAgentTemplates();

      allTemplates.forEach((template) => {
        if (template.customizationOptions.length === 0) return;

        // Find a required option to test invalid values
        const requiredOption = template.customizationOptions.find((opt) => opt.required);
        if (!requiredOption) return;

        // Test with missing required field
        // Only expect failure if the required field has no default value
        const missingRequiredResult = validateCustomizations(template, {});
        if (requiredOption && requiredOption.defaultValue === undefined) {
          expect(missingRequiredResult.valid).toBe(false);
          expect(missingRequiredResult.errors.length).toBeGreaterThan(0);
        } else {
          // If required field has a default, empty customizations should pass
          expect(missingRequiredResult.valid).toBe(true);
        }

        // Test with invalid type
        const invalidCustomizations: Record<string, unknown> = {};
        template.customizationOptions.forEach((option) => {
          // Provide wrong type for testing
          switch (option.type) {
            case 'string':
              invalidCustomizations[option.id] = 123; // Should be string
              break;
            case 'number':
              invalidCustomizations[option.id] = 'not a number'; // Should be number
              break;
            case 'boolean':
              invalidCustomizations[option.id] = 'not a boolean'; // Should be boolean
              break;
            case 'array':
              invalidCustomizations[option.id] = 'not an array'; // Should be array
              break;
            case 'object':
              invalidCustomizations[option.id] = 'not an object'; // Should be object
              break;
          }
        });

        const invalidResult = validateCustomizations(template, invalidCustomizations);
        expect(invalidResult.valid).toBe(false);
        expect(invalidResult.errors.length).toBeGreaterThan(0);
      });
    });

    it('should validate enum constraints for templates with enum validation', () => {
      const allTemplates = getAllAgentTemplates();

      allTemplates.forEach((template) => {
        const enumOptions = template.customizationOptions.filter((opt) =>
          opt.validation?.some((rule) => rule.type === 'enum')
        );

        enumOptions.forEach((option) => {
          const enumRule = option.validation?.find((rule) => rule.type === 'enum');
          if (!enumRule) return;

          const validValues = enumRule.params.values as string[];
          expect(Array.isArray(validValues)).toBe(true);
          expect(validValues.length).toBeGreaterThan(0);

          // Test with valid enum value
          const validCustomizations = {
            [option.id]: validValues[0],
          };
          const validResult = validateCustomizations(template, validCustomizations);
          expect(validResult.valid).toBe(true);

          // Test with invalid enum value
          const invalidCustomizations = {
            [option.id]: 'invalid_enum_value',
          };
          const invalidResult = validateCustomizations(template, invalidCustomizations);
          expect(invalidResult.valid).toBe(false);
          expect(invalidResult.errors.some((error) => error.includes('must be one of'))).toBe(true);
        });
      });
    });

    it('should validate min/max constraints for templates with numeric validation', () => {
      const allTemplates = getAllAgentTemplates();

      allTemplates.forEach((template) => {
        const numericOptions = template.customizationOptions.filter((opt) =>
          opt.type === 'number' && opt.validation?.some((rule) => ['min', 'max'].includes(rule.type))
        );

        numericOptions.forEach((option) => {
          const minRule = option.validation?.find((rule) => rule.type === 'min');
          const maxRule = option.validation?.find((rule) => rule.type === 'max');

          if (minRule) {
            const minValue = minRule.params.value as number;
            const validCustomizations = {
              [option.id]: minValue + 1, // Valid value
            };
            const validResult = validateCustomizations(template, validCustomizations);
            expect(validResult.valid).toBe(true);

            const invalidCustomizations = {
              [option.id]: minValue - 1, // Invalid value
            };
            const invalidResult = validateCustomizations(template, invalidCustomizations);
            expect(invalidResult.valid).toBe(false);
          }

          if (maxRule) {
            const maxValue = maxRule.params.value as number;
            const validCustomizations = {
              [option.id]: maxValue - 1, // Valid value
            };
            const validResult = validateCustomizations(template, validCustomizations);
            expect(validResult.valid).toBe(true);

            const invalidCustomizations = {
              [option.id]: maxValue + 1, // Invalid value
            };
            const invalidResult = validateCustomizations(template, invalidCustomizations);
            expect(invalidResult.valid).toBe(false);
          }
        });
      });
    });
  });

  describe('Template System Edge Cases', () => {
    it('should handle templates with no customization options', () => {
      const templateWithNoOptions = {
        id: 'no-options-template',
        name: 'No Options Template',
        description: 'Template with no customization options',
        baseRole: 'Custom' as AgentRole,
        template: {
          name: 'No Options Agent',
          description: 'Agent with no customization options',
          role: 'Custom',
          goals: ['No options goal'],
          backstory: 'No options backstory',
          coreSkills: ['No options skill'],
          learningMode: 'static' as const,
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
              style: 'formal' as const,
              responseFormat: 'plain-text' as const,
              collaboration: {
                enabled: false,
                roles: ['contributor'],
                conflictResolution: 'collaborative' as const,
              },
            },
          },
        },
        customizationOptions: [],
        templateMetadata: {
          createdAt: new Date(),
          author: 'Test Author',
          version: '1.0.0',
          usageCount: 0,
          averageRating: 0,
        },
      };

      const result = validateCustomizations(templateWithNoOptions, { any: 'value' });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should handle templates with all required fields', () => {
      const allRequiredTemplate = {
        id: 'all-required-template',
        name: 'All Required Template',
        description: 'Template with all required customization options',
        baseRole: 'Custom' as AgentRole,
        template: {
          name: 'All Required Agent',
          description: 'Agent with all required options',
          role: 'Custom',
          goals: ['All required goal'],
          backstory: 'All required backstory',
          coreSkills: ['All required skill'],
          learningMode: 'static' as const,
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
              style: 'formal' as const,
              responseFormat: 'plain-text' as const,
              collaboration: {
                enabled: false,
                roles: ['contributor'],
                conflictResolution: 'collaborative' as const,
              },
            },
          },
        },
        customizationOptions: [
          {
            id: 'requiredField',
            name: 'Required Field',
            description: 'A required field with no default',
            type: 'string',
            required: true,
            // No default value - should fail when not provided
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

      // Should fail with empty customizations
      const emptyResult = validateCustomizations(allRequiredTemplate, {});
      expect(emptyResult.valid).toBe(false);

      // Should pass with provided value
      const validResult = validateCustomizations(allRequiredTemplate, {
        requiredField: 'provided value',
      });
      expect(validResult.valid).toBe(true);
    });

    it('should handle templates with complex nested validation', () => {
      const complexValidationTemplate = {
        id: 'complex-validation-template',
        name: 'Complex Validation Template',
        description: 'Template with complex validation rules',
        baseRole: 'Custom' as AgentRole,
        template: {
          name: 'Complex Validation Agent',
          description: 'Agent with complex validation',
          role: 'Custom',
          goals: ['Complex validation goal'],
          backstory: 'Complex validation backstory',
          coreSkills: ['Complex validation skill'],
          learningMode: 'static' as const,
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
              style: 'formal' as const,
              responseFormat: 'plain-text' as const,
              collaboration: {
                enabled: false,
                roles: ['contributor'],
                conflictResolution: 'collaborative' as const,
              },
            },
          },
        },
        customizationOptions: [
          {
            id: 'complexField',
            name: 'Complex Field',
            description: 'Field with multiple validation rules',
            type: 'string',
            defaultValue: 'default value',
            required: true,
            validation: [
              {
                type: 'min' as const,
                params: { length: 5 },
                message: 'Must be at least 5 characters',
              },
              {
                type: 'max' as const,
                params: { length: 20 },
                message: 'Must be no more than 20 characters',
              },
            ],
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

      // Test multiple validation failures
      const invalidResult = validateCustomizations(complexValidationTemplate, {
        complexField: 'ab', // Too short
      });
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('Must be at least 5 characters');

      // Test multiple validation successes
      const validResult = validateCustomizations(complexValidationTemplate, {
        complexField: 'valid length value',
      });
      expect(validResult.valid).toBe(true);
      expect(validResult.errors).toEqual([]);
    });
  });

  describe('Template System Performance', () => {
    it('should handle large numbers of customizations efficiently', () => {
      const largeTemplate = {
        id: 'large-template',
        name: 'Large Template',
        description: 'Template with many customization options',
        baseRole: 'Custom' as AgentRole,
        template: {
          name: 'Large Agent',
          description: 'Agent with many options',
          role: 'Custom',
          goals: ['Large goal'],
          backstory: 'Large backstory',
          coreSkills: ['Large skill'],
          learningMode: 'static' as const,
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
              style: 'formal' as const,
              responseFormat: 'plain-text' as const,
              collaboration: {
                enabled: false,
                roles: ['contributor'],
                conflictResolution: 'collaborative' as const,
              },
            },
          },
        },
        customizationOptions: Array.from({ length: 100 }, (_, i) => ({
          id: `option${i}`,
          name: `Option ${i}`,
          description: `Description for option ${i}`,
          type: 'string' as const,
          defaultValue: i % 10 === 0 ? undefined : `default${i}`, // Every 10th option has no default
          required: i % 10 === 0, // Every 10th option is required and has no default
        })),
        templateMetadata: {
          createdAt: new Date(),
          author: 'Test Author',
          version: '1.0.0',
          usageCount: 0,
          averageRating: 0,
        },
      };

      const startTime = Date.now();

      // Test with some required fields missing
      const result = validateCustomizations(largeTemplate, {});

      const endTime = Date.now();
      const validationTime = endTime - startTime;

      // Should complete reasonably quickly (less than 100ms)
      expect(validationTime).toBeLessThan(100);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle repeated validation calls efficiently', () => {
      const template = getAgentTemplate('FrontendDev');
      expect(template).toBeDefined();

      const customizations = {
        name: 'Test Agent',
        skill: 'Test Skill',
      };

      const iterations = 1000;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        validateCustomizations(template!, customizations);
      }

      const endTime = Date.now();
      const averageTime = (endTime - startTime) / iterations;

      // Average validation time should be very small (less than 1ms per validation)
      expect(averageTime).toBeLessThan(1);
    });
  });
});