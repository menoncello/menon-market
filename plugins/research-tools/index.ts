/**
 * Research Tools Plugin for Claude Code
 *
 * A comprehensive research tools plugin with advanced data analysis
 * and deep research capabilities for academic and professional workflows.
 *
 * @author Eduardo Menoncello
 * @version 1.0.0
 * @license MIT
 */

export interface ResearchToolsConfig {
  enableDeepResearch: boolean;
  maxSources: number;
  outputFormat: 'markdown' | 'json' | 'html';
}

export const defaultConfig: ResearchToolsConfig = {
  enableDeepResearch: true,
  maxSources: 50,
  outputFormat: 'markdown'
};

/**
 * Main research tools plugin initialization
 */
export function initialize(config: Partial<ResearchToolsConfig> = {}): ResearchToolsConfig {
  return { ...defaultConfig, ...config };
}

/**
 * Plugin metadata for Claude Code
 */
export const pluginMetadata = {
  name: 'research-tools',
  version: '1.0.0',
  description: 'Comprehensive research tools plugin with advanced data analysis and deep research capabilities',
  author: 'Eduardo Menoncello',
  license: 'MIT',
  repository: 'https://github.com/menoncello/menon-marketplace.git'
};

export default {
  initialize,
  defaultConfig,
  pluginMetadata
};