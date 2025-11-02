# Basic Plugin Template

> A minimal Claude Code plugin template to get you started quickly

This template provides the basic structure for creating a Claude Code plugin with custom commands, skills, and configuration.

## Features

- ✅ Plugin manifest configuration
- ✅ Custom slash commands
- ✅ Agent skills
- ✅ Event hooks
- ✅ Configuration management
- ✅ Error handling and logging
- ✅ TypeScript support
- ✅ Testing framework

## Quick Start

### 1. Clone and Install

```bash
# Clone this template
git clone <template-url> my-awesome-plugin
cd my-awesome-plugin

# Install dependencies
bun install

# Update plugin information in package.json
# Update plugin manifest in .claude-plugin/plugin.json
```

### 2. Customize Plugin

Edit the following files to customize your plugin:

- `src/index.ts` - Main plugin entry point
- `src/commands/` - Custom slash commands
- `src/skills/` - Agent skills
- `.claude-plugin/plugin.json` - Plugin manifest
- `README.md` - Plugin documentation

### 3. Build and Test

```bash
# Build the plugin
bun run build

# Run tests
bun test

# Test locally
claude marketplace install ./dist
claude /my-command
```

### 4. Publish

```bash
# Build for distribution
bun run package

# Publish to marketplace
claude marketplace publish ./dist
```

## Project Structure

```
my-awesome-plugin/
├── .claude-plugin/
│   ├── plugin.json          # Plugin manifest
│   └── marketplace.json     # Marketplace configuration
├── src/
│   ├── index.ts             # Plugin entry point
│   ├── commands/            # Custom commands
│   │   ├── hello-world.ts
│   │   └── index.ts
│   ├── skills/              # Agent skills
│   │   ├── assistant.ts
│   │   └── index.ts
│   ├── hooks/               # Event hooks
│   │   ├── pre-commit.ts
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── logger.ts
│   └── types/               # TypeScript types
│       └── index.ts
├── tests/                   # Test files
├── dist/                    # Built output
├── templates/               # Code templates
├── package.json
├── tsconfig.json
├── bun.lockb
└── README.md
```

## Customization Guide

### Plugin Manifest

Update `.claude-plugin/plugin.json` with your plugin information:

```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "My awesome Claude Code plugin",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": "https://github.com/yourusername/my-awesome-plugin",
  "keywords": ["claude-code", "plugin", "productivity"],
  "engines": {
    "claude-code": ">=2.0.0"
  }
}
```

### Adding Commands

1. Create a new command file in `src/commands/`:

```typescript
// src/commands/my-command.ts
import { BaseCommand, CommandResult, CommandContext } from '../types';

export class MyCommand extends BaseCommand {
  readonly name = 'my-command';
  readonly description = 'Description of my command';
  readonly usage = '/my-command [--param=<value>]';

  async handler(
    parameters: Record<string, unknown>,
    context: CommandContext
  ): Promise<CommandResult> {
    const param = parameters.param as string || 'default';

    return this.createSuccessResult(
      `Hello from my command! Parameter: ${param}`,
      { received: param }
    );
  }
}
```

2. Export the command in `src/commands/index.ts`:

```typescript
export { MyCommand } from './my-command';
```

3. Register the command in the main plugin class:

```typescript
// src/index.ts
import { MyCommand } from './commands';

export default class MyAwesomePlugin extends BasePlugin {
  getCommands() {
    return [
      new MyCommand(),
      // ... other commands
    ];
  }
}
```

### Adding Skills

1. Create a new skill file in `src/skills/`:

```typescript
// src/skills/my-skill.ts
import { BaseSkill, SkillResult, SkillContext } from '../types';

export class MySkill extends BaseSkill {
  readonly name = 'my-skill';
  readonly description = 'Description of my skill';
  readonly triggers = [
    {
      type: 'keyword',
      pattern: 'help me',
      priority: 1,
    }
  ];

  async handler(
    input: string,
    context: SkillContext
  ): Promise<SkillResult> {
    return this.createSuccessResult(
      "I can help you with various tasks!",
      ["What would you like to know?", "How can I assist you?"]
    );
  }
}
```

2. Export and register the skill similarly to commands.

### Configuration

Add configuration options to your plugin:

```typescript
// src/types/index.ts
export interface PluginConfig {
  apiKey?: string;
  maxRetries?: number;
  enableLogging?: boolean;
}

// src/index.ts
export default class MyAwesomePlugin extends BasePlugin {
  private config: PluginConfig;

  async initialize(context: PluginContext): Promise<void> {
    this.config = context.config as PluginConfig;

    // Use configuration
    if (this.config.enableLogging) {
      context.logger.info('Logging enabled');
    }
  }

  getConfigSchema() {
    return {
      apiKey: {
        type: 'string',
        description: 'API key for external service',
        required: false,
      },
      maxRetries: {
        type: 'number',
        description: 'Maximum number of retries',
        default: 3,
      },
      enableLogging: {
        type: 'boolean',
        description: 'Enable debug logging',
        default: false,
      },
    };
  }
}
```

## Testing

Write tests for your plugin components:

```typescript
// tests/commands/my-command.test.ts
import { describe, it, expect } from 'bun:test';
import { MyCommand } from '../../src/commands/my-command';
import { createMockContext } from '../utils/mock-context';

describe('MyCommand', () => {
  it('should execute successfully with default parameter', async () => {
    const command = new MyCommand();
    const context = createMockContext();

    const result = await command.handler({}, context);

    expect(result.success).toBe(true);
    expect(result.output).toContain('Hello from my command!');
    expect(result.data).toEqual({ received: 'default' });
  });

  it('should handle custom parameter', async () => {
    const command = new MyCommand();
    const context = createMockContext();

    const result = await command.handler({ param: 'custom' }, context);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ received: 'custom' });
  });
});
```

Run tests:

```bash
bun test
```

## Best Practices

1. **Use TypeScript** for type safety and better IDE support
2. **Handle errors gracefully** with try-catch blocks and meaningful error messages
3. **Log important events** for debugging and monitoring
4. **Validate inputs** before processing
5. **Write comprehensive tests** for all functionality
6. **Document your code** with clear comments and README files
7. **Follow semantic versioning** for releases
8. **Use environment variables** for sensitive configuration

## Common Patterns

### Async Operations

```typescript
async handler(parameters: Record<string, unknown>, context: CommandContext): Promise<CommandResult> {
  try {
    const result = await this.withMonitoring(async () => {
      // Your async operation here
      return await this.processData(parameters);
    }, 'process-data');

    return this.createSuccessResult('Operation completed', result);
  } catch (error) {
    context.logger.error('Operation failed', error);
    return this.createErrorResult(error.message);
  }
}
```

### File Operations

```typescript
async readFileContent(filePath: string, context: PluginContext): Promise<string> {
  context.filesystem.require(Permission.FILE_READ);

  try {
    return await context.filesystem.readFile(filePath);
  } catch (error) {
    throw new FileSystemError(`Failed to read file: ${filePath}`, error);
  }
}
```

### Network Requests

```typescript
async fetchData(url: string, context: PluginContext): Promise<unknown> {
  context.network.require(Permission.NETWORK_REQUEST);

  try {
    const response = await context.network.get(url);
    return response.json;
  } catch (error) {
    throw new NetworkError(`Failed to fetch data from ${url}`, error);
  }
}
```

## Resources

- [Claude Code Documentation](https://docs.claude.com)
- [Plugin API Reference](../api-reference.md)
- [Best Practices Guide](../best-practices.md)
- [Community Forum](https://community.anthropic.com)

## License

This template is licensed under the MIT License. Feel free to use it for your own plugins.

## Contributing

Found an issue or want to improve the template? Please open an issue or submit a pull request on GitHub.