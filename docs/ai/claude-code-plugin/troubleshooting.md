# Claude Code Plugin Troubleshooting

> **Common issues and solutions for Claude Code plugin development and usage**

This guide provides solutions to common problems encountered when developing, installing, or using Claude Code plugins.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Configuration Problems](#configuration-problems)
3. [Runtime Errors](#runtime-errors)
4. [Performance Issues](#performance-issues)
5. [Security and Permissions](#security-and-permissions)
6. [Development Debugging](#development-debugging)
7. [Compatibility Issues](#compatibility-issues)
8. [Network and Connectivity](#network-and-connectivity)
9. [Plugin Conflicts](#plugin-conflicts)
10. [Advanced Troubleshooting](#advanced-troubleshooting)

## Installation Issues

### Plugin Not Found

**Problem**: Plugin cannot be found in marketplace or installation fails with "plugin not found" error.

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

**Problem**: Installation fails with permission errors.

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

**Problem**: Installation fails due to version conflicts with dependencies.

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

## Configuration Problems

### Invalid Plugin Configuration

**Problem**: Plugin fails to load due to configuration errors.

**Causes**:
- Malformed JSON in configuration files
- Missing required fields
- Invalid parameter values

**Solutions**:

```bash
# Validate configuration
claude config validate

# Check specific plugin configuration
claude plugin config plugin-name

# Reset plugin configuration
claude plugin config plugin-name --reset

# Reinstall with default configuration
claude marketplace reinstall plugin-name
```

**Example Configuration Validation**:

```typescript
// config-validator.ts
import Joi from 'joi';

const pluginConfigSchema = Joi.object({
  name: Joi.string().required(),
  version: Joi.string().pattern(/^\d+\.\d+\.\d+$/).required(),
  enabled: Joi.boolean().default(true),
  settings: Joi.object().pattern(Joi.string(), Joi.any()).optional(),
});

function validateConfig(config: unknown): void {
  const { error } = pluginConfigSchema.validate(config);
  if (error) {
    throw new Error(`Configuration validation failed: ${error.message}`);
  }
}
```

### Marketplace Configuration Issues

**Problem**: Marketplace cannot be accessed or configured properly.

**Solutions**:

```bash
# Check marketplace configuration
cat ~/.claude/marketplaces.json

# Validate marketplace URL
curl -L https://marketplace-url/manifest.json

# Reset marketplace configuration
claude marketplace reset

# Reconfigure marketplace
claude marketplace add <url> --name <name>
```

## Runtime Errors

### Plugin Loading Failures

**Problem**: Plugin fails to load during startup.

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

**Problem**: Plugin commands fail to execute or return errors.

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

  private extractErrorDetails(error: Error): unknown {
    return {
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };
  }
}
```

### Skill Invocation Issues

**Problem**: Skills are not being triggered or are failing to execute.

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

**Skill Debug Implementation**:

```typescript
// skill-debugger.ts
class SkillDebugger {
  async debugSkillInvocation(
    input: string,
    availableSkills: Skill[]
  ): Promise<DebugResult> {
    const debugInfo: DebugInfo = {
      input,
      availableSkills: availableSkills.map(s => s.name),
      triggers: [],
      selectedSkill: null,
      executionTime: 0,
    };

    const startTime = Date.now();

    // Find matching skills
    const matchingSkills = [];
    for (const skill of availableSkills) {
      for (const trigger of skill.triggers) {
        const isMatch = await this.evaluateTrigger(trigger, input);
        debugInfo.triggers.push({
          skill: skill.name,
          trigger: trigger.type,
          match: isMatch,
          priority: trigger.priority || 0,
        });

        if (isMatch) {
          matchingSkills.push({ skill, trigger });
        }
      }
    }

    // Select best skill
    if (matchingSkills.length > 0) {
      matchingSkills.sort((a, b) => (b.trigger.priority || 0) - (a.trigger.priority || 0));
      debugInfo.selectedSkill = matchingSkills[0].skill.name;
    }

    debugInfo.executionTime = Date.now() - startTime;

    return {
      debugInfo,
      recommendation: this.generateRecommendation(debugInfo),
    };
  }
}
```

## Performance Issues

### Slow Plugin Loading

**Problem**: Plugins take too long to load during startup.

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

  private async initializePlugin(plugin: Plugin): Promise<void> {
    const startTime = Date.now();
    await plugin.initialize(this.createPluginContext(plugin));
    const duration = Date.now() - startTime;

    if (duration > 1000) {
      console.warn(`Plugin ${plugin.name} took ${duration}ms to initialize`);
    }
  }
}
```

3. **Performance Monitoring**:
```typescript
class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetric[]>();

  recordOperation(pluginName: string, operation: string, duration: number): void {
    if (!this.metrics.has(pluginName)) {
      this.metrics.set(pluginName, []);
    }

    this.metrics.get(pluginName)!.push({
      operation,
      duration,
      timestamp: Date.now(),
    });

    // Alert on slow operations
    if (duration > 5000) {
      console.warn(`Slow operation detected: ${pluginName}:${operation} took ${duration}ms`);
    }
  }

  getPerformanceReport(pluginName: string): PerformanceReport {
    const metrics = this.metrics.get(pluginName) || [];
    const totalOperations = metrics.length;
    const averageTime = totalOperations > 0
      ? metrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations
      : 0;

    return {
      pluginName,
      totalOperations,
      averageTime,
      slowOperations: metrics.filter(m => m.duration > 1000).length,
    };
  }
}
```

### Memory Leaks

**Problem**: Plugin memory usage grows over time.

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

    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    // Check for memory growth
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

    if (growth > 0.5) { // 50% growth
      console.warn(`Memory growth detected: ${(growth * 100).toFixed(1)}%`);
    }
  }

  generateReport(): MemoryReport {
    const latest = this.snapshots[this.snapshots.length - 1];
    const oldest = this.snapshots[0];

    if (!latest || !oldest) {
      return { growth: 0, currentUsage: 0, snapshots: 0 };
    }

    return {
      growth: latest.heapUsed - oldest.heapUsed,
      currentUsage: latest.heapUsed,
      snapshots: this.snapshots.length,
    };
  }
}

// Plugin cleanup
class Plugin {
  private resources = new Set<Resource>();

  async cleanup(): Promise<void> {
    // Clean up all resources
    const cleanupPromises = Array.from(this.resources).map(resource =>
      resource.cleanup().catch(error =>
        console.error('Resource cleanup failed:', error)
      )
    );

    await Promise.allSettled(cleanupPromises);
    this.resources.clear();

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }
}
```

## Security and Permissions

### Permission Denied Errors

**Problem**: Plugin operations fail due to insufficient permissions.

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

  constructor(permissions: Permission[]) {
    this.permissions = new Set(permissions);
  }

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

// Secure file operations
class SecureFileSystem {
  constructor(private permissionManager: PermissionManager) {}

  async readFile(path: string): Promise<string> {
    this.permissionManager.checkFileAccess(path, 'read');

    try {
      return await fs.readFile(path, 'utf8');
    } catch (error) {
      throw new FileSystemError(`Failed to read file: ${path}`, error);
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.permissionManager.checkFileAccess(path, 'write');

    // Additional security: check file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (content.length > maxSize) {
      throw new SecurityError('File content exceeds maximum size limit');
    }

    try {
      await fs.writeFile(path, content);
    } catch (error) {
      throw new FileSystemError(`Failed to write file: ${path}`, error);
    }
  }
}
```

## Development Debugging

### Local Development Setup

**Problem**: Difficult to debug plugins during development.

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

# Create development scripts
cat > package.json << EOF
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "test": "bun test",
    "debug": "node --inspect -r ts-node/register src/index.ts"
  }
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

    // Console output
    console.log(logEntry);

    // File output
    if (this.logFile) {
      this.writeToFile(logEntry);
    }
  }

  private async writeToFile(logEntry: string): Promise<void> {
    try {
      await fs.appendFile(this.logFile!, logEntry + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
}

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}
```

### Unit Testing Debugging

**Test Utilities**:

```typescript
// test-utils.ts
export class MockPluginContext implements PluginContext {
  public workingDirectory = '/tmp/test';
  public config = {};
  public permissions = new MockPermissionManager();
  public logger = new DebugLogger(LogLevel.DEBUG);
  public events = new EventEmitter();
  public filesystem = new MockFileSystem();
  public network = new MockNetwork();
  public system = new MockSystem();
  public cache = new MockCache();
}

export class MockPermissionManager extends PermissionManager {
  constructor() {
    super([
      Permission.FILE_READ,
      Permission.FILE_WRITE,
      Permission.NETWORK_REQUEST,
    ]);
  }

  require(permission: Permission): void {
    // Allow all permissions in tests
  }
}

export function createTestPlugin(pluginName: string): Plugin {
  return new TestPlugin(pluginName);
}

class TestPlugin extends BasePlugin {
  async initialize(context: PluginContext): Promise<void> {
    context.logger.info(`Test plugin ${this.name} initialized`);
  }

  async cleanup(): Promise<void> {
    // Cleanup implementation
  }
}
```

## Compatibility Issues

### Version Compatibility

**Problem**: Plugin incompatible with Claude Code version.

**Solutions**:

```bash
# Check Claude Code version
claude --version

# Check plugin compatibility
claude plugin compatibility plugin-name

# Update Claude Code
npm update -g @anthropic-ai/claude-code

# Use compatible plugin version
claude marketplace install plugin-name@compatible-version
```

**Compatibility Checking**:

```typescript
// compatibility-checker.ts
class CompatibilityChecker {
  static checkPluginCompatibility(
    plugin: Plugin,
    claudeVersion: string
  ): CompatibilityResult {
    const pluginMinVersion = plugin.claude?.minVersion;
    const pluginMaxVersion = plugin.claude?.maxVersion;

    if (pluginMinVersion && !this.isVersionCompatible(claudeVersion, pluginMinVersion, '>=')) {
      return {
        compatible: false,
        reason: `Claude Code version ${claudeVersion} is below minimum required version ${pluginMinVersion}`,
        suggestion: `Update Claude Code to version ${pluginMinVersion} or higher`,
      };
    }

    if (pluginMaxVersion && !this.isVersionCompatible(claudeVersion, pluginMaxVersion, '<=')) {
      return {
        compatible: false,
        reason: `Claude Code version ${claudeVersion} is above maximum supported version ${pluginMaxVersion}`,
        suggestion: `Use a plugin version compatible with Claude Code ${claudeVersion}`,
      };
    }

    return { compatible: true };
  }

  private static isVersionCompatible(
    current: string,
    required: string,
    operator: '>=' | '<='
  ): boolean {
    // Simplified version comparison
    const currentParts = current.split('.').map(Number);
    const requiredParts = required.split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const requiredPart = requiredParts[i] || 0;

      if (operator === '>=' && currentPart < requiredPart) return false;
      if (operator === '<=' && currentPart > requiredPart) return false;
      if (currentPart !== requiredPart) break;
    }

    return true;
  }
}
```

### Node.js Compatibility

**Problem**: Plugin requires different Node.js version.

**Solutions**:

```bash
# Check Node.js version
node --version

# Use Node Version Manager (nvm)
nvm use 18
nvm install 18

# Update plugin dependencies
cd plugin-directory
npm install

# Use compatible Node.js version
claude --node-version=18
```

## Network and Connectivity

### Marketplace Connectivity Issues

**Problem**: Cannot connect to plugin marketplace.

**Troubleshooting Steps**:

```bash
# Test network connectivity
curl -I https://github.com
ping github.com

# Check proxy settings
echo $HTTP_PROXY
echo $HTTPS_PROXY

# Test marketplace URL
curl -L https://marketplace-url/manifest.json

# Configure proxy if needed
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# Use alternative marketplace
claude marketplace add https://mirror.marketplace.com
```

### Plugin Update Failures

**Problem**: Plugin updates fail to download or install.

**Solutions**:

```bash
# Check for updates manually
claude marketplace check-updates

# Force update
claude marketplace update plugin-name --force

# Clear update cache
claude marketplace clear-cache

# Reinstall plugin
claude marketplace reinstall plugin-name

# Check update logs
tail -f ~/.claude/logs/updates.log
```

## Plugin Conflicts

### Command Name Conflicts

**Problem**: Multiple plugins provide commands with the same name.

**Resolution**:

```bash
# Check command conflicts
claude plugin conflicts

# List all commands
claude command list

# Disable conflicting plugin
claude plugin disable conflicting-plugin

# Use fully qualified command
claude plugin-name/command-name

# Rename command in plugin configuration
claude plugin command-rename plugin-name old-name new-name
```

### Dependency Conflicts

**Problem**: Plugin dependencies conflict with each other.

**Solutions**:

```bash
# Analyze dependency tree
claude plugin deps --tree

# Resolve conflicts
claude plugin resolve-conflicts

# Use specific versions
claude marketplace install plugin1@1.0.0 plugin2@2.0.0

# Isolate plugins in separate environments
claude environment create env1
claude environment create env2
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

### Plugin Profiling

**Performance profiling**:

```typescript
// plugin-profiler.ts
class PluginProfiler {
  private profiles = new Map<string, ProfileData>();

  startProfile(pluginName: string, operation: string): void {
    const key = `${pluginName}:${operation}`;
    const profile: ProfileData = {
      pluginName,
      operation,
      startTime: process.hrtime.bigint(),
      startMemory: process.memoryUsage(),
    };

    this.profiles.set(key, profile);
  }

  endProfile(pluginName: string, operation: string): ProfileResult {
    const key = `${pluginName}:${operation}`;
    const profile = this.profiles.get(key);

    if (!profile) {
      throw new Error(`No profile found for ${key}`);
    }

    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();

    const result: ProfileResult = {
      pluginName,
      operation,
      duration: Number(endTime - profile.startTime) / 1000000, // Convert to ms
      memoryDelta: endMemory.heapUsed - profile.startMemory.heapUsed,
      timestamp: Date.now(),
    };

    this.profiles.delete(key);
    return result;
  }

  generateReport(): ProfileReport {
    const results = Array.from(this.profiles.values()).map(profile => {
      // Calculate results for incomplete profiles
      return this.endProfile(profile.pluginName, profile.operation);
    });

    return {
      totalOperations: results.length,
      averageDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      memoryUsage: results.reduce((sum, r) => sum + r.memoryDelta, 0),
      slowOperations: results.filter(r => r.duration > 1000),
    };
  }
}
```

### Health Monitoring

**Plugin health checks**:

```typescript
// health-monitor.ts
class PluginHealthMonitor {
  private healthChecks = new Map<string, HealthCheck>();

  registerHealthCheck(pluginName: string, check: HealthCheck): void {
    this.healthChecks.set(pluginName, check);
  }

  async runHealthChecks(): Promise<HealthReport> {
    const results: PluginHealthResult[] = [];

    for (const [pluginName, check] of this.healthChecks) {
      try {
        const startTime = Date.now();
        const result = await check.execute();
        const duration = Date.now() - startTime;

        results.push({
          pluginName,
          status: result.healthy ? 'healthy' : 'unhealthy',
          message: result.message,
          duration,
          lastCheck: new Date(),
        });
      } catch (error) {
        results.push({
          pluginName,
          status: 'error',
          message: error.message,
          duration: 0,
          lastCheck: new Date(),
        });
      }
    }

    return {
      totalPlugins: results.length,
      healthyPlugins: results.filter(r => r.status === 'healthy').length,
      unhealthyPlugins: results.filter(r => r.status === 'unhealthy').length,
      errorPlugins: results.filter(r => r.status === 'error').length,
      results,
    };
  }
}

interface HealthCheck {
  execute(): Promise<{ healthy: boolean; message: string }>;
}
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

# Reset configuration files
echo "Resetting configuration files..."
cat > "$CONFIG_DIR/settings.json" << EOF
{
  "plugins": {},
  "permissions": {
    "allowedDomains": ["github.com"],
    "allowedCommands": ["git", "npm"],
    "filesystemAccess": ["read"],
    "networkAccess": false
  },
  "preferences": {
    "autoUpdate": true,
    "telemetry": false
  }
}
EOF

# Clear caches
echo "Clearing caches..."
rm -rf "$CONFIG_DIR/cache"
rm -rf "$CONFIG_DIR/logs"

echo "✅ Emergency recovery completed"
echo "📁 Backup available at: $BACKUP_DIR"
echo "🔄 Please restart Claude Code"
```

---

For additional support and community help, visit:
- [Claude Code Documentation](https://docs.claude.com)
- [Community Forums](https://community.anthropic.com)
- [GitHub Issues](https://github.com/anthropics/claude-code/issues)