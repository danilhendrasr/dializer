import { IEnvironment } from './env.interface';

export const environment: Partial<IEnvironment> = {
  production: false,
  globalApiPrefix: 'api',
  port: Number(process.env.PORT) || 3333,
  jwtSecret: ';kajsdf;lsdf;lkasdflkajsdkf',
  database: {
    database: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'dializer',
  },
};
