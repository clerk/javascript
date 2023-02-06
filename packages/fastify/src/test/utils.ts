import type { FastifyInstance } from 'fastify';

// expose decorated reply methods as methods in fastify instance
export function createFastifyInstanceMock() {
  const fastify = {
    decorateReply: jest.fn((name: string, fn) => {
      // @ts-ignore
      fastify[name] = fn;
    }),
    addHook: jest.fn((name: string, fn) => {
      // @ts-ignore
      fastify[name] = fastify[name] || [];
      // @ts-ignore
      fastify[name].push(fn);
    }),
    decorateRequest: jest.fn((name: string, fn) => {
      // @ts-ignore
      fastify[name] = fn;
    }),
  } as any as FastifyInstance;

  return fastify;
}
