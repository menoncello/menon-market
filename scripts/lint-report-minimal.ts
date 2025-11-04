#!/usr/bin/env bun
/**
 * Minimal script to list ESLint issues by file
 * Shows only relative path and issue count, sorted by severity
 */

import { write , $ } from 'bun';

/**
 *
 */
async function main(): Promise<void> {
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
      console.log('✅ No ESLint issues found');
      return;
    }

    const eslintResults = JSON.parse(resultContent) as any[];

    // Filter out files with no issues and sort by total issues
    const filesWithIssues = eslintResults
      .filter(file => file.errorCount > 0 || file.warningCount > 0)
      .sort((a, b) => (b.errorCount + b.warningCount) - (a.errorCount + a.warningCount));

    if (filesWithIssues.length === 0) {
      console.log('✅ No ESLint issues found');
      return;
    }

    // Get project root for relative paths
    const projectRoot = import.meta.dir;

    // Output: relative path and issue count
    for (const file of filesWithIssues) {
      // Remove any leading slash and ensure relative path from project root
      let relativePath = file.filePath;
      if (relativePath.startsWith('/Users/')) {
        // Extract path after the username
        const parts = relativePath.split('/');
        relativePath = parts.slice(4).join('/'); // Skip /Users/username/repos/ai/market/core/

        // Remove ai/market/core/ prefix if present
        if (relativePath.startsWith('ai/market/core/')) {
          relativePath = relativePath.substring('ai/market/core/'.length);
        }
      } else if (relativePath.startsWith('/')) {
        relativePath = relativePath.substring(1); // Remove leading slash
      }

      const totalIssues = file.errorCount + file.warningCount;
      console.log(`${relativePath}: ${totalIssues}`);
    }

    // Clean up temp file
    await $`rm ${tempFile}`;

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
if (import.meta.main) {
  main();
}