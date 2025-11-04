---
name: deep-research
description: Comprehensive research specialist for market intelligence, company analysis, and competitive research. Use when you need in-depth research on companies, markets, tools, or business opportunities. Provides structured reports with source verification, multi-source analysis, and actionable insights. (project, gitignored)
---

# Deep Research Professional

## Overview

This skill enables comprehensive research and analysis for business intelligence, including company research for job opportunities, market analysis for business decisions, competitive intelligence, and tool evaluation for technical projects. Provides structured methodology with automated data collection, source verification, and professional report generation.

## Core Capabilities

### 1. Research Workflow Decision Tree

**For Company Research:**

- Researching a company for job applications → Use `company-research` workflow
- Analyzing company competitors → Use `competitor-analysis` workflow
- Investigating company financial health → Use `financial-analysis` workflow

**For Market Research:**

- New market entry analysis → Use `market-analysis` workflow
- Industry trend research → Use `trend-analysis` workflow
- Customer segment research → Use `customer-research` workflow

**For Tool/Software Research:**

- Finding alternatives to existing tools → Use `tool-comparison` workflow
- Technical evaluation of software → Use `technical-analysis` workflow
- Cost-benefit analysis of tools → Use `cost-analysis` workflow

### 2. Research Methodology Framework

Execute research following the structured 4-phase methodology:

**Phase 1: Planning and Scoping**

1. Define clear research objectives and success criteria
2. Identify primary and secondary search terms
3. Map potential information sources
4. Establish quality and reliability criteria
5. Create research timeline and deliverable specifications

**Phase 2: Multi-Source Data Collection**

1. **Primary Sources**: Company reports, official documentation, financial statements, technical specs
2. **Secondary Sources**: Market research reports, expert analysis, industry publications
3. **Tertiary Sources**: Community discussions, user reviews, social media insights
4. **Cross-Validation**: Verify information across 3+ independent sources

**Phase 3: Analysis and Synthesis**

1. Screen and filter relevant information from noise
2. Identify patterns, trends, and correlations
3. Contextualize findings within industry landscape
4. Verify facts and statistical data accuracy

**Phase 4: Report Generation and Documentation**

1. Structure findings in comprehensive report format
2. Hierarchize information by importance and relevance
3. Include executive summary with key insights
4. Provide actionable recommendations
5. **Document all researched links and references** with timestamps and access dates
6. **Create comprehensive bibliography** with source quality ratings
7. **Archive all research artifacts** for future reference and verification

### 3. Automation with BunJS Scripts

Leverage automated scripts for efficient research execution:

**Web Research Automation:**

```bash
bun scripts/web-researcher.ts --query "hotel market trends 2024" --depth comprehensive
bun scripts/company-analyzer.ts --company "Marriott International" --focus "financial-performance"
bun scripts/competitor-analysis.ts --industry "hospitality" --companies "Hilton,Marriott,Hyatt"
```

**Report Generation:**

```bash
bun scripts/report-generator.ts --template market-analysis --input research-data.json
bun scripts/source-verifier.ts --sources sources.json --verification-level high
```

### 4. Quality Assurance Protocols

**Source Evaluation Criteria:**

- **Authority**: Credibility and expertise of source
- **Timeliness**: Recency and relevance of information
- **Objectivity**: Potential biases and conflicts of interest
- **Accuracy**: Verifiability of claims and data
- **Depth**: Comprehensive vs. superficial analysis

**Fact Verification Process:**

1. Cross-reference key claims across 3+ independent sources
2. Verify statistical data with official sources
3. Validate expert opinions against industry consensus
4. Document all sources with timestamps and access dates
5. **Maintain comprehensive link registry** of all researched URLs and content
6. **Track source quality metrics** and reliability scores
7. **Archive original content** for verification and future reference

## Link and Reference Management System

### Comprehensive Link Tracking

**All research MUST include complete link documentation:**

1. **Primary Source Links**
   - Official company websites and reports
   - Government databases and regulatory filings
   - Academic research papers and studies
   - Industry association publications
   - Format: `[URL] | [Access Date/Time] | [Content Type] | [Quality Rating]`

2. **Secondary Source Links**
   - News articles and press releases
   - Market research reports
   - Expert analysis and commentary
   - Industry publications and trade journals
   - Format: `[URL] | [Publication Date] | [Author/Source] | [Access Date]`

3. **Tertiary Source Links**
   - Social media discussions and trends
   - Community forums and Q&A sites
   - User reviews and testimonials
   - Blog posts and opinion pieces
   - Format: `[URL] | [Platform] | [Engagement Metrics] | [Sentiment Analysis]`

### Reference Documentation Standards

**Every research report must include:**

1. **Complete Bibliography Section**

   ```markdown
   ## References and Sources

   ### Primary Sources

   - [Source Name] - [URL] - [Access Date] - [Reliability: High/Medium/Low]

   ### Secondary Sources

   - [Publication Name] - [URL] - [Publication Date] - [Access Date]

   ### Tertiary Sources

   - [Platform/Source] - [URL] - [Access Date] - [User Engagement]
   ```

2. **Link Quality Assessment**
   - **Reliability Score**: 1-10 rating based on authority and accuracy
   - **Freshness Score**: 1-10 rating based on recency and relevance
   - **Completeness Score**: 1-10 rating based on depth and thoroughness
   - **Overall Quality**: Weighted average of all scores

3. **Source Verification Log**
   - Verification timestamp
   - Cross-referenced sources (minimum 3 for critical claims)
   - Fact-checking results and confidence levels
   - Any discrepancies or contradictions found

### Automated Link Management Scripts

**Link Collection and Verification:**

```bash
bun scripts/link-collector.ts --query "research topic" --sources all --output links.json
bun scripts/source-verifier.ts --input links.json --verification-level comprehensive
bun scripts/reference-formatter.ts --input verified-links.json --format apa --output bibliography.md
```

**Quality Assessment:**

```bash
bun scripts/link-quality-analyzer.ts --input links.json --criteria authority,freshness,accuracy
bun scripts/source-ranking.ts --input verified-links.json --method weighted-scoring
bun scripts/reference-organizer.ts --input bibliography.md --categories primary,secondary,tertiary
```

### Archival and Storage

**Research artifacts must be archived:**

1. **Link Registry Database**
   - All URLs researched with metadata
   - Access timestamps and content snapshots
   - Quality assessments and verification status
   - Cross-reference mapping between related sources

2. **Content Archive**
   - Downloaded copies of critical sources
   - Screenshots of important data points
   - Cached versions for offline verification
   - Version history for dynamic content

3. **Reference Export Formats**
   - APA, MLA, Chicago style citations
   - BibTeX for academic integration
   - JSON for programmatic access
   - CSV for spreadsheet analysis

## Research Workflows

### Company Research Workflow

**Use when:** Researching companies for job applications, partnerships, or competitive analysis

**Execution Steps:**

1. **Company Foundation Research**
   - Founding date, mission, vision, values
   - Leadership team and organizational structure
   - Business model and revenue streams
   - Target: `scripts/company-analyzer.ts --company [NAME] --focus foundation`

2. **Financial Health Analysis**
   - Revenue trends, profitability, funding history
   - Market position and growth trajectory
   - Key financial metrics and KPIs
   - Target: `scripts/company-analyzer.ts --company [NAME] --focus financial`

3. **Market Position Assessment**
   - Market share, competitive landscape
   - Customer base and segments
   - Brand reputation and market perception
   - Target: `scripts/company-analyzer.ts --company [NAME] --focus market-position`

4. **Recent Developments**
   - News, product launches, strategic initiatives
   - Partnerships, acquisitions, expansions
   - Challenges and controversies
   - Target: `scripts/web-researcher.ts --query "[COMPANY] recent developments" --depth recent`

5. **Cultural and Employment Research**
   - Company culture, employee reviews
   - Benefits, compensation, work-life balance
   - Diversity, equity, and inclusion initiatives
   - Target: `scripts/web-researcher.ts --query "[COMPANY] employee reviews culture" --depth comprehensive`

### Market Research Workflow

**Use when:** Analyzing markets for business opportunities, investment decisions, or strategic planning

**Execution Steps:**

1. **Market Sizing and Growth**
   - Total Addressable Market (TAM), Serviceable Addressable Market (SAM), Serviceable Obtainable Market (SOM)
   - Historical growth rates and future projections
   - Market drivers and restraining factors
   - Target: `scripts/web-researcher.ts --query "[MARKET] market size growth 2024" --depth comprehensive`

2. **Competitive Landscape Analysis**
   - Major players, market share distribution
   - Competitive advantages and differentiation
   - Barriers to entry and threat of new entrants
   - Target: `scripts/competitor-analysis.ts --industry [INDUSTRY] --depth comprehensive`

3. **Customer Segmentation**
   - Demographic, psychographic, behavioral segmentation
   - Customer needs, pain points, preferences
   - Customer acquisition channels and costs
   - Target: `scripts/web-researcher.ts --query "[MARKET] customer segments needs" --depth comprehensive`

4. **Trend and Opportunity Analysis**
   - Current trends, emerging opportunities
   - Technological disruptions and innovations
   - Regulatory changes and their impact
   - Target: `scripts/trend-analyzer.ts --market [MARKET] --timeframe 2024-2026`

5. **Risk Assessment**
   - Market risks, competitive threats
   - Operational and financial risks
   - Mitigation strategies and contingency plans
   - Target: `scripts/risk-analyzer.ts --market [MARKET] --assessment-level comprehensive`

### Tool/Software Research Workflow

**Use when:** Evaluating software tools, finding alternatives, or technical decision-making

**Execution Steps:**

1. **Requirements Definition**
   - Functional requirements and must-have features
   - Technical requirements and integration needs
   - Budget constraints and pricing models
   - Target: Use `assets/requirements-templates/software-requirements.md`

2. **Market Survey**
   - Available solutions and alternatives
   - Feature comparison matrix
   - Pricing and licensing models
   - Target: `scripts/tool-researcher.ts --category [CATEGORY] --requirements requirements.json`

3. **Technical Evaluation**
   - Architecture, scalability, performance
   - Integration capabilities and API quality
   - Security and compliance features
   - Target: `scripts/technical-analyzer.ts --tools [TOOL1,TOOL2,TOOL3] --criteria technical`

4. **User Experience Assessment**
   - User reviews and satisfaction ratings
   - Learning curve and onboarding experience
   - Support quality and community engagement
   - Target: `scripts/ux-analyzer.ts --tools [TOOL1,TOOL2,TOOL3] --source reviews`

5. **Cost-Benefit Analysis**
   - Total cost of ownership (TCO) calculation
   - ROI estimation and payback period
   - Risk-adjusted benefit analysis
   - Target: `scripts/cost-analyzer.ts --tools [TOOL1,TOOL2,TOOL3] --timeframe 3years`

## Report Templates and Output Formats

### Executive Summary Report

**Template:** `assets/report-templates/executive-summary.md`
**Use for:** Quick overview for decision-makers
**Length:** 1-2 pages
**Content:** Key findings, recommendations, next steps

### Comprehensive Research Report

**Template:** `assets/report-templates/comprehensive-analysis.md`
**Use for:** Detailed research documentation
**Length:** 10-50 pages
**Content:** Full methodology, detailed findings, appendix

### Competitive Intelligence Brief

**Template:** `assets/report-templates/competitive-intelligence.md`
**Use for:** Competitive landscape analysis
**Length:** 5-15 pages
**Content:** Competitor profiles, market positioning, strategic insights

### Technical Evaluation Report

**Template:** `assets/report-templates/technical-evaluation.md`
**Use for:** Software/tools assessment
**Length:** 8-20 pages
**Content:** Technical specifications, comparison, recommendations

## Quality Standards and Best Practices

### Research Quality Standards

1. **Source Diversity Minimum**: Use minimum 5 different sources for any significant claim
2. **Temporal Relevance**: Prioritize sources from last 12 months for rapidly changing topics
3. **Authority Verification**: Only use sources with demonstrable expertise or official capacity
4. **Cross-Validation**: Verify all critical data points across independent sources
5. **Transparency**: Document all sources, access dates, and potential limitations

### Ethical Research Guidelines

1. **Legal Compliance**: Respect copyright, terms of service, and data privacy regulations
2. **Source Attribution**: Properly cite all sources and give credit to original creators
3. **Intellectual Honesty**: Present information accurately without manipulation or distortion
4. **Conflict Disclosure**: Declare any potential conflicts of interest or biases
5. **Responsible Use**: Use research findings ethically and responsibly

## Resources

### scripts/

Executable BunJS code for automated research operations:

**Core Research Scripts:**

- `web-researcher.ts` - Multi-source web research and data collection
- `company-analyzer.ts` - Comprehensive company research and analysis
- `competitor-analysis.ts` - Competitive intelligence gathering
- `trend-analyzer.ts` - Market trend identification and analysis
- `tool-researcher.ts` - Software/tools discovery and comparison

**Analysis Scripts:**

- `technical-analyzer.ts` - Technical evaluation and comparison
- `cost-analyzer.ts` - Financial analysis and ROI calculation
- `risk-analyzer.ts` - Risk assessment and mitigation planning
- `ux-analyzer.ts` - User experience and satisfaction analysis

**Link and Reference Management Scripts:**

- `link-collector.ts` - Automated collection and categorization of research links
- `source-verifier.ts` - Comprehensive source verification and quality assessment
- `link-quality-analyzer.ts` - Quality scoring and reliability assessment of sources
- `reference-formatter.ts` - Bibliography formatting in multiple citation styles
- `source-ranking.ts` - Intelligent source ranking and prioritization
- `reference-organizer.ts` - Automatic categorization and organization of references

**Utility Scripts:**

- `report-generator.ts` - Automated report generation from research data
- `data-cleaner.ts` - Data cleaning and standardization
- `export-formatter.ts` - Export data to various formats (JSON, CSV, Markdown)
- `content-archiver.ts` - Automated archival of research content and sources

### references/

Documentation and reference materials for research guidance:

**Research Methodology:**

- `research-methodology.md` - Detailed research frameworks and approaches
- `source-quality-criteria.md` - Source evaluation standards and guidelines
- `industry-frameworks.md` - Analysis frameworks (SWOT, Porter's, PESTLE, etc.)
- `data-collection-strategies.md` - Advanced data collection techniques

**Link and Reference Management:**

- `link-management-best-practices.md` - Comprehensive guide to managing research links
- `citation-styles-guide.md` - Complete guide to APA, MLA, Chicago, and BibTeX formats
- `source-verification-methods.md` - Advanced techniques for verifying online sources
- `digital-archival-standards.md` - Best practices for archiving digital research content

**Templates and Guides:**

- `report-templates.md` - Detailed guide to using report templates
- `interview-guides.md` - Interview question templates for primary research
- `checklist-quality.md` - Quality assurance checklists for research projects

**Domain-Specific Knowledge:**

- `financial-metrics.md` - Key financial metrics and their interpretation
- `market-segmentation.md` - Approaches to market segmentation analysis
- `competitive-intelligence.md` - Ethical competitive intelligence practices

### assets/

Templates and resources for research output:

**Report Templates:**

- `report-templates/executive-summary.md` - Executive summary template
- `report-templates/comprehensive-analysis.md` - Full research report template
- `report-templates/competitive-intelligence.md` - Competitive analysis template
- `report-templates/technical-evaluation.md` - Technical evaluation template
- `report-templates/market-analysis.md` - Market research template

**Link and Reference Templates:**

- `link-templates/bibliography-apa.md` - APA style bibliography template
- `link-templates/bibliography-mla.md` - MLA style bibliography template
- `link-templates/source-tracker.md` - Research source tracking template
- `link-templates/quality-assessment.md` - Source quality assessment template
- `link-templates/verification-log.md` - Source verification log template

**Quick Reference:**

- `cheat-sheets/research-commands.md` - Quick reference for script commands
- `cheat-sheets/source-types.md` - Guide to different source types and reliability
- `cheat-sheets/templates-mapping.md` - Mapping research types to appropriate templates
- `cheat-sheets/link-formats.md` - Quick reference for link citation formats
- `cheat-sheets/quality-checklists.md` - Quality assessment checklists for sources

**Configuration Files:**

- `config/research-sources.json` - Pre-configured reliable sources by industry
- `config/quality-thresholds.json` - Quality thresholds and criteria
- `config/output-formats.json` - Customizable output format configurations
- `config/link-management.json` - Link tracking and archival settings
- `config/citation-styles.json` - Citation style configurations and templates
- `config/source-categories.json` - Automated source categorization rules

## Usage Examples

**Company Research Example:**

```
Research Marriott International for a job application, focusing on:
- Financial performance and stability
- Company culture and employee satisfaction
- Recent strategic initiatives and growth plans
- Competitive position in hospitality industry
```

**Market Research Example:**

```
Research the European hotel market for business expansion, focusing on:
- Market size and growth projections
- Key competitors and market share
- Regulatory environment and entry barriers
- Customer preferences and booking trends
```

**Tool Evaluation Example:**

```
Find the best project management tools for a remote team, focusing on:
- Feature comparison and pricing
- Integration with existing tools
- User experience and learning curve
- Security and compliance features
```

This skill transforms complex research requirements into structured, actionable intelligence with automated data collection, rigorous quality standards, and professional reporting capabilities.
