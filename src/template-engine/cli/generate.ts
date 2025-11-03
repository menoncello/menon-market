#!/usr/bin/env bun

import { Command } from "commander";
import { TemplateManager } from "../manager";
import { getTemplate, TEMPLATES } from "../registry";
import { validateConfig } from "../config/template-config";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const program = new Command();

program
  .name("template-generator")
  .description("Bun-first template generator for Claude Code plugins")
  .version("1.0.0");

program
  .command("generate <template-id>")
  .description("Generate template with provided variables")
  .option("-n, --name <name>", "Plugin name")
  .option("-a, --author <author>", "Plugin author")
  .option("-v, --version <version>", "Plugin version")
  .option("-o, --output <path>", "Output directory", "./generated")
  .option("-d, --description <description>", "Plugin description")
  .action(async (templateId, options) => {
    try {
      const template = getTemplate(templateId);
      if (!template) {
        console.error(`❌ Template '${templateId}' not found`);
        console.log("Available templates:");
        TEMPLATES.forEach((t) => {
          console.log(`  ${t.id}: ${t.name}`);
        });
        process.exit(1);
      }

      // Build variables from CLI options
      const variables = {
        PLUGIN_NAME: options.name,
        AUTHOR: options.author,
        VERSION: options.version,
        description: options.description || `${options.name} deployment script`,
        currentDate: new Date().toISOString(),
        className: options.name
          .split("-")
          .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(""),
        databaseType: "sqlite",
      };

      // Validate required variables
      const validation = validateConfig(variables);
      if (!validation.success) {
        console.error("❌ Configuration validation failed:");
        validation.errors?.forEach((error) => console.error(`  - ${error}`));
        process.exit(1);
      }

      // Initialize template manager
      const manager = new TemplateManager();
      await manager.initialize();

      // Generate template
      const result = await manager.generate(templateId, variables);

      // Write to file
      const outputPath = join(options.output, template.outputPath);
      writeFileSync(outputPath, result);

      console.log(`✅ Generated ${templateId} template at ${outputPath}`);
    } catch (error: any) {
      console.error("❌ Generation failed:", error.message);
      process.exit(1);
    }
  });

// Add list command
program
  .command("list")
  .description("List available templates")
  .action(() => {
    console.log("Available templates:");
    TEMPLATES.forEach((template) => {
      console.log(`  ${template.id}: ${template.name} (${template.category})`);
      console.log(`    ${template.description}`);
      console.log(
        `    Required variables: ${template.requiredVars.join(", ")}`,
      );
      console.log("");
    });
  });

if (import.meta.main) {
  program.parse();
}

export { program };
