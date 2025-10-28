/**
 * Factory functions for generating test data for Directory Structure Generator tests
 * Following data factory patterns from knowledge base
 */

import { faker } from '@faker-js/faker';
import type { AgentRole } from '@menon-market/core';

export interface GenerationOptions {
  agentType: AgentRole;
  outputPath: string;
  customizations?: Record<string, any>;
}

export interface DirectoryStructure {
  [path: string]: string | DirectoryStructure;
}

export interface GenerationResult {
  success: boolean;
  structure?: DirectoryStructure;
  errors?: string[];
  performance: {
    generationTime: number;
    memoryUsage: number;
  };
}

export const createGenerationOptions = (overrides: Partial<GenerationOptions> = {}): GenerationOptions => ({
  agentType: faker.helpers.arrayElement(['FrontendDev', 'BackendDev', 'QA', 'Architect', 'CLIDev', 'UXExpert', 'SM']),
  outputPath: `/tmp/test-${faker.string.alphanumeric(8)}`,
  customizations: {
    name: faker.person.fullName(),
    description: faker.lorem.sentence(),
    ...overrides.customizations,
  },
  ...overrides,
});

export const createDirectoryStructure = (overrides: Partial<DirectoryStructure> = {}): DirectoryStructure => ({
  'src': {
    'index.ts': '// Main entry point',
    'types.ts': '// Type definitions',
    'utils': {
      'helpers.ts': '// Utility functions',
    },
  },
  'tests': {
    'unit': {},
    'integration': {},
    'setup.ts': '// Test setup',
  },
  'config': {
    'settings.json': '{}',
    'environment.json': '{}',
  },
  'docs': {
    'README.md': '# Documentation',
    'api.md': '# API Documentation',
  },
  ...overrides,
});

export const createGenerationResult = (overrides: Partial<GenerationResult> = {}): GenerationResult => ({
  success: faker.datatype.boolean(),
  structure: createDirectoryStructure(),
  errors: faker.datatype.boolean() ? [] : [faker.lorem.sentence()],
  performance: {
    generationTime: faker.number.int({ min: 1000, max: 29000 }),
    memoryUsage: faker.number.int({ min: 10_000_000, max: 45_000_000 }),
  },
  ...overrides,
});

export const createSuccessfulGenerationResult = (overrides: Partial<GenerationResult> = {}): GenerationResult => ({
  success: true,
  structure: createDirectoryStructure(),
  errors: undefined,
  performance: {
    generationTime: faker.number.int({ min: 1000, max: 15000 }),
    memoryUsage: faker.number.int({ min: 10_000_000, max: 30_000_000 }),
  },
  ...overrides,
});

export const createFailedGenerationResult = (overrides: Partial<GenerationResult> = {}): GenerationResult => ({
  success: false,
  structure: undefined,
  errors: [faker.lorem.sentence(), faker.lorem.sentence()],
  performance: {
    generationTime: faker.number.int({ min: 1000, max: 5000 }),
    memoryUsage: faker.number.int({ min: 5_000_000, max: 15_000_000 }),
  },
  ...overrides,
});

export const createConfigurationFiles = (agentType: AgentRole, overrides: Record<string, string> = {}): Record<string, string> => {
  const baseFiles = {
    'package.json': JSON.stringify({
      name: `@menon-market/${agentType.toLowerCase()}-agent`,
      version: '1.0.0',
      description: `${agentType} agent for Claude Code SuperPlugin ecosystem`,
      main: 'dist/index.js',
      scripts: {
        build: 'tsc',
        dev: 'tsc --watch',
        test: 'bun test',
        start: 'bun run dist/index.js',
        'validate': 'bun run lint && bun run typecheck',
      },
      engines: {
        bun: '>=1.0.0',
      },
      packageManager: 'bun@1.3.1',
    }, null, 2),

    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'node',
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        noImplicitReturns: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        exactOptionalPropertyTypes: true,
        outDir: 'dist',
        rootDir: 'src',
        declaration: true,
        declarationMap: true,
        sourceMap: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', 'tests'],
    }, null, 2),

    '.eslintrc.json': JSON.stringify({
      extends: ['@typescript-eslint/recommended'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
      },
    }, null, 2),

    'README.md:': `# ${agentType} Agent

## Role
Specialized ${agentType.toLowerCase()} agent for Claude Code SuperPlugin ecosystem.

## Core Skills
- ${faker.lorem.words(5)}
- ${faker.lorem.words(5)}
- ${faker.lorem.words(5)}

## Setup
\`\`\`bash
bun install
bun run build
bun start
\`\`\`

## Usage
This agent integrates seamlessly with Claude Code's subagent system.

## Integration with Claude Code
- Task tool delegation support
- Episodic memory integration
- Slash command compatibility
`,
  };

  const agentSpecificFiles: Record<AgentRole, Record<string, string>> = {
    FrontendDev: {
      'src/index.ts': `/**
 * Frontend Development Agent
 * Specializes in React, TypeScript, and modern frontend development
 */

export class FrontendDevAgent {
  constructor() {
    // Initialize frontend development capabilities
  }

  async analyzeCodebase(projectPath: string): Promise<any> {
    // Analyze frontend codebase structure
  }

  async generateComponents(specifications: any[]): Promise<string> {
    // Generate React components based on specifications
  }
}`,
    },
    BackendDev: {
      'src/index.ts': `/**
 * Backend Development Agent
 * Specializes in API development, database design, and server architecture
 */

export class BackendDevAgent {
  constructor() {
    // Initialize backend development capabilities
  }

  async designAPI(specifications: any): Promise<any> {
    // Design RESTful API architecture
  }

  async setupDatabase(schema: any): Promise<string> {
    // Setup database structure and migrations
  }
}`,
    },
    QA: {
      'src/index.ts': `/**
 * Quality Assurance Agent
 * Specializes in testing strategies, test automation, and quality gates
 */

export class QAAgent {
  constructor() {
    // Initialize QA capabilities
  }

  async createTestSuite(requirements: any): Promise<string> {
    // Create comprehensive test suite
  }

  async validateQuality(codebase: any): Promise<any> {
    // Validate codebase against quality standards
  }
}`,
    },
    Architect: {
      'src/index.ts': `/**
 * Solution Architect Agent
 * Specializes in system design, architecture patterns, and technical strategy
 */

export class ArchitectAgent {
  constructor() {
    // Initialize architecture capabilities
  }

  async designArchitecture(requirements: any): Promise<any> {
    // Design system architecture
  }

  async validateDesign(architecture: any): Promise<any> {
    // Validate architecture against best practices
  }
}`,
    },
    CLIDev: {
      'src/index.ts': `/**
 * CLI Development Agent
 * Specializes in command-line tools, CLI frameworks, and terminal interfaces
 */

export class CLIDevAgent {
  constructor() {
    // Initialize CLI development capabilities
  }

  async createCLI(specifications: any): Promise<string> {
    // Create command-line interface
  }

  async generateCommands(commands: any[]): Promise<string> {
    // Generate CLI commands
  }
}`,
    },
    UXExpert: {
      'src/index.ts': `/**
 * UX Expert Agent
 * Specializes in user experience design, usability, and user research
 */

export class UXExpertAgent {
  constructor() {
    // Initialize UX capabilities
  }

  async analyzeUX(requirements: any): Promise<any> {
    // Analyze user experience requirements
  }

  async designInterface(specifications: any): Promise<any> {
    // Design user interface
  }
}`,
    },
    SM: {
      'src/index.ts': `/**
 * Scrum Master Agent
 * Specializes in agile practices, team facilitation, and process improvement
 */

export class SMAgent {
  constructor() {
    // Initialize Scrum Master capabilities
  }

  async facilitateRetrospective(teamData: any): Promise<any> {
    // Facilitate sprint retrospective
  }

  async optimizeProcess(currentProcess: any): Promise<any> {
    // Optimize team processes
  }
}`,
    },
  };

  return {
    ...baseFiles,
    ...(agentSpecificFiles[agentType] || {}),
    ...overrides,
  };
};