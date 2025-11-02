# Menon Marketplace

> **A web marketplace for Claude Code plugins and skills by Eduardo Menoncello**

Built entirely with **Bun** and **TypeScript** for optimal performance and type safety.

## Overview

Menon Marketplace is a web platform that showcases and distributes high-quality plugins and skills for Claude Code. It provides a beautiful, responsive interface for browsing, searching, and discovering marketplace items with a focus on user experience and performance.

## Features

### 🚀 Core Functionality
- **Browse Plugins**: Discover powerful plugins to extend Claude Code functionality
- **Explore Skills**: Find specialized skills to enhance Claude Code capabilities
- **Search & Filter**: Advanced search with category filtering
- **Detailed Views**: Comprehensive information about each plugin and skill
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Performance Optimized**: Fast loading and smooth interactions

### 🛠️ Technical Stack
- **Runtime**: Bun (JavaScript all-in-one toolkit)
- **Language**: TypeScript with strict configuration
- **Frontend**: React with modern hooks and patterns
- **Styling**: Custom CSS with modern design principles
- **Build**: Bun bundler and hot module replacement

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd market

# Install dependencies
bun install
```

### Running the Marketplace

```bash
# Start the development server with hot reload
bun run dev

# Start the production server
bun run start

# Build for production
bun run build
```

### Access

Open your browser and navigate to:
- Development: `http://localhost:3000`
- The marketplace will be available with all plugins and skills ready to browse

## Features

### 🎯 User Experience
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Search & Filter**: Find exactly what you need with powerful search
- **Category Navigation**: Browse by category (Development, Productivity, Automation, etc.)
- **Detailed Information**: Click any item to see comprehensive details
- **Responsive Design**: Perfect experience on any device

### 📊 Content
- **High-Quality Plugins**: Curated selection of useful plugins
- **Specialized Skills**: AI-powered skills for various tasks
- **Ratings & Downloads**: See community feedback and popularity
- **Version Information**: Always up-to-date with latest versions
- **Documentation**: Links to detailed documentation and repositories

## Project Structure

```
market/
├── server.ts               # Bun web server
├── index.html             # Main HTML page
├── frontend.tsx           # React frontend application
├── static/                # Static assets
│   └── styles.css         # Application styles
├── examples/              # Example data
├── config/                # Configuration files
├── docs/                  # Documentation
├── scripts/               # Helper scripts
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## Plugin/Skill Format

### Plugin JSON Format

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "A useful plugin for Claude Code",
  "author": "Your Name",
  "category": "development",
  "tags": ["productivity", "automation"],
  "dependencies": ["dependency-plugin"],
  "main": "index.ts",
  "types": "types.d.ts",
  "enabled": true
}
```

### Skill JSON Format

```json
{
  "id": "my-skill",
  "name": "My Skill",
  "version": "1.0.0",
  "description": "A specialized skill for Claude Code",
  "author": "Your Name",
  "category": "automation",
  "tags": ["ai", "productivity"],
  "dependencies": ["dependency-skill"],
  "main": "index.ts",
  "types": "types.d.ts",
  "enabled": true
}
```

## Categories

### Plugin Categories
- `development` - Development tools and utilities
- `productivity` - Productivity enhancement tools
- `communication` - Communication and collaboration tools
- `data-processing` - Data processing and analysis tools
- `integration` - Integration with external services
- `utilities` - General utilities and helpers
- `security` - Security and authentication tools
- `testing` - Testing and quality assurance tools

### Skill Categories
- `automation` - Automation and workflow skills
- `analysis` - Data analysis and insights
- `generation` - Content generation skills
- `integration` - System integration skills
- `management` - Project and resource management
- `monitoring` - Monitoring and alerting skills
- `optimization` - Performance and optimization skills
- `research` - Research and information gathering

## Development

### Running Tests

```bash
bun test
```

### Building

```bash
bun build src/cli.ts --outdir ./dist --target bun
```

### Development Mode

```bash
bun --watch src/cli.ts
```

## Configuration

The marketplace can be configured through `config/marketplace.json`:

```json
{
  "name": "Menon Marketplace",
  "version": "1.0.0",
  "description": "A curated marketplace for Claude Code plugins and skills",
  "author": "Eduardo Menoncello",
  "license": "MIT",
  "settings": {
    "autoValidate": true,
    "enableTelemetry": false,
    "logLevel": "info",
    "maxConcurrentOperations": 5
  }
}
```

## API Usage

You can also use the marketplace programmatically:

```typescript
import { MenonMarketplace } from "./src/marketplace.js";
import { Plugin, PluginCategory } from "./types/marketplace.js";

const marketplace = new MenonMarketplace();

// Add a plugin
const plugin: Plugin = {
  id: "my-plugin",
  name: "My Plugin",
  version: "1.0.0",
  description: "A useful plugin",
  author: "Your Name",
  category: PluginCategory.DEVELOPMENT,
  tags: ["productivity"],
  main: "index.ts",
  enabled: true
};

marketplace.addPlugin(plugin);

// Get marketplace statistics
const stats = marketplace.getStats();
console.log(`Plugins: ${stats.enabledPlugins}/${stats.totalPlugins}`);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `bun test`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## About

Created and maintained by Eduardo Menoncello. Built with ❤️ using Bun and TypeScript.

---

**Note**: This marketplace is designed specifically for Claude Code and follows all best practices for Bun and TypeScript development.
