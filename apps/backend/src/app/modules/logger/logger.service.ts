import {
  Injectable,
  LoggerService as LoggerServiceInterface,
} from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements LoggerServiceInterface {
  private readonly logger: winston.Logger;

  constructor() {
    const { timestamp, combine, errors, json } = winston.format;
    this.logger = winston.createLogger({
      format: combine(errors({ stack: true }), timestamp(), json()),
      transports: [new winston.transports.Console()],
    });
  }

  debug(message: string, ...optionalParams: any[]) {
    this.logger.debug(message, optionalParams);
  }

  warn(message: string, ...optionalParams: any[]) {
    this.logger.warn(message, optionalParams);
  }

  error(message: string, ...optionalParams: any[]) {
    this.logger.error(message, optionalParams);
  }

  log(message: string, ...optionalParams: any[]) {
    this.logger.info(message, optionalParams);
  }
}
