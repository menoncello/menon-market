#!/usr/bin/env bun

/**
 * Company Analyzer - Comprehensive company research and analysis
 * Automated company intelligence gathering for business research
 */

import { Command } from 'commander';
import { Database } from 'bun:sqlite';
import { WebResearcher } from './web-researcher';

interface CompanyAnalysisOptions {
  company: string;
  focus: 'foundation' | 'financial' | 'market-position' | 'comprehensive';
  outputFormat?: 'json' | 'markdown' | 'csv';
  outputFile?: string;
}

interface CompanyData {
  基本信息: {
    company_name: string;
    founded_date: string;
    headquarters: string;
    website: string;
    employee_count: string;
    industry: string;
    sector: string;
  };
  leadership: {
    ceo: string;
    key_executives: Array<{
      name: string;
      position: string;
      experience: string;
    }>;
  };
  financial: {
    revenue: string;
    market_cap: string;
    profit_margin: string;
    revenue_growth: string;
    stock_price?: string;
    funding_history?: Array<{
      round: string;
      amount: string;
      date: string;
      investors: string[];
    }>;
  };
  market_position: {
    market_share: string;
    competitors: string[];
    customer_segments: string[];
    geographic_presence: string[];
  };
  recent_developments: Array<{
    date: string;
    type: string;
    description: string;
    source: string;
  }>;
  culture_employment: {
    employee_satisfaction: string;
    benefits: string[];
    work_life_balance: string;
    diversity_initiatives: string[];
  };
  sources: Array<{
    url: string;
    title: string;
    access_date: string;
    reliability: string;
  }>;
}

class CompanyAnalyzer {
  private webResearcher: WebResearcher;
  private db: Database;

  constructor() {
    this.webResearcher = new WebResearcher();
    this.db = new Database('company_analysis.db');
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS company_analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT,
        analysis_focus TEXT,
        analysis_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_name, analysis_focus)
      )
    `);
  }

  async analyzeCompany(options: CompanyAnalysisOptions): Promise<CompanyData> {
    console.log(`🏢 Starting company analysis for: ${options.company}`);
    console.log(`📊 Focus area: ${options.focus}`);

    try {
      const companyData = this.initializeCompanyData(options.company);

      // Gather basic company information
      await this.gatherBasicInfo(companyData);

      // Gather information based on focus
      await this.gatherFocusSpecificInfo(options.focus, companyData);

      // Gather recent developments
      await this.gatherRecentDevelopments(companyData);

      // Save analysis to database
      this.saveAnalysis(options.company, options.focus, companyData);

      console.log(`✅ Company analysis completed for ${options.company}`);
      return companyData;
    } catch (error) {
      console.error('❌ Company analysis failed:', error);
      throw error;
    }
  }

  private initializeCompanyData(companyName: string): CompanyData {
    return {
      基本信息: {
        company_name: companyName,
        founded_date: '',
        headquarters: '',
        website: '',
        employee_count: '',
        industry: '',
        sector: '',
      },
      leadership: {
        ceo: '',
        key_executives: [],
      },
      financial: {
        revenue: '',
        market_cap: '',
        profit_margin: '',
        revenue_growth: '',
      },
      market_position: {
        market_share: '',
        competitors: [],
        customer_segments: [],
        geographic_presence: [],
      },
      recent_developments: [],
      culture_employment: {
        employee_satisfaction: '',
        benefits: [],
        work_life_balance: '',
        diversity_initiatives: [],
      },
      sources: [],
    };
  }

  private async gatherFocusSpecificInfo(focus: string, companyData: CompanyData): Promise<void> {
    switch (focus) {
      case 'foundation':
        await this.gatherFoundationInfo(companyData);
        break;
      case 'financial':
        await this.gatherFinancialInfo(companyData);
        break;
      case 'market-position':
        await this.gatherMarketPositionInfo(companyData);
        break;
      case 'comprehensive':
        await this.gatherFoundationInfo(companyData);
        await this.gatherFinancialInfo(companyData);
        await this.gatherMarketPositionInfo(companyData);
        await this.gatherCultureInfo(companyData);
        break;
    }
  }

  private async gatherBasicInfo(companyData: CompanyData): Promise<void> {
    const queries = [
      `${companyData.基本信息.company_name} company profile Wikipedia`,
      `${companyData.基本信息.company_name} about us official website`,
      `${companyData.基本信息.company_name} company information Crunchbase`,
    ];

    for (const query of queries) {
      try {
        const results = await this.webResearcher.performResearch({
          query,
          depth: 'quick',
          maxResults: 5,
        });

        for (const result of results) {
          // Extract basic information from search results
          await this.extractBasicInfo(result, companyData);
        }
      } catch {
        console.warn(`⚠️  Failed to gather basic info for query: ${query}`);
      }
    }
  }

  private async extractBasicInfo(searchResult: any, companyData: CompanyData): Promise<void> {
    // This would use regex patterns or NLP to extract specific information
    // For now, we'll simulate the extraction

    const text = `${searchResult.title} ${searchResult.snippet}`;

    // Extract website
    const websiteMatch = text.match(/https?:\/\/[^\s]+/);
    if (websiteMatch && !companyData.基本信息.website) {
      companyData.基本信息.website = websiteMatch[0];
    }

    // Extract founded date
    const foundedMatch = text.match(/founded in (\d{4})|established (\d{4})|since (\d{4})/i);
    if (foundedMatch && !companyData.基本信息.founded_date) {
      companyData.基本信息.founded_date = foundedMatch[1] || foundedMatch[2] || foundedMatch[3];
    }

    // Extract headquarters
    const hqMatch = text.match(/headquartered in ([^.]+)|based in ([^.]+)/i);
    if (hqMatch && !companyData.基本信息.headquarters) {
      companyData.基本信息.headquarters = hqMatch[1] || hqMatch[2];
    }

    companyData.sources.push({
      url: searchResult.url,
      title: searchResult.title,
      access_date: new Date().toISOString(),
      reliability: 'high',
    });
  }

  private async gatherFoundationInfo(companyData: CompanyData): Promise<void> {
    const queries = [
      `${companyData.基本信息.company_name} CEO leadership team`,
      `${companyData.基本信息.company_name} mission vision values`,
      `${companyData.基本信息.company_name} business model revenue streams`,
    ];

    for (const query of queries) {
      try {
        const results = await this.webResearcher.performResearch({
          query,
          depth: 'comprehensive',
          maxResults: 8,
        });

        for (const result of results) {
          await this.extractLeadershipInfo(result, companyData);
        }
      } catch {
        console.warn(`⚠️  Failed to gather foundation info for query: ${query}`);
      }
    }
  }

  private async extractLeadershipInfo(searchResult: any, companyData: CompanyData): Promise<void> {
    const text = `${searchResult.title} ${searchResult.snippet}`;

    // Extract CEO
    const ceoMatch = text.match(/CEO[:\s]+([^.]+)|Chief Executive Officer[:\s]+([^.]+)/i);
    if (ceoMatch && !companyData.leadership.ceo) {
      companyData.leadership.ceo = (ceoMatch[1] || ceoMatch[2]).trim();
    }

    // Extract key executives
    const executiveMatches = text.match(/(President|CTO|CFO|COO|Chief[^,]+?)[:\s]+([^.]+)/gi);
    if (executiveMatches) {
      for (const match of executiveMatches) {
        const positionMatch = match.match(/(President|CTO|CFO|COO|Chief[^,]+?)[:\s]+([^.]+)/i);
        if (positionMatch) {
          companyData.leadership.key_executives.push({
            name: positionMatch[2].trim(),
            position: positionMatch[1].trim(),
            experience: 'To be researched',
          });
        }
      }
    }
  }

  private async gatherFinancialInfo(companyData: CompanyData): Promise<void> {
    const queries = [
      `${companyData.基本信息.company_name} annual revenue financial results`,
      `${companyData.基本信息.company_name} market cap stock price`,
      `${companyData.基本信息.company_name} financial performance profit margin`,
      `${companyData.基本信息.company_name} revenue growth quarterly results`,
    ];

    for (const query of queries) {
      try {
        const results = await this.webResearcher.performResearch({
          query,
          depth: 'comprehensive',
          maxResults: 10,
        });

        for (const result of results) {
          await this.extractFinancialInfo(result, companyData);
        }
      } catch {
        console.warn(`⚠️  Failed to gather financial info for query: ${query}`);
      }
    }
  }

  private async extractFinancialInfo(searchResult: any, companyData: CompanyData): Promise<void> {
    const text = `${searchResult.title} ${searchResult.snippet}`;

    // Extract revenue
    const revenueMatch = text.match(
      /revenue[:\s]+[$]([\d.]+)[BMK]|annual revenue[:\s]+[$]([\d.]+)[BMK]/i
    );
    if (revenueMatch && !companyData.financial.revenue) {
      const amount = revenueMatch[1] || revenueMatch[2];
      const multiplier = text.includes('B')
        ? 'Billion'
        : text.includes('M')
          ? 'Million'
          : 'Thousand';
      companyData.financial.revenue = `$${amount} ${multiplier}`;
    }

    // Extract market cap
    const marketCapMatch = text.match(
      /market cap[:\s]+[$]([\d.]+)[BMK]|market capitalization[:\s]+[$]([\d.]+)[BMK]/i
    );
    if (marketCapMatch && !companyData.financial.market_cap) {
      const amount = marketCapMatch[1] || marketCapMatch[2];
      const multiplier = text.includes('B')
        ? 'Billion'
        : text.includes('M')
          ? 'Million'
          : 'Thousand';
      companyData.financial.market_cap = `$${amount} ${multiplier}`;
    }
  }

  private async gatherMarketPositionInfo(companyData: CompanyData): Promise<void> {
    const queries = [
      `${companyData.基本信息.company_name} market share competitors`,
      `${companyData.基本信息.company_name} customer base target market`,
      `${companyData.基本信息.company_name} competitive advantages differentiation`,
      `${companyData.基本信息.company_name} industry ranking position`,
    ];

    for (const query of queries) {
      try {
        const results = await this.webResearcher.performResearch({
          query,
          depth: 'comprehensive',
          maxResults: 8,
        });

        for (const result of results) {
          await this.extractMarketPositionInfo(result, companyData);
        }
      } catch {
        console.warn(`⚠️  Failed to gather market position info for query: ${query}`);
      }
    }
  }

  private async extractMarketPositionInfo(
    searchResult: any,
    companyData: CompanyData
  ): Promise<void> {
    const text = `${searchResult.title} ${searchResult.snippet}`;

    // Extract competitors
    const competitorMatches = text.match(/competitors?[:\s]+([^.]+)|rivals?[:\s]+([^.]+)/i);
    if (competitorMatches) {
      const competitors = (competitorMatches[1] || competitorMatches[2])
        .split(/[,;]/)
        .map(c => c.trim());
      companyData.market_position.competitors.push(...competitors);
    }

    // Extract market share
    const marketShareMatch = text.match(/market share[:\s]+([\d.]+)%|([\d.]+)% market share/i);
    if (marketShareMatch && !companyData.market_position.market_share) {
      companyData.market_position.market_share = `${marketShareMatch[1] || marketShareMatch[2]}%`;
    }
  }

  private async gatherCultureInfo(companyData: CompanyData): Promise<void> {
    const queries = [
      `${companyData.基本信息.company_name} employee reviews Glassdoor`,
      `${companyData.基本信息.company_name} company culture work life balance`,
      `${companyData.基本信息.company_name} benefits compensation packages`,
      `${companyData.基本信息.company_name} diversity inclusion initiatives`,
    ];

    for (const query of queries) {
      try {
        const results = await this.webResearcher.performResearch({
          query,
          depth: 'comprehensive',
          maxResults: 6,
        });

        for (const result of results) {
          await this.extractCultureInfo(result, companyData);
        }
      } catch {
        console.warn(`⚠️  Failed to gather culture info for query: ${query}`);
      }
    }
  }

  private async extractCultureInfo(searchResult: any, companyData: CompanyData): Promise<void> {
    const text = `${searchResult.title} ${searchResult.snippet}`;

    // Extract employee satisfaction
    const satisfactionMatch = text.match(
      /(\d+\.\d+)\/5|(\d+)%.*?recommend|satisfaction[:\s]+(\d+\.\d+)/i
    );
    if (satisfactionMatch && !companyData.culture_employment.employee_satisfaction) {
      const rating = satisfactionMatch[1] || satisfactionMatch[2] || satisfactionMatch[3];
      companyData.culture_employment.employee_satisfaction = `${rating}/5`;
    }
  }

  private async gatherRecentDevelopments(companyData: CompanyData): Promise<void> {
    const queries = [
      `${companyData.基本信息.company_name} recent news 2024`,
      `${companyData.基本信息.company_name} latest developments`,
      `${companyData.基本信息.company_name} partnerships acquisitions 2024`,
    ];

    for (const query of queries) {
      try {
        const results = await this.webResearcher.performResearch({
          query,
          depth: 'recent',
          maxResults: 5,
        });

        for (const result of results) {
          companyData.recent_developments.push({
            date: new Date().toISOString().split('T')[0],
            type: 'news',
            description: result.snippet,
            source: result.source,
          });
        }
      } catch {
        console.warn(`⚠️  Failed to gather recent developments for query: ${query}`);
      }
    }
  }

  private saveAnalysis(companyName: string, focus: string, data: CompanyData): void {
    this.db.run(
      'INSERT OR REPLACE INTO company_analyses (company_name, analysis_focus, analysis_data) VALUES (?, ?, ?)',
      [companyName, focus, JSON.stringify(data, null, 2)]
    );
  }

  generateReport(companyData: CompanyData, format = 'markdown'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(companyData, null, 2);

      case 'csv':
        return this.generateCSVReport(companyData);

      case 'markdown':
      default:
        return this.generateMarkdownReport(companyData);
    }
  }

  private generateMarkdownReport(companyData: CompanyData): string {
    const sections = [
      this.generateHeaderSection(companyData),
      this.generateBasicInfoSection(companyData),
      this.generateLeadershipSection(companyData),
      this.generateFinancialSection(companyData),
      this.generateMarketPositionSection(companyData),
      this.generateRecentDevelopmentsSection(companyData),
      this.generateCultureSection(companyData),
      this.generateSourcesSection(companyData),
      this.generateFooter()
    ];

    return sections.join('\n\n');
  }

  private generateHeaderSection(companyData: CompanyData): string {
    return `# Company Analysis Report: ${companyData.基本信息.company_name}

## 📊 Executive Summary

This comprehensive analysis provides insights into ${companyData.基本信息.company_name}'s business operations, financial performance, market position, and recent developments.`;
  }

  private generateBasicInfoSection(companyData: CompanyData): string {
    return `## 🏢 Basic Information

- **Company Name:** ${companyData.基本信息.company_name}
- **Founded:** ${companyData.基本信息.founded_date || 'Not available'}
- **Headquarters:** ${companyData.基本信息.headquarters || 'Not available'}
- **Website:** ${companyData.基本信息.website || 'Not available'}
- **Industry:** ${companyData.基本信息.industry || 'Not available'}`;
  }

  private generateLeadershipSection(companyData: CompanyData): string {
    const executives = companyData.leadership.key_executives
      .map(exec => `- **${exec.position}:** ${exec.name}`)
      .join('\n') || 'No key executives identified';

    return `## 👥 Leadership

- **CEO:** ${companyData.leadership.ceo || 'Not available'}

### Key Executives
${executives}`;
  }

  private generateFinancialSection(companyData: CompanyData): string {
    return `## 💰 Financial Performance

- **Revenue:** ${companyData.financial.revenue || 'Not available'}
- **Market Cap:** ${companyData.financial.market_cap || 'Not available'}
- **Profit Margin:** ${companyData.financial.profit_margin || 'Not available'}
- **Revenue Growth:** ${companyData.financial.revenue_growth || 'Not available'}`;
  }

  private generateMarketPositionSection(companyData: CompanyData): string {
    const competitors = companyData.market_position.competitors
      .map(comp => `- ${comp}`)
      .join('\n') || 'No competitors identified';

    const customerSegments = companyData.market_position.customer_segments
      .map(seg => `- ${seg}`)
      .join('\n') || 'No customer segments identified';

    return `## 🎯 Market Position

- **Market Share:** ${companyData.market_position.market_share || 'Not available'}

### Competitors
${competitors}

### Customer Segments
${customerSegments}`;
  }

  private generateRecentDevelopmentsSection(companyData: CompanyData): string {
    const developments = companyData.recent_developments
      .map(dev => `- **${dev.date}:** ${dev.description} (${dev.source})`)
      .join('\n') || 'No recent developments identified';

    return `## 📈 Recent Developments

${developments}`;
  }

  private generateCultureSection(companyData: CompanyData): string {
    const benefits = companyData.culture_employment.benefits
      .map(benefit => `- ${benefit}`)
      .join('\n') || 'No benefits information available';

    return `## 🏢 Culture & Employment

- **Employee Satisfaction:** ${companyData.culture_employment.employee_satisfaction || 'Not available'}

### Benefits
${benefits}`;
  }

  private generateSourcesSection(companyData: CompanyData): string {
    const sources = companyData.sources
      .map((source, index) =>
        `${index + 1}. [${source.title}](${source.url}) - ${source.reliability} reliability - Accessed ${new Date(source.access_date).toLocaleDateString()}`
      )
      .join('\n');

    return `## 📚 Sources

${sources}`;
  }

  private generateFooter(): string {
    return `---

*This report was generated automatically using the Deep Research Professional skill. Information accuracy should be verified with official sources.*`;
  }

  private generateCSVReport(companyData: CompanyData): string {
    const headers = ['Category', 'Field', 'Value'];
    const rows = [
      ['Basic Information', 'Company Name', companyData.基本信息.company_name],
      ['Basic Information', 'Founded Date', companyData.基本信息.founded_date],
      ['Basic Information', 'Headquarters', companyData.基本信息.headquarters],
      ['Basic Information', 'Website', companyData.基本信息.website],
      ['Leadership', 'CEO', companyData.leadership.ceo],
      ['Financial', 'Revenue', companyData.financial.revenue],
      ['Financial', 'Market Cap', companyData.financial.market_cap],
      ['Financial', 'Profit Margin', companyData.financial.profit_margin],
      ['Financial', 'Revenue Growth', companyData.financial.revenue_growth],
      ['Market Position', 'Market Share', companyData.market_position.market_share],
      ['Culture', 'Employee Satisfaction', companyData.culture_employment.employee_satisfaction],
    ];

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  close(): void {
    this.webResearcher.close();
    this.db.close();
  }
}

// CLI Interface
const program = new Command();

program
  .name('company-analyzer')
  .description('Comprehensive company research and analysis')
  .version('1.0.0');

program
  .requiredOption('-c, --company <string>', 'Company name to analyze')
  .option('-f, --focus <string>', 'Analysis focus area', 'comprehensive')
  .option('-o, --output <string>', 'Output file')
  .option('--format <string>', 'Output format', 'markdown')
  .action(async options => {
    const analyzer = new CompanyAnalyzer();

    try {
      const analysis = await analyzer.analyzeCompany({
        company: options.company,
        focus: options.focus,
        outputFormat: options.format,
        outputFile: options.output,
      });

      const report = analyzer.generateReport(analysis, options.format);

      if (options.output) {
        await Bun.write(options.output, report);
        console.log(`📄 Company analysis saved to: ${options.output}`);
      } else {
        console.log(report);
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    } finally {
      analyzer.close();
    }
  });

// Execute CLI
if (import.meta.main) {
  program.parse();
}

export { CompanyAnalyzer, type CompanyAnalysisOptions, type CompanyData };
