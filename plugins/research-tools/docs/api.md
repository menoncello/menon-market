# Research Tools Plugin API Reference

## Overview

This document provides comprehensive API reference for the Research Tools Plugin, including all available functions, types, and configuration options.

## Core Functions

### `initialize(config?: Partial<ResearchToolsConfig>): ResearchToolsConfig`

Initializes the research tools plugin with configuration options.

**Parameters:**
- `config` (optional): Partial configuration object to override defaults

**Returns:**
- `ResearchToolsConfig`: Complete configuration object

**Example:**
```typescript
import { initialize } from 'research-tools';

const config = initialize({
  maxSources: 25,
  outputFormat: 'json',
  enableDeepResearch: true
});
```

### `performResearch(query: string, config: ResearchToolsConfig): Promise<ResearchResult>`

Performs research on a given topic using the specified configuration.

**Parameters:**
- `query`: Research query string
- `config`: Research configuration object

**Returns:**
- `Promise<ResearchResult>`: Research results with sources and analysis

**Example:**
```typescript
import { performResearch, initialize } from 'research-tools';

const config = initialize();
const result = await performResearch('machine learning trends', config);

console.log(result.summary);
console.log(result.keyFindings);
```

### Deep Research Skill

### `performDeepResearch(query: string, workflow: ResearchWorkflow, config: DeepResearchConfig): Promise<ResearchReport>`

Performs comprehensive deep research using specific workflows.

**Parameters:**
- `query`: Research query string
- `workflow`: Research workflow type
- `config`: Deep research configuration

**Returns:**
- `Promise<ResearchReport>`: Comprehensive research report

**Example:**
```typescript
import performDeepResearch from 'research-tools/skills/deep-research';

const report = await performDeepResearch(
  'Competitor Analysis',
  'competitor-analysis',
  {
    maxSources: 15,
    requireCrossValidation: true,
    qualityThreshold: 0.8,
    includeSentiment: true
  }
);
```

## Configuration Types

### `ResearchToolsConfig`

Main configuration interface for the research tools plugin.

```typescript
interface ResearchToolsConfig {
  readonly enableDeepResearch: boolean;
  readonly maxSources: number;
  readonly outputFormat: OutputFormat;
  readonly timeout?: number;
  readonly cacheEnabled?: boolean;
  readonly apiKey?: string;
}
```

### `DeepResearchConfig`

Configuration for deep research workflows.

```typescript
interface DeepResearchConfig {
  maxSources: number;
  requireCrossValidation: boolean;
  qualityThreshold: number;
  includeSentiment: boolean;
}
```

### `OutputFormat`

Supported output formats for research results.

```typescript
type OutputFormat = 'markdown' | 'json' | 'html' | 'text';
```

## Result Types

### `ResearchResult`

Main result type for basic research operations.

```typescript
interface ResearchResult {
  readonly query: string;
  readonly sources: readonly ResearchSource[];
  readonly summary: string;
  readonly keyFindings: readonly string[];
  readonly confidence: ConfidenceScore;
  readonly timestamp: Date;
  readonly metadata: ResearchMetadata;
}
```

### `ResearchSource`

Individual research source with metadata.

```typescript
interface ResearchSource {
  readonly id: string;
  readonly title: string;
  readonly url: URL;
  readonly content: string;
  readonly relevanceScore: RelevanceScore;
  readonly type: SourceType;
  readonly author?: string;
  readonly publishedAt?: Date;
  readonly lastAccessed: Date;
}
```

### `ResearchReport`

Comprehensive research report from deep research workflows.

```typescript
interface ResearchReport {
  title: string;
  summary: string;
  methodology: string;
  findings: ResearchFinding[];
  sources: ResearchSource[];
  confidence: number;
  limitations: string[];
  recommendations: string[];
  generatedAt: Date;
}
```

## Research Workflows

### Available Workflows

- `'company-research'` - Company analysis and investigation
- `'competitor-analysis'` - Competitive intelligence gathering
- `'market-analysis'` - Market research and analysis
- `'trend-analysis'` - Trend identification and analysis
- `'tool-comparison'` - Software/tool comparison research
- `'technical-analysis'` - Technical research and implementation analysis

### Workflow Selection

Choose the appropriate workflow based on your research needs:

```typescript
// For company investigation
await performDeepResearch('Apple Inc.', 'company-research', config);

// For competitive analysis
await performDeepResearch('vs competitors', 'competitor-analysis', config);

// For market research
await performDeepResearch('market size', 'market-analysis', config);
```

## Type Safety

### Score Types

The plugin provides type-safe score types with validation:

```typescript
// Confidence score (0-1)
type ConfidenceScore = number & { readonly __brand: unique symbol };

// Relevance score (0-1)
type RelevanceScore = number & { readonly __brand: unique symbol };

// Safe score creation
const confidence = createConfidenceScore(0.85); // Throws if invalid
const relevance = createRelevanceScore(0.9);   // Throws if invalid

// Score validation
if (isValidConfidenceScore(score)) {
  // score is guaranteed to be a valid ConfidenceScore
}
```

### Source Types

Supported source types with type safety:

```typescript
type SourceType =
  | 'academic'    // Academic papers and research
  | 'web'         // General web sources
  | 'news'        // News articles and media
  | 'technical'   // Technical documentation
  | 'social'      // Social media and forums
  | 'government'; // Government sources and reports
```

## Error Handling

### Common Errors

The plugin provides comprehensive error handling for various scenarios:

```typescript
try {
  const result = await performResearch('query', config);
  // Process result
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid configuration:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

### Error Types

- `ValidationError`: Invalid configuration or parameters
- `NetworkError`: Network connectivity issues
- `TimeoutError`: Operation exceeded timeout
- `RateLimitError`: Too many requests

## Performance Considerations

### Configuration Impact

Different configuration values impact performance:

```typescript
// High performance (fast, less thorough)
const fastConfig = initialize({
  maxSources: 5,
  timeout: 5000,
  cacheEnabled: true
});

// High quality (slower, more thorough)
const qualityConfig = initialize({
  maxSources: 100,
  timeout: 60000,
  cacheEnabled: true,
  enableDeepResearch: true
});
```

### Memory Usage

Memory usage scales with:
- Number of sources (`maxSources`)
- Content length of sources
- Concurrent operations

### Optimization Tips

1. **Use Caching**: Enable `cacheEnabled` for repeated queries
2. **Limit Sources**: Adjust `maxSources` based on needs
3. **Set Timeouts**: Configure appropriate `timeout` values
4. **Batch Operations**: Process multiple queries efficiently

## Advanced Usage

### Custom Source Validation

```typescript
import { validateResearchSource } from 'research-tools/types';

const source = { /* source object */ };
if (validateResearchSource(source)) {
  // Source is valid, can be used safely
}
```

### Confidence Analysis

```typescript
const result = await performResearch('query', config);

if (result.confidence > 0.8) {
  console.log('High confidence research result');
} else if (result.confidence > 0.6) {
  console.log('Moderate confidence, consider additional sources');
} else {
  console.log('Low confidence, review sources carefully');
}
```

### Source Quality Assessment

```typescript
const qualityScore = result.metadata.qualityScore;
const totalSources = result.metadata.totalSources;

console.log(`Research quality: ${(qualityScore * 100).toFixed(1)}%`);
console.log(`Sources analyzed: ${totalSources}`);
```

## Migration Guide

### From Version 1.0 to 1.1

```typescript
// Old approach (deprecated)
const result = await performResearch('query');

// New approach (recommended)
const config = initialize({ maxSources: 50 });
const result = await performResearch('query', config);
```

### Breaking Changes

- Configuration is now required for `performResearch`
- Some type definitions have been enhanced with stricter typing
- Score types now require explicit validation

## Best Practices

1. **Always Initialize Configuration**: Use `initialize()` to create proper configuration
2. **Validate Scores**: Use provided validation functions for score types
3. **Handle Errors**: Implement proper error handling for network and validation issues
4. **Monitor Performance**: Use metadata to track processing time and quality
5. **Use Appropriate Workflows**: Select the right workflow for your research needs

## Troubleshooting

### Common Issues

**Q: Research results are empty**
A: Check `maxSources` configuration and network connectivity

**Q: Low confidence scores**
A: Increase `maxSources` or verify source quality settings

**Q: Performance is slow**
A: Reduce `maxSources`, enable caching, or check timeout settings

**Q: Type errors in TypeScript**
A: Ensure proper score validation and type usage

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
const config = initialize({
  logLevel: 'debug',
  enableMetrics: true
});
```

---

For additional support, see the [troubleshooting guide](./troubleshooting.md) or open an issue on GitHub.