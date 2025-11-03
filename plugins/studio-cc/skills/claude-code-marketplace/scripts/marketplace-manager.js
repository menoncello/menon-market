#!/usr/bin/env node

/**
 * Claude Code Marketplace Manager
 * Comprehensive tool for creating, managing, and maintaining Claude Code Marketplaces
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class MarketplaceManager {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
    this.force = options.force || false;
  }

  log(message, level = 'info') {
    if (this.verbose || level === 'error') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Execute command safely using spawn
   */
  async executeCommand(command, args = [], cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd,
        stdio: this.verbose ? 'inherit' : 'pipe',
      });

      let stdout = '';
      let stderr = '';

      if (!this.verbose) {
        child.stdout?.on('data', data => {
          stdout += data.toString();
        });

        child.stderr?.on('data', data => {
          stderr += data.toString();
        });
      }

      child.on('close', code => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', error => {
        reject(error);
      });
    });
  }

  /**
   * Create a new marketplace from template
   */
  async createMarketplace(name, options = {}) {
    const template = options.template || 'standard';
    const targetPath = options.path || `./${name}`;

    this.log(`Creating marketplace '${name}' at ${targetPath} using ${template} template`);

    if (!this.dryRun) {
      // Create directory structure
      this.createDirectoryStructure(targetPath);

      // Generate configuration files
      await this.generateMarketplaceConfig(targetPath, name, template);

      // Copy template files
      await this.copyTemplateFiles(targetPath, template);

      // Initialize git repository
      await this.initializeGitRepository(targetPath);

      // Validate created marketplace
      if (options.autoValidate !== false) {
        await this.validateMarketplace(targetPath);
      }
    }

    this.log(`Marketplace '${name}' created successfully`);
    return { success: true, path: targetPath, template };
  }

  /**
   * Create marketplace directory structure
   */
  createDirectoryStructure(basePath) {
    const directories = [
      '.claude-plugin',
      'plugins',
      'skills',
      'docs',
      'tests',
      'scripts',
      'examples',
    ];

    directories.forEach(dir => {
      const fullPath = path.join(basePath, dir);
      this.log(`Creating directory: ${fullPath}`);
      if (!this.dryRun) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  /**
   * Generate marketplace configuration
   */
  async generateMarketplaceConfig(basePath, name, template) {
    const configPath = path.join(basePath, '.claude-plugin', 'marketplace.json');

    const config = {
      name: name,
      version: '1.0.0',
      description: `${name} - Claude Code Marketplace`,
      owner: {
        name: 'Marketplace Owner',
        email: 'owner@example.com',
      },
      repository: {
        type: 'git',
        url: `https://github.com/owner/${name}.git`,
      },
      license: 'MIT',
      plugins: [],
      skills: [],
      template: template,
      created: new Date().toISOString(),
      validation: this.getValidationConfig(template),
    };

    this.log(`Generating marketplace configuration: ${configPath}`);
    if (!this.dryRun) {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
  }

  /**
   * Get validation configuration based on template type
   */
  getValidationConfig(template) {
    const configs = {
      standard: {
        level: 'standard',
        strict: false,
        checks: ['structure', 'metadata', 'plugins'],
      },
      enterprise: {
        level: 'enterprise',
        strict: true,
        checks: ['structure', 'metadata', 'plugins', 'security', 'compliance'],
      },
      community: {
        level: 'community',
        strict: false,
        checks: ['structure', 'metadata', 'plugins', 'documentation'],
      },
      minimal: {
        level: 'minimal',
        strict: false,
        checks: ['structure', 'metadata'],
      },
    };

    return configs[template] || configs.standard;
  }

  /**
   * Copy template files
   */
  async copyTemplateFiles(targetPath, template) {
    const templateDir = path.join(__dirname, '..', 'templates', template);

    if (!fs.existsSync(templateDir)) {
      this.log(`Template directory not found: ${templateDir}`, 'warn');
      return;
    }

    const files = this.getTemplateFiles(template);

    for (const file of files) {
      const sourcePath = path.join(templateDir, file);
      const targetFilePath = path.join(targetPath, file);

      this.log(`Copying template file: ${file}`);
      if (!this.dryRun && fs.existsSync(sourcePath)) {
        // Ensure target directory exists
        const targetDir = path.dirname(targetFilePath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const content = fs.readFileSync(sourcePath, 'utf8');
        fs.writeFileSync(targetFilePath, content);
      }
    }
  }

  /**
   * Get template file list
   */
  getTemplateFiles(template) {
    const files = {
      standard: [
        'README.md',
        '.claude-plugin/plugin.json',
        'docs/GUIDE.md',
        'scripts/validate.js',
        'scripts/deploy.js',
      ],
      enterprise: [
        'README.md',
        '.claude-plugin/plugin.json',
        'docs/ENTERPRISE.md',
        'docs/SECURITY.md',
        'scripts/validate.js',
        'scripts/deploy.js',
        'scripts/security-scan.js',
        'tests/compliance.test.js',
      ],
      community: [
        'README.md',
        '.claude-plugin/plugin.json',
        'docs/CONTRIBUTING.md',
        'docs/COMMUNITY.md',
        'scripts/validate.js',
        'scripts/deploy.js',
      ],
      minimal: ['README.md', '.claude-plugin/plugin.json', 'scripts/validate.js'],
    };

    return files[template] || files.standard;
  }

  /**
   * Initialize git repository
   */
  async initializeGitRepository(basePath) {
    this.log(`Initializing git repository in: ${basePath}`);

    if (!this.dryRun) {
      try {
        await this.executeCommand('git', ['init'], basePath);
        await this.executeCommand('git', ['add', '.'], basePath);
        await this.executeCommand(
          'git',
          ['commit', '-m', 'Initial marketplace structure'],
          basePath
        );
      } catch (error) {
        this.log(`Git initialization failed: ${error.message}`, 'warn');
      }
    }
  }

  /**
   * Validate marketplace structure and configuration
   */
  async validateMarketplace(marketplacePath) {
    this.log(`Validating marketplace at: ${marketplacePath}`);

    const results = {
      success: true,
      errors: [],
      warnings: [],
      info: [],
    };

    // Check if marketplace exists
    if (!fs.existsSync(marketplacePath)) {
      results.errors.push('Marketplace directory does not exist');
      results.success = false;
      return results;
    }

    // Validate directory structure
    this.validateDirectoryStructure(marketplacePath, results);

    // Validate configuration files
    await this.validateConfiguration(marketplacePath, results);

    // Validate plugins
    await this.validatePlugins(marketplacePath, results);

    // Validate skills
    await this.validateSkills(marketplacePath, results);

    // Report results
    this.reportValidationResults(results);

    return results;
  }

  /**
   * Validate marketplace directory structure
   */
  validateDirectoryStructure(marketplacePath, results) {
    const requiredDirs = ['.claude-plugin'];
    const optionalDirs = ['plugins', 'skills', 'docs', 'tests', 'scripts', 'examples'];

    requiredDirs.forEach(dir => {
      const dirPath = path.join(marketplacePath, dir);
      if (!fs.existsSync(dirPath)) {
        results.errors.push(`Required directory missing: ${dir}`);
      } else {
        results.info.push(`Required directory found: ${dir}`);
      }
    });

    optionalDirs.forEach(dir => {
      const dirPath = path.join(marketplacePath, dir);
      if (fs.existsSync(dirPath)) {
        results.info.push(`Optional directory found: ${dir}`);
      }
    });
  }

  /**
   * Validate marketplace configuration
   */
  async validateConfiguration(marketplacePath, results) {
    const configPath = path.join(marketplacePath, '.claude-plugin', 'marketplace.json');

    if (!fs.existsSync(configPath)) {
      results.errors.push('Marketplace configuration file missing: marketplace.json');
      return;
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      // Validate required fields
      const requiredFields = ['name', 'version', 'description', 'owner'];
      requiredFields.forEach(field => {
        if (!config[field]) {
          results.errors.push(`Required configuration field missing: ${field}`);
        }
      });

      // Validate version format
      if (config.version && !this.isValidVersion(config.version)) {
        results.errors.push(`Invalid version format: ${config.version}`);
      }

      // Validate plugins array
      if (config.plugins && !Array.isArray(config.plugins)) {
        results.errors.push('Plugins field must be an array');
      }

      results.info.push('Configuration file validated successfully');
    } catch (error) {
      results.errors.push(`Invalid JSON in configuration file: ${error.message}`);
    }
  }

  /**
   * Validate plugins in marketplace
   */
  async validatePlugins(marketplacePath, results) {
    const configPath = path.join(marketplacePath, '.claude-plugin', 'marketplace.json');

    if (!fs.existsSync(configPath)) {
      return;
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      if (!config.plugins || config.plugins.length === 0) {
        results.warnings.push('No plugins configured in marketplace');
        return;
      }

      const pluginsDir = path.join(marketplacePath, 'plugins');

      for (const plugin of config.plugins) {
        if (!plugin.name) {
          results.errors.push('Plugin found without name in configuration');
          continue;
        }

        const pluginPath = path.join(pluginsDir, plugin.name);
        if (fs.existsSync(pluginPath)) {
          await this.validatePlugin(pluginPath, plugin, results);
        } else {
          results.warnings.push(`Plugin directory not found: ${plugin.name}`);
        }
      }
    } catch (error) {
      results.errors.push(`Error validating plugins: ${error.message}`);
    }
  }

  /**
   * Validate individual plugin
   */
  async validatePlugin(pluginPath, pluginConfig, results) {
    const pluginJsonPath = path.join(pluginPath, '.claude-plugin', 'plugin.json');

    if (!fs.existsSync(pluginJsonPath)) {
      results.errors.push(`Plugin configuration missing: ${pluginConfig.name}/plugin.json`);
      return;
    }

    try {
      const pluginConfig = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));

      // Validate plugin structure
      const requiredFields = ['name', 'version', 'description'];
      requiredFields.forEach(field => {
        if (!pluginConfig[field]) {
          results.errors.push(`Plugin ${pluginConfig.name}: Required field missing: ${field}`);
        }
      });

      results.info.push(`Plugin validated: ${pluginConfig.name}`);
    } catch (error) {
      results.errors.push(`Plugin ${pluginConfig.name}: Invalid configuration - ${error.message}`);
    }
  }

  /**
   * Validate skills in marketplace
   */
  async validateSkills(marketplacePath, results) {
    const skillsDir = path.join(marketplacePath, 'skills');

    if (!fs.existsSync(skillsDir)) {
      results.warnings.push('Skills directory not found');
      return;
    }

    const skills = fs
      .readdirSync(skillsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    if (skills.length === 0) {
      results.warnings.push('No skills found in marketplace');
      return;
    }

    for (const skill of skills) {
      await this.validateSkill(path.join(skillsDir, skill), skill, results);
    }
  }

  /**
   * Validate individual skill
   */
  async validateSkill(skillPath, skillName, results) {
    const skillMdPath = path.join(skillPath, 'SKILL.md');

    if (!fs.existsSync(skillMdPath)) {
      results.errors.push(`Skill SKILL.md missing: ${skillName}`);
      return;
    }

    try {
      const content = fs.readFileSync(skillMdPath, 'utf8');

      // Check for required frontmatter
      if (!content.includes('---')) {
        results.errors.push(`Skill ${skillName}: Missing frontmatter`);
        return;
      }

      // Extract and validate frontmatter
      const frontmatterMatch = content.match(/^---\n(.*?)\n---/s);
      if (frontmatterMatch) {
        try {
          const frontmatter = JSON.parse(frontmatterMatch[1].replace(/(\w+):/g, '"$1":'));

          if (!frontmatter.name) {
            results.errors.push(`Skill ${skillName}: Missing name in frontmatter`);
          }

          if (!frontmatter.description) {
            results.warnings.push(`Skill ${skillName}: Missing description in frontmatter`);
          }
        } catch (error) {
          results.errors.push(`Skill ${skillName}: Invalid frontmatter format`);
        }
      }

      results.info.push(`Skill validated: ${skillName}`);
    } catch (error) {
      results.errors.push(`Skill ${skillName}: Error reading file - ${error.message}`);
    }
  }

  /**
   * Deploy marketplace plugins
   */
  async deployMarketplace(marketplacePath, options = {}) {
    this.log(`Deploying marketplace from: ${marketplacePath}`);

    const validation = await this.validateMarketplace(marketplacePath);

    if (!validation.success && !this.force) {
      throw new Error('Marketplace validation failed. Use --force to deploy anyway.');
    }

    const configPath = path.join(marketplacePath, '.claude-plugin', 'marketplace.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    const results = {
      deployed: [],
      failed: [],
      skipped: [],
    };

    for (const plugin of config.plugins) {
      try {
        await this.deployPlugin(plugin, marketplacePath, options);
        results.deployed.push(plugin.name);
        this.log(`Deployed plugin: ${plugin.name}`);
      } catch (error) {
        results.failed.push({ name: plugin.name, error: error.message });
        this.log(`Failed to deploy plugin ${plugin.name}: ${error.message}`, 'error');
      }
    }

    this.reportDeploymentResults(results);
    return results;
  }

  /**
   * Deploy individual plugin
   */
  async deployPlugin(plugin, marketplacePath, options) {
    // Implementation would depend on deployment target
    // This is a placeholder for actual deployment logic
    this.log(`Deploying plugin: ${plugin.name} (version: ${plugin.version})`);

    if (!this.dryRun) {
      // Add actual deployment logic here
      // Could involve:
      // - Publishing to GitHub
      // - Uploading to registry
      // - Deploying to server
      // etc.
    }
  }

  /**
   * Analyze marketplace health
   */
  async analyzeMarketplaceHealth(marketplacePath) {
    this.log(`Analyzing marketplace health: ${marketplacePath}`);

    const analysis = {
      overall_score: 0,
      structure_score: 0,
      configuration_score: 0,
      plugin_score: 0,
      documentation_score: 0,
      recommendations: [],
      metrics: {},
    };

    // Structure analysis
    analysis.structure_score = this.analyzeStructure(marketplacePath);

    // Configuration analysis
    analysis.configuration_score = await this.analyzeConfiguration(marketplacePath);

    // Plugin analysis
    analysis.plugin_score = await this.analyzePlugins(marketplacePath);

    // Documentation analysis
    analysis.documentation_score = await this.analyzeDocumentation(marketplacePath);

    // Calculate overall score
    analysis.overall_score = Math.round(
      (analysis.structure_score +
        analysis.configuration_score +
        analysis.plugin_score +
        analysis.documentation_score) /
        4
    );

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    // Generate metrics
    analysis.metrics = await this.generateMetrics(marketplacePath);

    this.reportHealthAnalysis(analysis);
    return analysis;
  }

  /**
   * Analyze marketplace structure
   */
  analyzeStructure(marketplacePath) {
    let score = 0;
    const maxScore = 100;

    const requiredDirs = ['.claude-plugin'];
    const optionalDirs = ['plugins', 'skills', 'docs', 'tests', 'scripts'];

    // Check required directories (40 points)
    requiredDirs.forEach(dir => {
      if (fs.existsSync(path.join(marketplacePath, dir))) {
        score += 40 / requiredDirs.length;
      }
    });

    // Check optional directories (60 points)
    optionalDirs.forEach(dir => {
      if (fs.existsSync(path.join(marketplacePath, dir))) {
        score += 60 / optionalDirs.length;
      }
    });

    return Math.round(score);
  }

  /**
   * Analyze configuration
   */
  async analyzeConfiguration(marketplacePath) {
    let score = 0;

    try {
      const configPath = path.join(marketplacePath, '.claude-plugin', 'marketplace.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      // Check required fields (50 points)
      const requiredFields = ['name', 'version', 'description', 'owner', 'license'];
      requiredFields.forEach(field => {
        if (config[field]) score += 50 / requiredFields.length;
      });

      // Check optional but recommended fields (30 points)
      const recommendedFields = ['repository', 'keywords', 'homepage'];
      recommendedFields.forEach(field => {
        if (config[field]) score += 30 / recommendedFields.length;
      });

      // Check plugins array (20 points)
      if (config.plugins && Array.isArray(config.plugins) && config.plugins.length > 0) {
        score += 20;
      }
    } catch (error) {
      score = 0;
    }

    return Math.round(score);
  }

  /**
   * Analyze plugins
   */
  async analyzePlugins(marketplacePath) {
    let score = 0;

    try {
      const configPath = path.join(marketplacePath, '.claude-plugin', 'marketplace.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      if (!config.plugins || config.plugins.length === 0) {
        return 0;
      }

      const pluginsDir = path.join(marketplacePath, 'plugins');
      let validPlugins = 0;

      for (const plugin of config.plugins) {
        const pluginPath = path.join(pluginsDir, plugin.name);
        if (fs.existsSync(pluginPath)) {
          validPlugins++;
        }
      }

      score = (validPlugins / config.plugins.length) * 100;
    } catch (error) {
      score = 0;
    }

    return Math.round(score);
  }

  /**
   * Analyze documentation
   */
  async analyzeDocumentation(marketplacePath) {
    let score = 0;

    const docsDir = path.join(marketplacePath, 'docs');

    if (!fs.existsSync(docsDir)) {
      return 20; // Basic README only
    }

    const docFiles = fs.readdirSync(docsDir);

    // Check for key documentation files
    const keyDocs = ['README.md', 'GUIDE.md', 'CONTRIBUTING.md'];
    keyDocs.forEach(doc => {
      if (docFiles.includes(doc)) {
        score += 80 / keyDocs.length;
      }
    });

    // Bonus for additional documentation
    if (docFiles.length > keyDocs.length) {
      score += 20;
    }

    return Math.round(Math.min(score, 100));
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.structure_score < 80) {
      recommendations.push('Improve directory structure by adding missing recommended directories');
    }

    if (analysis.configuration_score < 80) {
      recommendations.push(
        'Enhance marketplace configuration with additional metadata and information'
      );
    }

    if (analysis.plugin_score < 80) {
      recommendations.push('Add more plugins or fix existing plugin issues');
    }

    if (analysis.documentation_score < 80) {
      recommendations.push('Improve documentation by adding comprehensive guides and examples');
    }

    if (analysis.overall_score >= 90) {
      recommendations.push('Excellent marketplace health! Consider sharing with the community');
    }

    return recommendations;
  }

  /**
   * Generate marketplace metrics
   */
  async generateMetrics(marketplacePath) {
    const metrics = {};

    try {
      // Count plugins
      const pluginsDir = path.join(marketplacePath, 'plugins');
      if (fs.existsSync(pluginsDir)) {
        metrics.plugin_count = fs.readdirSync(pluginsDir).length;
      }

      // Count skills
      const skillsDir = path.join(marketplacePath, 'skills');
      if (fs.existsSync(skillsDir)) {
        metrics.skill_count = fs.readdirSync(skillsDir).length;
      }

      // Calculate total size
      metrics.total_size = this.calculateDirectorySize(marketplacePath);

      // Get last modified
      const stats = fs.statSync(marketplacePath);
      metrics.last_modified = stats.mtime.toISOString();
    } catch (error) {
      this.log(`Error generating metrics: ${error.message}`, 'warn');
    }

    return metrics;
  }

  /**
   * Calculate directory size
   */
  calculateDirectorySize(dirPath) {
    let totalSize = 0;

    try {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          totalSize += this.calculateDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      this.log(`Error calculating size for ${dirPath}: ${error.message}`, 'warn');
    }

    return totalSize;
  }

  /**
   * Report validation results
   */
  reportValidationResults(results) {
    this.log(`Validation completed: ${results.success ? 'SUCCESS' : 'FAILED'}`);

    if (results.errors.length > 0) {
      this.log(`Errors found: ${results.errors.length}`, 'error');
      results.errors.forEach(error => this.log(`  - ${error}`, 'error'));
    }

    if (results.warnings.length > 0) {
      this.log(`Warnings found: ${results.warnings.length}`, 'warn');
      results.warnings.forEach(warning => this.log(`  - ${warning}`, 'warn'));
    }

    if (results.info.length > 0 && this.verbose) {
      this.log(`Info messages: ${results.info.length}`);
      results.info.forEach(info => this.log(`  - ${info}`));
    }
  }

  /**
   * Report deployment results
   */
  reportDeploymentResults(results) {
    this.log(`Deployment completed`);
    this.log(`Deployed: ${results.deployed.length}`);
    this.log(`Failed: ${results.failed.length}`);
    this.log(`Skipped: ${results.skipped.length}`);

    if (results.failed.length > 0) {
      results.failed.forEach(failure => {
        this.log(`Failed to deploy ${failure.name}: ${failure.error}`, 'error');
      });
    }
  }

  /**
   * Report health analysis
   */
  reportHealthAnalysis(analysis) {
    this.log(`Marketplace Health Analysis`);
    this.log(`Overall Score: ${analysis.overall_score}/100`);
    this.log(`Structure: ${analysis.structure_score}/100`);
    this.log(`Configuration: ${analysis.configuration_score}/100`);
    this.log(`Plugins: ${analysis.plugin_score}/100`);
    this.log(`Documentation: ${analysis.documentation_score}/100`);

    if (analysis.recommendations.length > 0) {
      this.log(`Recommendations:`);
      analysis.recommendations.forEach(rec => this.log(`  - ${rec}`));
    }

    this.log(`Metrics:`, 'info');
    Object.entries(analysis.metrics).forEach(([key, value]) => {
      this.log(`  ${key}: ${value}`, 'info');
    });
  }

  /**
   * Check if version string is valid
   */
  isValidVersion(version) {
    return /^\d+\.\d+\.\d+(-.*)?$/.test(version);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose'),
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
  };

  const manager = new MarketplaceManager(options);

  // Parse command
  const command = args[0];

  switch (command) {
    case 'create':
      const name = args[1];
      if (!name) {
        console.error('Error: Marketplace name required');
        process.exit(1);
      }
      manager.createMarketplace(name, options);
      break;

    case 'validate':
      const marketplacePath = args[1] || './';
      manager.validateMarketplace(marketplacePath);
      break;

    case 'deploy':
      const deployPath = args[1] || './';
      manager.deployMarketplace(deployPath, options);
      break;

    case 'analyze':
      const analyzePath = args[1] || './';
      manager.analyzeMarketplaceHealth(analyzePath);
      break;

    default:
      console.log('Usage: node marketplace-manager.js <command> [options]');
      console.log('Commands: create, validate, deploy, analyze');
      console.log('Options: --verbose, --dry-run, --force');
  }
}

module.exports = MarketplaceManager;
