jest.mock('./withClerkMiddleware', () => {
  return {
    withClerkMiddleware: () => 'withClerkMiddlewareMocked',
  };
});

import type { FastifyRequest } from 'fastify';

import * as api from './index';
import { createFastifyInstanceMock } from './test/utils';

describe('@clerk/fastify', () => {
  xtest('exports clerkPlugin, getAuth', () => {
    expect(api).toMatchSnapshot();
  });

  describe('clerkPlugin()', () => {
    test('adds withClerkMiddleware as preHandler', () => {
      const doneFn = jest.fn();
      const fastify = createFastifyInstanceMock();

      api.clerkPlugin(fastify, {}, doneFn);

      expect(fastify.addHook).toBeCalledWith('preHandler', 'withClerkMiddlewareMocked');
      expect(doneFn).toBeCalled();
    });

    test('adds auth decorator', () => {
      const doneFn = jest.fn();
      const fastify = createFastifyInstanceMock();

      api.clerkPlugin(fastify, {}, doneFn);

      expect(fastify.decorateRequest).toBeCalledWith('auth', null);
      expect(doneFn).toBeCalled();
    });

    test('polyfills reply with server response methods', () => {
      const doneFn = jest.fn();
      const fastify = createFastifyInstanceMock();

      api.clerkPlugin(fastify, {}, doneFn);

      expect(fastify.decorateReply).toMatchSnapshot();
    });
  });

  describe('getAuth(req)', () => {
    test('returns req.auth', () => {
      const req = { key1: 'asa', auth: 'authObj' } as any as FastifyRequest;

      expect(api.getAuth(req)).toEqual('authObj');
    });

    test('throws error if clerkPlugin is on registered', () => {
      const req = { key1: 'asa' } as any as FastifyRequest;

      expect(() => api.getAuth(req)).toThrowErrorMatchingSnapshot();
    });
  });
});
