/**
 * Marketplace Test Suite
 * Comprehensive testing for marketplace functionality
 */

const fs = require('fs');
const path = require('path');
const MarketplaceManager = require('../scripts/marketplace-manager');

class MarketplaceTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0
    };
  }

  /**
   * Run a test case
   */
  async runTest(testName, testFunction) {
    this.testResults.total++;
    console.log(`\n🧪 Running test: ${testName}`);

    try {
      await testFunction();
      this.testResults.passed++;
      console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
      this.testResults.failed++;
      console.log(`❌ ${testName} - FAILED`);
      console.log(`   Error: ${error.message}`);
    }
  }

  /**
   * Assert a condition
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  /**
   * Assert that a file exists
   */
  assertFileExists(filePath, message) {
    const exists = fs.existsSync(filePath);
    this.assert(exists, message || `File should exist: ${filePath}`);
  }

  /**
   * Assert that a directory exists
   */
  assertDirExists(dirPath, message) {
    const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    this.assert(exists, message || `Directory should exist: ${dirPath}`);
  }

  /**
   * Assert JSON validity
   */
  assertValidJson(jsonString, message) {
    try {
      JSON.parse(jsonString);
    } catch (error) {
      throw new Error(message || `Invalid JSON: ${error.message}`);
    }
  }

  /**
   * Test marketplace creation
   */
  async testMarketplaceCreation() {
    const testMarketplacePath = './test-marketplace';
    const manager = new MarketplaceManager({ dryRun: false });

    // Clean up any existing test marketplace
    if (fs.existsSync(testMarketplacePath)) {
      fs.rmSync(testMarketplacePath, { recursive: true, force: true });
    }

    try {
      // Create marketplace
      const result = await manager.createMarketplace('test-marketplace', {
        template: 'standard',
        path: testMarketplacePath,
        autoValidate: false
      });

      // Test marketplace structure
      this.assertDirExists(testMarketplacePath, 'Marketplace directory should be created');
      this.assertDirExists(path.join(testMarketplacePath, '.claude-plugin'), 'Claude plugin directory should exist');
      this.assertDirExists(path.join(testMarketplacePath, 'plugins'), 'Plugins directory should exist');
      this.assertDirExists(path.join(testMarketplacePath, 'skills'), 'Skills directory should exist');
      this.assertDirExists(path.join(testMarketplacePath, 'docs'), 'Docs directory should exist');
      this.assertDirExists(path.join(testMarketplacePath, 'scripts'), 'Scripts directory should exist');

      // Test configuration files
      this.assertFileExists(
        path.join(testMarketplacePath, '.claude-plugin', 'marketplace.json'),
        'Marketplace configuration should exist'
      );

      // Test marketplace.json content
      const configContent = fs.readFileSync(
        path.join(testMarketplacePath, '.claude-plugin', 'marketplace.json'),
        'utf8'
      );
      this.assertValidJson(configContent, 'Marketplace configuration should be valid JSON');

      const config = JSON.parse(configContent);
      this.assert(config.name === 'test-marketplace', 'Marketplace name should be set correctly');
      this.assert(config.version === '1.0.0', 'Marketplace version should be 1.0.0');
      this.assert(config.description, 'Marketplace should have a description');
      this.assert(config.owner, 'Marketplace should have owner information');
      this.assert(Array.isArray(config.plugins), 'Plugins should be an array');
      this.assert(Array.isArray(config.skills), 'Skills should be an array');

      // Test template files
      this.assertFileExists(
        path.join(testMarketplacePath, 'README.md'),
        'README.md should be created from template'
      );

      this.assertFileExists(
        path.join(testMarketplacePath, 'scripts', 'validate.js'),
        'Validation script should be created from template'
      );

      this.assertFileExists(
        path.join(testMarketplacePath, 'scripts', 'deploy.js'),
        'Deployment script should be created from template'
      );

    } finally {
      // Clean up test marketplace
      if (fs.existsSync(testMarketplacePath)) {
        fs.rmSync(testMarketplacePath, { recursive: true, force: true });
      }
    }
  }

  /**
   * Test marketplace validation
   */
  async testMarketplaceValidation() {
    const testMarketplacePath = './test-validation-marketplace';
    const manager = new MarketplaceManager({ dryRun: false });

    // Clean up any existing test marketplace
    if (fs.existsSync(testMarketplacePath)) {
      fs.rmSync(testMarketplacePath, { recursive: true, force: true });
    }

    try {
      // Create marketplace for testing
      await manager.createMarketplace('test-validation-marketplace', {
        template: 'minimal',
        path: testMarketplacePath,
        autoValidate: false
      });

      // Test validation of valid marketplace
      const validationResult = await manager.validateMarketplace(testMarketplacePath);
      this.assert(validationResult, 'Validation should return a result object');
      this.assert(typeof validationResult.success === 'boolean', 'Validation result should have success property');
      this.assert(Array.isArray(validationResult.errors), 'Validation result should have errors array');
      this.assert(Array.isArray(validationResult.warnings), 'Validation result should have warnings array');
      this.assert(Array.isArray(validationResult.info), 'Validation result should have info array');

      // Test validation of non-existent marketplace
      const nonExistentResult = await manager.validateMarketplace('./non-existent-marketplace');
      this.assert(!nonExistentResult.success, 'Validation should fail for non-existent marketplace');
      this.assert(nonExistentResult.errors.length > 0, 'Validation should have errors for non-existent marketplace');

      // Test validation with invalid configuration
      const configPath = path.join(testMarketplacePath, '.claude-plugin', 'marketplace.json');
      const originalConfig = fs.readFileSync(configPath, 'utf8');

      // Write invalid JSON
      fs.writeFileSync(configPath, '{ invalid json }');
      const invalidConfigResult = await manager.validateMarketplace(testMarketplacePath);
      this.assert(!invalidConfigResult.success, 'Validation should fail for invalid JSON');
      this.assert(
        invalidConfigResult.errors.some(err => err.includes('Invalid JSON')),
        'Validation should report JSON error'
      );

      // Restore valid configuration
      fs.writeFileSync(configPath, originalConfig);

    } finally {
      // Clean up test marketplace
      if (fs.existsSync(testMarketplacePath)) {
        fs.rmSync(testMarketplacePath, { recursive: true, force: true });
      }
    }
  }

  /**
   * Test template types
   */
  async testTemplateTypes() {
    const templates = ['standard', 'minimal', 'community', 'enterprise'];
    const manager = new MarketplaceManager({ dryRun: false });

    for (const template of templates) {
      const testMarketplacePath = `./test-${template}-marketplace`;

      // Clean up any existing test marketplace
      if (fs.existsSync(testMarketplacePath)) {
        fs.rmSync(testMarketplacePath, { recursive: true, force: true });
      }

      try {
        // Create marketplace with specific template
        await manager.createMarketplace(`test-${template}`, {
          template: template,
          path: testMarketplacePath,
          autoValidate: false
        });

        // Test template-specific files
        const configPath = path.join(testMarketplacePath, '.claude-plugin', 'marketplace.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.assert(config.template === template, `Template should be set to ${template}`);

        // Test template-specific validation config
        this.assert(config.validation, 'Marketplace should have validation configuration');
        this.assert(config.validation.level, 'Validation should have a level');

        // Template-specific checks
        switch (template) {
          case 'enterprise':
            this.assert(
              config.validation.checks.includes('security'),
              'Enterprise template should include security checks'
            );
            this.assert(
              config.validation.checks.includes('compliance'),
              'Enterprise template should include compliance checks'
            );
            break;

          case 'community':
            this.assert(
              config.validation.checks.includes('documentation'),
              'Community template should include documentation checks'
            );
            break;

          case 'minimal':
            this.assert(
              config.validation.checks.length <= 2,
              'Minimal template should have minimal validation checks'
            );
            break;
        }

      } finally {
        // Clean up test marketplace
        if (fs.existsSync(testMarketplacePath)) {
          fs.rmSync(testMarketplacePath, { recursive: true, force: true });
        }
      }
    }
  }

  /**
   * Test health analysis
   */
  async testHealthAnalysis() {
    const testMarketplacePath = './test-health-marketplace';
    const manager = new MarketplaceManager({ dryRun: false });

    // Clean up any existing test marketplace
    if (fs.existsSync(testMarketplacePath)) {
      fs.rmSync(testMarketplacePath, { recursive: true, force: true });
    }

    try {
      // Create marketplace
      await manager.createMarketplace('test-health-marketplace', {
        template: 'standard',
        path: testMarketplacePath,
        autoValidate: false
      });

      // Test health analysis
      const healthAnalysis = await manager.analyzeMarketplaceHealth(testMarketplacePath);

      this.assert(healthAnalysis, 'Health analysis should return a result object');
      this.assert(typeof healthAnalysis.overall_score === 'number', 'Overall score should be a number');
      this.assert(healthAnalysis.overall_score >= 0 && healthAnalysis.overall_score <= 100, 'Overall score should be between 0 and 100');

      this.assert(typeof healthAnalysis.structure_score === 'number', 'Structure score should be a number');
      this.assert(typeof healthAnalysis.configuration_score === 'number', 'Configuration score should be a number');
      this.assert(typeof healthAnalysis.plugin_score === 'number', 'Plugin score should be a number');
      this.assert(typeof healthAnalysis.documentation_score === 'number', 'Documentation score should be a number');

      this.assert(Array.isArray(healthAnalysis.recommendations), 'Recommendations should be an array');
      this.assert(typeof healthAnalysis.metrics === 'object', 'Metrics should be an object');

      // Test metrics
      this.assert(typeof healthAnalysis.metrics.plugin_count === 'number', 'Plugin count should be a number');
      this.assert(typeof healthAnalysis.metrics.skill_count === 'number', 'Skill count should be a number');
      this.assert(typeof healthAnalysis.metrics.total_size === 'number', 'Total size should be a number');

    } finally {
      // Clean up test marketplace
      if (fs.existsSync(testMarketplacePath)) {
        fs.rmSync(testMarketplacePath, { recursive: true, force: true });
      }
    }
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    const manager = new MarketplaceManager({ dryRun: false });

    // Test creation with invalid name
    try {
      await manager.createMarketplace('', { path: './test-invalid' });
      this.assert(false, 'Should throw error for empty marketplace name');
    } catch (error) {
      this.assert(error.message.includes('name'), 'Error should mention name issue');
    }

    // Test validation of non-existent path
    const nonExistentResult = await manager.validateMarketplace('./definitely-does-not-exist');
    this.assert(!nonExistentResult.success, 'Validation should fail for non-existent path');
    this.assert(nonExistentResult.errors.length > 0, 'Should have errors for non-existent path');

    // Test deployment without plugins
    const testMarketplacePath = './test-deploy-marketplace';
    if (fs.existsSync(testMarketplacePath)) {
      fs.rmSync(testMarketplacePath, { recursive: true, force: true });
    }

    try {
      await manager.createMarketplace('test-deploy', {
        template: 'minimal',
        path: testMarketplacePath,
        autoValidate: false
      });

      // Try to deploy (should work but with warnings)
      const deployResult = await manager.deployMarketplace(testMarketplacePath);
      this.assert(deployResult, 'Deployment should return a result object');
      this.assert(Array.isArray(deployResult.deployed), 'Should have deployed array');
      this.assert(Array.isArray(deployResult.failed), 'Should have failed array');
      this.assert(Array.isArray(deployResult.skipped), 'Should have skipped array');

    } finally {
      if (fs.existsSync(testMarketplacePath)) {
        fs.rmSync(testMarketplacePath, { recursive: true, force: true });
      }
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Marketplace Test Suite');
    console.log('=' .repeat(50));

    await this.runTest('Marketplace Creation', () => this.testMarketplaceCreation());
    await this.runTest('Marketplace Validation', () => this.testMarketplaceValidation());
    await this.runTest('Template Types', () => this.testTemplateTypes());
    await this.runTest('Health Analysis', () => this.testHealthAnalysis());
    await this.runTest('Error Handling', () => this.testErrorHandling());

    // Print summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 Test Results Summary:');
    console.log(`Total tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed} ✅`);
    console.log(`Failed: ${this.testResults.failed} ❌`);
    console.log(`Skipped: ${this.testResults.skipped} ⏭️`);

    if (this.testResults.failed === 0) {
      console.log('\n🎉 All tests passed! Marketplace functionality is working correctly.');
      process.exit(0);
    } else {
      console.log(`\n💥 ${this.testResults.failed} test(s) failed. Please review the errors above.`);
      process.exit(1);
    }
  }
}

// CLI interface
if (require.main === module) {
  const tester = new MarketplaceTester();

  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Marketplace Test Suite');
    console.log('');
    console.log('Usage: node marketplace.test.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h     Show this help message');
    console.log('  --verbose, -v  Enable verbose output');
    console.log('');
    console.log('Tests:');
    console.log('  - Marketplace creation');
    console.log('  - Marketplace validation');
    console.log('  - Template types');
    console.log('  - Health analysis');
    console.log('  - Error handling');
    process.exit(0);
  }

  // Run tests
  tester.runAllTests().catch(error => {
    console.error('Test suite failed:', error.message);
    process.exit(1);
  });
}

module.exports = MarketplaceTester;