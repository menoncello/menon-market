# Research Commands Cheat Sheet

## Quick Reference Guide

This cheat sheet provides quick access to common research commands and workflows.

## 🚀 Quick Start Commands

### Company Research
```bash
# Basic company analysis
bun scripts/company-analyzer.ts --company "Marriott International" --focus comprehensive

# Financial-focused research
bun scripts/company-analyzer.ts --company "Apple Inc" --focus financial

# Market position analysis
bun scripts/company-analyzer.ts --company "Microsoft" --focus market-position

# Foundation research (leadership, mission, values)
bun scripts/company-analyzer.ts --company "Amazon" --focus foundation
```

### Market Research
```bash
# Comprehensive market analysis
bun scripts/web-researcher.ts --query "hotel market trends 2024" --depth comprehensive

# Quick market overview
bun scripts/web-researcher.ts --query "SaaS market size" --depth quick

# Recent market developments
bun scripts/web-researcher.ts --query "fintech regulations 2024" --depth recent

# Customer segmentation research
bun scripts/web-researcher.ts --query "enterprise software customer segments" --depth comprehensive
```

### Tool/Software Research
```bash
# Tool comparison research
bun scripts/web-researcher.ts --query "project management tools comparison 2024" --depth comprehensive

# Technical evaluation
bun scripts/web-researcher.ts --query "Kubernetes vs Docker Swarm performance" --depth comprehensive

# Cost analysis research
bun scripts/web-researcher.ts --query "cloud storage pricing comparison AWS Azure GCP" --depth comprehensive
```

## 📊 Report Generation

### Generate Reports
```bash
# Generate executive summary
bun scripts/report-generator.ts --template executive-summary --input research-data.json --output exec-summary.md

# Generate comprehensive report
bun scripts/report-generator.ts --template comprehensive-analysis --input market-data.json --output full-report.md

# Generate competitive intelligence report
bun scripts/report-generator.ts --template competitive-intelligence --input competitor-data.json --output competitor-analysis.md

# Generate HTML report
bun scripts/report-generator.ts --template market-analysis --input data.json --output report.html --format html
```

### List Available Templates
```bash
bun scripts/report-generator.ts templates
```

## 🔍 Advanced Search Techniques

### Search Query Construction
```bash
# Exact phrase matching
bun scripts/web-researcher.ts --query "\"artificial intelligence in healthcare\"" --depth comprehensive

# Exclude terms
bun scripts/web-researcher.ts --query "cloud computing -AWS -Azure" --depth comprehensive

# Site-specific search
bun scripts/web-researcher.ts --query "machine learning site:arxiv.org" --depth comprehensive

# File type search
bun scripts/web-researcher.ts --query "market report filetype:pdf" --depth comprehensive

# Date-specific search
bun scripts/web-researcher.ts --query "blockchain trends 2024" --depth recent
```

### Multi-query Research
```bash
# Sequential research with different focus areas
bun scripts/web-researcher.ts --query "company X market share" --depth comprehensive
bun scripts/web-researcher.ts --query "company X financial performance" --depth comprehensive
bun scripts/web-researcher.ts --query "company X recent developments" --depth recent
bun scripts/web-researcher.ts --query "company X competitors" --depth comprehensive
```

## 📋 Research Workflows

### Complete Company Research Workflow
```bash
# Step 1: Foundation research
bun scripts/company-analyzer.ts --company "Target Company" --focus foundation

# Step 2: Financial analysis
bun scripts/company-analyzer.ts --company "Target Company" --focus financial

# Step 3: Market position
bun scripts/company-analyzer.ts --company "Target Company" --focus market-position

# Step 4: Recent developments
bun scripts/web-researcher.ts --query "Target Company recent news 2024" --depth recent

# Step 5: Generate report
bun scripts/report-generator.ts --template comprehensive-analysis --input company-research.json --output target-company-analysis.md
```

### Market Entry Research Workflow
```bash
# Step 1: Market sizing
bun scripts/web-researcher.ts --query "[Industry] market size growth 2024" --depth comprehensive

# Step 2: Competitive landscape
bun scripts/web-researcher.ts --query "[Industry] major competitors market share" --depth comprehensive

# Step 3: Regulatory environment
bun scripts/web-researcher.ts --query "[Industry] regulations compliance 2024" --depth comprehensive

# Step 4: Customer analysis
bun scripts/web-researcher.ts --query "[Industry] customer segments needs preferences" --depth comprehensive

# Step 5: Generate market analysis report
bun scripts/report-generator.ts --template market-analysis --input market-data.json --output market-entry-analysis.md
```

### Tool Evaluation Workflow
```bash
# Step 1: Feature comparison
bun scripts/web-researcher.ts --query "[Tool category] features comparison 2024" --depth comprehensive

# Step 2: Pricing analysis
bun scripts/web-researcher.ts --query "[Tool category] pricing licensing comparison" --depth comprehensive

# Step 3: User reviews
bun scripts/web-researcher.ts --query "[Specific tool] user reviews ratings" --depth comprehensive

# Step 4: Technical evaluation
bun scripts/web-researcher.ts --query "[Tool category] technical specifications performance" --depth comprehensive

# Step 5: Generate evaluation report
bun scripts/report-generator.ts --template technical-evaluation --input tool-data.json --output tool-evaluation.md
```

## 🎯 Output Formats

### JSON Format (Default)
```bash
bun scripts/web-researcher.ts --query "research topic" --output results.json
```

### Markdown Format
```bash
bun scripts/web-researcher.ts --query "research topic" --format markdown --output results.md
```

### CSV Format
```bash
bun scripts/web-researcher.ts --query "research topic" --format csv --output results.csv
```

## ⚙️ Configuration Options

### Research Depth Levels
- `quick`: Basic overview with limited sources
- `comprehensive`: Deep analysis with multiple source types
- `recent`: Focus on very recent developments

### Maximum Results
```bash
bun scripts/web-researcher.ts --query "topic" --max-results 20
```

### Source Specification
```bash
bun scripts/web-researcher.ts --query "topic" --sources "reuters.com,bloomberg.com,wsj.com"
```

## 🔧 Utility Commands

### Research History
```bash
# View recent research sessions
bun scripts/web-researcher.ts history

# View last 5 research sessions
bun scripts/web-researcher.ts history --limit 5
```

### Database Management
```bash
# The research data is stored in SQLite databases:
# - research_data.db (web research results)
# - company_analysis.db (company analysis data)
# - market_analysis.db (market research data)

# To access data directly, use sqlite3:
sqlite3 research_data.db "SELECT * FROM search_results ORDER BY timestamp DESC LIMIT 10;"
```

## 📊 Quality Assurance

### Source Verification
```bash
# Run source verification on research results
bun scripts/source-verifier.ts --sources sources.json --verification-level high
```

### Data Cleaning
```bash
# Clean and standardize research data
bun scripts/data-cleaner.ts --input raw-data.json --output clean-data.json
```

## 🚨 Common Issues and Solutions

### Search Engine Rate Limits
- If you encounter rate limits, add delays between searches
- Use multiple search engines for better coverage
- Consider reducing max-results parameter

### Data Quality Issues
- Always cross-reference important claims
- Use multiple source types for verification
- Prioritize recent and authoritative sources

### Large Result Sets
- Use specific search queries to reduce noise
- Filter by publication date when needed
- Focus on high-quality source domains

## 📚 Template Usage Guide

### Executive Summary Template
- Use for quick decision-maker overviews
- Keep to 1-2 pages maximum
- Focus on key findings and recommendations

### Comprehensive Analysis Template
- Use for detailed research documentation
- Include full methodology and source lists
- Add appendices for supporting data

### Competitive Intelligence Template
- Use for competitor analysis
- Include market positioning and SWOT analysis
- Focus on actionable competitive insights

### Technical Evaluation Template
- Use for software/tools assessment
- Include technical specifications and requirements
- Add integration and migration considerations

### Market Analysis Template
- Use for market research and sizing
- Include segmentation and trend analysis
- Add opportunity and risk assessment

---

*For detailed methodology and framework information, refer to the reference documentation in the /references directory.*