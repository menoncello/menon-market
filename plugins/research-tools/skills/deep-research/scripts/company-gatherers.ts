/**
 * Data gathering utilities for company analysis
 */

import type { CompanyData, SearchResult } from './company-analyzer';
import { RESEARCH_DEPTH } from './constants';
import {
  extractBasicInfo,
  extractLeadershipInfo,
  extractFinancialInfo,
  extractMarketPositionInfo,
  extractCultureInfo,
} from './data-extractors';
import type { WebResearcher } from './web-researcher';

const logger = {
  log: (message: string) => Bun.write(Bun.stdout, `${message}\n`),
  warn: (message: string) => Bun.write(Bun.stderr, `${message}\n`),
  error: (message: string) => Bun.write(Bun.stderr, `${message}\n`),
};

/**
 * Gathers basic company information from multiple sources
 * @param webResearcher
 * @param companyData
 */
export async function gatherBasicInfo(
  webResearcher: WebResearcher,
  companyData: CompanyData
): Promise<void> {
  const queries = [
    `${companyData.基本信息.company_name} company profile Wikipedia`,
    `${companyData.基本信息.company_name} about us official website`,
    `${companyData.基本信息.company_name} company information Crunchbase`,
  ];

  for (const query of queries) {
    try {
      const results = await webResearcher.performResearch({
        query,
        depth: 'quick',
        maxResults: RESEARCH_DEPTH.QUICK,
      });

      for (const result of results) {
        await extractBasicInfo(result, companyData);
      }
    } catch {
      logger.warn(`⚠️  Failed to gather basic info for query: ${query}`);
    }
  }
}

/**
 * Gathers foundational company information including leadership and business model
 * @param webResearcher
 * @param companyData
 */
export async function gatherFoundationInfo(
  webResearcher: WebResearcher,
  companyData: CompanyData
): Promise<void> {
  const queries = [
    `${companyData.基本信息.company_name} CEO leadership team`,
    `${companyData.基本信息.company_name} mission vision values`,
    `${companyData.基本信息.company_name} business model revenue streams`,
  ];

  for (const query of queries) {
    try {
      const results = await webResearcher.performResearch({
        query,
        depth: 'comprehensive',
        maxResults: RESEARCH_DEPTH.COMPREHENSIVE,
      });

      for (const result of results) {
        await extractLeadershipInfo(result, companyData);
      }
    } catch {
      logger.warn(`⚠️  Failed to gather foundation info for query: ${query}`);
    }
  }
}

/**
 * Gathers financial information about the company
 * @param webResearcher
 * @param companyData
 */
export async function gatherFinancialInfo(
  webResearcher: WebResearcher,
  companyData: CompanyData
): Promise<void> {
  const queries = [
    `${companyData.基本信息.company_name} annual revenue financial results`,
    `${companyData.基本信息.company_name} market cap stock price`,
    `${companyData.基本信息.company_name} financial performance profit margin`,
    `${companyData.基本信息.company_name} revenue growth quarterly results`,
  ];

  for (const query of queries) {
    try {
      const results = await webResearcher.performResearch({
        query,
        depth: 'comprehensive',
        maxResults: RESEARCH_DEPTH.COMPREHENSIVE + RESEARCH_DEPTH.QUICK,
      });

      for (const result of results) {
        await extractFinancialInfo(result, companyData);
      }
    } catch {
      logger.warn(`⚠️  Failed to gather financial info for query: ${query}`);
    }
  }
}

/**
 * Gathers market position information about the company
 * @param webResearcher
 * @param companyData
 */
export async function gatherMarketPositionInfo(
  webResearcher: WebResearcher,
  companyData: CompanyData
): Promise<void> {
  const queries = [
    `${companyData.基本信息.company_name} market share competitors`,
    `${companyData.基本信息.company_name} customer base target market`,
    `${companyData.基本信息.company_name} competitive advantages differentiation`,
    `${companyData.基本信息.company_name} industry ranking position`,
  ];

  for (const query of queries) {
    try {
      const results = await webResearcher.performResearch({
        query,
        depth: 'comprehensive',
        maxResults: RESEARCH_DEPTH.COMPREHENSIVE,
      });

      for (const result of results) {
        await extractMarketPositionInfo(result, companyData);
      }
    } catch {
      logger.warn(`⚠️  Failed to gather market position info for query: ${query}`);
    }
  }
}

/**
 * Gathers company culture and employment information
 * @param webResearcher
 * @param companyData
 */
export async function gatherCultureInfo(
  webResearcher: WebResearcher,
  companyData: CompanyData
): Promise<void> {
  const queries = [
    `${companyData.基本信息.company_name} employee reviews Glassdoor`,
    `${companyData.基本信息.company_name} company culture work life balance`,
    `${companyData.基本信息.company_name} benefits compensation packages`,
    `${companyData.基本信息.company_name} diversity inclusion initiatives`,
  ];

  for (const query of queries) {
    try {
      const results = await webResearcher.performResearch({
        query,
        depth: 'comprehensive',
        maxResults: RESEARCH_DEPTH.RECENT,
      });

      for (const result of results) {
        await extractCultureInfo(result, companyData);
      }
    } catch {
      logger.warn(`⚠️  Failed to gather culture info for query: ${query}`);
    }
  }
}

/**
 * Gathers recent developments and news about the company
 * @param webResearcher
 * @param companyData
 */
export async function gatherRecentDevelopments(
  webResearcher: WebResearcher,
  companyData: CompanyData
): Promise<void> {
  const queries = [
    `${companyData.基本信息.company_name} recent news 2024`,
    `${companyData.基本信息.company_name} latest developments`,
    `${companyData.基本信息.company_name} partnerships acquisitions 2024`,
  ];

  for (const query of queries) {
    try {
      const results = await webResearcher.performResearch({
        query,
        depth: 'recent',
        maxResults: RESEARCH_DEPTH.QUICK,
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
      logger.warn(`⚠️  Failed to gather recent developments for query: ${query}`);
    }
  }
}