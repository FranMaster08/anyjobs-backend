import { z } from 'zod';

const logLevels = ['debug', 'log', 'warn', 'error'] as const;

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .optional()
    .default('development'),

  APP_PORT: z.coerce.number().int().min(1).max(65535),

  LOG_LEVEL: z.enum(logLevels),
  LOG_DEBUG_PAYLOADS: z.coerce.boolean().optional().default(false),

  PAGINATION_DEFAULT_PAGE_SIZE: z.coerce.number().int().min(1),
  PAGINATION_MAX_PAGE_SIZE: z.coerce.number().int().min(1),

  SWAGGER_ENABLED: z.coerce.boolean().optional().default(true),
  SWAGGER_PATH: z.string().optional().default('docs'),
});

export type EnvVars = z.infer<typeof envSchema>;

export function validateEnv(env: NodeJS.ProcessEnv): EnvVars {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid environment variables: ${details}`);
  }
  return parsed.data;
}

