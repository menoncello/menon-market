/**
 * Integration Tests for Research Tools Plugin
 */

import { describe, test, expect } from 'bun:test';
import { performDeepResearch } from './skills/deep-research';
import { initialize, performResearch, pluginMetadata } from './index';

describe('Research Tools Plugin Integration', () => {
  describe('Plugin Installation', () => {
    test('should initialize plugin successfully', () => {
      const config = initialize({
        maxSources: 10,
        outputFormat: 'json',
        enableDeepResearch: true,
      });

      expect(config.maxSources).toBe(10);
      expect(config.outputFormat).toBe('json');
      expect(config.enableDeepResearch).toBe(true);
    });

    test('should have valid plugin metadata', () => {
      expect(pluginMetadata.name).toBe('research-tools');
      expect(pluginMetadata.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(pluginMetadata.description).toBeTruthy();
      expect(pluginMetadata.author).toBeTruthy();
      expect(pluginMetadata.license).toBe('MIT');
      expect(pluginMetadata.repository).toMatch(/github\.com/);
    });

    test('should maintain backward compatibility', () => {
      const config = initialize();
      expect(typeof config.enableDeepResearch).toBe('boolean');
      expect(typeof config.maxSources).toBe('number');
      expect(['markdown', 'json', 'html', 'text']).toContain(config.outputFormat);
    });
  });

  describe('End-to-End Research Workflow', () => {
    test('should complete full research workflow', async () => {
      const config = initialize({
        maxSources: 3,
        outputFormat: 'markdown',
      });

      const result = await performResearch('artificial intelligence trends', config);

      // Verify basic structure
      expect(result.query).toBe('artificial intelligence trends');
      expect(result.sources.length).toBeGreaterThan(0);
      expect(result.sources.length).toBeLessThanOrEqual(3);
      expect(result.summary).toBeTruthy();
      expect(result.keyFindings.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);

      // Verify source structure
      for (const source of result.sources) {
        expect(source.id).toBeTruthy();
        expect(source.title).toContain('artificial intelligence trends');
        expect(source.url).toBeInstanceOf(URL);
        expect(source.content).toBeTruthy();
        expect(source.relevanceScore).toBeGreaterThanOrEqual(0);
        expect(source.relevanceScore).toBeLessThanOrEqual(1);
        expect(source.lastAccessed).toBeInstanceOf(Date);
      }

      // Verify metadata
      expect(result.metadata.totalSources).toBe(result.sources.length);
      expect(result.metadata.methodology).toBeTruthy();
      expect(result.metadata.qualityScore).toBeGreaterThanOrEqual(0);
      expect(result.metadata.qualityScore).toBeLessThanOrEqual(1);
    });

    test('should handle deep research integration', async () => {
      const deepConfig = {
        maxSources: 5,
        requireCrossValidation: true,
        qualityThreshold: 0.7,
        includeSentiment: true,
      };

      const report = await performDeepResearch(
        'machine learning market analysis',
        'market-analysis',
        deepConfig
      );

      expect(report.title).toContain('MARKET ANALYSIS');
      expect(report.summary).toBeTruthy();
      expect(report.methodology).toContain('market-analysis');
      expect(report.findings.length).toBeGreaterThan(0);
      expect(report.sources.length).toBeGreaterThan(0);
      expect(report.confidence).toBeGreaterThanOrEqual(0);
      expect(report.confidence).toBeLessThanOrEqual(1);
      expect(report.limitations.length).toBeGreaterThan(0);
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.generatedAt).toBeInstanceOf(Date);

      // Verify findings structure
      for (const finding of report.findings) {
        expect([
          'market',
          'financial',
          'technical',
          'competitive',
          'operational',
          'strategic',
          'regulatory',
          'customer',
        ]).toContain(finding.category);
        expect(finding.insight).toBeTruthy();
        expect(finding.evidence).toBeArray();
        expect(['low', 'medium', 'high', 'critical']).toContain(finding.impact);
        expect(finding.confidence).toBeGreaterThanOrEqual(0);
        expect(finding.confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Plugin Configuration', () => {
    test('should handle different configuration scenarios', async () => {
      const configs = [
        { maxSources: 1, outputFormat: 'json' as const },
        { maxSources: 10, outputFormat: 'markdown' as const },
        { maxSources: 50, outputFormat: 'html' as const },
        { maxSources: 100, outputFormat: 'text' as const },
      ];

      for (const configOptions of configs) {
        const config = initialize(configOptions);
        const result = await performResearch('test query', config);

        expect(result.sources.length).toBeLessThanOrEqual(configOptions.maxSources);
        expect(result.query).toBe('test query');
      }
    });

    test('should validate configuration constraints', () => {
      expect(() => initialize({ maxSources: -1 })).not.toThrow();
      expect(() => initialize({ maxSources: 0 })).not.toThrow();
      expect(() => initialize({ maxSources: 1000 })).not.toThrow();
    });
  });

  describe('Error Recovery', () => {
    test('should handle malformed inputs gracefully', async () => {
      const testCases = [
        '',
        '   ', // whitespace
        'a'.repeat(10000), // very long string
        '🚀🔬📊', // emojis
        '<script>alert("test")</script>', // potential XSS
      ];

      for (const query of testCases) {
        const result = await performResearch(query, initialize());
        expect(result).toBeDefined();
        expect(result.query).toBe(query);
      }
    });

    test('should maintain data integrity under stress', async () => {
      const concurrentRequests = 10;
      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        performResearch(`test query ${i}`, initialize({ maxSources: 2 }))
      );

      const results = await Promise.all(promises);

      expect(results.length).toBe(concurrentRequests);
      for (const [index, result] of results.entries()) {
        expect(result.query).toBe(`test query ${index}`);
        expect(result.sources.length).toBeLessThanOrEqual(2);
        expect(result.metadata.totalSources).toBe(result.sources.length);
      }
    });
  });

  describe('Performance Benchmarks', () => {
    test('should meet performance requirements', async () => {
      const startTime = Date.now();
      const result = await performResearch(
        'performance test query',
        initialize({ maxSources: 10 })
      );
      const endTime = Date.now();

      const processingTime = endTime - startTime;
      expect(processingTime).toBeLessThan(500); // Should complete within 500ms
      expect(result.metadata.processingTime).toBeGreaterThanOrEqual(0);
    });

    test('should handle memory efficiently', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform multiple research operations
      for (let i = 0; i < 5; i++) {
        await performResearch(`memory test ${i}`, initialize({ maxSources: 5 }));
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});
