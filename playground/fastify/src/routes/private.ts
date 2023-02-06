import type { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';
import { clerkPlugin, getAuth } from '@clerk/fastify';

export const privateRoutes = async (fastify: FastifyInstance, _opts: any) => {
  fastify.register(clerkPlugin);

  fastify.get('/private', async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = getAuth(req);

    if (!auth.userId) {
      return reply.code(403);
    }

    return { hello: 'world', auth };
  });
};
