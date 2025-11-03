import Handlebars from "handlebars";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { getTemplate } from "./registry";
import { TemplateCache } from "./utils/cache";

export class TemplateManager {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();
  private cache: TemplateCache;

  constructor(options: { maxSize?: number; ttl?: number } = {}) {
    this.cache = new TemplateCache(options.maxSize, options.ttl);
  }

  async initialize(): Promise<void> {
    await this.registerBunHelpers();
    await this.loadTemplates();
  }

  private async registerBunHelpers(): Promise<void> {
    Handlebars.registerHelper("bun-import", (pkg: string) => {
      if (!pkg) return "bun:unknown";
      return pkg.startsWith("bun:") ? pkg : `bun:${pkg}`;
    });

    Handlebars.registerHelper("bun-class", (name: string) => {
      return name
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
    });

    Handlebars.registerHelper("bun-filename", (name: string) => {
      return name
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase()
        .replace(/^-/, "");
    });

    Handlebars.registerHelper(
      "ifBunFeature",
      (feature: string, options: any) => {
        const bunFeatures = ["sqlite", "serve", "file", "test"];
        return bunFeatures.includes(feature)
          ? options.fn(this)
          : options.inverse(this);
      },
    );
  }

  compile(templateString: string): HandlebarsTemplateDelegate {
    return Handlebars.compile(templateString);
  }

  private async loadTemplates(): Promise<void> {
    const templatesDir = join(process.cwd(), "templates");

    const files = await readdir(templatesDir);
    const templateFiles = files.filter((file) => file.endsWith(".hbs"));

    for (const file of templateFiles) {
      const templatePath = join(templatesDir, file);
      const templateContent = await readFile(templatePath, "utf-8");
      const templateName = file.replace(".hbs", "");

      // Check cache first
      let compiled = this.cache.get(templateName);

      if (!compiled) {
        compiled = Handlebars.compile(templateContent);
        this.cache.set(templateName, compiled);
      }

      this.templates.set(templateName, compiled);
    }
  }

  async generate(
    templateId: string,
    variables: Record<string, any>,
  ): Promise<string> {
    const templateDef = getTemplate(templateId);
    if (!templateDef) {
      throw new Error(`Template '${templateId}' not found in registry`);
    }

    const templateName = templateDef.templatePath
      .replace("templates/", "")
      .replace(".hbs", "");
    const template = this.templates.get(templateName);

    if (!template) {
      throw new Error(`Template '${templateName}' not loaded`);
    }

    return template(variables);
  }
}
