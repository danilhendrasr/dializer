export interface IEnvironment {
  production: boolean;
  port: number;
  baseUrl: string;
  jwtSecret: string;
  globalApiPrefix: string;
  frontendUrl: string;
  mailer: IMailerConfig;
  database: IDatabaseEnvironment;
}

export interface IMailerConfig {
  user: string;
  pass: string;
}

export interface IDatabaseEnvironment {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}
