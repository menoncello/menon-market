import { BasePlugin, PluginContext, PluginConfig } from './types';
import { FileToolCommand } from './commands/file-tool';
import { NetworkToolCommand } from './commands/network-tool';
import { SystemToolCommand } from './commands/system-tool';
import { DataProcessingSkill } from './skills/data-processing';
import { FileChangeHook } from './hooks/file-change';

export interface ToolPluginConfig extends PluginConfig {
  maxFileSize: number;
  allowedDomains: string[];
  cacheEnabled: boolean;
  cacheTimeout: number;
}

export default class ToolPlugin extends BasePlugin {
  private config: ToolPluginConfig;
  private logger: any;

  constructor() {
    super('tool-plugin', '1.0.0', 'A comprehensive tool plugin for file, network, and system operations');
  }

  async initialize(context: PluginContext): Promise<void> {
    this.config = context.config as ToolPluginConfig;
    this.logger = context.logger;

    this.logger.info('Tool Plugin initializing...', {
      version: this.version,
      config: this.config
    });

    // Validate configuration
    this.validateConfig();

    // Initialize cache if enabled
    if (this.config.cacheEnabled) {
      await this.initializeCache(context);
    }

    this.logger.info('Tool Plugin initialized successfully');
  }

  async cleanup(): Promise<void> {
    this.logger.info('Tool Plugin cleaning up...');

    // Cleanup resources
    await this.cleanupCache();

    this.logger.info('Tool Plugin cleanup completed');
  }

  getCommands() {
    return [
      new FileToolCommand(this.config, this.logger),
      new NetworkToolCommand(this.config, this.logger),
      new SystemToolCommand(this.config, this.logger)
    ];
  }

  getSkills() {
    return [
      new DataProcessingSkill(this.config, this.logger)
    ];
  }

  getHooks() {
    return [
      new FileChangeHook(this.config, this.logger)
    ];
  }

  getConfigSchema() {
    return {
      maxFileSize: {
        type: 'number',
        description: 'Maximum file size for operations (in bytes)',
        default: 10485760, // 10MB
        min: 1024, // 1KB
        max: 104857600 // 100MB
      },
      allowedDomains: {
        type: 'array',
        description: 'List of allowed domains for network operations',
        default: ['api.github.com', 'github.com'],
        itemType: 'string'
      },
      cacheEnabled: {
        type: 'boolean',
        description: 'Enable caching for operations',
        default: true
      },
      cacheTimeout: {
        type: 'number',
        description: 'Cache timeout in seconds',
        default: 300, // 5 minutes
        min: 60, // 1 minute
        max: 3600 // 1 hour
      },
      timeout: {
        type: 'number',
        description: 'Operation timeout in milliseconds',
        default: 30000, // 30 seconds
        min: 1000, // 1 second
        max: 300000 // 5 minutes
      },
      retryAttempts: {
        type: 'number',
        description: 'Number of retry attempts for failed operations',
        default: 3,
        min: 0,
        max: 10
      }
    };
  }

  private validateConfig(): void {
    if (!this.config.maxFileSize || this.config.maxFileSize <= 0) {
      throw new Error('maxFileSize must be a positive number');
    }

    if (!Array.isArray(this.config.allowedDomains) || this.config.allowedDomains.length === 0) {
      throw new Error('allowedDomains must be a non-empty array');
    }

    if (typeof this.config.cacheTimeout !== 'number' || this.config.cacheTimeout <= 0) {
      throw new Error('cacheTimeout must be a positive number');
    }
  }

  private async initializeCache(context: PluginContext): Promise<void> {
    try {
      // Initialize cache storage
      await context.cache.set('plugin:initialized', {
        timestamp: Date.now(),
        version: this.version
      }, this.config.cacheTimeout);

      this.logger.debug('Cache initialized successfully');
    } catch (error) {
      this.logger.warn('Failed to initialize cache', error);
    }
  }

  private async cleanupCache(): Promise<void> {
    try {
      // Cleanup cache resources
      // Implementation depends on cache API
      this.logger.debug('Cache cleanup completed');
    } catch (error) {
      this.logger.warn('Failed to cleanup cache', error);
    }
  }

  // Utility methods for tool operations
  protected async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const maxAttempts = this.config.retryAttempts || 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.debug(`Executing ${operationName}`, { attempt });
        const result = await operation();
        if (attempt > 1) {
          this.logger.info(`${operationName} succeeded on attempt ${attempt}`);
        }
        return result;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`${operationName} failed on attempt ${attempt}`, error);

        if (attempt < maxAttempts) {
          // Exponential backoff
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`${operationName} failed after ${maxAttempts} attempts: ${lastError.message}`);
  }

  protected validateFilePath(filePath: string): void {
    // Security validation for file paths
    if (filePath.includes('..')) {
      throw new Error('Path traversal detected');
    }

    if (filePath.startsWith('/etc/') || filePath.startsWith('/sys/')) {
      throw new Error('Access to system directories is not allowed');
    }

    if (filePath.length > 4096) {
      throw new Error('File path too long');
    }
  }

  protected validateUrl(url: string): void {
    try {
      const parsedUrl = new URL(url);

      // Check protocol
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS protocols are allowed');
      }

      // Check domain whitelist
      const isAllowed = this.config.allowedDomains.some(domain => {
        return parsedUrl.hostname === domain || parsedUrl.hostname?.endsWith(`.${domain}`);
      });

      if (!isAllowed) {
        throw new Error(`Domain ${parsedUrl.hostname} is not in the allowed list`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Invalid URL format');
    }
  }
}