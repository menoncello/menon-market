#!/usr/bin/env node

/**
 * Marketplace Validation Script
 * Validates marketplace structure, configuration, and content
 */

const fs = require('fs');
const path = require('path');

class MarketplaceValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  log(message, type = 'info') {
    this[type].push(message);
  }

  /**
   * Validate marketplace directory structure
   */
  validateStructure(marketplacePath) {
    console.log('Validating marketplace structure...');

    const requiredDirs = ['.claude-plugin'];
    const requiredFiles = ['.claude-plugin/marketplace.json'];
    const optionalDirs = ['plugins', 'skills', 'docs', 'tests', 'scripts', 'examples'];

    // Check required directories
    requiredDirs.forEach(dir => {
      const dirPath = path.join(marketplacePath, dir);
      if (!fs.existsSync(dirPath)) {
        this.log(`Required directory missing: ${dir}`, 'errors');
      } else {
        this.log(`Required directory found: ${dir}`, 'info');
      }
    });

    // Check required files
    requiredFiles.forEach(file => {
      const filePath = path.join(marketplacePath, file);
      if (!fs.existsSync(filePath)) {
        this.log(`Required file missing: ${file}`, 'errors');
      } else {
        this.log(`Required file found: ${file}`, 'info');
      }
    });

    // Check optional directories
    optionalDirs.forEach(dir => {
      const dirPath = path.join(marketplacePath, dir);
      if (fs.existsSync(dirPath)) {
        this.log(`Optional directory found: ${dir}`, 'info');
      }
    });
  }

  /**
   * Validate marketplace configuration
   */
  validateConfiguration(marketplacePath) {
    console.log('Validating marketplace configuration...');

    const configPath = path.join(marketplacePath, '.claude-plugin', 'marketplace.json');

    if (!fs.existsSync(configPath)) {
      this.log('Marketplace configuration file missing', 'errors');
      return;
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      // Validate required fields
      const requiredFields = ['name', 'version', 'description', 'owner'];
      requiredFields.forEach(field => {
        if (!config[field]) {
          this.log(`Required configuration field missing: ${field}`, 'errors');
        } else {
          this.log(`Required field found: ${field}`, 'info');
        }
      });

      // Validate version format
      if (config.version && !this.isValidVersion(config.version)) {
        this.log(`Invalid version format: ${config.version}`, 'errors');
      }

      // Validate plugins array
      if (config.plugins) {
        if (!Array.isArray(config.plugins)) {
          this.log('Plugins field must be an array', 'errors');
        } else {
          this.log(`Found ${config.plugins.length} plugins in configuration`, 'info');
        }
      }

      // Validate skills array
      if (config.skills) {
        if (!Array.isArray(config.skills)) {
          this.log('Skills field must be an array', 'errors');
        } else {
          this.log(`Found ${config.skills.length} skills in configuration`, 'info');
        }
      }

      // Validate owner object
      if (config.owner) {
        const ownerFields = ['name', 'email'];
        ownerFields.forEach(field => {
          if (config.owner[field]) {
            this.log(`Owner ${field} found: ${config.owner[field]}`, 'info');
          }
        });
      }

      this.log('Configuration file structure validated', 'info');
    } catch (error) {
      this.log(`Invalid JSON in configuration file: ${error.message}`, 'errors');
    }
  }

  /**
   * Validate plugins
   */
  validatePlugins(marketplacePath) {
    console.log('Validating plugins...');

    const configPath = path.join(marketplacePath, '.claude-plugin', 'marketplace.json');

    if (!fs.existsSync(configPath)) {
      this.log('Cannot validate plugins - configuration file missing', 'warnings');
      return;
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      if (!config.plugins || config.plugins.length === 0) {
        this.log('No plugins configured in marketplace', 'warnings');
        return;
      }

      const pluginsDir = path.join(marketplacePath, 'plugins');

      if (!fs.existsSync(pluginsDir)) {
        this.log('Plugins directory not found', 'warnings');
        return;
      }

      for (const plugin of config.plugins) {
        this.validatePlugin(plugin, pluginsDir);
      }
    } catch (error) {
      this.log(`Error validating plugins: ${error.message}`, 'errors');
    }
  }

  /**
   * Validate individual plugin
   */
  validatePlugin(plugin, pluginsDir) {
    if (!plugin.name) {
      this.log('Plugin found without name in configuration', 'errors');
      return;
    }

    const pluginPath = path.join(pluginsDir, plugin.name);
    if (!fs.existsSync(pluginPath)) {
      this.log(`Plugin directory not found: ${plugin.name}`, 'warnings');
      return;
    }

    const pluginJsonPath = path.join(pluginPath, '.claude-plugin', 'plugin.json');
    if (!fs.existsSync(pluginJsonPath)) {
      this.log(`Plugin configuration missing: ${plugin.name}/plugin.json`, 'errors');
      return;
    }

    try {
      const pluginConfig = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));

      // Validate plugin structure
      const requiredFields = ['name', 'version', 'description'];
      requiredFields.forEach(field => {
        if (!pluginConfig[field]) {
          this.log(`Plugin ${plugin.name}: Required field missing: ${field}`, 'errors');
        }
      });

      this.log(`Plugin validated: ${plugin.name}`, 'info');
    } catch (error) {
      this.log(`Plugin ${plugin.name}: Invalid configuration - ${error.message}`, 'errors');
    }
  }

  /**
   * Validate skills
   */
  validateSkills(marketplacePath) {
    console.log('Validating skills...');

    const skillsDir = path.join(marketplacePath, 'skills');

    if (!fs.existsSync(skillsDir)) {
      this.log('Skills directory not found', 'warnings');
      return;
    }

    try {
      const skills = fs
        .readdirSync(skillsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      if (skills.length === 0) {
        this.log('No skills found in marketplace', 'warnings');
        return;
      }

      for (const skill of skills) {
        this.validateSkill(path.join(skillsDir, skill), skill);
      }
    } catch (error) {
      this.log(`Error validating skills: ${error.message}`, 'errors');
    }
  }

  /**
   * Validate individual skill
   */
  validateSkill(skillPath, skillName) {
    const skillMdPath = path.join(skillPath, 'SKILL.md');

    if (!fs.existsSync(skillMdPath)) {
      this.log(`Skill SKILL.md missing: ${skillName}`, 'errors');
      return;
    }

    try {
      const content = fs.readFileSync(skillMdPath, 'utf8');

      // Check for required frontmatter
      if (!content.includes('---')) {
        this.log(`Skill ${skillName}: Missing frontmatter`, 'errors');
        return;
      }

      // Extract and validate frontmatter
      const frontmatterMatch = content.match(/^---\n(.*?)\n---/s);
      if (frontmatterMatch) {
        try {
          const frontmatter = JSON.parse(frontmatterMatch[1].replace(/(\w+):/g, '"$1":'));

          if (!frontmatter.name) {
            this.log(`Skill ${skillName}: Missing name in frontmatter`, 'errors');
          }

          if (!frontmatter.description) {
            this.log(`Skill ${skillName}: Missing description in frontmatter`, 'warnings');
          }
        } catch (error) {
          this.log(`Skill ${skillName}: Invalid frontmatter format`, 'errors');
        }
      }

      this.log(`Skill validated: ${skillName}`, 'info');
    } catch (error) {
      this.log(`Skill ${skillName}: Error reading file - ${error.message}`, 'errors');
    }
  }

  /**
   * Validate documentation
   */
  validateDocumentation(marketplacePath) {
    console.log('Validating documentation...');

    const docsDir = path.join(marketplacePath, 'docs');

    if (!fs.existsSync(docsDir)) {
      this.log('Documentation directory not found', 'warnings');
      return;
    }

    const requiredDocs = ['README.md'];
    const recommendedDocs = ['GUIDE.md', 'CONTRIBUTING.md'];

    // Check required documentation
    requiredDocs.forEach(doc => {
      const docPath = path.join(marketplacePath, doc);
      if (fs.existsSync(docPath)) {
        this.log(`Required documentation found: ${doc}`, 'info');
      } else {
        this.log(`Required documentation missing: ${doc}`, 'errors');
      }
    });

    // Check recommended documentation
    recommendedDocs.forEach(doc => {
      const docPath = path.join(docsDir, doc);
      if (fs.existsSync(docPath)) {
        this.log(`Recommended documentation found: ${doc}`, 'info');
      } else {
        this.log(`Recommended documentation missing: ${doc}`, 'warnings');
      }
    });
  }

  /**
   * Check if version string is valid
   */
  isValidVersion(version) {
    return /^\d+\.\d+\.\d+(-.*)?$/.test(version);
  }

  /**
   * Run complete validation
   */
  async validate(marketplacePath = './') {
    console.log(`Starting marketplace validation for: ${marketplacePath}`);
    console.log('='.repeat(50));

    // Check if marketplace exists
    if (!fs.existsSync(marketplacePath)) {
      console.error('Error: Marketplace directory does not exist');
      process.exit(1);
    }

    // Run all validations
    this.validateStructure(marketplacePath);
    this.validateConfiguration(marketplacePath);
    this.validatePlugins(marketplacePath);
    this.validateSkills(marketplacePath);
    this.validateDocumentation(marketplacePath);

    // Report results
    console.log('='.repeat(50));
    console.log('Validation Results:');
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}`);
    console.log(`Info: ${this.info.length}`);

    if (this.errors.length > 0) {
      console.log('\nErrors:');
      this.errors.forEach(error => console.log(`  ❌ ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\nWarnings:');
      this.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
    }

    if (this.verbose && this.info.length > 0) {
      console.log('\nInfo:');
      this.info.forEach(info => console.log(`  ℹ️  ${info}`));
    }

    // Exit with appropriate code
    if (this.errors.length > 0) {
      console.log('\n❌ Validation failed with errors');
      process.exit(1);
    } else if (this.warnings.length > 0) {
      console.log('\n⚠️  Validation completed with warnings');
      process.exit(2);
    } else {
      console.log('\n✅ Validation passed successfully');
      process.exit(0);
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const marketplacePath = args[0] || './';
  const validator = new MarketplaceValidator();

  // Check for verbose flag
  validator.verbose = args.includes('--verbose');

  validator.validate(marketplacePath).catch(error => {
    console.error('Validation error:', error.message);
    process.exit(1);
  });
}

module.exports = MarketplaceValidator;
