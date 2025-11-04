#!/usr/bin/env node

/**
 * Marketplace Packaging Script
 * Creates distribution packages for the menon marketplace
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MarketplacePackager {
  constructor() {
    this.marketplacePath = path.dirname(__dirname);
    this.marketplaceConfig = null;
    this.distPath = path.join(this.marketplacePath, 'dist');
    this.packageInfo = {
      version: '1.0.0',
      buildTime: new Date().toISOString(),
      components: [],
    };
  }

  /**
   * Package the marketplace for distribution
   */
  async package() {
    console.log('📦 Packaging marketplace...');

    try {
      // Load configuration
      await this.loadMarketplaceConfig();

      // Clean previous builds
      await this.cleanBuild();

      // Copy configuration files
      await this.copyConfiguration();

      // Generate documentation
      await this.generateDocumentation();

      // Create package metadata
      await this.createPackageMetadata();

      console.log('✅ Marketplace packaging completed successfully!');
      this.printSummary();
    } catch (error) {
      console.error('❌ Packaging failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Load marketplace configuration
   */
  async loadMarketplaceConfig() {
    const configPath = path.join(this.marketplacePath, 'marketplace.json');

    if (!fs.existsSync(configPath)) {
      throw new Error('marketplace.json not found');
    }

    const configContent = fs.readFileSync(configPath, 'utf8');
    this.marketplaceConfig = JSON.parse(configContent);
    this.packageInfo.version = this.marketplaceConfig.version;
    console.log(`✅ Loaded marketplace configuration v${this.marketplaceConfig.version}`);
  }

  /**
   * Clean previous builds
   */
  async cleanBuild() {
    console.log('🧹 Cleaning previous builds...');

    if (fs.existsSync(this.distPath)) {
      fs.rmSync(this.distPath, { recursive: true, force: true });
    }

    fs.mkdirSync(this.distPath, { recursive: true });
    console.log('✅ Build directory cleaned');
  }

  /**
   * Copy configuration files
   */
  async copyConfiguration() {
    console.log('📋 Copying configuration files...');

    const configFiles = ['marketplace.json', 'package.json', 'README.md'];

    for (const file of configFiles) {
      const srcPath = path.join(this.marketplacePath, file);
      const destPath = path.join(this.distPath, file);

      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✅ Copied ${file}`);
      } else {
        console.log(`  ⚠️  ${file} not found, skipping`);
      }
    }

    // Copy plugins and agents
    await this.copyComponents();
  }

  /**
   * Copy marketplace components
   */
  async copyComponents() {
    // Copy plugins
    const pluginsPath = path.join(this.marketplacePath, 'plugins');
    if (fs.existsSync(pluginsPath)) {
      const pluginsDistPath = path.join(this.distPath, 'plugins');
      await this.copyDirectory(pluginsPath, pluginsDistPath, {
        exclude: ['node_modules', 'dist', '.git', 'coverage'],
      });
    }

    // Copy agents
    const agentsPath = path.join(this.marketplacePath, 'agents');
    if (fs.existsSync(agentsPath)) {
      const agentsDistPath = path.join(this.distPath, 'agents');
      await this.copyDirectory(agentsPath, agentsDistPath, {
        exclude: ['node_modules', 'dist', '.git', 'coverage'],
      });
    }
  }

  /**
   * Generate documentation
   */
  async generateDocumentation() {
    console.log('📚 Generating documentation...');

    const docsPath = path.join(this.distPath, 'docs');
    fs.mkdirSync(docsPath, { recursive: true });

    // Generate component documentation
    const componentsDoc = this.generateComponentsDocumentation();
    fs.writeFileSync(path.join(docsPath, 'components.md'), componentsDoc);

    console.log('  ✅ Documentation generated');
  }

  /**
   * Generate components documentation
   */
  generateComponentsDocumentation() {
    let doc = '# Marketplace Components\n\n';
    doc += `Generated: ${this.packageInfo.buildTime}\n\n`;

    if (this.marketplaceConfig.plugins) {
      doc += '## Plugins\n\n';
      for (const plugin of this.marketplaceConfig.plugins) {
        doc += `### ${plugin.name}\n`;
        doc += `- **Version**: ${plugin.version}\n`;
        doc += `- **Type**: ${plugin.type}\n`;
        doc += `- **Description**: ${plugin.description}\n`;
        doc += `- **Status**: ${plugin.status}\n`;
        if (plugin.skills && plugin.skills.length > 0) {
          doc += `- **Skills**: ${plugin.skills.join(', ')}\n`;
        }
        doc += '\n';
      }
    }

    if (this.marketplaceConfig.agents) {
      doc += '## Agents\n\n';
      for (const agent of this.marketplaceConfig.agents) {
        doc += `### ${agent.name}\n`;
        doc += `- **Version**: ${agent.version}\n`;
        doc += `- **Type**: ${agent.type}\n`;
        doc += `- **Description**: ${agent.description}\n`;
        doc += `- **Status**: ${agent.status}\n`;
        if (agent.skills && agent.skills.length > 0) {
          doc += `- **Skills**: ${agent.skills.join(', ')}\n`;
        }
        doc += '\n';
      }
    }

    return doc;
  }

  /**
   * Create package metadata
   */
  async createPackageMetadata() {
    console.log('📄 Creating package metadata...');

    const metadata = {
      ...this.marketplaceConfig,
      ...this.packageInfo,
      buildInfo: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        buildTime: this.packageInfo.buildTime,
      },
    };

    fs.writeFileSync(
      path.join(this.distPath, 'package-info.json'),
      JSON.stringify(metadata, null, 2)
    );

    console.log('  ✅ Package metadata created');
  }

  /**
   * Copy directory with exclusion
   */
  async copyDirectory(src, dest, options = {}) {
    const { exclude = [] } = options;

    if (!fs.existsSync(src)) {
      return;
    }

    fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      // Skip excluded directories/files
      if (exclude.includes(entry.name)) {
        continue;
      }

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath, options);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Print packaging summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 PACKAGING SUMMARY');
    console.log('='.repeat(50));

    console.log(`📦 Version: ${this.marketplaceConfig.version}`);
    console.log(`📅 Build Time: ${this.packageInfo.buildTime}`);
    console.log(`📁 Distribution Path: ${this.distPath}`);

    console.log('\n📈 Components:');
    this.packageInfo.components.forEach(component => {
      console.log(`  - ${component.type}: ${component.name} v${component.version}`);
    });

    console.log(`\n📊 Total Components: ${this.packageInfo.components.length}`);
    console.log('✅ Marketplace ready for distribution!');
  }
}

// Run packaging
const packager = new MarketplacePackager();
packager.package().catch(error => {
  console.error('Packaging script failed:', error);
  process.exit(1);
});

export default MarketplacePackager;
