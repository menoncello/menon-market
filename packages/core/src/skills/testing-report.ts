/**
 * Test report generator helper class
 * Provides functionality to generate formatted test reports
 */

import { COMMON_CONSTANTS } from './constants';
import { SkillTestResult } from './testing-interfaces';

/**
 * Test report generator helper class
 */
export class TestReportGenerator {
  /**
   * Generate formatted test report
   * @param {string} [skillId] - Optional skill ID to generate report for
   * @param {SkillTestResult[]} allResults - All test results
   * @param {(skillId: string) => SkillTestResult | null} getTestResult - Function to get test result by ID
   * @returns {string} Formatted test report
   */
  generateReport(
    skillId: string | undefined,
    allResults: SkillTestResult[],
    getTestResult: (skillId: string) => SkillTestResult | null
  ): string {
    const results = skillId
      ? ([getTestResult(skillId)].filter(Boolean) as SkillTestResult[])
      : allResults;

    if (results.length === 0) {
      return 'No test results available';
    }

    let report = this.generateReportHeader(results);
    report += this.generateReportSummary(results);

    for (const result of results) {
      report += this.generateSkillReport(result);
      report += '\n---\n\n';
    }

    return report;
  }

  /**
   * Generate report header with summary statistics
   * @param {SkillTestResult[]} results - Test results to analyze
   * @returns {string} Report header section
   */
  private generateReportHeader(results: SkillTestResult[]): string {
    let report = '# Skill Test Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Total Skills Tested: ${results.length}\n\n`;
    return report;
  }

  /**
   * Generate summary statistics section
   * @param {SkillTestResult[]} results - Test results to analyze
   * @returns {string} Summary section of the report
   */
  private generateReportSummary(results: SkillTestResult[]): string {
    const passedTests = results.filter(r => r.success).length;
    const failedTests = results.length - passedTests;

    let report = '## Summary\n\n';
    report += `- Passed: ${passedTests}\n`;
    report += `- Failed: ${failedTests}\n`;
    report += `- Success Rate: ${Math.round((passedTests / results.length) * COMMON_CONSTANTS.PERCENT_MULTIPLIER)}%\n\n`;

    return report;
  }

  /**
   * Generate individual skill report section
   * @param {SkillTestResult} result - Test result to report on
   * @returns {string} Individual skill report section
   */
  private generateSkillReport(result: SkillTestResult): string {
    let report = this.generateSkillHeader(result);
    report += this.generateValidationSection(result);
    report += this.generateCompatibilitySection(result);
    report += this.generatePerformanceSection(result);
    report += this.generateRecommendationsSection(result);

    return report;
  }

  /**
   * Generate skill header with status and basic info
   * @param {SkillTestResult} result - Test result
   * @returns {string} Skill header section
   */
  private generateSkillHeader(result: SkillTestResult): string {
    let report = `## Skill: ${result.skillId}\n\n`;
    report += `**Status:** ${result.success ? '✅ PASSED' : '❌ FAILED'}\n`;
    report += `**Execution Time:** ${result.executionTime}ms\n`;
    report += `**Test Score:** ${result.validation.score}/100\n\n`;
    return report;
  }

  /**
   * Generate validation section of the report
   * @param {SkillTestResult} result - Test result
   * @returns {string} Validation section
   */
  private generateValidationSection(result: SkillTestResult): string {
    let report = `### Validation\n`;
    report += `- Valid: ${result.validation.valid ? 'Yes' : 'No'}\n`;
    report += `- Errors: ${result.validation.errors.length}\n`;
    report += `- Warnings: ${result.validation.warnings.length}\n\n`;
    return report;
  }

  /**
   * Generate compatibility section of the report
   * @param {SkillTestResult} result - Test result
   * @returns {string} Compatibility section
   */
  private generateCompatibilitySection(result: SkillTestResult): string {
    if (result.compatibility.length === 0) return '';

    let report = `### Compatibility\n`;
    for (const compat of result.compatibility) {
      report += `- ${compat.agentRole}: ${compat.compatibilityLevel} (${compat.success ? '✅' : '❌'})\n`;
    }
    report += '\n';
    return report;
  }

  /**
   * Generate performance section of the report
   * @param {SkillTestResult} result - Test result
   * @returns {string} Performance section
   */
  private generatePerformanceSection(result: SkillTestResult): string {
    let report = `### Performance\n`;
    report += `- Expected: ${result.performance.expected.executionTime.min}-${result.performance.expected.executionTime.max}s\n`;
    report += `- Actual: ${result.performance.actual.executionTime}s\n`;
    report += `- Memory: ${result.performance.actual.memoryUsage}MB\n`;
    report += `- Score: ${result.performance.score}/100\n\n`;
    return report;
  }

  /**
   * Generate recommendations section of the report
   * @param {SkillTestResult} result - Test result
   * @returns {string} Recommendations section
   */
  private generateRecommendationsSection(result: SkillTestResult): string {
    if (result.recommendations.length === 0) return '';

    let report = `### Recommendations\n`;
    for (const recommendation of result.recommendations) {
      report += `- ${recommendation}\n`;
    }
    report += '\n';
    return report;
  }
}
