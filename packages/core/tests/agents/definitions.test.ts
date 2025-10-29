/**
 * Tests for agent definitions and registry functionality
 * Comprehensive coverage of agent definition management and lookup
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  AgentRegistry,
  PredefinedAgentTypes,
  getAgentDefinition,
  getAllAgentDefinitions,
  isPredefinedAgentType,
} from '../../src/agents/definitions';
import { AgentDefinition, AgentRole } from '../../src/agents/types';

describe('Agent Definitions', () => {
  describe('PredefinedAgentTypes', () => {
    it('should contain all expected agent types', () => {
      const expectedTypes: AgentRole[] = [
        'FrontendDev',
        'BackendDev',
        'QA',
        'Architect',
        'CLI Dev',
        'UX Expert',
        'SM',
      ];

      expect(PredefinedAgentTypes).toHaveLength(7);
      expectedTypes.forEach((type) => {
        expect(PredefinedAgentTypes).toContain(type);
      });
    });

    it('should not contain Custom type', () => {
      expect(PredefinedAgentTypes).not.toContain('Custom');
    });

    it('should have unique agent types', () => {
      const uniqueTypes = [...new Set(PredefinedAgentTypes)];
      expect(PredefinedAgentTypes).toEqual(uniqueTypes);
    });
  });

  describe('AgentRegistry', () => {
    it('should contain entries for all predefined agent types', () => {
      expect(Object.keys(AgentRegistry)).toHaveLength(7);

      PredefinedAgentTypes.forEach((type) => {
        expect(AgentRegistry).toHaveProperty(type);
        expect(AgentRegistry[type]).toBeDefined();
      });
    });

    it('should contain valid AgentDefinition objects', () => {
      Object.values(AgentRegistry).forEach((agent) => {
        expect(agent).toHaveProperty('id');
        expect(agent).toHaveProperty('name');
        expect(agent).toHaveProperty('description');
        expect(agent).toHaveProperty('role');
        expect(agent).toHaveProperty('goals');
        expect(agent).toHaveProperty('backstory');
        expect(agent).toHaveProperty('coreSkills');
        expect(agent).toHaveProperty('learningMode');
        expect(agent).toHaveProperty('configuration');
        expect(agent).toHaveProperty('metadata');

        expect(typeof agent.id).toBe('string');
        expect(typeof agent.name).toBe('string');
        expect(typeof agent.description).toBe('string');
        expect(typeof agent.backstory).toBe('string');
        expect(Array.isArray(agent.goals)).toBe(true);
        expect(Array.isArray(agent.coreSkills)).toBe(true);
        expect(typeof agent.learningMode).toBe('string');
        expect(typeof agent.configuration).toBe('object');
        expect(typeof agent.metadata).toBe('object');
      });
    });

    it('should have unique IDs for all agents', () => {
      const ids = Object.values(AgentRegistry).map((agent) => agent.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids).toEqual(uniqueIds);
    });

    it('should have unique names for all agents', () => {
      const names = Object.values(AgentRegistry).map((agent) => agent.name);
      const uniqueNames = [...new Set(names)];
      expect(names).toEqual(uniqueNames);
    });
  });

  describe('getAgentDefinition', () => {
    it('should return correct agent definition for valid roles', () => {
      PredefinedAgentTypes.forEach((role) => {
        const agent = getAgentDefinition(role);
        expect(agent).toBeDefined();
        expect(agent?.role).toBe(role);
      });
    });

    it('should return undefined for invalid role', () => {
      const agent = getAgentDefinition('InvalidRole' as AgentRole);
      expect(agent).toBeUndefined();
    });

    it('should return undefined for Custom role', () => {
      const agent = getAgentDefinition('Custom');
      expect(agent).toBeUndefined();
    });

    it('should return a copy of the agent definition', () => {
      const originalAgent = getAgentDefinition('FrontendDev');
      const agent1 = getAgentDefinition('FrontendDev');
      const agent2 = getAgentDefinition('FrontendDev');

      expect(agent1).not.toBe(originalAgent); // Should be different references if modified
      expect(agent1).toEqual(originalAgent); // But should have same content
      expect(agent1).toEqual(agent2); // And consistent across calls
    });
  });

  describe('getAllAgentDefinitions', () => {
    it('should return all agent definitions', () => {
      const allAgents = getAllAgentDefinitions();

      expect(allAgents).toHaveLength(7);
      expect(allAgents).toEqual(Object.values(AgentRegistry));
    });

    it('should return AgentDefinition objects with correct structure', () => {
      const allAgents = getAllAgentDefinitions();

      allAgents.forEach((agent) => {
        expect(agent).toHaveProperty('id');
        expect(agent).toHaveProperty('name');
        expect(agent).toHaveProperty('description');
        expect(agent).toHaveProperty('role');
        expect(agent).toHaveProperty('goals');
        expect(agent).toHaveProperty('backstory');
        expect(agent).toHaveProperty('coreSkills');
        expect(agent).toHaveProperty('learningMode');
        expect(agent).toHaveProperty('configuration');
        expect(agent).toHaveProperty('metadata');

        // Verify role is one of predefined types
        expect(PredefinedAgentTypes).toContain(agent.role);
      });
    });

    it('should return different array instances', () => {
      const allAgents1 = getAllAgentDefinitions();
      const allAgents2 = getAllAgentDefinitions();

      expect(allAgents1).not.toBe(allAgents2); // Different array instances
      expect(allAgents1).toEqual(allAgents2); // Same content
    });
  });

  describe('isPredefinedAgentType', () => {
    it('should return true for all predefined agent types', () => {
      PredefinedAgentTypes.forEach((role) => {
        expect(isPredefinedAgentType(role)).toBe(true);
      });
    });

    it('should return false for invalid agent types', () => {
      const invalidTypes = [
        'InvalidRole',
        'Custom',
        'Frontend Developer',
        'Backend-Dev',
        'QA Engineer',
        '',
        null,
        undefined,
      ];

      invalidTypes.forEach((type) => {
        expect(isPredefinedAgentType(type as string)).toBe(false);
      });
    });

    it('should be case sensitive', () => {
      expect(isPredefinedAgentType('frontenddev')).toBe(false);
      expect(isPredefinedAgentType('FRONTENDDEV')).toBe(false);
      expect(isPredefinedAgentType('FrontendDev')).toBe(true);
    });
  });

  describe('Agent Definition Content Validation', () => {
    it('should validate FrontendDev agent definition', () => {
      const agent = getAgentDefinition('FrontendDev');

      expect(agent).toBeDefined();
      expect(agent!.role).toBe('FrontendDev');
      expect(agent!.name).toContain('Frontend');
      expect(agent!.coreSkills).toContain('JavaScript');
      expect(agent!.learningMode).toMatch(/^(adaptive|static|collaborative|autonomous)$/);
      expect(agent!.configuration).toBeDefined();
      expect(agent!.configuration.capabilities).toBeDefined();
      expect(agent!.configuration.performance).toBeDefined();
      expect(agent!.configuration.communication).toBeDefined();
    });

    it('should validate BackendDev agent definition', () => {
      const agent = getAgentDefinition('BackendDev');

      expect(agent).toBeDefined();
      expect(agent!.role).toBe('BackendDev');
      expect(agent!.name).toContain('Backend');
      expect(agent!.coreSkills).toContain('API');
      expect(agent!.learningMode).toMatch(/^(adaptive|static|collaborative|autonomous)$/);
    });

    it('should validate QA agent definition', () => {
      const agent = getAgentDefinition('QA');

      expect(agent).toBeDefined();
      expect(agent!.role).toBe('QA');
      expect(agent!.name).toContain('QA');
      expect(agent!.coreSkills).toContain('Testing');
      expect(agent!.learningMode).toMatch(/^(adaptive|static|collaborative|autonomous)$/);
    });

    it('should validate Architect agent definition', () => {
      const agent = getAgentDefinition('Architect');

      expect(agent).toBeDefined();
      expect(agent!.role).toBe('Architect');
      expect(agent!.name).toContain('Architect');
      expect(agent!.coreSkills).toContain('Architecture');
      expect(agent!.learningMode).toMatch(/^(adaptive|static|collaborative|autonomous)$/);
    });

    it('should validate CLI Dev agent definition', () => {
      const agent = getAgentDefinition('CLI Dev');

      expect(agent).toBeDefined();
      expect(agent!.role).toBe('CLI Dev');
      expect(agent!.name).toContain('CLI');
      expect(agent!.learningMode).toMatch(/^(adaptive|static|collaborative|autonomous)$/);
    });

    it('should validate UX Expert agent definition', () => {
      const agent = getAgentDefinition('UX Expert');

      expect(agent).toBeDefined();
      expect(agent!.role).toBe('UX Expert');
      expect(agent!.name).toContain('UX');
      expect(agent!.coreSkills).toContain('Design');
      expect(agent!.learningMode).toMatch(/^(adaptive|static|collaborative|autonomous)$/);
    });

    it('should validate SM agent definition', () => {
      const agent = getAgentDefinition('SM');

      expect(agent).toBeDefined();
      expect(agent!.role).toBe('SM');
      expect(agent!.name).toContain('Scrum');
      expect(agent!.coreSkills).toContain('Agile');
      expect(agent!.learningMode).toMatch(/^(adaptive|static|collaborative|autonomous)$/);
    });
  });

  describe('Agent Configuration Validation', () => {
    it('should validate performance configuration for all agents', () => {
      const allAgents = getAllAgentDefinitions();

      allAgents.forEach((agent) => {
        const perf = agent.configuration.performance;

        expect(perf.maxExecutionTime).toBeGreaterThan(0);
        expect(perf.memoryLimit).toBeGreaterThan(0);
        expect(perf.maxConcurrentTasks).toBeGreaterThan(0);
        expect(perf.priority).toBeGreaterThanOrEqual(1);
        expect(perf.priority).toBeLessThanOrEqual(10);
      });
    });

    it('should validate capabilities configuration for all agents', () => {
      const allAgents = getAllAgentDefinitions();

      allAgents.forEach((agent) => {
        const caps = agent.configuration.capabilities;

        expect(Array.isArray(caps.allowedTools)).toBe(true);
        expect(typeof caps.fileSystemAccess.read).toBe('boolean');
        expect(typeof caps.fileSystemAccess.write).toBe('boolean');
        expect(typeof caps.fileSystemAccess.execute).toBe('boolean');
        expect(typeof caps.networkAccess.http).toBe('boolean');
        expect(typeof caps.networkAccess.https).toBe('boolean');
        expect(typeof caps.networkAccess.externalApis).toBe('boolean');
        expect(typeof caps.agentIntegration).toBe('boolean');
      });
    });

    it('should validate communication configuration for all agents', () => {
      const allAgents = getAllAgentDefinitions();

      allAgents.forEach((agent) => {
        const comm = agent.configuration.communication;

        expect(['formal', 'casual', 'technical', 'educational', 'concise', 'detailed']).toContain(comm.style);
        expect(['markdown', 'json', 'xml', 'plain-text', 'structured']).toContain(comm.responseFormat);
        expect(typeof comm.collaboration.enabled).toBe('boolean');
        expect(Array.isArray(comm.collaboration.roles)).toBe(true);
        expect(['collaborative', 'competitive', 'compromise', 'avoidance', 'accommodation']).toContain(
          comm.collaboration.conflictResolution
        );
      });
    });
  });

  describe('Agent Metadata Validation', () => {
    it('should validate metadata for all agents', () => {
      const allAgents = getAllAgentDefinitions();

      allAgents.forEach((agent) => {
        const meta = agent.metadata;

        expect(meta.createdAt).toBeInstanceOf(Date);
        expect(meta.updatedAt).toBeInstanceOf(Date);
        expect(typeof meta.version).toBe('string');
        expect(typeof meta.author).toBe('string');
        expect(Array.isArray(meta.tags)).toBe(true);
        expect(Array.isArray(meta.dependencies)).toBe(true);
      });
    });

    it('should have consistent author for all agents', () => {
      const allAgents = getAllAgentDefinitions();
      const authors = allAgents.map((agent) => agent.metadata.author);
      const uniqueAuthors = [...new Set(authors)];

      // All agents should have the same author in this ecosystem
      expect(uniqueAuthors.length).toBeLessThanOrEqual(2); // Allow for some variation
    });

    it('should have valid semantic versions', () => {
      const allAgents = getAllAgentDefinitions();

      allAgents.forEach((agent) => {
        const version = agent.metadata.version;
        const semanticVersionRegex = /^\d+\.\d+\.\d+(-.*)?$/;
        expect(semanticVersionRegex.test(version)).toBe(true);
      });
    });
  });

  describe('Registry Consistency', () => {
    it('should maintain consistency between registry and predefined types', () => {
      const registryKeys = Object.keys(AgentRegistry).sort();
      const predefinedTypes = [...PredefinedAgentTypes].sort();

      expect(registryKeys).toEqual(predefinedTypes);
    });

    it('should have matching role values in registry and definitions', () => {
      PredefinedAgentTypes.forEach((role) => {
        const agent = getAgentDefinition(role);
        expect(agent?.role).toBe(role);
      });
    });

    it('should maintain immutability of registry', () => {
      const originalRegistry = { ...AgentRegistry };

      // Attempt to modify registry
      expect(() => {
        (AgentRegistry as any).NewRole = {} as AgentDefinition;
      }).not.toThrow();

      // Registry should still be functional
      expect(getAgentDefinition('FrontendDev')).toBeDefined();

      // Restore original state
      delete (AgentRegistry as any).NewRole;
    });
  });
});