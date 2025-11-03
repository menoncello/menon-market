import { describe, it, expect, beforeEach } from 'bun:test';
import { AnalysisEngine } from '../src/engines/analysis-engine.js';
import type { AnalysisConfig } from '../src/types.js';

describe('AnalysisEngine', () => {
  let engine: AnalysisEngine;
  let config: AnalysisConfig;

  beforeEach(() => {
    config = {
      nlpProvider: 'openai',
      analysisDepth: 'comprehensive',
      userProfile: {
        expertise: 'intermediate',
        preferences: ['concise', 'structured'],
      },
    };
    engine = new AnalysisEngine(config);
  });

  describe('analyzePrompt', () => {
    it('should analyze a simple prompt correctly', async () => {
      const prompt = 'Write a blog post about AI';
      const result = await engine.analyzePrompt(prompt);

      expect(result).toBeDefined();
      expect(result.intent).toBe('generate');
      expect(result.domain).toBe('creative');
      expect(result.complexity).toBe('low');
      expect(result.clarity).toBeGreaterThan(0);
      expect(result.specificity).toBeGreaterThan(0);
      expect(result.completeness).toBeGreaterThan(0);
      expect(Array.isArray(result.ambiguities)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should identify technical domain correctly', async () => {
      const prompt = 'Create a REST API with TypeScript and Express';
      const result = await engine.analyzePrompt(prompt);

      expect(result.domain).toBe('technical');
      expect(result.extractedEntities.languages).toContain('typescript');
    });

    it('should detect high complexity prompts', async () => {
      const prompt =
        'Design a comprehensive microservices architecture with complex integration patterns';
      const result = await engine.analyzePrompt(prompt);

      expect(result.complexity).toBe('high');
    });

    it('should extract entities correctly', async () => {
      const prompt = 'Create a JSON API with Node.js and PostgreSQL';
      const result = await engine.analyzePrompt(prompt);

      expect(result.extractedEntities.formats).toContain('json');
      expect(result.extractedEntities.languages).toContain('node.js');
    });

    it('should generate suggestions for low-quality prompts', async () => {
      const prompt = 'good stuff';
      const result = await engine.analyzePrompt(prompt);

      expect(result.clarity).toBeLessThan(7);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.ambiguities.length).toBeGreaterThan(0);
    });
  });

  describe('extractIntent', () => {
    it('should identify generation intent', async () => {
      const prompt = 'Generate a story about dragons';
      const result = await engine.analyzePrompt(prompt);

      expect(result.intent).toBe('generate');
    });

    it('should identify analysis intent', async () => {
      const prompt = 'Analyze the market trends';
      const result = await engine.analyzePrompt(prompt);

      expect(result.intent).toBe('analyze');
    });
  });

  describe('quality metrics calculation', () => {
    it('should calculate clarity score correctly', async () => {
      const clearPrompt =
        'Write a comprehensive technical blog post about machine learning algorithms, including code examples and performance benchmarks.';
      const result = await engine.analyzePrompt(clearPrompt);

      expect(result.clarity).toBeGreaterThan(7);
    });

    it('should calculate specificity score correctly', async () => {
      const specificPrompt =
        'Create a 500-word blog post about React hooks, including useState and useEffect examples, in Markdown format.';
      const result = await engine.analyzePrompt(specificPrompt);

      expect(result.specificity).toBeGreaterThan(7);
    });

    it('should calculate completeness score correctly', async () => {
      const completePrompt =
        'As a senior developer, write a technical guide about microservices architecture. Include examples, best practices, and deployment strategies. The target audience is intermediate developers.';
      const result = await engine.analyzePrompt(completePrompt);

      expect(result.completeness).toBeGreaterThan(7);
    });
  });
});
