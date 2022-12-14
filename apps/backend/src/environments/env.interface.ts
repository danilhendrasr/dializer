export interface IEnvironment {
  production: boolean;
  port: number;
  baseUrl: string;
  globalApiPrefix: string;
  database: IDatabaseEnvironment;
}

export interface IDatabaseEnvironment {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}
