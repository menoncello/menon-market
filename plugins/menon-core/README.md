# Menon Core Plugin

Core functionality plugin for the menon ecosystem.

## Installation

This plugin is part of the menon ecosystem and should be installed automatically when setting up the core system.

## Usage

```typescript
import MenonCore from 'menon-core';

const core = new MenonCore({
  version: '1.0.0',
  features: ['feature1', 'feature2'],
});

await core.initialize();
const info = core.getInfo();
console.log(info);
```

## Features

- Core plugin functionality
- Feature management
- Configuration handling
- TypeScript support

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
