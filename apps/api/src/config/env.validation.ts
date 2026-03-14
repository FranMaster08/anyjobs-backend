import { z } from 'zod';

const logLevels = ['debug', 'log', 'warn', 'error'] as const;
const dbTypes = ['postgres', 'sqljs'] as const;

const baseSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .optional()
    .default('development'),

  APP_PORT: z.coerce.number().int().min(1).max(65535),

  LOG_LEVEL: z.enum(logLevels),
  LOG_DEBUG_PAYLOADS: z.coerce.boolean().optional().default(false),

  DB_TYPE: z.enum(dbTypes),
  DB_SSL: z.coerce.boolean().optional().default(false),
  DB_LOGGING: z.coerce.boolean().optional().default(false),
  DB_SYNCHRONIZE: z.coerce.boolean().optional().default(false),
  DB_MIGRATIONS_RUN: z.coerce.boolean().optional().default(false),

  PAGINATION_DEFAULT_PAGE_SIZE: z.coerce.number().int().min(1),
  PAGINATION_MAX_PAGE_SIZE: z.coerce.number().int().min(1),

  SWAGGER_ENABLED: z.coerce.boolean().optional().default(true),
  SWAGGER_PATH: z.string().optional().default('docs'),
});

const postgresSchema = baseSchema.extend({
  DB_TYPE: z.literal('postgres'),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535),
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_DATABASE: z.string().min(1),
});

const sqljsSchema = baseSchema.extend({
  DB_TYPE: z.literal('sqljs'),
  DB_SQLJS_LOCATION: z.string().optional().default(':memory:'),
});

export const envSchema = z
  .discriminatedUnion('DB_TYPE', [postgresSchema, sqljsSchema])
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && env.DB_SYNCHRONIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DB_SYNCHRONIZE'],
        message: 'DB_SYNCHRONIZE MUST NOT be true in production',
      });
    }
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

