#!/usr/bin/env bun

/**
 * ESLint Configuration Synchronization Script (Simple Version)
 */

import { file, write } from "bun";

const ESLINT_CONFIG = "./eslint.config.js";
const MAIN_ESLINT_CONFIG = "../../eslint.config.js";
const QUALITY_GATES = "./scripts/quality-gates.ts";

const PLUGIN_LIMITS = {
  MAX_LINES_PER_FUNCTION: 15,
  MAX_COMPLEXITY: 5,
  MAX_PARAMS: 4,
};

async function updateMainConfig() {
  console.log("📝 Updating main ESLint config...");

  try {
    const content = await file(MAIN_ESLINT_CONFIG).text();

    const updatedContent = content
      .replace(
        /complexity:\s*\['error',\s*\d+\]/,
        `complexity: ['error', ${PLUGIN_LIMITS.MAX_COMPLEXITY}]`
      )
      .replace(
        /max-lines-per-function:\s*\['error',\s*\{\s*max:\s*\d+/,
        `max-lines-per-function: ['error', { max: ${PLUGIN_LIMITS.MAX_LINES_PER_FUNCTION}`
      )
      .replace(
        /max-params:\s*\['error',\s*\d+\]/,
        `max-params: ['error', ${PLUGIN_LIMITS.MAX_PARAMS}]`
      );

    await write(MAIN_ESLINT_CONFIG, updatedContent);
    console.log("✅ Main config updated");
  } catch (error) {
    console.error("❌ Failed to update main config:", error);
  }
}

async function updatePluginCode() {
  console.log("📝 Updating plugin code...");

  try {
    // Update quality-gates.ts
    const qualityContent = await file(QUALITY_GATES).text();
    const updatedQualityContent = qualityContent
      .replace(
        /MAX_LINES_PER_FUNCTION:\s*\d+/,
        `MAX_LINES_PER_FUNCTION: ${PLUGIN_LIMITS.MAX_LINES_PER_FUNCTION}`
      )
      .replace(
        /MAX_FUNCTION_COMPLEXITY:\s*\d+/,
        `MAX_FUNCTION_COMPLEXITY: ${PLUGIN_LIMITS.MAX_COMPLEXITY}`
      )
      .replace(/MAX_PARAMS:\s*\d+/, `MAX_PARAMS: ${PLUGIN_LIMITS.MAX_PARAMS}`);

    await write(QUALITY_GATES, updatedQualityContent);

    console.log("✅ Quality gates updated");
  } catch (error) {
    console.error("❌ Failed to update quality gates:", error);
  }
}

function generateReport() {
  console.log("\n📋 ESLint Configuration Report");
  console.log("===============================");

  console.log("\n🔧 New Limits Applied:");
  console.log(`   Max Lines per Function: ${PLUGIN_LIMITS.MAX_LINES_PER_FUNCTION}`);
  console.log(`   Max Complexity: ${PLUGIN_LIMITS.MAX_COMPLEXITY}`);
  console.log(`   Max Parameters: ${PLUGIN_LIMITS.MAX_PARAMS}`);

  console.log("\n🎯 Impact:");
  console.log("   • Stricter code quality standards");
  console.log("   • More focused, smaller functions");
  console.log("   • Improved maintainability");
  console.log("   • Better error handling patterns");
}

async function main() {
  console.log("🔄 Applying new ESLint configuration...");

  try {
    await updateMainConfig();
    await updatePluginCode();
    generateReport();

    console.log("\n🚀 ESLint configuration updated successfully!");
    console.log("\n⚡ Benefits:");
    console.log("   • Reduced cognitive load per function");
    console.log("   • Easier testing and debugging");
    console.log("   • Better separation of concerns");
    console.log("   • Faster code review process");
  } catch (error) {
    console.error("❌ Update failed:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
