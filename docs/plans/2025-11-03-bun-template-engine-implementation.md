# Bun-First Template Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a comprehensive template engine system to migrate all Node.js scripts to Bun-first architecture using Handlebars.js with TypeScript support.

**Architecture:** Template Manager class with custom Handlebars helpers for Bun-specific features, CLI-based template generation, and configuration-driven template registry with validation.

**Tech Stack:** Bun runtime, TypeScript, Handlebars.js, Commander.js, Zod for validation

---

## Task 1: Setup Project Infrastructure

**Files:**
- Create: `src/template-engine/package.json`
- Create: `src/template-engine/tsconfig.json`
- Create: `src/template-engine/.gitignore`
- Test: N/A (Infrastructure setup)

**Step 1: Create package.json for template engine**

```json
{
  "name": "bun-template-engine",
  "version": "1.0.0",
  "module": "index.ts",
  "type": "module",
  "dependencies": {
    "handlebars": "^4.7.8",
    "commander": "^11.1.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/handlebars": "^4.0.40"
  },
  "scripts": {
    "build": "bun build ./cli/generate.ts --outdir ./dist --target bun",
    "dev": "bun --watch ./cli/generate.ts",
    "test": "bun test"
  }
}
```

**Step 2: Create TypeScript configuration**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./",
    "types": ["bun-types"]
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create .gitignore**

```
node_modules/
dist/
*.log
.env
.DS_Store
```

**Step 4: Install dependencies**

Run: `bun install`
Expected: Dependencies installed successfully

**Step 5: Commit infrastructure setup**

```bash
git add src/template-engine/
git commit -m "feat: setup template engine infrastructure with Bun, TypeScript, and dependencies"
```

---

## Task 2: Create Template Manager Core

**Files:**
- Create: `src/template-engine/manager.ts`
- Create: `src/template-engine/manager.test.ts`
- Test: `src/template-engine/manager.test.ts`

**Step 1: Write failing test for template manager initialization**

```typescript
import { test, expect } from "bun:test";
import { TemplateManager } from "./manager";

test("TemplateManager initializes with Bun helpers", async () => {
  const manager = new TemplateManager();
  await manager.initialize();

  const template = manager.compile("{{bun-import 'sqlite'}}");
  const result = template({});

  expect(result).toBe("bun:sqlite");
});
```

**Step 2: Run test to verify it fails**

Run: `bun test src/template-engine/manager.test.ts`
Expected: FAIL with "TemplateManager not defined"

**Step 3: Write minimal TemplateManager implementation**

```typescript
import Handlebars from "handlebars";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export class TemplateManager {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  async initialize(): Promise<void> {
    await this.registerBunHelpers();
    await this.loadTemplates();
  }

  private async registerBunHelpers(): Promise<void> {
    Handlebars.registerHelper('bun-import', (pkg: string) => {
      return pkg.startsWith('bun:') ? pkg : `bun:${pkg}`;
    });
  }

  compile(templateString: string): HandlebarsTemplateDelegate {
    return Handlebars.compile(templateString);
  }

  async generate(templateId: string, variables: Record<string, any>): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template '${templateId}' not found`);
    }
    return template(variables);
  }
}
```

**Step 4: Run test to verify it passes**

Run: `bun test src/template-engine/manager.test.ts`
Expected: PASS

**Step 5: Add more Bun helper tests and implementation**

```typescript
test("TemplateManager handles bun-class helper", async () => {
  const manager = new TemplateManager();
  await manager.initialize();

  const template = manager.compile("{{bun-class 'my-plugin'}}");
  const result = template({});

  expect(result).toBe("MyPlugin");
});

test("TemplateManager handles bun-filename helper", async () => {
  const manager = new TemplateManager();
  await manager.initialize();

  const template = manager.compile("{{bun-filename 'MyClass'}}");
  const result = template({});

  expect(result).toBe("my-class");
});
```

**Step 6: Implement remaining helpers**

```typescript
// Add to registerBunHelpers method
Handlebars.registerHelper('bun-class', (name: string) => {
  return name.split('-').map(part =>
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join('');
});

Handlebars.registerHelper('bun-filename', (name: string) => {
  return name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
});

Handlebars.registerHelper('ifBunFeature', (feature: string, options: any) => {
  const bunFeatures = ['sqlite', 'serve', 'file', 'test'];
  return bunFeatures.includes(feature) ? options.fn(this) : options.inverse(this);
});
```

**Step 7: Run tests to verify all pass**

Run: `bun test src/template-engine/manager.test.ts`
Expected: All tests PASS

**Step 8: Commit TemplateManager core**

```bash
git add src/template-engine/manager.ts src/template-engine/manager.test.ts
git commit -m "feat: implement TemplateManager core with Bun-specific Handlebars helpers"
```

---

## Task 3: Create Template Registry

**Files:**
- Create: `src/template-engine/registry.ts`
- Create: `src/template-engine/registry.test.ts`
- Test: `src/template-engine/registry.test.ts`

**Step 1: Write failing test for template registry**

```typescript
import { test, expect } from "bun:test";
import { TEMPLATES, getTemplate } from "./registry";

test("Template registry contains marketplace-deploy template", () => {
  const template = getTemplate('marketplace-deploy');

  expect(template).toBeDefined();
  expect(template.id).toBe('marketplace-deploy');
  expect(template.category).toBe('deploy');
  expect(template.requiredVars).toContain('PLUGIN_NAME');
});
```

**Step 2: Run test to verify it fails**

Run: `bun test src/template-engine/registry.test.ts`
Expected: FAIL with "registry module not found"

**Step 3: Write template registry implementation**

```typescript
export interface TemplateDefinition {
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

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: TemplateDefinition['category']): TemplateDefinition[] {
  return TEMPLATES.filter(t => t.category === category);
}
```

**Step 4: Run test to verify it passes**

Run: `bun test src/template-engine/registry.test.ts`
Expected: PASS

**Step 5: Add more comprehensive registry tests**

```typescript
test("Template registry filters by category", () => {
  const deployTemplates = getTemplatesByCategory('deploy');
  const validateTemplates = getTemplatesByCategory('validate');

  expect(deployTemplates).toHaveLength(1);
  expect(validateTemplates).toHaveLength(1);
  expect(deployTemplates[0].id).toBe('marketplace-deploy');
});

test("Template registry handles missing template", () => {
  const template = getTemplate('non-existent');
  expect(template).toBeUndefined();
});
```

**Step 6: Run tests to verify all pass**

Run: `bun test src/template-engine/registry.test.ts`
Expected: All tests PASS

**Step 7: Commit template registry**

```bash
git add src/template-engine/registry.ts src/template-engine/registry.test.ts
git commit -m "feat: implement template registry with definitions for deploy and validate scripts"
```

---

## Task 4: Create Configuration System

**Files:**
- Create: `src/template-engine/config/template-config.ts`
- Create: `src/template-engine/config/template-config.test.ts`
- Test: `src/template-engine/config/template-config.test.ts`

**Step 1: Write failing test for configuration validation**

```typescript
import { test, expect } from "bun:test";
import { TemplateConfigSchema, validateConfig } from "./template-config";

test("Validates correct configuration", () => {
  const config = {
    PLUGIN_NAME: 'test-plugin',
    AUTHOR: 'Test Author',
    VERSION: '1.0.0',
    DATABASE_TYPE: 'sqlite'
  };

  const result = validateConfig(config);
  expect(result.success).toBe(true);
});

test("Rejects invalid version format", () => {
  const config = {
    PLUGIN_NAME: 'test-plugin',
    AUTHOR: 'Test Author',
    VERSION: '1.0' // Invalid format
  };

  const result = validateConfig(config);
  expect(result.success).toBe(false);
  expect(result.errors).toContain('Invalid version format');
});
```

**Step 2: Run test to verify it fails**

Run: `bun test src/template-engine/config/template-config.test.ts`
Expected: FAIL with "config module not found"

**Step 3: Write configuration system implementation**

```typescript
import { z } from "zod";

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

export function validateConfig(config: unknown): {
  success: boolean;
  data?: TemplateConfig;
  errors?: string[]
} {
  try {
    const data = TemplateConfigSchema.parse(config);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

export function mergeWithDefaults(config: Partial<TemplateConfig>): TemplateConfig {
  return TemplateConfigSchema.parse({ ...defaultConfig, ...config });
}
```

**Step 4: Run test to verify it passes**

Run: `bun test src/template-engine/config/template-config.test.ts`
Expected: PASS

**Step 5: Add more configuration tests**

```typescript
test("Merges configuration with defaults", () => {
  const partialConfig = {
    PLUGIN_NAME: 'test-plugin',
    AUTHOR: 'Test Author',
    VERSION: '1.0.0'
  };

  const result = mergeWithDefaults(partialConfig);

  expect(result.DATABASE_TYPE).toBe('sqlite');
  expect(result.LOG_LEVEL).toBe('info');
  expect(result.STRICT_MODE).toBe(true);
});
```

**Step 6: Run tests to verify all pass**

Run: `bun test src/template-engine/config/template-config.test.ts`
Expected: All tests PASS

**Step 7: Commit configuration system**

```bash
git add src/template-engine/config/
git commit -m "feat: implement configuration system with Zod validation and defaults"
```

---

## Task 5: Create Deploy Template

**Files:**
- Create: `src/template-engine/templates/deploy.hbs`
- Test: N/A (Template file)

**Step 1: Create Handlebars deploy template**

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

**Step 2: Commit deploy template**

```bash
git add src/template-engine/templates/deploy.hbs
git commit -m "feat: add Bun-first deploy template with Handlebars placeholders"
```

---

## Task 6: Integrate Template Loading in Manager

**Files:**
- Modify: `src/template-engine/manager.ts`
- Modify: `src/template-engine/manager.test.ts`
- Test: `src/template-engine/manager.test.ts`

**Step 1: Write failing test for template loading**

```typescript
test("TemplateManager loads and generates deploy template", async () => {
  const manager = new TemplateManager();
  await manager.initialize();

  const variables = {
    PLUGIN_NAME: 'test-plugin',
    AUTHOR: 'Test Author',
    VERSION: '1.0.0',
    description: 'Test deployment script',
    currentDate: new Date().toISOString(),
    className: 'TestPlugin',
    databaseType: 'sqlite'
  };

  const result = await manager.generate('marketplace-deploy', variables);

  expect(result).toContain('#!/usr/bin/env bun');
  expect(result).toContain('bun:sqlite');
  expect(result).toContain('TestPlugin');
  expect(result).toContain('test-plugin');
});
```

**Step 2: Run test to verify it fails**

Run: `bun test src/template-engine/manager.test.ts`
Expected: FAIL with "generate method needs implementation"

**Step 3: Implement template loading in manager**

```typescript
// Add to TemplateManager class
private async loadTemplates(): Promise<void> {
  const templatesDir = join(process.cwd(), 'src', 'template-engine', 'templates');

  const files = await readdir(templatesDir);
  const templateFiles = files.filter(file => file.endsWith('.hbs'));

  for (const file of templateFiles) {
    const templatePath = join(templatesDir, file);
    const templateContent = await readFile(templatePath, 'utf-8');
    const templateName = file.replace('.hbs', '');

    const compiled = Handlebars.compile(templateContent);
    this.templates.set(templateName, compiled);
  }
}

// Update generate method to handle different template names
async generate(templateId: string, variables: Record<string, any>): Promise<string> {
  const templateDef = getTemplate(templateId);
  if (!templateDef) {
    throw new Error(`Template '${templateId}' not found in registry`);
  }

  const templateName = templateDef.templatePath.replace('templates/', '').replace('.hbs', '');
  const template = this.templates.get(templateName);

  if (!template) {
    throw new Error(`Template '${templateName}' not loaded`);
  }

  return template(variables);
}
```

**Step 4: Run test to verify it passes**

Run: `bun test src/template-engine/manager.test.ts`
Expected: PASS

**Step 5: Commit template loading integration**

```bash
git add src/template-engine/manager.ts src/template-engine/manager.test.ts
git commit -m "feat: integrate template loading and generation in TemplateManager"
```

---

## Task 7: Create CLI Interface

**Files:**
- Create: `src/template-engine/cli/generate.ts`
- Create: `src/template-engine/cli/generate.test.ts`
- Test: `src/template-engine/cli/generate.test.ts`

**Step 1: Write failing test for CLI command**

```typescript
import { test, expect } from "bun:test";
import { program } from "./generate";

test("CLI program has generate command", () => {
  const commands = program.commands.map(cmd => cmd.name());
  expect(commands).toContain('generate');
});
```

**Step 2: Run test to verify it fails**

Run: `bun test src/template-engine/cli/generate.test.ts`
Expected: FAIL with "CLI module not found"

**Step 3: Write CLI implementation**

```typescript
#!/usr/bin/env bun

import { Command } from "commander";
import { TemplateManager } from "../manager";
import { getTemplate, validateConfig } from "../config/template-config";
import { writeFileSync } from "node:fs";

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
  .option('-d, --description <description>', 'Plugin description')
  .action(async (templateId, options) => {
    try {
      const template = getTemplate(templateId);
      if (!template) {
        console.error(`❌ Template '${templateId}' not found`);
        console.log('Available templates:');
        // List available templates
        process.exit(1);
      }

      // Build variables from CLI options
      const variables = {
        PLUGIN_NAME: options.name,
        AUTHOR: options.author,
        VERSION: options.version,
        description: options.description || `${options.name} deployment script`,
        currentDate: new Date().toISOString(),
        className: options.name.split('-').map(part =>
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join(''),
        databaseType: 'sqlite'
      };

      // Validate required variables
      const validation = validateConfig(variables);
      if (!validation.success) {
        console.error('❌ Configuration validation failed:');
        validation.errors?.forEach(error => console.error(`  - ${error}`));
        process.exit(1);
      }

      // Initialize template manager
      const manager = new TemplateManager();
      await manager.initialize();

      // Generate template
      const result = await manager.generate(templateId, variables);

      // Write to file
      const outputPath = join(options.output, template.outputPath);
      writeFileSync(outputPath, result);

      console.log(`✅ Generated ${templateId} template at ${outputPath}`);

    } catch (error) {
      console.error('❌ Generation failed:', error.message);
      process.exit(1);
    }
  });

// Add list command
program
  .command('list')
  .description('List available templates')
  .action(() => {
    console.log('Available templates:');
    // List templates from registry
  });

if (import.meta.main) {
  program.parse();
}

export { program };
```

**Step 4: Run test to verify it passes**

Run: `bun test src/template-engine/cli/generate.test.ts`
Expected: PASS

**Step 5: Add more CLI tests**

```typescript
test("CLI program has list command", () => {
  const commands = program.commands.map(cmd => cmd.name());
  expect(commands).toContain('list');
});
```

**Step 6: Run tests to verify all pass**

Run: `bun test src/template-engine/cli/generate.test.ts`
Expected: All tests PASS

**Step 7: Commit CLI interface**

```bash
git add src/template-engine/cli/
git commit -m "feat: implement CLI interface with generate and list commands"
```

---

## Task 8: Create Validation Template

**Files:**
- Create: `src/template-engine/templates/validate.hbs`
- Modify: `src/template-engine/manager.ts` (update loadTemplates)
- Test: N/A (Template file)

**Step 1: Create Handlebars validate template**

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

**Step 2: Update template registry to include validate template variables**

```typescript
// Update marketplace-validate template in TEMPLATES array
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
    AUTO_FIX: false,
    DESCRIPTION: 'Plugin validation script'
  }
}
```

**Step 3: Commit validation template**

```bash
git add src/template-engine/templates/validate.hbs src/template-engine/registry.ts
git commit -m "feat: add validation template with configurable strict mode and auto-fix"
```

---

## Task 9: Integration Testing

**Files:**
- Create: `src/template-engine/integration.test.ts`
- Test: `src/template-engine/integration.test.ts`

**Step 1: Write comprehensive integration test**

```typescript
import { test, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { TemplateManager } from "./manager";
import { validateConfig } from "./config/template-config";

let tempDir: string;
let manager: TemplateManager;

beforeEach(async () => {
  tempDir = join(process.cwd(), 'temp-test-' + Date.now());
  await mkdir(tempDir, { recursive: true });
  manager = new TemplateManager();
  await manager.initialize();
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

test("Full template generation workflow", async () => {
  // Test configuration validation
  const config = {
    PLUGIN_NAME: 'integration-test-plugin',
    AUTHOR: 'Test Author',
    VERSION: '1.0.0',
    DATABASE_TYPE: 'sqlite',
    STRICT_MODE: true,
    AUTO_FIX: false
  };

  const validation = validateConfig(config);
  expect(validation.success).toBe(true);

  // Test template generation
  const templateVariables = {
    ...config,
    description: 'Integration test plugin',
    currentDate: new Date().toISOString(),
    className: 'IntegrationTestPlugin'
  };

  // Test deploy template generation
  const deployResult = await manager.generate('marketplace-deploy', templateVariables);

  expect(deployResult).toContain('#!/usr/bin/env bun');
  expect(deployResult).toContain('bun:sqlite');
  expect(deployResult).toContain('IntegrationTestPlugin');
  expect(deployResult).toContain('integration-test-plugin');

  // Test validate template generation
  const validateResult = await manager.generate('marketplace-validate', {
    ...templateVariables,
    VALIDATION_RULES: 'strict'
  });

  expect(validateResult).toContain('#!/usr/bin/env bun');
  expect(validateResult).toContain('IntegrationTestPluginValidator');
  expect(validateResult).toContain('strictMode: true');
});

test("Template generation with missing required variables", async () => {
  const incompleteConfig = {
    PLUGIN_NAME: 'test-plugin',
    // Missing required AUTHOR and VERSION
  };

  const validation = validateConfig(incompleteConfig);
  expect(validation.success).toBe(false);
  expect(validation.errors).toBeDefined();
});

test("Template generation with invalid data", async () => {
  const invalidConfig = {
    PLUGIN_NAME: 'test-plugin',
    AUTHOR: 'Test Author',
    VERSION: '1.0.0.0' // Invalid version format
  };

  const validation = validateConfig(invalidConfig);
  expect(validation.success).toBe(false);
});
```

**Step 2: Run integration tests**

Run: `bun test src/template-engine/integration.test.ts`
Expected: All tests PASS

**Step 3: Commit integration tests**

```bash
git add src/template-engine/integration.test.ts
git commit -m "feat: add comprehensive integration tests for template engine"
```

---

## Task 10: Documentation and Usage Examples

**Files:**
- Create: `src/template-engine/README.md`
- Create: `src/template-engine/examples/usage-examples.md`
- Test: N/A (Documentation)

**Step 1: Create main README**

```markdown
# Bun Template Engine

Bun-first template engine for Claude Code plugin development with Handlebars.js.

## Features

- 🚀 **Bun-native**: Built specifically for Bun runtime
- 📝 **Handlebars Templates**: Powerful templating with custom helpers
- 🔧 **TypeScript Support**: Full type safety and validation
- 🛠️ **CLI Tools**: Command-line interface for template generation
- ✅ **Configuration Validation**: Zod-based configuration validation

## Quick Start

### Installation

```bash
bun install
```

### Generate a Template

```bash
# Generate deployment script
bun run cli/generate.ts generate marketplace-deploy \
  --name "my-plugin" \
  --author "Your Name" \
  --version "1.0.0" \
  --description "My awesome plugin"

# Generate validation script
bun run cli/generate.ts generate marketplace-validate \
  --name "my-plugin" \
  --author "Your Name" \
  --version "1.0.0"

# List available templates
bun run cli/generate.ts list
```

### Programmatic Usage

```typescript
import { TemplateManager } from './manager';
import { validateConfig } from './config/template-config';

// Initialize template manager
const manager = new TemplateManager();
await manager.initialize();

// Validate configuration
const config = validateConfig({
  PLUGIN_NAME: 'my-plugin',
  AUTHOR: 'Your Name',
  VERSION: '1.0.0'
});

if (config.success) {
  // Generate template
  const result = await manager.generate('marketplace-deploy', config.data);
  console.log(result);
}
```

## Custom Helpers

### `{{bun-import "sqlite"}}`
Converts package names to Bun import format.
- Input: `"sqlite"` → Output: `"bun:sqlite"`
- Input: `"bun:serve"` → Output: `"bun:serve"`

### `{{bun-class "my-plugin"}}`
Converts kebab-case to PascalCase for class names.
- Input: `"my-plugin"` → Output: `"MyPlugin"`

### `{{bun-filename "MyClass"}}`
Converts PascalCase to kebab-case for filenames.
- Input: `"MyClass"` → Output: `"my-class"`

### `{{#ifBunFeature "sqlite"}}...{{/ifBunFeature}}`
Conditional blocks for Bun-specific features.
- Supported features: `"sqlite"`, `"serve"`, `"file"`, `"test"`

## Configuration

All templates accept these configuration variables:

### Required
- `PLUGIN_NAME`: Plugin name (kebab-case)
- `AUTHOR`: Plugin author name
- `VERSION`: Semantic version (x.y.z)

### Optional
- `DATABASE_TYPE`: `"sqlite"` | `"postgres"` | `"mysql"` (default: `"sqlite"`)
- `LOG_LEVEL`: `"debug"` | `"info"` | `"warn"` | `"error"` (default: `"info"`)
- `STRICT_MODE`: boolean (default: `true`)
- `AUTO_FIX`: boolean (default: `false`)

## Testing

```bash
bun test
```

## Development

```bash
# Watch mode for development
bun run dev

# Build for production
bun run build
```
```

**Step 2: Create usage examples**

```markdown
# Usage Examples

## Basic Template Generation

### Generate Deployment Script

```bash
bun run cli/generate.ts generate marketplace-deploy \
  --name "research-tools" \
  --author "Eduardo Menoncello" \
  --version "1.0.0" \
  --description "Research automation plugin"
```

This creates a file `scripts/deploy.ts` with:

```typescript
#!/usr/bin/env bun
import Database from "bun:sqlite";
import { ResearchTools } from "./research-tools";

export class ResearchTools {
  // ... implementation
}
```

### Generate Validation Script

```bash
bun run cli/generate.ts generate marketplace-validate \
  --name "research-tools" \
  --author "Eduardo Menoncello" \
  --version "1.0.0"
```

## Programmatic Usage

### Advanced Template Generation

```typescript
import { TemplateManager } from './manager';
import { mergeWithDefaults } from './config/template-config';

async function generateCustomTemplate() {
  const manager = new TemplateManager();
  await manager.initialize();

  const config = mergeWithDefaults({
    PLUGIN_NAME: 'custom-plugin',
    AUTHOR: 'Your Name',
    VERSION: '2.1.0',
    DATABASE_TYPE: 'postgres',
    STRICT_MODE: false
  });

  const result = await manager.generate('marketplace-deploy', {
    ...config,
    currentDate: new Date().toISOString(),
    className: 'CustomPlugin',
    description: 'Custom plugin with PostgreSQL'
  });

  // Write to custom location
  await Bun.write('./custom-deploy.ts', result);
}
```

### Custom Template Creation

```typescript
// Create custom template
const customTemplate = `
#!/usr/bin/env bun
/**
 * {{description}}
 * Generated: {{currentDate}}
 */

export class {{bun-class className}} {
  constructor() {
    console.log('{{PLUGIN_NAME}} v{{VERSION}} initialized');
  }
}
`;

// Compile and use
const template = Handlebars.compile(customTemplate);
const result = template({
  PLUGIN_NAME: 'my-plugin',
  VERSION: '1.0.0',
  className: 'MyPlugin',
  description: 'Custom plugin',
  currentDate: new Date().toISOString()
});
```

## Migration from Node.js

### Converting Existing Scripts

1. **Replace require statements:**
   ```javascript
   // Old Node.js
   const fs = require("fs");
   const path = require("path");

   // New Bun
   import { readFile, writeFile } from "node:fs";
   import { join } from "node:path";
   ```

2. **Update shebang:**
   ```bash
   # Old
   #!/usr/bin/env node

   # New
   #!/usr/bin/env bun
   ```

3. **Use Bun APIs:**
   ```typescript
   // Instead of external packages
   import Database from "bun:sqlite";
   import { serve } from "bun:serve";
   import { file } from "bun";
   ```

### Batch Migration

```typescript
async function migrateAllScripts() {
  const manager = new TemplateManager();
  await manager.initialize();

  const plugins = [
    { name: 'research-tools', author: 'Eduardo', version: '1.0.0' },
    { name: 'studio-cc', author: 'Eduardo', version: '1.0.0' }
  ];

  for (const plugin of plugins) {
    // Generate deploy script
    await manager.generate('marketplace-deploy', {
      PLUGIN_NAME: plugin.name,
      AUTHOR: plugin.author,
      VERSION: plugin.version,
      currentDate: new Date().toISOString(),
      className: plugin.name.split('-').map(part =>
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join('')
    });

    // Generate validate script
    await manager.generate('marketplace-validate', {
      PLUGIN_NAME: plugin.name,
      AUTHOR: plugin.author,
      VERSION: plugin.version,
      VALIDATION_RULES: 'strict'
    });
  }
}
```
```

**Step 3: Commit documentation**

```bash
git add src/template-engine/README.md src/template-engine/examples/
git commit -m "docs: add comprehensive documentation and usage examples"
```

---

## Task 11: Performance Optimization and Caching

**Files:**
- Modify: `src/template-engine/manager.ts`
- Create: `src/template-engine/utils/cache.ts`
- Test: `src/template-engine/utils/cache.test.ts`

**Step 1: Write failing test for caching**

```typescript
import { test, expect } from "bun:test";
import { TemplateCache } from "./cache";

test("Template cache stores and retrieves compiled templates", () => {
  const cache = new TemplateCache();
  const templateString = "Hello {{name}}!";
  const compiled = (input: any) => `Hello ${input.name}!`;

  cache.set('test-template', compiled);
  const retrieved = cache.get('test-template');

  expect(retrieved).toBe(compiled);
});

test("Template cache returns undefined for missing keys", () => {
  const cache = new TemplateCache();
  const result = cache.get('non-existent');
  expect(result).toBeUndefined();
});
```

**Step 2: Run test to verify it fails**

Run: `bun test src/template-engine/utils/cache.test.ts`
Expected: FAIL with "cache module not found"

**Step 3: Implement caching system**

```typescript
export class TemplateCache {
  private cache: Map<string, HandlebarsTemplateDelegate> = new Map();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 100, ttlMs = 300000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttlMs;
  }

  set(key: string, template: HandlebarsTemplateDelegate): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, template);

    // Set TTL cleanup
    setTimeout(() => {
      this.cache.delete(key);
    }, this.ttl);
  }

  get(key: string): HandlebarsTemplateDelegate | undefined {
    return this.cache.get(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}
```

**Step 4: Update TemplateManager to use caching**

```typescript
// Add to TemplateManager class
private cache: TemplateCache;

constructor(options = {}) {
  this.cache = new TemplateCache(options.maxSize, options.ttl);
}

private async loadTemplates(): Promise<void> {
  const templatesDir = join(process.cwd(), 'src', 'template-engine', 'templates');

  const files = await readdir(templatesDir);
  const templateFiles = files.filter(file => file.endsWith('.hbs'));

  for (const file of templateFiles) {
    const templatePath = join(templatesDir, file);
    const templateContent = await readFile(templatePath, 'utf-8');
    const templateName = file.replace('.hbs', '');

    // Check cache first
    let compiled = this.cache.get(templateName);

    if (!compiled) {
      compiled = Handlebars.compile(templateContent);
      this.cache.set(templateName, compiled);
    }

    this.templates.set(templateName, compiled);
  }
}
```

**Step 5: Run tests to verify they pass**

Run: `bun test src/template-engine/utils/cache.test.ts`
Expected: All tests PASS

**Step 6: Commit caching system**

```bash
git add src/template-engine/utils/cache.ts src/template-engine/utils/cache.test.ts src/template-engine/manager.ts
git commit -m "feat: add template caching system for improved performance"
```

---

## Task 12: Final Integration and Validation

**Files:**
- Modify: `src/template-engine/package.json` (add scripts)
- Create: `src/template-engine/.env.example`
- Test: All tests

**Step 1: Update package.json with final scripts**

```json
{
  "scripts": {
    "build": "bun build ./cli/generate.ts --outdir ./dist --target bun",
    "dev": "bun --watch ./cli/generate.ts",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage",
    "lint": "bun lint",
    "lint:fix": "bun lint --fix",
    "typecheck": "bun tsc --noEmit",
    "generate:deploy": "bun run cli/generate.ts generate marketplace-deploy",
    "generate:validate": "bun run cli/generate.ts generate marketplace-validate",
    "list": "bun run cli/generate.ts list"
  }
}
```

**Step 2: Create environment example file**

```bash
# Template Engine Configuration
TEMPLATE_DIR=./templates
OUTPUT_DIR=./generated
CACHE_SIZE=100
CACHE_TTL=300000

# Logging
LOG_LEVEL=info
DEBUG=false

# Development
NODE_ENV=development
```

**Step 3: Run complete test suite**

```bash
bun test
```

Expected: All tests PASS

**Step 4: Run type checking**

```bash
bun tsc --noEmit
```

Expected: No type errors

**Step 5: Test CLI functionality**

```bash
# Test list command
bun run cli/generate.ts list

# Test template generation
bun run cli/generate.ts generate marketplace-deploy --name "test-plugin" --author "Test" --version "1.0.0"
```

Expected: Commands execute successfully

**Step 6: Final commit**

```bash
git add .
git commit -m "feat: complete Bun-first template engine implementation

- Template manager with custom Handlebars helpers
- Template registry with deploy and validate templates
- Configuration system with Zod validation
- CLI interface with generate and list commands
- Comprehensive test coverage and documentation
- Caching system for improved performance

Ready for migration of existing Node.js scripts to Bun"
```

---

## Migration Tasks

### Migrate Existing Node.js Scripts

**Files to migrate:**
- `plugins/studio-cc/skills/claude-code-marketplace/templates/standard/scripts/deploy.js` → Use template
- `plugins/studio-cc/skills/claude-code-marketplace/templates/standard/scripts/validate.js` → Use template
- `plugins/studio-cc/skills/claude-code-marketplace/scripts/marketplace-manager.js` → Create template
- `plugins/studio-cc/skills/claude-code-plugin/scripts/plugin-validator.js` → Create template

**Migration Steps:**
1. Generate templates for each existing script
2. Compare output with original functionality
3. Update references to use generated scripts
4. Remove original Node.js scripts
5. Update documentation to reflect new workflow

### Success Criteria

- [ ] All Node.js scripts replaced with Bun-first templates
- [ ] Template engine generates working Bun scripts
- [ ] CLI tools function correctly
- [ ] Full test coverage maintained
- [ ] Documentation updated
- [ ] Performance improvements realized

---

**Plan complete and saved to `docs/plans/2025-11-03-bun-template-engine-implementation.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**