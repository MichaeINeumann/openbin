import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { recordErrorForLog, redactPath, requestLogger } from '../requestLogger.js';

function buildApp(status: number, withError = false) {
  const app = express();
  app.use(requestLogger);
  app.all('*', (_req, res) => {
    if (withError) recordErrorForLog(res, { code: 'BIN_PHOTO_LIMIT', message: 'Maximum 1 photos per bin' });
    res.status(status).json({});
  });
  return app;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('redactPath', () => {
  it('drops the query string', () => {
    expect(redactPath('/api/bins?token=secret')).toBe('/api/bins');
  });

  it('redacts share tokens', () => {
    expect(redactPath('/api/shared/abc123/photos/p1/file')).toBe('/api/shared/:token/photos/p1/file');
  });
});

describe('requestLogger stdout output', () => {
  it('writes rejected requests with their error code to stdout', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await request(buildApp(413, true)).post('/api/bins/b1/photos?x=1');

    expect(warn).toHaveBeenCalledTimes(1);
    const line = warn.mock.calls[0].join(' ');
    expect(line).toContain('POST /api/bins/b1/photos 413');
    expect(line).toContain('BIN_PHOTO_LIMIT: Maximum 1 photos per bin');
    expect(line).not.toContain('x=1');
  });

  it('does not print successful requests or 401s at the default level', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const info = vi.spyOn(console, 'log').mockImplementation(() => {});
    await request(buildApp(200)).get('/api/bins');
    await request(buildApp(401)).get('/api/auth/me');

    expect(warn).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
  });
});
