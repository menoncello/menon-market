import { PromptOptimization, CustomizationConfig } from '../types.js';

export class CustomizationEngine {
  private config: CustomizationConfig;

  constructor(config: CustomizationConfig) {
    this.config = config;
  }

  /**
   * Customize a prompt for specific domains and models
   */
  async customizePrompt(
    optimization: PromptOptimization,
    options: {
      mode?: string;
      targetModel?: string;
      domain?: string;
      outputFormat?: string;
    } = {}
  ): Promise<{ prompt: string; customizations: string[] }> {
    let customPrompt = optimization.template.structure;
    const customizations: string[] = [];

    // Substitute placeholders with actual values
    customPrompt = this.substitutePlaceholders(customPrompt, optimization, options);

    // Apply domain customization
    if (options.domain) {
      const domainCustomization = await this.applyDomainCustomization(options.domain, customPrompt);
      customPrompt = domainCustomization.prompt;
      customizations.push(...domainCustomization.customizations);
    }

    // Apply model-specific customization
    if (options.targetModel) {
      const modelCustomization = await this.applyModelCustomization(options.targetModel, customPrompt);
      customPrompt = modelCustomization.prompt;
      customizations.push(...modelCustomization.customizations);
    }

    // Apply mode-specific customization
    if (options.mode) {
      const modeCustomization = await this.applyModeCustomization(options.mode, customPrompt);
      customPrompt = modeCustomization.prompt;
      customizations.push(...modeCustomization.customizations);
    }

    // Apply output format customization
    if (options.outputFormat) {
      const formatCustomization = await this.applyFormatCustomization(options.outputFormat, customPrompt);
      customPrompt = formatCustomization.prompt;
      customizations.push(...formatCustomization.customizations);
    }

    return {
      prompt: customPrompt,
      customizations
    };
  }

  private async applyDomainCustomization(
    domain: string,
    prompt: string
  ): Promise<{ prompt: string; customizations: string[] }> {
    const customizations: string[] = [];
    let customizedPrompt = prompt;

    const domainCustomizations: Record<string, { modifications: string[]; additions: string[] }> = {
      technical: {
        modifications: [
          'Add technical specifications and requirements',
          'Include code examples and implementation details',
          'Specify performance and security considerations'
        ],
        additions: [
          '## Technical Requirements\n- Performance benchmarks\n- Security standards\n- Scalability considerations\n- Integration requirements\n\n## Implementation Details\n- Code structure and patterns\n- Error handling strategies\n- Testing requirements\n- Documentation standards'
        ]
      },
      business: {
        modifications: [
          'Add business context and objectives',
          'Include stakeholder considerations',
          'Specify ROI and success metrics'
        ],
        additions: [
          '## Business Context\n- Strategic objectives\n- Market conditions\n- Competitive landscape\n\n## Stakeholder Analysis\n- Key stakeholders\n- Success criteria\n- ROI expectations\n- Risk factors'
        ]
      },
      creative: {
        modifications: [
          'Add creative brief elements',
          'Include tone and style guidelines',
          'Specify audience and emotional impact'
        ],
        additions: [
          '## Creative Brief\n- Target audience\n- Brand voice and tone\n- Emotional objectives\n- Visual style guidelines\n\n## Content Requirements\n- Key messages\n- Call to action\n- Brand guidelines\n- Platform specifications'
        ]
      },
      research: {
        modifications: [
          'Add research methodology',
          'Include data sources and validation',
          'Specify analytical frameworks'
        ],
        additions: [
          '## Research Methodology\n- Research design\n- Data collection methods\n- Analytical frameworks\n- Validation criteria\n\n## Academic Standards\n- Citation requirements\n- Peer review criteria\n- Statistical significance\n- Ethical considerations'
        ]
      }
    };

    if (domainCustomizations[domain]) {
      const domainConfig = domainCustomizations[domain];
      customizations.push(...domainConfig.modifications);
      customizedPrompt += '\n\n' + domainConfig.additions.join('\n\n');
    }

    return {
      prompt: customizedPrompt,
      customizations
    };
  }

  private async applyModelCustomization(
    model: string,
    prompt: string
  ): Promise<{ prompt: string; customizations: string[] }> {
    const customizations: string[] = [];
    let customizedPrompt = prompt;

    const modelCustomizations: Record<string, { modifications: string[]; prefix: string }> = {
      claude: {
        modifications: [
          'Optimize for Claude\'s analytical capabilities',
          'Add emphasis on safety and ethics',
          'Structure for clear reasoning'
        ],
        prefix: 'As Claude, please provide a thoughtful and comprehensive response considering multiple perspectives and ethical implications.'
      },
      gpt: {
        modifications: [
          'Optimize for GPT\'s creative capabilities',
          'Add explicit format instructions',
          'Structure for clear output'
        ],
        prefix: 'Please provide a detailed and well-structured response following the specified format precisely.'
      },
      gemini: {
        modifications: [
          'Optimize for Gemini\'s multimodal capabilities',
          'Add cross-reference instructions',
          'Structure for comprehensive coverage'
        ],
        prefix: 'Please provide a comprehensive analysis covering multiple aspects and connecting related concepts.'
      },
      llama: {
        modifications: [
          'Optimize for Llama\'s open-source strengths',
          'Add clear step-by-step instructions',
          'Structure for logical flow'
        ],
        prefix: 'Please provide a methodical response with clear reasoning and logical progression.'
      }
    };

    if (modelCustomizations[model]) {
      const modelConfig = modelCustomizations[model];
      customizations.push(...modelConfig.modifications);
      customizedPrompt = modelConfig.prefix + '\n\n' + customizedPrompt;
    }

    return {
      prompt: customizedPrompt,
      customizations
    };
  }

  private async applyModeCustomization(
    mode: string,
    prompt: string
  ): Promise<{ prompt: string; customizations: string[] }> {
    const customizations: string[] = [];
    let customizedPrompt = prompt;

    const modeCustomizations: Record<string, { additions: string[]; modifications: string[] }> = {
      technical: {
        additions: [
          '## Technical Approach\n- System architecture\n- Implementation steps\n- Testing strategy\n- Deployment considerations'
        ],
        modifications: [
          'Focus on technical precision and accuracy',
          'Include code examples and specifications',
          'Add error handling and edge cases'
        ]
      },
      business: {
        additions: [
          '## Business Strategy\n- Market analysis\n- Competitive positioning\n- Financial projections\n- Implementation timeline'
        ],
        modifications: [
          'Focus on business impact and ROI',
          'Include stakeholder considerations',
          'Add risk assessment and mitigation'
        ]
      },
      creative: {
        additions: [
          '## Creative Elements\n- Visual design principles\n- Brand guidelines\n- User experience considerations\n- Platform optimization'
        ],
        modifications: [
          'Focus on creativity and engagement',
          'Include brand voice and tone',
          'Add user psychology insights'
        ]
      },
      research: {
        additions: [
          '## Research Framework\n- Literature review\n- Methodology\n- Data analysis\n- Conclusions and implications'
        ],
        modifications: [
          'Focus on academic rigor and evidence',
          'Include citations and references',
          'Add statistical analysis and validation'
        ]
      }
    };

    if (modeCustomizations[mode]) {
      const modeConfig = modeCustomizations[mode];
      customizations.push(...modeConfig.modifications);
      customizedPrompt += '\n\n' + modeConfig.additions.join('\n\n');
    }

    return {
      prompt: customizedPrompt,
      customizations
    };
  }

  private async applyFormatCustomization(
    format: string,
    prompt: string
  ): Promise<{ prompt: string; customizations: string[] }> {
    const customizations: string[] = [];
    let customizedPrompt = prompt;

    const formatInstructions: Record<string, string> = {
      json: 'Please provide the response in valid JSON format with proper structure and data types.',
      markdown: 'Please format the response using Markdown with appropriate headers, lists, and formatting.',
      text: 'Please provide the response in plain text format with clear organization and structure.',
      yaml: 'Please provide the response in valid YAML format with proper indentation and structure.',
      xml: 'Please provide the response in valid XML format with proper tags and structure.'
    };

    if (formatInstructions[format]) {
      customizations.push(`Formatted output for ${format.toUpperCase()}`);
      customizedPrompt += '\n\n' + formatInstructions[format];
    }

    return {
      prompt: customizedPrompt,
      customizations
    };
  }

  private substitutePlaceholders(
    template: string,
    optimization: any,
    options: any
  ): string {
    let substituted = template;

    // Try to extract content from optimization if available
    const task = optimization.task || 'the specified task';
    const context = optimization.context || options.context || 'provided context';
    const domain = options.domain || optimization.domain || 'general';
    const mode = options.mode || optimization.mode || 'specialist';

    // Basic placeholder substitutions
    const substitutions: Record<string, string> = {
      '{role}': `${domain} ${mode}`,
      '{domain}': domain,
      '{context}': context,
      '{task}': task,
      '{requirements}': optimization.requirements || 'specified requirements',
      '{constraints}': optimization.constraints || 'applicable constraints',
      '{outputFormat}': this.getOutputFormatDescription(options.outputFormat),
      '{examples}': 'Relevant examples will be provided',
      '{expertiseLevel}': 'Expert level'
    };

    // Apply all substitutions
    for (const [placeholder, value] of Object.entries(substitutions)) {
      substituted = substituted.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return substituted;
  }

  private getOutputFormatDescription(format?: string): string {
    const formatDescriptions: Record<string, string> = {
      json: 'JSON format with proper structure and data types',
      markdown: 'Markdown with headers, lists, and formatting',
      text: 'Plain text with clear organization',
      yaml: 'YAML format with proper indentation',
      xml: 'XML format with proper tags and structure'
    };

    return formatDescriptions[format || 'text'] || formatDescriptions.text!;
  }
}