# Mutation Testing Strategy

## Purpose
Mutation testing validates test quality by introducing small code changes (mutants) and verifying tests catch them. This ensures tests are effective and not just providing coverage.

## Tool Configuration
This project uses mutation testing with ≥ 85% score threshold as specified in Tech Spec Epic 1.

### Recommended Tools
- **Stryker**: JavaScript/TypeScript mutation testing framework
- **Vitest Plugin**: @vitest/plugin-mutation for integrated testing

### Configuration Example
```json
// stryker.config.json
{
  "coverageAnalysis": "off",
  "testRunner": "vitest",
  "reporters": ["html", "clear-text", "progress"],
  "thresholds": {
    "high": 85,
    "low": 70,
    "break": 60
  },
  "mutate": [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts"
  ]
}
```

## Implementation Process

### 1. Setup Mutation Testing
```bash
# Install Stryker
bun add -D stryker @stryker-mutator/vitest-runner

# Initialize configuration
bun stryker init
```

### 2. Run Mutation Tests
```bash
# Run full mutation testing
bun stryker run

# Generate coverage report
bun stryker run --reporters html
```

### 3. Integration with Quality Gates
- Include in Step 4.5 of dev-story workflow
- Verify in Step 5.5 of review-story workflow
- Document mutation scores in completion notes

## Best Practices

### Focus Areas
- **Business Logic**: Target core functionality and edge cases
- **Error Handling**: Test error paths and exception scenarios
- **Data Validation**: Validate input sanitization and type checking
- **Complex Conditions**: Test nested if statements and boolean logic

### Ignore Categories
- **Formatting**: Code style and formatting changes
- **Comments**: Comment modifications and documentation
- **Imports**: Import statement variations
- **Trivial Changes**: Dead code removal and unused variables

### Quality Targets
- **High**: ≥ 85% mutation score (project requirement)
- **Low**: ≥ 70% mutation score (minimum acceptable)
- **Break**: < 60% mutation score (failed tests)

## Analyzing Results

### Surviving Mutants
1. **Review surviving mutants** - identify test gaps
2. **Add targeted tests** to kill specific mutants
3. **Improve assertions** to catch edge cases
4. **Refactor code** to reduce unnecessary complexity

### Common Patterns
- **Boundary Values**: Test edge cases (0, -1, max values)
- **Null/Undefined**: Test with falsy inputs
- **Error Paths**: Test exception scenarios
- **Type Coercion**: Test JavaScript type conversion edge cases

## Integration with Development Workflow

### Pre-commit
- Run quick mutation tests on focused areas
- Focus on high-impact business logic

### Pre-merge
- Full mutation testing suite
- Review and address surviving mutants
- Document mutation score in PR description

### Continuous Integration
- Automated mutation testing on pull requests
- Block merges below threshold
- Track mutation score trends over time

## Troubleshooting

### Common Issues
- **High mutation runtime**: Limit scope or use incremental testing
- **Flaky mutants**: Check for external dependencies or timing issues
- **False positives**: Review mutation configuration for appropriate patterns

### Performance Tips
- Use coverage analysis to focus on tested code
- Limit mutation scope to critical paths
- Parallelize mutation testing execution

## References
- [Stryker Documentation](https://stryker-mutator.io/)
- [Vitest Mutation Testing](https://vitest.dev/guide/mutation-testing)
- [Mutation Testing Best Practices](https://stryker-mutator.io/docs/guides/mutation-testing-best-practices)