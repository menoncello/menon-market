/**
 * Simple logging utility for orchestration module
 * Replaces console statements with proper logging abstraction
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface Logger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

/**
 * Log output interface for abstraction
 */
interface LogOutput {
  write: (level: LogLevel, message: string, args: unknown[]) => void;
}

/**
 * Console-based log output implementation for development
 */
class ConsoleLogOutput {
  /**
   * Write log message to console
   * @param {LogLevel} level - Log level
   * @param {string} message - Formatted log message
   * @param {unknown[]} args - Additional arguments
   */
  write = (level: LogLevel, message: string, args: unknown[]): void => {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(message, ...args);
        break;
      case LogLevel.INFO:
        console.info(message, ...args);
        break;
      case LogLevel.WARN:
        console.warn(message, ...args);
        break;
      case LogLevel.ERROR:
        console.error(message, ...args);
        break;
    }
  };
}

/**
 * No-op log output for production when logging is disabled
 */
class NoOpLogOutput {
  /**
   * No-op write method for production when logging is disabled
   * @param {LogLevel} _level - Log level (unused)
   * @param {string} _message - Formatted log message (unused)
   * @param {unknown[]} _args - Additional arguments (unused)
   */
  write = (_level: LogLevel, _message: string, _args: unknown[]): void => {
    // Intentionally empty for production
  };
}

/**
 * Simple logger implementation that uses configurable output
 * In a production environment, this could be replaced with a more sophisticated logging system
 */
export class SimpleLogger implements Logger {
  private readonly prefix: string;
  private readonly output: LogOutput;
  private readonly enabledLevels: Set<LogLevel>;

  /**
   * Create a new SimpleLogger instance
   * @param {string} prefix - The prefix to add to all log messages
   * @param {LogOutput} output - Log output implementation
   * @param {LogLevel[]} enabledLevels - Log levels that are enabled
   */
  constructor(prefix = '[SubagentRegistry]', output?: LogOutput, enabledLevels?: LogLevel[]) {
    this.prefix = prefix;

    // Select output based on environment
    if (output) {
      this.output = output;
    } else if (process.env.NODE_ENV === 'production' && !process.env.LOGGING_ENABLED) {
      this.output = new NoOpLogOutput();
    } else {
      this.output = new ConsoleLogOutput();
    }

    // Determine enabled log levels
    if (enabledLevels) {
      this.enabledLevels = new Set(enabledLevels);
    } else if (process.env.NODE_ENV === 'development') {
      this.enabledLevels = new Set([LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]);
    } else {
      this.enabledLevels = new Set([LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]);
    }
  }

  private formatMessage = (message: string): string => {
    return `${this.prefix} ${message}`;
  };

  private shouldLog = (level: LogLevel): boolean => {
    return this.enabledLevels.has(level);
  };

  debug = (message: string, ...args: unknown[]): void => {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.output.write(LogLevel.DEBUG, this.formatMessage(message), args);
    }
  };

  info = (message: string, ...args: unknown[]): void => {
    if (this.shouldLog(LogLevel.INFO)) {
      this.output.write(LogLevel.INFO, this.formatMessage(message), args);
    }
  };

  warn = (message: string, ...args: unknown[]): void => {
    if (this.shouldLog(LogLevel.WARN)) {
      this.output.write(LogLevel.WARN, this.formatMessage(message), args);
    }
  };

  error = (message: string, ...args: unknown[]): void => {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.output.write(LogLevel.ERROR, this.formatMessage(message), args);
    }
  };
}

/** Default logger instance */
export const logger = new SimpleLogger();
