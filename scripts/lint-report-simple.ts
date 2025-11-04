#!/usr/bin/env bun
/**
 * Simple script to analyze and report ESLint issues across the codebase
 * Outputs files sorted by number of ESLint errors (from most to least)
 */

import { write , $ } from 'bun';

/**
 *
 */
async function main(): Promise<void> {
  console.log('🚀 Analyzing ESLint issues...\n');

  try {
    // Create a temporary file to store ESLint JSON output
    const tempFile = '/tmp/eslint-results.json';

    // Run ESLint and save to temp file
    const process = Bun.spawn(['bun', 'eslint', '.', '--format=json'], {
      stdout: 'pipe',
      stderr: 'pipe'
    });

    const output = await new Response(process.stdout).text();
    await write(tempFile, output);

    // Read and parse the results
    const resultContent = await Bun.file(tempFile).text();

    if (!resultContent.trim().startsWith('[')) {
      console.log('❌ No ESLint issues found or ESLint failed to run properly');
      return;
    }

    const eslintResults = JSON.parse(resultContent) as any[];

    if (eslintResults.length === 0) {
      console.log('✅ No ESLint issues found!');
      return;
    }

    // Filter out files with no issues and sort by total issues (errors + warnings)
    const filesWithIssues = eslintResults
      .filter(file => file.errorCount > 0 || file.warningCount > 0)
      .sort((a, b) => (b.errorCount + b.warningCount) - (a.errorCount + a.warningCount));

    console.log('🔍 ESLint Issues Report (sorted by severity)');
    console.log('='.repeat(80));

    let totalErrors = 0;
    let totalWarnings = 0;

    for (const [index, file] of filesWithIssues.entries()) {
      const totalIssues = file.errorCount + file.warningCount;
      console.log(`\n${index + 1}. ${file.filePath}`);
      console.log(`   📊 Issues: ${totalIssues} (${file.errorCount} ❌ errors, ${file.warningCount} ⚠️ warnings)`);

      // Show first 3 issues as preview
      if (file.messages.length > 0) {
        const preview = file.messages.slice(0, 3);
        preview.forEach((msg: any) => {
          const severity = msg.severity === 2 ? '❌' : '⚠️';
          console.log(`   ${severity} ${msg.line}:${msg.column} - ${msg.message} (${msg.ruleId})`);
        });

        if (file.messages.length > 3) {
          console.log(`   ... and ${file.messages.length - 3} more issues`);
        }
      }

      totalErrors += file.errorCount;
      totalWarnings += file.warningCount;
    }

    console.log(`\n${  '='.repeat(80)}`);
    console.log('📊 Summary:');
    console.log(`   Files with issues: ${filesWithIssues.length}`);
    console.log(`   Total errors: ${totalErrors}`);
    console.log(`   Total warnings: ${totalWarnings}`);
    console.log(`   Total issues: ${totalErrors + totalWarnings}`);

    // Clean up temp file
    await $`rm ${tempFile}`;

  } catch (error) {
    console.error('❌ Error running ESLint analysis:', error);
  }
}

// Run the script
if (import.meta.main) {
  main();
}