/**
 * Skill Loading Strategies
 * Implements different strategies for loading skills from various sources
 */

import { FileWatcher } from './loader-config';
import { DEFAULT_RESOURCE_USAGE } from './loader-constants';
import { SkillFactory } from './skill-factory';
import { SkillLoadOptions } from './skill-metadata';
import { SkillDefinition } from './types';
import { UrlSkillLoader } from './url-loader';

/**
 * Skill loading strategies implementation
 */
export class SkillLoadingStrategies {
  private basePaths: Record<string, string | undefined>;

  /**
   * Create skill loading strategies
   * @param {Record<string, string | undefined>} basePaths - Base paths for different strategies
   */
  constructor(basePaths: Record<string, string | undefined>) {
    this.basePaths = basePaths;
  }

  /**
   * Load skill from file system
   * @param {string} skillPath - Path to skill file
   * @returns {Promise<SkillDefinition>} Loaded skill definition
   * @throws {Error} If file cannot be loaded or parsed
   */
  async loadFromFile(skillPath: string): Promise<SkillDefinition> {
    const fullPath = this.resolvePath('file', skillPath);

    // Determine file type based on extension
    const extension = fullPath.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'json':
        return this.loadFromJsonFile(fullPath);
      case 'js':
      case 'ts':
        return this.loadFromModuleFile(fullPath);
      case 'yaml':
      case 'yml':
        return this.loadFromYamlFile(fullPath);
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }

  /**
   * Load skill from JSON file
   * @param {string} filePath - Path to JSON file
   * @returns {Promise<SkillDefinition>} Loaded skill definition
   * @private
   */
  private async loadFromJsonFile(filePath: string): Promise<SkillDefinition> {
    const fs = await import('fs/promises');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as SkillDefinition;
  }

  /**
   * Load skill from JavaScript/TypeScript module
   * @param {string} filePath - Path to module file
   * @returns {Promise<SkillDefinition>} Loaded skill definition
   * @private
   */
  private async loadFromModuleFile(filePath: string): Promise<SkillDefinition> {
    const module = await import(filePath);

    return this.extractSkillFromModule(module, filePath);
  }

  /**
   * Extract skill definition from module
   * @param {unknown} module - Imported module
   * @param {string} filePath - File path for error reporting
   * @returns {SkillDefinition} Skill definition
   * @private
   */
  private extractSkillFromModule(module: unknown, filePath: string): SkillDefinition {
    const moduleObj = module as Record<string, unknown>;

    if (moduleObj.default && typeof moduleObj.default === 'object') {
      return moduleObj.default as SkillDefinition;
    } else if (moduleObj.skill && typeof moduleObj.skill === 'object') {
      return moduleObj.skill as SkillDefinition;
    }
    throw new Error(`Module ${filePath} does not export a valid skill definition`);
  }

  /**
   * Load skill from YAML file
   * @param {string} filePath - Path to YAML file
   * @returns {Promise<SkillDefinition>} Loaded skill definition
   * @private
   */
  private async loadFromYamlFile(filePath: string): Promise<SkillDefinition> {
    const fs = await import('fs/promises');
    const yaml = await import('yaml');
    const content = await fs.readFile(filePath, 'utf-8');
    return yaml.parse(content) as SkillDefinition;
  }

  /**
   * Load skill from npm package
   * @param {string} skillPath - Package name or path
   * @returns {Promise<SkillDefinition>} Loaded skill definition
   * @throws {Error} If package cannot be loaded
   */
  async loadFromPackage(skillPath: string): Promise<SkillDefinition> {
    const packagePath = this.resolvePath('package', skillPath);

    return this.loadWithErrorHandling(
      async () => {
        // Try to actually import the package to verify it exists
        try {
          await import(packagePath);
        } catch {
          throw new Error(`Package not found: ${packagePath}`);
        }

        return this.createPackageSkill(skillPath, packagePath);
      },
      'package',
      packagePath
    );
  }

  /**
   * Load a skill with error handling
   * @param {() => SkillDefinition | Promise<SkillDefinition>} loadFunction - Function to load the skill
   * @param {string} sourceType - Type of source for error reporting
   * @param {string} sourcePath - Path for error reporting
   * @returns {Promise<SkillDefinition>} Loaded skill definition
   * @private
   */
  private async loadWithErrorHandling(
    loadFunction: () => SkillDefinition | Promise<SkillDefinition>,
    sourceType: string,
    sourcePath: string
  ): Promise<SkillDefinition> {
    try {
      return await loadFunction();
    } catch (error) {
      throw SkillFactory.createLoadingError(sourceType, sourcePath, error);
    }
  }

  /**
   * Create a package-based skill definition
   * @param {string} skillPath - Original skill path
   * @param {string} packagePath - Resolved package path
   * @returns {SkillDefinition} Package skill definition
   * @private
   */
  private createPackageSkill(skillPath: string, packagePath: string): SkillDefinition {
    return SkillFactory.createBaseSkill({
      skillPath,
      name: `Package Skill: ${skillPath}`,
      description: `Skill loaded from package: ${packagePath}`,
      category: 'package' as const,
      author: 'Package Loader',
      tags: ['package', 'npm'],
      resourceUsage: { ...DEFAULT_RESOURCE_USAGE, network: 'none' as const },
    });
  }

  /**
   * Load skill from URL
   * @param {string} skillPath - URL to skill resource
   * @param {SkillLoadOptions} options - Loading options
   * @returns {Promise<SkillDefinition>} Loaded skill definition
   * @throws {Error} If URL cannot be fetched or parsed
   */
  async loadFromUrl(skillPath: string, options: SkillLoadOptions = {}): Promise<SkillDefinition> {
    const url = this.resolvePath('url', skillPath);

    return this.loadWithErrorHandling(
      () => this.createUrlSkill(skillPath, url, options),
      'URL',
      url
    );
  }

  /**
   * Create a URL-based skill definition
   * @param {string} _skillPath - Original skill path
   * @param {string} url - Resolved URL
   * @param {SkillLoadOptions} options - Loading options
   * @returns {SkillDefinition} URL skill definition
   * @private
   */
  private async createUrlSkill(
    _skillPath: string,
    url: string,
    options: SkillLoadOptions = {}
  ): Promise<SkillDefinition> {
    const response = await UrlSkillLoader.fetchFromUrl(url);
    UrlSkillLoader.validateResponse(response);
    const skillData = await UrlSkillLoader.readResponseText(response, url);
    UrlSkillLoader.validateResponseContent(skillData, url);

    return UrlSkillLoader.parseSkillData(skillData, url, options);
  }

  /**
   * Load skill from registry
   * @param {string} _skillPath - Registry identifier
   * @returns {Promise<SkillDefinition>} Loaded skill definition
   * @throws {Error} If registry entry cannot be found or loaded
   */
  async loadFromRegistry(_skillPath: string): Promise<SkillDefinition> {
    throw new Error('Registry loading not yet implemented');
  }

  /**
   * Set up file watcher for hot reload
   * @param {string} _skillPath - Path to watch
   * @param {(_skillPath: string) => void} _onChange - Callback when file changes
   * @returns {Promise<FileWatcher>} File watcher instance
   */
  async setupFileWatcher(
    _skillPath: string,
    _onChange: (_skillPath: string) => void
  ): Promise<FileWatcher> {
    // In a real implementation, this would use fs.watch or chokidar
    const mockWatcher: FileWatcher = {
      close: async () => {
        // Mock cleanup
      },
    };

    return mockWatcher;
  }

  /**
   * Resolve path using base path configuration
   * @param {string} strategy - Loading strategy
   * @param {string} skillPath - Skill path to resolve
   * @returns {string} Resolved path
   * @private
   */
  resolvePath(strategy: string, skillPath: string): string {
    const basePath = this.basePaths[strategy];
    if (
      basePath &&
      !skillPath.startsWith('http') &&
      !skillPath.startsWith('@') &&
      !skillPath.startsWith('/')
    ) {
      return `${basePath}/${skillPath}`;
    }
    return skillPath;
  }

  /**
   * Load skill by strategy
   * @param {string} strategy - Loading strategy to use
   * @param {string} skillPath - Path to the skill
   * @param {SkillLoadOptions} options - Loading options
   * @returns {Promise<SkillDefinition>} Loaded skill definition
   */
  async loadSkillByStrategy(
    strategy: string,
    skillPath: string,
    options: SkillLoadOptions = {}
  ): Promise<SkillDefinition> {
    switch (strategy) {
      case 'file':
        return this.loadFromFile(skillPath);
      case 'package':
        return this.loadFromPackage(skillPath);
      case 'url':
        return this.loadFromUrl(skillPath, options);
      case 'registry':
        return this.loadFromRegistry(skillPath);
      default:
        throw new Error(`Unsupported loading strategy: ${strategy}`);
    }
  }
}
