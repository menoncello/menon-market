# Claude Code Plugin Troubleshooting Guide

This guide provides solutions to common problems encountered when developing, installing, or using Claude Code plugins.

## Installation Issues

### Plugin Not Found

**Symptoms**: Plugin cannot be found in marketplace or installation fails with "plugin not found" error.

**Causes**:

- Incorrect plugin name or marketplace
- Marketplace not configured properly
- Network connectivity issues
- Plugin repository not accessible

**Solutions**:

```bash
# Check available marketplaces
claude marketplace list

# Search for the plugin
claude marketplace search plugin-name

# Add missing marketplace
claude marketplace add https://github.com/marketplace-url

# Verify marketplace connectivity
curl -I https://github.com/marketplace-url

# Install with full specification
claude marketplace install plugin-name@marketplace-name
```

**Debug Steps**:

1. Verify marketplace configuration in `~/.claude/settings.json`
2. Check network connectivity
3. Validate plugin name spelling
4. Confirm plugin exists in specified marketplace

### Permission Denied During Installation

**Symptoms**: Installation fails with permission errors.

**Causes**:

- Insufficient file system permissions
- Protected directories
- Antivirus software blocking installation

**Solutions**:

```bash
# Check directory permissions
ls -la ~/.claude/
ls -la ~/.claude/plugins/

# Fix permissions (use with caution)
chmod -R 755 ~/.claude/
chmod 600 ~/.claude/settings.json

# Install in alternative directory
mkdir -p ~/claude-plugins
export CLAUDE_PLUGIN_DIR=~/claude-plugins
claude marketplace install plugin-name
```

### Version Conflicts

**Symptoms**: Installation fails due to version conflicts with dependencies.

**Causes**:

- Incompatible dependency versions
- Semantic versioning constraints
- Circular dependencies

**Solutions**:

```bash
# Check dependency tree
claude plugin deps plugin-name

# Force specific version
claude marketplace install plugin-name@1.2.3

# Resolve conflicts automatically
claude plugin resolve-conflicts

# Clean installation
claude plugin uninstall plugin-name
claude marketplace install plugin-name --force
```

## Runtime Errors

### Plugin Loading Failures

**Symptoms**: Plugin fails to load during startup.

**Causes**:

- Missing dependencies
- Code syntax errors
- Initialization failures

**Debug Commands**:

```bash
# Enable debug logging
export CLAUDE_DEBUG=true
claude --verbose

# Check plugin status
claude plugin list
claude plugin status plugin-name

# Load plugin manually
claude plugin load plugin-name --debug

# Check logs
tail -f ~/.claude/logs/plugin-loading.log
```

**Example Debug Code**:

```typescript
// plugin-loader.ts
class PluginLoader {
  async loadPlugin(pluginPath: string): Promise<Plugin> {
    try {
      console.log(`Loading plugin from: ${pluginPath}`);

      // Validate manifest
      const manifest = await this.loadManifest(pluginPath);
      console.log(`Plugin manifest loaded: ${manifest.name}@${manifest.version}`);

      // Check dependencies
      await this.checkDependencies(manifest);
      console.log('Dependencies verified');

      // Load plugin module
      const PluginClass = await import(path.join(pluginPath, manifest.main));
      const plugin = new PluginClass.default(manifest);

      // Initialize plugin
      await plugin.initialize(this.createPluginContext(manifest));
      console.log(`Plugin initialized successfully: ${manifest.name}`);

      return plugin;
    } catch (error) {
      console.error(`Failed to load plugin from ${pluginPath}:`, error);
      throw error;
    }
  }
}
```

### Command Execution Failures

**Symptoms**: Plugin commands fail to execute or return errors.

**Debug Steps**:

```bash
# Execute command with debug information
claude /command-name --param=value --debug

# Check command registration
claude plugin commands plugin-name

# Test command in isolation
claude plugin test-command plugin-name command-name --params '{"key":"value"}'
```

**Error Handling Template**:

```typescript
// command-handler.ts
class CommandHandler {
  async handleCommand(
    command: Command,
    parameters: Record<string, unknown>,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      context.logger.debug(`Executing command: ${command.name}`, { parameters });

      // Validate parameters
      await this.validateParameters(command, parameters);

      // Execute command
      const result = await command.handler(parameters, context);

      context.logger.debug(`Command executed successfully: ${command.name}`);
      return result;
    } catch (error) {
      context.logger.error(`Command execution failed: ${command.name}`, error);

      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'COMMAND_ERROR',
          details: this.extractErrorDetails(error),
        },
      };
    }
  }
}
```

### Skill Invocation Issues

**Symptoms**: Skills are not being triggered or are failing to execute.

**Debug Solutions**:

```bash
# Check available skills
claude skill list

# Test skill manually
claude skill test skill-name "test input"

# Check skill triggers
claude skill triggers skill-name

# Enable skill debugging
export CLAUDE_SKILL_DEBUG=true
```

## Performance Issues

### Slow Plugin Loading

**Optimization Strategies**:

1. **Lazy Loading**:

```typescript
class LazyPluginManager {
  private plugins = new Map<string, () => Promise<Plugin>>();
  private loadedPlugins = new Map<string, Plugin>();

  async getPlugin(name: string): Promise<Plugin> {
    if (this.loadedPlugins.has(name)) {
      return this.loadedPlugins.get(name)!;
    }

    const loader = this.plugins.get(name);
    if (!loader) {
      throw new Error(`Plugin not found: ${name}`);
    }

    const plugin = await loader();
    this.loadedPlugins.set(name, plugin);
    return plugin;
  }
}
```

2. **Async Initialization**:

```typescript
class AsyncPluginInitializer {
  async initializePlugins(plugins: Plugin[]): Promise<void> {
    const initPromises = plugins.map(plugin =>
      this.initializePlugin(plugin).catch(error => {
        console.error(`Failed to initialize plugin ${plugin.name}:`, error);
        return null;
      })
    );

    await Promise.allSettled(initPromises);
  }
}
```

### Memory Leaks

**Detection and Solutions**:

```typescript
// memory-monitor.ts
class MemoryMonitor {
  private snapshots: MemorySnapshot[] = [];
  private readonly maxSnapshots = 100;

  takeSnapshot(label: string): void {
    const usage = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      label,
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
    };

    this.snapshots.push(snapshot);
    this.checkMemoryGrowth();
  }

  private checkMemoryGrowth(): void {
    if (this.snapshots.length < 10) return;

    const recent = this.snapshots.slice(-10);
    const older = this.snapshots.slice(-20, -10);

    if (older.length === 0) return;

    const recentAvg = recent.reduce((sum, s) => sum + s.heapUsed, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.heapUsed, 0) / older.length;

    const growth = (recentAvg - olderAvg) / olderAvg;

    if (growth > 0.5) {
      // 50% growth
      console.warn(`Memory growth detected: ${(growth * 100).toFixed(1)}%`);
    }
  }
}
```

## Security and Permissions

### Permission Denied Errors

**Solutions**:

```bash
# Check current permissions
claude permissions list

# Grant specific permissions
claude permissions grant plugin-name filesystem:read
claude permissions grant plugin-name network:request

# Check permission usage
claude permissions audit plugin-name

# Reset permissions
claude permissions reset plugin-name
```

**Permission Management Implementation**:

```typescript
// permission-manager.ts
class PermissionManager {
  private permissions = new Set<Permission>();

  has(permission: Permission): boolean {
    return this.permissions.has(permission);
  }

  require(permission: Permission): void {
    if (!this.has(permission)) {
      throw new PermissionError(`Permission required: ${permission}`);
    }
  }

  checkFileAccess(path: string, mode: 'read' | 'write'): void {
    const permission = mode === 'read' ? Permission.FILE_READ : Permission.FILE_WRITE;
    this.require(permission);

    // Security checks
    this.validatePath(path);
  }

  private validatePath(path: string): void {
    // Prevent path traversal
    if (path.includes('..')) {
      throw new SecurityError('Path traversal detected');
    }

    // Prevent access to sensitive directories
    const restrictedPaths = ['/etc', '/sys', '/proc', '~/.ssh'];
    for (const restricted of restrictedPaths) {
      if (path.startsWith(restricted)) {
        throw new SecurityError(`Access to ${restricted} is not allowed`);
      }
    }
  }
}
```

## Development Debugging

### Local Development Setup

**Development Environment Setup**:

```bash
# Create development workspace
mkdir claude-plugin-dev
cd claude-plugin-dev

# Initialize development environment
npm init -y
npm install --save-dev typescript @types/node ts-node nodemon

# Create development configuration
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

### Debug Logging

**Implementation**:

```typescript
// debug-logger.ts
class DebugLogger {
  private logLevel: LogLevel;
  private logFile?: string;

  constructor(logLevel: LogLevel = LogLevel.INFO, logFile?: string) {
    this.logLevel = logLevel;
    this.logFile = logFile;
  }

  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error | unknown): void {
    this.log(LogLevel.ERROR, message, error);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (level < this.logLevel) return;

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    const logEntry = `[${timestamp}] ${levelName}: ${message}${dataStr}`;

    console.log(logEntry);

    if (this.logFile) {
      this.writeToFile(logEntry);
    }
  }
}
```

## Advanced Troubleshooting

### Plugin Isolation

**Create isolated test environment**:

```bash
# Create isolated environment
claude environment create test-env
claude environment activate test-env

# Install only required plugins
claude marketplace install plugin-to-test

# Test in isolation
claude /test-command

# Clean up environment
claude environment deactivate
claude environment delete test-env
```

### Emergency Recovery

**Reset and recovery procedures**:

```bash
# Emergency plugin reset
claude plugin reset --all

# Backup current configuration
cp -r ~/.claude ~/.claude.backup.$(date +%Y%m%d-%H%M%S)

# Clean installation
rm -rf ~/.claude/plugins
claude marketplace reinstall-all

# Verify functionality
claude --help
claude plugin list
```

**Recovery Script**:

```bash
#!/bin/bash
# emergency-recovery.sh

set -euo pipefail

BACKUP_DIR="$HOME/.claude.backup.$(date +%Y%m%d-%H%M%S)"
CONFIG_DIR="$HOME/.claude"

echo "Claude Code Emergency Recovery"
echo "=============================="

# Create backup
echo "Creating backup in $BACKUP_DIR..."
if [ -d "$CONFIG_DIR" ]; then
    cp -r "$CONFIG_DIR" "$BACKUP_DIR"
    echo "✅ Backup created"
else
    echo "⚠️  No existing configuration to backup"
fi

# Reset plugin configuration
echo "Resetting plugin configuration..."
rm -rf "$CONFIG_DIR/plugins"
mkdir -p "$CONFIG_DIR/plugins"

echo "✅ Emergency recovery completed"
echo "📁 Backup available at: $BACKUP_DIR"
echo "🔄 Please restart Claude Code"
```

## Getting Help

### Support Resources

1. **Official Documentation**: https://docs.claude.com
2. **Community Forums**: https://community.anthropic.com
3. **GitHub Issues**: https://github.com/anthropics/claude-code/issues
4. **Discord Community**: Claude Code Discord server

### Reporting Issues

When reporting issues, include:

- Claude Code version
- Plugin name and version
- Operating system and Node.js version
- Complete error messages and stack traces
- Steps to reproduce the issue
- Expected vs actual behavior

### Debug Information Collection

```bash
# Collect system information
claude --version
node --version
npm --version

# Collect plugin information
claude plugin list
claude plugin status

# Collect configuration
cat ~/.claude/settings.json
cat ~/.claude/marketplaces.json

# Collect logs
tail -n 100 ~/.claude/logs/*.log
```
