# Menon Marketplace

> **A collection of Claude Code plugins and skills by Eduardo Menoncello**

Built entirely with **Bun** and **TypeScript** for optimal performance and type safety.

## Overview

Menon Marketplace is a collection of high-quality plugins and skills for Claude Code. It provides comprehensive tools for plugin development, research automation, and workflow enhancement with a focus on developer productivity and code quality.

## Features

### 🚀 Core Plugins
- **Studio CC**: A comprehensive plugin development and management toolkit
- **Research Tools**: Advanced data analysis and deep research capabilities
- **Marketplace Skills**: Skills for managing and distributing Claude Code plugins

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
git clone https://github.com/menoncello/menon-marketplace.git
cd claude-code

# Install dependencies
bun install
```

### Using the Plugins

```bash
# Run tests for all plugins
bun test

# Build the research-tools plugin
bun run build

# Run specific plugin tests
bun test plugins/research-tools/
bun test plugins/studio-cc/
```

## Available Plugins

### 🔧 Studio CC
A comprehensive plugin development and management toolkit that includes:
- **Plugin Development Tools**: Templates and utilities for creating new plugins
- **Prompt Engineering**: Advanced prompt analysis and optimization engines
- **Marketplace Management**: Tools for managing Claude Code marketplace distribution

### 🔍 Research Tools
Advanced research automation with deep analysis capabilities:
- **Multi-source Research**: Aggregate information from various sources
- **Confidence Scoring**: Type-safe confidence and relevance metrics
- **Report Generation**: Automated synthesis of research findings
- **Quality Assessment**: Automated quality scoring for research sources

## Project Structure

```
claude-code/
├── plugins/                    # Plugin directory
│   ├── research-tools/         # Research automation plugin
│   │   ├── index.ts           # Main plugin entry point
│   │   ├── types/             # TypeScript type definitions
│   │   ├── skills/            # Research-specific skills
│   │   └── docs/              # Plugin documentation
│   └── studio-cc/             # Plugin development toolkit
│       ├── index.ts           # Main plugin entry point
│       ├── skills/            # Development skills
│       │   ├── prompt/        # Prompt engineering tools
│       │   ├── claude-code-plugin/     # Plugin development guides
│       │   └── claude-code-marketplace/ # Marketplace management
│       └── .claude-plugin/    # Plugin configuration
├── docs/                      # Comprehensive documentation
│   ├── ai/                    # AI-related documentation
│   └── plans/                 # Development plans and notes
├── package.json              # Project dependencies
├── tsconfig.json             # TypeScript configuration
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
  "skills": [
    "./skills/skill-name"
  ]
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
  timeout: 60000
});

// Perform research
const result = await performResearch("TypeScript best practices", config);
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
  version: "1.0.0"
});

await studio.initialize();
console.log(`Studio CC v${studio.getVersion()} initialized`);
```

## Development

### Running Tests

```bash
# Run all tests
bun test

# Run tests for specific plugin
bun test plugins/research-tools/
bun test plugins/studio-cc/

# Run tests in watch mode
bun test --watch
```

### Building

```bash
# Build research-tools plugin
bun run build

# Build specific plugin
bun build plugins/research-tools/index.ts --outdir ./dist --target bun
```

### Development Mode

```bash
# Watch mode for development
bun --watch plugins/research-tools/index.ts
bun --watch plugins/studio-cc/index.ts
```

## Available Skills

### Research Tools Skills
- **Deep Research**: Comprehensive multi-source research and analysis
- **Company Analysis**: Business intelligence and competitive analysis
- **Report Generation**: Automated synthesis and documentation

### Studio CC Skills
- **Prompt Engineering**: Analysis and optimization of prompts
- **Plugin Development**: Tools and templates for plugin creation
- **Marketplace Management**: Distribution and version management

## Documentation

### Plugin Documentation
- [Research Tools Plugin](./plugins/research-tools/README.md) - Comprehensive research automation documentation
- [Studio CC Plugin](./plugins/studio-cc/README.md) - Plugin development toolkit documentation

### Additional Resources
- [AI Development Guides](./docs/ai/) - In-depth guides for AI development with Claude Code
- [Development Plans](./docs/plans/) - Project planning and development notes
- [Research Tools Examples](./plugins/research-tools/docs/examples.md) - Usage examples and patterns
- [API Documentation](./plugins/research-tools/docs/api.md) - Detailed API reference

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
