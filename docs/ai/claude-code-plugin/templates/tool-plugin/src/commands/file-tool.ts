import { Command } from './types';

/**
 * File Tool Command
 *
 * Provides file system operations for reading, writing, and managing files
 */
export class FileToolCommand implements Command {
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
      name: 'file-tool',
      description: 'File system operations for reading, writing, and managing files',
      version: '1.0.0',
      usage: 'file-tool <operation> <path> [options]',
      examples: [
        'file-tool read /path/to/file.txt',
        'file-tool write /path/to/file.txt --content="Hello world"',
        'file-tool list /path/to/directory'
      ]
    };
  }

  /**
   * Execute the file tool command
   * @param args Command arguments
   */
  async execute(args: string[]): Promise<any> {
    const [operation, path, ...options] = args;

    this.logger.debug(`Executing file tool operation: ${operation} on path: ${path}`);

    switch (operation) {
      case 'read':
        return this.readFile(path);
      case 'write':
        return this.writeFile(path, options);
      case 'list':
        return this.listFiles(path);
      case 'delete':
        return this.deleteFile(path);
      case 'exists':
        return this.fileExists(path);
      default:
        throw new Error(`Unknown file operation: ${operation}`);
    }
  }

  /**
   * Read file contents
   * @param filePath Path to the file
   */
  private async readFile(filePath: string): Promise<{ content: string; size: number }> {
    this.validateFilePath(filePath);

    try {
      const file = Bun.file(filePath);
      const exists = await file.exists();

      if (!exists) {
        throw new Error(`File not found: ${filePath}`);
      }

      const content = await file.text();
      const size = file.size;

      this.logger.info(`Successfully read file: ${filePath} (${size} bytes)`);

      return { content, size };
    } catch (error) {
      this.logger.error(`Failed to read file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Write content to file
   * @param filePath Path to the file
   * @param options Write options
   */
  private async writeFile(filePath: string, options: string[]): Promise<{ success: boolean; bytesWritten: number }> {
    this.validateFilePath(filePath);

    const contentOption = options.find(opt => opt.startsWith('--content='));
    if (!contentOption) {
      throw new Error('Content is required for write operation. Use --content="your content"');
    }

    const content = contentOption.split('=', 2)[1].replace(/^["']|["']$/g, '');

    try {
      const bytesWritten = await Bun.write(filePath, content);

      this.logger.info(`Successfully wrote ${bytesWritten} bytes to: ${filePath}`);

      return { success: true, bytesWritten };
    } catch (error) {
      this.logger.error(`Failed to write file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * List files in directory
   * @param dirPath Path to the directory
   */
  private async listFiles(dirPath: string): Promise<{ files: string[]; directories: string[] }> {
    this.validateFilePath(dirPath);

    try {
      const files: string[] = [];
      const directories: string[] = [];

      for await (const entry of Bun.scan(dirPath)) {
        const relativePath = entry.path.replace(`${dirPath  }/`, '');

        if (entry.isFile) {
          files.push(relativePath);
        } else if (entry.isDirectory && relativePath !== '') {
          directories.push(relativePath);
        }
      }

      this.logger.info(`Listed ${files.length} files and ${directories.length} directories in: ${dirPath}`);

      return { files, directories };
    } catch (error) {
      this.logger.error(`Failed to list directory: ${dirPath}`, error);
      throw error;
    }
  }

  /**
   * Delete file
   * @param filePath Path to the file
   */
  private async deleteFile(filePath: string): Promise<{ success: boolean }> {
    this.validateFilePath(filePath);

    try {
      await Bun.remove(filePath);

      this.logger.info(`Successfully deleted file: ${filePath}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Check if file exists
   * @param filePath Path to the file
   */
  private async fileExists(filePath: string): Promise<{ exists: boolean }> {
    this.validateFilePath(filePath);

    try {
      const file = Bun.file(filePath);
      const exists = await file.exists();

      this.logger.debug(`File exists check for ${filePath}: ${exists}`);

      return { exists };
    } catch (error) {
      this.logger.error(`Failed to check file existence: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Validate file path for security
   * @param filePath File path to validate
   */
  private validateFilePath(filePath: string): void {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('File path must be a non-empty string');
    }

    if (filePath.includes('..')) {
      throw new Error('Path traversal detected');
    }

    if (filePath.startsWith('/etc/') || filePath.startsWith('/sys/') || filePath.startsWith('/proc/')) {
      throw new Error('Access to system directories is not allowed');
    }

    if (filePath.length > 4096) {
      throw new Error('File path too long');
    }
  }
}

interface CommandInfo {
  name: string;
  description: string;
  version: string;
  usage: string;
  examples: string[];
}