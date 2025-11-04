/**
 * Data extraction utilities for company analysis
 */

import type { CompanyData, SearchResult } from './company-analyzer';
import { REGEX_PATTERNS } from './constants';

/**
 * Extracts basic company information from search results
 * Uses regex patterns to identify and extract company website, founded date, and headquarters
 * @param {SearchResult} searchResult - The search result containing title and snippet to analyze
 * @param {CompanyData} companyData - The company data object to populate with extracted information
 * @returns {Promise<void>} Promise that resolves when basic information extraction is complete
 */
export async function extractBasicInfo(searchResult: SearchResult, companyData: CompanyData): Promise<void> {
  const text = `${searchResult.title} ${searchResult.snippet}`;

  // Extract website
  const websiteMatch = text.match(REGEX_PATTERNS.WEBSITE);
  if (websiteMatch && !companyData.基本信息.website) {
    companyData.基本信息.website = websiteMatch[0];
  }

  // Extract founded date
  const foundedMatch = text.match(REGEX_PATTERNS.FOUNDED_DATE);
  if (foundedMatch && !companyData.基本信息.founded_date) {
    companyData.基本信息.founded_date = foundedMatch[1] || foundedMatch[2] || foundedMatch[3];
  }

  // Extract headquarters
  const hqMatch = text.match(REGEX_PATTERNS.HEADQUARTERS);
  if (hqMatch && !companyData.基本信息.headquarters) {
    companyData.基本信息.headquarters = (hqMatch[1] || hqMatch[2] || '').replace(/\.$/, '').trim();
  }

  companyData.sources.push({
    url: searchResult.url,
    title: searchResult.title,
    access_date: new Date().toISOString(),
    reliability: 'high',
  });
}

/**
 * Extracts leadership information from search results
 * Uses regex patterns to identify CEO and key executive information
 * @param {SearchResult} searchResult - The search result containing title and snippet to analyze
 * @param {CompanyData} companyData - The company data object to populate with leadership information
 * @returns {Promise<void>} Promise that resolves when leadership information extraction is complete
 */
export async function extractLeadershipInfo(searchResult: SearchResult, companyData: CompanyData): Promise<void> {
  const text = `${searchResult.title} ${searchResult.snippet}`;

  // Extract CEO
  const ceoMatch = text.match(REGEX_PATTERNS.CEO);
  if (ceoMatch && !companyData.leadership.ceo) {
    companyData.leadership.ceo = (ceoMatch[1] || ceoMatch[2] || '').replace(/\.$/, '').trim();
  }

  // Extract key executives
  const executiveMatches = text.match(REGEX_PATTERNS.EXECUTIVES);
  if (executiveMatches) {
    for (const match of executiveMatches) {
      const positionMatch = match.match(/(president|cto|cfo|coo|chief[^,]+?)[\s:]+([^.]+?)\./i);
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

/**
 * Extracts financial information from search results
 * Uses regex patterns to identify revenue, market cap, and other financial metrics
 * @param {SearchResult} searchResult - The search result containing title and snippet to analyze
 * @param {CompanyData} companyData - The company data object to populate with financial information
 * @returns {Promise<void>} Promise that resolves when financial information extraction is complete
 */
export async function extractFinancialInfo(searchResult: SearchResult, companyData: CompanyData): Promise<void> {
  const text = `${searchResult.title} ${searchResult.snippet}`;

  // Extract revenue
  const revenueMatch = text.match(REGEX_PATTERNS.REVENUE);
  if (revenueMatch && !companyData.financial.revenue) {
    const amount = revenueMatch[1] || revenueMatch[2];
    const multiplier = getFinancialMultiplier(text);
    companyData.financial.revenue = `$${amount} ${multiplier}`;
  }

  // Extract market cap
  const marketCapMatch = text.match(REGEX_PATTERNS.MARKET_CAP);
  if (marketCapMatch && !companyData.financial.market_cap) {
    const amount = marketCapMatch[1] || marketCapMatch[2];
    const multiplier = getFinancialMultiplier(text);
    companyData.financial.market_cap = `$${amount} ${multiplier}`;
  }
}

/**
 * Extracts market position information from search results
 * Uses regex patterns to identify competitors, market share, and competitive advantages
 * @param {SearchResult} searchResult - The search result containing title and snippet to analyze
 * @param {CompanyData} companyData - The company data object to populate with market position information
 * @returns {Promise<void>} Promise that resolves when market position information extraction is complete
 */
export async function extractMarketPositionInfo(
  searchResult: SearchResult,
  companyData: CompanyData
): Promise<void> {
  const text = `${searchResult.title} ${searchResult.snippet}`;

  // Extract competitors
  const competitorMatches = text.match(REGEX_PATTERNS.COMPETITORS);
  if (competitorMatches) {
    const competitors = (competitorMatches[1] || competitorMatches[2])
      .split(/[,;]/)
      .map(c => c.trim());
    companyData.market_position.competitors.push(...competitors);
  }

  // Extract market share
  const marketShareMatch = text.match(REGEX_PATTERNS.MARKET_SHARE);
  if (marketShareMatch && !companyData.market_position.market_share) {
    companyData.market_position.market_share = `${marketShareMatch[1] || marketShareMatch[2]}%`;
  }
}

/**
 * Extracts culture and employment information from search results
 * Uses regex patterns to identify employee satisfaction ratings and work environment details
 * @param {SearchResult} searchResult - The search result containing title and snippet to analyze
 * @param {CompanyData} companyData - The company data object to populate with culture and employment information
 * @returns {Promise<void>} Promise that resolves when culture information extraction is complete
 */
export async function extractCultureInfo(searchResult: SearchResult, companyData: CompanyData): Promise<void> {
  const text = `${searchResult.title} ${searchResult.snippet}`;

  // Extract employee satisfaction
  const satisfactionMatch = text.match(REGEX_PATTERNS.SATISFACTION);
  if (satisfactionMatch && !companyData.culture_employment.employee_satisfaction) {
    const rating = satisfactionMatch[1] || satisfactionMatch[2] || satisfactionMatch[3];
    companyData.culture_employment.employee_satisfaction = `${rating}/5`;
  }
}

/**
 * Determines financial multiplier based on text content
 * @param {string} text - Text to search for multiplier indicators
 * @returns {string} Appropriate financial multiplier string
 */
function getFinancialMultiplier(text: string): string {
  if (text.includes('B')) {
    return 'Billion';
  }

  if (text.includes('M')) {
    return 'Million';
  }

  return 'Thousand';
}