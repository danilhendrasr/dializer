import { IEnvironment } from './env.interface';

export const environment: Partial<IEnvironment> = {
  production: false,
  database: {
    database: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'dializer',
  },
};
