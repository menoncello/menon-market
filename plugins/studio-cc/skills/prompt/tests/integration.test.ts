import { describe, it, expect, beforeEach } from 'bun:test';
import { AdvancedPromptCrafter } from '../src/index.js';
import type { PromptRequest } from '../src/types.js';

describe('AdvancedPromptCrafter Integration', () => {
  let crafter: AdvancedPromptCrafter;

  beforeEach(() => {
    crafter = new AdvancedPromptCrafter();
  });

  describe('analyzeAndOptimize', () => {
    it('should analyze and optimize a simple prompt', async () => {
      const prompt = 'Write a blog post about AI';
      const result = await crafter.analyzeAndOptimize(prompt, {
        mode: 'creative',
        targetModel: 'claude-3-sonnet',
        outputFormat: 'markdown',
      });

      expect(result).toBeDefined();
      expect(result.originalPrompt).toBe(prompt);
      expect(result.optimizedPrompt).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.optimization).toBeDefined();
      expect(result.validation).toBeDefined();
      expect(result.responseTime).toBeGreaterThan(0);
      expect(result.metadata.mode).toBe('creative');
      expect(result.metadata.model).toBe('claude-3-sonnet');
    });

    it('should handle technical mode correctly', async () => {
      const prompt = 'Create a REST API';
      const result = await crafter.analyzeAndOptimize(prompt, {
        mode: 'technical',
        domain: 'technical',
      });

      expect(result.optimizedPrompt).toContain('Technical');
      expect(result.metadata.mode).toBe('technical');
      expect(result.metadata.domain).toBe('technical');
    });

    it('should handle complex prompts correctly', async () => {
      const prompt =
        'Design a comprehensive microservices architecture with API gateway, service discovery, load balancing, and monitoring';
      const result = await crafter.analyzeAndOptimize(prompt, {
        mode: 'technical',
        targetModel: 'claude-3-opus',
      });

      expect(result.analysis.complexity).toBe('high');
      expect(result.optimization.techniques).toContain('tot');
      expect(result.optimizedPrompt.length).toBeGreaterThan(prompt.length);
    });
  });

  describe('createPrompt', () => {
    it('should create a prompt from requirements', async () => {
      const request: PromptRequest = {
        task: 'Generate TypeScript code for a REST API',
        domain: 'technical',
        mode: 'technical',
        requirements: {
          include: ['types', 'validation', 'error-handling'],
          exclude: ['external-apis'],
        },
        context: 'E-commerce platform backend',
      };

      const result = await crafter.createPrompt(request);

      expect(result).toBeDefined();
      expect(result.optimizedPrompt).toContain('TypeScript');
      expect(result.optimizedPrompt).toContain('REST API');
      expect(result.optimizedPrompt).toContain('validation');
      expect(result.optimizedPrompt).toContain('error-handling');
      expect(result.optimizedPrompt).toContain('E-commerce');
    });

    it('should create prompts for different domains', async () => {
      const requests = [
        {
          task: 'Write a business plan',
          domain: 'business',
          mode: 'business' as const,
        },
        {
          task: 'Create a story',
          domain: 'creative',
          mode: 'creative' as const,
        },
        {
          task: 'Conduct research analysis',
          domain: 'research',
          mode: 'research' as const,
        },
      ];

      for (const request of requests) {
        const result = await crafter.createPrompt(request);
        expect(result.metadata.domain).toBe(request.domain);
        expect(result.metadata.mode).toBe(request.mode);
      }
    });
  });

  describe('getQualityMetrics', () => {
    it('should return quality metrics for a prompt', async () => {
      const prompt =
        'Write a comprehensive technical guide about React hooks with practical examples.';
      const metrics = await crafter.getQualityMetrics(prompt);

      expect(metrics).toBeDefined();
      expect(metrics.clarity).toBeGreaterThan(0);
      expect(metrics.specificity).toBeGreaterThan(0);
      expect(metrics.completeness).toBeGreaterThan(0);
      expect(metrics.efficiency).toBeGreaterThan(0);
      expect(metrics.consistency).toBeGreaterThan(0);
      expect(metrics.errorRate).toBeGreaterThanOrEqual(0);
      expect(metrics.overall).toBeGreaterThan(0);
    });
  });

  describe('createABTestVariations', () => {
    it('should create A/B test variations', async () => {
      const prompt = 'Create a blog post about technology';
      const variations = await crafter.createABTestVariations(prompt, 3);

      expect(variations).toHaveLength(3);
      expect(variations.every(v => v.originalPrompt === prompt)).toBe(true);
      expect(variations.every(v => v.optimizedPrompt !== prompt)).toBe(true);
      expect(variations.every(v => v.analysis)).toBeDefined();
      expect(variations.every(v => v.validation)).toBeDefined();
    });

    it('should create different variations', async () => {
      const prompt = 'Write about AI';
      const variations = await crafter.createABTestVariations(prompt, 3);

      const optimizedPrompts = variations.map(v => v.optimizedPrompt);
      const uniquePrompts = new Set(optimizedPrompts);

      expect(uniquePrompts.size).toBe(3);
    });
  });

  describe('performance', () => {
    it('should complete analysis within reasonable time', async () => {
      const prompt = 'Write a technical blog post about web development';
      const startTime = Date.now();

      const result = await crafter.analyzeAndOptimize(prompt);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.responseTime).toBe(duration);
    });

    it('should handle concurrent requests', async () => {
      const prompts = Array(5)
        .fill(null)
        .map((_, i) => `Test prompt ${i + 1}`);

      const startTime = Date.now();
      const results = await Promise.all(prompts.map(prompt => crafter.analyzeAndOptimize(prompt)));
      const endTime = Date.now();

      expect(results).toHaveLength(5);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });

  describe('error handling', () => {
    it('should handle empty prompts gracefully', async () => {
      const result = await crafter.analyzeAndOptimize('');

      expect(result).toBeDefined();
      expect(result.validation.qualityScore).toBeLessThan(5);
      expect(result.validation.approved).toBe(false);
      expect(result.validation.issues.length).toBeGreaterThan(0);
    });

    it('should handle very long prompts', async () => {
      const longPrompt = `${'Write '.repeat(1000)}about technology`;
      const result = await crafter.analyzeAndOptimize(longPrompt);

      expect(result).toBeDefined();
      expect(result.optimizedPrompt).toBeDefined();
    });

    it('should handle special characters', async () => {
      const specialPrompt = 'Write about AI & ML, including "Python", <code>, and {examples}!';
      const result = await crafter.analyzeAndOptimize(specialPrompt);

      expect(result).toBeDefined();
      expect(result.optimizedPrompt).toBeDefined();
    });
  });

  describe('configuration', () => {
    it('should accept custom configuration', async () => {
      const customCrafter = new AdvancedPromptCrafter({
        analysis: {
          nlpProvider: 'custom',
          analysisDepth: 'deep',
          userProfile: {
            expertise: 'expert',
            preferences: ['detailed', 'comprehensive'],
          },
        },
        optimization: {
          techniques: ['cot', 'react'],
          enableABTesting: false,
          performanceThreshold: 0.9,
        },
        validation: {
          qualityThreshold: 9.0,
          enableBenchmarking: false,
          metrics: ['clarity', 'specificity'],
        },
      });

      const result = await customCrafter.analyzeAndOptimize('Test prompt');

      expect(result).toBeDefined();
      expect(result.optimization.techniques).toContain('cot');
      expect(result.optimization.techniques).toContain('react');
    });
  });
});
