import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    // Attach start time to request so HttpExceptionFilter can use it
    (req as any)._startTime = start;

    // Hook into res.on('finish') for response time logging
    res.on('finish', () => {
      const ms = Date.now() - start;
      const status = res.statusCode;
      const level = status >= 500 ? 'ERR' : status >= 400 ? 'WARN' : 'INFO';
      const prefix = {
        INFO: '\x1b[32m[INFO]\x1b[0m',
        WARN: '\x1b[33m[WARN]\x1b[0m',
        ERR: '\x1b[31m[ERR]\x1b[0m',
      }[level];

      // Skip favicon noise
      if (req.path === '/favicon.ico') return;

      console.log(
        `${prefix} ${req.method.padEnd(7)} ${req.originalUrl.padEnd(80)} ${status} ${ms}ms`
      );
    });

    next();
  }
}
