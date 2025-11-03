# Bun-First Template Engine Design with Handlebars.js

**Date**: 2025-11-03
**Author**: Eduardo Menoncello
**Status**: Design Complete
**Target**: Migration from Node.js scripts to Bun-first with template placeholders

## Overview

Comprehensive template engine system to migrate all Node.js scripts to Bun-first architecture using Handlebars.js with TypeScript support and custom helpers for Bun-specific features.

## Architecture

### Core Components

#### 1. Template Manager (`src/templates/manager.ts`)
```typescript
import Handlebars from 'handlebars';
import { readdir, readFile, writeFile } from 'node:fs/promises';

export class TemplateManager {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  async initialize(): Promise<void> {
    await this.registerBunHelpers();
    await this.loadTemplates();
  }

  private async registerBunHelpers(): Promise<void> {
    // {{bun-import "sqlite"}} → "bun:sqlite"
    Handlebars.registerHelper('bun-import', (pkg: string) => {
      return pkg.startsWith('bun:') ? pkg : `bun:${pkg}`;
    });

    // {{bun-class "PluginName"}} → PascalCase formatting
    Handlebars.registerHelper('bun-class', (name: string) => {
      return name.split('-').map(part =>
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join('');
    });

    // {{bun-filename "MyClass"}} → kebab-case
    Handlebars.registerHelper('bun-filename', (name: string) => {
      return name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    });

    // {{#ifBunFeature}}...{{/ifBunFeature}}
    Handlebars.registerHelper('ifBunFeature', (feature: string, options: any) => {
      const bunFeatures = ['sqlite', 'serve', 'file', 'test'];
      return bunFeatures.includes(feature) ? options.fn(this) : options.inverse(this);
    });
  }
}
```

#### 2. Template Registry (`src/templates/registry.ts`)
```typescript
interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: 'deploy' | 'validate' | 'manage' | 'generate';
  templatePath: string;
  outputPath: string;
  requiredVars: string[];
  optionalVars: Record<string, any>;
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'marketplace-deploy',
    name: 'Marketplace Deployment Script',
    description: 'Bun deployment script for marketplace plugins',
    category: 'deploy',
    templatePath: 'templates/deploy.hbs',
    outputPath: 'scripts/deploy.ts',
    requiredVars: ['PLUGIN_NAME', 'AUTHOR', 'VERSION'],
    optionalVars: {
      DATABASE_TYPE: 'sqlite',
      LOG_LEVEL: 'info'
    }
  },
  {
    id: 'marketplace-validate',
    name: 'Marketplace Validation Script',
    description: 'Bun validation script for plugin structure',
    category: 'validate',
    templatePath: 'templates/validate.hbs',
    outputPath: 'scripts/validate.ts',
    requiredVars: ['PLUGIN_NAME', 'VALIDATION_RULES'],
    optionalVars: {
      STRICT_MODE: true,
      AUTO_FIX: false
    }
  }
];
```

#### 3. Template Generator CLI (`src/cli/generate.ts`)
```typescript
import { Command } from 'commander';
import { TemplateManager } from '../templates/manager';
import { TEMPLATES } from '../templates/registry';

const program = new Command();

program
  .name('template-generator')
  .description('Bun-first template generator for Claude Code plugins')
  .version('1.0.0');

program
  .command('generate <template-id>')
  .description('Generate template with provided variables')
  .option('-n, --name <name>', 'Plugin name')
  .option('-a, --author <author>', 'Plugin author')
  .option('-v, --version <version>', 'Plugin version')
  .option('-o, --output <path>', 'Output directory', './generated')
  .action(async (templateId, options) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      console.error(`Template '${templateId}' not found`);
      process.exit(1);
    }

    const manager = new TemplateManager();
    await manager.initialize();

    await manager.generate(template, options);
  });
```

### Template Examples

#### Deploy Template (`templates/deploy.hbs`)
```handlebars
#!/usr/bin/env bun

/**
 * {{description}}
 * Generated on: {{currentDate}}
 * Author: {{author}}
 */

import Database from "{{bun-import databaseType}}";
import { serve } from "{{bun-import serve}}";
import { {{bun-class className}} } from "./{{bun-filename className}}";

interface {{bun-class className}}Config {
  name: string;
  version: string;
  author: string;
  {{#if databaseType}}
  database: Database;
  {{/if}}
}

export class {{bun-class className}} {
  private config: {{bun-class className}}Config;

  constructor(config: {{bun-class className}}Config) {
    this.config = config;
  }

  async deploy(): Promise<void> {
    console.log(`Deploying {{PLUGIN_NAME}} v{{VERSION}}...`);

    {{#ifBunFeature sqlite}}
    // Use Bun's built-in SQLite
    const db = new Database();
    {{/ifBunFeature}}

    {{#ifBunFeature serve}}
    // Use Bun's built-in server
    const server = serve({
      port: 3000,
      fetch: (req) => new Response("Hello from {{PLUGIN_NAME}}!")
    });
    {{/ifBunFeature}}
  }
}

// CLI interface
if (import.meta.main) {
  const deployer = new {{bun-class className}}({
    name: "{{PLUGIN_NAME}}",
    version: "{{VERSION}}",
    author: "{{AUTHOR}}"
  });

  deployer.deploy().catch(console.error);
}
```

#### Validation Template (`templates/validate.hbs`)
```handlebars
#!/usr/bin/env bun

/**
 * {{description}}
 * Generated on: {{currentDate}}
 * Validation Rules: {{VALIDATION_RULES}}
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class {{bun-class className}}Validator {
  private pluginPath: string;
  private strictMode: {{STRICT_MODE}};

  constructor(pluginPath: string, options = {}) {
    this.pluginPath = pluginPath;
    this.strictMode = options.strictMode ?? true;
  }

  async validate(): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Validate plugin.json
    await this.validatePluginJson(result);

    {{#if AUTO_FIX}}
    // Auto-fix common issues
    await this.autoFix(result);
    {{/if}}

    result.valid = result.errors.length === 0;
    return result;
  }

  private async validatePluginJson(result: ValidationResult): Promise<void> {
    const configPath = join(this.pluginPath, ".claude-plugin", "plugin.json");

    try {
      const content = await readFile(configPath, 'utf-8');
      const config = JSON.parse(content);

      // Required fields validation
      const required = ['name', 'version', 'description'];
      for (const field of required) {
        if (!config[field]) {
          result.errors.push(`Missing required field: ${field}`);
        }
      }

    } catch (error) {
      result.errors.push(`Failed to read plugin.json: ${error.message}`);
    }
  }
}

// CLI interface
if (import.meta.main) {
  const validator = new {{bun-class className}}Validator(process.argv[2] || '.');

  validator.validate()
    .then(result => {
      if (result.valid) {
        console.log("✅ Plugin validation passed");
      } else {
        console.log("❌ Plugin validation failed:");
        result.errors.forEach(error => console.log(`  - ${error}`));
      }
    })
    .catch(console.error);
}
```

### Configuration System

#### Template Configuration (`src/config/template-config.ts`)
```typescript
import { z } from 'zod';

export const TemplateConfigSchema = z.object({
  PLUGIN_NAME: z.string().min(1).max(50),
  AUTHOR: z.string().min(1).max(100),
  VERSION: z.string().regex(/^\d+\.\d+\.\d+$/),
  DESCRIPTION: z.string().optional(),
  DATABASE_TYPE: z.enum(['sqlite', 'postgres', 'mysql']).default('sqlite'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  STRICT_MODE: z.boolean().default(true),
  AUTO_FIX: z.boolean().default(false),
  OUTPUT_DIR: z.string().default('./generated'),
  TEMPLATE_DIR: z.string().default('./templates')
});

export type TemplateConfig = z.infer<typeof TemplateConfigSchema>;

export const defaultConfig: Partial<TemplateConfig> = {
  DATABASE_TYPE: 'sqlite',
  LOG_LEVEL: 'info',
  STRICT_MODE: true,
  AUTO_FIX: false,
  OUTPUT_DIR: './generated',
  TEMPLATE_DIR: './templates'
};
```

### Implementation Plan

#### Phase 1: Infrastructure Setup
1. Install dependencies: `handlebars`, `commander`, `zod`
2. Create project structure under `src/template-engine/`
3. Set up TypeScript configuration for template engine
4. Create initial template manager class

#### Phase 2: Template Migration
1. Convert existing `deploy.js` to `deploy.hbs` template
2. Convert existing `validate.js` to `validate.hbs` template
3. Create template registry with all existing scripts
4. Implement custom Handlebars helpers for Bun features

#### Phase 3: CLI Development
1. Build CLI interface using Commander.js
2. Implement interactive template generation
3. Add validation and error handling
4. Create batch generation capabilities

#### Phase 4: Integration & Testing
1. Integrate with existing project structure
2. Add comprehensive test coverage
3. Create documentation and usage examples
4. Performance optimization and caching

#### Phase 5: Migration Execution
1. Replace all Node.js scripts with Bun-first templates
2. Update documentation and README files
3. Create migration guide for plugin developers
4. Deploy to marketplace

### File Structure
```
src/template-engine/
├── templates/
│   ├── deploy.hbs
│   ├── validate.hbs
│   ├── marketplace-manager.hbs
│   └── plugin-validator.hbs
├── manager.ts
├── registry.ts
├── cli/
│   └── generate.ts
├── config/
│   └── template-config.ts
└── utils/
    └── helpers.ts
```

### Benefits

1. **Performance**: All scripts use Bun's native runtime
2. **Consistency**: Unified template system across project
3. **Type Safety**: Full TypeScript integration
4. **Maintainability**: Centralized template management
5. **Developer Experience**: CLI tools for template generation
6. **Flexibility**: Custom Handlebars helpers for Bun-specific features

## Next Steps

Ready to proceed with implementation? I can:
1. Set up a git worktree for isolated development
2. Create detailed implementation plan with task breakdown
3. Begin Phase 1: Infrastructure Setup

**Ready to start implementation?**