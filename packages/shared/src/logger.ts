/**
 * Pluggable logging interface for MCP servers.
 *
 * MCP servers communicate over stdio, so logs MUST go to stderr.
 * The default {@link ConsoleLogger} writes to `process.stderr`.
 */

/** Log levels in order of severity. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Logger interface. Implement this to integrate with your logging stack. */
export interface Logger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Default logger that writes to stderr (safe for MCP stdio transport).
 *
 * @example
 * ```ts
 * const logger = new ConsoleLogger('info'); // suppresses debug
 * logger.info('Server started', { port: 3000 });
 * // stderr: [INFO] Server started {"port":3000}
 * ```
 */
export class ConsoleLogger implements Logger {
  private minLevel: number;
  private prefix: string;

  constructor(level: LogLevel = 'info', prefix?: string) {
    this.minLevel = LEVEL_ORDER[level];
    this.prefix = prefix ? `[${prefix}] ` : '';
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (LEVEL_ORDER[level] < this.minLevel) return;
    const tag = level.toUpperCase();
    const suffix = data ? ` ${JSON.stringify(data)}` : '';
    process.stderr.write(`${this.prefix}[${tag}] ${message}${suffix}\n`);
  }
}

/** Silent logger that discards all output. Useful for tests. */
export class SilentLogger implements Logger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}
