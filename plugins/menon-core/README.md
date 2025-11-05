# Menon Core Plugin

Core functionality plugin for the menon ecosystem, providing orchestration capabilities and resource management.

## Overview

Menon Core is the foundational plugin that provides essential functionality for the menon ecosystem, including orchestration support, resource management, and agent coordination capabilities.

## Features

- **Orchestration Support**: Core orchestration capabilities for complex workflows
- **Resource Management**: Advanced resource optimization and allocation
- **Agent Coordination**: Multi-agent management and coordination
- **Configuration Handling**: Centralized configuration management
- **TypeScript Support**: Full TypeScript support with strict typing
- **Plugin Integration**: Seamless integration with other menon plugins

## Components

### Orchestrator Agent

The menon-core plugin includes the orchestrator agent:

- **Path**: `plugins/menon-core/agents/orchestrator`
- **Version**: 1.0.0
- **Description**: Advanced orchestration agent for managing subagents, commands, MCP servers, and skills

#### Orchestrator Features

- Multi-agent workflow management
- Intelligent resource optimization
- Dynamic task planning and execution
- Resource usage monitoring and analysis
- Agent coordination and communication

#### Orchestrator Skills

- `orchestration-management`: Comprehensive orchestration capabilities for complex workflows
- `resource-optimizer`: Advanced resource optimization and allocation algorithms

## Usage

```typescript
import MenonCore from './index.ts';

const core = new MenonCore({
  version: '1.0.0',
  developmentMode: true,
  debugLogging: false,
});

await core.initialize();

// Get core information
const info = core.getInfo();
console.log(`Menon Core v${info.version} initialized`);

// Access orchestrator agent (if available)
if (core.hasAgent('orchestrator')) {
  const orchestrator = core.getAgent('orchestrator');
  await orchestrator.initialize();
}
```

## Development

### Building

```bash
bun run build
```

### Testing

```bash
bun test
```

### Linting

```bash
bun run lint
```

### Formatting

```bash
bun run format
```

## License

MIT
