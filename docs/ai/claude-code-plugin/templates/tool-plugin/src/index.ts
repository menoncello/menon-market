import { FileToolCommand } from './commands/file-tool';
import { NetworkToolCommand } from './commands/network-tool';
import { SystemToolCommand } from './commands/system-tool';
import { FileChangeHook } from './hooks/file-change';
import { DataProcessingSkill } from './skills/data-processing';
import { BasePlugin, PluginContext, PluginConfig } from './types';

// Define missing types
interface Command {
  name: string;
  description: string;
  execute: (input: unknown) => Promise<unknown>;
}

interface Skill {
  name: string;
  description: string;
  execute: (input: unknown) => Promise<unknown>;
}

interface Hook {
  name: string;
  description: string;
  execute: (input: unknown) => Promise<unknown>;
}

interface ConfigSchema {
  [key: string]: {
    type: string;
    description: string;
    default: unknown;
    min?: number;
    max?: number;
    itemType?: string;
  };
}

interface Logger {
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

// Constants to avoid magic numbers
const DEFAULT_MAX_FILE_SIZE = 10485760; // 10MB
const MIN_FILE_SIZE = 1024; // 1KB
const MAX_FILE_SIZE = 104857600; // 100MB
const DEFAULT_CACHE_TIMEOUT = 300; // 5 minutes
const MIN_CACHE_TIMEOUT = 60; // 1 minute
const MAX_CACHE_TIMEOUT = 3600; // 1 hour
const DEFAULT_OPERATION_TIMEOUT = 30000; // 30 seconds
const MIN_OPERATION_TIMEOUT = 1000; // 1 second
const MAX_OPERATION_TIMEOUT = 300000; // 5 minutes
const DEFAULT_RETRY_ATTEMPTS = 3;
const MAX_RETRY_ATTEMPTS = 10;
const MAX_PATH_LENGTH = 4096;
const BASE_RETRY_DELAY = 1000; // 1 second

export interface ToolPluginConfig extends PluginConfig {
  maxFileSize: number;
  allowedDomains: string[];
  cacheEnabled: boolean;
  cacheTimeout: number;
}

/**
 * A comprehensive tool plugin for file, network, and system operations.
 *
 * This plugin provides commands for file manipulation, network requests,
 * system operations, and data processing capabilities with built-in
 * caching, retry logic, and security validation.
 */
export class ToolPlugin extends BasePlugin {
  private config: ToolPluginConfig;
  private logger: Logger;

  /**
   * Creates a new instance of the ToolPlugin.
   *
   * Initializes the plugin with name, version, and description.
   */
  constructor() {
    super(
      'tool-plugin',
      '1.0.0',
      'A comprehensive tool plugin for file, network, and system operations'
    );
  }

  /**
   * Initializes the plugin with the provided context.
   *
   * Sets up configuration, logger, validates settings, and initializes
   * cache if enabled in the configuration.
   *
   * @param context - The plugin context containing configuration and logger
   */
  async initialize(context: PluginContext): Promise<void> {
    this.config = context.config as ToolPluginConfig;
    this.logger = context.logger;

    this.logger.info('Tool Plugin initializing...', {
      version: this.version,
      config: this.config,
    });

    // Validate configuration
    this.validateConfig();

    // Initialize cache if enabled
    if (this.config.cacheEnabled) {
      await this.initializeCache(context);
    }

    this.logger.info('Tool Plugin initialized successfully');
  }

  /**
   * Cleans up plugin resources and gracefully shuts down operations.
   *
   * Performs cleanup of cache resources and any other allocated resources.
   */
  async cleanup(): Promise<void> {
    this.logger.info('Tool Plugin cleaning up...');

    // Cleanup resources
    await this.cleanupCache();

    this.logger.info('Tool Plugin cleanup completed');
  }

  /**
   * Returns the list of commands provided by this plugin.
   *
   * @returns An array of command instances for file, network, and system operations
   */
  getCommands(): Command[] {
    return [
      new FileToolCommand(this.config, this.logger),
      new NetworkToolCommand(this.config, this.logger),
      new SystemToolCommand(this.config, this.logger),
    ];
  }

  /**
   * Returns the list of skills provided by this plugin.
   *
   * @returns An array of skill instances for data processing operations
   */
  getSkills(): Skill[] {
    return [new DataProcessingSkill(this.config, this.logger)];
  }

  /**
   * Returns the list of hooks provided by this plugin.
   *
   * @returns An array of hook instances for file change monitoring
   */
  getHooks(): Hook[] {
    return [new FileChangeHook(this.config, this.logger)];
  }

  /**
   * Returns the configuration schema for this plugin.
   *
   * @returns The configuration schema defining all available settings
   */
  getConfigSchema(): ConfigSchema {
    return {
      ...this.getFileOperationSchema(),
      ...this.getNetworkOperationSchema(),
      ...this.getCacheOperationSchema(),
      ...this.getRetryOperationSchema(),
    };
  }

  /**
   * Returns file operation configuration schema.
   *
   * @returns File operation schema settings
   */
  private getFileOperationSchema(): ConfigSchema {
    return {
      maxFileSize: {
        type: 'number',
        description: 'Maximum file size for operations (in bytes)',
        default: DEFAULT_MAX_FILE_SIZE,
        min: MIN_FILE_SIZE,
        max: MAX_FILE_SIZE,
      },
    };
  }

  /**
   * Returns network operation configuration schema.
   *
   * @returns Network operation schema settings
   */
  private getNetworkOperationSchema(): ConfigSchema {
    return {
      allowedDomains: {
        type: 'array',
        description: 'List of allowed domains for network operations',
        default: ['api.github.com', 'github.com'],
        itemType: 'string',
      },
      timeout: {
        type: 'number',
        description: 'Operation timeout in milliseconds',
        default: DEFAULT_OPERATION_TIMEOUT,
        min: MIN_OPERATION_TIMEOUT,
        max: MAX_OPERATION_TIMEOUT,
      },
    };
  }

  /**
   * Returns cache operation configuration schema.
   *
   * @returns Cache operation schema settings
   */
  private getCacheOperationSchema(): ConfigSchema {
    return {
      cacheEnabled: {
        type: 'boolean',
        description: 'Enable caching for operations',
        default: true,
      },
      cacheTimeout: {
        type: 'number',
        description: 'Cache timeout in seconds',
        default: DEFAULT_CACHE_TIMEOUT,
        min: MIN_CACHE_TIMEOUT,
        max: MAX_CACHE_TIMEOUT,
      },
    };
  }

  /**
   * Returns retry operation configuration schema.
   *
   * @returns Retry operation schema settings
   */
  private getRetryOperationSchema(): ConfigSchema {
    return {
      retryAttempts: {
        type: 'number',
        description: 'Number of retry attempts for failed operations',
        default: DEFAULT_RETRY_ATTEMPTS,
        min: 0,
        max: MAX_RETRY_ATTEMPTS,
      },
    };
  }

  /**
   * Validates the plugin configuration.
   *
   * Ensures all required configuration values are present and valid.
   * @throws Error if configuration is invalid
   */
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

  /**
   * Initializes the plugin cache.
   *
   * Sets up cache storage with initial plugin information.
   *
   * @param context - The plugin context containing cache API
   */
  private async initializeCache(context: PluginContext): Promise<void> {
    try {
      // Initialize cache storage
      await context.cache.set(
        'plugin:initialized',
        {
          timestamp: Date.now(),
          version: this.version,
        },
        this.config.cacheTimeout
      );

      this.logger.debug('Cache initialized successfully');
    } catch (error) {
      this.logger.warn('Failed to initialize cache', error);
    }
  }

  /**
   * Cleans up plugin cache resources.
   *
   * Performs cleanup of any allocated cache storage and resources.
   */
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
  /**
   * Executes an operation with retry logic and exponential backoff.
   *
   * @param operation - The async operation to execute
   * @param operationName - Name of the operation for logging purposes
   * @returns The result of the operation
   * @throws Error if operation fails after all retry attempts
   */
  protected async withRetry<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    const maxAttempts = this.config.retryAttempts || DEFAULT_RETRY_ATTEMPTS;
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
          const delay = Math.pow(2, attempt - 1) * BASE_RETRY_DELAY;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`${operationName} failed after ${maxAttempts} attempts: ${lastError.message}`);
  }

  /**
   * Validates a file path for security and length constraints.
   *
   * @param filePath - The file path to validate
   * @throws Error if the path is invalid or unsafe
   */
  protected validateFilePath(filePath: string): void {
    // Security validation for file paths
    if (filePath.includes('..')) {
      throw new Error('Path traversal detected');
    }

    if (filePath.startsWith('/etc/') || filePath.startsWith('/sys/')) {
      throw new Error('Access to system directories is not allowed');
    }

    if (filePath.length > MAX_PATH_LENGTH) {
      throw new Error('File path too long');
    }
  }

  /**
   * Validates a URL for protocol and domain constraints.
   *
   * @param url - The URL to validate
   * @throws Error if the URL is invalid or not allowed
   */
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
