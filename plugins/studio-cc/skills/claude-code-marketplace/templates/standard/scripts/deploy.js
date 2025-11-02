#!/usr/bin/env node

/**
 * Marketplace Deployment Script
 * Handles deployment of marketplace plugins and updates
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class MarketplaceDeployer {
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
   * Execute command safely
   */
  async executeCommand(command, args = [], cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd,
        stdio: this.verbose ? 'inherit' : 'pipe'
      });

      let stdout = '';
      let stderr = '';

      if (!this.verbose) {
        child.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr?.on('data', (data) => {
          stderr += data.toString();
        });
      }

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Validate marketplace before deployment
   */
  async validateBeforeDeploy(marketplacePath) {
    this.log('Validating marketplace before deployment...');

    const validatorPath = path.join(__dirname, 'validate.js');

    try {
      await this.executeCommand('node', [validatorPath, '--verbose'], marketplacePath);
      this.log('Marketplace validation passed');
      return true;
    } catch (error) {
      this.log(`Marketplace validation failed: ${error.message}`, 'error');

      if (!this.force) {
        throw new Error('Deployment aborted due to validation failures. Use --force to override.');
      }

      this.log('Proceeding with deployment despite validation failures (force mode)', 'warn');
      return false;
    }
  }

  /**
   * Get current version from marketplace configuration
   */
  getCurrentVersion(marketplacePath) {
    const configPath = path.join(marketplacePath, '.claude-plugin', 'marketplace.json');

    if (!fs.existsSync(configPath)) {
      throw new Error('Marketplace configuration not found');
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config.version;
  }

  /**
   * Increment version based on release type
   */
  incrementVersion(version, type = 'patch') {
    const parts = version.split('.');

    if (parts.length !== 3) {
      throw new Error(`Invalid version format: ${version}`);
    }

    const [major, minor, patch] = parts.map(p => parseInt(p, 10));

    switch (type) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      default:
        throw new Error(`Invalid release type: ${type}`);
    }
  }

  /**
   * Update marketplace version
   */
  updateVersion(marketplacePath, newVersion) {
    const configPath = path.join(marketplacePath, '.claude-plugin', 'marketplace.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    config.version = newVersion;
    config.updated = new Date().toISOString();

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    this.log(`Updated marketplace version to: ${newVersion}`);
  }

  /**
   * Create git tag for release
   */
  async createGitTag(marketplacePath, version) {
    this.log(`Creating git tag: v${version}`);

    if (!this.dryRun) {
      try {
        await this.executeCommand('git', ['add', '.'], marketplacePath);
        await this.executeCommand('git', ['commit', '-m', `Release v${version}`], marketplacePath);
        await this.executeCommand('git', ['tag', `-a`, `v${version}`, '-m', `Release v${version}`], marketplacePath);
        this.log(`Git tag v${version} created successfully`);
      } catch (error) {
        this.log(`Failed to create git tag: ${error.message}`, 'error');
        throw error;
      }
    } else {
      this.log(`[DRY RUN] Would create git tag: v${version}`);
    }
  }

  /**
   * Push to remote repository
   */
  async pushToRemote(marketplacePath, version) {
    this.log('Pushing to remote repository...');

    if (!this.dryRun) {
      try {
        await this.executeCommand('git', ['push', 'origin', 'main'], marketplacePath);
        await this.executeCommand('git', ['push', 'origin', `v${version}`], marketplacePath);
        this.log('Successfully pushed to remote repository');
      } catch (error) {
        this.log(`Failed to push to remote: ${error.message}`, 'error');
        throw error;
      }
    } else {
      this.log('[DRY RUN] Would push to remote repository');
    }
  }

  /**
   * Generate release notes
   */
  generateReleaseNotes(marketplacePath, version) {
    const configPath = path.join(marketplacePath, '.claude-plugin', 'marketplace.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    const notes = [
      `# Release ${version}`,
      '',
      `## Changes`,
      '',
      `### Marketplace`,
      `- Updated marketplace configuration`,
      `- Version bump to ${version}`,
      '',
      `### Plugins`,
      `${config.plugins.length} plugins included`,
      '',
      `### Skills`,
      `${config.skills.length} skills included`,
      '',
      `## Installation`,
      '```bash',
      `/plugin marketplace add [repository-url]',
      '```',
      '',
      `## Verification`,
      '```bash',
      `/plugin marketplace list',
      '/plugin install [plugin-name]@[marketplace-name]',
      '```',
      '',
      `---`,
      `*Released on ${new Date().toISOString().split('T')[0]}*`
    ];

    const notesPath = path.join(marketplacePath, 'RELEASE_NOTES.md');
    fs.writeFileSync(notesPath, notes.join('\n'));

    this.log(`Release notes generated: ${notesPath}`);
    return notesPath;
  }

  /**
   * Deploy marketplace
   */
  async deploy(marketplacePath = './', options = {}) {
    const releaseType = options.type || 'patch';
    const skipValidation = options.skipValidation || false;
    const skipGit = options.skipGit || false;

    console.log(`Starting marketplace deployment for: ${marketplacePath}`);
    console.log(`Release type: ${releaseType}`);
    console.log('=' .repeat(50));

    try {
      // Validate marketplace unless skipped
      if (!skipValidation) {
        await this.validateBeforeDeploy(marketplacePath);
      }

      // Get current version
      const currentVersion = this.getCurrentVersion(marketplacePath);
      this.log(`Current version: ${currentVersion}`);

      // Calculate new version
      const newVersion = this.incrementVersion(currentVersion, releaseType);
      this.log(`New version: ${newVersion}`);

      // Update version in configuration
      this.updateVersion(marketplacePath, newVersion);

      // Generate release notes
      const notesPath = this.generateReleaseNotes(marketplacePath, newVersion);

      // Git operations unless skipped
      if (!skipGit) {
        await this.createGitTag(marketplacePath, newVersion);
        await this.pushToRemote(marketplacePath, newVersion);
      }

      console.log('=' .repeat(50));
      console.log('✅ Deployment completed successfully');
      console.log(`Version: ${newVersion}`);
      console.log(`Release notes: ${notesPath}`);

      if (!skipGit) {
        console.log('Git tag created and pushed');
      }

      return {
        success: true,
        version: newVersion,
        notesPath,
        skipped: { validation: skipValidation, git: skipGit }
      };

    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      throw error;
    }
  }

  /**
   * Deploy individual plugin
   */
  async deployPlugin(pluginPath, options = {}) {
    this.log(`Deploying plugin: ${pluginPath}`);

    // Validate plugin structure
    const pluginJsonPath = path.join(pluginPath, '.claude-plugin', 'plugin.json');
    if (!fs.existsSync(pluginJsonPath)) {
      throw new Error('Plugin configuration not found');
    }

    const pluginConfig = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
    this.log(`Plugin: ${pluginConfig.name} v${pluginConfig.version}`);

    // Implementation would depend on deployment target
    // This is a placeholder for actual plugin deployment logic

    if (!this.dryRun) {
      // Add actual plugin deployment logic here
      // Could involve:
      // - Publishing to npm registry
      // - Creating GitHub release
      // - Uploading to plugin registry
      // etc.
    }

    this.log(`Plugin deployment completed: ${pluginConfig.name}`);
    return { success: true, plugin: pluginConfig.name };
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  const options = {
    verbose: args.includes('--verbose'),
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    type: 'patch',
    skipValidation: args.includes('--skip-validation'),
    skipGit: args.includes('--skip-git')
  };

  // Parse release type
  const typeIndex = args.findIndex(arg => arg.startsWith('--type='));
  if (typeIndex !== -1) {
    options.type = args[typeIndex].split('=')[1];
  }

  const marketplacePath = args.find(arg => !arg.startsWith('--')) || './';
  const deployer = new MarketplaceDeployer(options);

  deployer.deploy(marketplacePath, options)
    .then(result => {
      console.log('\nDeployment summary:', result);
    })
    .catch(error => {
      console.error('\nDeployment failed:', error.message);
      process.exit(1);
    });
}

module.exports = MarketplaceDeployer;