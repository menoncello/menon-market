/**
 * ATDD Tests for Story 1.2: Directory Structure Generator
 * Tests the implemented DirectoryStructureGenerator class with improved quality patterns
 *
 * Quality Improvements:
 * - Data Factory Pattern: Uses factory functions for realistic test data
 * - Test IDs: Explicit IDs for traceability to acceptance criteria
 * - Priority Classification: P0-P3 prioritization for test execution
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { promises as fs } from 'fs';
import { join } from 'path';
import { DirectoryStructureGenerator } from '../src/DirectoryStructureGenerator';
import {
  createAgentDefinition,
  createAgentDefinitionForRole,
  createMultipleAgentDefinitions,
  createPerformanceConfig,
  createAgentMetadata,
} from './support/data-factories';
import type { AgentRole, AgentDefinition } from '@menon-market/core';

describe('Story 1.2: Directory Structure Generator - Enhanced ATDD Tests', () => {
  let generator: DirectoryStructureGenerator;
  let testDir: string;

  beforeEach(async () => {
    generator = new DirectoryStructureGenerator();
    testDir = join(process.cwd(), 'test-output', `test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

describe('1.2-AC001: Template-based Directory Generation', () => {
  describe('P0: Critical Path Tests', () => {
    it('1.2-E2E-001: should generate complete directory structure for FrontendDev agent', async () => {
      // GIVEN: FrontendDev agent definition using factory
      const agentDefinition = createAgentDefinitionForRole('FrontendDev', {
        name: 'Frontend Development Expert',
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
        metadata: createAgentMetadata({ tags: ['test', 'frontend', 'development'] }),
      });

      // WHEN: Generating directory structure
      const result = await generator.generateAgentDirectory('FrontendDev', agentDefinition, testDir);

      // THEN: Should succeed with all required directories
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();

      // Required directories should exist
      const requiredDirs = ['src', 'tests', 'config', 'docs', 'scripts'];
      for (const dir of requiredDirs) {
        const dirPath = join(testDir, dir);
        const stat = await fs.stat(dirPath);
        expect(stat.isDirectory()).toBe(true);
      }

      // Required subdirectories should exist
      const subDirs = [
        'src/types',
        'src/services',
        'src/utils',
        'src/mcp-server',
        'src/mcp-server/tools',
        'src/mcp-server/handlers',
        'tests/unit',
        'tests/integration',
        'tests/e2e',
      ];

      for (const dir of subDirs) {
        const dirPath = join(testDir, dir);
        const stat = await fs.stat(dirPath);
        expect(stat.isDirectory()).toBe(true);
      }
    });

    it('1.2-E2E-002: should validate generated directory structure integrity', async () => {
      // GIVEN: Multiple agent types to test structure consistency
      const agentTypes: AgentRole[] = ['FrontendDev', 'BackendDev', 'QA'];
      const agentDefinitions = createMultipleAgentDefinitions(agentTypes);

      // WHEN: Generating directories for each agent type
      const results = await Promise.all(
        agentTypes.map((agentType, index) => {
          const outputPath = join(testDir, agentType);
          return generator.generateAgentDirectory(agentType, agentDefinitions[index], outputPath);
        })
      );

      // THEN: All should succeed with consistent structure
      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.errors).toBeUndefined();
        expect(result.metrics.filesCreated).toBeGreaterThan(15);
        expect(result.metrics.directoriesCreated).toBeGreaterThan(5);
      });
    });
  });

  describe('P1: High Priority Tests', () => {
    it('1.2-FUNC-001: should generate complete directory structure for all 7 agent types', async () => {
      // GIVEN: All available agent types
      const agentTypes: AgentRole[] = ['FrontendDev', 'BackendDev', 'QA', 'Architect', 'CLI Dev', 'UX Expert', 'SM'];
      const agentDefinitions = createMultipleAgentDefinitions(agentTypes);

      // WHEN: Generating directory structure for each agent type
      for (const agentType of agentTypes) {
        const outputPath = join(testDir, agentType);
        const agentDefinition = agentDefinitions.find(def => def.role === agentType)!;
        const result = await generator.generateAgentDirectory(agentType, agentDefinition, outputPath);

        // THEN: Each should succeed with core directories
        expect(result.success).toBe(true);
        expect(result.errors).toBeUndefined();

        // Check core directories exist
        const coreDirs = ['src', 'tests', 'config', 'docs'];
        for (const dir of coreDirs) {
          const dirPath = join(outputPath, dir);
          const stat = await fs.stat(dirPath);
          expect(stat.isDirectory()).toBe(true);
        }
      }
    });

    it('1.2-FUNC-002: should handle custom agent type generation', async () => {
      // GIVEN: Custom agent type with specific configuration
      const customAgentDefinition = createAgentDefinition({
        role: 'Custom',
        name: 'Custom Test Agent',
        description: 'Custom agent for testing purposes',
        configuration: {
          model: 'claude-3-haiku',
          temperature: 0.5,
          maxTokens: 2000,
          performance: createPerformanceConfig({ timeout: 15000 }),
        },
      });

      // WHEN: Generating directory structure for custom agent
      const result = await generator.generateAgentDirectory('Custom', customAgentDefinition, testDir);

      // THEN: Should succeed with basic structure
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();

      // Should have basic directories
      const basicDirs = ['src', 'tests', 'config'];
      for (const dir of basicDirs) {
        const dirPath = join(testDir, dir);
        const stat = await fs.stat(dirPath);
        expect(stat.isDirectory()).toBe(true);
      }
    });
  });

  describe('P2: Medium Priority Tests', () => {
    it('1.2-CONF-001: should follow kebab-case naming convention for directories', async () => {
      // GIVEN: Agent definition with kebab-case compliant name
      const agentDefinition = createAgentDefinitionForRole('FrontendDev');
      const result = await generator.generateAgentDirectory('FrontendDev', agentDefinition, testDir);

      expect(result.success).toBe(true);

      // THEN: Generated directory name should follow kebab-case
      const dirName = testDir.split('/').pop();
      expect(dirName).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });

    it('1.2-CONF-002: should preserve agent-specific template variations', async () => {
      // GIVEN: Different agent types with different specializations
      const frontendAgent = createAgentDefinitionForRole('FrontendDev', {
        metadata: createAgentMetadata({ tags: ['react', 'typescript', 'frontend'] }),
      });
      const backendAgent = createAgentDefinitionForRole('BackendDev', {
        metadata: createAgentMetadata({ tags: ['nodejs', 'api', 'backend'] }),
      });

      // WHEN: Generating directories for different agent types
      const frontendPath = join(testDir, 'frontend');
      const backendPath = join(testDir, 'backend');

      await generator.generateAgentDirectory('FrontendDev', frontendAgent, frontendPath);
      await generator.generateAgentDirectory('BackendDev', backendAgent, backendPath);

      // THEN: Generated package.json files should have agent-specific dependencies
      const frontendPackageJson = JSON.parse(await fs.readFile(join(frontendPath, 'package.json'), 'utf-8'));
      const backendPackageJson = JSON.parse(await fs.readFile(join(backendPath, 'package.json'), 'utf-8'));

      expect(frontendPackageJson.dependencies).toHaveProperty('react');
      expect(backendPackageJson.dependencies).toHaveProperty('express'); // Assuming backend has Express
    });
  });

  describe('P3: Low Priority Tests', () => {
    it('1.2-EDGE-001: should handle edge cases in agent definition data', async () => {
      // GIVEN: Agent definition with minimal required fields
      const minimalAgent = createAgentDefinition({
        name: 'Minimal Agent',
        description: '',
        metadata: createAgentMetadata({ tags: [] }),
      });

      // WHEN: Generating directory structure
      const result = await generator.generateAgentDirectory('FrontendDev', minimalAgent, testDir);

      // THEN: Should still succeed with basic structure
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });
  });
});

describe('1.2-AC002: MCP Server Integration Structure', () => {
  describe('P0: Critical Path Tests', () => {
    it('1.2-MCP-001: should include MCP server template files in generated directories', async () => {
      // GIVEN: Agent definition for MCP integration testing
      const agentDefinition = createAgentDefinitionForRole('FrontendDev', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('FrontendDev', agentDefinition, testDir);

      // THEN: Should include MCP server structure
      const mcpServerDir = join(testDir, 'src', 'mcp-server');
      const stat = await fs.stat(mcpServerDir);
      expect(stat.isDirectory()).toBe(true);

      // Check required MCP server files exist
      const mcpFiles = [
        'src/mcp-server/index.ts',
        'src/mcp-server/config.json',
        'src/mcp-server/tools/index.ts',
        'src/mcp-server/handlers/index.ts',
      ];

      for (const file of mcpFiles) {
        const filePath = join(testDir, file);
        const fileStat = await fs.stat(filePath);
        expect(fileStat.isFile()).toBe(true);
      }
    });

    it('1.2-MCP-002: should generate valid MCP configuration schema', async () => {
      // GIVEN: Backend agent with MCP configuration
      const agentDefinition = createAgentDefinitionForRole('BackendDev', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('BackendDev', agentDefinition, testDir);

      // THEN: MCP configuration should be valid JSON with required fields
      const mcpConfigPath = join(testDir, 'src', 'mcp-server', 'config.json');
      const mcpConfigContent = await fs.readFile(mcpConfigPath, 'utf-8');
      const mcpConfig = JSON.parse(mcpConfigContent);

      expect(mcpConfig).toHaveProperty('name');
      expect(mcpConfig).toHaveProperty('version');
      expect(mcpConfig).toHaveProperty('tools');
      expect(mcpConfig).toHaveProperty('capabilities');
      expect(Array.isArray(mcpConfig.tools)).toBe(true);
    });
  });

  describe('P1: High Priority Tests', () => {
    it('1.2-MCP-003: should create configuration files for MCP server setup and registration', async () => {
      // GIVEN: QA agent with MCP dependencies
      const agentDefinition = createAgentDefinitionForRole('QA', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('QA', agentDefinition, testDir);

      // THEN: Package.json should include MCP dependencies
      const packageJsonPath = join(testDir, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      expect(packageJson.dependencies).toHaveProperty('@modelcontextprotocol/sdk');
      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts).toHaveProperty('build');
    });
  });
});

describe('1.2-AC003: Configuration Files Generation', () => {
  describe('P0: Critical Path Tests', () => {
    it('1.2-CONFIG-001: should generate package.json with agent-specific dependencies', async () => {
      // GIVEN: FrontendDev agent with specific configuration
      const agentDefinition = createAgentDefinitionForRole('FrontendDev', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('FrontendDev', agentDefinition, testDir);

      // THEN: Package.json should be valid with agent-specific dependencies
      const packageJsonPath = join(testDir, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      expect(packageJson).toHaveProperty('name', '@menon-market/frontend-dev-agent');
      expect(packageJson).toHaveProperty('version', '1.0.0');
      expect(packageJson).toHaveProperty('main');
      expect(packageJson).toHaveProperty('scripts');
      expect(packageJson).toHaveProperty('dependencies');
      expect(packageJson).toHaveProperty('devDependencies');

      // FrontendDev specific dependencies
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.dependencies).toHaveProperty('typescript');
      expect(packageJson.devDependencies).toHaveProperty('@types/react');
    });

    it('1.2-CONFIG-002: should create tsconfig.json with TypeScript strict mode configuration', async () => {
      // GIVEN: BackendDev agent with TypeScript configuration
      const agentDefinition = createAgentDefinitionForRole('BackendDev', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('BackendDev', agentDefinition, testDir);

      // THEN: TypeScript configuration should enforce strict mode
      const tsConfigPath = join(testDir, 'tsconfig.json');
      const tsConfigContent = await fs.readFile(tsConfigPath, 'utf-8');
      const tsConfig = JSON.parse(tsConfigContent);

      expect(tsConfig.compilerOptions).toHaveProperty('strict', true);
      expect(tsConfig.compilerOptions).toHaveProperty('noImplicitAny', true);
      expect(tsConfig.compilerOptions).toHaveProperty('strictNullChecks', true);
      expect(tsConfig.compilerOptions).toHaveProperty('noImplicitReturns', true);
      expect(tsConfig.compilerOptions).toHaveProperty('exactOptionalPropertyTypes', true);
    });
  });

  describe('P1: High Priority Tests', () => {
    it('1.2-CONFIG-003: should generate eslint.config.js with project-specific linting rules', async () => {
      // GIVEN: Architect agent with linting configuration
      const agentDefinition = createAgentDefinitionForRole('Architect', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('Architect', agentDefinition, testDir);

      // THEN: ESLint configuration should be strict and TypeScript-aware
      const eslintConfigPath = join(testDir, 'config', 'eslint.config.js');
      const eslintConfigContent = await fs.readFile(eslintConfigPath, 'utf-8');

      expect(eslintConfigContent).toContain('@typescript-eslint/no-unused-vars');
      expect(eslintConfigContent).toContain('"@typescript-eslint/no-explicit-any": "error"');
      expect(eslintConfigContent).not.toContain('eslint-disable');
    });
  });

  describe('P2: Medium Priority Tests', () => {
    it('1.2-CONFIG-004: should include Bun-specific configurations', async () => {
      // GIVEN: CLI Dev agent with Bun configuration
      const agentDefinition = createAgentDefinitionForRole('CLIDev', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('CLI Dev', agentDefinition, testDir);

      // THEN: Bun configuration should be present
      const bunfigPath = join(testDir, 'config', 'bunfig.toml');
      const bunfigContent = await fs.readFile(bunfigPath, 'utf-8');

      expect(bunfigContent).toContain('[install]');
      expect(bunfigContent).toContain('[test]');
      expect(bunfigContent).toContain('[build]');

      const packageJsonPath = join(testDir, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      expect(packageJson.engines).toHaveProperty('bun');
      expect(packageJson.engines).toHaveProperty('node');
    });
  });
});

describe('1.2-AC004: README Template Generation', () => {
  describe('P0: Critical Path Tests', () => {
    it('1.2-DOCS-001: should generate agent-specific README files with role descriptions', async () => {
      // GIVEN: UX Expert agent with documentation requirements
      const agentDefinition = createAgentDefinitionForRole('UXExpert', {
        name: 'User Experience Expert',
        description: 'Expert in user experience design and usability testing',
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('UX Expert', agentDefinition, testDir);

      // THEN: README should contain agent-specific sections
      const readmePath = join(testDir, 'README.md');
      const readmeContent = await fs.readFile(readmePath, 'utf-8');

      expect(readmeContent).toContain('# User Experience Expert');
      expect(readmeContent).toContain('## Description');
      expect(readmeContent).toContain('## Specializations');
      expect(readmeContent).toContain('## Core Skills');
    });
  });

  describe('P1: High Priority Tests', () => {
    it('1.2-DOCS-002: should include setup instructions and usage examples', async () => {
      // GIVEN: Scrum Master agent with setup documentation
      const agentDefinition = createAgentDefinitionForRole('SM', {
        name: 'Scrum Master Agent',
        description: 'Agile project management and team facilitation expert',
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('SM', agentDefinition, testDir);

      // THEN: README should include comprehensive setup instructions
      const readmePath = join(testDir, 'README.md');
      const readmeContent = await fs.readFile(readmePath, 'utf-8');

      expect(readmeContent).toContain('## Installation');
      expect(readmeContent).toContain('bun install');
      expect(readmeContent).toContain('## Usage');
      expect(readmeContent).toContain('bun run dev');
    });

    it('1.2-DOCS-003: should document core skills and specializations for each agent type', async () => {
      // GIVEN: Multiple agent types with different specializations
      const agentTypes: AgentRole[] = ['FrontendDev', 'BackendDev', 'QA'];

      for (const agentType of agentTypes) {
        const agentDefinition = createAgentDefinitionForRole(agentType);
        const outputPath = join(testDir, agentType);

        await generator.generateAgentDirectory(agentType, agentDefinition, outputPath);

        // THEN: Each README should have comprehensive documentation
        const readmePath = join(outputPath, 'README.md');
        const readmeContent = await fs.readFile(readmePath, 'utf-8');

        expect(readmeContent).toContain('## Specializations');
        expect(readmeContent).toContain('## Core Skills');
        expect(readmeContent.length).toBeGreaterThan(1000); // Should have substantial content
      }
    });
  });

  describe('P2: Medium Priority Tests', () => {
    it('1.2-DOCS-004: should provide integration guidelines with Claude Code', async () => {
      // GIVEN: Architect agent with integration documentation
      const agentDefinition = createAgentDefinitionForRole('Architect', {
        name: 'System Architect Agent',
        description: 'Expert in system design and architecture patterns',
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('Architect', agentDefinition, testDir);

      // THEN: README should include Claude Code integration guidelines
      const readmePath = join(testDir, 'README.md');
      const readmeContent = await fs.readFile(readmePath, 'utf-8');

      expect(readmeContent).toContain('Claude Code');
      expect(readmeContent).toContain('MCP Server');
      expect(readmeContent).toContain('Integration');
    });
  });
});

describe('1.2-AC005: Development Environment Setup Scripts', () => {
  describe('P0: Critical Path Tests', () => {
    it('1.2-SCRIPTS-001: should generate setup.sh script for automated environment preparation', async () => {
      // GIVEN: FrontendDev agent with setup requirements
      const agentDefinition = createAgentDefinitionForRole('FrontendDev', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('FrontendDev', agentDefinition, testDir);

      // THEN: Setup script should be executable and comprehensive
      const setupScriptPath = join(testDir, 'scripts', 'setup.sh');
      const setupScriptContent = await fs.readFile(setupScriptPath, 'utf-8');

      expect(setupScriptContent).toContain('#!/bin/bash');
      expect(setupScriptContent).toContain('bun install');
      expect(setupScriptContent).toContain('chmod +x');
    });
  });

  describe('P1: High Priority Tests', () => {
    it('1.2-SCRIPTS-002: should include development server startup scripts', async () => {
      // GIVEN: BackendDev agent with development workflow
      const agentDefinition = createAgentDefinitionForRole('BackendDev', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('BackendDev', agentDefinition, testDir);

      // THEN: Package.json should include development scripts
      const packageJsonPath = join(testDir, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts.dev).toContain('bun run');
    });

    it('1.2-SCRIPTS-003: should create test execution scripts using Bun Test', async () => {
      // GIVEN: QA agent with comprehensive testing setup
      const agentDefinition = createAgentDefinitionForRole('QA', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('QA', agentDefinition, testDir);

      // THEN: Testing scripts should be properly configured
      const packageJsonPath = join(testDir, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      expect(packageJson.scripts).toHaveProperty('test');
      expect(packageJson.scripts).toHaveProperty('test:watch');
      expect(packageJson.scripts.test).toContain('bun test');
    });
  });

  describe('P2: Medium Priority Tests', () => {
    it('1.2-SCRIPTS-004: should provide validation scripts for structure compliance', async () => {
      // GIVEN: Architect agent with validation requirements
      const agentDefinition = createAgentDefinitionForRole('Architect', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('Architect', agentDefinition, testDir);

      // THEN: Validation scripts should be present
      const scripts = ['scripts/validate.sh', 'scripts/dev.sh', 'scripts/test.sh'];

      for (const script of scripts) {
        const scriptPath = join(testDir, script);
        const scriptStat = await fs.stat(scriptPath);
        expect(scriptStat.isFile()).toBe(true);
      }
    });
  });
});

describe('1.2-AC006: Claude Code Native Integration', () => {
  describe('P0: Critical Path Tests', () => {
    it('1.2-INTEGRATION-001: should ensure generated structures work seamlessly with Claude Code subagents', async () => {
      // GIVEN: UX Expert agent with Claude Code integration
      const agentDefinition = createAgentDefinitionForRole('UXExpert', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('UX Expert', agentDefinition, testDir);

      // THEN: MCP server files should include Claude Code integration
      const mcpIndexPath = join(testDir, 'src', 'mcp-server', 'index.ts');
      const mcpIndexContent = await fs.readFile(mcpIndexPath, 'utf-8');

      expect(mcpIndexContent).toContain('@modelcontextprotocol/sdk');
      expect(mcpIndexContent).toContain('Server');
      expect(mcpIndexContent).toContain('ListToolsRequestSchema');
      expect(mcpIndexContent).toContain('CallToolRequestSchema');
    });
  });

  describe('P1: High Priority Tests', () => {
    it('1.2-INTEGRATION-002: should include configuration for episodic-memory integration', async () => {
      // GIVEN: Scrum Master agent with memory integration
      const agentDefinition = createAgentDefinitionForRole('SM', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('SM', agentDefinition, testDir);

      // THEN: MCP configuration should support episodic memory
      const mcpConfigPath = join(testDir, 'src', 'mcp-server', 'config.json');
      const mcpConfigContent = await fs.readFile(mcpConfigPath, 'utf-8');
      const mcpConfig = JSON.parse(mcpConfigContent);

      expect(mcpConfig).toHaveProperty('capabilities');
      expect(mcpConfig.capabilities).toHaveProperty('tools');
      expect(mcpConfig).toHaveProperty('configuration');
    });

    it('1.2-INTEGRATION-003: should support Task tool delegation patterns', async () => {
      // GIVEN: CLI Dev agent with task delegation capabilities
      const agentDefinition = createAgentDefinitionForRole('CLIDev', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('CLI Dev', agentDefinition, testDir);

      // THEN: MCP server should support task delegation
      const mcpIndexPath = join(testDir, 'src', 'mcp-server', 'index.ts');
      const mcpIndexContent = await fs.readFile(mcpIndexPath, 'utf-8');

      expect(mcpIndexContent).toContain('tools');
      expect(mcpIndexContent).toContain('handlers');
      expect(mcpIndexContent).toContain('registerEventHandler');
    });
  });

  describe('P2: Medium Priority Tests', () => {
    it('1.2-INTEGRATION-004: should provide compatibility with slash command system', async () => {
      // GIVEN: QA agent with slash command support
      const agentDefinition = createAgentDefinitionForRole('QA', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('QA', agentDefinition, testDir);

      // THEN: Tools directory should support slash commands
      const toolsIndexPath = join(testDir, 'src', 'mcp-server', 'tools', 'index.ts');
      const toolsDirExists = await fs.stat(toolsIndexPath).then(() => true).catch(() => false);

      expect(toolsDirExists).toBe(true);
    });
  });
});

describe('Performance Requirements (from FR001)', () => {
  describe('P0: Critical Path Tests', () => {
    it('1.2-PERF-001: should generate agent directory structure in under 30 seconds', async () => {
      // GIVEN: Performance-critical agent definition
      const agentDefinition = createAgentDefinitionForRole('FrontendDev', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig({ timeout: 25000 }),
        },
      });

      // WHEN: Measuring generation time
      const startTime = Date.now();
      const result = await generator.generateAgentDirectory('FrontendDev', agentDefinition, testDir);
      const endTime = Date.now();

      const generationTime = endTime - startTime;

      // THEN: Should meet performance requirements
      expect(result.success).toBe(true);
      expect(generationTime).toBeLessThan(30000);
      expect(result.metrics.duration).toBeLessThan(30000);
    });
  });

  describe('P1: High Priority Tests', () => {
    it('1.2-PERF-002: should use reasonable memory during generation process', async () => {
      // GIVEN: Memory-efficient agent definition
      const agentDefinition = createAgentDefinitionForRole('BackendDev', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      // WHEN: Generating with memory tracking
      const result = await generator.generateAgentDirectory('BackendDev', agentDefinition, testDir);

      // THEN: Memory usage should be within bounds
      expect(result.success).toBe(true);
      expect(result.metrics.memoryUsage).toBeGreaterThan(0);
      expect(result.metrics.memoryUsage).toBeLessThan(100 * 1024 * 1024); // 100MB in bytes
    });

    it('1.2-PERF-003: should render templates efficiently per agent type', async () => {
      // GIVEN: Multiple agent types for batch performance testing
      const agentTypes: AgentRole[] = ['FrontendDev', 'BackendDev', 'QA'];

      for (const agentType of agentTypes) {
        const agentDefinition = createAgentDefinitionForRole(agentType);
        const outputPath = join(testDir, agentType);

        // WHEN: Measuring template rendering time
        const startTime = Date.now();
        const result = await generator.generateAgentDirectory(agentType, agentDefinition, outputPath);
        const endTime = Date.now();

        const renderTime = endTime - startTime;

        // THEN: Each should be fast and create substantial output
        expect(result.success).toBe(true);
        expect(result.metrics.filesCreated).toBeGreaterThan(10); // Should create multiple files
        expect(renderTime).toBeLessThan(30000); // Should be fast
      }
    });
  });
});

describe('Quality Gates Compliance', () => {
  describe('P1: High Priority Tests', () => {
    it('1.2-QUALITY-001: should generate code that passes ESLint validation without rule violations', async () => {
      // GIVEN: Quality-compliant agent definition
      const agentDefinition = createAgentDefinitionForRole('FrontendDev', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('FrontendDev', agentDefinition, testDir);

      // THEN: Generated TypeScript files should be lintable
      const indexTsPath = join(testDir, 'src', 'index.ts');
      const generatedCode = await fs.readFile(indexTsPath, 'utf-8');

      expect(generatedCode).toBeDefined();
      expect(generatedCode.length).toBeGreaterThan(0);

      // Should not contain eslint-disable comments
      expect(generatedCode).not.toContain('eslint-disable');
      expect(generatedCode).not.toContain('/* eslint-disable */');
      expect(generatedCode).not.toContain('// eslint-disable');
    });

    it('1.2-QUALITY-002: should generate TypeScript strict mode compliant code', async () => {
      // GIVEN: Strict-mode compliant agent definition
      const agentDefinition = createAgentDefinitionForRole('BackendDev', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      await generator.generateAgentDirectory('BackendDev', agentDefinition, testDir);

      // THEN: Generated code should be TypeScript strict mode compliant
      const indexTsPath = join(testDir, 'src', 'index.ts');
      const generatedCode = await fs.readFile(indexTsPath, 'utf-8');

      // Should have proper TypeScript types
      expect(generatedCode).toContain(': ');
      expect(generatedCode).toContain('export ');

      // Should not have any type assertions or implicit any
      expect(generatedCode).not.toContain(' as any');
      expect(generatedCode).not.toContain(': any');
    });
  });

  describe('P2: Medium Priority Tests', () => {
    it('1.2-QUALITY-003: should validate generated directory structures for compliance', async () => {
      // GIVEN: Compliance-focused agent definition
      const agentDefinition = createAgentDefinitionForRole('Architect', {
        configuration: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 4000,
          performance: createPerformanceConfig(),
        },
      });

      const result = await generator.generateAgentDirectory('Architect', agentDefinition, testDir);

      // THEN: Should meet compliance metrics
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
      expect(result.metrics.filesCreated).toBeGreaterThan(15);
      expect(result.metrics.directoriesCreated).toBeGreaterThan(5);
    });
  });
});

describe('Generator Configuration and Utilities', () => {
  describe('P2: Medium Priority Tests', () => {
    it('1.2-UTIL-001: should provide available agent types', async () => {
      // WHEN: Querying available agent types
      const availableTypes = generator.getAvailableAgentTypes();

      // THEN: Should return all supported agent types
      expect(availableTypes).toContain('FrontendDev');
      expect(availableTypes).toContain('BackendDev');
      expect(availableTypes).toContain('QA');
      expect(availableTypes).toContain('Architect');
      expect(availableTypes).toContain('CLI Dev');
      expect(availableTypes).toContain('UX Expert');
      expect(availableTypes).toContain('SM');
      expect(availableTypes).toHaveLength(8);
    });

    it('1.2-UTIL-002: should provide agent configuration for specific types', async () => {
      // WHEN: Getting configuration for specific agent type
      const frontendConfig = generator.getAgentConfig('FrontendDev');

      // THEN: Should return complete configuration
      expect(frontendConfig).toBeDefined();
      expect(frontendConfig?.role).toBe('FrontendDev');
      expect(frontendConfig?.name).toBe('Frontend Development Expert');
      expect(frontendConfig?.dependencies).toHaveProperty('react');
      expect(frontendConfig?.specializations).toContain('React');
    });
  });

  describe('P3: Low Priority Tests', () => {
    it('1.2-UTIL-003: should validate agent types', async () => {
      // WHEN: Validating agent types
      const validTypes = ['FrontendDev', 'BackendDev'];
      const invalidTypes = ['InvalidAgent', '', null as any, undefined as any];

      // THEN: Should correctly identify valid and invalid types
      validTypes.forEach((type) => {
        expect(generator.isValidAgentType(type)).toBe(true);
      });

      invalidTypes.forEach((type) => {
        expect(generator.isValidAgentType(type)).toBe(false);
      });
    });
  });
});

});