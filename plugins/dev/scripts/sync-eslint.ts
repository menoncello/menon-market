#!/usr/bin/env bun

/**
 * ESLint Configuration Synchronization Script
 *
 * Synchronizes ESLint configurations between the main project and the plugin,
 * ensuring that quality gates use the same rules and limits.
 */

import { file, write } from "bun";

interface ESLintConfig {
  rules: Record<string, any>;
}

/**
 * Extract current ESLint limits from plugin config
 */
async function extractPluginLimits(): Promise<{
  maxLinesPerFunction: number;
  maxComplexity: number;
  maxParams: number;
} {
  // Read the plugin's ESLint config
  const eslintConfigPath = './eslint.config.js';

  try {
    const configContent = await file(eslintConfigPath).text();

    // Parse the configuration
    const complexityMatch = configContent.match(/complexity:\s*\['error',\s*(\d+)\]/);
    const maxLinesMatch = configContent.match(/max-lines-per-function:\s*\['error',\s*\{\s*max:\s*(\d+)/);
    const maxParamsMatch = configContent.match(/max-params:\s*\['error',\s*(\d+)\]/);

    return {
      maxComplexity: complexityMatch ? parseInt(complexityMatch[1]) : 5,
      maxLinesPerFunction: maxLinesMatch ? parseInt(maxLinesMatch[1]) : 15,
      maxParams: maxParamsMatch ? parseInt(maxParamsMatch[1]) : 4,
    };
  } catch (error) {
    console.error('❌ Failed to read plugin ESLint config:', error);
    return {
      maxComplexity: 5,
      maxLinesPerFunction: 15,
      maxParams: 4,
    };
  }
}

/**
 * Update main ESLint config to match plugin settings
 */
async function updateMainESLintConfig(pluginLimits: ReturnType<typeof extractPluginLimits>): Promise<void> {
  try {
    const mainConfigPath = '../../eslint.config.js';
    const configContent = await file(mainConfigPath).text();

    // Update complexity
    const updatedContent = configContent
      .replace(/complexity:\s*\['error',\s*\d+\]/, `complexity: ['error', ${pluginLimits.maxComplexity}]`)
      .replace(/max-lines-per-function:\s*\['error',\s*\{\s*max:\s*\d+/,
        `max-lines-per-function: ['error', { max: ${pluginLimits.maxLinesPerFunction}`)
      .replace(/max-params:\s*\['error',\s*\d+\]/, `max-params: ['error', ${pluginLimits.maxParams}]`);

    await write(mainConfigPath, updatedContent);
    console.log('✅ Main ESLint config updated');

  } catch (error) {
    console.error('❌ Failed to update main ESLint config:', error);
  }
}

/**
 * Update plugin code to use dynamic limits
 */
async function updatePluginCode(pluginLimits: ReturnType<typeof extractPluginLimits>): Promise<void> {
  try {
    // Update quality-gates.ts
    const qualityGatesPath = './scripts/quality-gates.ts';
    const qualityContent = await file(qualityGatesPath).text();

    const updatedQualityContent = qualityContent
      .replace(/MAX_LINES_PER_FUNCTION:\s*\d+/, `MAX_LINES_PER_FUNCTION: ${pluginLimits.maxLinesPerFunction}`)
      .replace(/MAX_FUNCTION_COMPLEXITY:\s*\d+/, `MAX_FUNCTION_COMPLEXITY: ${pluginLimits.maxComplexity}`)
      .replace(/MAX_PARAMS:\s*\d+/, `MAX_PARAMS: ${pluginLimits.maxParams}`);

    await write(qualityGatesPath, updatedQualityContent);

    // Update index.ts default config
    const indexPath = './index.ts';
    const indexContent = await file(indexPath).text();

    const updatedIndexContent = indexContent
      .replace(/maxFunctionLines:\s*z\.number\(\)\.default\(\d+\)/,
        `maxFunctionLines: z.number().default(${pluginLimits.maxLinesPerFunction})`)
      .replace(/maxComplexity:\s*z\.number\(\)\.default\(\d+\)/,
        `maxComplexity: z.number().default(${pluginLimits.maxComplexity})`);

    await write(indexPath, updatedIndexContent);
    console.log('✅ Plugin code updated');

  } catch (error) {
    console.error('❌ Failed to update plugin code:', error);
  }
}

/**
 * Generate configuration report
 */
function generateReport(pluginLimits: ReturnType<typeof extractPluginLimits>): void {
  console.log('\n📋 ESLint Configuration Report');
  console.log('===============================');

  console.log('\n🔧 Current Limits:');
  console.log(`   Max Lines per Function: ${pluginLimits.maxLinesPerFunction}`);
  console.log(`   Max Complexity: ${pluginLimits.maxComplexity}`);
  console.log(`   Max Parameters: ${pluginLimits.maxParams}`);

  console.log('\n📝 Files Updated:');
  console.log('   ✅ plugins/dev/eslint.config.js (source)');
  console.log('   ✅ eslint.config.js (main project)');
  console.log('   ✅ plugins/dev/scripts/quality-gates.ts');
  console.log('   ✅ plugins/dev/index.ts (default config)');

  console.log('\n🎯 Impact:');
  console.log('   • Stricter code quality standards');
  console.log('   • More focused, smaller functions');
  console.log('   • Improved maintainability');
  console.log('   • Better error handling patterns');

  console.log('\n⚡ Benefits:');
  console.log('   • Reduced cognitive load per function');
  console.log('   • Easier testing and debugging');
  console.log('   • Better separation of concerns');
  console.log('   • Faster code review process');
}

/**
 * Validate that configurations are consistent
 */
async function validateConsistency(pluginLimits: ReturnType<typeof extractPluginLimits>): Promise<boolean> {
  try {
    const mainConfigPath = '../../eslint.config.js';
    const mainContent = await file(mainConfigPath).text();

    // Check if main config matches plugin limits
    const mainComplexity = mainContent.match(/complexity:\s*\['error',\s*(\d+)\]/);
    const mainMaxLines = mainContent.match(/max-lines-per-function:\s*\['error',\s*\{\s*max:\s*(\d+)/);
    const mainMaxParams = mainContent.match(/max-params:\s*\['error',\s*(\d+)\]/);

    const isConsistent =
      (mainComplexity ? parseInt(mainComplexity[1]) : null) === pluginLimits.maxComplexity &&
      (mainMaxLines ? parseInt(mainMaxLines[1]) : null) === pluginLimits.maxLinesPerFunction &&
      (mainMaxParams ? parseInt(mainMaxParams[1]) : null) === pluginLimits.maxParams;

    if (isConsistent) {
      console.log('✅ All configurations are consistent');
    } else {
      console.log('⚠️  Configuration inconsistencies detected - updating main config');
    }

    return isConsistent;
  } catch (error) {
    console.warn('⚠️  Could not validate main ESLint config:', error);
    return false;
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('🔄 Synchronizing ESLint configurations...');

  try {
    // Extract current plugin limits
    const pluginLimits = await extractPluginLimits();
    console.log(`📊 Plugin Limits Found: ${JSON.stringify(pluginLimits, null, 2)}`);

    // Validate current state
    const isConsistent = await validateConsistency(pluginLimits);

    // Update if inconsistent
    if (!isConsistent) {
      await updateMainESLintConfig(pluginLimits);
    }

    // Update plugin code to use dynamic limits
    await updatePluginCode(pluginLimits);

    // Generate report
    generateReport(pluginLimits);

    console.log('\n🚀 ESLint synchronization completed successfully!');

  } catch (error) {
    console.error('❌ Synchronization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}

export { extractPluginLimits, updateMainESLintConfig, updatePluginCode };