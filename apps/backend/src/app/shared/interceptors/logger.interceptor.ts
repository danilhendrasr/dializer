import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const { method, url } = req;

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = res;
        const contentLength = res.get('content-length');

        this.logger.log({
          request_id: req.headers['Dializer-Request-ID'],
          message: 'request served',
          url,
          method,
          status_code: statusCode,
          content_length: contentLength,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          latency: Date.now() - req.startTime!,
        });
      })
    );
  }
}
