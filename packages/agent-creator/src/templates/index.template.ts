/**
 * Index template for agent directories
 */

function generateClassHeader(): string {
  return `/**
 * {{agentName}}
 * {{agentType}} - AI Agent for Claude Code
 */

export class {{agentType}}Agent {
  private readonly id: string;
  private readonly name: string;
  private readonly version: string;

  constructor() {
    this.id = '{{agentId}}';
    this.name = '{{agentName}}';
    this.version = '{{version}}';
  }`;
}

function generateInitializeMethod(): string {
  return `/**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    console.log(\`Initializing {{agentName}} (v\${this.version})\`);

    // Initialize MCP server
    await this.initializeMcpServer();

    // Load agent configuration
    await this.loadConfiguration();

    console.log('{{agentName}} initialized successfully');
  }`;
}

function generateMcpServerMethod(): string {
  return `/**
   * Initialize MCP server
   */
  private async initializeMcpServer(): Promise<void> {
    // MCP server initialization logic
    console.log('Initializing MCP server...');
  }`;
}

function generateConfigMethod(): string {
  return `/**
   * Load agent configuration
   */
  private async loadConfiguration(): Promise<void> {
    // Configuration loading logic
    console.log('Loading agent configuration...');
  }`;
}

function generateGetInfoMethod(): string {
  return `/**
   * Get agent information
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      type: '{{agentType}}',
      specializations: {{#each specializations}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}},
      coreSkills: {{#each coreSkills}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}},
    };
  }`;
}

function generateExports(): string {
  return `// Export agent instance
export const agent = new {{agentType}}Agent();
export default agent;`;
}

export function generateIndexTemplate(): string {
  return `${generateClassHeader()}

  ${generateInitializeMethod()}

  ${generateMcpServerMethod()}

  ${generateConfigMethod()}

  ${generateGetInfoMethod()}
}

${generateExports()}
`;
}
