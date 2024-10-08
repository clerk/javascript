import type { FastifyInstance } from 'fastify';

export const publicRoutes = async (fastify: FastifyInstance, _opts: any) => {
  fastify.get('/', async (_req, _reply) => {
    return { hello: 'world' };
  });

  fastify.get('/sign-in', async (_req, reply) => {
    return reply.viewAsync('/src/templates/sign-in.ejs', {
      CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
      PUBLIC_CLERK_SIGN_IN_URL: process.env.PUBLIC_CLERK_SIGN_IN_URL,
      FRONTEND_API_URL: process.env.FRONTEND_API_URL,
    });
  });
};
