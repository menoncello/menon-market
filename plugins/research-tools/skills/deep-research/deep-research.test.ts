/**
 * Deep Research Skill Tests
 */

import { describe, test, expect } from 'bun:test';
import performDeepResearch, { ResearchWorkflow, DeepResearchConfig } from './index';

describe('Deep Research Skill', () => {
  const defaultConfig: DeepResearchConfig = {
    maxSources: 5,
    requireCrossValidation: true,
    qualityThreshold: 0.7,
    includeSentiment: true
  };

  test('should perform company research workflow', async () => {
    const result = await performDeepResearch(
      'Test Company',
      'company-research',
      defaultConfig
    );

    expect(result.title).toContain('COMPANY RESEARCH: Test Company');
    expect(result.summary).toBeTruthy();
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  test('should perform market analysis workflow', async () => {
    const result = await performDeepResearch(
      'Software Market',
      'market-analysis',
      defaultConfig
    );

    expect(result.title).toContain('MARKET ANALYSIS: Software Market');
    expect(result.methodology).toContain('market-analysis methodology');
    expect(result.limitations.length).toBeGreaterThan(0);
  });

  test('should include all required report sections', async () => {
    const result = await performDeepResearch(
      'Test Query',
      'tool-comparison',
      defaultConfig
    );

    expect(result.title).toBeTruthy();
    expect(result.summary).toBeTruthy();
    expect(result.methodology).toBeTruthy();
    expect(result.findings).toBeArray();
    expect(result.sources).toBeArray();
    expect(typeof result.confidence).toBe('number');
    expect(result.limitations).toBeArray();
    expect(result.recommendations).toBeArray();
    expect(result.generatedAt).toBeInstanceOf(Date);
  });

  test('should handle different workflows correctly', async () => {
    const workflows: ResearchWorkflow[] = [
      'company-research',
      'competitor-analysis',
      'market-analysis',
      'trend-analysis',
      'tool-comparison',
      'technical-analysis'
    ];

    for (const workflow of workflows) {
      const result = await performDeepResearch('Test Query', workflow, defaultConfig);

      expect(result.title).toContain(workflow.replace('-', ' ').toUpperCase());
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    }
  });
});