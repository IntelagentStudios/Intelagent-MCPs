/**
 * Configuration utilities for MCP servers.
 *
 * Provides a type-safe way to read configuration from environment variables
 * with defaults, required validation, and type coercion.
 */

/** A single configuration field definition. */
export interface ConfigField<T> {
  /** Environment variable name. */
  env: string;
  /** Default value if the env var is not set. If omitted, the field is required. */
  default?: T;
  /** Description shown in error messages and documentation. */
  description?: string;
  /** Transform the raw string value. Defaults to identity (string passthrough). */
  parse?: (value: string) => T;
}

/** Extract the resolved type from a config schema. */
export type ConfigFromSchema<S extends Record<string, ConfigField<unknown>>> = {
  [K in keyof S]: S[K] extends ConfigField<infer T> ? T : never;
};

/**
 * Read configuration from environment variables using a typed schema.
 *
 * Fields without a `default` are required — throws if the env var is missing.
 * Fields with a `default` are optional — uses the default when unset.
 *
 * @example
 * ```ts
 * const config = readConfig({
 *   apiKey: { env: 'MY_API_KEY', description: 'API key for the service' },
 *   port: { env: 'PORT', default: 3000, parse: Number },
 *   debug: { env: 'DEBUG', default: false, parse: (v) => v === 'true' },
 * });
 * // config.apiKey: string (required)
 * // config.port: number (defaults to 3000)
 * // config.debug: boolean (defaults to false)
 * ```
 *
 * @throws {Error} If a required field is missing from the environment.
 */
export function readConfig<S extends Record<string, ConfigField<unknown>>>(
  schema: S
): ConfigFromSchema<S> {
  const result: Record<string, unknown> = {};
  const missing: string[] = [];

  for (const [key, field] of Object.entries(schema)) {
    const raw = process.env[field.env];

    if (raw === undefined || raw === '') {
      if (field.default !== undefined) {
        result[key] = field.default;
      } else {
        missing.push(`${field.env}${field.description ? ` (${field.description})` : ''}`);
      }
    } else {
      result[key] = field.parse ? field.parse(raw) : raw;
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((m) => `  - ${m}`).join('\n')}`
    );
  }

  return result as ConfigFromSchema<S>;
}

/**
 * Read configuration from environment variables, using defaults for all missing values.
 * Unlike {@link readConfig}, this never throws — all fields fall back to their defaults.
 * Fields without defaults resolve to `undefined`.
 *
 * Useful for servers that should work in mock mode without any configuration.
 */
export function readConfigSafe<S extends Record<string, ConfigField<unknown>>>(
  schema: S
): Partial<ConfigFromSchema<S>> {
  const result: Record<string, unknown> = {};

  for (const [key, field] of Object.entries(schema)) {
    const raw = process.env[field.env];

    if (raw === undefined || raw === '') {
      if (field.default !== undefined) {
        result[key] = field.default;
      }
    } else {
      result[key] = field.parse ? field.parse(raw) : raw;
    }
  }

  return result as Partial<ConfigFromSchema<S>>;
}
