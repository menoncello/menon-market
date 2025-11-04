/**
 * Menon Core Plugin
 * Core functionality plugin for the menon ecosystem
 */

export interface MenonCoreConfig {
  version: string;
  features: string[];
}

/**
 *
 */
export class MenonCore {
  public readonly name = 'menon-core';
  public readonly version = '1.0.0';

  private config: MenonCoreConfig;

  /**
   *
   * @param config
   */
  constructor(config?: Partial<MenonCoreConfig>) {
    this.config = {
      version: '1.0.0',
      features: [],
      ...config,
    };
  }

  /**
   * Initialize the plugin
   */
  async initialize(): Promise<void> {
    console.log(`Initializing ${this.name} v${this.version}`);
  }

  /**
   * Get plugin information
   */
  getInfo(): MenonCoreConfig {
    return { ...this.config };
  }

  /**
   * Add a feature to the core plugin
   * @param feature
   */
  addFeature(feature: string): void {
    if (!this.config.features.includes(feature)) {
      this.config.features.push(feature);
    }
  }

  /**
   * Remove a feature from the core plugin
   * @param feature
   */
  removeFeature(feature: string): void {
    const index = this.config.features.indexOf(feature);
    if (index > -1) {
      this.config.features.splice(index, 1);
    }
  }

  /**
   * List all available features
   */
  listFeatures(): string[] {
    return [...this.config.features];
  }
}

export default MenonCore;
