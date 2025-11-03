import Handlebars from "handlebars";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export class TemplateManager {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  async initialize(): Promise<void> {
    await this.registerBunHelpers();
    await this.loadTemplates();
  }

  private async registerBunHelpers(): Promise<void> {
    Handlebars.registerHelper('bun-import', (pkg: string) => {
      return pkg.startsWith('bun:') ? pkg : `bun:${pkg}`;
    });

    Handlebars.registerHelper('bun-class', (name: string) => {
      return name.split('-').map(part =>
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join('');
    });

    Handlebars.registerHelper('bun-filename', (name: string) => {
      return name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    });

    Handlebars.registerHelper('ifBunFeature', (feature: string, options: any) => {
      const bunFeatures = ['sqlite', 'serve', 'file', 'test'];
      return bunFeatures.includes(feature) ? options.fn(this) : options.inverse(this);
    });
  }

  compile(templateString: string): HandlebarsTemplateDelegate {
    return Handlebars.compile(templateString);
  }

  private async loadTemplates(): Promise<void> {
    // Template loading will be implemented later
    // For now, this method is just a placeholder
  }

  async generate(templateId: string, variables: Record<string, any>): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template '${templateId}' not found`);
    }
    return template(variables);
  }
}