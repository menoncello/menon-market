# Studio CC

Claude Code Plugin Studio - A comprehensive plugin development and management toolkit.

## Overview

Studio CC is a powerful plugin development environment for Claude Code that provides tools, templates, and utilities for creating, managing, and deploying Claude Code plugins and skills.

## Features

### Built-in Skills

- **claude-code-plugin**: Comprehensive plugin development guidance
- **prompt**: Advanced prompt crafting and optimization
- **claude-code-marketplace**: Marketplace creation and management

### Plugin Structure

Studio CC follows the standard Claude Code plugin structure:

```
studio-cc/
├── .claude-plugin/
│   ├── plugin.json          # Plugin metadata
│   └── marketplace.json     # Distribution config
├── skills/                  # Agent skills
│   ├── claude-code-plugin/
│   ├── prompt/
│   └── claude-code-marketplace/
├── commands/                # Custom slash commands
├── agents/                  # Custom agents
├── hooks/                   # Event handlers
├── mcp/                     # MCP server configs
├── scripts/                 # Helper scripts
├── templates/               # Code templates
├── tests/                   # Test files
├── index.ts                 # Main plugin entry point
├── package.json             # Node.js dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## Installation

### From Marketplace

```bash
claude marketplace install studio-cc
```

### From Git Repository

```bash
claude marketplace install https://github.com/menoncello/studio-cc.git
```

### From Local Directory

```bash
claude marketplace install ./studio-cc
```

## Usage

Once installed, Studio CC provides several skills and commands to help with plugin development:

### Skills

1. **Plugin Development Expert**: Use when creating, maintaining, or troubleshooting Claude Code plugins
2. **Advanced Prompt Crafter**: Use for sophisticated prompt engineering and optimization
3. **Marketplace Expert**: Use for creating and managing marketplace plugins

### Development Workflow

1. Initialize a new plugin project
2. Use the built-in skills for guidance
3. Leverage templates for common patterns
4. Test with built-in debugging tools
5. Deploy to marketplace or distribute directly

## Configuration

Studio CC can be configured through the standard Claude Code plugin configuration system:

```json
{
  "plugins": {
    "studio-cc": {
      "enabled": true,
      "developmentMode": true,
      "debugLogging": false
    }
  }
}
```

## Development

### Prerequisites

- Bun >= 1.0.0
- Claude Code >= 1.0.0
- TypeScript >= 5.0.0

### Local Development

```bash
# Clone the repository
git clone https://github.com/menoncello/studio-cc.git
cd studio-cc

# Install dependencies
bun install

# Run in development mode
bun run dev

# Run tests
bun test

# Build for distribution
bun run build
```

### Code Quality

```bash
# Run linting
bun run lint

# Type checking
bun run type-check
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- GitHub Issues: [Report bugs and request features](https://github.com/menoncello/studio-cc/issues)
- Documentation: [Full documentation](https://github.com/menoncello/studio-cc/wiki)
- Discussions: [Community discussions](https://github.com/menoncello/studio-cc/discussions)

## Acknowledgments

- Built with [Bun](https://bun.sh)
- Powered by [Claude Code](https://claude.ai/claude-code)
- Inspired by the Claude Code plugin ecosystem
