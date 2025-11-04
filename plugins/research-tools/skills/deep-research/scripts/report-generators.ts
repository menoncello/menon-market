/**
 * Report generation utilities for company analysis
 */

import type { CompanyData } from './company-analyzer';
import { NOT_AVAILABLE } from './constants';

/**
 * Generates the header section of the Markdown report
 * Creates the title and executive summary for the company analysis report
 * @param {CompanyData} companyData - The company analysis data containing the company name
 * @returns {string} A formatted Markdown string for the report header section
 */
export function generateHeaderSection(companyData: CompanyData): string {
  return `# Company Analysis Report: ${companyData.基本信息.company_name}

## 📊 Executive Summary

This comprehensive analysis provides insights into ${companyData.基本信息.company_name}'s business operations, financial performance, market position, and recent developments.`;
}

/**
 * Generates the basic information section of the Markdown report
 * Creates a formatted section with company name, founding date, headquarters, and website
 * @param {CompanyData} companyData - The company analysis data containing basic company information
 * @returns {string} A formatted Markdown string for the basic information section
 */
export function generateBasicInfoSection(companyData: CompanyData): string {
  return `## 🏢 Basic Information

- **Company Name:** ${companyData.基本信息.company_name}
- **Founded:** ${companyData.基本信息.founded_date || NOT_AVAILABLE}
- **Headquarters:** ${companyData.基本信息.headquarters || NOT_AVAILABLE}
- **Website:** ${companyData.基本信息.website || NOT_AVAILABLE}
- **Industry:** ${companyData.基本信息.industry || NOT_AVAILABLE}`;
}

/**
 * Generates the leadership section of the Markdown report
 * Creates a formatted section with CEO and key executives information
 * @param {CompanyData} companyData - The company analysis data containing leadership information
 * @returns {string} A formatted Markdown string for the leadership section
 */
export function generateLeadershipSection(companyData: CompanyData): string {
  const executives = companyData.leadership.key_executives
    .map(exec => `- **${exec.position}:** ${exec.name}`)
    .join('\n') || 'No key executives identified';

  return `## 👥 Leadership

- **CEO:** ${companyData.leadership.ceo || NOT_AVAILABLE}

### Key Executives
${executives}`;
}

/**
 * Generates the financial performance section of the Markdown report
 * Creates a formatted section with revenue, market cap, profit margin, and growth data
 * @param {CompanyData} companyData - The company analysis data containing financial information
 * @returns {string} A formatted Markdown string for the financial performance section
 */
export function generateFinancialSection(companyData: CompanyData): string {
  return `## 💰 Financial Performance

- **Revenue:** ${companyData.financial.revenue || NOT_AVAILABLE}
- **Market Cap:** ${companyData.financial.market_cap || NOT_AVAILABLE}
- **Profit Margin:** ${companyData.financial.profit_margin || NOT_AVAILABLE}
- **Revenue Growth:** ${companyData.financial.revenue_growth || NOT_AVAILABLE}`;
}

/**
 * Generates the market position section of the Markdown report
 * Creates a formatted section with market share, competitors, and customer segments
 * @param {CompanyData} companyData - The company analysis data containing market position information
 * @returns {string} A formatted Markdown string for the market position section
 */
export function generateMarketPositionSection(companyData: CompanyData): string {
  const competitors = companyData.market_position.competitors
    .map(comp => `- ${comp}`)
    .join('\n') || 'No competitors identified';

  const customerSegments = companyData.market_position.customer_segments
    .map(seg => `- ${seg}`)
    .join('\n') || 'No customer segments identified';

  return `## 🎯 Market Position

- **Market Share:** ${companyData.market_position.market_share || NOT_AVAILABLE}

### Competitors
${competitors}

### Customer Segments
${customerSegments}`;
}

/**
 * Generates the recent developments section of the Markdown report
 * Creates a formatted section with recent news, partnerships, and company developments
 * @param {CompanyData} companyData - The company analysis data containing recent developments information
 * @returns {string} A formatted Markdown string for the recent developments section
 */
export function generateRecentDevelopmentsSection(companyData: CompanyData): string {
  const developments = companyData.recent_developments
    .map(dev => `- **${dev.date}:** ${dev.description} (${dev.source})`)
    .join('\n') || 'No recent developments identified';

  return `## 📈 Recent Developments

${developments}`;
}

/**
 * Generates the culture and employment section of the Markdown report
 * Creates a formatted section with employee satisfaction and benefits information
 * @param {CompanyData} companyData - The company analysis data containing culture and employment information
 * @returns {string} A formatted Markdown string for the culture and employment section
 */
export function generateCultureSection(companyData: CompanyData): string {
  const benefits = companyData.culture_employment.benefits
    .map(benefit => `- ${benefit}`)
    .join('\n') || 'No benefits information available';

  return `## 🏢 Culture & Employment

- **Employee Satisfaction:** ${companyData.culture_employment.employee_satisfaction || NOT_AVAILABLE}

### Benefits
${benefits}`;
}

/**
 * Generates the sources section of the Markdown report
 * Creates a formatted section listing all sources used in the analysis with reliability ratings
 * @param {CompanyData} companyData - The company analysis data containing sources information
 * @returns {string} A formatted Markdown string for the sources section
 */
export function generateSourcesSection(companyData: CompanyData): string {
  const sources = companyData.sources
    .map((source, index) =>
      `${index + 1}. [${source.title}](${source.url}) - ${source.reliability} reliability - Accessed ${new Date(source.access_date).toLocaleDateString()}`
    )
    .join('\n');

  return `## 📚 Sources

${sources}`;
}

/**
 * Generates the footer section of the Markdown report
 * Creates a disclaimer and attribution for the automatically generated report
 * @returns {string} A formatted Markdown string for the report footer section
 */
export function generateFooter(): string {
  return `---

*This report was generated automatically using the Deep Research Professional skill. Information accuracy should be verified with official sources.*`;
}

/**
 * Generates a CSV report from company analysis data
 * Creates a tabular format with key company information organized by category
 * @param {CompanyData} companyData - The complete company analysis data to format into CSV
 * @returns {string} A formatted CSV string containing the company analysis data
 */
export function generateCSVReport(companyData: CompanyData): string {
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