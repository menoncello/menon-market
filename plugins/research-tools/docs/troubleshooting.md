# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Research Tools Plugin.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Configuration Problems](#configuration-problems)
- [Performance Issues](#performance-issues)
- [Research Quality Issues](#research-quality-issues)
- [Error Messages](#error-messages)
- [Debug Mode](#debug-mode)
- [FAQ](#faq)

## Installation Issues

### Plugin Not Found

**Problem**: Claude Code cannot find the research-tools plugin.

**Solutions**:

1. Verify installation path:

   ```bash
   ls -la ~/.claude/plugins/research-tools
   ```

2. Check plugin structure:

   ```bash
   # Should contain: index.ts, package.json, tsconfig.json
   ls ~/.claude/plugins/research-tools/
   ```

3. Reinstall the plugin:

   ```bash
   # Remove existing installation
   rm -rf ~/.claude/plugins/research-tools

   # Reinstall
   cp -r /path/to/menon-marketplace/plugins/research-tools ~/.claude/plugins/
   ```

### TypeScript Compilation Errors

**Problem**: TypeScript errors during plugin build.

**Solutions**:

1. Check TypeScript version:

   ```bash
   bun --version
   tsc --version
   ```

2. Update dependencies:

   ```bash
   bun install
   bun update
   ```

3. Verify tsconfig.json:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "target": "ES2022",
       "module": "ESNext"
     }
   }
   ```

### Missing Dependencies

**Problem**: Import errors or missing modules.

**Solutions**:

1. Install dependencies:

   ```bash
   cd plugins/research-tools
   bun install
   ```

2. Check package.json dependencies:
   ```json
   {
     "devDependencies": {
       "@types/node": "latest",
       "bun-types": "latest"
     }
   }
   ```

## Configuration Problems

### Invalid Configuration

**Problem**: Configuration validation errors.

**Solutions**:

1. Use proper initialization:

   ```typescript
   import { initialize } from 'research-tools';

   // Correct
   const config = initialize({
     maxSources: 50,
     outputFormat: 'markdown',
   });

   // Incorrect
   const config = { maxSources: 50 }; // Missing required fields
   ```

2. Validate configuration values:
   ```typescript
   const config = initialize({
     maxSources: 10, // Must be positive number
     outputFormat: 'json', // Must be valid format
     timeout: 30000, // Must be positive number
   });
   ```

### Timeout Issues

**Problem**: Research operations timing out.

**Solutions**:

1. Increase timeout:

   ```typescript
   const config = initialize({
     timeout: 60000, // 60 seconds
   });
   ```

2. Reduce max sources:

   ```typescript
   const config = initialize({
     maxSources: 10,
     timeout: 30000,
   });
   ```

3. Check network connectivity:
   ```bash
   ping google.com
   curl -I https://example.com
   ```

## Performance Issues

### Slow Research Operations

**Problem**: Research taking too long to complete.

**Solutions**:

1. Optimize configuration:

   ```typescript
   const config = initialize({
     maxSources: 10, // Reduce sources
     cacheEnabled: true, // Enable caching
     timeout: 15000, // Reduce timeout
   });
   ```

2. Monitor performance:

   ```typescript
   const result = await performResearch('query', config);
   console.log('Processing time:', result.metadata.processingTime);
   console.log('Quality score:', result.metadata.qualityScore);
   ```

3. Enable debug mode:
   ```typescript
   const config = initialize({
     logLevel: 'debug',
   });
   ```

### High Memory Usage

**Problem**: Plugin using excessive memory.

**Solutions**:

1. Reduce concurrent operations:

   ```typescript
   // Process sequentially instead of parallel
   for (const query of queries) {
     await performResearch(query, config);
   }
   ```

2. Limit source count:

   ```typescript
   const config = initialize({
     maxSources: 5,
   });
   ```

3. Clear cache periodically:
   ```typescript
   const config = initialize({
     cacheEnabled: false, // Disable caching temporarily
   });
   ```

## Research Quality Issues

### Low Confidence Scores

**Problem**: Research results have low confidence scores.

**Solutions**:

1. Increase source diversity:

   ```typescript
   const config = initialize({
     maxSources: 50, // More sources for better confidence
   });
   ```

2. Enable cross-validation:

   ```typescript
   const deepConfig = {
     requireCrossValidation: true,
     qualityThreshold: 0.8,
   };
   ```

3. Check source types:
   ```typescript
   const result = await performResearch('query', config);
   const sourceTypes = result.sources.map(s => s.type);
   console.log('Source types:', sourceTypes);
   ```

### Empty or Poor Results

**Problem**: Research returns empty or low-quality results.

**Solutions**:

1. Verify query quality:

   ```typescript
   // Good queries
   const goodQueries = [
     'artificial intelligence market trends 2024',
     'machine learning algorithms comparison',
     'best practices for cloud security',
   ];

   // Poor queries
   const poorQueries = [
     'a', // Too short
     'asdfghjkl', // Gibberish
     '', // Empty
   ];
   ```

2. Check network connectivity:

   ```bash
   # Test internet connection
   curl -s https://example.com > /dev/null && echo "Connected" || echo "No connection"
   ```

3. Review source quality:
   ```typescript
   const result = await performResearch('query', config);
   result.sources.forEach(source => {
     console.log(`Source: ${source.title}`);
     console.log(`Relevance: ${source.relevanceScore}`);
     console.log(`Type: ${source.type}`);
   });
   ```

## Error Messages

### "Invalid confidence score"

**Cause**: Score value outside 0-1 range.

**Solution**:

```typescript
import { createConfidenceScore, isValidConfidenceScore } from 'research-tools';

// Safe creation
const confidence = createConfidenceScore(0.85); // Throws if invalid

// Validation
const score = 0.85;
if (isValidConfidenceScore(score)) {
  // Use score safely
}
```

### "Research timeout exceeded"

**Cause**: Operation took longer than configured timeout.

**Solution**:

```typescript
const config = initialize({
  timeout: 60000, // Increase timeout to 60 seconds
});
```

### "Network error"

**Cause**: Network connectivity issues.

**Solution**:

1. Check internet connection
2. Verify firewall settings
3. Try again with exponential backoff:
   ```typescript
   const retry = async (fn, retries = 3) => {
     for (let i = 0; i < retries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i === retries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
       }
     }
   };
   ```

### "Type validation failed"

**Cause**: TypeScript type validation errors.

**Solution**:

1. Check type definitions:

   ```typescript
   import type { ResearchSource, SourceType } from 'research-tools';

   const source: ResearchSource = {
     id: '1',
     title: 'Valid Title',
     url: new URL('https://example.com'),
     content: 'Valid content',
     relevanceScore: 0.8,
     type: 'academic' as SourceType,
     lastAccessed: new Date(),
   };
   ```

2. Use type guards:

   ```typescript
   import { validateResearchSource } from 'research-tools/types';

   if (validateResearchSource(obj)) {
     // obj is guaranteed to be ResearchSource
   }
   ```

## Debug Mode

### Enable Debug Logging

```typescript
const config = initialize({
  logLevel: 'debug',
  enableMetrics: true,
  cacheEnabled: false, // Disable caching for debugging
});
```

### Performance Monitoring

```typescript
const startTime = Date.now();
const result = await performResearch('query', config);
const endTime = Date.now();

console.log('Total time:', endTime - startTime);
console.log('Processing time:', result.metadata.processingTime);
console.log('Source count:', result.sources.length);
console.log('Quality score:', result.metadata.qualityScore);
```

### Memory Profiling

```typescript
const beforeMemory = process.memoryUsage();
await performResearch('query', config);
const afterMemory = process.memoryUsage();

console.log('Memory delta:', {
  heapUsed: afterMemory.heapUsed - beforeMemory.heapUsed,
  heapTotal: afterMemory.heapTotal - beforeMemory.heapTotal,
});
```

## FAQ

### Q: How many sources should I use?

**A**: Start with 10-20 sources for general research. Use 50+ for comprehensive analysis, but expect longer processing times.

### Q: What's the difference between basic research and deep research?

**A**: Basic research provides quick analysis with source collection and summary. Deep research offers comprehensive analysis with cross-validation, structured reports, and actionable insights.

### Q: Can I use custom data sources?

**A**: Currently, the plugin uses mock data sources. Custom source integration is planned for future versions.

### Q: How is confidence calculated?

**A**: Confidence is calculated based on:

- Source relevance scores (70% weight)
- Source quality/type (30% weight)
- Source recency and diversity

### Q: Is my data private?

**A**: Yes, all processing happens locally on your machine. No data is sent to external servers unless explicitly configured.

### Q: Can I use this in commercial projects?

**A**: Yes, the plugin is licensed under MIT and can be used in commercial projects.

### Q: How do I report bugs?

**A**: Please report bugs on the [GitHub Issues](https://github.com/menoncello/menon-marketplace/issues) page with:

- Plugin version
- Claude Code version
- Error messages
- Steps to reproduce
- Expected vs actual behavior

### Q: Where can I get help?

**A**:

- [GitHub Discussions](https://github.com/menoncello/menon-marketplace/discussions)
- [API Documentation](./api.md)
- [Examples](./examples.md)

## Contact Support

If you continue to experience issues:

1. **Check the GitHub Issues** - Your problem might already be solved
2. **Search the Discussions** - Community help might be available
3. **Create a New Issue** - Include all relevant information
4. **Contact the Author** - eduardo@menoncello.com

### When Creating Issues

Include the following information:

```markdown
## Environment

- Plugin Version:
- Claude Code Version:
- Operating System:
- Node.js/Bun Version:

## Problem

[Description of the issue]

## Steps to Reproduce

1.
2.
3.

## Expected Behavior

[What should happen]

## Actual Behavior

[What actually happens]

## Error Messages

[Any error messages or stack traces]

## Configuration

[Your configuration object]
```

---

For additional help, see the [API documentation](./api.md) or [examples](./examples.md).
