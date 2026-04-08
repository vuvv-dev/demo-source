import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

interface LogContext {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime?: number;
  userId?: string;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  errorName: string;
  errorMessage: string;
  stack?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const startTime = (request as any)._startTime ?? Date.now();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as any)?.message || exception.message
        : 'Internal server error';

    const errorName = exception instanceof Error ? exception.name : 'UnknownError';
    const errorMessage =
      exception instanceof HttpException
        ? message
        : exception instanceof Error
        ? exception.message
        : String(exception);

    const logCtx: LogContext = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.originalUrl,
      statusCode: status,
      responseTime: Date.now() - startTime,
      userId: (request as any).user?.id,
      params: request.params as Record<string, string>,
      query: request.query as Record<string, string>,
      body: this.sanitizeBody(request.body),
      errorName,
      errorMessage,
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    if (status >= 500) {
      // ── Server errors — full structured JSON log
      console.error('\n[ERROR]'.padEnd(50, '═'), '\n', JSON.stringify(logCtx, null, 2));
    } else {
      // ── Client errors — compact one-liner (also covered by middleware)
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message,
      error: Array.isArray(message) ? message : [errorMessage],
    });
  }

  /** Remove sensitive fields before logging */
  private sanitizeBody(body: unknown): Record<string, unknown> | undefined {
    if (!body || typeof body !== 'object') return undefined;
    const sensitive = ['password', 'token', 'refreshToken', 'accessToken', 'oldPassword', 'newPassword', 'confirmPassword'];
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      sanitized[key] = sensitive.includes(key) ? '[REDACTED]' : value;
    }
    return sanitized;
  }
}
