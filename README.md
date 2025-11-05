# Menon Marketplace

> **A comprehensive ecosystem of Claude Code plugins, agents, and development tools by Eduardo Menoncello**

Built entirely with **Bun** and **TypeScript** for optimal performance and type safety.

## Overview

Menon Marketplace is a comprehensive ecosystem of high-quality plugins, agents, and development tools for Claude Code. It provides comprehensive solutions for plugin development, research automation, AI-safe coding practices, and workflow enhancement with a focus on developer productivity and code quality.

## Features

### 🚀 Core Plugins (4)

- **Studio CC**: A comprehensive plugin development and management toolkit
- **Research Tools**: Advanced data analysis and deep research capabilities
- **Menon Core**: Core functionality plugin for the menon ecosystem
- **Dev Plugin**: Enhanced development toolkit with AI-safe code generation

### 🤖 Agents (1)

- **Orchestrator**: Advanced orchestration agent for managing subagents, commands, MCP servers, and skills

### 🛠️ Technical Stack

- **Runtime**: Bun (JavaScript all-in-one toolkit)
- **Language**: TypeScript with strict configuration and type safety
- **Architecture**: Modular plugin system with standardized interfaces
- **Testing**: Comprehensive test coverage with Bun test runner
- **Build**: Bun bundler with optimized production builds

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/menoncello/marketplace.git
cd marketplace

# Install dependencies
bun install

# Build all components
bun run build:all

# Validate the marketplace
bun run validate
```

### Using the Plugins

```bash
# Run tests for all plugins and agents
bun test

# Run tests with coverage
bun run test:coverage

# Run tests in watch mode during development
bun run test:watch

# Run specific component tests
bun test:research-tools
bun test:studio-cc
bun test:menon-core
bun test:orchestrator

# Validate individual components
bun run validate:plugins
bun run validate:agents
bun run validate:marketplace
```

## Available Components

### 🔧 Studio CC Plugin

A comprehensive plugin development and management toolkit that includes:

- **Plugin Development Tools**: Templates and utilities for creating new plugins
- **Prompt Engineering**: Advanced prompt analysis and optimization engines
- **Marketplace Management**: Tools for managing Claude Code marketplace distribution
- **Agent Creation**: Tools for creating and managing Claude Code agents

**Skills**:
- `claude-code-plugin`: Comprehensive plugin development expertise
- `claude-code-marketplace`: Marketplace creation and management capabilities
- `prompt`: Advanced prompt engineering and management
- `agent-creator`: AI agent generation and configuration tools

### 🔍 Research Tools Plugin

Advanced research automation with deep analysis capabilities:

- **Multi-source Research**: Aggregate information from various sources
- **Confidence Scoring**: Type-safe confidence and relevance metrics
- **Report Generation**: Automated synthesis of research findings
- **Quality Assessment**: Automated quality scoring for research sources

**Skills**:
- `web-search`: Advanced web search and information gathering
- `content-analysis`: Deep content analysis and extraction
- `information-extraction`: Intelligent information extraction and synthesis

### 🛠️ Menon Core Plugin

Core functionality plugin for the menon ecosystem:

- **Orchestration Support**: Core orchestration capabilities
- **Resource Management**: Advanced resource optimization
- **Agent Coordination**: Multi-agent management and coordination

**Agents**:
- `orchestrator`: Advanced orchestration agent for managing subagents, commands, MCP servers, and skills

### 🚀 Dev Plugin

Enhanced development toolkit with AI-safe code generation:

- **AI-Safe Templates**: Handlebars-powered templates with AI-safe patterns
- **Quality Gates**: Automated validation against 232+ ESLint rules
- **Bun.js Integration**: Performance optimizations and native API usage
- **Code Analysis**: Real-time code quality scoring and analysis

**Skills**:
- `bunjs`: Comprehensive Bun.js development guidance
- `ai-safe-development`: AI-assisted development best practices

### 🤖 Orchestrator Agent

Advanced orchestration agent for managing complex workflows:

- **Multi-Agent Management**: Coordinate multiple specialized agents
- **Resource Optimization**: Intelligent resource allocation and optimization
- **Task Planning**: Advanced task decomposition and planning
- **Command Execution**: Sophisticated command and workflow management

**Skills**:
- `orchestration-management`: Comprehensive orchestration capabilities
- `resource-optimizer`: Advanced resource optimization algorithms

## Project Structure

```
marketplace/
├── plugins/                    # Plugin directory
│   ├── research-tools/         # Research automation plugin
│   │   ├── index.ts           # Main plugin entry point
│   │   ├── types/             # TypeScript type definitions
│   │   ├── skills/            # Research-specific skills
│   │   ├── docs/              # Plugin documentation
│   │   └── tests/             # Test files
│   ├── studio-cc/             # Plugin development toolkit
│   │   ├── index.ts           # Main plugin entry point
│   │   ├── skills/            # Development skills
│   │   │   ├── prompt/        # Prompt engineering tools
│   │   │   ├── claude-code-plugin/     # Plugin development guides
│   │   │   ├── claude-code-marketplace/ # Marketplace management
│   │   │   └── agent-creator/  # Agent creation tools
│   │   ├── tests/             # Test files
│   │   └── .claude-plugin/    # Plugin configuration
│   ├── menon-core/            # Core functionality plugin
│   │   ├── index.ts           # Main plugin entry point
│   │   ├── agents/            # Agent implementations
│   │   │   └── orchestrator/  # Orchestration agent
│   │   └── tests/             # Test files
│   └── dev/                   # Development toolkit plugin
│       ├── index.ts           # Main plugin entry point
│       ├── skills/            # Development skills
│       │   └── bunjs/         # Bun.js development guidance
│       ├── templates/         # Code generation templates
│       ├── commands/          # CLI commands
│       └── tests/             # Test files
├── docs/                      # Comprehensive documentation
│   ├── ai/                    # AI-related documentation
│   └── plans/                 # Development plans and notes
├── scripts/                   # Build and utility scripts
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── eslint.config.js          # ESLint configuration
├── MARKETPLACE.md            # Marketplace overview and status
└── README.md                 # This file
```

## Plugin Configuration

### Plugin Structure

Each plugin follows the standard Claude Code plugin structure:

```json
{
  "name": "plugin-name",
  "description": "Plugin description",
  "version": "1.0.0",
  "author": {
    "name": "Author Name",
    "email": "author@example.com"
  },
  "license": "MIT",
  "repository": "https://github.com/author/plugin.git",
  "skills": ["./skills/skill-name"]
}
```

### Plugin Interface

All plugins export a standard interface:

```typescript
export interface PluginConfig {
  version: string;
  developmentMode?: boolean;
  debugLogging?: boolean;
  // Plugin-specific configuration options
}

export class PluginClass {
  constructor(config: Partial<PluginConfig> = {});
  async initialize(): Promise<void>;
  getVersion(): string;
  getConfig(): PluginConfig;
  updateConfig(newConfig: Partial<PluginConfig>): void;
  async cleanup(): Promise<void>;
}
```

## Usage Examples

### Research Tools Plugin

```typescript
import { initialize, performResearch, defaultConfig } from './plugins/research-tools/index.ts';

// Initialize with custom configuration
const config = initialize({
  enableDeepResearch: true,
  maxSources: 25,
  outputFormat: 'markdown',
  timeout: 60000,
});

// Perform research
const result = await performResearch('TypeScript best practices', config);
console.log(`Research completed with ${result.sources.length} sources`);
console.log(`Confidence score: ${result.confidence}`);
```

### Studio CC Plugin

```typescript
import StudioCC from './plugins/studio-cc/index.ts';

// Initialize plugin studio
const studio = new StudioCC({
  developmentMode: true,
  debugLogging: true,
  version: '1.0.0',
});

await studio.initialize();
console.log(`Studio CC v${studio.getVersion()} initialized`);
```

## Development

### Running Tests

```bash
# Run all tests
bun test

# Run tests with coverage
bun run test:coverage

# Run tests in watch mode
bun run test:watch

# Run tests for specific components
bun test:research-tools
bun test:studio-cc
bun test:menon-core
bun test:orchestrator

# Run tests for specific directories
bun test plugins/research-tools/
bun test plugins/studio-cc/
bun test plugins/menon-core/
bun test plugins/menon-core/agents/orchestrator/
```

### Building

```bash
# Build all components
bun run build:all

# Build specific components
bun run build:research-tools
bun run build:studio-cc
bun run build:menon-core
bun run build:orchestrator

# Manual build with Bun
bun build plugins/research-tools/index.ts --outdir ./dist --target bun
```

### Development Mode

```bash
# Development mode for components
bun run dev
bun run dev:research-tools
bun run dev:studio-cc
bun run dev:menon-core
bun run dev:orchestrator

# Watch mode for manual development
bun --watch plugins/research-tools/index.ts
bun --watch plugins/studio-cc/index.ts
bun --watch plugins/menon-core/index.ts
```

### Code Quality

```bash
# Lint all code
bun run lint

# Fix linting issues
bun run lint:fix

# Generate lint reports
bun run lint:report

# Format code
bun run format

# Type checking
bun run type-check
```

## Available Skills

### Research Tools Skills

- **web-search**: Advanced web search and information gathering with multiple sources
- **content-analysis**: Deep content analysis and intelligent extraction
- **information-extraction**: Automated information synthesis and structuring

### Studio CC Skills

- **claude-code-plugin**: Comprehensive plugin development expertise and guidance
- **claude-code-marketplace**: Marketplace creation, management, and distribution
- **prompt**: Advanced prompt engineering, analysis, and optimization
- **agent-creator**: AI agent generation, configuration, and management tools

### Menon Core Skills

- **orchestration-management**: Comprehensive orchestration capabilities for complex workflows
- **resource-optimizer**: Advanced resource optimization and allocation algorithms

### Dev Plugin Skills

- **bunjs**: Comprehensive Bun.js development guidance and best practices
- **ai-safe-development**: AI-assisted development with quality gates and validation

### Orchestrator Agent Skills

- **orchestration-management**: Multi-agent coordination and workflow management
- **resource-optimizer**: Intelligent resource allocation and performance optimization

## Documentation

### Component Documentation

- [Research Tools Plugin](./plugins/research-tools/README.md) - Research automation documentation
- [Studio CC Plugin](./plugins/studio-cc/README.md) - Plugin development toolkit documentation
- [Menon Core Plugin](./plugins/menon-core/README.md) - Core functionality documentation
- [Dev Plugin](./plugins/dev/README.md) - AI-safe development toolkit documentation
- [Orchestrator Agent](./plugins/menon-core/agents/orchestrator/README.md) - Orchestration agent documentation

### Marketplace Documentation

- [Marketplace Overview](./MARKETPLACE.md) - Complete marketplace status and component listing
- [Component Validation](./scripts/) - Validation and build scripts documentation

### Additional Resources

- [AI Development Guides](./docs/ai/) - In-depth guides for AI development with Claude Code
- [Development Plans](./docs/plans/) - Project planning and development notes
- [Research Tools Examples](./plugins/research-tools/docs/) - Usage examples and patterns
- [Skill Documentation](./plugins/*/skills/*/SKILL.md) - Individual skill documentation and usage guides

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `bun test`
6. Ensure all tests pass and code follows project standards
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Submit a Pull Request

### Code Standards

- **English Only**: All code, comments, documentation, and communication must be in English
- **TypeScript**: Use strict TypeScript configuration with proper type definitions
- **Testing**: Maintain high test coverage with Bun test runner
- **ESLint**: Follow ESLint rules without using inline disables
- **Code Quality**: Write clean, readable code without lazy workarounds

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## About

Created and maintained by Eduardo Menoncello. Built with ❤️ using Bun and TypeScript.

### Repository Structure

- **Main Repository**: https://github.com/menoncello/menon-marketplace
- **Plugin Distribution**: Available through Claude Code marketplace
- **Issue Tracking**: Use GitHub Issues for bug reports and feature requests

---

**Note**: This plugin collection is designed specifically for Claude Code and follows all best practices for Bun and TypeScript development.
