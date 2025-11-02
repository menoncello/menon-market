# Claude Code Plugin Development Best Practices

> **Comprehensive guide to developing high-quality, maintainable, and secure Claude Code plugins**

This guide covers best practices for plugin development, including code quality standards, performance optimization, security considerations, and maintainability patterns.

## Table of Contents

1. [Code Quality Standards](#code-quality-standards)
2. [Performance Optimization](#performance-optimization)
3. [Security Considerations](#security-considerations)
4. [Error Handling and Logging](#error-handling-and-logging)
5. [Testing Strategies](#testing-strategies)
6. [Documentation Standards](#documentation-standards)
7. [Version Management](#version-management)
8. [Design Patterns](#design-patterns)
9. [Monitoring and Analytics](#monitoring-and-analytics)
10. [Community Guidelines](#community-guidelines)

## Code Quality Standards

### Language and Framework Standards

#### TypeScript Best Practices

```typescript
// Use strict TypeScript configuration
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

// Define clear interfaces
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

#### Code Organization

```typescript
// Use clear module structure
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

// Export clear public APIs
export { PluginManager } from './core/plugin-manager';
export { BaseCommand } from './commands/base-command';
export { BaseSkill } from './skills/base-skill';
export type { PluginConfig, CommandConfig, SkillConfig } from './types';
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

### ESLint Configuration

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-template": "error"
  }
}
```

### Code Review Checklist

- [ ] Code follows TypeScript best practices
- [ ] Functions have clear single responsibilities
- [ ] Error handling is comprehensive
- [ ] Logging is appropriate and informative
- [ ] Tests cover edge cases
- [ ] Documentation is clear and complete
- [ ] Security considerations are addressed
- [ ] Performance implications are considered

## Performance Optimization

### Lazy Loading

```typescript
class PluginRegistry {
  private plugins = new Map<string, () => Promise<Plugin>>();
  private loadedPlugins = new Map<string, Plugin>();

  register(name: string, loader: () => Promise<Plugin>): void {
    this.plugins.set(name, loader);
  }

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

  clear(): void {
    this.cache.clear();
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

### Performance Monitoring

```typescript
interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000;

  async measure<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();

    try {
      const result = await operation();

      const endTime = process.hrtime.bigint();
      const endMemory = process.memoryUsage();
      const executionTime = Number(endTime - startTime) / 1000000; // Convert to ms

      const metrics: PerformanceMetrics = {
        executionTime,
        memoryUsage: endMemory.heapUsed - startMemory.heapUsed,
        cpuUsage: process.cpuUsage().user, // Simplified
        timestamp: Date.now(),
      };

      this.recordMetrics(operationName, metrics);

      return { result, metrics };
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - startTime) / 1000000;

      console.error(`Operation ${operationName} failed after ${executionTime}ms:`, error);
      throw error;
    }
  }

  private recordMetrics(operationName: string, metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Alert on performance issues
    if (metrics.executionTime > 5000) { // 5 seconds
      console.warn(`Slow operation detected: ${operationName} took ${metrics.executionTime}ms`);
    }
  }

  getAverageExecutionTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, m) => sum + m.executionTime, 0);
    return total / this.metrics.length;
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

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
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

class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
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

  private async executeWithMonitoring(
    plugin: Plugin,
    permissionManager: PermissionManager,
    monitor: ResourceMonitor
  ): Promise<unknown> {
    monitor.start();

    // Inject permission manager into plugin context
    const pluginContext = {
      permissions: permissionManager,
      fileSystem: new SecureFileSystem(permissionManager),
      network: new SecureNetworkAccess(permissionManager),
    };

    return await plugin.execute(pluginContext);
  }
}
```

### Dependency Security

```typescript
class DependencyScanner {
  async scanDependencies(packageJsonPath: string): Promise<SecurityReport> {
    const packageJson = await this.readPackageJson(packageJsonPath);
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    const vulnerabilities: Vulnerability[] = [];

    for (const [name, version] of Object.entries(dependencies)) {
      const vulns = await this.checkVulnerabilities(name, version);
      vulnerabilities.push(...vulns);
    }

    return {
      totalDependencies: Object.keys(dependencies).length,
      vulnerabilities,
      riskScore: this.calculateRiskScore(vulnerabilities),
    };
  }

  private async checkVulnerabilities(name: string, version: string): Promise<Vulnerability[]> {
    // Implementation would check against vulnerability databases
    // like npm audit, Snyk, or OSS Index
    return [];
  }

  private calculateRiskScore(vulnerabilities: Vulnerability[]): number {
    return vulnerabilities.reduce((score, vuln) => {
      return score + this.getSeverityWeight(vuln.severity);
    }, 0);
  }

  private getSeverityWeight(severity: string): number {
    const weights = { low: 1, moderate: 5, high: 10, critical: 25 };
    return weights[severity.toLowerCase()] || 0;
  }
}

interface SecurityReport {
  totalDependencies: number;
  vulnerabilities: Vulnerability[];
  riskScore: number;
}

interface Vulnerability {
  packageName: string;
  severity: string;
  description: string;
  patchedIn?: string;
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

class ConfigurationError extends PluginError {
  readonly code = 'CONFIG_ERROR';
  readonly category = ErrorCategory.CONFIGURATION;
}

class ExecutionError extends PluginError {
  readonly code = 'EXECUTION_ERROR';
  readonly category = ErrorCategory.EXECUTION;
}

class ValidationError extends PluginError {
  readonly code = 'VALIDATION_ERROR';
  readonly category = ErrorCategory.VALIDATION;
}

enum ErrorCategory {
  CONFIGURATION = 'configuration',
  EXECUTION = 'execution',
  VALIDATION = 'validation',
  NETWORK = 'network',
  FILESYSTEM = 'filesystem',
  SECURITY = 'security',
}

interface ErrorRecord {
  name: string;
  message: string;
  code: string;
  category: ErrorCategory;
  context?: Record<string, unknown>;
  stack?: string;
  timestamp: string;
}
```

### Comprehensive Logging

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

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

  fatal(message: string, error?: Error, context?: Record<string, unknown>): void {
    const errorRecord = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined;

    this.log(LogLevel.FATAL, message, context, errorRecord);
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

interface LogTransport {
  log(entry: LogEntry): void;
}

class ConsoleTransport implements LogTransport {
  log(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelName = LogLevel[entry.level];
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const errorStr = entry.error ? `\nError: ${entry.error.message}` : '';

    console.log(`[${timestamp}] ${levelName}: ${entry.message}${contextStr}${errorStr}`);
  }
}

class FileTransport implements LogTransport {
  constructor(private filePath: string) {}

  log(entry: LogEntry): void {
    const logLine = JSON.stringify(entry) + '\n';
    // In a real implementation, this would write to file
    // fs.appendFileSync(this.filePath, logLine);
  }
}

class PluginLogger {
  constructor(
    private logger: Logger,
    private pluginName: string
  ) {}

  debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(message, { ...context, plugin: this.pluginName });
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(message, { ...context, plugin: this.pluginName });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(message, { ...context, plugin: this.pluginName });
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.logger.error(message, error, { ...context, plugin: this.pluginName });
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

    it('should reject plugin with invalid version', () => {
      const plugin = new MockPlugin('test-plugin', 'invalid');

      expect(() => pluginManager.register(plugin))
        .toThrow('Plugin version must follow semantic versioning');
    });

    it('should reject duplicate plugin registration', () => {
      const plugin1 = new MockPlugin('test-plugin', '1.0.0');
      const plugin2 = new MockPlugin('test-plugin', '2.0.0');

      pluginManager.register(plugin1);

      expect(() => pluginManager.register(plugin2))
        .toThrow('Plugin with name "test-plugin" is already registered');
    });
  });

  describe('executeCommand', () => {
    beforeEach(() => {
      const plugin = new MockPlugin('test-plugin', '1.0.0');
      pluginManager.register(plugin);
    });

    it('should execute registered command successfully', async () => {
      const result = await pluginManager.executeCommand('test-command', {
        param1: 'value1',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ processed: 'value1' });
    });

    it('should handle command execution errors', async () => {
      const result = await pluginManager.executeCommand('test-command', {
        param1: 'error',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject unknown commands', async () => {
      await expect(
        pluginManager.executeCommand('unknown-command', {})
      ).rejects.toThrow('Command not found: unknown-command');
    });
  });
});
```

### Integration Testing

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { ClaudeCodeClient } from '../src/client';
import { TestServer } from './utils/test-server';

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

    // Verify plugin state
    const pluginStatus = await client.getPluginStatus('integration-test-plugin');
    expect(pluginStatus.enabled).toBe(true);
    expect(pluginStatus.version).toBe('1.0.0');
  });

  it('should handle plugin errors gracefully', async () => {
    const result = await client.executeCommand('/error-plugin', {
      triggerError: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Intentional error for testing');
    expect(result.errorCode).toBe('PLUGIN_ERROR');
  });
});
```

### Performance Testing

```typescript
import { describe, it, expect } from 'bun:test';
import { PerformanceMonitor } from '../src/performance';
import { TestPlugin } from './fixtures/test-plugin';

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
    const avgExecutionTime = monitor.getAverageExecutionTime();

    // Memory increase should be reasonable (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);

    // Average execution time should be reasonable (less than 100ms)
    expect(avgExecutionTime).toBeLessThan(100);
  });

  it('should handle concurrent operations efficiently', async () => {
    const plugin = new TestPlugin();
    const concurrency = 50;
    const operations = Array.from({ length: concurrency }, (_, i) =>
      plugin.processConcurrent(`test-data-${i}`)
    );

    const startTime = Date.now();
    const results = await Promise.all(operations);
    const endTime = Date.now();

    expect(results).toHaveLength(concurrency);
    results.forEach(result => {
      expect(result.success).toBe(true);
    });

    // Should complete in reasonable time (less than 5 seconds)
    expect(endTime - startTime).toBeLessThan(5000);
  });
});
```

### Test Utilities

```typescript
// test-utils.ts
export class MockPlugin implements Plugin {
  constructor(
    public readonly name: string,
    public readonly version: string
  ) {}

  async execute(context: PluginContext): Promise<PluginResult> {
    return {
      success: true,
      data: { mock: true },
    };
  }

  getCommands(): Command[] {
    return [
      {
        name: 'mock-command',
        description: 'Mock command for testing',
        handler: this.handleMockCommand.bind(this),
      },
    ];
  }

  private async handleMockCommand(params: Record<string, unknown>): Promise<CommandResult> {
    return {
      success: true,
      output: `Mock processed: ${JSON.stringify(params)}`,
    };
  }
}

export class TestServer {
  private server: any;

  async start(): Promise<void> {
    // Start test server implementation
  }

  async stop(): Promise<void> {
    // Stop test server implementation
  }

  getUrl(): string {
    return 'http://localhost:3001';
  }
}

export function createTestContext(overrides: Partial<PluginContext> = {}): PluginContext {
  return {
    permissions: new PermissionManager([]),
    logger: new Logger(),
    workingDirectory: '/tmp/test',
    ...overrides,
  };
}
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
   * Map of registered plugins indexed by their names.
   * @private
   */
  private plugins = new Map<string, Plugin>();

  /**
   * Registers a plugin with the manager.
   *
   * @param plugin - The plugin to register
   * @throws {ValidationError} If plugin validation fails
   * @throws {DuplicateError} If a plugin with the same name is already registered
   *
   * @example
   * ```typescript
   * const plugin = new CodeFormatterPlugin();
   * manager.register(plugin);
   * ```
   */
  register(plugin: Plugin): void {
    this.validatePlugin(plugin);
    this.checkDuplicate(plugin.name);
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Executes a command from a registered plugin.
   *
   * @param commandName - The name of the command to execute
   * @param parameters - Parameters to pass to the command
   * @param options - Execution options
   * @returns Promise resolving to the command execution result
   *
   * @throws {CommandNotFoundError} If the command is not found
   * @throws {ExecutionError} If command execution fails
   *
   * @example
   * ```typescript
   * const result = await manager.executeCommand('format-code', {
   *   filePath: './src/index.ts',
   *   options: { tabSize: 2 }
   * });
   * ```
   */
  async executeCommand(
    commandName: string,
    parameters: Record<string, unknown>,
    options: ExecutionOptions = {}
  ): Promise<CommandResult> {
    const command = this.findCommand(commandName);
    const context = this.createExecutionContext(options);

    return await this.withMonitoring(
      () => command.handler(parameters, context),
      commandName
    );
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

### Advanced Usage

Detailed explanation of advanced features with examples.

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

## API Reference

### Commands

#### command-name

Description of the command.

**Parameters:**
- `param1` (string, required): Description of parameter
- `param2` (number, optional): Description of parameter

**Example:**
```bash
/command-name --param1="value" --param2=42
```

### Skills

#### skill-name

Description of when this skill is triggered and what it does.

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Contributing

Guidelines for contributing to the plugin.

## License

License information.

## Changelog

### 1.0.0 (2024-01-01)

- Initial release
- Added basic functionality
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

  static satisfiesVersion(version: string, constraint: string): boolean {
    // Implementation for semantic version constraint matching
    // Supports ^, ~, >=, <=, etc.
    return true; // Simplified
  }
}

interface Version {
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null;
}
```

### Changelog Management

```typescript
interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    added?: string[];
    changed?: string[];
    deprecated?: string[];
    removed?: string[];
    fixed?: string[];
    security?: string[];
  };
}

class ChangelogManager {
  static generateChangelog(changes: Partial<ChangelogEntry['changes']>): string {
    const sections = [];

    if (changes.added?.length) {
      sections.push('### Added\n' + changes.added.map(change => `- ${change}`).join('\n'));
    }
    if (changes.changed?.length) {
      sections.push('### Changed\n' + changes.changed.map(change => `- ${change}`).join('\n'));
    }
    if (changes.deprecated?.length) {
      sections.push('### Deprecated\n' + changes.deprecated.map(change => `- ${change}`).join('\n'));
    }
    if (changes.removed?.length) {
      sections.push('### Removed\n' + changes.removed.map(change => `- ${change}`).join('\n'));
    }
    if (changes.fixed?.length) {
      sections.push('### Fixed\n' + changes.fixed.map(change => `- ${change}`).join('\n'));
    }
    if (changes.security?.length) {
      sections.push('### Security\n' + changes.security.map(change => `- ${change}`).join('\n'));
    }

    return sections.join('\n\n');
  }

  static updateChangelogFile(filePath: string, entry: ChangelogEntry): void {
    const existingContent = fs.readFileSync(filePath, 'utf8');
    const newEntry = this.formatChangelogEntry(entry);
    const updatedContent = newEntry + '\n\n' + existingContent;
    fs.writeFileSync(filePath, updatedContent);
  }

  private static formatChangelogEntry(entry: ChangelogEntry): string {
    const header = `## [${entry.version}] - ${entry.date}`;
    const changes = this.generateChangelog(entry.changes);
    return `${header}\n\n${changes}`;
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

class CommandPluginFactory extends PluginFactory {
  create(config: PluginConfig): Plugin {
    return new CommandPlugin(config);
  }
}

class SkillPluginFactory extends PluginFactory {
  create(config: PluginConfig): Plugin {
    return new SkillPlugin(config);
  }
}

// Registration
PluginFactory.register('command', new CommandPluginFactory());
PluginFactory.register('skill', new SkillPluginFactory());

// Usage
const plugin = PluginFactory.create('command', {
  name: 'my-plugin',
  type: 'command',
  // ... other config
});
```

### Observer Pattern for Plugin Events

```typescript
interface PluginEvent {
  type: string;
  plugin: string;
  timestamp: Date;
  data?: unknown;
}

interface PluginEventHandler {
  (event: PluginEvent): void;
}

class PluginEventEmitter {
  private handlers = new Map<string, PluginEventHandler[]>();

  on(eventType: string, handler: PluginEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  off(eventType: string, handler: PluginEventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
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

// Usage
const eventEmitter = new PluginEventEmitter();

eventEmitter.on('plugin:loaded', (event) => {
  console.log(`Plugin loaded: ${event.plugin}`);
});

eventEmitter.on('plugin:error', (event) => {
  console.error(`Plugin error in ${event.plugin}:`, event.data);
});
```

## Monitoring and Analytics

### Usage Analytics

```typescript
interface UsageMetrics {
  pluginName: string;
  commandName?: string;
  executionTime: number;
  success: boolean;
  errorType?: string;
  timestamp: Date;
  userAgent: string;
}

class AnalyticsCollector {
  private metrics: UsageMetrics[] = [];
  private readonly maxMetrics = 10000;

  recordMetrics(metrics: Omit<UsageMetrics, 'timestamp' | 'userAgent'>): void {
    const fullMetrics: UsageMetrics = {
      ...metrics,
      timestamp: new Date(),
      userAgent: this.getUserAgent(),
    };

    this.metrics.push(fullMetrics);

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Send to analytics service (in background)
    this.sendToAnalytics(fullMetrics).catch(error => {
      console.error('Failed to send analytics:', error);
    });
  }

  private async sendToAnalytics(metrics: UsageMetrics): Promise<void> {
    // Implementation to send metrics to analytics service
  }

  private getUserAgent(): string {
    return `claude-code/${process.version}`;
  }

  getPluginUsage(pluginName: string): UsageMetrics[] {
    return this.metrics.filter(m => m.pluginName === pluginName);
  }

  getUsageStats(timeRange: { start: Date; end: Date }): {
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    topPlugins: Array<{ name: string; count: number }>;
  } {
    const filteredMetrics = this.metrics.filter(
      m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );

    const totalExecutions = filteredMetrics.length;
    const successfulExecutions = filteredMetrics.filter(m => m.success).length;
    const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    const averageExecutionTime = totalExecutions > 0
      ? filteredMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalExecutions
      : 0;

    const pluginCounts = new Map<string, number>();
    filteredMetrics.forEach(m => {
      pluginCounts.set(m.pluginName, (pluginCounts.get(m.pluginName) || 0) + 1);
    });

    const topPlugins = Array.from(pluginCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      totalExecutions,
      successRate,
      averageExecutionTime,
      topPlugins,
    };
  }
}
```

## Community Guidelines

### Code of Conduct

1. **Be respectful and inclusive**
2. **Provide constructive feedback**
3. **Help others learn and grow**
4. **Follow security best practices**
5. **Maintain documentation quality**
6. **Test thoroughly before release**

### Contribution Guidelines

1. **Fork the repository**
2. **Create a feature branch**
3. **Follow coding standards**
4. **Add comprehensive tests**
5. **Update documentation**
6. **Submit pull request**

### Plugin Review Process

1. **Automated checks** (linting, tests, security scan)
2. **Code review** by maintainers
3. **Testing** in multiple environments
4. **Documentation review**
5. **Approval and merge**

---

Following these best practices will help ensure your Claude Code plugins are high-quality, secure, and well-maintained. For specific implementation details, refer to the [API Reference](api-reference.md) and examine the [Templates](templates/) and [Examples](examples/) provided.