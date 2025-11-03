# Bun Template Engine

Bun-first template engine for Claude Code plugin development with Handlebars.js.

## Features

- 🚀 **Bun-native**: Built specifically for Bun runtime
- 📝 **Handlebars Templates**: Powerful templating with custom helpers
- 🔧 **TypeScript Support**: Full type safety and validation
- 🛠️ **CLI Tools**: Command-line interface for template generation
- ✅ **Configuration Validation**: Zod-based configuration validation

## Quick Start

### Installation

```bash
bun install
```

### Generate a Template

```bash
# Generate deployment script
bun run cli/generate.ts generate marketplace-deploy \
  --name "my-plugin" \
  --author "Your Name" \
  --version "1.0.0" \
  --description "My awesome plugin"

# Generate validation script
bun run cli/generate.ts generate marketplace-validate \
  --name "my-plugin" \
  --author "Your Name" \
  --version "1.0.0"

# List available templates
bun run cli/generate.ts list
```

### Programmatic Usage

```typescript
import { TemplateManager } from "./manager";
import { validateConfig } from "./config/template-config";

// Initialize template manager
const manager = new TemplateManager();
await manager.initialize();

// Validate configuration
const config = validateConfig({
  PLUGIN_NAME: "my-plugin",
  AUTHOR: "Your Name",
  VERSION: "1.0.0",
});

if (config.success) {
  // Generate template
  const result = await manager.generate("marketplace-deploy", config.data);
  console.log(result);
}
```

## Custom Helpers

### `{{bun-import "sqlite"}}`

Converts package names to Bun import format.

- Input: `"sqlite"` → Output: `"bun:sqlite"`
- Input: `"bun:serve"` → Output: `"bun:serve"`

### `{{bun-class "my-plugin"}}`

Converts kebab-case to PascalCase for class names.

- Input: `"my-plugin"` → Output: `"MyPlugin"`

### `{{bun-filename "MyClass"}}`

Converts PascalCase to kebab-case for filenames.

- Input: `"MyClass"` → Output: `"my-class"`

### `{{#ifBunFeature "sqlite"}}...{{/ifBunFeature}}`

Conditional blocks for Bun-specific features.

- Supported features: `"sqlite"`, `"serve"`, `"file"`, `"test"`

## Configuration

All templates accept these configuration variables:

### Required

- `PLUGIN_NAME`: Plugin name (kebab-case)
- `AUTHOR`: Plugin author name
- `VERSION`: Semantic version (x.y.z)

### Optional

- `DATABASE_TYPE`: `"sqlite"` | `"postgres"` | `"mysql"` (default: `"sqlite"`)
- `LOG_LEVEL`: `"debug"` | `"info"` | `"warn"` | `"error"` (default: `"info"`)
- `STRICT_MODE`: boolean (default: `true`)
- `AUTO_FIX`: boolean (default: `false`)

## Testing

```bash
bun test
```

## Development

```bash
# Watch mode for development
bun run dev

# Build for production
bun run build
```