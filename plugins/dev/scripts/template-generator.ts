#!/usr/bin/env bun

/**
 * Template Generator using Handlebars
 *
 * Usage:
 * bun run scripts/template-generator.ts [template-name] [options]
 *
 * Examples:
 * bun run scripts/template-generator.ts ai-function --name=createUser --params=userId:string,userData:object
 * bun run scripts/template-generator.ts bun-server --port=3000 --with-websocket
 * bun run scripts/template-generator.ts test-suite --component=User --with-mocks
 */

import { file, write } from "bun";
import Handlebars from "handlebars";
import { z } from "zod";

// CLI options schema
const OptionsSchema = z.object({
  template: z.string().describe('Template name to generate'),
  name: z.string().optional().describe('Function/class/server name'),
  params: z.string().optional().describe('Parameters (comma-separated: name:type)'),
  returnType: z.string().optional().describe('Return type'),
  port: z.number().optional().describe('Port for server templates'),
  host: z.string().optional().describe('Host for server templates'),
  withWebsocket: z.boolean().optional().describe('Include WebSocket support'),
  withDatabase: z.boolean().optional().describe('Include database integration'),
  withAuth: z.boolean().optional().describe('Include authentication'),
  component: z.string().optional().describe('Component name for test templates'),
  withMocks: z.boolean().optional().describe('Include mocks in test templates'),
  output: z.string().optional().describe('Output file path'),
});

type TemplateOptions = z.infer<typeof OptionsSchema>;

// Template registry
const templates = {
  'ai-function': 'templates/ai-function.hbs',
  'bun-server': 'templates/bun-server.hbs',
  'test-suite': 'templates/test-suite.hbs',
  'database-service': 'templates/database-service.hbs',
  'api-route': 'templates/api-route.hbs',
  'websocket-handler': 'templates/websocket-handler.hbs',
  'cli-command': 'templates/cli-command.hbs',
  'typescript-safe': 'templates/typescript-safe.hbs',
};

// Handlebars helpers
Handlebars.registerHelper('camelCase', (str: string) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
});

Handlebars.registerHelper('pascalCase', (str: string) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
    return word.toUpperCase();
  }).replace(/\s+/g, '');
});

Handlebars.registerHelper('kebabCase', (str: string) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase();
});

Handlebars.registerHelper('titleCase', (str: string) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
});

Handlebars.registerHelper('upperCase', (str: string) => {
  if (!str || typeof str !== 'string') return '';
  return str.toUpperCase();
});

Handlebars.registerHelper('paramList', (params: any[]) => {
  if (!Array.isArray(params)) return '';
  return params.map((param: any) => {
    if (typeof param === 'string') {
      const [name, type] = (param || '').split(':');
      return `${name}: ${type}`;
    } else if (param && param.name && param.type) {
      return `${param.name}: ${param.type}`;
    }
    return '';
  }).filter(Boolean).join(', ');
});

Handlebars.registerHelper('paramNames', (params: any[]) => {
  if (!Array.isArray(params)) return '';
  return params.map((param: any) => {
    if (typeof param === 'string') {
      const [name] = (param || '').split(':');
      return name;
    } else if (param && param.name) {
      return param.name;
    }
    return '';
  }).filter(Boolean).join(', ');
});

Handlebars.registerHelper('paramDocs', (params: any[]) => {
  if (!Array.isArray(params)) return '';
  const titleCase = (str: string) => {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
  };

  return params.map((param: any) => {
    let name: string, type: string;
    if (typeof param === 'string') {
      [name, type] = (param || '').split(':');
    } else if (param && param.name && param.type) {
      name = param.name;
      type = param.type;
    } else {
      return '';
    }

    return ` * @param {${type}} ${name} - ${titleCase(name.replace(/([A-Z])/g, ' $1').trim())}`;
  }).filter(Boolean).join('\n');
});

Handlebars.registerHelper('returnType', (returnType: string, defaultType = 'unknown') => {
  if (!returnType) return defaultType;
  if (returnType === 'object') return 'Record<string, unknown>';
  if (returnType === '[object Object]') return 'Record<string, unknown>';
  return returnType;
});

Handlebars.registerHelper('currentDate', () => {
  return new Date().toISOString().split('T')[0];
});

Handlebars.registerHelper('currentTime', () => {
  return new Date().toISOString();
});

Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
Handlebars.registerHelper('ne', (a: unknown, b: unknown) => a !== b);
Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
Handlebars.registerHelper('lt', (a: number, b: number) => a < b);

/**
 * Parse parameter string into array
 */
function parseParams(paramStr?: string): Array<{ name: string; type: string; docs: string }> {
  if (!paramStr) return [];

  return paramStr.split(',').map(param => {
    const [name, type] = param.trim().split(':');
    return {
      name: name?.trim() || 'param',
      type: type?.trim() || 'unknown',
      docs: name ? `${name.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}` : 'parameter'
    };
  });
}

/**
 * Generate template from Handlebars file
 */
async function generateTemplate(templateName: string, options: TemplateOptions): Promise<string> {
  const templatePath = templates[templateName as keyof typeof templates];

  if (!templatePath) {
    throw new Error(`Unknown template: ${templateName}. Available: ${Object.keys(templates).join(', ')}`);
  }

  // Read template file
  const templateContent = await file(`./plugins/dev/${templatePath}`).text();
  const template = Handlebars.compile(templateContent);

  // Parse parameters for template usage
  const parsedParams = parseParams(options.params);
  const paramStrings = options.params ? options.params.split(',').map(p => p.trim()) : [];

  // Prepare context
  const context = {
    ...options,
    params: parsedParams,
    paramStrings,
    hasParams: Boolean(options.params),
    currentDate: new Date().toISOString().split('T')[0],
    currentTime: new Date().toISOString(),
    timestamp: Date.now(),
    randomId: Math.random().toString(36).substring(2, 15),
  };

  return template(context);
}

/**
 * Write generated content to file
 */
async function writeTemplate(content: string, outputPath: string): Promise<void> {
  try {
    await write(outputPath, content);
    console.log(`✅ Template generated: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Failed to write template to ${outputPath}:`, error);
    throw error;
  }
}

/**
 * Generate output filename based on template and options
 */
function generateOutputPath(templateName: string, options: TemplateOptions): string {
  if (options.output) return options.output;

  const name = options.name || templateName;

  switch (templateName) {
    case 'ai-function':
      return `${name}.ts`;
    case 'bun-server':
      return `${name}-server.ts`;
    case 'test-suite':
      return `${name}.test.ts`;
    case 'database-service':
      return `${name}-service.ts`;
    case 'api-route':
      return `${name}-route.ts`;
    case 'websocket-handler':
      return `${name}-ws.ts`;
    case 'cli-command':
      return `${name}-cli.ts`;
    default:
      return `${name}.ts`;
  }
}

/**
 * Parse CLI arguments
 */
function parseArgs(args: string[]): TemplateOptions {
  const options: Partial<TemplateOptions> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const keyAndValue = arg.substring(2);

      if (keyAndValue.includes('=')) {
        // --key=value format
        const [key, value] = keyAndValue.split('=', 2);
        if (key === 'port') {
          (options as any)[key] = parseInt(value);
        } else {
          (options as any)[key] = value;
        }
      } else {
        // --key value format
        const key = keyAndValue;
        const nextArg = args[i + 1];

        if (!nextArg || nextArg.startsWith('--')) {
          // Boolean flag
          (options as any)[key] = true;
        } else {
          // Value flag
          if (key === 'port' || key === 'host') {
            (options as any)[key] = key === 'port' ? parseInt(nextArg) : nextArg;
          } else {
            (options as any)[key] = nextArg;
          }
          i++; // Skip the next argument as it's a value
        }
      }
    } else if (!options.template) {
      // First non-flag argument is the template name
      options.template = arg;
    }
  }

  return options as TemplateOptions;
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.log(`
🔧 Template Generator for AI-Safe Development

Usage: bun run scripts/template-generator.ts <template-name> [options]

Available Templates:
${Object.entries(templates).map(([key]) => `  - ${key}`).join('\n')}

Options:
  --name <name>           Function/class/server name
  --params <list>         Parameters (name:type,name:type)
  --returnType <type>     Return type
  --port <number>         Port for server templates
  --host <string>         Host for server templates
  --withWebsocket         Include WebSocket support
  --withDatabase          Include database integration
  --withAuth              Include authentication
  --component <name>      Component name for test templates
  --withMocks             Include mocks in test templates
  --output <path>         Output file path

Examples:
  bun run scripts/template-generator.ts ai-function --name=createUser --params="userId:string,userData:object"
  bun run scripts/template-generator.ts bun-server --name=api --port=3000 --withWebsocket --withDatabase
  bun run scripts/template-generator.ts test-suite --component=User --withMocks
      `);
      process.exit(0);
    }

    const options = parseArgs(args);

    // Validate options
    const validated = OptionsSchema.parse(options);

    console.log(`🔄 Generating template: ${validated.template}`);

    // Generate template
    const content = await generateTemplate(validated.template, validated);

    // Write to file
    const outputPath = generateOutputPath(validated.template, validated);
    await writeTemplate(content, outputPath);

    console.log(`\n📋 Template Summary:`);
    console.log(`   Name: ${validated.name || validated.template}`);
    console.log(`   Type: ${validated.template}`);
    console.log(`   Output: ${outputPath}`);

    if (validated.params) {
      console.log(`   Parameters: ${validated.params}`);
    }

    if (validated.port) {
      console.log(`   Port: ${validated.port}`);
    }

    console.log(`\n🚀 Template generated successfully!`);

  } catch (error) {
    console.error('❌ Error generating template:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}

export { generateTemplate, parseParams, generateOutputPath };
export type { TemplateOptions };