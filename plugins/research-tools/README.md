# Research Tools Plugin for Claude Code

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/menoncello/menon-market)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](#testing)

A comprehensive research tools plugin for Claude Code with advanced data analysis and deep research capabilities. Perfect for academic research, market intelligence, competitive analysis, and professional research workflows.

## 🚀 Features

### Core Research Capabilities

- **Multi-source Research**: Collects and analyzes information from diverse sources
- **Intelligent Synthesis**: Automatically synthesizes research findings into coherent summaries
- **Confidence Scoring**: Provides confidence scores for research results based on source quality
- **Key Findings Extraction**: Automatically identifies and extracts key insights from research data

### Deep Research Workflows

- **Company Research**: Comprehensive company analysis for job applications and partnerships
- **Competitor Analysis**: In-depth competitive intelligence and market positioning
- **Market Analysis**: Market size, trends, and opportunity assessment
- **Trend Analysis**: Emerging trends and future outlook research
- **Tool Comparison**: Technical evaluation and comparison of software tools
- **Technical Analysis**: Deep technical research and implementation analysis

### Advanced Features

- **Cross-validation**: Validates information across multiple independent sources
- **Quality Scoring**: Evaluates source credibility and research quality
- **Structured Reports**: Generates professional research reports with actionable insights
- **Performance Optimization**: Efficient processing with configurable limits and caching

## 📦 Installation

### Prerequisites

- Claude Code (latest version)
- Bun runtime (recommended)
- TypeScript 5.0+

### Install from Marketplace

1. Open Claude Code
2. Navigate to Marketplace
3. Search for "research-tools"
4. Click Install

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/menoncello/menon-market.git

# Navigate to the plugin directory
cd marketplace/plugins/research-tools

# Install dependencies
bun install

# Build the plugin
bun run build

# Copy to your Claude Code plugins directory
cp -r . ~/.claude/plugins/research-tools
```

## 🔧 Configuration

### Basic Configuration

```typescript
import { initialize } from 'research-tools';

const config = initialize({
  enableDeepResearch: true,
  maxSources: 50,
  outputFormat: 'markdown',
  timeout: 30000,
  cacheEnabled: true,
});
```

### Configuration Options

| Option               | Type                                 | Default      | Description                             |
| -------------------- | ------------------------------------ | ------------ | --------------------------------------- |
| `enableDeepResearch` | `boolean`                            | `true`       | Enable advanced deep research workflows |
| `maxSources`         | `number`                             | `50`         | Maximum number of sources to analyze    |
| `outputFormat`       | `'markdown'\|'json'\|'html'\|'text'` | `'markdown'` | Output format for research results      |
| `timeout`            | `number`                             | `30000`      | Request timeout in milliseconds         |
| `cacheEnabled`       | `boolean`                            | `true`       | Enable result caching for performance   |

## 📚 Usage

### Basic Research

```typescript
import { performResearch, initialize } from 'research-tools';

// Initialize configuration
const config = initialize();

// Perform research
const result = await performResearch('artificial intelligence trends', config);

console.log('Research Summary:', result.summary);
console.log('Key Findings:', result.keyFindings);
console.log('Confidence:', result.confidence);
console.log('Sources:', result.sources.length);
```

### Deep Research Workflows

```typescript
import performDeepResearch from 'research-tools/skills/deep-research';

// Company research
const companyReport = await performDeepResearch('Apple Inc.', 'company-research', {
  maxSources: 10,
  requireCrossValidation: true,
  qualityThreshold: 0.8,
  includeSentiment: true,
});

console.log('Company Analysis:', companyReport.summary);
console.log('Key Findings:', companyReport.findings);
console.log('Recommendations:', companyReport.recommendations);
```

### Available Workflows

- `company-research` - Company analysis and research
- `competitor-analysis` - Competitive intelligence
- `market-analysis` - Market research and analysis
- `trend-analysis` - Trend identification and analysis
- `tool-comparison` - Software/tool comparison research
- `technical-analysis` - Technical research and analysis

### Output Formats

#### Markdown Output

```markdown
# Research Report: AI Trends

## Summary

Based on 15 sources, artificial intelligence involves rapid advancement...

## Key Findings

- AI adoption accelerating across industries
- Machine learning models becoming more sophisticated
- Ethical considerations gaining importance

## Sources

1. [AI Research Institute] - Comprehensive analysis...
```

#### JSON Output

```json
{
  "query": "artificial intelligence trends",
  "summary": "Based on 15 sources, artificial intelligence...",
  "keyFindings": [
    "AI adoption accelerating across industries",
    "Machine learning models becoming more sophisticated"
  ],
  "confidence": 0.85,
  "sources": [...],
  "metadata": {...}
}
```

## 🧪 Testing

### Run All Tests

```bash
bun test
```

### Run with Coverage

```bash
bun test --coverage
```

### Test Categories

- **Unit Tests**: Individual function and component testing
- **Integration Tests**: End-to-end workflow testing
- **Performance Tests**: Performance and memory efficiency testing

Current test coverage: **99.76% line coverage**, **100% function coverage**

## 🏗️ Development

### Project Structure

```
research-tools/
├── index.ts                 # Main plugin implementation
├── types/
│   └── index.ts            # Type definitions
├── skills/
│   └── deep-research/
│       ├── index.ts        # Deep research skill
│       └── deep-research.test.ts
├── tests/
│   ├── index.test.ts       # Plugin tests
│   └── integration.test.ts # Integration tests
├── package.json
├── tsconfig.json
└── README.md
```

### Development Setup

```bash
# Clone repository
git clone https://github.com/menoncello/menon-market.git

# Navigate to plugin
cd marketplace/plugins/research-tools

# Install dependencies
bun install

# Start development mode
bun run dev

# Run tests
bun test

# Build for production
bun run build
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`bun test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📊 Performance

### Benchmarks

- **Basic Research**: < 50ms for typical queries
- **Deep Research**: < 500ms for comprehensive analysis
- **Memory Usage**: < 10MB for typical workloads
- **Concurrent Requests**: Supports 10+ concurrent operations

### Optimization Features

- Intelligent caching for repeated queries
- Configurable source limits for resource management
- Efficient data structures and algorithms
- Memory-conscious processing

## 🔒 Security & Privacy

### Data Handling

- All processing happens locally on your machine
- No data is sent to external servers without explicit configuration
- Research sources are validated and sanitized
- Input validation prevents injection attacks

### Privacy Features

- Local-only processing by default
- No telemetry or data collection
- Configurable data retention policies
- Secure source validation

## 🤝 Support

### Documentation

- [API Reference](./docs/api.md)
- [Examples](./docs/examples.md)
- [Troubleshooting](./docs/troubleshooting.md)

### Community

- [GitHub Issues](https://github.com/menoncello/menon-market/issues)
- [Discussions](https://github.com/menoncello/menon-market/discussions)

### Reporting Issues

When reporting issues, please include:

- Plugin version
- Claude Code version
- Operating system
- Error messages
- Steps to reproduce
- Expected vs actual behavior

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Claude Code team for the excellent plugin framework
- Research community for best practices and methodologies
- Open source contributors and maintainers
- Beta testers and early adopters

## 📈 Roadmap

### Version 1.1.0 (Planned)

- [ ] Additional research workflows
- [ ] Enhanced source validation
- [ ] Real-time research monitoring
- [ ] Custom report templates

### Version 1.2.0 (Future)

- [ ] AI-powered source ranking
- [ ] Collaborative research features
- [ ] Advanced visualization options
- [ ] Integration with external APIs

---

**Author**: Eduardo Menoncello
**Email**: eduardo@menoncello.com
**License**: MIT
**Version**: 1.0.0
