# Usage Examples

This document provides practical examples of using the Research Tools Plugin for various research scenarios.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Academic Research](#academic-research)
- [Market Intelligence](#market-intelligence)
- [Competitive Analysis](#competitive-analysis)
- [Company Research](#company-research)
- [Technical Research](#technical-research)
- [Advanced Patterns](#advanced-patterns)

## Basic Usage

### Simple Research Query

```typescript
import { performResearch, initialize } from 'research-tools';

// Initialize with default configuration
const config = initialize();

// Perform basic research
const result = await performResearch('artificial intelligence trends', config);

console.log('=== Research Results ===');
console.log('Query:', result.query);
console.log('Summary:', result.summary);
console.log('Key Findings:');
result.keyFindings.forEach((finding, index) => {
  console.log(`${index + 1}. ${finding}`);
});
console.log('Confidence:', `${(result.confidence * 100).toFixed(1)}%`);
console.log('Sources:', result.sources.length);
```

### Custom Configuration

```typescript
import { performResearch, initialize } from 'research-tools';

// Custom configuration for quality-focused research
const qualityConfig = initialize({
  enableDeepResearch: true,
  maxSources: 50,
  outputFormat: 'json',
  timeout: 60000,
  cacheEnabled: true,
});

const result = await performResearch('machine learning in healthcare', qualityConfig);

// Output as JSON
console.log(JSON.stringify(result, null, 2));
```

## Academic Research

### Literature Review

```typescript
import { performResearch, initialize } from 'research-tools';

const academicConfig = initialize({
  maxSources: 30,
  outputFormat: 'markdown',
  enableDeepResearch: true,
});

async function conductLiteratureReview(topic: string) {
  console.log(`Conducting literature review: ${topic}`);

  const result = await performResearch(topic, academicConfig);

  // Filter for academic sources
  const academicSources = result.sources.filter(source => source.type === 'academic');

  console.log('\n=== Academic Sources ===');
  academicSources.forEach(source => {
    console.log(`Title: ${source.title}`);
    console.log(`Relevance: ${(source.relevanceScore * 100).toFixed(1)}%`);
    console.log(`URL: ${source.url}`);
    console.log('---');
  });

  console.log('\n=== Key Findings ===');
  result.keyFindings.forEach((finding, index) => {
    console.log(`${index + 1}. ${finding}`);
  });

  return result;
}

// Example usage
const literatureReview = await conductLiteratureReview(
  'deep learning applications in medical diagnosis'
);
```

### Research Quality Assessment

```typescript
import { performResearch, initialize } from 'research-tools';

function assessResearchQuality(result) {
  const quality = {
    overall: result.confidence,
    sourceCount: result.sources.length,
    avgRelevance:
      result.sources.reduce((sum, s) => sum + s.relevanceScore, 0) / result.sources.length,
    sourceTypes: [...new Set(result.sources.map(s => s.type))],
    recentSources: result.sources.filter(
      s => s.publishedAt && Date.now() - s.publishedAt.getTime() < 365 * 24 * 60 * 60 * 1000
    ).length,
  };

  console.log('=== Research Quality Assessment ===');
  console.log(`Overall Confidence: ${(quality.overall * 100).toFixed(1)}%`);
  console.log(`Source Count: ${quality.sourceCount}`);
  console.log(`Average Relevance: ${(quality.avgRelevance * 100).toFixed(1)}%`);
  console.log(`Source Types: ${quality.sourceTypes.join(', ')}`);
  console.log(`Recent Sources: ${quality.recentSources}/${quality.sourceCount}`);

  return quality;
}

const result = await performResearch('quantum computing applications', initialize());
const quality = assessResearchQuality(result);
```

## Market Intelligence

### Market Sizing Analysis

```typescript
import performDeepResearch from 'research-tools/skills/deep-research';

async function analyzeMarketSize(industry: string) {
  console.log(`Analyzing market size for: ${industry}`);

  const config = {
    maxSources: 20,
    requireCrossValidation: true,
    qualityThreshold: 0.7,
    includeSentiment: true,
  };

  const report = await performDeepResearch(
    `${industry} market size trends`,
    'market-analysis',
    config
  );

  console.log('\n=== Market Analysis Report ===');
  console.log(`Title: ${report.title}`);
  console.log(`Summary: ${report.summary}`);

  console.log('\n=== Key Market Findings ===');
  report.findings
    .filter(f => f.category === 'market')
    .forEach(finding => {
      console.log(`Impact: ${finding.impact.toUpperCase()}`);
      console.log(`Insight: ${finding.insight}`);
      console.log(`Confidence: ${(finding.confidence * 100).toFixed(1)}%`);
      console.log('---');
    });

  console.log('\n=== Recommendations ===');
  report.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });

  return report;
}

// Example usage
const marketAnalysis = await analyzeMarketSize('electric vehicle charging infrastructure');
```

### Trend Analysis

```typescript
import performDeepResearch from 'research-tools/skills/deep-research';

async function analyzeTrends(topic: string, timeframe: string = '2024-2025') {
  const config = {
    maxSources: 25,
    requireCrossValidation: true,
    qualityThreshold: 0.75,
    includeSentiment: true,
  };

  const report = await performDeepResearch(
    `${topic} trends ${timeframe}`,
    'trend-analysis',
    config
  );

  // Categorize findings by impact
  const findingsByImpact = {
    critical: report.findings.filter(f => f.impact === 'critical'),
    high: report.findings.filter(f => f.impact === 'high'),
    medium: report.findings.filter(f => f.impact === 'medium'),
    low: report.findings.filter(f => f.impact === 'low'),
  };

  console.log(`=== Trend Analysis: ${topic} ===`);

  Object.entries(findingsByImpact).forEach(([impact, findings]) => {
    if (findings.length > 0) {
      console.log(`\n${impact.toUpperCase()} IMPACT TRENDS:`);
      findings.forEach(finding => {
        console.log(`• ${finding.insight}`);
      });
    }
  });

  return report;
}

// Example usage
const trendReport = await analyzeTrends('artificial intelligence in education');
```

## Competitive Analysis

### Competitor Intelligence

```typescript
import performDeepResearch from 'research-tools/skills/deep-research';

async function analyzeCompetitors(company: string, industry: string) {
  const config = {
    maxSources: 15,
    requireCrossValidation: true,
    qualityThreshold: 0.8,
    includeSentiment: true,
  };

  const report = await performDeepResearch(
    `${company} competitors ${industry}`,
    'competitor-analysis',
    config
  );

  console.log(`=== Competitive Analysis: ${company} ===`);

  // Extract competitive insights
  const competitiveFindings = report.findings.filter(f => f.category === 'competitive');

  console.log('\n=== Competitive Positioning ===');
  competitiveFindings.forEach(finding => {
    console.log(`• ${finding.insight} (Confidence: ${(finding.confidence * 100).toFixed(1)}%)`);
  });

  console.log('\n=== Strategic Recommendations ===');
  const strategicRecs = report.recommendations.filter(
    rec => rec.toLowerCase().includes('strategic') || rec.toLowerCase().includes('competitive')
  );

  strategicRecs.forEach(rec => {
    console.log(`• ${rec}`);
  });

  return report;
}

// Example usage
const competitorAnalysis = await analyzeCompetitors('Tesla', 'electric vehicle market');
```

### Market Position Analysis

```typescript
import performDeepResearch from 'research-tools/skills/deep-research';

async function analyzeMarketPosition(company: string) {
  const config = {
    maxSources: 20,
    requireCrossValidation: true,
    qualityThreshold: 0.75,
    includeSentiment: true,
  };

  const report = await performDeepResearch(
    `${company} market position analysis`,
    'market-analysis',
    config
  );

  // Analyze market position findings
  const marketFindings = report.findings.filter(f => f.category === 'market');
  const financialFindings = report.findings.filter(f => f.category === 'financial');

  console.log(`=== Market Position Analysis: ${company} ===`);

  console.log('\n=== Market Position ===');
  marketFindings.forEach(finding => {
    const impact = finding.impact.toUpperCase();
    console.log(`[${impact}] ${finding.insight}`);
  });

  console.log('\n=== Financial Health ===');
  financialFindings.forEach(finding => {
    console.log(`• ${finding.insight}`);
  });

  console.log('\n=== Competitive Advantages ===');
  const advantages = report.recommendations.filter(
    rec => rec.toLowerCase().includes('advantage') || rec.toLowerCase().includes('strength')
  );

  advantages.forEach(adv => {
    console.log(`• ${adv}`);
  });

  return report;
}

// Example usage
const positionAnalysis = await analyzeMarketPosition('Microsoft');
```

## Company Research

### Company Analysis for Job Applications

```typescript
import performDeepResearch from 'research-tools/skills/deep-research';

async function researchCompanyForJobApplication(company: string, role: string) {
  const config = {
    maxSources: 15,
    requireCrossValidation: true,
    qualityThreshold: 0.7,
    includeSentiment: true,
  };

  const report = await performDeepResearch(
    `${company} company culture values ${role}`,
    'company-research',
    config
  );

  console.log(`=== Company Research: ${company} ===`);
  console.log(`Role: ${role}`);

  // Extract relevant findings for job application
  const cultureFindings = report.findings.filter(
    f =>
      f.insight.toLowerCase().includes('culture') ||
      f.insight.toLowerCase().includes('values') ||
      f.insight.toLowerCase().includes('work environment')
  );

  const financialFindings = report.findings.filter(f => f.category === 'financial');

  console.log('\n=== Company Culture & Values ===');
  cultureFindings.forEach(finding => {
    console.log(`• ${finding.insight}`);
  });

  console.log('\n=== Financial Health ===');
  financialFindings.forEach(finding => {
    console.log(`• ${finding.insight}`);
  });

  console.log('\n=== Interview Preparation Tips ===');
  const interviewTips = report.recommendations.filter(
    rec =>
      rec.toLowerCase().includes('interview') ||
      rec.toLowerCase().includes('prepare') ||
      rec.toLowerCase().includes('discuss')
  );

  interviewTips.forEach(tip => {
    console.log(`• ${tip}`);
  });

  return report;
}

// Example usage
const companyResearch = await researchCompanyForJobApplication('Stripe', 'Software Engineer');
```

### Partnership Evaluation

```typescript
import performDeepResearch from 'research-tools/skills/deep-research';

async function evaluatePartnership(company1: string, company2: string) {
  const config = {
    maxSources: 20,
    requireCrossValidation: true,
    qualityThreshold: 0.8,
    includeSentiment: true,
  };

  const report = await performDeepResearch(
    `${company1} ${company2} partnership opportunities compatibility`,
    'company-research',
    config
  );

  console.log(`=== Partnership Evaluation: ${company1} + ${company2} ===`);

  // Analyze strategic fit
  const strategicFindings = report.findings.filter(
    f =>
      f.category === 'strategic' ||
      f.insight.toLowerCase().includes('synergy') ||
      f.insight.toLowerCase().includes('partnership')
  );

  console.log('\n=== Strategic Alignment ===');
  strategicFindings.forEach(finding => {
    const confidence = (finding.confidence * 100).toFixed(1);
    console.log(`• ${finding.insight} (Confidence: ${confidence}%)`);
  });

  console.log('\n=== Partnership Recommendations ===');
  const partnershipRecs = report.recommendations.filter(
    rec =>
      rec.toLowerCase().includes('partnership') ||
      rec.toLowerCase().includes('collaboration') ||
      rec.toLowerCase().includes('joint')
  );

  partnershipRecs.forEach(rec => {
    console.log(`• ${rec}`);
  });

  console.log('\n=== Risk Factors ===');
  const riskFactors = report.limitations.filter(
    limit =>
      limit.toLowerCase().includes('risk') ||
      limit.toLowerCase().includes('challenge') ||
      limit.toLowerCase().includes('concern')
  );

  riskFactors.forEach(risk => {
    console.log(`⚠️  ${risk}`);
  });

  return report;
}

// Example usage
const partnershipEval = await evaluatePartnership('Apple', 'Nike');
```

## Technical Research

### Technology Evaluation

```typescript
import performDeepResearch from 'research-tools/skills/deep-research';

async function evaluateTechnology(technology: string, useCase?: string) {
  const config = {
    maxSources: 25,
    requireCrossValidation: true,
    qualityThreshold: 0.8,
    includeSentiment: true,
  };

  const query = useCase
    ? `${technology} evaluation ${useCase}`
    : `${technology} technical evaluation`;

  const report = await performDeepResearch(query, 'technical-analysis', config);

  console.log(`=== Technical Evaluation: ${technology} ===`);
  if (useCase) {
    console.log(`Use Case: ${useCase}`);
  }

  // Extract technical insights
  const technicalFindings = report.findings.filter(f => f.category === 'technical');

  console.log('\n=== Technical Capabilities ===');
  technicalFindings.forEach(finding => {
    const impact = finding.impact.toUpperCase();
    console.log(`[${impact}] ${finding.insight}`);
  });

  console.log('\n=== Implementation Considerations ===');
  const implementationRecs = report.recommendations.filter(
    rec =>
      rec.toLowerCase().includes('implement') ||
      rec.toLowerCase().includes('deploy') ||
      rec.toLowerCase().includes('integrate')
  );

  implementationRecs.forEach(rec => {
    console.log(`• ${rec}`);
  });

  console.log('\n=== Performance & Scalability ===');
  const performanceFindings = report.findings.filter(
    f =>
      f.insight.toLowerCase().includes('performance') ||
      f.insight.toLowerCase().includes('scalability') ||
      f.insight.toLowerCase().includes('efficiency')
  );

  performanceFindings.forEach(finding => {
    console.log(`• ${finding.insight}`);
  });

  return report;
}

// Example usage
const techEvaluation = await evaluateTechnology('Kubernetes', 'microservices architecture');
```

### Tool Comparison

```typescript
import performDeepResearch from 'research-tools/skills/deep-research';

async function compareTools(tools: string[], category: string) {
  const config = {
    maxSources: 20,
    requireCrossValidation: true,
    qualityThreshold: 0.75,
    includeSentiment: true,
  };

  const toolsQuery = tools.join(' vs ');
  const report = await performDeepResearch(
    `${toolsQuery} comparison ${category}`,
    'tool-comparison',
    config
  );

  console.log(`=== Tool Comparison: ${tools.join(' vs ')} ===`);
  console.log(`Category: ${category}`);

  // Extract comparison insights
  const comparisonFindings = report.findings.filter(
    f =>
      f.insight.toLowerCase().includes('vs') ||
      f.insight.toLowerCase().includes('compared') ||
      f.insight.toLowerCase().includes('advantage')
  );

  console.log('\n=== Key Differences ===');
  comparisonFindings.forEach(finding => {
    const confidence = (finding.confidence * 100).toFixed(1);
    console.log(`• ${finding.insight} (Confidence: ${confidence}%)`);
  });

  console.log('\n=== Use Case Recommendations ===');
  const useCaseRecs = report.recommendations.filter(
    rec =>
      rec.toLowerCase().includes('use case') ||
      rec.toLowerCase().includes('best for') ||
      rec.toLowerCase().includes('choose')
  );

  useCaseRecs.forEach(rec => {
    console.log(`• ${rec}`);
  });

  return report;
}

// Example usage
const toolComparison = await compareTools(
  ['Docker', 'Podman', 'Containerd'],
  'container orchestration'
);
```

## Advanced Patterns

### Batch Research Processing

```typescript
import { performResearch, initialize } from 'research-tools';

async function batchResearch(queries: string[], config) {
  console.log(`Processing ${queries.length} research queries...`);

  const results = [];

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`\n[${i + 1}/${queries.length}] Researching: ${query}`);

    try {
      const result = await performResearch(query, config);
      results.push({
        query,
        success: true,
        result,
        error: null,
      });

      console.log(`✅ Completed - Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    } catch (error) {
      console.log(`❌ Failed - ${error.message}`);
      results.push({
        query,
        success: false,
        result: null,
        error: error.message,
      });
    }

    // Small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\n=== Batch Research Summary ===`);
  console.log(`Successful: ${successful}/${queries.length}`);
  console.log(`Failed: ${failed}/${queries.length}`);
  console.log(`Average Confidence: ${calculateAverageConfidence(results).toFixed(1)}%`);

  return results;
}

function calculateAverageConfidence(results) {
  const successfulResults = results.filter(r => r.success && r.result);
  if (successfulResults.length === 0) return 0;

  const totalConfidence = successfulResults.reduce((sum, r) => sum + r.result.confidence, 0);
  return (totalConfidence / successfulResults.length) * 100;
}

// Example usage
const queries = [
  'AI in healthcare applications',
  'Blockchain supply chain use cases',
  'Quantum computing commercial viability',
  '5G network deployment challenges',
];

const config = initialize({
  maxSources: 15,
  outputFormat: 'json',
  timeout: 30000,
});

const batchResults = await batchResearch(queries, config);
```

### Research Pipeline

```typescript
import { performResearch, initialize } from 'research-tools';
import performDeepResearch from 'research-tools/skills/deep-research';

class ResearchPipeline {
  constructor(config) {
    this.config = config;
    this.results = [];
  }

  async initialResearch(query) {
    console.log(`🔍 Initial research: ${query}`);
    const result = await performResearch(query, this.config);
    this.results.push({ type: 'initial', query, result });
    return result;
  }

  async deepResearch(query, workflow) {
    console.log(`🔬 Deep research: ${query} (${workflow})`);
    const config = {
      maxSources: 20,
      requireCrossValidation: true,
      qualityThreshold: 0.8,
      includeSentiment: true,
    };

    const report = await performDeepResearch(query, workflow, config);
    this.results.push({ type: 'deep', query, workflow, report });
    return report;
  }

  async competitiveAnalysis(company, competitors) {
    console.log(`⚔️  Competitive analysis: ${company}`);

    const analysis = {
      company: await this.deepResearch(company, 'company-research'),
      competitors: [],
    };

    for (const competitor of competitors) {
      const competitorReport = await this.deepResearch(
        `${competitor} vs ${company}`,
        'competitor-analysis'
      );
      analysis.competitors.push({
        name: competitor,
        report: competitorReport,
      });
    }

    this.results.push({ type: 'competitive', company, analysis });
    return analysis;
  }

  generateSummary() {
    const summary = {
      totalResearch: this.results.length,
      initialResearch: this.results.filter(r => r.type === 'initial').length,
      deepResearch: this.results.filter(r => r.type === 'deep').length,
      competitiveAnalysis: this.results.filter(r => r.type === 'competitive').length,
      averageConfidence: this.calculateAverageConfidence(),
      keyInsights: this.extractKeyInsights(),
    };

    console.log('\n=== Research Pipeline Summary ===');
    console.log(`Total Research Operations: ${summary.totalResearch}`);
    console.log(`Initial Research: ${summary.initialResearch}`);
    console.log(`Deep Research: ${summary.deepResearch}`);
    console.log(`Competitive Analysis: ${summary.competitiveAnalysis}`);
    console.log(`Average Confidence: ${summary.averageConfidence.toFixed(1)}%`);

    console.log('\n=== Key Insights ===');
    summary.keyInsights.forEach((insight, index) => {
      console.log(`${index + 1}. ${insight}`);
    });

    return summary;
  }

  calculateAverageConfidence() {
    const allResults = this.results.flatMap(r => {
      if (r.result) return [r.result];
      if (r.report) return [r.report];
      if (r.analysis) return [r.analysis.company, ...r.analysis.competitors.map(c => c.report)];
      return [];
    });

    if (allResults.length === 0) return 0;

    const totalConfidence = allResults.reduce((sum, result) => {
      return sum + (result.confidence || 0);
    }, 0);

    return (totalConfidence / allResults.length) * 100;
  }

  extractKeyInsights() {
    const insights = [];

    this.results.forEach(research => {
      if (research.result && research.result.keyFindings) {
        insights.push(...research.result.keyFindings);
      }
      if (research.report && research.report.findings) {
        insights.push(
          ...research.report.findings
            .filter(f => f.impact === 'high' || f.impact === 'critical')
            .map(f => f.insight)
        );
      }
    });

    // Remove duplicates and limit to top insights
    return [...new Set(insights)].slice(0, 10);
  }
}

// Example usage
const config = initialize({
  maxSources: 20,
  outputFormat: 'markdown',
  enableDeepResearch: true,
});

const pipeline = new ResearchPipeline(config);

// Step 1: Initial market research
await pipeline.initialResearch('electric vehicle market trends 2024');

// Step 2: Deep research on key players
await pipeline.deepResearch('Tesla position in EV market', 'market-analysis');
await pipeline.deepResearch('BYD competitive advantages', 'company-research');

// Step 3: Competitive analysis
await pipeline.competitiveAnalysis('Tesla', ['Ford', 'GM', 'Volkswagen']);

// Generate comprehensive summary
const summary = pipeline.generateSummary();
```

### Real-time Research Monitoring

```typescript
import { performResearch, initialize } from 'research-tools';

class ResearchMonitor {
  constructor() {
    this.activeResearch = new Map();
    this.completedResearch = [];
    this.config = initialize({
      logLevel: 'debug',
      enableMetrics: true,
    });
  }

  async monitoredResearch(query, options = {}) {
    const researchId = this.generateId();
    const startTime = Date.now();

    console.log(`🚀 Starting research [${researchId}]: ${query}`);

    this.activeResearch.set(researchId, {
      query,
      startTime,
      status: 'running',
      progress: 0,
    });

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        const research = this.activeResearch.get(researchId);
        if (research && research.status === 'running') {
          research.progress = Math.min(research.progress + 10, 90);
          console.log(`📊 Research [${researchId}] progress: ${research.progress}%`);
        }
      }, 100);

      const result = await performResearch(query, this.config);

      clearInterval(progressInterval);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Update status
      this.activeResearch.set(researchId, {
        ...this.activeResearch.get(researchId),
        status: 'completed',
        progress: 100,
        endTime,
        duration,
      });

      console.log(`✅ Research completed [${researchId}] in ${duration}ms`);
      console.log(`📈 Quality score: ${result.metadata.qualityScore.toFixed(2)}`);
      console.log(`🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);

      // Move to completed
      const completedResearch = this.activeResearch.get(researchId);
      this.completedResearch.push({
        ...completedResearch,
        result,
      });

      this.activeResearch.delete(researchId);

      return result;
    } catch (error) {
      console.log(`❌ Research failed [${researchId}]: ${error.message}`);

      this.activeResearch.set(researchId, {
        ...this.activeResearch.get(researchId),
        status: 'failed',
        error: error.message,
        endTime: Date.now(),
      });

      throw error;
    }
  }

  generateId() {
    return `research_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getActiveResearchCount() {
    return this.activeResearch.size;
  }

  getCompletedResearchCount() {
    return this.completedResearch.length;
  }

  getAverageQuality() {
    if (this.completedResearch.length === 0) return 0;

    const totalQuality = this.completedResearch.reduce((sum, research) => {
      return sum + (research.result?.metadata?.qualityScore || 0);
    }, 0);

    return totalQuality / this.completedResearch.length;
  }

  printStatus() {
    console.log('\n=== Research Monitor Status ===');
    console.log(`Active Research: ${this.getActiveResearchCount()}`);
    console.log(`Completed Research: ${this.getCompletedResearchCount()}`);
    console.log(`Average Quality: ${(this.getAverageQuality() * 100).toFixed(1)}%`);

    if (this.activeResearch.size > 0) {
      console.log('\nActive Research:');
      this.activeResearch.forEach((research, id) => {
        console.log(`  ${id}: ${research.query} (${research.progress}%)`);
      });
    }
  }
}

// Example usage
const monitor = new ResearchMonitor();

// Start multiple research operations
const researchPromises = [
  monitor.monitoredResearch('artificial intelligence ethics'),
  monitor.monitoredResearch('quantum computing breakthroughs'),
  monitor.monitoredResearch('renewable energy storage solutions'),
];

// Monitor progress
const statusInterval = setInterval(() => {
  monitor.printStatus();
}, 2000);

// Wait for completion
const results = await Promise.allSettled(researchPromises);

clearInterval(statusInterval);

console.log('\n=== Final Status ===');
monitor.printStatus();
```

---

These examples demonstrate various ways to use the Research Tools Plugin for different research scenarios. For more advanced usage patterns and API details, see the [API documentation](./api.md).
