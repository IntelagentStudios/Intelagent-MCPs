/**
 * Standard error handling for MCP tool responses.
 *
 * Provides consistent error formatting across all MCP servers.
 */

/** Structured error response returned by MCP tools. */
export interface ToolError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Format an error into a standard MCP tool error response.
 *
 * @example
 * ```ts
 * try {
 *   const result = await callExternalApi();
 *   return result;
 * } catch (error) {
 *   return formatToolError(error, 'API_ERROR');
 * }
 * ```
 */
export function formatToolError(
  error: unknown,
  code?: string,
  details?: Record<string, unknown>
): ToolError {
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';

  return {
    error: message,
    ...(code ? { code } : {}),
    ...(details ? { details } : {}),
  };
}

/**
 * Create a validation error for missing or invalid tool arguments.
 *
 * @example
 * ```ts
 * if (!args.email) {
 *   return validationError('email', 'Email address is required');
 * }
 * ```
 */
export function validationError(field: string, message: string): ToolError {
  return {
    error: message,
    code: 'VALIDATION_ERROR',
    details: { field },
  };
}

/**
 * Wrap a tool handler with standard error handling.
 * Catches any thrown error and returns a formatted error response.
 *
 * @example
 * ```ts
 * const handler = withErrorHandling(async (args) => {
 *   // This can throw freely — errors are caught and formatted
 *   const data = await fetchData(args.id);
 *   return data;
 * });
 * ```
 */
export function withErrorHandling<T>(
  handler: (args: Record<string, unknown>) => Promise<T>
): (args: Record<string, unknown>) => Promise<T | ToolError> {
  return async (args) => {
    try {
      return await handler(args);
    } catch (error) {
      return formatToolError(error);
    }
  };
}
