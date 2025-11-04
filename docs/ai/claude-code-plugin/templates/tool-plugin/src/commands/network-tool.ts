import { Command } from '../types';

/**
 * Network Tool Command
 *
 * Provides network operations for HTTP requests, web scraping, and API calls
 */
export class NetworkToolCommand implements Command {
  private config: any;
  private logger: any;

  /**
   *
   * @param config
   * @param logger
   */
  constructor(config: any, logger: any) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Get command information
   */
  getInfo(): CommandInfo {
    return {
      name: 'network-tool',
      description: 'Network operations for HTTP requests, web scraping, and API calls',
      version: '1.0.0',
      usage: 'network-tool <operation> <url> [options]',
      examples: [
        'network-tool get https://api.example.com/data',
        'network-tool post https://api.example.com/submit --data=\'{"key":"value"}\'',
        'network-tool scrape https://example.com --selector="h1"'
      ]
    };
  }

  /**
   * Execute the network tool command
   * @param args Command arguments
   */
  async execute(args: string[]): Promise<any> {
    const [operation, url, ...options] = args;

    this.validateUrl(url);
    this.logger.debug(`Executing network tool operation: ${operation} on URL: ${url}`);

    switch (operation) {
      case 'get':
        return this.getRequest(url, options);
      case 'post':
        return this.postRequest(url, options);
      case 'put':
        return this.putRequest(url, options);
      case 'delete':
        return this.deleteRequest(url);
      case 'scrape':
        return this.scrapeWebPage(url, options);
      case 'ping':
        return this.pingUrl(url);
      default:
        throw new Error(`Unknown network operation: ${operation}`);
    }
  }

  /**
   * Perform HTTP GET request
   * @param url Target URL
   * @param options Request options
   */
  private async getRequest(url: string, options: string[]): Promise<any> {
    try {
      const headers = this.parseHeaders(options);
      const timeout = this.parseTimeout(options);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      let data: any;

      data = await (contentType.includes('application/json') ? response.json() : response.text());

      this.logger.info(`Successfully performed GET request to: ${url}`);

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        contentType
      };
    } catch (error) {
      this.logger.error(`GET request failed for: ${url}`, error);
      throw error;
    }
  }

  /**
   * Perform HTTP POST request
   * @param url Target URL
   * @param options Request options
   */
  private async postRequest(url: string, options: string[]): Promise<any> {
    try {
      const headers = this.parseHeaders(options);
      const data = this.parseData(options);
      const timeout = this.parseTimeout(options);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: typeof data === 'string' ? data : JSON.stringify(data),
        signal: AbortSignal.timeout(timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      this.logger.info(`Successfully performed POST request to: ${url}`);

      return {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      };
    } catch (error) {
      this.logger.error(`POST request failed for: ${url}`, error);
      throw error;
    }
  }

  /**
   * Perform HTTP PUT request
   * @param url Target URL
   * @param options Request options
   */
  private async putRequest(url: string, options: string[]): Promise<any> {
    try {
      const headers = this.parseHeaders(options);
      const data = this.parseData(options);
      const timeout = this.parseTimeout(options);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: typeof data === 'string' ? data : JSON.stringify(data),
        signal: AbortSignal.timeout(timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      this.logger.info(`Successfully performed PUT request to: ${url}`);

      return {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      };
    } catch (error) {
      this.logger.error(`PUT request failed for: ${url}`, error);
      throw error;
    }
  }

  /**
   * Perform HTTP DELETE request
   * @param url Target URL
   */
  private async deleteRequest(url: string): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.logger.info(`Successfully performed DELETE request to: ${url}`);

      return {
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      this.logger.error(`DELETE request failed for: ${url}`, error);
      throw error;
    }
  }

  /**
   * Scrape web page content
   * @param url Target URL
   * @param options Scraping options
   */
  private async scrapeWebPage(url: string, options: string[]): Promise<any> {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const selector = this.parseSelector(options);

      const scrapedData: any = {
        url,
        title: this.extractTitle(html),
        content: html
      };

      if (selector) {
        scrapedData.selectorResults = this.extractBySelector(html, selector);
      }

      this.logger.info(`Successfully scraped web page: ${url}`);

      return scrapedData;
    } catch (error) {
      this.logger.error(`Web scraping failed for: ${url}`, error);
      throw error;
    }
  }

  /**
   * Ping URL to check availability
   * @param url Target URL
   */
  private async pingUrl(url: string): Promise<any> {
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000)
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.logger.info(`Successfully pinged: ${url} (${responseTime}ms)`);

      return {
        url,
        status: response.status,
        statusText: response.statusText,
        responseTime,
        available: response.ok
      };
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.logger.error(`Ping failed for: ${url}`, error);

      return {
        url,
        available: false,
        responseTime,
        error: error.message
      };
    }
  }

  /**
   * Parse headers from options
   * @param options Command options
   */
  private parseHeaders(options: string[]): Record<string, string> {
    const headers: Record<string, string> = {};

    for (const option of options) {
      if (option.startsWith('--header=')) {
        const [key, value] = option.substring(9).split(':', 2);
        if (key && value) {
          headers[key.trim()] = value.trim();
        }
      }
    }

    return headers;
  }

  /**
   * Parse data from options
   * @param options Command options
   */
  private parseData(options: string[]): any {
    const dataOption = options.find(opt => opt.startsWith('--data='));
    if (!dataOption) {
      return {};
    }

    const dataString = dataOption.substring(7).replace(/^["']|["']$/g, '');

    try {
      return JSON.parse(dataString);
    } catch {
      return dataString;
    }
  }

  /**
   * Parse timeout from options
   * @param options Command options
   */
  private parseTimeout(options: string[]): number {
    const timeoutOption = options.find(opt => opt.startsWith('--timeout='));
    if (timeoutOption) {
      const timeout = Number.parseInt(timeoutOption.substring(10), 10);
      return isNaN(timeout) ? 30000 : timeout;
    }
    return 30000;
  }

  /**
   * Parse CSS selector from options
   * @param options Command options
   */
  private parseSelector(options: string[]): string | null {
    const selectorOption = options.find(opt => opt.startsWith('--selector='));
    return selectorOption ? selectorOption.substring(11).replace(/^["']|["']$/g, '') : null;
  }

  /**
   * Extract title from HTML
   * @param html HTML content
   */
  private extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  /**
   * Extract content by CSS selector
   * @param html HTML content
   * @param selector CSS selector
   */
  private extractBySelector(html: string, selector: string): string[] {
    // This is a simplified implementation
    // In a real implementation, you would use a proper HTML parser
    const results: string[] = [];

    if (selector === 'h1') {
      const matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
      if (matches) {
        for (const match of matches) {
          const content = match.replace(/<[^>]+>/g, '');
          results.push(content.trim());
        }
      }
    }

    return results;
  }

  /**
   * Validate URL for security
   * @param url URL to validate
   */
  private validateUrl(url: string): void {
    if (!url || typeof url !== 'string') {
      throw new Error('URL must be a non-empty string');
    }

    try {
      const parsedUrl = new URL(url);

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS protocols are allowed');
      }

      const isAllowed = this.config.allowedDomains.some((domain: string) => {
        return parsedUrl.hostname === domain || parsedUrl.hostname?.endsWith(`.${domain}`);
      });

      if (!isAllowed) {
        throw new Error(`Domain ${parsedUrl.hostname} is not in the allowed list`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Invalid URL format');
    }
  }
}

interface CommandInfo {
  name: string;
  description: string;
  version: string;
  usage: string;
  examples: string[];
}