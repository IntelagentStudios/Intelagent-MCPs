import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

export interface ResourceDefinition {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  handler: () => Promise<string>;
}

export interface MCPServerConfig {
  name: string;
  version: string;
  tools: ToolDefinition[];
  resources?: ResourceDefinition[];
}

export async function createMCPServer(config: MCPServerConfig): Promise<Server> {
  const server = new Server(
    { name: config.name, version: config.version },
    {
      capabilities: {
        tools: {},
        ...(config.resources?.length ? { resources: {} } : {}),
      },
    }
  );

  // Register tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: config.tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  // Register tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = config.tools.find((t) => t.name === request.params.name);
    if (!tool) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ error: `Unknown tool: ${request.params.name}` }),
          },
        ],
        isError: true,
      };
    }

    try {
      const result = await tool.handler(
        (request.params.arguments as Record<string, unknown>) || {}
      );
      return {
        content: [
          {
            type: 'text' as const,
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tool execution failed';
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
        isError: true,
      };
    }
  });

  // Register resources if provided
  if (config.resources?.length) {
    server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: config.resources!.map((r) => ({
        uri: r.uri,
        name: r.name,
        description: r.description,
        mimeType: r.mimeType || 'application/json',
      })),
    }));

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const resource = config.resources!.find((r) => r.uri === request.params.uri);
      if (!resource) {
        throw new Error(`Unknown resource: ${request.params.uri}`);
      }
      const content = await resource.handler();
      return {
        contents: [
          {
            uri: resource.uri,
            mimeType: resource.mimeType || 'application/json',
            text: content,
          },
        ],
      };
    });
  }

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);

  return server;
}
