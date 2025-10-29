/**
 * URL Skill Loading Utilities
 * Specialized utilities for loading skills from URLs
 */

import { SkillLoadOptions } from './skill-metadata';
import { SkillDefinition } from './types';

/**
 * Utility class for URL-based skill loading
 */
export class UrlSkillLoader {
  /**
   * Fetch data from URL with error handling
   * @param {string} url - URL to fetch
   * @returns {Promise<Response>} HTTP response
   */
  static async fetchFromUrl(url: string): Promise<Response> {
    try {
      return await fetch(url);
    } catch (networkError) {
      throw new Error(
        `Network error when fetching skill from ${url}: ${networkError instanceof Error ? networkError.message : 'Unknown network error'}`
      );
    }
  }

  /**
   * Validate HTTP response status
   * @param {Response} response - HTTP response
   */
  static validateResponse(response: Response): void {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Read and validate response content type
   * @param {Response} response - HTTP response
   * @param {string} url - URL for error reporting
   * @returns {Promise<string>} Response text
   */
  static async readResponseText(response: Response, url: string): Promise<string> {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Unsupported content type: ${contentType}. Expected application/json.`);
    }

    try {
      return await response.text();
    } catch (readError) {
      throw new Error(
        `Failed to read response from ${url}: ${readError instanceof Error ? readError.message : 'Unknown read error'}`
      );
    }
  }

  /**
   * Validate response content is not empty
   * @param {string} skillData - Response data
   * @param {string} url - URL for error reporting
   */
  static validateResponseContent(skillData: string, url: string): void {
    if (!skillData.trim()) {
      throw new Error(`Empty response from ${url}`);
    }
  }

  /**
   * Parse skill data from JSON with metadata enhancement
   * @param {string} skillData - JSON skill data
   * @param {string} url - Source URL
   * @param {SkillLoadOptions} options - Loading options
   * @returns {SkillDefinition} Parsed skill definition
   */
  static parseSkillData(
    skillData: string,
    url: string,
    options: SkillLoadOptions
  ): SkillDefinition {
    try {
      const skillDefinition = JSON.parse(skillData) as SkillDefinition;

      if (!options.skipValidation) {
        this.addUrlMetadata(skillDefinition, url);
      }

      return skillDefinition;
    } catch (parseError) {
      throw new Error(
        `Failed to parse skill definition from ${url}: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`
      );
    }
  }

  /**
   * Add URL source metadata to skill definition
   * @param {SkillDefinition} skillDefinition - Skill definition to enhance
   * @param {string} url - Source URL
   */
  static addUrlMetadata(skillDefinition: SkillDefinition, url: string): void {
    if (!skillDefinition.metadata) {
      skillDefinition.metadata = {
        createdAt: new Date(),
        updatedAt: new Date(),
        loadedAt: new Date(),
        author: 'Unknown',
        versionHistory: [],
        tags: [],
        relatedSkills: {},
        resources: [],
      };
    }
    skillDefinition.metadata.source = url;
    skillDefinition.metadata.loadedAt = new Date();
  }
}
