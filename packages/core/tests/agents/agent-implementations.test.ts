/**
 * Tests for individual agent implementations
 * Comprehensive coverage of all agent definition files
 */

import { describe, it, expect } from 'vitest';
import { ArchitectAgent } from '../../src/agents/architect.agent';
import { BackendDevAgent } from '../../src/agents/backend-dev.agent';
import { CLIDevAgent } from '../../src/agents/cli-dev.agent';
import { FrontendDevAgent } from '../../src/agents/frontend-dev.agent';
import { QAAgent } from '../../src/agents/qa.agent';
import { SMAgent } from '../../src/agents/sm.agent';
import { UXExpertAgent } from '../../src/agents/ux-expert.agent';
import { AgentDefinition, AgentRole, LearningMode } from '../../src/agents/types';

describe('Agent Implementations', () => {
  describe('ArchitectAgent', () => {
    it('should have correct basic properties', () => {
      expect(ArchitectAgent.id).toBe('architect-001');
      expect(ArchitectAgent.name).toBe('System Architect');
      expect(ArchitectAgent.role).toBe('Architect');
      expect(ArchitectAgent.learningMode).toBe('autonomous');
    });

    it('should have comprehensive description', () => {
      expect(ArchitectAgent.description).toContain('architect');
      expect(ArchitectAgent.description).toContain('technical');
      expect(ArchitectAgent.description).toContain('scalable');
    });

    it('should have appropriate goals', () => {
      expect(ArchitectAgent.goals).toContain('Design scalable and maintainable architectures');
      expect(ArchitectAgent.goals).toContain('Make strategic technology decisions');
      expect(ArchitectAgent.goals).toContain('Ensure system reliability and performance');
      expect(ArchitectAgent.goals.length).toBeGreaterThan(3);
    });

    it('should have relevant core skills', () => {
      const expectedSkills = [
        'System architecture design',
        'Technology stack evaluation',
        'Microservices and distributed systems',
        'Cloud architecture patterns',
        'Security architecture',
      ];

      expectedSkills.forEach((skill) => {
        expect(ArchitectAgent.coreSkills).toContain(skill);
      });
      expect(ArchitectAgent.coreSkills.length).toBeGreaterThan(5);
    });

    it('should have proper backstory', () => {
      expect(ArchitectAgent.backstory).toContain('architect');
      expect(ArchitectAgent.backstory).toContain('experience');
      expect(ArchitectAgent.backstory.length).toBeGreaterThan(50);
    });

    it('should have appropriate performance configuration', () => {
      const perf = ArchitectAgent.configuration.performance;
      expect(perf.maxExecutionTime).toBe(90);
      expect(perf.memoryLimit).toBe(2048);
      expect(perf.maxConcurrentTasks).toBe(2);
      expect(perf.priority).toBe(10);
    });

    it('should have comprehensive tool access', () => {
      const tools = ArchitectAgent.configuration.capabilities.allowedTools;
      expect(tools).toContain('Read');
      expect(tools).toContain('Write');
      expect(tools).toContain('Edit');
      expect(tools).toContain('Bash');
      expect(tools).toContain('WebSearch');
      expect(tools.length).toBeGreaterThan(8);
    });

    it('should have appropriate file system access', () => {
      const fs = ArchitectAgent.configuration.capabilities.fileSystemAccess;
      expect(fs.read).toBe(true);
      expect(fs.write).toBe(true);
      expect(fs.execute).toBe(false);
      expect(fs.allowedPaths).toContain('docs');
      expect(fs.allowedPaths).toContain('src');
      expect(fs.allowedPaths).toContain('config');
    });

    it('should have network access permissions', () => {
      const net = ArchitectAgent.configuration.capabilities.networkAccess;
      expect(net.http).toBe(true);
      expect(net.https).toBe(true);
      expect(net.externalApis).toBe(true);
    });

    it('should have formal communication style', () => {
      const comm = ArchitectAgent.configuration.communication;
      expect(comm.style).toBe('formal');
      expect(comm.responseFormat).toBe('structured');
      expect(comm.collaboration.enabled).toBe(true);
      expect(comm.collaboration.roles).toContain('leader');
      expect(comm.collaboration.roles).toContain('reviewer');
      expect(comm.collaboration.roles).toContain('coordinator');
    });

    it('should have proper metadata', () => {
      const meta = ArchitectAgent.metadata;
      expect(meta.author).toBe('Eduardo Menoncello');
      expect(meta.version).toBe('1.0.0');
      expect(meta.tags).toContain('architecture');
      expect(meta.tags).toContain('design');
      expect(meta.dependencies).toContain('@menon-market/core');
      expect(meta.metrics).toBeDefined();
      expect(meta.metrics?.successRate).toBe(95);
    });
  });

  describe('BackendDevAgent', () => {
    it('should have correct basic properties', () => {
      expect(BackendDevAgent.id).toBe('backend-dev-001');
      expect(BackendDevAgent.name).toBe('Backend Developer');
      expect(BackendDevAgent.role).toBe('BackendDev');
      expect(BackendDevAgent.learningMode).toBe('adaptive');
    });

    it('should have appropriate goals for backend development', () => {
      expect(BackendDevAgent.goals.some(goal => goal.toLowerCase().includes('api'))).toBe(true);
      expect(BackendDevAgent.goals.some(goal => goal.toLowerCase().includes('backend'))).toBe(true);
      expect(BackendDevAgent.goals.length).toBeGreaterThan(3);
    });

    it('should have relevant backend skills', () => {
      const expectedSkills = ['API', 'Database', 'Backend'];
      const hasExpectedSkill = expectedSkills.some(skill =>
        BackendDevAgent.coreSkills.some(agentSkill => agentSkill.toLowerCase().includes(skill.toLowerCase()))
      );
      expect(hasExpectedSkill).toBe(true);
      expect(BackendDevAgent.coreSkills.length).toBeGreaterThan(5);
    });

    it('should have appropriate performance configuration', () => {
      const perf = BackendDevAgent.configuration.performance;
      expect(perf.maxExecutionTime).toBeGreaterThan(0);
      expect(perf.memoryLimit).toBeGreaterThan(0);
      expect(perf.maxConcurrentTasks).toBeGreaterThan(0);
      expect(perf.priority).toBeGreaterThan(0);
      expect(perf.priority).toBeLessThanOrEqual(10);
    });

    it('should have proper file system access for backend development', () => {
      const fs = BackendDevAgent.configuration.capabilities.fileSystemAccess;
      expect(fs.read).toBe(true);
      expect(fs.write).toBe(true);
      expect(typeof fs.execute).toBe('boolean');
    });

    it('should have network access for backend development', () => {
      const net = BackendDevAgent.configuration.capabilities.networkAccess;
      expect(net.http || net.https || net.externalApis).toBe(true);
    });

    it('should have collaboration enabled', () => {
      const collab = BackendDevAgent.configuration.communication.collaboration;
      expect(collab.enabled).toBe(true);
      expect(collab.roles.length).toBeGreaterThan(0);
    });
  });

  describe('CLIDevAgent', () => {
    it('should have correct basic properties', () => {
      expect(CLIDevAgent.id).toBe('cli-dev-001');
      expect(CLIDevAgent.name).toContain('CLI');
      expect(CLIDevAgent.role).toBe('CLI Dev');
    });

    it('should have CLI-related skills', () => {
      const hasCLISkill = CLIDevAgent.coreSkills.some(skill =>
        skill.toLowerCase().includes('cli') || skill.toLowerCase().includes('command')
      );
      expect(hasCLISkill).toBe(true);
    });

    it('should have appropriate goals for CLI development', () => {
      const hasCLIGoal = CLIDevAgent.goals.some(goal =>
        goal.toLowerCase().includes('cli') || goal.toLowerCase().includes('command')
      );
      expect(hasCLIGoal).toBe(true);
    });

    it('should have execution permissions for CLI tools', () => {
      const fs = CLIDevAgent.configuration.capabilities.fileSystemAccess;
      expect(fs.read).toBe(true);
      expect(fs.write).toBe(true);
      expect(fs.execute).toBe(true); // CLI developers need execute permissions
    });

    it('should have proper tool access', () => {
      const tools = CLIDevAgent.configuration.capabilities.allowedTools;
      expect(tools).toContain('Bash');
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  describe('FrontendDevAgent', () => {
    it('should have correct basic properties', () => {
      expect(FrontendDevAgent.id).toBe('frontend-dev-001');
      expect(FrontendDevAgent.name).toContain('Frontend');
      expect(FrontendDevAgent.role).toBe('FrontendDev');
    });

    it('should have frontend-related skills', () => {
      const expectedSkills = ['JavaScript', 'React', 'CSS', 'HTML'];
      const hasExpectedSkill = expectedSkills.some(skill =>
        FrontendDevAgent.coreSkills.some(agentSkill =>
          agentSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      expect(hasExpectedSkill).toBe(true);
    });

    it('should have appropriate goals for frontend development', () => {
      const hasUIGoal = FrontendDevAgent.goals.some(goal =>
        goal.toLowerCase().includes('ui') || goal.toLowerCase().includes('interface')
      );
      expect(hasUIGoal).toBe(true);
    });

    it('should have proper file system access', () => {
      const fs = FrontendDevAgent.configuration.capabilities.fileSystemAccess;
      expect(fs.read).toBe(true);
      expect(fs.write).toBe(true);
      expect(typeof fs.execute).toBe('boolean');
    });

    it('should have network access for frontend resources', () => {
      const net = FrontendDevAgent.configuration.capabilities.networkAccess;
      expect(net.http || net.https).toBe(true);
    });
  });

  describe('QAAgent', () => {
    it('should have correct basic properties', () => {
      expect(QAAgent.id).toBe('qa-001');
      expect(QAAgent.name).toContain('QA');
      expect(QAAgent.role).toBe('QA');
    });

    it('should have testing-related skills', () => {
      const hasTestingSkill = QAAgent.coreSkills.some(skill =>
        skill.toLowerCase().includes('test') || skill.toLowerCase().includes('qa')
      );
      expect(hasTestingSkill).toBe(true);
    });

    it('should have quality-focused goals', () => {
      const hasQualityGoal = QAAgent.goals.some(goal =>
        goal.toLowerCase().includes('quality') || goal.toLowerCase().includes('test')
      );
      expect(hasQualityGoal).toBe(true);
    });

    it('should have read access for testing files', () => {
      const fs = QAAgent.configuration.capabilities.fileSystemAccess;
      expect(fs.read).toBe(true);
      expect(typeof fs.write).toBe('boolean');
    });

    it('should have appropriate tool access for testing', () => {
      const tools = QAAgent.configuration.capabilities.allowedTools;
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  describe('SMAgent', () => {
    it('should have correct basic properties', () => {
      expect(SMAgent.id).toBe('sm-001');
      expect(SMAgent.name).toContain('Scrum');
      expect(SMAgent.role).toBe('SM');
    });

    it('should have agile/scrum-related skills', () => {
      const expectedSkills = ['Agile', 'Scrum'];
      const hasExpectedSkill = expectedSkills.some(skill =>
        SMAgent.coreSkills.some(agentSkill =>
          agentSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      expect(hasExpectedSkill).toBe(true);
    });

    it('should have team-focused goals', () => {
      const hasTeamGoal = SMAgent.goals.some(goal =>
        goal.toLowerCase().includes('team') || goal.toLowerCase().includes('scrum')
      );
      expect(hasTeamGoal).toBe(true);
    });

    it('should have collaboration enabled as scrum master', () => {
      const collab = SMAgent.configuration.communication.collaboration;
      expect(collab.enabled).toBe(true);
      expect(collab.roles.length).toBeGreaterThan(0);
    });

    it('should have appropriate communication style', () => {
      const comm = SMAgent.configuration.communication;
      expect(['formal', 'casual', 'educational']).toContain(comm.style);
    });
  });

  describe('UXExpertAgent', () => {
    it('should have correct basic properties', () => {
      expect(UXExpertAgent.id).toBe('ux-expert-001');
      expect(UXExpertAgent.name).toContain('UX');
      expect(UXExpertAgent.role).toBe('UX Expert');
    });

    it('should have design-related skills', () => {
      const expectedSkills = ['Design', 'UX', 'User'];
      const hasExpectedSkill = expectedSkills.some(skill =>
        UXExpertAgent.coreSkills.some(agentSkill =>
          agentSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      expect(hasExpectedSkill).toBe(true);
    });

    it('should have user-focused goals', () => {
      const hasUserGoal = UXExpertAgent.goals.some(goal =>
        goal.toLowerCase().includes('user') || goal.toLowerCase().includes('experience')
      );
      expect(hasUserGoal).toBe(true);
    });

    it('should have appropriate file system access', () => {
      const fs = UXExpertAgent.configuration.capabilities.fileSystemAccess;
      expect(fs.read).toBe(true);
      expect(typeof fs.write).toBe('boolean');
    });

    it('should have network access for design resources', () => {
      const net = UXExpertAgent.configuration.capabilities.networkAccess;
      expect(net.http || net.https).toBe(true);
    });
  });

  describe('All Agents Common Properties', () => {
    const allAgents: AgentDefinition[] = [
      ArchitectAgent,
      BackendDevAgent,
      CLIDevAgent,
      FrontendDevAgent,
      QAAgent,
      SMAgent,
      UXExpertAgent,
    ];

    it('should all have valid learning modes', () => {
      const validModes: LearningMode[] = ['adaptive', 'static', 'collaborative', 'autonomous'];

      allAgents.forEach((agent) => {
        expect(validModes).toContain(agent.learningMode);
      });
    });

    it('should all have unique IDs', () => {
      const ids = allAgents.map((agent) => agent.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids).toEqual(uniqueIds);
    });

    it('should all have unique names', () => {
      const names = allAgents.map((agent) => agent.name);
      const uniqueNames = [...new Set(names)];
      expect(names).toEqual(uniqueNames);
    });

    it('should all have non-empty descriptions', () => {
      allAgents.forEach((agent) => {
        expect(agent.description.length).toBeGreaterThan(20);
      });
    });

    it('should all have at least one goal', () => {
      allAgents.forEach((agent) => {
        expect(agent.goals.length).toBeGreaterThan(0);
        agent.goals.forEach((goal) => {
          expect(goal.length).toBeGreaterThan(5);
        });
      });
    });

    it('should all have relevant core skills', () => {
      allAgents.forEach((agent) => {
        expect(agent.coreSkills.length).toBeGreaterThan(2);
        agent.coreSkills.forEach((skill) => {
          expect(skill.length).toBeGreaterThan(2);
        });
      });
    });

    it('should all have performance configurations', () => {
      allAgents.forEach((agent) => {
        const perf = agent.configuration.performance;
        expect(perf.maxExecutionTime).toBeGreaterThan(0);
        expect(perf.memoryLimit).toBeGreaterThan(0);
        expect(perf.maxConcurrentTasks).toBeGreaterThan(0);
        expect(perf.priority).toBeGreaterThanOrEqual(1);
        expect(perf.priority).toBeLessThanOrEqual(10);
      });
    });

    it('should all have capability configurations', () => {
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

    it('should all have communication configurations', () => {
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

    it('should all have valid metadata', () => {
      allAgents.forEach((agent) => {
        const meta = agent.metadata;
        expect(meta.createdAt).toBeInstanceOf(Date);
        expect(meta.updatedAt).toBeInstanceOf(Date);
        expect(typeof meta.version).toBe('string');
        expect(typeof meta.author).toBe('string');
        expect(Array.isArray(meta.tags)).toBe(true);
        expect(Array.isArray(meta.dependencies)).toBe(true);
        expect(/^\d+\.\d+\.\d+(-.*)?$/.test(meta.version)).toBe(true);
      });
    });

    it('should all have proper role consistency', () => {
      const roleMap: Record<string, AgentDefinition> = {
        'Architect': ArchitectAgent,
        'BackendDev': BackendDevAgent,
        'CLI Dev': CLIDevAgent,
        'FrontendDev': FrontendDevAgent,
        'QA': QAAgent,
        'SM': SMAgent,
        'UX Expert': UXExpertAgent,
      };

      Object.entries(roleMap).forEach(([role, agent]) => {
        expect(agent.role).toBe(role);
      });
    });
  });
});