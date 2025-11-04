# Claude Code Plugin Installation Guide

> **Comprehensive guide to installing, configuring, and managing Claude Code plugins**

This guide covers all aspects of plugin installation, from individual plugins to enterprise-wide deployment strategies.

## Table of Contents

1. [Installation Methods](#installation-methods)
2. [Plugin Directory Structure](#plugin-directory-structure)
3. [Configuration Management](#configuration-management)
4. [Version Management](#version-management)
5. [Dependency Resolution](#dependency-resolution)
6. [Enterprise Deployment](#enterprise-deployment)
7. [Troubleshooting](#troubleshooting)

## Installation Methods

### 1. Interactive Marketplace Installation

The easiest way to install plugins is through the interactive marketplace:

```bash
claude
/plugin
```

This will open the plugin management interface where you can:

- Browse available plugins
- Search by name or category
- View plugin details and documentation
- Install with a single click

### 2. Direct Command Installation

Install plugins directly using command line:

```bash
# Install from marketplace
claude marketplace install plugin-name@marketplace-name

# Install from local directory
claude marketplace install ./my-plugin

# Install from Git repository
claude marketplace install https://github.com/user/plugin-repo.git

# Install specific version
claude marketplace install plugin-name@1.2.3
```

### 3. Configuration File Installation

Add plugins to your configuration file:

```json
// ~/.claude/settings.json
{
  "plugins": [
    "my-awesome-plugin@latest",
    "code-formatter@2.1.0",
    "database-tools@github:user/repo"
  ],
  "marketplaces": [
    "https://github.com/claude-official/marketplace",
    "https://github.com/my-company/marketplace"
  ]
}
```

### 4. Manual Installation

For development or offline installation:

```bash
# Clone plugin repository
git clone https://github.com/user/plugin-repo.git
cd plugin-repo

# Build plugin (if necessary)
npm install
npm run build

# Copy to plugins directory
cp -r . ~/.claude/plugins/plugin-name

# Restart Claude Code
claude --restart
```

## Plugin Directory Structure

### Personal Plugins

```bash
~/.claude/
├── plugins/
│   ├── plugin-1/
│   │   ├── .claude-plugin/
│   │   │   ├── plugin.json
│   │   │   └── marketplace.json
│   │   ├── commands/
│   │   ├── skills/
│   │   └── README.md
│   └── plugin-2/
├── settings.json
└── marketplaces.json
```

### Project Plugins

```bash
project-directory/
├── .claude/
│   ├── plugins/
│   │   └── project-specific-plugin/
│   ├── settings.json
│   └── skills.json
├── package.json
└── README.md
```

### Team/Enterprise Plugins

```bash
/shared-config/
├── claude-config/
│   ├── plugins/
│   │   ├── company-plugin-1/
│   │   └── company-plugin-2/
│   ├── settings.json
│   └── marketplaces.json
└── deployment/
    ├── install.sh
    └── configure.sh
```

## Configuration Management

### Settings File Structure

```json
// ~/.claude/settings.json
{
  "version": "1.0.0",
  "plugins": {
    "sources": [
      {
        "type": "marketplace",
        "name": "official",
        "url": "https://github.com/claude-official/marketplace",
        "enabled": true
      },
      {
        "type": "marketplace",
        "name": "community",
        "url": "https://github.com/claude-community/marketplace",
        "enabled": true
      },
      {
        "type": "git",
        "name": "company-plugins",
        "url": "https://github.com/my-company/claude-plugins",
        "enabled": true,
        "branch": "main"
      }
    ],
    "installed": [
      {
        "name": "code-formatter",
        "version": "2.1.0",
        "source": "official",
        "installedAt": "2024-01-15T10:30:00Z",
        "enabled": true,
        "autoUpdate": true
      },
      {
        "name": "database-tools",
        "version": "1.5.2",
        "source": "company-plugins",
        "installedAt": "2024-01-10T14:20:00Z",
        "enabled": true,
        "autoUpdate": false
      }
    ]
  },
  "permissions": {
    "allowedDomains": ["github.com", "api.github.com"],
    "allowedCommands": ["git", "npm", "node"],
    "filesystemAccess": ["read", "write"],
    "networkAccess": true
  },
  "preferences": {
    "autoUpdate": true,
    "updateSchedule": "daily",
    "backupSettings": true,
    "telemetry": false
  }
}
```

### Marketplace Configuration

```json
// ~/.claude/marketplaces.json
{
  "marketplaces": [
    {
      "name": "official",
      "displayName": "Claude Official Marketplace",
      "url": "https://github.com/claude-official/marketplace",
      "description": "Official plugins curated by Anthropic",
      "type": "github",
      "enabled": true,
      "priority": 1,
      "verification": {
        "required": true,
        "method": "signature",
        "publicKey": "https://claude.ai/keys/marketplace.pub"
      }
    },
    {
      "name": "community",
      "displayName": "Community Marketplace",
      "url": "https://github.com/claude-community/marketplace",
      "description": "Community-contributed plugins",
      "type": "github",
      "enabled": true,
      "priority": 2,
      "verification": {
        "required": false,
        "method": "none"
      }
    },
    {
      "name": "enterprise",
      "displayName": "Company Marketplace",
      "url": "https://github.mycompany.com/claude/marketplace",
      "description": "Internal company plugins",
      "type": "github",
      "enabled": true,
      "priority": 3,
      "authentication": {
        "type": "token",
        "token": "${GITHUB_TOKEN}"
      },
      "verification": {
        "required": true,
        "method": "signature",
        "publicKey": "https://internal.mycompany.com/keys/claude.pub"
      }
    }
  ]
}
```

### Environment-Specific Configuration

```json
// .claude/settings.json (project-level)
{
  "extends": "../shared-config/claude-settings.json",
  "plugins": {
    "overrides": {
      "code-formatter": {
        "enabled": true,
        "config": {
          "tabSize": 2,
          "singleQuote": true,
          "trailingComma": "es5"
        }
      }
    },
    "additional": [
      {
        "name": "project-specific-plugin",
        "version": "latest",
        "source": "local",
        "path": "./plugins/project-plugin"
      }
    ]
  },
  "environment": {
    "name": "development",
    "variables": {
      "API_URL": "http://localhost:3000",
      "DEBUG": true
    }
  }
}
```

## Version Management

### Semantic Versioning

Plugins follow semantic versioning (SemVer):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Version Constraints

```json
{
  "plugins": [
    {
      "name": "code-formatter",
      "version": "^2.1.0", // >=2.1.0, <3.0.0
      "source": "official"
    },
    {
      "name": "database-tools",
      "version": "~1.5.2", // >=1.5.2, <1.6.0
      "source": "community"
    },
    {
      "name": "security-scanner",
      "version": ">=3.0.0", // 3.0.0 or higher
      "source": "enterprise"
    },
    {
      "name": "legacy-plugin",
      "version": "1.2.3", // Exact version
      "source": "local"
    }
  ]
}
```

### Update Strategies

```json
{
  "updatePolicy": {
    "autoUpdate": {
      "enabled": true,
      "schedule": "daily",
      "timeWindow": "02:00-04:00",
      "timezone": "UTC"
    },
    "notifications": {
      "enabled": true,
      "channels": ["cli", "email"],
      "types": ["available", "installed", "failed"]
    },
    "rollback": {
      "enabled": true,
      "automatic": false,
      "backupCount": 3
    }
  }
}
```

### Dependency Resolution

Plugin dependencies are resolved using the following algorithm:

1. **Collect Dependencies**: Gather all required plugins and versions
2. **Check Conflicts**: Identify version conflicts
3. **Resolve Constraints**: Find compatible versions
4. **Install Order**: Install in dependency order
5. **Validate**: Verify all dependencies are satisfied

```json
{
  "dependencies": {
    "code-formatter": {
      "version": "^2.1.0",
      "dependencies": {
        "prettier": "^3.0.0",
        "eslint": "^8.0.0"
      }
    },
    "test-runner": {
      "version": "^1.5.0",
      "dependencies": {
        "jest": "^29.0.0",
        "code-formatter": "^2.0.0"
      }
    }
  },
  "resolved": {
    "code-formatter": "2.1.3",
    "prettier": "3.0.2",
    "eslint": "8.45.0",
    "test-runner": "1.5.1",
    "jest": "29.6.1"
  }
}
```

## Enterprise Deployment

### Centralized Configuration

Create a shared configuration repository:

```bash
company-claude-config/
├── settings.json
├── marketplaces.json
├── plugins/
│   ├── approved-plugins.json
│   └── required-plugins.json
├── scripts/
│   ├── install.sh
│   ├── update.sh
│   └── validate.sh
└── docs/
    ├── installation.md
    └── troubleshooting.md
```

### Installation Script

```bash
#!/bin/bash
# scripts/install.sh

set -euo pipefail

# Configuration
CONFIG_REPO="https://github.mycompany.com/claude-config.git"
CONFIG_DIR="$HOME/.claude-company"
PLUGINS_DIR="$HOME/.claude/plugins"
BACKUP_DIR="$HOME/.claude-backup-$(date +%Y%m%d-%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Backup existing configuration
backup_config() {
    if [ -d "$HOME/.claude" ]; then
        log "Backing up existing configuration to $BACKUP_DIR"
        cp -r "$HOME/.claude" "$BACKUP_DIR"
    fi
}

# Clone configuration repository
clone_config() {
    log "Cloning configuration repository"
    git clone "$CONFIG_REPO" "$CONFIG_DIR"
}

# Validate configuration
validate_config() {
    log "Validating configuration"

    if [ ! -f "$CONFIG_DIR/settings.json" ]; then
        error "settings.json not found in configuration"
    fi

    if [ ! -f "$CONFIG_DIR/marketplaces.json" ]; then
        error "marketplaces.json not found in configuration"
    fi

    # Validate JSON syntax
    jq empty "$CONFIG_DIR/settings.json" || error "Invalid JSON in settings.json"
    jq empty "$CONFIG_DIR/marketplaces.json" || error "Invalid JSON in marketplaces.json"
}

# Install configuration
install_config() {
    log "Installing configuration"

    # Create .claude directory if it doesn't exist
    mkdir -p "$HOME/.claude"

    # Copy configuration files
    cp "$CONFIG_DIR/settings.json" "$HOME/.claude/"
    cp "$CONFIG_DIR/marketplaces.json" "$HOME/.claude/"

    # Set proper permissions
    chmod 600 "$HOME/.claude/settings.json"
    chmod 600 "$HOME/.claude/marketplaces.json"
}

# Install required plugins
install_plugins() {
    log "Installing required plugins"

    if [ -f "$CONFIG_DIR/plugins/required-plugins.json" ]; then
        while IFS= read -r plugin; do
            if [ -n "$plugin" ] && [[ ! "$plugin" =~ ^# ]]; then
                log "Installing plugin: $plugin"
                claude marketplace install "$plugin" || warn "Failed to install plugin: $plugin"
            fi
        done < "$CONFIG_DIR/plugins/required-plugins.json"
    fi
}

# Validate installation
validate_installation() {
    log "Validating installation"

    # Check if Claude Code can access plugins
    if ! claude --help > /dev/null 2>&1; then
        error "Claude Code is not accessible"
    fi

    # Check if plugins are loaded
    local plugin_count=$(claude plugin list | wc -l)
    log "Installed $plugin_count plugins"
}

# Cleanup
cleanup() {
    log "Cleaning up temporary files"
    rm -rf "$CONFIG_DIR"
}

# Main installation process
main() {
    log "Starting Claude Code enterprise installation"

    backup_config
    clone_config
    validate_config
    install_config
    install_plugins
    validate_installation
    cleanup

    log "Installation completed successfully"
    log "Configuration backup available at: $BACKUP_DIR"
}

# Run main function
main "$@"
```

### Update Script

```bash
#!/bin/bash
# scripts/update.sh

set -euo pipefail

CONFIG_REPO="https://github.mycompany.com/claude-config.git"
CONFIG_DIR="/tmp/claude-config-update"
CURRENT_SETTINGS="$HOME/.claude/settings.json"

log() {
    echo "[INFO] $1"
}

warn() {
    echo "[WARN] $1"
}

# Check for updates
check_updates() {
    log "Checking for configuration updates"

    git clone "$CONFIG_REPO" "$CONFIG_DIR"

    if ! diff -q "$CONFIG_DIR/settings.json" "$CURRENT_SETTINGS" > /dev/null 2>&1; then
        log "Updates available"
        return 0
    else
        log "No updates available"
        return 1
    fi
}

# Apply updates
apply_updates() {
    log "Applying configuration updates"

    # Backup current settings
    cp "$CURRENT_SETTINGS" "$CURRENT_SETTINGS.backup"

    # Apply new settings
    cp "$CONFIG_DIR/settings.json" "$HOME/.claude/"
    cp "$CONFIG_DIR/marketplaces.json" "$HOME/.claude/"

    # Update plugins
    while IFS= read -r plugin; do
        if [ -n "$plugin" ] && [[ ! "$plugin" =~ ^# ]]; then
            log "Updating plugin: $plugin"
            claude marketplace update "$plugin" || warn "Failed to update plugin: $plugin"
        fi
    done < "$CONFIG_DIR/plugins/required-plugins.json"
}

# Main update process
main() {
    if check_updates; then
        apply_updates
        log "Update completed successfully"
    else
        log "No updates needed"
    fi

    # Cleanup
    rm -rf "$CONFIG_DIR"
}

main "$@"
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

# Install Claude Code
RUN npm install -g @anthropic-ai/claude-code

# Create configuration directory
RUN mkdir -p /opt/claude/.claude

# Copy configuration
COPY settings.json /opt/claude/.claude/
COPY marketplaces.json /opt/claude/.claude/

# Install plugins
RUN claude marketplace install code-formatter database-tools security-scanner

# Set working directory
WORKDIR /workspace

# Expose volume for code
VOLUME ["/workspace"]

# Default command
CMD ["claude"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  claude-code:
    build: .
    volumes:
      - ./workspace:/workspace
      - ./config:/opt/claude/.claude
    environment:
      - CLAUDE_CONFIG_DIR=/opt/claude/.claude
      - GITHUB_TOKEN=${GITHUB_TOKEN}
    stdin_open: true
    tty: true
```

## Troubleshooting

### Common Installation Issues

#### Plugin Not Found

```bash
# Check if plugin is available
claude marketplace search plugin-name

# Verify marketplace sources
claude marketplace list

# Add missing marketplace
claude marketplace add https://github.com/user/marketplace
```

#### Permission Denied

```bash
# Check file permissions
ls -la ~/.claude/plugins/

# Fix permissions
chmod -R 755 ~/.claude/
chmod 600 ~/.claude/settings.json
```

#### Version Conflicts

```bash
# Check dependency tree
claude plugin deps plugin-name

# Resolve conflicts
claude plugin resolve-conflicts

# Force reinstall
claude marketplace reinstall plugin-name
```

#### Network Issues

```bash
# Check connectivity
curl -I https://github.com

# Configure proxy
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# Use alternative marketplace
claude marketplace add https://mirror.company.com/marketplace
```

### Debug Commands

```bash
# Enable debug logging
export CLAUDE_DEBUG=true
claude --verbose

# Check plugin status
claude plugin status

# Validate configuration
claude config validate

# Reset configuration
claude config reset
```

### Log Analysis

```bash
# View installation logs
tail -f ~/.claude/logs/installation.log

# Check error logs
grep ERROR ~/.claude/logs/*.log

# Monitor plugin activity
tail -f ~/.claude/logs/plugin-activity.log
```

## Best Practices

### Security

- Only install plugins from trusted sources
- Regularly update plugins to latest versions
- Review plugin permissions before installation
- Use signed plugins when available
- Implement proper access controls

### Performance

- Limit the number of installed plugins
- Regularly clean up unused plugins
- Monitor plugin performance impact
- Use plugin caching effectively
- Optimize plugin loading order

### Maintenance

- Regularly backup configuration
- Document custom configurations
- Test plugin updates in staging
- Monitor plugin dependencies
- Keep documentation up to date

### Compliance

- Track plugin licenses
- Document plugin usage
- Implement audit logging
- Follow company policies
- Maintain change logs

---

For additional help, see the [Troubleshooting Guide](troubleshooting.md) or visit the [Community Forum](https://community.anthropic.com).
