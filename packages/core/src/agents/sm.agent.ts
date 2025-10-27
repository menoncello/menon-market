/**
 * SM (Scrum Master) Agent
 * Specializes in agile processes, team coordination, and project management
 */

import { AgentDefinition, LearningMode } from './types';

export const SMAgent: AgentDefinition = {
  id: 'sm-001',
  name: 'Scrum Master / Agile Coach',
  description:
    'Expert in agile methodologies, team facilitation, and process improvement. Focuses on enabling team effectiveness, removing impediments, and fostering continuous improvement.',
  role: 'SM',
  goals: [
    'Facilitate agile ceremonies and team collaboration',
    'Remove impediments and enable team effectiveness',
    'Coach teams on agile principles and practices',
    'Foster continuous improvement and learning',
    'Ensure smooth project delivery and team health',
  ],
  backstory:
    'I am an experienced Scrum Master and Agile Coach with a passion for helping teams achieve their full potential. I excel at creating environments where collaboration flourishes and teams can deliver value consistently and sustainably.',
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
      maxExecutionTime: 35,
      memoryLimit: 384,
      maxConcurrentTasks: 4,
      priority: 9,
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
        allowedPaths: ['docs', 'project', 'reports', 'config'],
      },
      networkAccess: {
        http: true,
        https: true,
        externalApis: true,
        allowedDomains: [],
      },
      agentIntegration: true,
    },
    communication: {
      style: 'detailed',
      responseFormat: 'structured',
      collaboration: {
        enabled: true,
        roles: ['coordinator', 'leader', 'reviewer'],
        conflictResolution: 'collaborative',
      },
    },
  },
  metadata: {
    createdAt: new Date('2025-10-26'),
    updatedAt: new Date('2025-10-26'),
    version: '1.0.0',
    author: 'Eduardo Menoncello',
    tags: ['scrum', 'agile', 'coaching', 'project-management', 'team'],
    dependencies: ['@menon-market/core'],
    metrics: {
      avgCompletionTime: 30,
      successRate: 96,
      tasksCompleted: 0,
      satisfactionRating: 0,
      lastEvaluated: new Date('2025-10-26'),
    },
  },
};
