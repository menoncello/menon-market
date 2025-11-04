#!/usr/bin/env node

/**
 * Marketplace Validation Script
 * Validates the structure and configuration of the menon marketplace
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MarketplaceValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.marketplacePath = process.cwd();
    this.marketplaceConfig = null;
  }

  /**
   * Validate the marketplace structure and configuration
   */
  async validate() {
    console.log('🔍 Validating marketplace...');

    try {
      // Load marketplace configuration
      await this.loadMarketplaceConfig();

      // Validate structure
      this.validateMarketplaceStructure();

      // Validate plugins
      await this.validatePlugins();

      // Validate agents
      await this.validateAgents();

      // Validate skills
      await this.validateSkills();

      // Validate dependencies
      this.validateDependencies();

      // Generate report
      this.generateReport();
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Load marketplace configuration
   */
  async loadMarketplaceConfig() {
    const configPath = path.join(this.marketplacePath, 'marketplace.json');

    if (!fs.existsSync(configPath)) {
      this.errors.push('marketplace.json not found');
      return;
    }

    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      this.marketplaceConfig = JSON.parse(configContent);
      console.log('✅ Marketplace configuration loaded');
    } catch (error) {
      this.errors.push(`Invalid marketplace.json: ${error.message}`);
    }
  }

  /**
   * Validate marketplace directory structure
   */
  validateMarketplaceStructure() {
    const requiredDirs = ['plugins', 'agents', 'scripts'];

    requiredDirs.forEach(dir => {
      const dirPath = path.join(this.marketplacePath, dir);
      if (!fs.existsSync(dirPath)) {
        this.errors.push(`Required directory missing: ${dir}`);
      } else {
        console.log(`✅ Directory exists: ${dir}`);
      }
    });

    const requiredFiles = ['package.json', 'marketplace.json', 'README.md'];

    requiredFiles.forEach(file => {
      const filePath = path.join(this.marketplacePath, file);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Required file missing: ${file}`);
      } else {
        console.log(`✅ File exists: ${file}`);
      }
    });
  }

  /**
   * Validate all plugins
   */
  async validatePlugins() {
    if (!this.marketplaceConfig || !this.marketplaceConfig.plugins) {
      this.errors.push('No plugins defined in marketplace configuration');
      return;
    }

    console.log('\n📦 Validating plugins...');

    for (const plugin of this.marketplaceConfig.plugins) {
      await this.validatePlugin(plugin);
    }
  }

  /**
   * Validate individual plugin
   */
  async validatePlugin(plugin) {
    const pluginPath = path.join(this.marketplacePath, plugin.path);

    if (!fs.existsSync(pluginPath)) {
      this.errors.push(`Plugin path does not exist: ${plugin.path}`);
      return;
    }

    console.log(`  🔍 Validating plugin: ${plugin.name}`);

    // Check required files
    const requiredFiles = ['package.json', 'README.md'];
    requiredFiles.forEach(file => {
      const filePath = path.join(pluginPath, file);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Plugin ${plugin.name} missing required file: ${file}`);
      }
    });

    // Validate package.json
    const packagePath = path.join(pluginPath, 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        const packageContent = fs.readFileSync(packagePath, 'utf8');
        const packageConfig = JSON.parse(packageContent);

        if (packageConfig.name !== plugin.name) {
          this.warnings.push(`Plugin name mismatch: ${plugin.name} vs ${packageConfig.name}`);
        }

        if (packageConfig.version !== plugin.version) {
          this.warnings.push(
            `Plugin version mismatch: ${plugin.name} ${plugin.version} vs ${packageConfig.version}`
          );
        }

        console.log(`  ✅ Plugin ${plugin.name} package.json valid`);
      } catch (error) {
        this.errors.push(`Plugin ${plugin.name} has invalid package.json: ${error.message}`);
      }
    }

    // Check for TypeScript configuration
    const tsconfigPath = path.join(pluginPath, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      this.warnings.push(`Plugin ${plugin.name} missing TypeScript configuration`);
    }

    // Check for ESLint configuration
    const eslintPath = path.join(pluginPath, 'eslint.config.js').replace(/\\/g, '');
    if (!fs.existsSync(eslintPath)) {
      this.warnings.push(`Plugin ${plugin.name} missing ESLint configuration`);
    }
  }

  /**
   * Validate all agents
   */
  async validateAgents() {
    if (!this.marketplaceConfig || !this.marketplaceConfig.agents) {
      console.log('\n🤖 No agents defined in marketplace');
      return;
    }

    console.log('\n🤖 Validating agents...');

    for (const agent of this.marketplaceConfig.agents) {
      await this.validateAgent(agent);
    }
  }

  /**
   * Validate individual agent
   */
  async validateAgent(agent) {
    const agentPath = path.join(this.marketplacePath, agent.path);

    if (!fs.existsSync(agentPath)) {
      this.errors.push(`Agent path does not exist: ${agent.path}`);
      return;
    }

    console.log(`  🔍 Validating agent: ${agent.name}`);

    // Check required files
    const requiredFiles = ['package.json', 'README.md'];
    requiredFiles.forEach(file => {
      const filePath = path.join(agentPath, file);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Agent ${agent.name} missing required file: ${file}`);
      }
    });

    // Check for main agent file
    const mainIndexPath = path.join(agentPath, 'index.ts');
    if (!fs.existsSync(mainIndexPath)) {
      this.errors.push(`Agent ${agent.name} missing main index.ts file`);
    }

    // Validate package.json
    const packagePath = path.join(agentPath, 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        const packageContent = fs.readFileSync(packagePath, 'utf8');
        const packageConfig = JSON.parse(packageContent);

        if (packageConfig.name !== agent.name) {
          this.warnings.push(`Agent name mismatch: ${agent.name} vs ${packageConfig.name}`);
        }

        if (packageConfig.version !== agent.version) {
          this.warnings.push(
            `Agent version mismatch: ${agent.name} ${agent.version} vs ${packageConfig.version}`
          );
        }

        console.log(`  ✅ Agent ${agent.name} package.json valid`);
      } catch (error) {
        this.errors.push(`Agent ${agent.name} has invalid package.json: ${error.message}`);
      }
    }
  }

  /**
   * Validate skills
   */
  async validateSkills() {
    if (!this.marketplaceConfig || !this.marketplaceConfig.skills) {
      console.log('\n🎯 No skills defined in marketplace');
      return;
    }

    console.log('\n🎯 Validating skills...');

    for (const skill of this.marketplaceConfig.skills) {
      await this.validateSkill(skill);
    }
  }

  /**
   * Validate individual skill
   */
  async validateSkill(skill) {
    const skillPath = path.join(this.marketplacePath, skill.path);

    if (!fs.existsSync(skillPath)) {
      this.errors.push(`Skill path does not exist: ${skill.path}`);
      return;
    }

    console.log(`  🔍 Validating skill: ${skill.name}`);

    // Check for skill definition file
    const skillMdPath = path.join(skillPath, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) {
      this.warnings.push(`Skill ${skill.name} missing SKILL.md definition`);
    }

    console.log(`  ✅ Skill ${skill.name} structure valid`);
  }

  /**
   * Validate dependencies
   */
  validateDependencies() {
    if (!this.marketplaceConfig) return;

    console.log('\n📋 Validating dependencies...');

    const packageJsonPath = path.join(this.marketplacePath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      this.errors.push('Root package.json not found');
      return;
    }

    try {
      const packageContent = fs.readFileSync(packageJsonPath, 'utf8');
      const packageConfig = JSON.parse(packageContent);

      // Check for required dependencies
      const requiredDeps = ['typescript'];
      Object.keys(requiredDeps).forEach(dep => {
        if (!packageConfig.dependencies?.[dep] && !packageConfig.devDependencies?.[dep]) {
          this.warnings.push(`Missing recommended dependency: ${dep}`);
        }
      });

      console.log('✅ Dependencies validated');
    } catch (error) {
      this.errors.push(`Invalid package.json: ${error.message}`);
    }
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 MARKETPLACE VALIDATION REPORT');
    console.log('='.repeat(50));

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ Marketplace validation passed with no issues!');
    } else {
      if (this.errors.length > 0) {
        console.log(`\n❌ ERRORS (${this.errors.length}):`);
        this.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      }

      if (this.warnings.length > 0) {
        console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
        this.warnings.forEach((warning, index) => {
          console.log(`  ${index + 1}. ${warning}`);
        });
      }
    }

    console.log('\n📈 Summary:');
    console.log(`  - Plugins: ${this.marketplaceConfig?.plugins?.length || 0}`);
    console.log(`  - Agents: ${this.marketplaceConfig?.agents?.length || 0}`);
    console.log(`  - Skills: ${this.marketplaceConfig?.skills?.length || 0}`);
    console.log(`  - Errors: ${this.errors.length}`);
    console.log(`  - Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ Validation failed! Please fix the errors before proceeding.');
      process.exit(1);
    } else {
      console.log('\n✅ Marketplace validation completed successfully!');
    }
  }
}

// Run validation
const validator = new MarketplaceValidator();
validator.validate().catch(error => {
  console.error('Validation script failed:', error);
  process.exit(1);
});

export default MarketplaceValidator;
