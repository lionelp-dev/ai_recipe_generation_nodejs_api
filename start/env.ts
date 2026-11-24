/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),
  SERVICE_TOKEN: Env.schema.string.optional(),
  OPENROUTER_API_KEY: Env.schema.string.optional(),
  OPENROUTER_BASE_URL: Env.schema.string(),
  OPENROUTER_MODEL: Env.schema.string.optional(),
  OPENROUTER_IMAGE_MODEL: Env.schema.string(),
  OPENROUTER_IMAGE_SIZE: Env.schema.string(),
  OPENROUTER_IMAGE_QUALITY: Env.schema.enum(['low', 'medium', 'high'] as const),
  OPENROUTER_IMAGE_OUTPUT_FORMAT: Env.schema.enum(['jpeg', 'png', 'webp'] as const),
  OPENROUTER_IMAGE_OUTPUT_COMPRESSION: Env.schema.number(),
  RECIPE_DISCOVERY_BATCH_SIZE: Env.schema.number(),
  RECIPE_DISCOVERY_MAX_CONCURRENCY: Env.schema.number(),
  RECIPE_DISCOVERY_IMAGE_TIMEOUT_MS: Env.schema.number(),

  // Laravel recipe source database (read-only account outside development)
  DB_HOST: Env.schema.string.optional(),
  DB_PORT: Env.schema.number.optional(),
  DB_DATABASE: Env.schema.string.optional(),
  DB_USERNAME: Env.schema.string.optional(),
  DB_PASSWORD: Env.schema.secret.optional(),
  DB_SSL: Env.schema.boolean.optional(),
  DB_SSL_REJECT_UNAUTHORIZED: Env.schema.boolean.optional(),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),
})
