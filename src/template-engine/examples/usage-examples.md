# Usage Examples

## Basic Template Generation

### Generate Deployment Script

```bash
bun run cli/generate.ts generate marketplace-deploy \
  --name "research-tools" \
  --author "Eduardo Menoncello" \
  --version "1.0.0" \
  --description "Research automation plugin"
```

This creates a file `scripts/deploy.ts` with:

```typescript
#!/usr/bin/env bun
import Database from "bun:sqlite";
import { ResearchTools } from "./research-tools";

export class ResearchTools {
  // ... implementation
}
```

### Generate Validation Script

```bash
bun run cli/generate.ts generate marketplace-validate \
  --name "research-tools" \
  --author "Eduardo Menoncello" \
  --version "1.0.0"
```

## Programmatic Usage

### Advanced Template Generation

```typescript
import { TemplateManager } from "./manager";
import { mergeWithDefaults } from "./config/template-config";

async function generateCustomTemplate() {
  const manager = new TemplateManager();
  await manager.initialize();

  const config = mergeWithDefaults({
    PLUGIN_NAME: "custom-plugin",
    AUTHOR: "Your Name",
    VERSION: "2.1.0",
    DATABASE_TYPE: "postgres",
    STRICT_MODE: false,
  });

  const result = await manager.generate("marketplace-deploy", {
    ...config,
    currentDate: new Date().toISOString(),
    className: "CustomPlugin",
    description: "Custom plugin with PostgreSQL",
  });

  // Write to custom location
  await Bun.write("./custom-deploy.ts", result);
}
```

### Custom Template Creation

```typescript
// Create custom template
const customTemplate = `
#!/usr/bin/env bun
/**
 * {{description}}
 * Generated: {{currentDate}}
 */

export class {{bun-class className}} {
  constructor() {
    console.log('{{PLUGIN_NAME}} v{{VERSION}} initialized');
  }
}
`;

// Compile and use
const template = Handlebars.compile(customTemplate);
const result = template({
  PLUGIN_NAME: "my-plugin",
  VERSION: "1.0.0",
  className: "MyPlugin",
  description: "Custom plugin",
  currentDate: new Date().toISOString(),
});
```

## Migration from Node.js

### Converting Existing Scripts

1. **Replace require statements:**

   ```javascript
   // Old Node.js
   const fs = require("fs");
   const path = require("path");

   // New Bun
   import { readFile, writeFile } from "node:fs";
   import { join } from "node:path";
   ```

2. **Update shebang:**

   ```bash
   # Old
   #!/usr/bin/env node

   # New
   #!/usr/bin/env bun
   ```

3. **Use Bun APIs:**
   ```typescript
   // Instead of external packages
   import Database from "bun:sqlite";
   import { serve } from "bun:serve";
   import { file } from "bun";
   ```

### Batch Migration

```typescript
async function migrateAllScripts() {
  const manager = new TemplateManager();
  await manager.initialize();

  const plugins = [
    { name: "research-tools", author: "Eduardo", version: "1.0.0" },
    { name: "studio-cc", author: "Eduardo", version: "1.0.0" },
  ];

  for (const plugin of plugins) {
    // Generate deploy script
    await manager.generate("marketplace-deploy", {
      PLUGIN_NAME: plugin.name,
      AUTHOR: plugin.author,
      VERSION: plugin.version,
      currentDate: new Date().toISOString(),
      className: plugin.name
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(""),
    });

    // Generate validate script
    await manager.generate("marketplace-validate", {
      PLUGIN_NAME: plugin.name,
      AUTHOR: plugin.author,
      VERSION: plugin.version,
      VALIDATION_RULES: "strict",
    });
  }
}
```