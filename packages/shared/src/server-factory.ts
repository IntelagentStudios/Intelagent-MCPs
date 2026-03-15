import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { Logger } from './logger.js';
import { ConsoleLogger } from './logger.js';

/** Definition of a single MCP tool. */
export interface ToolDefinition {
  /** Snake_case tool name (e.g. `enrich_company`). */
  name: string;
  /** What the tool does and when to use it. Shown to the LLM. */
  description: string;
  /** JSON Schema for the tool's input parameters. */
  inputSchema: Record<string, unknown>;
  /** Async handler that receives validated arguments and returns the result. */
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

/** Definition of a single MCP resource. */
export interface ResourceDefinition {
  /** Resource URI (e.g. `myserver://status`). */
  uri: string;
  /** Human-readable name. */
  name: string;
  /** Description of what the resource provides. */
  description?: string;
  /** MIME type of the resource content. Defaults to `application/json`. */
  mimeType?: string;
  /** Async handler that returns the resource content as a string. */
  handler: () => Promise<string>;
}

/** Configuration for {@link createMCPServer}. */
export interface MCPServerConfig {
  /** Server name shown to MCP clients. */
  name: string;
  /** Semver version string. */
  version: string;
  /** Tools to register. */
  tools: ToolDefinition[];
  /** Resources to register. */
  resources?: ResourceDefinition[];
  /** Logger instance. Defaults to stderr ConsoleLogger at 'info' level. */
  logger?: Logger;
  /** Add a built-in `server_info` tool that returns server metadata. Defaults to `true`. */
  includeHealthTool?: boolean;
}

/**
 * Create and start an MCP server with stdio transport.
 *
 * Registers all tools and resources, connects via stdio, and returns the server instance.
 * Includes a built-in `server_info` introspection tool unless disabled.
 *
 * @example
 * ```ts
 * import { createMCPServer } from '@intelagent/mcp-shared';
 *
 * await createMCPServer({
 *   name: 'my-server',
 *   version: '1.0.0',
 *   tools: [
 *     {
 *       name: 'hello',
 *       description: 'Say hello',
 *       inputSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
 *       handler: async (args) => ({ message: `Hello, ${args.name}!` }),
 *     },
 *   ],
 * });
 * ```
 */
export async function createMCPServer(config: MCPServerConfig): Promise<Server> {
  const logger = config.logger ?? new ConsoleLogger('info', config.name);
  const includeHealth = config.includeHealthTool !== false;

  // Build the full tool list
  const tools: ToolDefinition[] = [...config.tools];

  if (includeHealth) {
    tools.push({
      name: 'server_info',
      description:
        'Returns server metadata: name, version, registered tools, and registered resources. Useful for introspection and health checks.',
      inputSchema: { type: 'object', properties: {} },
      handler: async () => ({
        name: config.name,
        version: config.version,
        tools: config.tools.map((t) => ({ name: t.name, description: t.description })),
        resources: (config.resources ?? []).map((r) => ({ uri: r.uri, name: r.name })),
      }),
    });
  }

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
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  // Register tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = tools.find((t) => t.name === request.params.name);
    if (!tool) {
      logger.warn('Unknown tool requested', { tool: request.params.name });
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
      logger.debug('Executing tool', { tool: tool.name });
      const result = await tool.handler(
        (request.params.arguments as Record<string, unknown>) || {}
      );
      logger.debug('Tool completed', { tool: tool.name });
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
      logger.error('Tool failed', { tool: tool.name, error: message });
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

  logger.info('Server started', {
    tools: tools.length,
    resources: config.resources?.length ?? 0,
  });

  return server;
}
