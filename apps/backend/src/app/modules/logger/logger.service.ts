import {
  Injectable,
  LoggerService as LoggerServiceInterface,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import LokiTransport from 'winston-loki';
import { EnvSchema } from '../../shared/types';

@Injectable()
export class LoggerService implements LoggerServiceInterface {
  private readonly logger: winston.Logger;

  constructor(private readonly configService: ConfigService<EnvSchema>) {
    const { timestamp, combine, errors, json } = winston.format;
    this.logger = winston.createLogger({
      format: combine(errors({ stack: true }), timestamp(), json()),
      transports: [new winston.transports.Console()],
    });

    const lokiHost = this.configService.get('LOKI_HOST');
    if (lokiHost) {
      this.logger.add(
        new LokiTransport({
          host: lokiHost,
          labels: { app: 'dializer' },
          onConnectionError: (e) => console.error(e),
        })
      );
    }
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message);
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message);
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message);
  }
}
