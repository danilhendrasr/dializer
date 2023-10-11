import { ZodError } from 'zod';
import { envSchema } from '../types';
import { Logger } from '@nestjs/common';

export function validateEnvVariables(envs: Record<string, unknown>) {
  try {
    return envSchema.parse(envs);
  } catch (e) {
    const err = e as ZodError;
    Logger.error('Error processing environment variables');
    throw err;
  }
}
