/**
 * Tests for template registry functionality
 * Comprehensive coverage of template management and lookup
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  AgentTemplates,
  getAgentTemplate,
  getAllAgentTemplates,
  hasTemplate,
  getTemplateRoles,
} from '../../src/agents/template-registry';
import { AgentTemplate, AgentRole } from '../../src/agents/types';

describe('Template Registry', () => {
  describe('AgentTemplates', () => {
    it('should contain entries for all agent roles including Custom', () => {
      const expectedRoles: AgentRole[] = [
        'FrontendDev',
        'BackendDev',
        'QA',
        'Architect',
        'CLI Dev',
        'UX Expert',
        'SM',
        'Custom',
      ];

      expect(Object.keys(AgentTemplates)).toHaveLength(8);
      expectedRoles.forEach((role) => {
        expect(AgentTemplates).toHaveProperty(role);
        expect(AgentTemplates[role]).toBeDefined();
      });
    });

    it('should contain valid AgentTemplate objects', () => {
      Object.values(AgentTemplates).forEach((template) => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('baseRole');
        expect(template).toHaveProperty('template');
        expect(template).toHaveProperty('customizationOptions');
        expect(template).toHaveProperty('templateMetadata');

        expect(typeof template.id).toBe('string');
        expect(typeof template.name).toBe('string');
        expect(typeof template.description).toBe('string');
        expect(typeof template.baseRole).toBe('string');
        expect(typeof template.template).toBe('object');
        expect(Array.isArray(template.customizationOptions)).toBe(true);
        expect(typeof template.templateMetadata).toBe('object');
      });
    });

    it('should have unique template IDs', () => {
      const ids = Object.values(AgentTemplates).map((template) => template.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids).toEqual(uniqueIds);
    });

    it('should have unique template names', () => {
      const names = Object.values(AgentTemplates).map((template) => template.name);
      const uniqueNames = [...new Set(names)];
      expect(names).toEqual(uniqueNames);
    });

    it('should have base roles matching registry keys for non-Custom roles', () => {
      Object.entries(AgentTemplates).forEach(([role, template]) => {
        if (role !== 'Custom') {
          expect(template.baseRole).toBe(role);
        }
      });
    });
  });

  describe('getAgentTemplate', () => {
    it('should return correct template for valid roles', () => {
      const roles: AgentRole[] = [
        'FrontendDev',
        'BackendDev',
        'QA',
        'Architect',
        'CLI Dev',
        'UX Expert',
        'SM',
        'Custom',
      ];

      roles.forEach((role) => {
        const template = getAgentTemplate(role);
        expect(template).toBeDefined();
        expect(template!.id).toBeDefined();
        expect(template!.name).toBeDefined();
      });
    });

    it('should return undefined for invalid role', () => {
      const template = getAgentTemplate('InvalidRole' as AgentRole);
      expect(template).toBeUndefined();
    });

    it('should return a copy of the template', () => {
      const template1 = getAgentTemplate('FrontendDev');
      const template2 = getAgentTemplate('FrontendDev');

      expect(template1).not.toBe(template2); // Should be different references
      expect(template1).toEqual(template2); // But should have same content
    });

    it('should return template with correct structure for each role', () => {
      const template = getAgentTemplate('FrontendDev');

      expect(template).toBeDefined();
      expect(template!.template).toHaveProperty('name');
      expect(template!.template).toHaveProperty('description');
      expect(template!.template).toHaveProperty('role');
      expect(template!.template).toHaveProperty('goals');
      expect(template!.template).toHaveProperty('backstory');
      expect(template!.template).toHaveProperty('coreSkills');
      expect(template!.template).toHaveProperty('learningMode');
      expect(template!.template).toHaveProperty('configuration');
    });
  });

  describe('getAllAgentTemplates', () => {
    it('should return all agent templates', () => {
      const allTemplates = getAllAgentTemplates();

      expect(allTemplates).toHaveLength(8);
      expect(allTemplates).toEqual(Object.values(AgentTemplates));
    });

    it('should return AgentTemplate objects with correct structure', () => {
      const allTemplates = getAllAgentTemplates();

      allTemplates.forEach((template) => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('baseRole');
        expect(template).toHaveProperty('template');
        expect(template).toHaveProperty('customizationOptions');
        expect(template).toHaveProperty('templateMetadata');

        // Verify template structure
        expect(template.template).toHaveProperty('name');
        expect(template.template).toHaveProperty('description');
        expect(template.template).toHaveProperty('role');
        expect(template.template).toHaveProperty('goals');
        expect(template.template).toHaveProperty('backstory');
        expect(template.template).toHaveProperty('coreSkills');
        expect(template.template).toHaveProperty('learningMode');
        expect(template.template).toHaveProperty('configuration');
      });
    });

    it('should return different array instances', () => {
      const allTemplates1 = getAllAgentTemplates();
      const allTemplates2 = getAllAgentTemplates();

      expect(allTemplates1).not.toBe(allTemplates2); // Different array instances
      expect(allTemplates1).toEqual(allTemplates2); // Same content
    });

    it('should have templates with valid customization options', () => {
      const allTemplates = getAllAgentTemplates();

      allTemplates.forEach((template) => {
        expect(Array.isArray(template.customizationOptions)).toBe(true);

        template.customizationOptions.forEach((option) => {
          expect(option).toHaveProperty('id');
          expect(option).toHaveProperty('name');
          expect(option).toHaveProperty('description');
          expect(option).toHaveProperty('type');
          expect(option).toHaveProperty('defaultValue');
          expect(option).toHaveProperty('required');
          expect(['string', 'number', 'boolean', 'array', 'object']).toContain(option.type);
          expect(typeof option.required).toBe('boolean');
        });
      });
    });

    it('should have templates with valid metadata', () => {
      const allTemplates = getAllAgentTemplates();

      allTemplates.forEach((template) => {
        const meta = template.templateMetadata;
        expect(meta).toHaveProperty('createdAt');
        expect(meta).toHaveProperty('author');
        expect(meta).toHaveProperty('version');
        expect(meta).toHaveProperty('usageCount');
        expect(meta).toHaveProperty('averageRating');

        expect(meta.createdAt).toBeInstanceOf(Date);
        expect(typeof meta.author).toBe('string');
        expect(typeof meta.version).toBe('string');
        expect(typeof meta.usageCount).toBe('number');
        expect(typeof meta.averageRating).toBe('number');
      });
    });
  });

  describe('hasTemplate', () => {
    it('should return true for all available templates', () => {
      const availableRoles: AgentRole[] = [
        'FrontendDev',
        'BackendDev',
        'QA',
        'Architect',
        'CLI Dev',
        'UX Expert',
        'SM',
        'Custom',
      ];

      availableRoles.forEach((role) => {
        expect(hasTemplate(role)).toBe(true);
      });
    });

    it('should return false for invalid roles', () => {
      const invalidRoles = [
        'InvalidRole',
        'Frontend Developer',
        'Backend Developer',
        'QA Engineer',
        '',
        null,
        undefined,
      ];

      invalidRoles.forEach((role) => {
        expect(hasTemplate(role as AgentRole)).toBe(false);
      });
    });

    it('should be case sensitive', () => {
      expect(hasTemplate('FrontendDev')).toBe(true);
      expect(hasTemplate('frontenddev')).toBe(false);
      expect(hasTemplate('FRONTENDDEV')).toBe(false);
    });

    it('should work with the full set of roles', () => {
      const allRoles = getTemplateRoles();
      allRoles.forEach((role) => {
        expect(hasTemplate(role)).toBe(true);
      });
    });
  });

  describe('getTemplateRoles', () => {
    it('should return all available template roles', () => {
      const roles = getTemplateRoles();

      expect(roles).toHaveLength(8);
      expect(roles).toContain('FrontendDev');
      expect(roles).toContain('BackendDev');
      expect(roles).toContain('QA');
      expect(roles).toContain('Architect');
      expect(roles).toContain('CLI Dev');
      expect(roles).toContain('UX Expert');
      expect(roles).toContain('SM');
      expect(roles).toContain('Custom');
    });

    it('should return AgentRole type array', () => {
      const roles = getTemplateRoles();

      roles.forEach((role) => {
        expect([
          'FrontendDev',
          'BackendDev',
          'QA',
          'Architect',
          'CLI Dev',
          'UX Expert',
          'SM',
          'Custom',
        ]).toContain(role);
      });
    });

    it('should return array of registry keys', () => {
      const roles = getTemplateRoles();
      const registryKeys = Object.keys(AgentTemplates) as AgentRole[];

      expect(roles.sort()).toEqual(registryKeys.sort());
    });

    it('should return different array instances', () => {
      const roles1 = getTemplateRoles();
      const roles2 = getTemplateRoles();

      expect(roles1).not.toBe(roles2); // Different array instances
      expect(roles1).toEqual(roles2); // Same content
    });
  });

  describe('Template Content Validation', () => {
    it('should validate FrontendDev template content', () => {
      const template = getAgentTemplate('FrontendDev');

      expect(template).toBeDefined();
      expect(template!.baseRole).toBe('FrontendDev');
      expect(template!.name).toContain('Frontend');
      expect(template!.description).toContain('frontend');
      expect(template!.template.role).toBe('FrontendDev');
      expect(template!.template.coreSkills.length).toBeGreaterThan(0);
    });

    it('should validate BackendDev template content', () => {
      const template = getAgentTemplate('BackendDev');

      expect(template).toBeDefined();
      expect(template!.baseRole).toBe('BackendDev');
      expect(template!.name).toContain('Backend');
      expect(template!.template.role).toBe('BackendDev');
      expect(template!.template.coreSkills.length).toBeGreaterThan(0);
    });

    it('should validate QA template content', () => {
      const template = getAgentTemplate('QA');

      expect(template).toBeDefined();
      expect(template!.baseRole).toBe('QA');
      expect(template!.name).toContain('QA');
      expect(template!.template.role).toBe('QA');
      expect(template!.template.coreSkills.length).toBeGreaterThan(0);
    });

    it('should validate Architect template content', () => {
      const template = getAgentTemplate('Architect');

      expect(template).toBeDefined();
      expect(template!.baseRole).toBe('Architect');
      expect(template!.name).toContain('Architect');
      expect(template!.template.role).toBe('Architect');
      expect(template!.template.coreSkills.length).toBeGreaterThan(0);
    });

    it('should validate CLI Dev template content', () => {
      const template = getAgentTemplate('CLI Dev');

      expect(template).toBeDefined();
      expect(template!.baseRole).toBe('CLI Dev');
      expect(template!.name).toContain('CLI');
      expect(template!.template.role).toBe('CLI Dev');
      expect(template!.template.coreSkills.length).toBeGreaterThan(0);
    });

    it('should validate UX Expert template content', () => {
      const template = getAgentTemplate('UX Expert');

      expect(template).toBeDefined();
      expect(template!.baseRole).toBe('UX Expert');
      expect(template!.name).toContain('UX');
      expect(template!.template.role).toBe('UX Expert');
      expect(template!.template.coreSkills.length).toBeGreaterThan(0);
    });

    it('should validate SM template content', () => {
      const template = getAgentTemplate('SM');

      expect(template).toBeDefined();
      expect(template!.baseRole).toBe('SM');
      expect(template!.name).toContain('Scrum');
      expect(template!.template.role).toBe('SM');
      expect(template!.template.coreSkills.length).toBeGreaterThan(0);
    });

    it('should validate Custom template content', () => {
      const template = getAgentTemplate('Custom');

      expect(template).toBeDefined();
      // Custom role uses SMTemplate as placeholder
      expect(template!.baseRole).toBe('SM');
      expect(template!.id).toBeDefined();
      expect(template!.template).toBeDefined();
    });
  });

  describe('Customization Options Validation', () => {
    it('should have valid customization options for all templates', () => {
      const allTemplates = getAllAgentTemplates();

      allTemplates.forEach((template) => {
        expect(Array.isArray(template.customizationOptions)).toBe(true);

        template.customizationOptions.forEach((option) => {
          // Required properties
          expect(option.id).toBeTruthy();
          expect(option.name).toBeTruthy();
          expect(option.description).toBeTruthy();
          expect(typeof option.type).toBe('string');
          expect(option.defaultValue !== undefined).toBe(true);
          expect(typeof option.required).toBe('boolean');

          // Valid types
          expect(['string', 'number', 'boolean', 'array', 'object']).toContain(option.type);

          // Type consistency with default value
          if (option.type === 'string') {
            expect(typeof option.defaultValue).toBe('string');
          } else if (option.type === 'number') {
            expect(typeof option.defaultValue).toBe('number');
          } else if (option.type === 'boolean') {
            expect(typeof option.defaultValue).toBe('boolean');
          } else if (option.type === 'array') {
            expect(Array.isArray(option.defaultValue)).toBe(true);
          } else if (option.type === 'object') {
            expect(typeof option.defaultValue === 'object' && option.defaultValue !== null && !Array.isArray(option.defaultValue)).toBe(true);
          }

          // Validation rules should be array if present
          if (option.validation) {
            expect(Array.isArray(option.validation)).toBe(true);
          }
        });
      });
    });

    it('should have at least one customization option per template', () => {
      const allTemplates = getAllAgentTemplates();

      allTemplates.forEach((template) => {
        expect(template.customizationOptions.length).toBeGreaterThan(0);
      });
    });

    it('should have unique option IDs within each template', () => {
      const allTemplates = getAllAgentTemplates();

      allTemplates.forEach((template) => {
        const optionIds = template.customizationOptions.map((opt) => opt.id);
        const uniqueIds = [...new Set(optionIds)];
        expect(optionIds).toEqual(uniqueIds);
      });
    });
  });

  describe('Template Configuration Validation', () => {
    it('should have valid template configurations', () => {
      const allTemplates = getAllAgentTemplates();

      allTemplates.forEach((template) => {
        const config = template.template.configuration;

        expect(config).toHaveProperty('performance');
        expect(config).toHaveProperty('capabilities');
        expect(config).toHaveProperty('communication');

        // Performance config
        expect(config.performance.maxExecutionTime).toBeGreaterThan(0);
        expect(config.performance.memoryLimit).toBeGreaterThan(0);
        expect(config.performance.maxConcurrentTasks).toBeGreaterThan(0);
        expect(config.performance.priority).toBeGreaterThanOrEqual(1);
        expect(config.performance.priority).toBeLessThanOrEqual(10);

        // Capabilities config
        expect(Array.isArray(config.capabilities.allowedTools)).toBe(true);
        expect(typeof config.capabilities.fileSystemAccess.read).toBe('boolean');
        expect(typeof config.capabilities.fileSystemAccess.write).toBe('boolean');
        expect(typeof config.capabilities.fileSystemAccess.execute).toBe('boolean');
        expect(typeof config.capabilities.networkAccess.http).toBe('boolean');
        expect(typeof config.capabilities.networkAccess.https).toBe('boolean');
        expect(typeof config.capabilities.networkAccess.externalApis).toBe('boolean');
        expect(typeof config.capabilities.agentIntegration).toBe('boolean');

        // Communication config
        expect(['formal', 'casual', 'technical', 'educational', 'concise', 'detailed']).toContain(config.communication.style);
        expect(['markdown', 'json', 'xml', 'plain-text', 'structured']).toContain(config.communication.responseFormat);
        expect(typeof config.communication.collaboration.enabled).toBe('boolean');
        expect(Array.isArray(config.communication.collaboration.roles)).toBe(true);
        expect(['collaborative', 'competitive', 'compromise', 'avoidance', 'accommodation']).toContain(
          config.communication.collaboration.conflictResolution
        );
      });
    });
  });

  describe('Registry Consistency', () => {
    it('should maintain consistency between registry functions', () => {
      const rolesFromGetTemplateRoles = getTemplateRoles();
      const rolesFromRegistryKeys = Object.keys(AgentTemplates) as AgentRole[];
      const templatesFromGetAll = getAllAgentTemplates();

      expect(rolesFromGetTemplateRoles.sort()).toEqual(rolesFromRegistryKeys.sort());
      expect(templatesFromGetAll).toHaveLength(rolesFromGetTemplateRoles.length);

      rolesFromGetTemplateRoles.forEach((role) => {
        expect(hasTemplate(role)).toBe(true);
        expect(getAgentTemplate(role)).toBeDefined();
      });
    });

    it('should maintain immutability of registry', () => {
      const originalTemplate = getAgentTemplate('FrontendDev');

      // Attempt to modify registry
      expect(() => {
        (AgentTemplates as any).NewRole = {} as AgentTemplate;
      }).not.toThrow();

      // Registry should still be functional
      expect(getAgentTemplate('FrontendDev')).toBeDefined();
      expect(hasTemplate('FrontendDev')).toBe(true);

      // Restore original state
      delete (AgentTemplates as any).NewRole;

      // Original template should be unchanged
      const newTemplate = getAgentTemplate('FrontendDev');
      expect(originalTemplate).toEqual(newTemplate);
    });
  });
});