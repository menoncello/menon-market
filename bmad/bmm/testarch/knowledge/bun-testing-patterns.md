# Bun Testing Patterns

## Test Runner
This project uses Bun Test as the test runner.

## Commands
- `bun test` - Run all tests
- `bun test <file>` - Run specific test file
- `bun test --watch` - Watch mode for development
- `bun test --coverage` - Coverage reporting

## Test Structure
```typescript
import { test, expect } from "bun:test";

test("should do something", () => {
  // Test implementation
  expect(result).toBe(expected);
});
```

## Quality Standards
- All tests must pass 100%
- Tests must compile with TypeScript strict mode (0 errors)
- Tests must pass ESLint validation (0 errors)
- No eslint-disable comments in test code
- Use proper TypeScript types (no 'any' unless necessary)