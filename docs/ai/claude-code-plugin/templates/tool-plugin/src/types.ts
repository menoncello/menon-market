/**
 * Base types for the tool plugin system
 */

/**
 * Base plugin class
 */
export abstract class BasePlugin {
  protected name: string;
  protected version: string;
  protected description: string;

  /**
   *
   * @param name
   * @param version
   * @param description
   */
  constructor(name: string, version: string, description: string) {
    this.name = name;
    this.version = version;
    this.description = description;
  }

  /**
   * Get plugin information
   */
  getInfo(): PluginInfo {
    return {
      name: this.name,
      version: this.version,
      description: this.description
    };
  }
}

/**
 * Plugin context interface
 */
export interface PluginContext {
  config: PluginConfig;
  logger: Logger;
  cache?: Cache;
  storage?: Storage;
}

/**
 * Plugin configuration interface
 */
export interface PluginConfig {
  [key: string]: any;
}

/**
 * Logger interface
 */
export interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

/**
 * Cache interface
 */
export interface Cache {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

/**
 * Storage interface
 */
export interface Storage {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
  list: () => Promise<string[]>;
}

/**
 * Plugin information interface
 */
export interface PluginInfo {
  name: string;
  version: string;
  description: string;
}

/**
 * Command interface
 */
export interface Command {
  getInfo: () => CommandInfo;
  execute: (args: string[]) => Promise<any>;
}

/**
 * Command information interface
 */
export interface CommandInfo {
  name: string;
  description: string;
  version: string;
  usage: string;
  examples: string[];
}

/**
 * Skill interface
 */
export interface Skill {
  getInfo: () => SkillInfo;
}

/**
 * Skill information interface
 */
export interface SkillInfo {
  name: string;
  description: string;
  version: string;
  capabilities: string[];
}

/**
 * Hook interface
 */
export interface Hook {
  getInfo: () => HookInfo;
  initialize: () => Promise<void>;
  cleanup: () => Promise<void>;
}

/**
 * Hook information interface
 */
export interface HookInfo {
  name: string;
  description: string;
  version: string;
  events: string[];
}

/**
 * Configuration schema interface
 */
export interface ConfigSchema {
  [key: string]: ConfigField;
}

/**
 * Configuration field interface
 */
export interface ConfigField {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  default?: any;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  itemType?: string;
  properties?: Record<string, ConfigField>;
}

/**
 * Event interface
 */
export interface Event {
  type: string;
  data: any;
  timestamp: number;
  source?: string;
}

/**
 * Event handler interface
 */
export interface EventHandler {
  (event: Event): void | Promise<void>;
}

/**
 * Result interface for operations
 */
export interface OperationResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Pagination options interface
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated result interface
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

/**
 * Search options interface
 */
export interface SearchOptions {
  query?: string;
  filters?: Record<string, any>;
  pagination?: PaginationOptions;
}

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

/**
 * File information interface
 */
export interface FileInfo {
  path: string;
  name: string;
  size: number;
  type: string;
  modified: Date;
  created?: Date;
  isDirectory: boolean;
  isFile: boolean;
}

/**
 * Network response interface
 */
export interface NetworkResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  url: string;
  ok: boolean;
  redirected: boolean;
  type: string;
}

/**
 * Process information interface
 */
export interface ProcessInfo {
  pid: number;
  ppid: number;
  name: string;
  cpuUsage: NodeJS.CpuUsage;
  memoryUsage: NodeJS.MemoryUsage;
  uptime: number;
  startTime: Date;
}

/**
 * System information interface
 */
export interface SystemInfo {
  platform: string;
  arch: string;
  nodeVersion: string;
  uptime: number;
  loadavg?: number[];
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  totalMemory?: number;
  freeMemory?: number;
}

/**
 * Metrics interface
 */
export interface Metrics {
  timestamp: number;
  values: Record<string, number>;
  labels?: Record<string, string>;
}

/**
 * Health check interface
 */
export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: HealthCheckResult[];
  timestamp: number;
}

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Error interface
 */
export interface AppError extends Error {
  code: string;
  statusCode?: number;
  details?: Record<string, any>;
  timestamp: number;
}

/**
 * Progress interface
 */
export interface Progress {
  current: number;
  total: number;
  percentage: number;
  message?: string;
  stage?: string;
}

/**
 * Task interface
 */
export interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress?: Progress;
  result?: any;
  error?: AppError;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * Task options interface
 */
export interface TaskOptions {
  timeout?: number;
  retries?: number;
  priority?: number;
  metadata?: Record<string, any>;
}

/**
 * Cache entry interface
 */
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl?: number;
  createdAt: number;
  accessedAt: number;
  hits: number;
}

/**
 * Rate limit interface
 */
export interface RateLimit {
  windowMs: number;
  maxRequests: number;
  currentRequests: number;
  resetTime: number;
}

/**
 * API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
  metadata?: {
    requestId?: string;
    timestamp: number;
    duration?: number;
    version?: string;
  };
}