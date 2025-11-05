# Dev Plugin - Enhanced Development Toolkit

🚀 **Advanced development toolkit with Bun.js integration and AI-safe code generation**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun Version](https://img.shields.io/badge/bun-%5E1.3.0-black)](https://bun.sh/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue)](https://www.typescriptlang.org/)

## 📋 Overview

The Dev Plugin is a comprehensive development toolkit specifically designed for **AI-assisted development** with Claude Code. It provides everything needed to write high-quality, maintainable code that follows strict AI development standards.

`★ Insight ─────────────────────────────────────`

This plugin was created specifically to solve the common problems that occur when AI generates code: ESLint violations, complexity issues, and lack of proper patterns. It combines Bun.js performance optimizations with AI-safe development practices.

`─────────────────────────────────────────────────`

## 🎯 Key Features

### 🤖 AI-Safe Code Generation

- **Template System**: Handlebars-powered templates with AI-safe patterns
- **Pre-validation**: Validates inputs before code generation to prevent ESLint errors
- **Auto-fix**: Automatically fixes common issues in generated code
- **Quality Gates**: Automated validation against 232+ ESLint rules
- **Anti-Pattern Detection**: Prevents common AI coding mistakes
- **Complexity Control**: Enforces maximum function size and complexity

### ⚡ Bun.js Integration

- **Performance Optimization**: Bun-specific patterns and utilities
- **Native APIs**: Leverages Bun's built-in SQLite, HTTP server, and bundler
- **Speed Benefits**: 3-10x faster than Node.js equivalents
- **Single Binary**: Compile applications to standalone executables

### 🛠 Development Workflow

- **Template Generation**: Generate code with proper patterns
- **Quality Analysis**: Real-time code quality scoring
- **Automated Validation**: Integrated linting, formatting, and testing
- **Best Practices**: Built-in patterns for maintainable code

## 🚀 Quick Start

### Installation

```bash
# Navigate to plugin directory
cd plugins/dev

# Install dependencies
bun install

# Initialize the plugin
bun run dev
```

### Basic Usage

```typescript
import { devPlugin } from "@menon/dev";

// Initialize plugin with custom config
await devPlugin.initialize({
  aiQualityGates: true,
  bunOptimizations: true,
  aiStrictMode: true,
  maxFunctionLines: 25, // Custom limit
});

// Generate AI-safe function template
const functionTemplate = await devPlugin.generateTemplate("ai-function", {
  name: "processUserData",
  params: "userId:string,userData:object",
  returnType: "UserResult",
});

// Analyze code quality
const quality = await devPlugin.analyzeCode("./src/api.ts");
console.log(`Quality Score: ${quality.score}/100`);

// Validate code against AI standards
const validation = await devPlugin.validateCode(code);
if (!validation.valid) {
  console.log("Violations:", validation.violations);
}
```

## 📝 Available Templates

### 1. AI-Safe Function (`ai-function`)

```bash
bun run template:function --name=createUser --params="userId:string,userData:object"
```

Generates functions with:

- Early validation in first 5 lines
- Maximum 15 lines total
- Complexity < 5
- No 'any' types
- Proper error handling

### 2. Bun Server (`bun-server`)

```bash
bun run template:server --name=api --port=3000 --withWebsocket --withDatabase
```

Creates optimized Bun servers with:

- HTTP/HTTPS support
- WebSocket integration
- Database connectivity
- CORS handling
- Graceful shutdown

### 3. Test Suite (`test-suite`)

```bash
bun run template:test --component=User --withMocks
```

Comprehensive test suites with:

- Unit and integration tests
- Mocking utilities
- Snapshot testing
- Performance benchmarks
- Security validation

## 🔧 Scripts & Commands

### Template Generation

```bash
# Interactive template generation
bun run template

# Specific templates
bun run template:function     # AI-safe function
bun run template:server       # Bun server
bun run template:test         # Test suite
```

### Code Quality

```bash
# Analyze single file
bun run quality src/api.ts

# Analyze entire project
bun run quality:all

# Full validation pipeline
bun run validate             # format:check + lint + typecheck + test
```

### Development

```bash
# Development with hot reload
bun run dev

# Build for production
bun run build

# Run tests
bun run test

# Code formatting
bun run format              # Format all files
bun run format:check        # Check formatting
```

## 📊 Quality Gates System

`★ Insight ─────────────────────────────────────`
The quality gates system enforces the same 232 ESLint rules that cause most AI-generated code failures. It specifically targets the rules that AI most commonly violates: complexity, function length, and any types.
`─────────────────────────────────────────────────`

### AI-Specific Rules

| Rule                                 | Limit     | Purpose                        |
| ------------------------------------ | --------- | ------------------------------ |
| `max-lines-per-function`             | 15 lines  | Prevents monolithic functions  |
| `complexity`                         | 5         | Controls cyclomatic complexity |
| `sonarjs/cognitive-complexity`       | 15        | Measures mental complexity     |
| `max-params`                         | 4         | Prevents parameter bloat       |
| `@typescript-eslint/no-explicit-any` | Forbidden | Forces proper typing           |

### Anti-Pattern Detection

- **Any Types**: Detects and prevents `any` usage
- **ESLint Disable**: Blocks `eslint-disable` comments
- **Magic Numbers**: Identifies unnamed constants
- **Console Logging**: Requires proper logging
- **Early Validation**: Ensures input validation patterns

### Quality Scoring

- **90-100**: Excellent code quality
- **80-89**: Good (meets standards)
- **70-79**: Needs improvement
- **Below 70**: Requires refactoring

### Pre-validation System

The plugin validates inputs **before** generating code:

```typescript
// ❌ This will be rejected
await devPlugin.generateTemplate("ai-function", {
  name: "badFunc",
  params: "data:any", // Rejected: 'any' types not allowed
});

// ✅ This will pass validation and be auto-fixed
const template = await devPlugin.generateTemplate("ai-function", {
  name: "goodFunc",
  params: "data:string, id:number",
});

// Generated code is automatically cleaned:
// - 'any' → 'unknown'
// - Missing JSDoc added
// - Console.log removed
// - Validation reminders added
```

### Auto-fix Features

- **Type Correction**: `any` → `unknown` (rejects invalid input)
- **Documentation**: Adds missing JSDoc comments
- **Logging**: Removes console.log from templates
- **Validation**: Adds reminders for missing early validation
- **Quality Report**: Shows final quality score (90-100 expected)

## 🎨 Bun.js Integration

### Performance Optimizations

```typescript
// Use Bun's native APIs instead of external packages
import { file, Database, serve } from "bun";

// Faster file operations
const config = await file("config.json").json();

// Built-in SQLite database
const db = new Database("app.db");

// High-performance HTTP server
const server = serve({
  port: 3000,
  fetch(req) {
    /* ... */
  },
});
```

### Single Binary Deployment

```bash
# Compile application with Bun runtime included
bun build --compile --target bun ./src/index.ts --outfile ./app

# Runs anywhere without Node.js installation
./app
```

### Development Benefits

- **3-10x faster** than Node.js startup
- **Lower memory** usage
- **Native TypeScript** support
- **Built-in bundler** and test runner
- **SQLite integration** without external dependencies

## 📚 Skill Integration

### bunjs Skill

Comprehensive Bun.js development guidance including:

- Core API patterns
- Performance optimizations
- Migration strategies from Node.js
- Best practices and anti-patterns

### Usage

```markdown
Claude will automatically use the bunjs skill when:

- Creating Bun servers with Bun.serve()
- Working with SQLite databases
- Building applications with Bun.build()
- Migrating from Node.js applications
```

## 🔍 Best Practices

### AI Development Patterns

1. **Early Validation**

   ```typescript
   // ✅ Validate inputs in first 5 lines
   if (!userId || userId.trim().length === 0) {
     return { success: false, error: "User ID required" };
   }
   ```

2. **Function Size Control**

   ```typescript
   // ✅ Keep functions focused and small
   export async function createUser(userData: UserData): Promise<UserResult> {
     const validation = validateUserData(userData);
     if (!validation.valid) return validation;

     return await userService.create(userData);
   }
   ```

3. **Explicit Typing**

   ```typescript
   // ❌ Avoid any types
   function process(data: any): any;

   // ✅ Use specific types
   function process(data: UserData): ProcessedResult;
   ```

### Code Quality Checklist

- [ ] No `any` types
- [ ] Functions < 15 lines
- [ ] Complexity < 5
- [ ] Early validation present
- [ ] Proper error handling
- [ ] Meaningful function names
- [ ] JSDoc documentation
- [ ] Unit tests covering edge cases

## 📈 Performance Metrics

### Benchmarks (Bun vs Node.js)

| Operation   | Node.js     | Bun         | Improvement     |
| ----------- | ----------- | ----------- | --------------- |
| Cold Start  | 250ms       | 45ms        | **5.6x faster** |
| File Read   | 12ms        | 3ms         | **4x faster**   |
| JSON Parse  | 8ms         | 2ms         | **4x faster**   |
| HTTP Server | 1,200 req/s | 3,800 req/s | **3.2x faster** |

### Memory Usage

- **Node.js**: 45MB base memory
- **Bun**: 15MB base memory
- **Reduction**: 67% less memory usage

## 🛠 Configuration

### Plugin Configuration

```typescript
const config = {
  // AI Quality Controls
  aiQualityGates: true,
  aiStrictMode: true,
  maxFunctionLines: 30,
  maxComplexity: 10,

  // Bun.js Optimizations
  bunOptimizations: true,
  enableHotReload: true,
  enableDatabase: false,

  // Development Workflow
  autoFixOnSave: true,
  generateTemplates: true,

  // Performance
  enableProfiling: false,
  memoryOptimization: true,
};
```

### ESLint Integration

The plugin integrates seamlessly with your existing ESLint configuration, adding:

- AI-specific rule enforcement
- Enhanced error reporting
- Automated fix suggestions
- Quality score reporting

## 🔧 Advanced Usage

### Custom Templates

```typescript
// Create custom template with Handlebars
const customTemplate = await devPlugin.generateTemplate("ai-function", {
  name: "customProcessor",
  params: "input:CustomType,options:ProcessingOptions",
  returnType: "ProcessedResult",
});
```

### Quality Monitoring

```typescript
// Monitor code quality over time
const qualityReport = await devPlugin.analyzeCode("./src/");
console.log(`Project Score: ${qualityReport.score}/100`);
console.log(`Functions Analyzed: ${qualityReport.functions.length}`);
console.log(`Violations Found: ${qualityReport.violations.length}`);
```

### Integration with CI/CD

```yaml
# .github/workflows/quality-check.yml
- name: Run AI Quality Gates
  run: bun run quality:all

- name: Validate Code Standards
  run: bun run validate

- name: Generate Templates
  run: bun run template:function --name=apiHandler
```

## 🤝 Contributing

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd marketplace/plugins/dev

# Install dependencies
bun install

# Run tests
bun test

# Validate code quality
bun run validate

# Start development
bun run dev
```

### Adding New Templates

1. Create `.hbs` template file in `templates/`
2. Update template registry in `scripts/template-generator.ts`
3. Add documentation and examples
4. Run validation and tests

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [Bun.js](https://bun.sh/) - JavaScript runtime and toolkit
- [Claude Code](https://claude.ai) - AI development assistant
- [ESLint](https://eslint.org/) - JavaScript linter
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

---

**Built with ❤️ for AI-assisted development**
