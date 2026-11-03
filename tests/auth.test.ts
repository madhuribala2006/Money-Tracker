import assert from 'node:assert/strict';
import test from 'node:test';
import type { NextFunction, Response } from 'express';
import { authMiddleware, generateToken, type AuthenticatedRequest } from '../backend/server/middleware/auth.js';

function createResponse() {
  const response = {
    statusCode: 0,
    body: undefined as { error: string } | undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: { error: string }) {
      this.body = body;
      return this;
    },
  };
  return response as unknown as Response & typeof response;
}

test('rejects requests without a bearer token', () => {
  const req = { headers: {} } as AuthenticatedRequest;
  const res = createResponse();
  let nextCalled = false;

  authMiddleware(req, res, (() => { nextCalled = true; }) as NextFunction);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body?.error, 'Authentication required');
  assert.equal(nextCalled, false);
});

test('accepts a valid bearer token and attaches the user identity', () => {
  const req = {
    headers: {
      authorization: `Bearer ${generateToken({
        userId: 'demo-user',
        email: 'demo@example.com',
        name: 'Demo Student',
      })}`,
    },
  } as AuthenticatedRequest;
  const res = createResponse();
  let nextCalled = false;

  authMiddleware(req, res, (() => { nextCalled = true; }) as NextFunction);

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, {
    id: 'demo-user',
    email: 'demo@example.com',
    name: 'Demo Student',
  });
});

test('rejects an invalid bearer token', () => {
  const req = { headers: { authorization: 'Bearer invalid-token' } } as AuthenticatedRequest;
  const res = createResponse();
  let nextCalled = false;

  authMiddleware(req, res, (() => { nextCalled = true; }) as NextFunction);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body?.error, 'Invalid or expired authorization token');
  assert.equal(nextCalled, false);
});
