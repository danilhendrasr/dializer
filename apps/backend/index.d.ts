import { IncomingHttpHeaders } from 'http';
import { Express } from '@types/express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    startTime?: number;
  }
}

declare module 'http' {
  interface IncomingHttpHeaders {
    'Dializer-Request-ID'?: string;
  }
}
