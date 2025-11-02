# Claude Code Plugin Development Best Practices

This guide covers best practices for developing high-quality, maintainable, and secure Claude Code plugins.

## Code Quality Standards

### TypeScript Best Practices

#### Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### Interface Design
```typescript
// Use clear interfaces
interface PluginConfig {
  name: string;
  version: string;
  settings: PluginSettings;
}

interface PluginSettings {
  enabled: boolean;
  autoUpdate: boolean;
  customOptions: Record<string, unknown>;
}

// Use generic types for flexibility
class PluginManager<T extends PluginConfig> {
  private plugins: Map<string, T> = new Map();

  register(plugin: T): void {
    this.plugins.set(plugin.name, plugin);
  }

  get<K extends keyof T>(name: string, key: K): T[K] | undefined {
    const plugin = this.plugins.get(name);
    return plugin?.[key];
  }
}
```

#### Error Handling
```typescript
// Implement proper error handling
class PluginError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly pluginName: string
  ) {
    super(message);
    this.name = 'PluginError';
  }
}

// Use async/await for asynchronous operations
async function loadPlugin(pluginPath: string): Promise<Plugin> {
  try {
    const manifest = await loadManifest(pluginPath);
    const plugin = await import(pluginPath);
    return new plugin.default(manifest);
  } catch (error) {
    throw new PluginError(
      `Failed to load plugin from ${pluginPath}`,
      'LOAD_ERROR',
      pluginPath
    );
  }
}
```

### Code Organization

#### Directory Structure
```
src/
├── types/
│   ├── plugin.ts
│   ├── command.ts
│   └── skill.ts
├── core/
│   ├── plugin-manager.ts
│   ├── command-registry.ts
│   └── skill-loader.ts
├── utils/
│   ├── file-utils.ts
│   ├── validation.ts
│   └── logger.ts
├── commands/
│   ├── base-command.ts
│   └── implementations/
├── skills/
│   ├── base-skill.ts
│   └── implementations/
└── index.ts
```

#### Naming Conventions
```typescript
// Use descriptive names
class PluginConfigurationValidator {} // Good
class PCV {} // Bad

// Use consistent patterns
interface PluginManifest {} // Interface
class PluginLoader {} // Class
const DEFAULT_PLUGIN_PATH = '/plugins'; // Constant
function validatePluginManifest() {} // Function

// File naming
plugin-manager.ts // kebab-case for files
PluginManager // PascalCase for classes
validatePlugin() // camelCase for functions
```

## Performance Optimization

### Lazy Loading
```typescript
class PluginRegistry {
  private plugins = new Map<string, () => Promise<Plugin>>();
  private loadedPlugins = new Map<string, Plugin>();

  async get(name: string): Promise<Plugin> {
    // Check if already loaded
    if (this.loadedPlugins.has(name)) {
      return this.loadedPlugins.get(name)!;
    }

    // Load plugin on demand
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

### Caching Strategies
```typescript
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, value: T, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}
```

### Resource Management
```typescript
class ResourceManager {
  private resources = new Set<() => Promise<void>>();

  register(cleanup: () => Promise<void>): void {
    this.resources.add(cleanup);
  }

  async cleanup(): Promise<void> {
    const cleanupPromises = Array.from(this.resources).map(async (cleanup) => {
      try {
        await cleanup();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });

    await Promise.allSettled(cleanupPromises);
    this.resources.clear();
  }
}

// Usage with automatic cleanup
class Plugin {
  private resourceManager = new ResourceManager();

  async initialize(): Promise<void> {
    // Register cleanup functions
    this.resourceManager.register(async () => {
      await this.closeConnections();
    });

    this.resourceManager.register(async () => {
      await this.cleanupTempFiles();
    });
  }

  async destroy(): Promise<void> {
    await this.resourceManager.cleanup();
  }
}
```

## Security Considerations

### Input Validation
```typescript
import Joi from 'joi';

const pluginConfigSchema = Joi.object({
  name: Joi.string().alphanum().min(1).max(50).required(),
  version: Joi.string().pattern(/^\d+\.\d+\.\d+$/).required(),
  description: Joi.string().max(500).optional(),
  permissions: Joi.array().items(Joi.string()).optional(),
});

class PluginValidator {
  static validateConfig(config: unknown): PluginConfig {
    const { error, value } = pluginConfigSchema.validate(config);
    if (error) {
      throw new ValidationError(`Invalid plugin configuration: ${error.message}`);
    }
    return value;
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .trim()
      .substring(0, 1000); // Limit length
  }
}
```

### Permission Management
```typescript
enum Permission {
  FILE_READ = 'file:read',
  FILE_WRITE = 'file:write',
  NETWORK_REQUEST = 'network:request',
  SYSTEM_EXEC = 'system:exec',
  ENV_READ = 'env:read',
}

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
      throw new SecurityError(`Permission required: ${permission}`);
    }
  }

  checkFileAccess(path: string, mode: 'read' | 'write'): void {
    const permission = mode === 'read' ? Permission.FILE_READ : Permission.FILE_WRITE;
    this.require(permission);

    // Additional path validation
    if (path.includes('..')) {
      throw new SecurityError('Path traversal detected');
    }

    if (path.startsWith('/etc/') || path.startsWith('/sys/')) {
      throw new SecurityError('Access to system directories denied');
    }
  }
}
```

### Secure Plugin Execution
```typescript
interface SecureExecutionContext {
  permissions: Permission[];
  timeout: number;
  memoryLimit: number;
}

class SecurePluginRunner {
  async executePlugin(
    plugin: Plugin,
    context: SecureExecutionContext
  ): Promise<unknown> {
    const permissionManager = new PermissionManager(context.permissions);
    const monitor = new ResourceMonitor(context.memoryLimit);

    try {
      // Set up timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Plugin execution timeout')), context.timeout);
      });

      // Execute plugin with monitoring
      const executionPromise = this.executeWithMonitoring(plugin, permissionManager, monitor);

      const result = await Promise.race([executionPromise, timeoutPromise]);
      return result;
    } finally {
      monitor.stop();
    }
  }
}
```

## Error Handling and Logging

### Structured Error Handling
```typescript
abstract class PluginError extends Error {
  abstract readonly code: string;
  abstract readonly category: ErrorCategory;

  constructor(
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON(): ErrorRecord {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      context: this.context,
      stack: this.stack,
      timestamp: new Date().toISOString(),
    };
  }
}

enum ErrorCategory {
  CONFIGURATION = 'configuration',
  EXECUTION = 'execution',
  VALIDATION = 'validation',
  NETWORK = 'network',
  FILESYSTEM = 'filesystem',
  SECURITY = 'security',
}
```

### Comprehensive Logging
```typescript
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: ErrorRecord;
  plugin?: string;
  operation?: string;
}

class Logger {
  private transports: LogTransport[] = [];

  constructor(private minLevel: LogLevel = LogLevel.INFO) {}

  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const errorRecord = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined;

    this.log(LogLevel.ERROR, message, context, errorRecord);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: ErrorRecord
  ): void {
    if (level < this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      plugin: context?.plugin as string,
      operation: context?.operation as string,
    };

    this.transports.forEach(transport => {
      try {
        transport.log(entry);
      } catch (transportError) {
        console.error('Transport error:', transportError);
      }
    });
  }
}
```

## Testing Strategies

### Unit Testing
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { PluginManager } from '../src/plugin-manager';
import { MockPlugin } from './mocks/mock-plugin';

describe('PluginManager', () => {
  let pluginManager: PluginManager;

  beforeEach(() => {
    pluginManager = new PluginManager();
  });

  afterEach(() => {
    pluginManager.cleanup();
  });

  describe('registerPlugin', () => {
    it('should register a valid plugin', () => {
      const plugin = new MockPlugin('test-plugin', '1.0.0');

      expect(() => pluginManager.register(plugin)).not.toThrow();
      expect(pluginManager.isRegistered('test-plugin')).toBe(true);
    });

    it('should reject plugin with invalid name', () => {
      const plugin = new MockPlugin('', '1.0.0');

      expect(() => pluginManager.register(plugin))
        .toThrow('Plugin name must be a non-empty string');
    });
  });
});
```

### Integration Testing
```typescript
describe('Plugin Integration', () => {
  let client: ClaudeCodeClient;
  let server: TestServer;

  beforeAll(async () => {
    server = new TestServer();
    await server.start();

    client = new ClaudeCodeClient({
      endpoint: server.getUrl(),
      timeout: 5000,
    });
  });

  afterAll(async () => {
    await server.stop();
  });

  it('should install and execute plugin end-to-end', async () => {
    // Install plugin
    const installResult = await client.installPlugin({
      name: 'integration-test-plugin',
      version: '1.0.0',
      source: './test-fixtures/integration-plugin',
    });

    expect(installResult.success).toBe(true);

    // Execute command
    const commandResult = await client.executeCommand('/integration-test', {
      input: 'test data',
    });

    expect(commandResult.success).toBe(true);
    expect(commandResult.output).toContain('processed: test data');
  });
});
```

### Performance Testing
```typescript
describe('Performance Tests', () => {
  it('should handle high load without memory leaks', async () => {
    const monitor = new PerformanceMonitor();
    const plugin = new TestPlugin();

    const initialMemory = process.memoryUsage().heapUsed;
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      await monitor.measure(
        () => plugin.process(`test-data-${i}`),
        'process-operation'
      );
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be reasonable (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
```

## Documentation Standards

### Code Documentation
```typescript
/**
 * Plugin manager for handling plugin lifecycle and execution.
 *
 * This class provides a centralized way to manage Claude Code plugins,
 * including registration, execution, and cleanup operations.
 *
 * @example
 * ```typescript
 * const manager = new PluginManager();
 * const plugin = new MyPlugin();
 *
 * manager.register(plugin);
 * const result = await manager.executeCommand('my-command', { param: 'value' });
 * ```
 */
export class PluginManager {
  /**
   * Registers a plugin with the manager.
   *
   * @param plugin - The plugin to register
   * @throws {ValidationError} If plugin validation fails
   * @throws {DuplicateError} If a plugin with the same name is already registered
   */
  register(plugin: Plugin): void {
    this.validatePlugin(plugin);
    this.checkDuplicate(plugin.name);
    this.plugins.set(plugin.name, plugin);
  }
}
```

### README Template
```markdown
# Plugin Name

> Brief description of what the plugin does

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

```bash
claude marketplace install plugin-name
```

## Usage

### Basic Usage

```bash
/command-name --param=value
```

## Configuration

Add to your `.claude/settings.json`:

```json
{
  "plugins": {
    "plugin-name": {
      "setting1": "value1",
      "setting2": "value2"
    }
  }
}
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

## License

License information.
```

## Version Management

### Semantic Versioning
```typescript
class VersionManager {
  static parseVersion(version: string): Version {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
    if (!match) {
      throw new Error(`Invalid version format: ${version}`);
    }

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4] || null,
    };
  }

  static compareVersions(v1: string, v2: string): number {
    const version1 = this.parseVersion(v1);
    const version2 = this.parseVersion(v2);

    if (version1.major !== version2.major) {
      return version1.major - version2.major;
    }
    if (version1.minor !== version2.minor) {
      return version1.minor - version2.minor;
    }
    if (version1.patch !== version2.patch) {
      return version1.patch - version2.patch;
    }

    return 0;
  }
}
```

## Design Patterns

### Plugin Factory Pattern
```typescript
abstract class PluginFactory {
  abstract create(config: PluginConfig): Plugin;

  static register(type: string, factory: PluginFactory): void {
    this.factories.set(type, factory);
  }

  static create(type: string, config: PluginConfig): Plugin {
    const factory = this.factories.get(type);
    if (!factory) {
      throw new Error(`Unknown plugin type: ${type}`);
    }
    return factory.create(config);
  }

  private static factories = new Map<string, PluginFactory>();
}
```

### Observer Pattern for Plugin Events
```typescript
class PluginEventEmitter {
  private handlers = new Map<string, PluginEventHandler[]>();

  on(eventType: string, handler: PluginEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  emit(event: PluginEvent): void {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      });
    }
  }
}
```

## Quality Assurance Checklist

### Before Release
- [ ] Code follows all style guidelines
- [ ] All tests pass successfully
- [ ] Documentation is complete and accurate
- [ ] Security review passed
- [ ] Performance benchmarks met
- [ ] Plugin tested in multiple environments
- [ ] Error handling comprehensive
- [ ] Dependencies validated

### Code Review
- [ ] Functions have clear single responsibilities
- [ ] Error handling is comprehensive
- [ ] Logging is appropriate and informative
- [ ] Tests cover edge cases
- [ ] Security considerations are addressed
- [ ] Performance implications are considered

---

*Following these best practices will help ensure your Claude Code plugins are high-quality, secure, and well-maintained.*