/**
 * Simple Logger for Skill Loader
 * Provides basic logging functionality that can be replaced with a more sophisticated logger
 */

/** Error log level */
const LOG_LEVEL_ERROR = 0;

/** Warning log level */
const LOG_LEVEL_WARN = 1;

/** Info log level */
const LOG_LEVEL_INFO = 2;

/** Debug log level */
const LOG_LEVEL_DEBUG = 3;

/**
 * Log levels enumeration
 */
export enum LogLevel {
  ERROR = LOG_LEVEL_ERROR,
  WARN = LOG_LEVEL_WARN,
  INFO = LOG_LEVEL_INFO,
  DEBUG = LOG_LEVEL_DEBUG,
}

/**
 * Simple logger interface
 */
export interface Logger {
  error: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
}

/**
 * Log output strategy interface
 */
interface LogOutputStrategy {
  write: (level: LogLevel, formattedMessage: string, args: unknown[]) => void;
}

/**
 * Console output strategy for development logging
 */
class ConsoleOutputStrategy {
  private readonly prefix: string;

  /**
   * Create a new console output strategy
   * @param {string} prefix - Log message prefix
   */
  constructor(prefix = '[SkillLoader]') {
    this.prefix = prefix;
  }

  /**
   * Write log message to console
   * @param {LogLevel} level - Log level
   * @param {string} formattedMessage - Formatted log message
   * @param {unknown[]} args - Additional arguments
   */
  write = (level: LogLevel, formattedMessage: string, args: unknown[]): void => {
    const levelName = this.getLevelName(level);
    const message = `${this.prefix} ${levelName} ${formattedMessage}`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(message, ...args);
        break;
      case LogLevel.WARN:
        console.warn(message, ...args);
        break;
      case LogLevel.INFO:
        console.info(message, ...args);
        break;
      case LogLevel.DEBUG:
        // Only log debug in development environment
        if (process.env.NODE_ENV === 'development') {
          console.debug(message, ...args);
        }
        break;
    }
  };

  /**
   * Get string representation of log level
   * @param {LogLevel} level - Log level
   * @returns {string} String representation
   */
  private getLevelName = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.ERROR:
        return 'ERROR';
      case LogLevel.WARN:
        return 'WARN';
      case LogLevel.INFO:
        return 'INFO';
      case LogLevel.DEBUG:
        return 'DEBUG';
      default:
        return 'UNKNOWN';
    }
  };
}

/**
 * Console-based logger implementation using strategy pattern
 */
export class ConsoleLogger implements Logger {
  private readonly outputStrategy: LogOutputStrategy;

  /**
   * Create a new console logger
   * @param {LogOutputStrategy} outputStrategy - Output strategy to use
   */
  constructor(outputStrategy?: LogOutputStrategy) {
    this.outputStrategy = outputStrategy || new ConsoleOutputStrategy();
  }

  /**
   * Log error message
   * @param {string} message - Log message
   * @param {...unknown[]} args - Additional arguments
   */
  error(message: string, ...args: unknown[]): void {
    this.outputStrategy.write(LogLevel.ERROR, message, args);
  }

  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {...unknown[]} args - Additional arguments
   */
  warn(message: string, ...args: unknown[]): void {
    this.outputStrategy.write(LogLevel.WARN, message, args);
  }

  /**
   * Log info message
   * @param {string} message - Log message
   * @param {...unknown[]} args - Additional arguments
   */
  info(message: string, ...args: unknown[]): void {
    this.outputStrategy.write(LogLevel.INFO, message, args);
  }

  /**
   * Log debug message
   * @param {string} message - Log message
   * @param {...unknown[]} args - Additional arguments
   */
  debug(message: string, ...args: unknown[]): void {
    this.outputStrategy.write(LogLevel.DEBUG, message, args);
  }
}

/** Static message for disabled logging */
const LOGGING_DISABLED_MESSAGE = 'Logging disabled';

/**
 * No-op logger for testing and production scenarios
 * Implements the Logger interface but performs no operations
 */
export class NoOpLogger implements Logger {
  /**
   * No-op error method
   * @param {string} message - Log message (unused)
   * @param {unknown[]} args - Additional arguments (unused)
   */
  error = (message: string, ...args: unknown[]): void => {
    // No operation performed - logging is disabled
    // In test environments, you might want to track that this was called
    if (process.env.NODE_ENV === 'test' && process.env.VERIFY_NOOP_CALLS) {
      // Optional verification for testing that logging methods are called
      console.debug(`${LOGGING_DISABLED_MESSAGE}: ERROR - ${message}`, ...args);
    }
  };

  /**
   * No-op warn method
   * @param {string} message - Log message (unused)
   * @param {unknown[]} args - Additional arguments (unused)
   */
  warn = (message: string, ...args: unknown[]): void => {
    // No operation performed - logging is disabled
    if (process.env.NODE_ENV === 'test' && process.env.VERIFY_NOOP_CALLS) {
      console.debug(`${LOGGING_DISABLED_MESSAGE}: WARN - ${message}`, ...args);
    }
  };

  /**
   * No-op info method
   * @param {string} message - Log message (unused)
   * @param {unknown[]} args - Additional arguments (unused)
   */
  info = (message: string, ...args: unknown[]): void => {
    // No operation performed - logging is disabled
    if (process.env.NODE_ENV === 'test' && process.env.VERIFY_NOOP_CALLS) {
      console.debug(`${LOGGING_DISABLED_MESSAGE}: INFO - ${message}`, ...args);
    }
  };

  /**
   * No-op debug method
   * @param {string} message - Log message (unused)
   * @param {unknown[]} args - Additional arguments (unused)
   */
  debug = (message: string, ...args: unknown[]): void => {
    // No operation performed - logging is disabled
    if (process.env.NODE_ENV === 'test' && process.env.VERIFY_NOOP_CALLS) {
      console.debug(`${LOGGING_DISABLED_MESSAGE}: DEBUG - ${message}`, ...args);
    }
  };
}

/**
 * Default logger instance
 */
export const defaultLogger: Logger = new ConsoleLogger();
