#!/usr/bin/env bun
/**
 * Script to analyze and report ESLint issues across the codebase
 * Outputs files sorted by number of ESLint errors (from most to least)
 */

import { $ } from 'bun';

interface FileIssues {
  filePath: string;
  errorCount: number;
  warningCount: number;
  issues: string[];
}

/**
 *
 */
async function getLintReport(): Promise<FileIssues[]> {
  try {
    // Run ESLint with JSON formatter to get structured output
    const result = await $`bun eslint . --format=json`.quiet().text();

    if (!result.trim().startsWith('[')) {
      console.error('Error: ESLint did not return valid JSON output');
      return [];
    }

    const eslintResults = JSON.parse(result) as any[];

    const fileIssues: FileIssues[] = eslintResults.map(result => ({
      filePath: result.filePath,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      issues: result.messages.map((msg: any) =>
        `${msg.line}:${msg.column} - ${msg.severity === 2 ? 'error' : 'warning'} - ${msg.message} (${msg.ruleId})`
      )
    }));

    // Filter out files with no issues
    return fileIssues.filter(file => file.errorCount > 0 || file.warningCount > 0);

  } catch (error) {
    console.error('Failed to run ESLint:', error);
    return [];
  }
}

/**
 *
 * @param fileIssues
 */
function generateReport(fileIssues: FileIssues[]): void {
  if (fileIssues.length === 0) {
    console.log('✅ No ESLint issues found!');
    return;
  }

  // Sort by total issues (errors + warnings), highest first
  const sortedFiles = fileIssues.sort((a, b) => {
    const totalA = a.errorCount + a.warningCount;
    const totalB = b.errorCount + b.warningCount;
    return totalB - totalA;
  });

  console.log('🔍 ESLint Issues Report (sorted by severity)');
  console.log('='.repeat(60));

  let totalErrors = 0;
  let totalWarnings = 0;
  const totalFiles = sortedFiles.length;

  for (const [index, file] of sortedFiles.entries()) {
    const totalIssues = file.errorCount + file.warningCount;
    console.log(`\n${index + 1}. ${file.filePath}`);
    console.log(`   Issues: ${totalIssues} (${file.errorCount} errors, ${file.warningCount} warnings)`);

    // Show first 5 issues as preview
    if (file.issues.length > 0) {
      const preview = file.issues.slice(0, 5);
      for (const issue of preview) {
        console.log(`   • ${issue}`);
      }

      if (file.issues.length > 5) {
        console.log(`   ... and ${file.issues.length - 5} more issues`);
      }
    }

    totalErrors += file.errorCount;
    totalWarnings += file.warningCount;
  }

  console.log(`\n${  '='.repeat(60)}`);
  console.log('📊 Summary:');
  console.log(`   Files with issues: ${totalFiles}`);
  console.log(`   Total errors: ${totalErrors}`);
  console.log(`   Total warnings: ${totalWarnings}`);
  console.log(`   Total issues: ${totalErrors + totalWarnings}`);
}

/**
 *
 */
async function main(): Promise<void> {
  console.log('🚀 Analyzing ESLint issues...\n');

  const fileIssues = await getLintReport();
  generateReport(fileIssues);
}

// Run the script
if (import.meta.main) {
  main().catch(console.error);
}