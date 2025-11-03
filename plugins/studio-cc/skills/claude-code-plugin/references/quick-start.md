# Claude Code Plugin Quick Start

This reference provides a quick-start guide for creating your first Claude Code plugin.

## Prerequisites

- Claude Code installed and working
- Basic knowledge of TypeScript/JavaScript
- Text editor (VS Code recommended)
- Git for version control

## Step 1: Create Plugin Structure

```bash
mkdir my-first-plugin
cd my-first-plugin
mkdir -p .claude-plugin commands skills agents hooks
```

## Step 2: Create Plugin Manifest

Create `.claude-plugin/plugin.json`:

```json
{
  "name": "my-first-plugin",
  "version": "1.0.0",
  "description": "My first Claude Code plugin",
  "author": "Your Name",
  "license": "MIT",
  "repository": "https://github.com/username/my-first-plugin",
  "main": "index.js",
  "claude": {
    "minVersion": "1.0.0",
    "maxVersion": "2.0.0"
  },
  "permissions": ["file:read", "file:write", "network:request"],
  "dependencies": {},
  "keywords": ["utility", "productivity"]
}
```

## Step 3: Add a Custom Command

Create `commands/hello.md`:

````markdown
---
name: hello
description: 'Say hello with a custom message'
parameters:
  - name: name
    type: string
    description: 'Name to greet'
    required: false
    default: 'World'
---

Hello! This is a custom command from my first plugin.

## Usage

```bash
/hello --name="Claude"
```
````

## Output

```
Hello, Claude! This message comes from my-first-plugin.
```

````

## Step 4: Create a Skill

Create `skills/my-skill/SKILL.md`:

```markdown
---
name: my-skill
description: "A simple skill for demonstration"
category: utility
tags: ["demo", "example"]
triggers:
  - type: keyword
    pattern: "demo task"
    priority: 2
---

This skill demonstrates basic plugin functionality.

## When to Use

Use this skill when you need to perform simple demonstration tasks.

## Capabilities

- Basic text processing
- Simple calculations
- File operations
- Example workflows
````

## Step 5: Test Your Plugin

```bash
# Install plugin locally
claude marketplace install ./my-first-plugin

# Test the command
claude
/hello --name="Test User"

# Test the skill
claude
I need help with a demo task
```

## Step 6: Package for Distribution

```bash
# Create distribution package
claude plugin package

# Or manually zip the plugin
zip -r my-first-plugin.zip . -x ".git/*" "node_modules/*" "dist/*"
```

## Common Templates

### Basic Command Template

````markdown
---
name: command-name
description: 'Brief description of the command'
parameters:
  - name: param1
    type: string
    description: 'Description of parameter'
    required: true
  - name: param2
    type: boolean
    description: 'Description of optional parameter'
    required: false
    default: false
---

Command description and usage examples.

## Examples

```bash
/command-name --param1="value" --param2
```
````

````

### Basic Skill Template

```markdown
---
name: skill-name
description: "Brief description of the skill"
category: utility
tags: ["tag1", "tag2"]
triggers:
  - type: keyword
    pattern: "trigger phrase"
    priority: 2
---

Skill description explaining when and how to use it.

## When to Use

Use this skill when you need to...

## Capabilities

List of what the skill can do.
````

## Next Steps

1. Add more commands and skills
2. Implement custom logic
3. Add configuration options
4. Write tests
5. Create documentation
6. Publish to marketplace

## Resources

- [Full Plugin Development Guide](../plugin-development-guide.md)
- [API Reference](../api-reference.md)
- [Best Practices](../best-practices.md)
- [Troubleshooting Guide](../troubleshooting.md)
