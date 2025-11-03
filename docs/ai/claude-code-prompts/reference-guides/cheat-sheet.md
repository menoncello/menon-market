# Claude Code Prompts - Quick Reference Cheat Sheet

## Prompt Types Overview

| Type | Use Case | Character Limit | Best Model | Execution Time |
|------|----------|----------------|------------|----------------|
| **Slash Commands** | Quick automation | 15,000 | Haiku | < 5 seconds |
| **Skills** | Complex workflows | 50,000+ | Sonnet/Opus | 30-300 seconds |
| **CLAUDE.md** | Project standards | Persistent | N/A | Cached |
| **Agent Orchestration** | Multi-agent tasks | Variable | Mixed | 5-30 minutes |

## Quick Templates

### Slash Command Templates

#### Basic Command
```typescript
const command = {
  name: 'command-name',
  description: 'Brief description',
  template: `
    Clear, specific instruction.

    Steps:
    1. First action
    2. Second action
    3. Third action

    {{#if conditional}}
    Handle conditional case
    {{/if}}
  `,
  parameters: [
    {
      name: 'param',
      type: 'string',
      required: false,
      defaultValue: 'default'
    }
  ]
};
```

#### File Operations
```typescript
const fileOps = {
  template: `
    Perform {{operation}} on {{filePath}}:

    1. Read current content
    2. {{operationDescription}}
    3. Validate changes
    4. Save file

    Consider:
    - Backup original file
    - Validate syntax
    - Update imports if needed
  `
};
```

### Skill Templates

#### Code Generation
```typescript
const codeGenSkill = {
  workflow: {
    steps: [
      {
        name: 'analyze-requirements',
        template: 'Analyze: {{requirements}}'
      },
      {
        name: 'design-solution',
        template: 'Design architecture for {{feature}}'
      },
      {
        name: 'implement-code',
        template: 'Implement {{feature}} with {{techStack}}'
      },
      {
        name: 'create-tests',
        template: 'Create tests for {{feature}}'
      }
    ]
  }
};
```

#### Review Process
```typescript
const reviewSkill = {
  template: `
    Review {{target}} for {{reviewType}}:

    ## {{reviewType}} Analysis
    - Check {{criteria1}}
    - Validate {{criteria2}}
    - Assess {{criteria3}}

    ## Recommendations
    1. {{recommendation1}}
    2. {{recommendation2}}

    ## Priority
    {{priority}} - {{reasoning}}
  `
};
```

## Best Practices Checklist

### ✅ Do This
- [ ] **Be Specific**: Use clear, unambiguous instructions
- [ ] **Provide Context**: Include relevant background information
- [ ] **Structure Information**: Use headings and bullet points
- [ ] **Define Success**: Specify completion criteria
- [ ] **Handle Errors**: Include error handling strategies
- [ ] **Test Thoroughly**: Validate edge cases and inputs
- [ ] **Document Intent**: Explain why, not just what

### ❌ Don't Do This
- [ ] **Be Vague**: Avoid "make it better" instructions
- [ ] **Assume Knowledge**: Don't omit critical context
- [ ] **Overload**: Don't try to do everything at once
- [ ] **Ignore Errors**: Don't skip error handling
- [ ] **Skip Testing**: Don't forget comprehensive testing
- [ ] **Disable Rules**: Never use eslint-disable comments
- [ ] **Rush**: Take time for proper planning

## Common Patterns

### 1. Progressive Disclosure
```
Phase 1: Analysis and Planning
Phase 2: Core Implementation
Phase 3: Enhancement and Polish
```

### 2. Error Handling
```
try {
  // Main operation
} catch (error) {
  // Specific error handling
  // Fallback strategy
  // User feedback
}
```

### 3. Validation Pipeline
```
1. Input validation
2. Permission checking
3. Resource availability
4. Business rule validation
5. Output formatting
```

### 4. Testing Strategy
```
- Unit tests for individual functions
- Integration tests for component interactions
- E2E tests for user workflows
- Performance tests for critical paths
```

## Quick Commands

### Git Operations
```bash
# Smart commit
/commit "feat: add user authentication"

# PR review
/review-pr 123 --aspects=code-quality,security

# Branch cleanup
/clean-branches --gone
```

### Code Generation
```bash
# Component generation
/generate-component UserCard --props="user,onClick"

# API endpoint
/generate-api POST /users --auth=true

# Test suite
/generate-tests userService --coverage=90
```

### Documentation
```bash
# API docs
/generate-api-docs ./routes

# README update
/update-readme --features=new

# Changelog
/generate-changelog --since=v1.2.0
```

## Model Selection Guide

| Task Complexity | Recommended Model | Cost Efficiency | When to Use |
|-----------------|-------------------|-----------------|-------------|
| **Simple** | Haiku | ★★★★★ | Quick commands, basic tasks |
| **Moderate** | Sonnet | ★★★★☆ | Feature development, code review |
| **Complex** | Opus | ★★★☆☆ | Architecture design, complex refactoring |
| **Expert** | Opus + Specialists | ★★☆☆☆ | Multi-agent orchestration, research |

## Context Management

### Efficient Context Usage
```typescript
// ✅ Good: Specific, relevant context
const context = {
  project: 'e-commerce-platform',
  techStack: ['Next.js', 'TypeScript', 'Prisma'],
  currentTask: 'user-authentication',
  constraints: ['PCI-compliance', 'mobile-responsive']
};

// ❌ Bad: Excessive, irrelevant context
const context = {
  entireProjectHistory: '...1000 lines...',
  allDependencies: '...500 lines...',
  irrelevantDetails: '...300 lines...'
};
```

### Context Compression Techniques
1. **Prioritize Recent Information**
2. **Summarize Historical Context**
3. **Filter by Relevance to Current Task**
4. **Use Links for Extended Information**

## Error Handling Patterns

### Input Validation
```typescript
const validateInput = (input: any): ValidationResult => {
  if (!input) {
    return { valid: false, error: 'Input is required' };
  }

  if (typeof input !== 'string') {
    return { valid: false, error: 'Input must be a string' };
  }

  if (input.length > 1000) {
    return { valid: false, error: 'Input too long (max 1000 chars)' };
  }

  return { valid: true };
};
```

### Graceful Degradation
```typescript
const robustOperation = async (input: any) => {
  try {
    const result = await primaryOperation(input);
    return result;
  } catch (primaryError) {
    try {
      const fallbackResult = await fallbackOperation(input);
      return fallbackResult;
    } catch (fallbackError) {
      return { error: 'All operations failed', details: { primaryError, fallbackError } };
    }
  }
};
```

## Performance Optimization

### Response Time Optimization
```typescript
// ✅ Optimize for fast responses
const quickResponse = {
  model: 'haiku',
  context: 'minimal',
  template: 'focused-and-concise',
  cache: 'enabled'
};

// ✅ Optimize for quality
const qualityResponse = {
  model: 'opus',
  context: 'comprehensive',
  template: 'detailed-and-thorough',
  validation: 'strict'
};
```

### Cost Optimization Strategies
1. **Use Haiku for Simple Tasks**: Save 80% on costs
2. **Cache Repeated Operations**: Avoid redundant API calls
3. **Batch Similar Requests**: Reduce API overhead
4. **Optimize Context Size**: Reduce token usage by 60-80%

## Security Considerations

### Input Sanitization
```typescript
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .substring(0, 1000);   // Limit length
};
```

### Permission Checking
```typescript
const checkPermissions = (user: User, resource: string, action: string): boolean => {
  return user.permissions.some(permission =>
    permission.resource === resource &&
    permission.actions.includes(action)
  );
};
```

## Testing Quick Reference

### Unit Test Template
```typescript
describe('Component/Function Name', () => {
  it('should handle happy path', () => {
    // Arrange
    const input = validInput;

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toEqual(expectedOutput);
  });

  it('should handle error cases', () => {
    // Test edge cases and error conditions
  });

  it('should validate inputs', () => {
    // Test input validation
  });
});
```

### Integration Test Template
```typescript
describe('API Integration', () => {
  it('should successfully call endpoint', async () => {
    const response = await api.request({
      method: 'POST',
      endpoint: '/api/resource',
      data: validData
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchSchema(expectedSchema);
  });
});
```

## Troubleshooting Quick Guide

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **Vague Responses** | Unclear instructions | Be more specific with requirements |
| **Context Overflow** | Too much background info | Summarize and prioritize context |
| **Slow Responses** | Complex task + wrong model | Use Sonnet/Opus for complex tasks |
| **Security Errors** | Insufficient permissions | Check tool permissions and scopes |
| **Format Issues** | Missing output specifications | Define expected format clearly |
| **Logic Errors** | Ambiguous requirements | Provide examples and edge cases |

### Debugging Steps
1. **Check Prompt Clarity**: Is instruction specific enough?
2. **Verify Context**: Is relevant information provided?
3. **Validate Permissions**: Are required tools available?
4. **Test Components**: Break down complex tasks
5. **Review Output**: Does result match expectations?
6. **Iterate**: Refine based on results

## Resource Optimization

### Memory Management
```typescript
// ✅ Efficient memory usage
const processData = (data: any[]) => {
  // Process in chunks to avoid memory overflow
  const chunkSize = 1000;
  const results = [];

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const processedChunk = processChunk(chunk);
    results.push(...processedChunk);
  }

  return results;
};
```

### Network Optimization
```typescript
// ✅ Batch API requests
const batchRequests = async (items: any[]) => {
  const batchSize = 10;
  const batches = [];

  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  const results = await Promise.all(
    batches.map(batch => api.batchRequest(batch))
  );

  return results.flat();
};
```

## Quick Reference Commands

### File Operations
```bash
# Read file
/read ./src/components/Button.tsx

# Edit file with specific changes
/edit ./src/utils/helpers.ts --find="oldFunction" --replace="newFunction"

# Create new file
/create ./src/types/user.ts --content="interface User { id: string; name: string; }"
```

### Code Analysis
```bash
# Analyze codebase
/analyze ./src --focus="security,performance"

# Find patterns
/search "TODO|FIXME|HACK" --type="comment"

# Check dependencies
/dependencies --outdated --vulnerable
```

### Testing Commands
```bash
# Run tests
/test --coverage --watch

# Test specific file
/test ./src/components/__tests__/Button.test.tsx

# Generate test coverage report
/test --coverage --report=html
```

## Performance Benchmarks

### Expected Performance
| Operation | Target Time | Acceptable Range |
|-----------|-------------|------------------|
| **Simple Command** | < 2s | 1-5s |
| **Code Generation** | < 30s | 15-60s |
| **Complex Analysis** | < 2m | 1-5m |
| **Multi-agent Task** | < 10m | 5-20m |

### Optimization Indicators
- ✅ **Green**: Within target range
- ⚠️ **Yellow**: 1.5x target time
- ❌ **Red**: 2x+ target time

## Model Comparison

| Feature | Haiku | Sonnet | Opus |
|---------|-------|--------|------|
| **Speed** | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡ | ⚡⚡⚡ |
| **Quality** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Cost** | 💰 | 💰💰 | 💰💰💰💰 |
| **Context** | 8K | 100K | 200K |
| **Best For** | Quick tasks | General development | Complex problems |

## Keyboard Shortcuts

### Common Shortcuts
- `Ctrl/Cmd + K`: Quick command palette
- `Ctrl/Cmd + /`: Toggle command help
- `Ctrl/Cmd + Enter`: Execute current prompt
- `Ctrl/Cmd + S`: Save current context
- `Ctrl/Cmd + L`: Clear conversation
- `Tab`: Autocomplete suggestions
- `Esc`: Cancel current operation

### Navigation
- `↑/↓`: Browse command history
- `Ctrl/Cmd + P`: Command palette
- `Ctrl/Cmd + Shift + P`: Advanced commands
- `F1`: Help and documentation

## Environment Variables

### Common Configuration
```bash
# Model preferences
CLAUDE_DEFAULT_MODEL=sonnet
CLAUDE_MAX_TOKENS=4000
CLAUDE_TEMPERATURE=0.7

# Development settings
CLAUDE_DEBUG=true
CLAUDE_LOG_LEVEL=info
CLAUDE_CACHE_ENABLED=true

# Security settings
CLAUDE_API_KEY=your_api_key_here
CLAUDE_TIMEOUT=30000
CLAUDE_RATE_LIMIT=100
```

## Quick Validation Checklist

### Before Execution
- [ ] **Clear Objectives**: What should be accomplished?
- [ ] **Sufficient Context**: All necessary information provided?
- [ ] **Appropriate Model**: Right model for task complexity?
- [ ] **Error Handling**: What if something goes wrong?
- [ ] **Success Criteria**: How do we know it's done right?

### After Execution
- [ ] **Quality Check**: Does result meet expectations?
- [ ] **Performance Review**: Was it efficient?
- [ ] **Error Analysis**: Any issues encountered?
- [ ] **Documentation**: Is it properly documented?
- [ ] **Testing**: Has it been validated?

---

**Save this cheat sheet for quick reference during development sessions.**

*Last updated: November 2025*