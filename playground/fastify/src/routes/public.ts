import type { FastifyInstance } from 'fastify';

export const publicRoutes = async (fastify: FastifyInstance, _opts: any) => {
  fastify.get('/public', async (_req, _reply) => {
    return { hello: 'world' };
  });
};
