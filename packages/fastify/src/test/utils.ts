import type { FastifyInstance } from 'fastify';
import { vi } from 'vitest';

// expose decorated reply methods as methods in fastify instance
export function createFastifyInstanceMock() {
  const fastify = {
    decorateReply: vi.fn((name: string, fn) => {
      // @ts-expect-error - TS7053
      fastify[name] = fn;
    }),
    addHook: vi.fn((name: string, fn) => {
      // @ts-expect-error - TS7053
      fastify[name] = fastify[name] || [];
      // @ts-expect-error - TS7053
      fastify[name].push(fn);
    }),
    decorateRequest: vi.fn((name: string, fn) => {
      // @ts-expect-error - TS7053
      fastify[name] = fn;
    }),
  } as any as FastifyInstance;

  return fastify;
}
