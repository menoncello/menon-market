#!/usr/bin/env bun

/**
 * Report Generator - Automated report generation from research data
 * Generates professional research reports in various formats
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface ReportGenerationOptions {
  template: string;
  input: string;
  output?: string;
  format?: 'markdown' | 'html' | 'pdf' | 'docx';
  includeExecutiveSummary?: boolean;
  includeAppendix?: boolean;
}

interface ReportData {
  title: string;
  author?: string;
  date: string;
  sections: Array<{
    title: string;
    content: string;
    subsections?: Array<{
      title: string;
      content: string;
    }>;
  }>;
  metadata?: {
    research_objectives: string;
    methodology: string;
    sources: Array<{
      title: string;
      url: string;
      access_date: string;
      reliability: string;
    }>;
    limitations: string[];
  };
}

class ReportGenerator {
  private readonly templateDir = join(__dirname, '..', 'assets', 'report-templates');

  async generateReport(options: ReportGenerationOptions): Promise<string> {
    console.log(`📝 Generating report using template: ${options.template}`);
    console.log(`📊 Input data: ${options.input}`);

    try {
      // Load research data
      const researchData = this.loadResearchData(options.input);

      // Load template
      const template = this.loadTemplate(options.template);

      // Generate report
      const report = this.processTemplate(template, researchData, options);

      // Save report
      if (options.output) {
        await Bun.write(options.output, report);
        console.log(`📄 Report saved to: ${options.output}`);
      }

      return report;

    } catch (error) {
      console.error('❌ Report generation failed:', error);
      throw error;
    }
  }

  private loadResearchData(inputPath: string): ReportData {
    try {
      const data = readFileSync(inputPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to load research data from ${inputPath}: ${error.message}`);
    }
  }

  private loadTemplate(templateName: string): string {
    const templatePath = join(this.templateDir, `${templateName}.md`);

    try {
      return readFileSync(templatePath, 'utf-8');
    } catch (error) {
      // Fallback to default template
      return this.getDefaultTemplate();
    }
  }

  private getDefaultTemplate(): string {
    return `
# {{title}}

{{#if author}}
**Author:** {{author}}
{{/if}}
**Date:** {{date}}

## Executive Summary

{{executive_summary}}

## Research Objectives

{{research_objectives}}

## Methodology

{{methodology}}

## Findings

{{#each sections}}
### {{title}}

{{content}}

{{#each subsections}}
#### {{title}}

{{content}}

{{/each}}
{{/each}}

## Sources

{{#each sources}}
- [{{title}}]({{url}}) - {{reliability}} reliability - Accessed {{access_date}}
{{/each}}

## Limitations

{{#each limitations}}
- {{this}}
{{/each}}

{{#if include_appendix}}
## Appendix

Detailed data and additional information can be found in the appendix.
{{/if}}
`;
  }

  private processTemplate(template: string, data: ReportData, options: ReportGenerationOptions): string {
    let report = template;

    // Replace simple variables
    report = report.replace(/\{\{title\}\}/g, data.title);
    report = report.replace(/\{\{author\}\}/g, data.author || 'Research Analyst');
    report = report.replace(/\{\{date\}\}/g, data.date);

    // Replace metadata
    if (data.metadata) {
      report = report.replace(/\{\{research_objectives\}\}/g, data.metadata.research_objectives || 'Not specified');
      report = report.replace(/\{\{methodology\}\}/g, data.metadata.methodology || 'Standard research methodology');

      // Process sources
      const sourcesSection = data.metadata.sources?.map(source =>
        `- [${source.title}](${source.url}) - ${source.reliability} reliability - Accessed ${new Date(source.access_date).toLocaleDateString()}`
      ).join('\n') || 'No sources specified';

      report = report.replace(/\{\{#each sources\}\}[\s\S]*?\{\{\/each\}\}/g, sourcesSection);

      // Process limitations
      const limitationsSection = data.metadata.limitations?.map(limitation =>
        `- ${limitation}`
      ).join('\n') || 'No limitations specified';

      report = report.replace(/\{\{#each limitations\}\}[\s\S]*?\{\{\/each\}\}/g, limitationsSection);
    }

    // Process sections
    const sectionsSection = data.sections?.map(section => {
      let sectionText = `### ${section.title}\n\n${section.content}\n\n`;

      if (section.subsections && section.subsections.length > 0) {
        sectionText += section.subsections.map(subsection =>
          `#### ${subsection.title}\n\n${subsection.content}\n\n`
        ).join('');
      }

      return sectionText;
    }).join('\n') || 'No sections available';

    report = report.replace(/\{\{#each sections\}\}[\s\S]*?\{\{\/each\}\}/g, sectionsSection);

    // Handle conditional blocks
    report = report.replace(/\{\{#if include_appendix\}\}([\s\S]*?)\{\{\/if\}\}/g,
      options.includeAppendix ? '$1' : '');

    // Clean up any remaining template syntax
    report = report.replace(/\{\{[^}]*\}\}/g, '');

    return report;
  }

  async generateHTMLReport(markdownContent: string): Promise<string> {
    // Convert markdown to HTML
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Research Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }
        h1, h2, h3, h4 {
            color: #2c3e50;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }
        h1 {
            border-bottom: 2px solid #3498db;
            padding-bottom: 0.5rem;
        }
        h2 {
            border-bottom: 1px solid #ecf0f1;
            padding-bottom: 0.3rem;
        }
        a {
            color: #3498db;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        ul, ol {
            padding-left: 2rem;
        }
        li {
            margin-bottom: 0.5rem;
        }
        blockquote {
            border-left: 4px solid #3498db;
            padding-left: 1rem;
            margin: 1rem 0;
            background-color: #f8f9fa;
            padding: 1rem;
        }
        code {
            background-color: #f1f2f6;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        pre {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 1rem;
            border-radius: 5px;
            overflow-x: auto;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 0.8rem;
            text-align: left;
        }
        th {
            background-color: #3498db;
            color: white;
        }
        .executive-summary {
            background-color: #e8f4fd;
            padding: 1.5rem;
            border-radius: 5px;
            border-left: 4px solid #3498db;
            margin-bottom: 2rem;
        }
        .source-list {
            background-color: #f8f9fa;
            padding: 1rem;
            border-radius: 5px;
        }
        @media print {
            body {
                font-size: 12pt;
                padding: 1rem;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    ${this.markdownToHTML(markdownContent)}
</body>
</html>`;

    return htmlContent;
  }

  private markdownToHTML(markdown: string): string {
    // Basic markdown to HTML conversion
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up
    html = html.replace(/<p><h/g, '<h');
    html = html.replace(/<\/h([1-6])><\/p>/g, '</h$1>');
    html = html.replace(/<p><ul>/g, '<ul>');
    html = html.replace(/<\/ul><\/p>/g, '</ul>');

    return html;
  }

  async generatePDFReport(htmlContent: string, outputPath: string): Promise<void> {
    // Note: PDF generation would require a headless browser or PDF library
    // For now, we'll save as HTML and suggest using a browser's print to PDF
    const htmlPath = outputPath.replace('.pdf', '.html');
    await Bun.write(htmlPath, htmlContent);
    console.log(`📄 HTML report saved to: ${htmlPath}`);
    console.log(`💡 To convert to PDF, open the HTML file in a browser and use "Print to PDF"`);
  }

  listAvailableTemplates(): string[] {
    try {
      const templates = [
        'executive-summary',
        'comprehensive-analysis',
        'competitive-intelligence',
        'technical-evaluation',
        'market-analysis'
      ];

      console.log('📋 Available Report Templates:');
      templates.forEach(template => {
        console.log(`  - ${template}`);
      });

      return templates;
    } catch (error) {
      console.error('❌ Failed to list templates:', error);
      return [];
    }
  }
}

// CLI Interface
const program = new Command();

program
  .name('report-generator')
  .description('Automated report generation from research data')
  .version('1.0.0');

program
  .requiredOption('-t, --template <string>', 'Report template to use')
  .requiredOption('-i, --input <string>', 'Input research data file (JSON)')
  .option('-o, --output <string>', 'Output file path')
  .option('-f, --format <string>', 'Output format', 'markdown')
  .option('--include-executive-summary', 'Include executive summary')
  .option('--include-appendix', 'Include appendix')
  .action(async (options) => {
    const generator = new ReportGenerator();

    try {
      let report = await generator.generateReport({
        template: options.template,
        input: options.input,
        output: options.output,
        format: options.format,
        includeExecutiveSummary: options.includeExecutiveSummary,
        includeAppendix: options.includeAppendix
      });

      // Convert to different formats if requested
      if (options.format === 'html') {
        report = await generator.generateHTMLReport(report);
      } else if (options.format === 'pdf') {
        await generator.generatePDFReport(report, options.output || 'report.pdf');
        return;
      }

      if (options.output) {
        await Bun.write(options.output, report);
        console.log(`📄 Report generated successfully: ${options.output}`);
      } else {
        console.log(report);
      }

    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('templates')
  .description('List available report templates')
  .action(() => {
    const generator = new ReportGenerator();
    generator.listAvailableTemplates();
  });

// Execute CLI
if (import.meta.main) {
  program.parse();
}

export { ReportGenerator, type ReportGenerationOptions, type ReportData };