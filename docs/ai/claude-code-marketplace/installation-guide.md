# Claude Code Market: Installation & Setup Guide

> **Quick Reference**: Essential commands and setup processes for Claude Code Market

## Quick Start Commands

### Essential Setup (5 minutes)

```bash
# 1. Add official Anthropic skills marketplace
/plugin marketplace add anthropics/skills

# 2. Browse available plugins and skills
/plugin

# 3. Install core document processing skills
/plugin install document-skills@anthropic-agent-skills

# 4. Install example skills for learning
/plugin install example-skills@anthropic-agent-skills

# 5. Verify installation
/help
```

### Common Installation Patterns

#### Official Skills Installation
```bash
# Add official marketplace
/plugin marketplace add anthropics/skills

# Install individual skills
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills
/plugin install agent-sdk-verifier@anthropic-agent-skills
```

#### Community Marketplace Installation
```bash
# Install from GitHub repository
/plugin marketplace add owner/repo-name

# Install from specific plugin
/plugin install plugin-name@marketplace-name

# Example: Community plugins
/plugin marketplace add ivan-magda/claude-code-plugin-template
/plugin marketplace add davila7/claude-code-templates
```

#### Local Development Setup
```bash
# Add local marketplace for development
/plugin marketplace add ./my-marketplace

# Install local plugin
/plugin install my-plugin@local

# Test installation
/help
```

## Marketplace Management

### Adding Marketplaces

#### Official Sources
```bash
# Anthropic official skills
/plugin marketplace add anthropics/skills

# Template repositories
/plugin marketplace add ivan-magda/claude-code-plugin-template
/plugin marketplace add davila7/claude-code-templates
```

#### Community Sources
```bash
# GitHub repositories
/plugin marketplace add travisvn/awesome-claude-skills
/plugin marketplace add hesreallyhim/awesome-claude-code

# Git repositories (any git host)
/plugin marketplace add https://gitlab.com/company/plugins.git
```

#### Local Development
```bash
# Local directory containing marketplace.json
/plugin marketplace add ./my-marketplace

# Direct path to marketplace file
/plugin marketplace add ./path/to/marketplace.json

# Relative path from current directory
/plugin marketplace add ../shared-marketplace
```

### Managing Marketplaces

```bash
# List all installed marketplaces
/plugin marketplace list

# Update marketplace metadata
/plugin marketplace update anthropic/skills
/plugin marketplace update my-local-marketplace

# Remove marketplace
/plugin marketplace remove old-marketplace

# Refresh all marketplaces
/plugin marketplace update --all
```

## Plugin Installation

### Browsing Available Plugins

```bash
# Show interactive plugin browser
/plugin

# List plugins from specific marketplace
/plugin --marketplace anthropic/skills

# Search for plugins
/plugin search document
/plugin search mcp
/plugin search skill
```

### Installing Plugins

```bash
# Install with interactive selection
/plugin

# Install specific plugin
/plugin install document-skills@anthropic-agent-skills

# Install specific version
/plugin install plugin-name@marketplace-name@version

# Install latest version
/plugin install plugin-name@marketplace-name@latest
```

### Plugin Management

```bash
# List installed plugins
/plugin list

# Show plugin details
/plugin info document-skills

# Uninstall plugin
/plugin uninstall document-skills

# Update plugin
/plugin update document-skills

# Update all plugins
/plugin update --all
```

## Skills Installation

### Understanding Skill Types

#### Personal Skills (Global)
- **Location**: `~/.claude/skills/`
- **Scope**: Available across all projects
- **Use Case**: Personal workflows and preferences

#### Project Skills (Repository-specific)
- **Location**: `.claude/skills/`
- **Scope**: Shared with team via git
- **Use Case**: Team-specific workflows

#### Plugin Skills (Bundled)
- **Location**: Bundled with installed plugins
- **Scope**: Available when plugin is installed
- **Use Case**: Distributable skill packages

### Manual Skill Installation

#### Personal Skills
```bash
# Create personal skills directory
mkdir -p ~/.claude/skills

# Copy skill to personal directory
cp -r my-skill ~/.claude/skills/

# Verify skill is available
/skill-list
```

#### Project Skills
```bash
# Create project skills directory
mkdir -p .claude/skills

# Add skill to project
cp -r my-skill .claude/skills/

# Commit to repository
git add .claude/skills/my-skill
git commit -m "Add my-skill to project"
```

### Skill Verification

```bash
# List all available skills
/skill-list

# Show skill details
/skill-info my-skill

# Test skill functionality
"Test my new skill"

# Check skill loading
/status
```

## MCP Server Installation

### Understanding MCP Servers

MCP (Model Context Protocol) servers enable Claude to connect to external tools and services.

### Installing MCP Servers

#### Via Package Managers
```bash
# Install via npm
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-filesystem

# Install via pip
pip install mcp-server-sqlite
pip install mcp-server-postgres
```

#### Manual Installation
```bash
# Clone MCP server repository
git clone https://github.com/modelcontextprotocol/servers.git

# Install specific server
cd servers/src/github
npm install
npm link
```

### Configuring MCP Servers

#### Claude Code Configuration
```json
// ~/.claude/settings.json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["path/to/github-server.js"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token"
      }
    },
    "filesystem": {
      "command": "node",
      "args": ["path/to/filesystem-server.js", "/allowed/path"]
    }
  }
}
```

## Verification and Testing

### Installation Verification

```bash
# Check Claude Code version
claude --version

# Verify marketplace access
/plugin marketplace list

# Check installed plugins
/plugin list

# Verify skill availability
/skill-list

# Test command availability
/help
```

### Functionality Testing

```bash
# Test basic Claude Code functionality
"Hello, can you help me with a simple task?"

# Test plugin commands
/my-plugin-command

# Test skill functionality
"Use the document-skill to analyze this file"

# Test MCP server integration
"Search GitHub for repositories about Claude Code"
```

### Troubleshooting Commands

```bash
# Check Claude Code status
/status

# Show detailed plugin information
/plugin info --verbose plugin-name

# Show skill loading information
/skill-info --verbose skill-name

# Check MCP server connections
/mcp-status

# Show configuration
/config show
```

## Configuration Management

### Settings File Locations

#### Global Settings
- **Location**: `~/.claude/settings.json`
- **Scope**: All Claude Code sessions
- **Use Case**: Personal preferences and global configurations

#### Project Settings
- **Location**: `.claude/settings.json`
- **Scope**: Current project/repository
- **Use Case**: Project-specific configurations

### Common Configuration Options

```json
{
  "defaultModel": "claude-3-5-sonnet-20241022",
  "permissions": {
    "allowedTools": ["Read", "Write", "Bash", "WebFetch"],
    "allowedDomains": ["github.com", "docs.claude.com"]
  },
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["path/to/github-server.js"]
    }
  },
  "plugins": {
    "autoUpdate": true,
    "betaFeatures": false
  }
}
```

## Security Considerations

### Permission Management

```bash
# Review current permissions
/permissions

# Set restrictive permissions
/permissions --restrictive

# Allow specific tools
/permissions --allow Read,Write,WebFetch

# Allow specific domains
/permissions --domains github.com,docs.claude.com
```

### Security Best Practices

1. **Review Plugin Permissions**: Always review plugin permissions before installation
2. **Use Trusted Sources**: Install plugins only from trusted repositories
3. **Regular Updates**: Keep plugins and skills updated
4. **Minimal Permissions**: Grant only necessary permissions
5. **Audit Regularly**: Periodically review installed plugins and skills

## Common Issues and Solutions

### Installation Issues

#### Permission Denied
```bash
# Check file permissions
ls -la ~/.claude/

# Fix permissions if needed
chmod 755 ~/.claude/
chmod 644 ~/.claude/settings.json
```

#### Network Issues
```bash
# Check network connectivity
curl -I https://api.github.com

# Try alternative marketplace
/plugin marketplace add https://mirror.example.com/marketplace.json
```

#### Plugin Not Found
```bash
# Update marketplace metadata
/plugin marketplace update marketplace-name

# Search for alternative plugins
/plugin search similar-keyword
```

### Skill Loading Issues

#### Skill Not Appearing
```bash
# Check skill file structure
ls -la ~/.claude/skills/my-skill/

# Verify SKILL.md format
head ~/.claude/skills/my-skill/SKILL.md

# Restart Claude Code
# Exit and restart Claude Code
```

#### Skill Not Working
```bash
# Check skill permissions
/skill-info --verbose my-skill

# Test skill manually
"Test the my-skill functionality"

# Check for syntax errors
# Review SKILL.md for formatting issues
```

## Getting Help

### Official Resources
- **Documentation**: https://docs.claude.com
- **GitHub Issues**: https://github.com/anthropics/claude-code/issues
- **Community Discord**: Official Anthropic Discord

### Community Resources
- **Reddit**: r/ClaudeAI
- **GitHub Discussions**: Community Q&A
- **Awesome Lists**: Community-curated resources

### Debug Commands

```bash
# Enable debug mode
claude --debug

# Show detailed logs
claude --verbose

# Check configuration
/config show --verbose

# Test installation
/plugin test plugin-name
```

---

## Quick Reference Cheat Sheet

### Essential Commands
```bash
/plugin marketplace add anthropics/skills          # Add official marketplace
/plugin install document-skills@anthropic-agent-skills  # Install core skills
/help                                              # Show available commands
/skill-list                                        # List available skills
```

### Management Commands
```bash
/plugin marketplace list                          # List marketplaces
/plugin list                                      # List installed plugins
/plugin update --all                              # Update all plugins
/permissions                                      # Review permissions
```

### Development Commands
```bash
/plugin marketplace add ./my-marketplace          # Add local marketplace
/plugin install my-plugin@local                   # Install local plugin
/skill-info my-skill                              # Check skill details
/config show                                      # Show configuration
```

---

*This guide provides the essential commands and procedures for installing and managing Claude Code Market components. For detailed information, refer to the main documentation.*