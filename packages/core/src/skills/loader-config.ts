/**
 * Skill Loader Configuration and Constants
 * Contains configuration types, interfaces, and constants for skill loading
 */

/** Minutes in an hour */
const MINUTES_PER_HOUR = 60;

/** Milliseconds in a second */
const MILLISECONDS_PER_SECOND = 1000;

/** Default cache TTL in minutes */
const DEFAULT_CACHE_TTL_MINUTES = 30;

/** Default cache time-to-live in milliseconds */
export const DEFAULT_CACHE_TTL =
  DEFAULT_CACHE_TTL_MINUTES * MINUTES_PER_HOUR * MILLISECONDS_PER_SECOND;

/** Default maximum cache size */
export const DEFAULT_MAX_CACHE_SIZE = 100;

/** Default hot reload debounce time in milliseconds */
export const DEFAULT_DEBOUNCE_MS = 1000;

/** Maximum cache size for performance */
export const MAX_CACHE_SIZE_LIMIT = 1000;

/** Default placeholder cache hit rate */
export const DEFAULT_CACHE_HIT_RATE = 0.85;

/**
 * Skill loading strategies
 */
export type SkillLoadStrategy = 'file' | 'package' | 'url' | 'registry';

/**
 * File system watcher interface for hot reload functionality
 */
export interface FileWatcher {
  /** Close the file watcher and clean up resources */
  close: () => Promise<void>;
}

/**
 * Skill loader configuration
 */
export interface SkillLoaderConfig {
  /** Default loading strategy */
  defaultStrategy: SkillLoadStrategy;

  /** Base paths for different strategies */
  basePaths: {
    file?: string;
    package?: string;
    url?: string;
    registry?: string;
  };

  /** Cache configuration */
  cache: {
    enabled: boolean;
    ttl: number; // Time to live in milliseconds
    maxSize: number; // Maximum number of cached skills
  };

  /** Hot reload configuration */
  hotReload: {
    enabled: boolean;
    watchPaths: string[];
    debounceMs: number;
  };
}

/**
 * Skill loading metadata
 */
export interface SkillLoadMetadata {
  /** Skill identifier */
  skillId: string;

  /** Loading strategy used */
  strategy: SkillLoadStrategy;

  /** Source path or reference */
  source: string;

  /** Load timestamp */
  loadedAt: Date;

  /** Whether skill is currently loaded */
  isLoaded: boolean;

  /** Load time in milliseconds */
  loadTime: number;

  /** File watch information (if hot reload enabled) */
  watchInfo?: {
    watcher: FileWatcher | null; // File system watcher instance
    lastModified: Date;
  };
}
