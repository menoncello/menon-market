/**
 * Research Tools Plugin Tests
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import {
  initialize,
  performResearch,
  defaultConfig,
  pluginMetadata,
  ResearchToolsConfig,
  ResearchResult,
  createConfidenceScore,
  createRelevanceScore,
  isValidConfidenceScore,
  isValidRelevanceScore
} from './index';

describe('Research Tools Plugin', () => {
  let config: ResearchToolsConfig;

  beforeEach(() => {
    config = initialize();
  });

  describe('Plugin Initialization', () => {
    test('should initialize with default config', () => {
      const initializedConfig = initialize();
      expect(initializedConfig).toEqual(defaultConfig);
    });

    test('should merge custom config with defaults', () => {
      const customConfig = initialize({
        maxSources: 10,
        outputFormat: 'json'
      });

      expect(customConfig.maxSources).toBe(10);
      expect(customConfig.outputFormat).toBe('json');
      expect(customConfig.enableDeepResearch).toBe(true); // Default preserved
    });

    test('should have valid plugin metadata', () => {
      expect(pluginMetadata.name).toBe('research-tools');
      expect(pluginMetadata.version).toBe('1.0.0');
      expect(pluginMetadata.description).toBeTruthy();
      expect(pluginMetadata.author).toBeTruthy();
    });
  });

  describe('Research Functionality', () => {
    test('should perform basic research', async () => {
      const result = await performResearch('test query', config);

      expect(result.query).toBe('test query');
      expect(result.sources).toBeDefined();
      expect(Array.isArray(result.sources)).toBe(true);
      expect(result.summary).toBeTruthy();
      expect(result.keyFindings).toBeDefined();
      expect(Array.isArray(result.keyFindings)).toBe(true);
      expect(result.confidence).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.metadata).toBeDefined();
    });

    test('should respect maxSources configuration', async () => {
      const limitedConfig = initialize({ maxSources: 1 });
      const result = await performResearch('test query', limitedConfig);

      expect(result.sources.length).toBeLessThanOrEqual(1);
    });

    test('should include required metadata fields', async () => {
      const result = await performResearch('test query', config);

      expect(result.metadata.totalSources).toBe(result.sources.length);
      expect(result.metadata.processingTime).toBeGreaterThanOrEqual(0);
      expect(result.metadata.methodology).toBeTruthy();
      expect(result.metadata.qualityScore).toBeGreaterThanOrEqual(0);
      expect(result.metadata.qualityScore).toBeLessThanOrEqual(1);
      expect(result.metadata.version).toBe('1.0.0');
    });

    test('should handle different output formats', async () => {
      const formats = ['markdown', 'json', 'html', 'text'] as const;

      for (const format of formats) {
        const testConfig = initialize({ outputFormat: format });
        const result = await performResearch('test query', testConfig);
        expect(result).toBeDefined();
      }
    });
  });

  describe('Source Validation', () => {
    test('should create valid confidence scores', () => {
      expect(createConfidenceScore(0.5)).toBe(0.5);
      expect(createConfidenceScore(0)).toBe(0);
      expect(createConfidenceScore(1)).toBe(1);
    });

    test('should throw error for invalid confidence scores', () => {
      expect(() => createConfidenceScore(-0.1)).toThrow('Invalid confidence score');
      expect(() => createConfidenceScore(1.1)).toThrow('Invalid confidence score');
    });

    test('should create valid relevance scores', () => {
      expect(createRelevanceScore(0.7)).toBe(0.7);
      expect(createRelevanceScore(0)).toBe(0);
      expect(createRelevanceScore(1)).toBe(1);
    });

    test('should throw error for invalid relevance scores', () => {
      expect(() => createRelevanceScore(-0.1)).toThrow('Invalid relevance score');
      expect(() => createRelevanceScore(1.1)).toThrow('Invalid relevance score');
    });

    test('should validate confidence scores correctly', () => {
      expect(isValidConfidenceScore(0.5)).toBe(true);
      expect(isValidConfidenceScore(0)).toBe(true);
      expect(isValidConfidenceScore(1)).toBe(true);
      expect(isValidConfidenceScore(-0.1)).toBe(false);
      expect(isValidConfidenceScore(1.1)).toBe(false);
    });

    test('should validate relevance scores correctly', () => {
      expect(isValidRelevanceScore(0.8)).toBe(true);
      expect(isValidRelevanceScore(0)).toBe(true);
      expect(isValidRelevanceScore(1)).toBe(true);
      expect(isValidRelevanceScore(-0.1)).toBe(false);
      expect(isValidRelevanceScore(1.1)).toBe(false);
    });
  });

  describe('Research Result Structure', () => {
    test('should have proper source structure', async () => {
      const result = await performResearch('test query', config);
      const source = result.sources[0];

      expect(source.id).toBeTruthy();
      expect(source.title).toBeTruthy();
      expect(source.url).toBeInstanceOf(URL);
      expect(source.content).toBeTruthy();
      expect(source.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(source.relevanceScore).toBeLessThanOrEqual(1);
      expect(['academic', 'web', 'news', 'technical', 'social', 'government']).toContain(source.type);
      expect(source.lastAccessed).toBeInstanceOf(Date);
    });

    test('should have consistent confidence scores', async () => {
      const result = await performResearch('test query', config);

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(typeof result.confidence).toBe('number');
    });

    test('should generate meaningful key findings', async () => {
      const result = await performResearch('test query', config);

      expect(result.keyFindings.length).toBeGreaterThan(0);
      result.keyFindings.forEach(finding => {
        expect(typeof finding).toBe('string');
        expect(finding.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle empty queries', async () => {
      const result = await performResearch('', config);
      expect(result).toBeDefined();
      expect(result.query).toBe('');
    });

    test('should handle very long queries', async () => {
      const longQuery = 'a'.repeat(1000);
      const result = await performResearch(longQuery, config);
      expect(result).toBeDefined();
      expect(result.query).toBe(longQuery);
    });

    test('should handle zero maxSources configuration', async () => {
      const noSourcesConfig = initialize({ maxSources: 0 });
      const result = await performResearch('test query', noSourcesConfig);

      expect(result.sources.length).toBe(0);
      expect(result.metadata.totalSources).toBe(0);
    });
  });

  describe('Performance', () => {
    test('should complete research within reasonable time', async () => {
      const startTime = Date.now();
      await performResearch('test query', config);
      const endTime = Date.now();

      const processingTime = endTime - startTime;
      expect(processingTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle concurrent research requests', async () => {
      const queries = ['query 1', 'query 2', 'query 3'];
      const startTime = Date.now();

      const results = await Promise.all(
        queries.map(query => performResearch(query, config))
      );

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(results.length).toBe(3);
      expect(processingTime).toBeLessThan(2000); // Should complete within 2 seconds

      results.forEach((result, index) => {
        expect(result.query).toBe(queries[index]);
      });
    });
  });
});