import type { FastifyInstance } from 'fastify';

export const publicRoutes = async (fastify: FastifyInstance, _opts: any) => {
  fastify.get('/public', async (_req, _reply) => {
    return { hello: 'world' };
  });

  fastify.get('/home', async (_req, reply) => {
    return reply.view('/src/templates/home.ejs', {
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
      domain: process.env.CLERK_DOMAIN,
      isSatellite: process.env.CLERK_IS_SATELLITE,
      signInUrl: process.env.CLERK_SIGN_IN_URL,
    });
  });
};
