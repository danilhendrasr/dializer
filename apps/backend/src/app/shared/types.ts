import { z } from 'zod';

export enum ApiEndpoints {
  USERS = 'users',
  NODES = 'nodes',
  WORKSPACES = 'workspaces',
  AUTH = 'auth',
}

export const envSchema = z.object({
  ENV: z.union([
    z.literal('development'),
    z.literal('staging'),
    z.literal('production'),
  ]),
  PORT: z
    .string()
    .default('3333')
    .transform((val) => parseInt(val)),
  JWT_SECRET: z.string(),
  API_PREFIX: z.string().optional(),

  FRONTEND_HOST: z.string(),

  DB_HOST: z.string(),
  DB_NAME: z.string(),
  DB_PORT: z.string().transform((val) => parseInt(val)),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),

  EMAIL_USERNAME: z.string(),
  EMAIL_PASSWORD: z.string(),

  LOKI_HOST: z.string().optional(),
});

export type EnvSchema = z.infer<typeof envSchema>;
export type EnvKey = keyof EnvSchema;
