import { Command } from '../types';

/**
 * System Tool Command
 *
 * Provides system operations for process management, system information, and resource monitoring
 */
export class SystemToolCommand implements Command {
  private config: any;
  private logger: any;

  /**
   *
   * @param config
   * @param logger
   */
  constructor(config: any, logger: any) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Get command information
   */
  getInfo(): CommandInfo {
    return {
      name: 'system-tool',
      description: 'System operations for process management, system information, and resource monitoring',
      version: '1.0.0',
      usage: 'system-tool <operation> [options]',
      examples: [
        'system-tool info',
        'system-tool processes --list',
        'system-tool memory --usage',
        'system-tool execute --command="ls -la"'
      ]
    };
  }

  /**
   * Execute the system tool command
   * @param args Command arguments
   */
  async execute(args: string[]): Promise<any> {
    const [operation, ...options] = args;

    this.logger.debug(`Executing system tool operation: ${operation}`);

    switch (operation) {
      case 'info':
        return this.getSystemInfo();
      case 'processes':
        return this.getProcessInfo(options);
      case 'memory':
        return this.getMemoryInfo(options);
      case 'disk':
        return this.getDiskInfo(options);
      case 'execute':
        return this.executeCommand(options);
      case 'env':
        return this.getEnvironmentInfo(options);
      default:
        throw new Error(`Unknown system operation: ${operation}`);
    }
  }

  /**
   * Get general system information
   */
  private async getSystemInfo(): Promise<any> {
    try {
      const info = {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        uptime: process.uptime(),
        loadavg: process.platform === 'win32' ? null : process.loadavg(),
        cpus: process.cpuUsage(),
        memory: process.memoryUsage(),
        pid: process.pid,
        ppid: process.ppid,
        title: process.title,
        cwd: process.cwd(),
        execPath: process.execPath,
        execArgv: process.execArgv,
        argv: process.argv
      };

      this.logger.info('Successfully retrieved system information');

      return info;
    } catch (error) {
      this.logger.error('Failed to get system information', error);
      throw error;
    }
  }

  /**
   * Get process information
   * @param options Process options
   */
  private async getProcessInfo(options: string[]): Promise<any> {
    try {
      const listAll = options.includes('--list');

      if (listAll) {
        // In a real implementation, you would use a proper process listing library
        // For now, we'll return basic current process info
        const processInfo = {
          current: {
            pid: process.pid,
            ppid: process.ppid,
            title: process.title,
            cpuUsage: process.cpuUsage(),
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
            cwd: process.cwd()
          }
        };

        this.logger.info('Successfully retrieved process information');

        return processInfo;
      } 
        return {
          pid: process.pid,
          ppid: process.ppid,
          title: process.title,
          cpuUsage: process.cpuUsage(),
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime(),
          cwd: process.cwd()
        };
      
    } catch (error) {
      this.logger.error('Failed to get process information', error);
      throw error;
    }
  }

  /**
   * Get memory information
   * @param options Memory options
   */
  private async getMemoryInfo(options: string[]): Promise<any> {
    try {
      const showUsage = options.includes('--usage');
      const memoryUsage = process.memoryUsage();

      if (showUsage) {
        const info = {
          current: {
            rss: memoryUsage.rss,
            heapTotal: memoryUsage.heapTotal,
            heapUsed: memoryUsage.heapUsed,
            external: memoryUsage.external,
            arrayBuffers: memoryUsage.arrayBuffers
          },
          formatted: {
            rss: this.formatBytes(memoryUsage.rss),
            heapTotal: this.formatBytes(memoryUsage.heapTotal),
            heapUsed: this.formatBytes(memoryUsage.heapUsed),
            external: this.formatBytes(memoryUsage.external),
            arrayBuffers: this.formatBytes(memoryUsage.arrayBuffers)
          },
          heapUsagePercent: ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(2)
        };

        this.logger.info('Successfully retrieved memory usage information');

        return info;
      } 
        return memoryUsage;
      
    } catch (error) {
      this.logger.error('Failed to get memory information', error);
      throw error;
    }
  }

  /**
   * Get disk information
   * @param options Disk options
   */
  private async getDiskInfo(options: string[]): Promise<any> {
    try {
      const path = options.find(opt => opt.startsWith('--path='))?.substring(7) || process.cwd();

      // In a real implementation, you would use proper disk space checking
      // For now, we'll return basic information
      const diskInfo = {
        path,
        available: false,
        message: 'Disk space checking not implemented in this environment'
      };

      this.logger.info(`Retrieved disk information for path: ${path}`);

      return diskInfo;
    } catch (error) {
      this.logger.error('Failed to get disk information', error);
      throw error;
    }
  }

  /**
   * Execute system command
   * @param options Command options
   */
  private async executeCommand(options: string[]): Promise<any> {
    try {
      const commandOption = options.find(opt => opt.startsWith('--command='));
      if (!commandOption) {
        throw new Error('Command is required. Use --command="your command"');
      }

      const command = commandOption.substring(10).replace(/^["']|["']$/g, '');

      // Security check - prevent dangerous commands
      const dangerousCommands = ['rm -rf', 'sudo', 'chmod 777', 'dd if=', 'mkfs', 'format'];
      for (const dangerous of dangerousCommands) {
        if (command.includes(dangerous)) {
          throw new Error(`Dangerous command detected: ${dangerous}`);
        }
      }

      this.logger.info(`Executing command: ${command}`);

      // Use Bun's shell execution
      const result = await Bun.$`sh -c ${command}`.quiet();

      this.logger.info(`Command executed successfully: ${command}`);

      return {
        command,
        stdout: result.stdout?.toString() || '',
        stderr: result.stderr?.toString() || '',
        exitCode: result.exitCode,
        success: result.exitCode === 0
      };
    } catch (error) {
      this.logger.error('Failed to execute command', error);
      throw error;
    }
  }

  /**
   * Get environment information
   * @param options Environment options
   */
  private async getEnvironmentInfo(options: string[]): Promise<any> {
    try {
      const showAll = options.includes('--all');
      const filter = options.find(opt => opt.startsWith('--filter='))?.substring(9);

      const envVars: Record<string, string> = {};

      if (filter) {
        // Filter environment variables by key prefix
        for (const [key, value] of Object.entries(process.env)) {
          if (key.startsWith(filter)) {
            envVars[key] = value || '';
          }
        }
      } else if (showAll) {
        // Return all environment variables (but sanitize sensitive ones)
        for (const [key, value] of Object.entries(process.env)) {
          envVars[key] = this.isSensitiveEnvironmentVariable(key) ? '[REDACTED]' : value || '';
        }
      } else {
        // Return only safe environment variables
        const safeVars = ['PATH', 'HOME', 'USER', 'SHELL', 'LANG', 'NODE_ENV', 'BUN_VERSION'];
        for (const varName of safeVars) {
          if (process.env[varName]) {
            envVars[varName] = process.env[varName] || '';
          }
        }
      }

      this.logger.info('Successfully retrieved environment information');

      return {
        variables: envVars,
        count: Object.keys(envVars).length
      };
    } catch (error) {
      this.logger.error('Failed to get environment information', error);
      throw error;
    }
  }

  /**
   * Check if environment variable is sensitive
   * @param key Environment variable key
   */
  private isSensitiveEnvironmentVariable(key: string): boolean {
    const sensitivePatterns = [
      /key/i,
      /secret/i,
      /password/i,
      /token/i,
      /auth/i,
      /credential/i,
      /private/i,
      /api/i
    ];

    return sensitivePatterns.some(pattern => pattern.test(key));
  }

  /**
   * Format bytes to human readable format
   * @param bytes Number of bytes
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
  }
}

interface CommandInfo {
  name: string;
  description: string;
  version: string;
  usage: string;
  examples: string[];
}