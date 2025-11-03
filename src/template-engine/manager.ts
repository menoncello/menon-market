import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import Handlebars from 'handlebars';
import { getTemplate } from './registry';
import { TemplateCache } from './utils/cache';

/**
 * Manages Handlebars templates for the Bun template engine, providing compilation,
 * caching, and generation capabilities with built-in Bun-specific helper functions.
 */
export class TemplateManager {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();
  private cache: TemplateCache;

  /**
   * Creates a new TemplateManager instance with optional cache configuration.
   *
   * @param {object} options - Configuration options for the template manager
   * @param {number} [options.maxSize] - Maximum number of templates to cache in memory (default: 100)
   * @param {number} [options.ttl] - Time to live for cached templates in milliseconds (default: 300000)
   */
  constructor(options: { maxSize?: number; ttl?: number } = {}) {
    this.cache = new TemplateCache(options.maxSize, options.ttl);
  }

  /**
   * Initializes the template manager by registering Bun-specific helper functions
   * and loading all available templates from the templates directory.
   */
  async initialize(): Promise<void> {
    await this.registerBunHelpers();
    await this.loadTemplates();
  }

  /**
   * Registers Bun-specific Handlebars helper functions for template generation.
   * Includes helpers for Bun imports, class naming, filename formatting, and feature detection.
   */
  private async registerBunHelpers(): Promise<void> {
    Handlebars.registerHelper('bun-import', (pkg: string): string => {
      if (!pkg) return 'bun:unknown';
      return pkg.startsWith('bun:') ? pkg : `bun:${pkg}`;
    });

    Handlebars.registerHelper('bun-class', (name: string): string => {
      return name
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
    });

    Handlebars.registerHelper('bun-filename', (name: string): string => {
      return name
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
    });

    Handlebars.registerHelper(
      'ifBunFeature',
      (feature: string, options: Handlebars.HelperOptions): string => {
        const bunFeatures = ['sqlite', 'serve', 'file', 'test'];
        return bunFeatures.includes(feature) ? options.fn(this) : options.inverse(this);
      }
    );
  }

  /**
   * Compiles a Handlebars template string into a reusable template function.
   *
   * @param {string} templateString - The Handlebars template string to compile
   * @returns {HandlebarsTemplateDelegate} A compiled Handlebars template delegate function
   */
  compile(templateString: string): HandlebarsTemplateDelegate {
    return Handlebars.compile(templateString);
  }

  /**
   * Loads all Handlebars template files from the templates directory,
   * compiles them, and stores them in the internal cache for efficient reuse.
   */
  private async loadTemplates(): Promise<void> {
    const templatesDir = join(process.cwd(), 'src', 'template-engine', 'templates');

    const files = await readdir(templatesDir);
    const templateFiles = files.filter(file => file.endsWith('.hbs'));

    for (const file of templateFiles) {
      const templatePath = join(templatesDir, file);
      const templateContent = await readFile(templatePath, 'utf-8');
      const templateName = file.replace('.hbs', '');

      // Check cache first
      let compiled = this.cache.get(templateName);

      if (!compiled) {
        compiled = Handlebars.compile(templateContent);
        this.cache.set(templateName, compiled);
      }

      this.templates.set(templateName, compiled);
    }
  }

  /**
   * Generates content using a registered template with the provided variables.
   *
   * @param {string} templateId - The identifier of the template to use from the registry
   * @param {Record<string, unknown>} variables - Key-value pairs of variables to substitute in the template
   * @returns {Promise<string>} The generated content as a string
   * @throws {Error} if the template is not found in the registry or not loaded
   */
  async generate(templateId: string, variables: Record<string, unknown>): Promise<string> {
    const templateDef = getTemplate(templateId);
    if (!templateDef) {
      throw new Error(`Template '${templateId}' not found in registry`);
    }

    const templateName = templateDef.templatePath.replace('templates/', '').replace('.hbs', '');
    const template = this.templates.get(templateName);

    if (!template) {
      throw new Error(`Template '${templateName}' not loaded`);
    }

    return template(variables);
  }
}
