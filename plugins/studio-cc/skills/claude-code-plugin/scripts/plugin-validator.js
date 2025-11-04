#!/usr/bin/env node

/**
 * Claude Code Plugin Validator
 *
 * This script validates a plugin structure and configuration
 * to ensure it meets Claude Code plugin standards.
 */

const fs = require('fs');
const path = require('path');

class PluginValidator {
  constructor(pluginPath) {
    this.pluginPath = pluginPath;
    this.errors = [];
    this.warnings = [];
  }

  async validate() {
    console.log(`🔍 Validating plugin at: ${this.pluginPath}`);

    await this.validateStructure();
    await this.validateManifest();
    await this.validateCommands();
    await this.validateSkills();
    await this.validatePermissions();

    this.printResults();
    return this.errors.length === 0;
  }

  async validateStructure() {
    console.log('\n📁 Checking plugin structure...');

    const requiredDirs = ['.claude-plugin'];
    const optionalDirs = ['commands', 'skills', 'agents', 'hooks', 'mcp', 'scripts', 'templates'];

    for (const dir of requiredDirs) {
      const dirPath = path.join(this.pluginPath, dir);
      if (!fs.existsSync(dirPath)) {
        this.errors.push(`Missing required directory: ${dir}`);
      } else {
        console.log(`✅ ${dir} directory exists`);
      }
    }

    for (const dir of optionalDirs) {
      const dirPath = path.join(this.pluginPath, dir);
      if (fs.existsSync(dirPath)) {
        console.log(`✅ ${dir} directory exists`);
      }
    }
  }

  async validateManifest() {
    console.log('\n📋 Validating plugin manifest...');

    const manifestPath = path.join(this.pluginPath, '.claude-plugin', 'plugin.json');

    if (!fs.existsSync(manifestPath)) {
      this.errors.push('Missing plugin.json manifest file');
      return;
    }

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      // Required fields
      const requiredFields = ['name', 'version', 'description'];
      for (const field of requiredFields) {
        if (!manifest[field]) {
          this.errors.push(`Missing required field in manifest: ${field}`);
        } else {
          console.log(`✅ Manifest field ${field}: ${manifest[field]}`);
        }
      }

      // Validate name format
      if (manifest.name && !/^[a-z0-9-]+$/.test(manifest.name)) {
        this.errors.push('Plugin name should only contain lowercase letters, numbers, and hyphens');
      }

      // Validate version format
      if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
        this.errors.push('Plugin version should follow semantic versioning (e.g., 1.0.0)');
      }

      // Validate Claude version constraints
      if (manifest.claude) {
        if (manifest.claude.minVersion && !/^\d+\.\d+\.\d+/.test(manifest.claude.minVersion)) {
          this.warnings.push('Claude minVersion should follow semantic versioning');
        }
        if (manifest.claude.maxVersion && !/^\d+\.\d+\.\d+/.test(manifest.claude.maxVersion)) {
          this.warnings.push('Claude maxVersion should follow semantic versioning');
        }
      }

      // Validate permissions
      if (manifest.permissions && Array.isArray(manifest.permissions)) {
        const validPermissions = [
          'file:read',
          'file:write',
          'network:request',
          'system:exec',
          'env:read',
          'env:write',
        ];

        for (const permission of manifest.permissions) {
          if (!validPermissions.includes(permission)) {
            this.warnings.push(`Unknown permission: ${permission}`);
          }
        }
        console.log(`✅ Permissions: ${manifest.permissions.join(', ')}`);
      }
    } catch (error) {
      this.errors.push(`Invalid JSON in plugin.json: ${error.message}`);
    }
  }

  async validateCommands() {
    console.log('\n⚡ Validating commands...');

    const commandsDir = path.join(this.pluginPath, 'commands');

    if (!fs.existsSync(commandsDir)) {
      console.log('ℹ️  No commands directory found');
      return;
    }

    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.md'));

    if (commandFiles.length === 0) {
      console.log('ℹ️  No command files found');
      return;
    }

    for (const file of commandFiles) {
      const filePath = path.join(commandsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for YAML frontmatter
      if (!content.startsWith('---')) {
        this.warnings.push(`Command ${file} missing YAML frontmatter`);
        continue;
      }

      try {
        const frontmatter = this.extractFrontmatter(content);

        // Required frontmatter fields
        if (!frontmatter.name) {
          this.errors.push(`Command ${file} missing name in frontmatter`);
        } else {
          console.log(`✅ Command: ${frontmatter.name}`);
        }

        if (!frontmatter.description) {
          this.warnings.push(`Command ${file} missing description`);
        }

        // Validate name format
        if (frontmatter.name && !/^[a-z0-9-]+$/.test(frontmatter.name)) {
          this.warnings.push(
            `Command name should only contain lowercase letters, numbers, and hyphens: ${frontmatter.name}`
          );
        }
      } catch (error) {
        this.errors.push(`Error parsing command ${file}: ${error.message}`);
      }
    }
  }

  async validateSkills() {
    console.log('\n🧠 Validating skills...');

    const skillsDir = path.join(this.pluginPath, 'skills');

    if (!fs.existsSync(skillsDir)) {
      console.log('ℹ️  No skills directory found');
      return;
    }

    const skillDirs = fs
      .readdirSync(skillsDir)
      .filter(file => fs.statSync(path.join(skillsDir, file)).isDirectory());

    if (skillDirs.length === 0) {
      console.log('ℹ️  No skill directories found');
      return;
    }

    for (const skillDir of skillDirs) {
      const skillPath = path.join(skillsDir, skillDir);
      const skillFile = path.join(skillPath, 'SKILL.md');

      if (!fs.existsSync(skillFile)) {
        this.errors.push(`Skill ${skillDir} missing SKILL.md file`);
        continue;
      }

      const content = fs.readFileSync(skillFile, 'utf8');

      // Check for YAML frontmatter
      if (!content.startsWith('---')) {
        this.errors.push(`Skill ${skillDir} missing YAML frontmatter`);
        continue;
      }

      try {
        const frontmatter = this.extractFrontmatter(content);

        // Required frontmatter fields
        if (!frontmatter.name) {
          this.errors.push(`Skill ${skillDir} missing name in frontmatter`);
        } else {
          console.log(`✅ Skill: ${frontmatter.name}`);
        }

        if (!frontmatter.description) {
          this.warnings.push(`Skill ${skillDir} missing description`);
        }

        // Check for triggers
        if (!frontmatter.triggers || !Array.isArray(frontmatter.triggers)) {
          this.warnings.push(`Skill ${skillDir} missing triggers array`);
        } else {
          for (const trigger of frontmatter.triggers) {
            if (!trigger.type) {
              this.warnings.push(`Skill ${skillDir} has trigger missing type`);
            }
            if (!trigger.pattern) {
              this.warnings.push(`Skill ${skillDir} has trigger missing pattern`);
            }
          }
        }
      } catch (error) {
        this.errors.push(`Error parsing skill ${skillDir}: ${error.message}`);
      }
    }
  }

  async validatePermissions() {
    console.log('\n🔒 Checking permissions...');

    const manifestPath = path.join(this.pluginPath, '.claude-plugin', 'plugin.json');

    if (!fs.existsSync(manifestPath)) {
      return;
    }

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      if (!manifest.permissions || manifest.permissions.length === 0) {
        this.warnings.push('Plugin requests no permissions - ensure this is intentional');
        return;
      }

      // Check if permissions match actual usage
      const hasNetworkPermissions = manifest.permissions.includes('network:request');
      const hasFilePermissions = manifest.permissions.some(p => p.startsWith('file:'));

      // Scan for network usage in commands
      if (hasNetworkPermissions) {
        const commandsDir = path.join(this.pluginPath, 'commands');
        if (fs.existsSync(commandsDir)) {
          const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.md'));
          let networkUsageFound = false;

          for (const file of commandFiles) {
            const content = fs.readFileSync(path.join(commandsDir, file), 'utf8');
            if (
              content.includes('http') ||
              content.includes('fetch') ||
              content.includes('request')
            ) {
              networkUsageFound = true;
              break;
            }
          }

          if (!networkUsageFound) {
            this.warnings.push(
              'Plugin requests network permission but no obvious network usage found in commands'
            );
          }
        }
      }

      console.log('✅ Permissions validated');
    } catch (error) {
      // Manifest validation errors already caught in validateManifest
    }
  }

  extractFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) {
      throw new Error('No frontmatter found');
    }

    // Simple YAML parser for basic fields
    const frontmatter = {};
    const lines = match[1].split('\n');

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // Handle quoted strings
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // Handle arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value
            .slice(1, -1)
            .split(',')
            .map(item => item.trim().replace(/['"]/g, ''));
        }

        frontmatter[key] = value;
      }
    }

    return frontmatter;
  }

  printResults() {
    console.log('\n📊 Validation Results');
    console.log('=====================');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ Plugin validation passed with no issues!');
    } else {
      if (this.errors.length > 0) {
        console.log(`\n❌ Errors (${this.errors.length}):`);
        this.errors.forEach(error => console.log(`  • ${error}`));
      }

      if (this.warnings.length > 0) {
        console.log(`\n⚠️  Warnings (${this.warnings.length}):`);
        this.warnings.forEach(warning => console.log(`  • ${warning}`));
      }
    }

    console.log(`\nSummary: ${this.errors.length} errors, ${this.warnings.length} warnings`);
  }
}

// CLI usage
if (require.main === module) {
  const pluginPath = process.argv[2] || '.';

  if (!fs.existsSync(pluginPath)) {
    console.error(`❌ Plugin path does not exist: ${pluginPath}`);
    process.exit(1);
  }

  const validator = new PluginValidator(pluginPath);
  validator
    .validate()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    });
}

module.exports = PluginValidator;
