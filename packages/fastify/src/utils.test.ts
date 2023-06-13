import { constants } from '@clerk/backend';
import type { FastifyReply, FastifyRequest } from 'fastify';
import Fastify from 'fastify';

import { FastifyRequestAdapter, getSingleValueFromArrayHeader } from './utils';

describe('utils', () => {
  describe('getSingleValueFromArrayHeader(value)', () => {
    test('returns value if value is not array', () => {
      expect(getSingleValueFromArrayHeader('aloha')).toEqual('aloha');
    });

    test('returns undefined if is falsy value', () => {
      expect(getSingleValueFromArrayHeader()).toBeUndefined();
      expect(getSingleValueFromArrayHeader(undefined)).toBeUndefined();
    });

    test('returns first value if value is array', () => {
      expect(getSingleValueFromArrayHeader(['aloha', '2'])).toEqual('aloha');
    });
  });

  test('FastifyRequestAdapter', async () => {
    const fastify = Fastify();

    fastify.get('/', (request: FastifyRequest, reply: FastifyReply) => {
      const requestAdapter = new FastifyRequestAdapter(request);
      expect(requestAdapter.headers(constants.Headers.Authorization)).toEqual('Bearer deadbeef');
      expect(requestAdapter.headers(constants.Headers.Origin)).toEqual('http://origin.com');
      expect(requestAdapter.headers(constants.Headers.ForwardedPort)).toEqual('1234');
      expect(requestAdapter.headers(constants.Headers.ForwardedHost)).toEqual('forwarded-host.com');
      expect(requestAdapter.headers(constants.Headers.Host)).toEqual('host.com');
      expect(requestAdapter.headers(constants.Headers.Referrer)).toEqual('referer.com');
      expect(requestAdapter.headers(constants.Headers.UserAgent)).toEqual(
        'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      );
      expect(requestAdapter.cookies(constants.Cookies.Session)).toEqual('tokenSession');
      expect(requestAdapter.cookies(constants.Cookies.ClientUat)).toEqual('tokenClientUat');
      expect(requestAdapter.searchParams()).toBeUndefined();
      reply.send({});
    });

    const response = await fastify.inject({
      method: 'GET',
      headers: {
        Authorization: 'Bearer deadbeef',
        Origin: 'http://origin.com',
        Host: 'host.com',
        'X-Forwarded-Port': '1234',
        'X-Forwarded-Host': 'forwarded-host.com',
        Referer: 'referer.com',
        'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      },
      cookies: {
        __session: 'tokenSession',
        __client_uat: 'tokenClientUat',
      },
      query: { __query: 'true' },
      url: '/',
    });

    expect(response.statusCode).toEqual(200);
  });
});
