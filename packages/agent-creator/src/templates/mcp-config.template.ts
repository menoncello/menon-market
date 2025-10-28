/**
 * MCP configuration template for agent directories
 */

function generateMcpBasicConfig(): string {
  return `{
  "name": "{{agentName}}",
  "version": "{{version}}",
  "description": "{{description}}",
  "type": "mcp-server",
  "entry": "src/mcp-server/index.ts",
  "capabilities": {
    "tools": true,
    "resources": false,
    "prompts": false
  },`;
}

function generateAnalyzeCodeTool(): string {
  return `    {
      "name": "analyze_code",
      "description": "Analyze code for patterns and issues",
      "parameters": {
        "type": "object",
        "properties": {
          "code": {
            "type": "string",
            "description": "Code to analyze"
          },
          "language": {
            "type": "string",
            "description": "Programming language",
            "enum": ["typescript", "javascript", "python", "java", "go"]
          }
        },
        "required": ["code"]
      }
    }`;
}

function generateDocumentationTool(): string {
  return `    {
      "name": "generate_documentation",
      "description": "Generate documentation for code",
      "parameters": {
        "type": "object",
        "properties": {
          "code": {
            "type": "string",
            "description": "Code to document"
          },
          "format": {
            "type": "string",
            "description": "Documentation format",
            "enum": ["markdown", "jsdoc", "tsdoc"]
          }
        },
        "required": ["code"]
      }
    }`;
}

function generateMcpTools(): string {
  return `  "tools": [
    ${generateAnalyzeCodeTool()},
    ${generateDocumentationTool()}
  ],`;
}

function generateMcpConfiguration(): string {
  return `  "configuration": {
    "timeout": 30000,
    "retries": 3,
    "logLevel": "info"
  },`;
}

function generateMcpDependencies(): string {
  return `  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  }`;
}

export function generateMcpConfigTemplate(): string {
  return `${generateMcpBasicConfig()}
${generateMcpTools()}
${generateMcpConfiguration()}
${generateMcpDependencies()}
}`;
}
