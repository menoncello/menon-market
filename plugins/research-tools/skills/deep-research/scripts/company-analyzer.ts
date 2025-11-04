#!/usr/bin/env bun

/* Company Analyzer - Comprehensive company research and analysis */

import { Database } from 'bun:sqlite';
import { Command } from 'commander';
import {
  gatherBasicInfo,
  gatherFoundationInfo,
  gatherFinancialInfo,
  gatherMarketPositionInfo,
  gatherCultureInfo,
  gatherRecentDevelopments,
} from './company-gatherers';
import { JSON_INDENTATION } from './constants';
import {
  generateHeaderSection,
  generateBasicInfoSection,
  generateLeadershipSection,
  generateFinancialSection,
  generateMarketPositionSection,
  generateRecentDevelopmentsSection,
  generateCultureSection,
  generateSourcesSection,
  generateFooter,
} from './report-generators';
import { WebResearcher } from './web-researcher';

const logger = {
  log: (message: string) => Bun.write(Bun.stdout, `${message}\n`),
  warn: (message: string) => Bun.write(Bun.stderr, `${message}\n`),
  error: (message: string) => Bun.write(Bun.stderr, `${message}\n`),
};

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
  leadership: { ceo: string; key_executives: Array<{ name: string; position: string; experience: string }> };
  financial: { revenue: string; market_cap: string; profit_margin: string; revenue_growth: string };
  market_position: { market_share: string; competitors: string[]; customer_segments: string[]; geographic_presence: string[] };
  recent_developments: Array<{ date: string; type: string; description: string; source: string }>;
  culture_employment: { employee_satisfaction: string; benefits: string[]; work_life_balance: string; diversity_initiatives: string[] };
  sources: Array<{ url: string; title: string; access_date: string; reliability: string }>;
};

/** Company Analyzer class */
class CompanyAnalyzer {
  private webResearcher: WebResearcher;
  private db: Database;

  /** Creates a new CompanyAnalyzer instance */
  constructor() {
    this.webResearcher = new WebResearcher();
    this.db = new Database('company_analysis.db');
    this.initializeDatabase();
  }

  /** Initialize database */
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

  /** Performs comprehensive company analysis
   * @param {CompanyAnalysisOptions} options - Analysis configuration including company name and focus area
   * @returns {Promise<CompanyData>} Promise that resolves to complete company analysis data
   */
  async analyzeCompany(options: CompanyAnalysisOptions): Promise<CompanyData> {
    logger.log(`🏢 Starting company analysis for: ${options.company}`);
    logger.log(`📊 Focus area: ${options.focus}`);

    try {
      const companyData = this.initializeCompanyData(options.company);

      // Gather information based on focus
      await this.gatherFocusSpecificInfo(options.focus, companyData);

      // Save analysis to database
      this.saveAnalysis(options.company, options.focus, companyData);

      logger.log(`✅ Company analysis completed for ${options.company}`);
      return companyData;
    } catch (error) {
      logger.error('❌ Company analysis failed:', error);
      throw error;
    }
  }

  /**
   * Initialize company data
   * @param {string} companyName - The name of the company to analyze
   * @returns {CompanyData} A new CompanyData structure with default values
   */
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
      leadership: { ceo: '', key_executives: [] },
      financial: { revenue: '', market_cap: '', profit_margin: '', revenue_growth: '' },
      market_position: { market_share: '', competitors: [], customer_segments: [], geographic_presence: [] },
      recent_developments: [],
      culture_employment: { employee_satisfaction: '', benefits: [], work_life_balance: '', diversity_initiatives: [] },
      sources: [],
    };
  }

  /**
   * Gather focus-specific information
   * @param {string} focus - The analysis focus area (foundation, financial, market-position, comprehensive)
   * @param {CompanyData} companyData - The company data object to populate with gathered information
   * @returns {Promise<void>} Promise that resolves when focus-specific information gathering is complete
   */
  private async gatherFocusSpecificInfo(focus: string, companyData: CompanyData): Promise<void> {
    switch (focus) {
      case 'foundation':
        await this.gatherFoundationData(companyData);
        break;
      case 'financial':
        await this.gatherFinancialData(companyData);
        break;
      case 'market-position':
        await this.gatherMarketPositionData(companyData);
        break;
      case 'comprehensive':
        await this.gatherFoundationData(companyData);
        await this.gatherFinancialData(companyData);
        await this.gatherMarketPositionData(companyData);
        await this.gatherCultureData(companyData);
        break;
    }
  }

  /**
   * Gather foundation data
   * @param {CompanyData} companyData - The company data object to populate with foundation information
   * @returns {Promise<void>} Promise that resolves when foundation data gathering is complete
   */
  private async gatherFoundationData(companyData: CompanyData): Promise<void> {
    await gatherBasicInfo(this.webResearcher, companyData);
    await gatherFoundationInfo(this.webResearcher, companyData);
    await gatherRecentDevelopments(this.webResearcher, companyData);
  }

  /**
   * Gather financial data
   * @param {CompanyData} companyData - The company data object to populate with financial information
   * @returns {Promise<void>} Promise that resolves when financial data gathering is complete
   */
  private async gatherFinancialData(companyData: CompanyData): Promise<void> {
    await gatherBasicInfo(this.webResearcher, companyData);
    await gatherFinancialInfo(this.webResearcher, companyData);
    await gatherRecentDevelopments(this.webResearcher, companyData);
  }

  /**
   * Gathers market position data for the company
   * @param {CompanyData} companyData - The company data object to populate with market position information
   * @returns {Promise<void>} Promise that resolves when market position data gathering is complete
   */
  private async gatherMarketPositionData(companyData: CompanyData): Promise<void> {
    await gatherBasicInfo(this.webResearcher, companyData);
    await gatherMarketPositionInfo(this.webResearcher, companyData);
    await gatherRecentDevelopments(this.webResearcher, companyData);
  }

  /**
   * Gathers culture data for the company
   * @param {CompanyData} companyData - The company data object to populate with culture and employment information
   * @returns {Promise<void>} Promise that resolves when culture data gathering is complete
   */
  private async gatherCultureData(companyData: CompanyData): Promise<void> {
    await gatherCultureInfo(this.webResearcher, companyData);
  }

  /**
   * Saves the completed company analysis to the database
   * @param {string} companyName - The name of the company being analyzed
   * @param {string} focus - The analysis focus area (foundation, financial, market-position, comprehensive)
   * @param {CompanyData} data - The complete company analysis data to save
   * @returns {void}
   */
  private saveAnalysis(companyName: string, focus: string, data: CompanyData): void {
    this.db.run(
      'INSERT OR REPLACE INTO company_analyses (company_name, analysis_focus, analysis_data) VALUES (?, ?, ?)',
      [companyName, focus, JSON.stringify(data, null, JSON_INDENTATION)]
    );
  }

  /**
   * Generates a formatted report from the company analysis data
   * @param {CompanyData} companyData - The complete company analysis data
   * @param {string} format - The output format (markdown, json, csv)
   * @returns {string} The formatted report as a string
   */
  generateReport(companyData: CompanyData, format = 'markdown'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(companyData, null, JSON_INDENTATION);
      case 'csv':
        return this.generateCSVReport(companyData);
      case 'markdown':
      default:
        return this.generateMarkdownReport(companyData);
    }
  }

  /**
   * Generates a comprehensive Markdown report from company analysis data
   * @param {CompanyData} companyData - The complete company analysis data
   * @returns {string} The formatted Markdown report as a string
   */
  private generateMarkdownReport(companyData: CompanyData): string {
    const sections = [
      generateHeaderSection(companyData),
      generateBasicInfoSection(companyData),
      generateLeadershipSection(companyData),
      generateFinancialSection(companyData),
      generateMarketPositionSection(companyData),
      generateRecentDevelopmentsSection(companyData),
      generateCultureSection(companyData),
      generateSourcesSection(companyData),
      generateFooter()
    ];

    return sections.join('\n\n');
  }

  /**
   * Generates a CSV report from company analysis data
   * @param {CompanyData} companyData - The complete company analysis data
   * @returns {string} The formatted CSV report as a string
   */
  private generateCSVReport(companyData: CompanyData): string {
    const headers = ['Category', 'Field', 'Value'];
    const rows = [
      ['Basic Information', 'Company Name', companyData.基本信息.company_name],
      ['Financial', 'Revenue', companyData.financial.revenue],
      ['Market Position', 'Market Share', companyData.market_position.market_share],
    ];

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  /**
   * Closes the analyzer and cleans up resources
   */
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
        logger.log(`📄 Company analysis saved to: ${options.output}`);
      } else {
        logger.log(report);
      }
    } catch (error) {
      logger.error('❌ Error:', (error as Error).message);
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