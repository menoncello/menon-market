# Claude Code Plugin Development Guide

> **Comprehensive guide to creating, installing, and managing Claude Code plugins and skills**

This guide provides everything you need to know about developing plugins and skills for Claude Code, from basic concepts to advanced implementation patterns.

## Table of Contents

### Getting Started

- [Overview](#overview)
- [Plugin vs Skills](#plugin-vs-skills)
- [Prerequisites](#prerequisites)

### Development Guides

- [Creation Guide](creation-guide.md) - How to create plugins step by step
- [Installation Guide](installation-guide.md) - Installation methods and procedures
- [Best Practices](best-practices.md) - Development standards and optimization

### Resources

- [API Reference](api-reference.md) - Complete API documentation
- [Templates](templates/) - Starter templates for different plugin types
- [Examples](examples/) - Complete plugin examples
- [Troubleshooting](troubleshooting.md) - Common issues and solutions

## Overview

Claude Code plugins extend the functionality of Claude Code through a structured system that supports:

- **Custom Commands**: Slash commands for specialized workflows
- **Agent Skills**: Model-invoked extensions for specific tasks
- **MCP Integration**: Model Context Protocol for external tool connections
- **Event Hooks**: Automated responses to system events
- **Custom Agents**: Specialized AI agents for specific domains

### Key Features

- **Modular Architecture**: Components can be developed and distributed independently
- **Multi-scope Support**: Personal, project, and team-level installations
- **Rich Integration**: Support for external APIs, databases, and tools
- **Version Management**: Semantic versioning and dependency resolution
- **Security**: Permission management and sandboxed execution

## Plugin vs Skills

### Plugins

Plugins are comprehensive packages that can contain multiple components:

- Custom slash commands
- Agent skills
- MCP servers
- Event hooks
- Configuration files

### Skills

Skills are focused capabilities that:

- Contain a single SKILL.md file with instructions
- Are model-invoked based on context and user needs
- Can be bundled with plugins or standalone
- Focus on specific tasks or workflows

## Prerequisites

### System Requirements

- **Claude Code**: Latest version with plugin support
- **Node.js/Bun**: For plugin development and build processes
- **Git**: For version control and distribution
- **Text Editor**: VS Code recommended with Claude Code extension

### Development Environment

```bash
# Verify Claude Code installation
claude --version

# Initialize development environment
mkdir my-plugin
cd my-plugin
npm init -y  # or bun init
```

### Required Knowledge

- **JavaScript/TypeScript**: Core plugin development
- **Markdown**: For command and skill documentation
- **JSON**: For manifest and configuration files
- **Git**: For version control and distribution
- **CLI Tools**: For command-line interface development

## Quick Start

### 1. Create Plugin Structure

```bash
mkdir my-first-plugin
cd my-first-plugin
mkdir -p .claude-plugin commands skills agents hooks
```

### 2. Create Plugin Manifest

```json
{
  "name": "my-first-plugin",
  "version": "1.0.0",
  "description": "My first Claude Code plugin",
  "author": "Your Name",
  "license": "MIT",
  "repository": "https://github.com/username/my-first-plugin"
}
```

### 3. Add a Custom Command

Create `commands/hello.md`:

```markdown
---
name: hello
description: 'Say hello with a custom message'
---

Hello! This is a custom command from my first plugin.
```

### 4. Install Plugin

```bash
claude marketplace install ./my-first-plugin
```

### 5. Test Your Plugin

```bash
claude
/hello
```

## Architecture Overview

```
my-plugin/
├── .claude-plugin/
│   ├── plugin.json          # Plugin metadata
│   └── marketplace.json     # Distribution config
├── commands/                # Custom slash commands
│   ├── command1.md
│   └── command2.md
├── skills/                  # Agent skills
│   └── my-skill/
│       └── SKILL.md
├── agents/                  # Custom agents
│   └── custom-agent.json
├── hooks/                   # Event handlers
│   └── hooks.json
├── mcp/                     # MCP server configs
│   └── server.json
├── scripts/                 # Helper scripts
├── templates/               # Code templates
└── README.md               # Plugin documentation
```

## Next Steps

1. **Read the [Creation Guide](creation-guide.md)** to learn detailed plugin development
2. **Explore [Templates](templates/)** for starter code
3. **Review [Best Practices](best-practices.md)** for quality standards
4. **Check [Examples](examples/)** for complete implementations
5. **Reference the [API Documentation](api-reference.md)** for technical details

## Community & Support

- **GitHub Discussions**: Community Q&A and discussions
- **Documentation**: Official Claude Code documentation
- **Examples**: Community-contributed plugins and skills
- **Issues**: Bug reports and feature requests

## Contributing

Contributions to this guide are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

---

_This guide is maintained by the Claude Code community and updated regularly with the latest features and best practices._
