/**
 * Constants and utilities for company analysis
 */

export const JSON_INDENTATION = 2;
export const NOT_AVAILABLE = 'Not available';
export const RESEARCH_DEPTH = {
  QUICK: 5,
  COMPREHENSIVE: 8,
  RECENT: 6,
} as const;

export const REGEX_PATTERNS = {
  WEBSITE: /https?:\/\/\S+/,
  FOUNDED_DATE: /founded in (\d{4})|established (\d{4})|since (\d{4})/i,
  HEADQUARTERS: /headquartered in ([^.]+?)\.|based in ([^.]+?)\./i,
  CEO: /ceo[\s:]+([^.]+?)\.|chief executive officer[\s:]+([^.]+?)\./i,
  EXECUTIVES: /(president|cto|cfo|coo|chief[^,]+?)[\s:]+([^.]+?)\./gi,
  REVENUE: /revenue[\s:]+\$([\d.]+)[bkm]|annual revenue[\s:]+\$([\d.]+)[bkm]/i,
  MARKET_CAP: /market cap[\s:]+\$([\d.]+)[bkm]|market capitalization[\s:]+\$([\d.]+)[bkm]/i,
  COMPETITORS: /competitors?[\s:]+([^.]+?)\.|rivals?[\s:]+([^.]+?)\./i,
  MARKET_SHARE: /market share[\s:]+([\d.]+)%|([\d.]+)% market share/i,
  SATISFACTION: /(\d+\.\d+)\/5|(\d+)%.*?recommend|satisfaction[\s:]+(\d+\.\d+)/i,
} as const;
