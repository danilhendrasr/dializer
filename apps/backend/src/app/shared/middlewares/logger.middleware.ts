import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LoggerInterceptor } from '../interceptors/logger.interceptor';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerInterceptor.name);

  use(req: Request, res: Response, next: NextFunction) {
    const { method, url, ip } = req;
    const userAgent = req.get('user-agent') || '';

    const requestId = uuidv4();

    req.headers['Dializer-Request-ID'] = requestId;
    req.startTime = Date.now();

    this.logger.log({
      request_id: requestId,
      message: 'incoming request',
      ip,
      url,
      method,
      user_agent: userAgent,
    });

    next();
  }
}
