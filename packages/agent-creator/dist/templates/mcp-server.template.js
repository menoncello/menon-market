/**
 * MCP Server template for agent directories
 */
function generateMcpServerImports() {
    return `/**
 * MCP Server for {{agentName}}
 * Model Context Protocol implementation for Claude Code integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { tools } from './tools/index.js';
import { handlers } from './handlers/index.js';
`;
}
function generateMcpServerCreateFunction() {
    return `/**
 * Create and configure MCP server
 */
function createServer(): Server {
  const server = new Server(
    {
      name: '{{agentName}}',
      version: '{{version}}',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.values(tools).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  }));
`;
}
function generateMcpServerToolHandler() {
    return `  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Find the tool
    const tool = Object.values(tools).find(t => t.name === name);
    if (!tool) {
      throw new Error(\`Unknown tool: \${name}\`);
    }

    // Execute the tool
    try {
      const result = await tool.execute(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: \`Error executing \${name}: \${error instanceof Error ? error.message : 'Unknown error'}\`,
          },
        ],
        isError: true,
      };
    }
  });
`;
}
function generateMcpServerEventHandlers() {
    return `  // Register event handlers
  for (const [event, handler] of Object.entries(handlers)) {
    server.registerEventHandler(event, handler);
  }

  return server;
}
`;
}
function generateMcpServerStartFunction() {
    return `/**
 * Start the MCP server
 */
export async function startServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error('{{agentName}} MCP server running on stdio');
}
`;
}
function generateMcpServerEntry() {
    return `// Start server if this file is run directly
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  startServer().catch(error => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  });
}
`;
}
export function generateMcpServerTemplate() {
    return [
        generateMcpServerImports(),
        generateMcpServerCreateFunction(),
        generateMcpServerToolHandler(),
        generateMcpServerEventHandlers(),
        generateMcpServerStartFunction(),
        generateMcpServerEntry(),
    ].join('\n');
}
//# sourceMappingURL=mcp-server.template.js.map