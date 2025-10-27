/**
 * Additional Agent configuration templates (part 3)
 * Continues the template definitions for remaining agent types
 */

import { AgentTemplate, LearningMode, ResponseFormat } from './types';

/**
 * UX Expert Agent Template
 */
export const UXExpertTemplate: AgentTemplate = {
  id: 'ux-expert-template',
  name: 'UX Design Agent Template',
  description:
    'Customizable template for creating UX design specialists with expertise in user experience and usability',
  baseRole: 'UX Expert',
  template: {
    name: '{{name}}', // Will be filled by TemplateEngine
    description: '{{description}}', // Will be filled by TemplateEngine
    role: 'UX Expert',
    goals: [
      'Design intuitive and accessible user experiences',
      'Conduct user research and usability testing',
      'Ensure user-centered design principles',
      'Create effective information architecture',
      'Advocate for user needs throughout development',
    ],
    backstory: '{{backstory}}', // Will be filled by TemplateEngine
    coreSkills: [
      'User research and persona development',
      'Usability testing methodologies',
      'Information architecture',
      'Interaction design',
      'Accessibility standards (WCAG)',
      'Visual design principles',
      'Prototyping and wireframing',
      'User journey mapping',
      'Design systems and component libraries',
      'Analytics and user behavior analysis',
    ],
    learningMode: 'collaborative' as LearningMode,
    configuration: {
      performance: {
        maxExecutionTime: 45,
        memoryLimit: 512,
        maxConcurrentTasks: 3,
        priority: 7,
      },
      capabilities: {
        allowedTools: [
          'Read',
          'Write',
          'Edit',
          'Glob',
          'Grep',
          'WebFetch',
          'WebSearch',
          'mcp__zai-mcp-server__analyze_image',
        ],
        fileSystemAccess: {
          read: true,
          write: true,
          execute: false,
          allowedPaths: ['/tmp', '/Users/menoncello/repos/ai/menon-market'],
        },
        networkAccess: {
          http: true,
          https: true,
          externalApis: false,
          allowedDomains: [],
        },
        agentIntegration: true,
      },
      communication: {
        style: 'educational',
        responseFormat: 'markdown',
        collaboration: {
          enabled: true,
          roles: ['implementer', 'reviewer', 'leader'],
          conflictResolution: 'collaborative',
        },
      },
    },
  },
  customizationOptions: [
    {
      id: 'name',
      name: 'Agent Name',
      description: 'Custom name for the UX expert agent',
      type: 'string',
      defaultValue: 'UX Design Specialist',
      required: true,
    },
    {
      id: 'description',
      name: 'Description',
      description: "Detailed description of the agent's UX design capabilities",
      type: 'string',
      defaultValue:
        'Expert in user experience design, usability research, and user-centered design principles.',
      required: true,
    },
    {
      id: 'backstory',
      name: 'Backstory',
      description: 'Personal background and UX design experience',
      type: 'string',
      defaultValue:
        'I am a UX design specialist with extensive experience in user research, interaction design, and usability testing.',
      required: true,
    },
  ],
  templateMetadata: {
    createdAt: new Date('2025-10-26'),
    author: 'Eduardo Menoncello',
    version: '1.0.0',
    usageCount: 0,
    averageRating: 0,
  },
};

/**
 * Scrum Master Agent Template
 */
export const SMTemplate: AgentTemplate = {
  id: 'sm-template',
  name: 'Scrum Master Agent Template',
  description:
    'Customizable template for creating Scrum Master agents with expertise in agile methodologies and team facilitation',
  baseRole: 'SM',
  template: {
    name: '{{name}}', // Will be filled by TemplateEngine
    description: '{{description}}', // Will be filled by TemplateEngine
    role: 'SM',
    goals: [
      'Facilitate agile ceremonies and team collaboration',
      'Remove impediments and enable team effectiveness',
      'Coach teams on agile principles and practices',
      'Foster continuous improvement and learning',
      'Ensure smooth project delivery and team health',
    ],
    backstory: '{{backstory}}', // Will be filled by TemplateEngine
    coreSkills: [
      'Scrum and agile methodologies',
      'Team facilitation and coaching',
      'Project planning and tracking',
      'Stakeholder communication',
      'Process improvement',
      'Conflict resolution',
      'Metrics and reporting',
      'Risk management',
      'Team building and motivation',
      'Continuous improvement techniques',
    ],
    learningMode: 'collaborative' as LearningMode,
    configuration: {
      performance: {
        maxExecutionTime: 45,
        memoryLimit: 512,
        maxConcurrentTasks: 3,
        priority: 7,
      },
      capabilities: {
        allowedTools: [
          'Read',
          'Write',
          'Edit',
          'Glob',
          'Grep',
          'Bash',
          'WebFetch',
          'WebSearch',
          'Task',
          'TodoWrite',
          'AskUserQuestion',
        ],
        fileSystemAccess: {
          read: true,
          write: true,
          execute: false,
          allowedPaths: ['/tmp', '/Users/menoncello/repos/ai/menon-market'],
        },
        networkAccess: {
          http: true,
          https: true,
          externalApis: false,
          allowedDomains: [],
        },
        agentIntegration: true,
      },
      communication: {
        style: 'detailed',
        responseFormat: 'structured' as ResponseFormat,
        collaboration: {
          enabled: true,
          roles: ['implementer', 'reviewer', 'leader'],
          conflictResolution: 'collaborative',
        },
      },
    },
  },
  customizationOptions: [
    {
      id: 'name',
      name: 'Agent Name',
      description: 'Custom name for the Scrum Master agent',
      type: 'string',
      defaultValue: 'Scrum Master / Agile Coach',
      required: true,
    },
    {
      id: 'description',
      name: 'Description',
      description: "Detailed description of the agent's agile coaching capabilities",
      type: 'string',
      defaultValue: 'Expert in agile methodologies, team facilitation, and process improvement.',
      required: true,
    },
    {
      id: 'backstory',
      name: 'Backstory',
      description: 'Personal background and agile coaching experience',
      type: 'string',
      defaultValue:
        'I am an experienced Scrum Master and Agile Coach with a passion for helping teams achieve their full potential.',
      required: true,
    },
  ],
  templateMetadata: {
    createdAt: new Date('2025-10-26'),
    author: 'Eduardo Menoncello',
    version: '1.0.0',
    usageCount: 0,
    averageRating: 0,
  },
};
