import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const { method, url } = req;
    const userAgent = req.get('user-agent') || '';

    const requestId = uuidv4();
    const startTime = Date.now();

    this.logger.log({
      request_id: requestId,
      message: 'incoming request',
      url,
      method,
      user_agent: userAgent,
    });

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = res;
        const contentLength = res.get('content-length');

        this.logger.log({
          request_id: requestId,
          message: 'request served',
          url,
          method,
          status_code: statusCode,
          content_length: contentLength,
          latency: Date.now() - startTime,
        });
      })
    );
  }
}
