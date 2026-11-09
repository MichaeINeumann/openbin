import type { NextFunction, Request, Response } from 'express';
import { pushLog } from '../lib/logBuffer.js';
import { createLogger } from '../lib/logger.js';

const log = createLogger('http');

/** Strip the query string and redact bearer-like path segments (share tokens)
 *  so rejected requests can go to stdout without leaking credentials. */
export function redactPath(originalUrl: string): string {
  const pathOnly = originalUrl.split('?')[0];
  return pathOnly.replace(/^\/api\/shared\/[^/]+/, '/api/shared/:token');
}

/** Error code/message recorded by the global error handler, if any. */
export interface LoggedError {
  code: string;
  message: string;
}

export function recordErrorForLog(res: Response, error: LoggedError): void {
  res.locals.loggedError = error;
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    const err = res.locals.loggedError as LoggedError | undefined;

    pushLog({
      level,
      method: req.method,
      path: req.originalUrl,
      status,
      duration,
      ip: req.ip || req.socket.remoteAddress,
      ...(err ? { message: `${err.code}: ${err.message}` } : {}),
    });

    // Rejected requests used to land only in the in-memory admin buffer, so
    // `docker logs` showed nothing when e.g. a photo upload hit a limit.
    // 5xx are already logged by the global error handler with a stack trace.
    if (status >= 400 && status < 500) {
      const line = `${req.method} ${redactPath(req.originalUrl)} ${status} ${duration}ms${err ? ` ${err.code}: ${err.message}` : ''}`;
      // 401 fires on every page load for signed-out visitors — keep it quiet by default.
      if (status === 401) log.debug(line);
      else log.warn(line);
    }
  });

  next();
}
