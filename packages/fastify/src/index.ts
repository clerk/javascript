import type { WithAuthProp } from '@clerk/clerk-sdk-node';
import { withAuth as _withAuth } from '@clerk/clerk-sdk-node';
import type { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import { clerkClient } from './clerk';
import { API_KEY, Cookies, FRONTEND_API, Headers, PUBLISHABLE_KEY, SECRET_KEY } from './constants';
import { getCookie, getSingleValueFromArrayHeader } from './utils';

const polyfillServerResponseMethods = (instance: FastifyInstance) => {
  instance.decorateReply('setHeader', (reply: FastifyReply, ...args: any[]) => {
    //@ts-ignore
    return reply.raw.setHeader(...args);
  });
  instance.decorateReply('writeHead', (reply: FastifyReply, ...args: any[]) => {
    //@ts-ignore
    return reply.raw.writeHead(...args);
  });
  instance.decorateReply('end', (reply: FastifyReply, ...args: any[]) => {
    return reply.raw.end(...args);
  });
};

const clerkWithMiddleware = (opts: Record<never, never>) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    // get auth state, check if we need to return an interstitial
    const cookieToken = getCookie(req, Cookies.Session);
    const headerToken = req.headers['authorization']?.replace('Bearer ', '');

    const forwardedPort = getSingleValueFromArrayHeader(req.headers['x-forwarded-port']);
    const forwardedHost = getSingleValueFromArrayHeader(req.headers['x-forwarded-host']);

    const requestState = await clerkClient.authenticateRequest({
      ...opts,
      apiKey: API_KEY,
      secretKey: SECRET_KEY,
      frontendApi: FRONTEND_API,
      publishableKey: PUBLISHABLE_KEY,
      cookieToken,
      headerToken,
      clientUat: getCookie(req, Cookies.ClientUat),
      origin: req.headers['origin'] || undefined,
      host: req.headers['host'] as string,
      forwardedPort,
      forwardedHost,
      referrer: req.headers['referer'] || undefined,
      userAgent: req.headers['user-agent'] || undefined,
    });

    // Interstitial cases
    if (requestState.isUnknown) {
      reply
        .code(401)
        .header(Headers.AuthReason, requestState.reason)
        .header(Headers.AuthMessage, requestState.message)
        .send();
      return;
    } else if (requestState.isInterstitial) {
      const interstitialHtmlPage = clerkClient.localInterstitial({
        frontendApi: FRONTEND_API,
        publishableKey: PUBLISHABLE_KEY,
      });
      reply
        .code(401)
        .header(Headers.AuthReason, requestState.reason)
        .header(Headers.AuthMessage, requestState.message)
        .type('text/html')
        .send(interstitialHtmlPage);
      return;
    }

    // TODO: @dimkl drop ts-ignore from next line
    // @ts-ignore
    req.auth = requestState.toAuth();
  };
};

const plugin: FastifyPluginCallback = (instance: FastifyInstance, opts, done) => {
  polyfillServerResponseMethods(instance);
  instance.decorateRequest('auth', null);
  // run clerk as a middleware to all scoped routes
  instance.addHook('preHandler', clerkWithMiddleware(opts));

  done();
};

export const clerkPlugin = fp(plugin, {
  name: '@clerk/fastify',
  fastify: '4.x',
});

export const getAuth = (req: FastifyRequest) => {
  const authReq = req as WithAuthProp<FastifyRequest>;
  return authReq.auth || {};
};

export const withAuth = _withAuth<FastifyRequest, FastifyReply>;
