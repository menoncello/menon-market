# ATDD Implementation Checklist - Story 1.2: Directory Structure Generator

**Story**: 1.2 - Directory Structure Generator
**Primary Test Level**: Unit/Integration Tests
**Date**: 2025-10-27
**Status**: Tests in RED Phase (Implementation Required)

## Story Summary

Generate modular agent directory structures for all 7 agent types with consistent organization, MCP server integration, configuration files, documentation, and development environment setup scripts. Must integrate seamlessly with Claude Code's native subagent architecture and meet performance requirements (< 30 seconds generation time, < 50MB memory usage).

## Acceptance Criteria Coverage

✅ **AC1: Template-based Directory Generation** - 3 tests created
✅ **AC2: MCP Server Integration Structure** - 3 tests created
✅ **AC3: Configuration Files Generation** - 4 tests created
✅ **AC4: README Template Generation** - 4 tests created
✅ **AC5: Development Environment Setup Scripts** - 4 tests created
✅ **AC6: Claude Code Native Integration** - 4 tests created
✅ **Performance Requirements** - 3 tests created
✅ **Quality Gates Compliance** - 3 tests created

## Failing Tests Created

**Total**: 28 tests in `/packages/agent-creator/tests/DirectoryStructureGenerator.test.ts`

- E2E tests: 0 tests (backend service, no UI)
- API tests: 0 tests (pure business logic)
- Unit tests: 25 tests in DirectoryStructureGenerator.test.ts
- Integration tests: 3 tests (file system operations)

## Supporting Infrastructure

### Data Factories Created

- **Location**: `/packages/agent-creator/tests/support/factories/directory-structure.factory.ts`
- **Factories**:
  - `createGenerationOptions()` - Test input data
  - `createDirectoryStructure()` - Expected structure data
  - `createGenerationResult()` - Result data
  - `createConfigurationFiles()` - Configuration file templates
- **Features**: Faker-based random data, overrides support, comprehensive coverage

### Fixtures Created

- **Location**: `/packages/agent-creator/tests/support/fixtures/directory-generator.fixture.ts`
- **Fixtures**:
  - `testDir` - Auto-created/cleaned test directory
  - `createTestDirectory` - Dynamic directory creation with cleanup
  - `cleanupTestDirectory` - Manual cleanup helper
  - `createMockGenerationOptions` - Mock test inputs
  - `createMockGenerationResult` - Mock results
- **Features**: Auto-cleanup, isolation, composable

### Mock Requirements for DEV Team

**File System Mock**:
- Mock `fs/promises` operations for testing
- Mock file structure validation
- Mock path operations

**Template Engine Mock**:
- Mock Handlebars or similar templating engine
- Mock template compilation and rendering
- Mock template validation

**Performance Monitor Mock**:
- Mock memory usage tracking
- Mock execution time measurement
- Mock performance threshold validation

## Required data-testid Attributes

**Not applicable** - This is a backend service with no UI interactions.

## Implementation Checklist

### Task 1: Template Engine Implementation (AC: 1, 2)

- [ ] **Create DirectoryStructureGenerator class**
  - File: `/packages/agent-creator/src/DirectoryStructureGenerator.ts`
  - Constructor: Initialize template engine and configuration
  - Dependencies: Template engine (Handlebars), file system utils

- [ ] **Implement generateDirectoryStructure() method**
  - Input: `GenerationOptions` with agent type, output path, customizations
  - Output: `GenerationResult` with structure, performance metrics
  - Logic: Load template → Process customizations → Generate directory structure
  - Error handling: Validation, template errors, file system errors

- [ ] **Create directory structure templates**
  - Location: `/packages/agent-creator/templates/directories/`
  - Templates for all 7 agent types (FrontendDev, BackendDev, QA, Architect, CLIDev, UXExpert, SM)
  - Standard subdirectories: `src/`, `tests/`, `config/`, `docs/`
  - Naming convention: kebab-case

- [ ] **Implement MCP server template generation**
  - Location: `/packages/agent-creator/templates/mcp/`
  - MCP server schema compliance for Claude Code
  - Tool definition templates
  - Configuration file templates
  - Integration point templates

- [ ] **Create template validation system**
  - Validate template syntax
  - Validate required template variables
  - Validate agent type compatibility
  - Error reporting with actionable messages

### Task 2: Configuration Generation System (AC: 3)

- [ ] **Implement generateConfigurationFiles() method**
  - Input: Agent type, customizations
  - Output: Record<filename, content> with all config files
  - Files: package.json, tsconfig.json, .eslintrc.json, Bun configs

- [ ] **Create package.json generation**
  - Agent-specific dependencies (React for FrontendDev, etc.)
  - Bun-specific configurations
  - Scripts: dev, build, test, start, validate
  - Engines and package manager settings

- [ ] **Create TypeScript configuration generator**
  - Strict mode configuration
  - Path mapping for agent structure
  - Build configuration
  - Declaration and source map settings

- [ ] **Create ESLint configuration generator**
  - Project-specific linting rules
  - TypeScript ESLint integration
  - Agent-specific rule overrides
  - No eslint-disable violations

- [ ] **Implement Bun-specific configurations**
  - bun.lockb compatibility
  - Bun runtime optimizations
  - Performance configurations
  - Build tool integration

### Task 3: Documentation and Setup Automation (AC: 4, 5)

- [ ] **Create README template generator**
  - Location: `/packages/agent-creator/templates/readme/`
  - Agent-specific content and role descriptions
  - Setup instructions and usage examples
  - Integration guidelines with Claude Code

- [ ] **Implement setup script generation**
  - Create `setup.sh` template
  - Automated environment preparation
  - Dependency installation
  - Initial configuration setup

- [ ] **Create development server scripts**
  - Package.json scripts for dev workflow
  - Development server startup
  - Build and watch modes
  - Hot reload configuration

- [ ] **Implement test execution scripts**
  - Bun Test integration
  - Test scripts: test, test:watch, test:coverage
  - Validation scripts for structure compliance
  - CI/CD integration scripts

### Task 4: Claude Code Integration Layer (AC: 6)

- [ ] **Create Claude Code subagent configuration**
  - File: `claude-code.json` template
  - Subagent type and capabilities
  - Skills and specializations mapping
  - Task tool delegation setup

- [ ] **Implement episodic-memory integration**
  - File: `episodic-memory.json` template
  - Memory retention settings
  - Indexing configuration
  - Context management

- [ ] **Create Task tool delegation configuration**
  - File: `task-delegation.json` template
  - Enabled tasks list
  - Delegation rules and boundaries
  - Integration with Claude Code Task tool

- [ ] **Implement slash command compatibility**
  - File: `slash-commands.json` template
  - Command definitions and descriptions
  - Command handlers and routing
  - Help system integration

### Task 5: Quality Assurance and Testing (All ACs)

- [ ] **Implement validateStructure() method**
  - Validate generated directory structure
  - Check required directories and files
  - Validate naming conventions
  - Performance compliance checks

- [ ] **Create performance monitoring**
  - Memory usage tracking (< 50MB requirement)
  - Execution time measurement (< 30 seconds)
  - Template rendering time (< 5 seconds)
  - Performance threshold validation

- [ ] **Implement error handling and validation**
  - Input validation for GenerationOptions
  - Template existence validation
  - File system error handling
  - Graceful failure with actionable errors

- [ ] **Create unit tests for all components**
  - Template engine tests
  - Configuration generator tests
  - Validation service tests
  - Performance monitoring tests

- [ ] **Implement integration tests**
  - File system operation tests
  - MCP server template integration
  - End-to-end generation tests
  - Performance benchmark tests

### Task 6: Performance Optimization

- [ ] **Optimize template rendering**
  - Template caching strategy
  - Parallel template processing
  - Memory-efficient rendering
  - Sub-5-second rendering target

- [ ] **Optimize file operations**
  - Batch file operations
  - Efficient directory creation
  - Memory usage optimization
  - Sub-30-second generation target

- [ ] **Implement performance monitoring**
  - Real-time memory tracking
  - Execution time profiling
  - Bottleneck identification
  - Performance regression detection

## Red-Green-Refactor Workflow

### RED Phase (Complete)

✅ All 28 tests written and failing
✅ Fixtures and factories created
✅ Mock requirements documented
✅ Implementation checklist created

### GREEN Phase (DEV Team)

1. Pick one failing test at a time
2. Implement minimal code to make it pass
3. Run `bun test packages/agent-creator/tests/DirectoryStructureGenerator.test.ts`
4. Verify test passes
5. Move to next test
6. Repeat until all tests pass

### REFACTOR Phase (DEV Team)

1. All tests passing (green)
2. Extract common patterns into utilities
3. Optimize performance for memory and speed
4. Improve error handling and validation
5. Ensure tests still pass after refactoring

## Running Tests

```bash
# Run all failing tests
cd /Users/menoncello/repos/ai/menon-market
bun test packages/agent-creator/tests/DirectoryStructureGenerator.test.ts

# Run tests with coverage
bun test packages/agent-creator/tests/DirectoryStructureGenerator.test.ts --coverage

# Run tests in watch mode during development
bun test packages/agent-creator/tests/DirectoryStructureGenerator.test.ts --watch

# Run specific test group
bun test packages/agent-creator/tests/DirectoryStructureGenerator.test.ts -t "AC1"
```

## Test Quality Validation

### Red Phase Verification

All tests must fail initially for the RIGHT reasons:

- ✅ Tests fail due to missing implementation (DirectoryStructureGenerator class doesn't exist)
- ✅ Tests fail due to missing methods (generateDirectoryStructure, validateStructure, generateConfigurationFiles)
- ✅ Tests fail due to missing template files
- ✅ Tests fail due to missing configuration generation logic
- ✅ Tests fail due to missing performance monitoring
- ❌ Tests should NOT fail due to test errors or invalid assertions

### Implementation Quality Gates

- [ ] No eslint-disable comments in any generated code
- [ ] TypeScript strict mode compliance
- [ ] All generated files pass ESLint validation
- [ ] Performance requirements met (< 30 seconds, < 50MB memory)
- [ ] Template rendering under 5 seconds per agent type
- [ ] All 7 agent types supported with consistent structure

## Next Steps for DEV Team

1. **Run failing tests**: `bun test packages/agent-creator/tests/DirectoryStructureGenerator.test.ts`
2. **Review implementation checklist**: Tasks organized by acceptance criteria
3. **Implement one test at a time**: Follow RED → GREEN → REFACTOR cycle
4. **Focus on Task 1**: Template Engine Implementation first (foundation for all other tasks)
5. **Verify performance**: Ensure < 30 second generation and < 50MB memory usage
6. **Share progress**: Update completion status in daily standup

## Required Dependencies

Already installed:
- `@faker-js/faker` for test data generation

To install during implementation:
- `handlebars` or similar templating engine
- Additional TypeScript types if needed
- Performance monitoring libraries

## Files to Create/Modify

### New Files
- `/packages/agent-creator/src/DirectoryStructureGenerator.ts` (main implementation)
- `/packages/agent-creator/src/TemplateEngine.ts` (template processing)
- `/packages/agent-creator/src/ConfigurationGenerator.ts` (config file generation)
- `/packages/agent-creator/src/PerformanceMonitor.ts` (performance tracking)
- `/packages/agent-creator/templates/directories/*` (directory templates)
- `/packages/agent-creator/templates/config/*` (configuration templates)
- `/packages/agent-creator/templates/readme/*` (README templates)

### Modify Files
- `/packages/agent-creator/src/index.ts` (export new classes)
- `/packages/agent-creator/package.json` (add dependencies if needed)

---

**ATDD Workflow Complete** - Tests in RED Phase, Implementation Checklist Ready

*Generated with Claude Code SuperPlugin - TEA Agent*
*Knowledge Base References Applied: Fixture architecture, Data factories, Test quality principles, Selector hierarchy, Network-first patterns, Component TDD strategies*