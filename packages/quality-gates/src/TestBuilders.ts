/**
 * Test Request Builders
 * Extracted from TestingFramework to reduce file length
 */

import { AgentDefinition, AgentRole, CreateAgentRequest } from '@menon-market/core';

/**
 * Test Request Builders
 */
export class TestBuilders {
  /**
   * Create custom frontend agent request
   */
  createCustomFrontendRequest(): CreateAgentRequest {
    return {
      definition: {
        id: 'custom-frontend-001',
        name: 'Custom Frontend Specialist',
        description: 'A specialized frontend developer with React expertise',
        role: 'FrontendDev',
        goals: ['Build responsive UIs', 'Optimize performance', 'Implement designs'],
        backstory: 'I am a frontend developer with 5+ years of React experience',
        coreSkills: ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript'],
        learningMode: 'adaptive',
        configuration: {
          performance: {
            maxExecutionTime: 45,
            memoryLimit: 1024,
            maxConcurrentTasks: 3,
            priority: 2,
          },
          capabilities: {
            allowedTools: ['react-devtools', 'browser-inspector'],
            fileSystemAccess: { read: true, write: true, execute: false },
            networkAccess: { http: true, https: true, externalApis: false },
            agentIntegration: true,
          },
          communication: {
            style: 'technical',
            responseFormat: 'markdown',
            collaboration: {
              enabled: true,
              roles: ['contributor', 'reviewer'],
              conflictResolution: 'collaborative',
            },
          },
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0.0',
          author: 'Test System',
          tags: ['frontend', 'react', 'custom'],
          dependencies: [],
        },
      },
      options: {
        skipValidation: false,
        dryRun: true,
        verbose: false,
      },
    };
  }

  /**
   * Create custom backend agent request
   */
  createCustomBackendRequest(): CreateAgentRequest {
    return {
      definition: {
        id: 'custom-backend-001',
        name: 'Custom Backend Specialist',
        description: 'A specialized backend developer with Node.js expertise',
        role: 'BackendDev',
        goals: ['Build scalable APIs', 'Optimize database queries', 'Implement security'],
        backstory: 'I am a backend developer with expertise in Node.js and cloud architecture',
        coreSkills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker'],
        learningMode: 'adaptive',
        configuration: {
          performance: {
            maxExecutionTime: 60,
            memoryLimit: 2048,
            maxConcurrentTasks: 5,
            priority: 1,
          },
          capabilities: {
            allowedTools: ['database-client', 'api-tester'],
            fileSystemAccess: { read: true, write: true, execute: false },
            networkAccess: { http: true, https: true, externalApis: true },
            agentIntegration: true,
          },
          communication: {
            style: 'technical',
            responseFormat: 'markdown',
            collaboration: {
              enabled: true,
              roles: ['implementer', 'tester'],
              conflictResolution: 'collaborative',
            },
          },
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0.0',
          author: 'Test System',
          tags: ['backend', 'nodejs', 'custom'],
          dependencies: [],
        },
      },
      options: {
        skipValidation: false,
        dryRun: true,
        verbose: false,
      },
    };
  }

  /**
   * Create custom QA agent request
   */
  createCustomQARequest(): CreateAgentRequest {
    return {
      definition: {
        id: 'custom-qa-001',
        name: 'Custom QA Specialist',
        description: 'A specialized QA engineer with comprehensive testing strategies',
        role: 'QA',
        goals: ['Ensure code quality', 'Automate testing', 'Identify bugs early'],
        backstory: 'I am a QA engineer focused on comprehensive testing strategies',
        coreSkills: ['Jest', 'Cypress', 'Test Planning', 'Bug Tracking', 'Automation'],
        learningMode: 'adaptive',
        configuration: {
          performance: {
            maxExecutionTime: 35,
            memoryLimit: 512,
            maxConcurrentTasks: 2,
            priority: 3,
          },
          capabilities: {
            allowedTools: ['test-runner', 'coverage-tool'],
            fileSystemAccess: { read: true, write: false, execute: true },
            networkAccess: { http: true, https: false, externalApis: false },
            agentIntegration: true,
          },
          communication: {
            style: 'detailed',
            responseFormat: 'markdown',
            collaboration: {
              enabled: true,
              roles: ['reviewer', 'coordinator'],
              conflictResolution: 'collaborative',
            },
          },
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0.0',
          author: 'Test System',
          tags: ['qa', 'testing', 'custom'],
          dependencies: [],
        },
      },
      options: {
        skipValidation: false,
        dryRun: true,
        verbose: false,
      },
    };
  }

  /**
   * Create invalid agent for testing
   */
  createInvalidAgent(): AgentDefinition {
    return {
      id: '',
      name: '',
      description: 'Too short',
      role: 'InvalidRole' as AgentRole,
      goals: [],
      backstory: '',
      coreSkills: [],
      learningMode: 'adaptive' as const,
      configuration: this.createInvalidAgentConfiguration(),
      metadata: this.createInvalidAgentMetadata(),
    };
  }

  /**
   * Create invalid agent configuration
   */
  createInvalidAgentConfiguration() {
    return {
      performance: { maxExecutionTime: 0, memoryLimit: 0, maxConcurrentTasks: 0, priority: 0 },
      capabilities: {
        allowedTools: [],
        fileSystemAccess: { read: false, write: false, execute: false },
        networkAccess: { http: false, https: false, externalApis: false },
        agentIntegration: false,
      },
      communication: {
        style: 'technical' as const,
        responseFormat: 'markdown' as const,
        collaboration: {
          enabled: false,
          roles: [],
          conflictResolution: 'collaborative' as const,
        },
      },
    };
  }

  /**
   * Create invalid agent metadata
   */
  createInvalidAgentMetadata() {
    return {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '',
      author: '',
      tags: [],
      dependencies: [],
    };
  }

  /**
   * Create invalid agent request
   */
  createInvalidAgentRequest(invalidAgent: AgentDefinition): CreateAgentRequest {
    return {
      definition: invalidAgent,
      options: { skipValidation: false, dryRun: true },
    };
  }

  /**
   * Create performance test request
   */
  createPerformanceTestRequest(role: AgentRole): CreateAgentRequest {
    return {
      definition: role, // Use template ID
      options: {
        skipValidation: false,
        dryRun: true,
        verbose: false,
      },
    };
  }
}
