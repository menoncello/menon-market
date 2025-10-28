/**
 * Directory Structure Generator
 * Generates complete modular agent directory structures with templates
 * Supports all 7 agent types with MCP server integration
 */

import { AgentRole, AgentDefinition } from '@menon-market/core';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as templates from './templates/index.js';

/**
 * Agent type configuration for directory generation
 */
interface AgentTypeConfig {
  role: AgentRole;
  name: string;
  packageScope: string;
  specializations: string[];
  coreSkills: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

/**
 * Directory structure template configuration
 */
interface DirectoryStructure {
  [directory: string]:
    | {
        type: 'directory';
        children?: DirectoryStructure;
      }
    | {
        type: 'file';
        template: string;
        templateVars?: Record<string, unknown>;
      };
}

/**
 * Template variables for file generation
 */
interface TemplateVariables {
  agentName: string;
  agentType: string;
  packageScope: string;
  agentId: string;
  specializations: string[];
  coreSkills: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  author: string;
  version: string;
  description: string;
}

/**
 * Performance metrics for directory generation
 */
interface GenerationMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  filesCreated: number;
  directoriesCreated: number;
  memoryUsage: number;
}

/**
 * Directory Structure Generator Class
 * Implements AC 1 & 2: Template-based directory generation with MCP integration
 */
export class DirectoryStructureGenerator {
  private readonly agentsDir: string;

  /**
   * Agent type configurations for all 7 agent types
   */
  private readonly agentConfigs: Record<AgentRole, AgentTypeConfig> = {
    FrontendDev: {
      role: 'FrontendDev',
      name: 'Frontend Development Expert',
      packageScope: '@menon-market/frontend-dev-agent',
      specializations: ['React', 'Vue', 'Angular', 'TypeScript', 'CSS/Tailwind', 'Next.js'],
      coreSkills: [
        'UI/UX Implementation',
        'Component Architecture',
        'State Management',
        'Performance Optimization',
        'Accessibility',
      ],
      dependencies: {
        react: '^18.2.0',
        typescript: '^5.9.3',
        '@types/node': '^20.0.0',
        zod: '^4.1.12',
        '@modelcontextprotocol/sdk': '^1.0.0',
      },
      devDependencies: {
        '@types/react': '^18.2.0',
        eslint: '^9.38.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        prettier: '^3.6.2',
      },
      scripts: {
        dev: 'bun run src/index.ts',
        build: 'bun build src/index.ts --outdir dist --target node',
        test: 'bun test',
        'test:watch': 'bun test --watch',
        lint: 'eslint src --ext .ts,.tsx',
        'lint:fix': 'eslint src --ext .ts,.tsx --fix',
        format: 'prettier --write "src/**/*.{ts,tsx,json,md}"',
        'format:check': 'prettier --check "src/**/*.{ts,tsx,json,md}"',
        typecheck: 'tsc --noEmit',
      },
    },
    BackendDev: {
      role: 'BackendDev',
      name: 'Backend Development Expert',
      packageScope: '@menon-market/backend-dev-agent',
      specializations: [
        'Node.js',
        'Python',
        'Databases',
        'API Design',
        'Microservices',
        'Cloud Services',
      ],
      coreSkills: [
        'API Development',
        'Database Design',
        'Authentication',
        'Performance Optimization',
        'Security',
      ],
      dependencies: {
        express: '^4.18.0',
        typescript: '^5.9.3',
        '@types/node': '^20.0.0',
        zod: '^4.1.12',
        jsonwebtoken: '^9.0.0',
        '@modelcontextprotocol/sdk': '^1.0.0',
      },
      devDependencies: {
        '@types/express': '^4.17.0',
        '@types/jsonwebtoken': '^9.0.0',
        eslint: '^9.38.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        prettier: '^3.6.2',
      },
      scripts: {
        dev: 'bun run src/index.ts',
        build: 'bun build src/index.ts --outdir dist --target node',
        test: 'bun test',
        'test:watch': 'bun test --watch',
        lint: 'eslint src --ext .ts',
        'lint:fix': 'eslint src --ext .ts --fix',
        format: 'prettier --write "src/**/*.{ts,json,md}"',
        'format:check': 'prettier --check "src/**/*.{ts,json,md}"',
        typecheck: 'tsc --noEmit',
        start: 'bun run dist/index.js',
      },
    },
    QA: {
      role: 'QA',
      name: 'Quality Assurance Expert',
      packageScope: '@menon-market/qa-agent',
      specializations: [
        'Test Automation',
        'Performance Testing',
        'Security Testing',
        'Integration Testing',
      ],
      coreSkills: [
        'Test Planning',
        'Automation Frameworks',
        'Bug Tracking',
        'Quality Metrics',
        'CI/CD Integration',
      ],
      dependencies: {
        playwright: '^1.40.0',
        typescript: '^5.9.3',
        '@types/node': '^20.0.0',
        zod: '^4.1.12',
        '@modelcontextprotocol/sdk': '^1.0.0',
      },
      devDependencies: {
        '@playwright/test': '^1.40.0',
        eslint: '^9.38.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        prettier: '^3.6.2',
      },
      scripts: {
        dev: 'bun run src/index.ts',
        build: 'bun build src/index.ts --outdir dist --target node',
        test: 'bun test',
        'test:watch': 'bun test --watch',
        'test:e2e': 'playwright test',
        'test:performance': 'bun run src/performance/tests.ts',
        lint: 'eslint src --ext .ts',
        'lint:fix': 'eslint src --ext .ts --fix',
        format: 'prettier --write "src/**/*.{ts,json,md}"',
        'format:check': 'prettier --check "src/**/*.{ts,json,md}"',
        typecheck: 'tsc --noEmit',
      },
    },
    Architect: {
      role: 'Architect',
      name: 'System Architecture Expert',
      packageScope: '@menon-market/architect-agent',
      specializations: [
        'System Design',
        'Microservices',
        'Cloud Architecture',
        'Security Architecture',
        'Performance Design',
      ],
      coreSkills: [
        'Architecture Patterns',
        'Technology Selection',
        'Scalability Design',
        'Security Design',
        'Documentation',
      ],
      dependencies: {
        typescript: '^5.9.3',
        '@types/node': '^20.0.0',
        zod: '^4.1.12',
        'markdown-it': '^13.0.0',
      },
      devDependencies: {
        eslint: '^9.38.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        prettier: '^3.6.2',
        '@types/markdown-it': '^13.0.0',
      },
      scripts: {
        dev: 'bun run src/index.ts',
        build: 'bun build src/index.ts --outdir dist --target node',
        test: 'bun test',
        'test:watch': 'bun test --watch',
        lint: 'eslint src --ext .ts',
        'lint:fix': 'eslint src --ext .ts --fix',
        format: 'prettier --write "src/**/*.{ts,json,md}"',
        'format:check': 'prettier --check "src/**/*.{ts,json,md}"',
        typecheck: 'tsc --noEmit',
        'docs:generate': 'bun run src/docs/generate.ts',
      },
    },
    'CLI Dev': {
      role: 'CLI Dev',
      name: 'CLI Development Expert',
      packageScope: '@menon-market/cli-dev-agent',
      specializations: ['Command Line Tools', 'Node.js CLI', 'Shell Scripting', 'Automation Tools'],
      coreSkills: [
        'CLI Design',
        'Argument Parsing',
        'Interactive Interfaces',
        'Package Management',
        'Distribution',
      ],
      dependencies: {
        commander: '^11.0.0',
        inquirer: '^9.0.0',
        chalk: '^5.0.0',
        typescript: '^5.9.3',
        '@types/node': '^20.0.0',
        zod: '^4.1.12',
      },
      devDependencies: {
        '@types/inquirer': '^9.0.0',
        eslint: '^9.38.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        prettier: '^3.6.2',
      },
      scripts: {
        dev: 'bun run src/index.ts',
        build: 'bun build src/index.ts --outdir dist --target node',
        test: 'bun test',
        'test:watch': 'bun test --watch',
        lint: 'eslint src --ext .ts',
        'lint:fix': 'eslint src --ext .ts --fix',
        format: 'prettier --write "src/**/*.{ts,json,md}"',
        'format:check': 'prettier --check "src/**/*.{ts,json,md}"',
        typecheck: 'tsc --noEmit',
        start: 'node dist/index.js',
      },
    },
    'UX Expert': {
      role: 'UX Expert',
      name: 'User Experience Expert',
      packageScope: '@menon-market/ux-expert-agent',
      specializations: [
        'User Research',
        'Interaction Design',
        'Usability Testing',
        'Design Systems',
        'Accessibility',
      ],
      coreSkills: [
        'User Analysis',
        'Design Thinking',
        'Prototyping',
        'Usability Evaluation',
        'Design Documentation',
      ],
      dependencies: {
        typescript: '^5.9.3',
        '@types/node': '^20.0.0',
        zod: '^4.1.12',
        'figma-api': '^1.0.0',
      },
      devDependencies: {
        eslint: '^9.38.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        prettier: '^3.6.2',
        '@types/figma-api': '^1.0.0',
      },
      scripts: {
        dev: 'bun run src/index.ts',
        build: 'bun build src/index.ts --outdir dist --target node',
        test: 'bun test',
        'test:watch': 'bun test --watch',
        lint: 'eslint src --ext .ts',
        'lint:fix': 'eslint src --ext .ts --fix',
        format: 'prettier --write "src/**/*.{ts,json,md}"',
        'format:check': 'prettier --check "src/**/*.{ts,json,md}"',
        typecheck: 'tsc --noEmit',
        'research:analyze': 'bun run src/research/analyze.ts',
        'design:prototype': 'bun run src/design/prototype.ts',
      },
    },
    SM: {
      role: 'SM',
      name: 'Scrum Master Expert',
      packageScope: '@menon-market/sm-agent',
      specializations: [
        'Agile Coaching',
        'Team Facilitation',
        'Sprint Planning',
        'Continuous Improvement',
        'Stakeholder Management',
      ],
      coreSkills: [
        'Scrum Framework',
        'Team Development',
        'Conflict Resolution',
        'Metrics Tracking',
        'Process Optimization',
      ],
      dependencies: {
        typescript: '^5.9.3',
        '@types/node': '^20.0.0',
        zod: '^4.1.12',
        yaml: '^2.3.0',
        '@modelcontextprotocol/sdk': '^1.0.0',
      },
      devDependencies: {
        eslint: '^9.38.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        prettier: '^3.6.2',
        '@types/yaml': '^2.0.0',
      },
      scripts: {
        dev: 'bun run src/index.ts',
        build: 'bun build src/index.ts --outdir dist --target node',
        test: 'bun test',
        'test:watch': 'bun test --watch',
        lint: 'eslint src --ext .ts',
        'lint:fix': 'eslint src --ext .ts --fix',
        format: 'prettier --write "src/**/*.{ts,json,md}"',
        'format:check': 'prettier --check "src/**/*.{ts,json,md}"',
        typecheck: 'tsc --noEmit',
        'sprint:plan': 'bun run src/sprint/planning.ts',
        'retrospective:facilitate': 'bun run src/retrospective/facilitate.ts',
      },
    },
    Custom: {
      role: 'Custom',
      name: 'Custom Agent',
      packageScope: '@menon-market/custom-agent',
      specializations: ['Custom Skills', 'Domain Expertise', 'Specialized Knowledge'],
      coreSkills: ['Custom Core Skills', 'Adaptability', 'Problem Solving'],
      dependencies: {
        typescript: '^5.9.3',
        '@types/node': '^20.0.0',
        zod: '^4.1.12',
        '@modelcontextprotocol/sdk': '^1.0.0',
      },
      devDependencies: {
        eslint: '^9.38.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        prettier: '^3.6.2',
      },
      scripts: {
        dev: 'bun run src/index.ts',
        build: 'bun build src/index.ts --outdir dist --target node',
        test: 'bun test',
        'test:watch': 'bun test --watch',
        lint: 'eslint src --ext .ts',
        'lint:fix': 'eslint src --ext .ts --fix',
        format: 'prettier --write "src/**/*.{ts,json,md}"',
        'format:check': 'prettier --check "src/**/*.{ts,json,md}"',
        typecheck: 'tsc --noEmit',
      },
    },
  };

  /**
   * Standard directory structure for all agent types
   */
  private readonly baseDirectoryStructure: DirectoryStructure = {
    src: {
      type: 'directory',
      children: {
        'index.ts': {
          type: 'file',
          template: 'templates/index.ts.hbs',
        },
        types: {
          type: 'directory',
          children: {
            'index.ts': {
              type: 'file',
              template: 'templates/types/index.ts.hbs',
            },
          },
        },
        services: {
          type: 'directory',
          children: {
            'index.ts': {
              type: 'file',
              template: 'templates/services/index.ts.hbs',
            },
          },
        },
        utils: {
          type: 'directory',
          children: {
            'index.ts': {
              type: 'file',
              template: 'templates/utils/index.ts.hbs',
            },
          },
        },
        'mcp-server': {
          type: 'directory',
          children: {
            'index.ts': {
              type: 'file',
              template: 'templates/mcp-server/index.ts.hbs',
            },
            tools: {
              type: 'directory',
              children: {
                'index.ts': {
                  type: 'file',
                  template: 'templates/mcp-server/tools/index.ts.hbs',
                },
              },
            },
            handlers: {
              type: 'directory',
              children: {
                'index.ts': {
                  type: 'file',
                  template: 'templates/mcp-server/handlers/index.ts.hbs',
                },
              },
            },
            'config.json': {
              type: 'file',
              template: 'templates/mcp-server/config.json.hbs',
            },
          },
        },
      },
    },
    tests: {
      type: 'directory',
      children: {
        unit: {
          type: 'directory',
          children: {
            'services.test.ts': {
              type: 'file',
              template: 'templates/tests/unit/services.test.ts.hbs',
            },
            'utils.test.ts': {
              type: 'file',
              template: 'templates/tests/unit/utils.test.ts.hbs',
            },
          },
        },
        integration: {
          type: 'directory',
          children: {
            'mcp-server.test.ts': {
              type: 'file',
              template: 'templates/tests/integration/mcp-server.test.ts.hbs',
            },
          },
        },
        e2e: {
          type: 'directory',
          children: {
            'agent.test.ts': {
              type: 'file',
              template: 'templates/tests/e2e/agent.test.ts.hbs',
            },
          },
        },
        'setup.ts': {
          type: 'file',
          template: 'templates/tests/setup.ts.hbs',
        },
      },
    },
    config: {
      type: 'directory',
      children: {
        'eslint.config.js': {
          type: 'file',
          template: 'templates/config/eslint.config.js.hbs',
        },
        'prettier.config.js': {
          type: 'file',
          template: 'templates/config/prettier.config.js.hbs',
        },
        'tsconfig.json': {
          type: 'file',
          template: 'templates/config/tsconfig.json.hbs',
        },
        'bunfig.toml': {
          type: 'file',
          template: 'templates/config/bunfig.toml.hbs',
        },
      },
    },
    docs: {
      type: 'directory',
      children: {
        'README.md': {
          type: 'file',
          template: 'templates/docs/README.md.hbs',
        },
        'API.md': {
          type: 'file',
          template: 'templates/docs/API.md.hbs',
        },
        'DEVELOPMENT.md': {
          type: 'file',
          template: 'templates/docs/DEVELOPMENT.md.hbs',
        },
        'CONTRIBUTING.md': {
          type: 'file',
          template: 'templates/docs/CONTRIBUTING.md.hbs',
        },
      },
    },
    scripts: {
      type: 'directory',
      children: {
        'setup.sh': {
          type: 'file',
          template: 'templates/scripts/setup.sh.hbs',
        },
        'dev.sh': {
          type: 'file',
          template: 'templates/scripts/dev.sh.hbs',
        },
        'test.sh': {
          type: 'file',
          template: 'templates/scripts/test.sh.hbs',
        },
        'validate.sh': {
          type: 'file',
          template: 'templates/scripts/validate.sh.hbs',
        },
      },
    },
    'package.json': {
      type: 'file',
      template: 'templates/package.json.hbs',
    },
    'tsconfig.json': {
      type: 'file',
      template: 'templates/tsconfig.json.hbs',
    },
    'README.md': {
      type: 'file',
      template: 'templates/README.md.hbs',
    },
    '.gitignore': {
      type: 'file',
      template: 'templates/gitignore.hbs',
    },
    '.prettierrc': {
      type: 'file',
      template: 'templates/prettierrc.hbs',
    },
  };

  /**
   * Initialize the directory structure generator
   * @param projectRoot Root directory of the project
   */
  constructor(projectRoot = '/Users/menoncello/repos/ai/menon-market') {
    this.agentsDir = join(projectRoot, 'agents');
  }

  /**
   * Generate complete directory structure for an agent
   * Performance target: <30 seconds per agent
   * @param agentType Type of agent to generate
   * @param agentDefinition Agent definition metadata
   * @param outputPath Custom output path (optional)
   */
  async generateAgentDirectory(
    agentType: AgentRole,
    agentDefinition: AgentDefinition,
    outputPath?: string
  ): Promise<{ success: boolean; path: string; metrics: GenerationMetrics; errors?: string[] }> {
    const startTime = Date.now();
    const metrics: GenerationMetrics = {
      startTime,
      endTime: 0,
      duration: 0,
      filesCreated: 0,
      directoriesCreated: 0,
      memoryUsage: 0,
    };

    const errors: string[] = [];

    try {
      // Get agent configuration
      const config = this.agentConfigs[agentType];
      if (!config) {
        throw new Error(`Unknown agent type: ${agentType}`);
      }

      // Generate output directory path
      const agentDirName = this.generateAgentDirectoryName(agentType, agentDefinition.id);
      const outputDir = outputPath || join(this.agentsDir, agentDirName);

      // Create template variables
      const templateVars: TemplateVariables = {
        agentName: agentDefinition.name,
        agentType: config.name,
        packageScope: config.packageScope,
        agentId: agentDefinition.id,
        specializations: config.specializations,
        coreSkills: config.coreSkills,
        dependencies: config.dependencies,
        devDependencies: config.devDependencies,
        scripts: config.scripts,
        author: agentDefinition.metadata?.author || 'System Generated',
        version: agentDefinition.metadata?.version || '1.0.0',
        description: agentDefinition.description || `${config.name} - AI Agent`,
      };

      // Generate directory structure
      await this.createDirectoryStructure(
        outputDir,
        this.baseDirectoryStructure,
        templateVars,
        metrics
      );

      // Validate generated structure
      const validationErrors = await this.validateGeneratedStructure(outputDir, agentType);
      errors.push(...validationErrors);

      // Update metrics
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      metrics.memoryUsage = process.memoryUsage().heapUsed;

      // Check performance target
      if (metrics.duration > 30000) {
        errors.push(`Generation took ${metrics.duration}ms, exceeding the 30-second target`);
      }

      return {
        success: errors.length === 0,
        path: outputDir,
        metrics,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - startTime;
      metrics.memoryUsage = process.memoryUsage().heapUsed;

      return {
        success: false,
        path: '',
        metrics,
        errors: [`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
    }
  }

  /**
   * Generate directory name for agent
   * @param agentType Type of agent
   * @param agentId Unique agent identifier
   */
  private generateAgentDirectoryName(agentType: AgentRole, agentId: string): string {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const randomSuffix = agentId.split('-').pop(); // Use existing random suffix from agent ID
    return `${agentType.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${randomSuffix}`;
  }

  /**
   * Create directory structure recursively
   * @param basePath Base path for creation
   * @param structure Directory structure definition
   * @param templateVars Template variables
   * @param metrics Performance metrics
   */
  private async createDirectoryStructure(
    basePath: string,
    structure: DirectoryStructure,
    templateVars: TemplateVariables,
    metrics: GenerationMetrics
  ): Promise<void> {
    for (const [name, item] of Object.entries(structure)) {
      const fullPath = join(basePath, name);

      if (item.type === 'directory') {
        // Create directory
        await fs.mkdir(fullPath, { recursive: true });
        metrics.directoriesCreated++;

        // Process children if they exist
        if (item.children) {
          await this.createDirectoryStructure(fullPath, item.children, templateVars, metrics);
        }
      } else if (item.type === 'file') {
        // Generate file content from template
        const content = await this.generateFileContent(
          item.template,
          templateVars,
          item.templateVars
        );
        await fs.writeFile(fullPath, content, 'utf-8');
        metrics.filesCreated++;
      }
    }
  }

  /**
   * Generate file content from template
   * @param templatePath Path to template file
   * @param templateVars Template variables
   * @param additionalVars Additional template variables
   */
  private async generateFileContent(
    templatePath: string,
    templateVars: TemplateVariables,
    additionalVars?: Record<string, unknown>
  ): Promise<string> {
    try {
      // For now, we'll use simple template substitution
      // In a full implementation, you'd use a proper templating engine like Handlebars

      let content = await this.getTemplateContent(templatePath);

      // Replace template variables with special handling for objects
      const allVars: Record<string, unknown> = {
        ...templateVars,
        ...additionalVars,
        date: new Date().toISOString().split('T')[0],
      };

      // Special handling for scripts, dependencies, and devDependencies
      const specialVars = ['scripts', 'dependencies', 'devDependencies'];
      for (const varName of specialVars) {
        if (
          allVars[varName] &&
          typeof allVars[varName] === 'object' &&
          !Array.isArray(allVars[varName])
        ) {
          const obj = allVars[varName] as Record<string, string>;
          const formatted = Object.entries(obj)
            .map(([key, value]) => {
              // Escape double quotes in JSON values
              const escapedValue = value.replace(/"/g, '\\"');
              return `    "${key}": "${escapedValue}"`;
            })
            .join(',\n');
          allVars[varName] = formatted;
        }
      }

      // Handle simple variable substitution: {{variable}}
      content = content.replace(/{{([^}]+)}}/g, (match, variablePath) => {
        const value = this.getNestedValue(allVars, variablePath.trim());
        return value === undefined ? match : String(value);
      });

      // Handle Handlebars each blocks: {{#each array}}
      content = content.replace(
        /{{#each (\w+)}}([\s\S]*?){{\/each}}/g,
        (_match, arrayName, blockContent) => {
          const arrayOrObject = allVars[arrayName];

          // Handle arrays
          if (Array.isArray(arrayOrObject)) {
            return arrayOrObject
              .map((item, index) => {
                let itemContent = blockContent;
                itemContent = itemContent.replace(/{{@key}}/g, String(index));
                itemContent = itemContent.replace(/{{this}}/g, String(item));

                // Handle conditional output in each blocks
                itemContent = itemContent.replace(
                  /{{#unless @last}}([\s\S]*?){{\/unless}}/g,
                  (_conditionalMatch: string, conditionalContent: string) => {
                    return index === arrayOrObject.length - 1 ? '' : conditionalContent;
                  }
                );

                return itemContent;
              })
              .join('');
          }

          // Handle objects (convert to entries)
          if (arrayOrObject && typeof arrayOrObject === 'object') {
            const entries = Object.entries(arrayOrObject);
            return entries
              .map(([key, value], index) => {
                let itemContent = blockContent;
                itemContent = itemContent.replace(/{{@key}}/g, key);
                itemContent = itemContent.replace(/{{this}}/g, String(value));

                // Handle conditional output in each blocks
                itemContent = itemContent.replace(
                  /{{#unless @last}}([\s\S]*?){{\/unless}}/g,
                  (_conditionalMatch: string, conditionalContent: string) => {
                    return index === entries.length - 1 ? '' : conditionalContent;
                  }
                );

                return itemContent;
              })
              .join('');
          }

          return '';
        }
      );

      // Handle Handlebars conditionals: {{#if condition}}
      content = content.replace(
        /{{#if (\w+)}}([\s\S]*?){{\/if}}/g,
        (_match, conditionName, blockContent) => {
          const value = allVars[conditionName];
          return value ? blockContent : '';
        }
      );

      return content;
    } catch (error) {
      throw new Error(
        `Failed to generate content from template ${templatePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get template content
   * @param templatePath Template file path
   */
  private async getTemplateContent(templatePath: string): Promise<string> {
    // For now, return default templates
    // In a full implementation, you'd read from actual template files

    const templateMap: Record<string, string> = {
      'templates/package.json.hbs': this.generatePackageJsonTemplate(),
      'templates/tsconfig.json.hbs': this.generateTsconfigTemplate(),
      'templates/index.ts.hbs': templates.generateIndexTemplate(),
      'templates/README.md.hbs': templates.generateReadmeTemplate(),
      'templates/gitignore.hbs': templates.generateGitignoreTemplate(),
      'templates/prettierrc.hbs': this.generatePrettierConfigTemplate(),
      'templates/config/eslint.config.js.hbs': templates.generateEslintConfigTemplate(),
      'templates/config/prettier.config.js.hbs': this.generatePrettierConfigJsTemplate(),
      'templates/config/bunfig.toml.hbs': this.generateBunfigTemplate(),
      'templates/mcp-server/index.ts.hbs': templates.generateMcpServerTemplate(),
      'templates/mcp-server/config.json.hbs': templates.generateMcpConfigTemplate(),
      'templates/scripts/setup.sh.hbs': templates.generateSetupScriptTemplate(),
      'templates/tests/setup.ts.hbs': templates.generateTestSetupTemplate(),
    };

    return templateMap[templatePath] || `// Template not found: ${templatePath}`;
  }

  /**
   * Get nested value from object using dot notation
   * @param obj Object to get value from
   * @param path Dot-separated path
   */
  private getNestedValue(obj: unknown, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
      if (current === null || typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return current;
  }

  /**
   * Validate generated directory structure
   * @param outputDir Generated directory path
   * @param agentType Agent type for validation rules
   */
  private async validateGeneratedStructure(
    outputDir: string,
    agentType: AgentRole
  ): Promise<string[]> {
    const errors: string[] = [];
    const config = this.agentConfigs[agentType];

    try {
      // Check required directories exist
      const requiredDirs = ['src', 'tests', 'config', 'docs', 'scripts'];
      for (const dir of requiredDirs) {
        const dirPath = join(outputDir, dir);
        try {
          const stat = await fs.stat(dirPath);
          if (!stat.isDirectory()) {
            errors.push(`Required directory ${dir} exists but is not a directory`);
          }
        } catch {
          errors.push(`Required directory ${dir} is missing`);
        }
      }

      // Check required files exist
      const requiredFiles = [
        'package.json',
        'tsconfig.json',
        'README.md',
        '.gitignore',
        '.prettierrc',
        'src/index.ts',
        'src/mcp-server/index.ts',
        'src/mcp-server/config.json',
      ];

      for (const file of requiredFiles) {
        const filePath = join(outputDir, file);
        try {
          const stat = await fs.stat(filePath);
          if (!stat.isFile()) {
            errors.push(`Required file ${file} exists but is not a file`);
          }
        } catch {
          errors.push(`Required file ${file} is missing`);
        }
      }

      // Validate package.json content
      try {
        const packageJsonPath = join(outputDir, 'package.json');
        const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);

        if (packageJson.name !== config.packageScope) {
          errors.push(`Package name should be ${config.packageScope}, got ${packageJson.name}`);
        }

        if (!packageJson.dependencies || Object.keys(packageJson.dependencies).length === 0) {
          errors.push('Package.json should have dependencies');
        }
      } catch (error) {
        errors.push(
          `Failed to validate package.json: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      // Validate TypeScript configuration
      try {
        const tsconfigPath = join(outputDir, 'tsconfig.json');
        const tsconfigContent = await fs.readFile(tsconfigPath, 'utf-8');
        const tsconfig = JSON.parse(tsconfigContent);

        if (tsconfig.compilerOptions?.strict !== true) {
          errors.push('TypeScript strict mode should be enabled');
        }
      } catch (error) {
        errors.push(
          `Failed to validate tsconfig.json: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    } catch (error) {
      errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return errors;
  }

  // Template generation methods (simplified for this implementation)
  private generatePackageJsonTemplate(): string {
    return `{
  "name": "{{packageScope}}",
  "version": "{{version}}",
  "description": "{{description}}",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
{{scripts}}
  },
  "dependencies": {
{{dependencies}}
  },
  "devDependencies": {
{{devDependencies}}
  },
  "keywords": [
    "agent",
    "ai",
    "claude-code",
    "{{agentType}}"
  ],
  "author": "{{author}}",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0",
    "bun": ">=1.0.0"
  }
}`;
  }

  private generateTsconfigTemplate(): string {
    return `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@menon-market/*": ["../../packages/*/src"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "tests"
  ]
}`;
  }

  
  
  private generatePrettierConfigTemplate(): string {
    return `{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": true,
  "proseWrap": "preserve"
}`;
  }

  private generatePrettierConfigJsTemplate(): string {
    return `export default {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  proseWrap: 'preserve',
};`;
  }

  private generateBunfigTemplate(): string {
    return `[install]
# Cache directory for bun install
cache = "~/.bun/install/cache"

# Registry configuration
registry = "https://registry.npmjs.org/"

# Scopes for private registries
# [install.scopes]
# "@mycompany" = "https://npm.mycompany.com/"

[run]
# Shell to use for bun run
shell = ["bash", "-c"]

# Environment variables for bun run
# [run.env]
# NODE_ENV = "development"

[test]
# Test configuration
preload = ["./tests/setup.ts"]

# Coverage configuration
coverage = true
coverageReporter = ["text", "html"]

[build]
# Build configuration
target = "node"
minify = true
sourcemap = true

# Define build constants
# [build.define]
# MY_CONSTANT = "\\"some value\\""

[bun]
# Lockfile configuration
lockfile = true
lockfileSave = true

# Telemetry
telemetry = false`;
  }


  /**
   * Get available agent types
   */
  getAvailableAgentTypes(): AgentRole[] {
    return Object.keys(this.agentConfigs) as AgentRole[];
  }

  /**
   * Get agent configuration for a specific type
   * @param agentType Agent type to get configuration for
   */
  getAgentConfig(agentType: AgentRole): AgentTypeConfig | undefined {
    return this.agentConfigs[agentType];
  }

  /**
   * Validate agent type is supported
   * @param agentType Agent type to validate
   */
  isValidAgentType(agentType: string): agentType is AgentRole {
    return agentType in this.agentConfigs;
  }
}
