import 'dotenv/config';
import Fastify, { FastifyInstance } from 'fastify';
import { withAuth } from '@clerk/clerk-sdk-node';
import type { WithAuthProp } from '@clerk/clerk-sdk-node';
import type { FastifyRequest, FastifyReply } from 'fastify';

const server: FastifyInstance = Fastify({ logger: true });

server.addHook('onRequest', async (_: any, reply: any) => {
  // reply.setHeader = reply.raw.setHeader.bind(reply.raw);
  // reply.writeHead = reply.raw.writeHead.bind(reply.raw);
  // reply.end = reply.raw.end.bind(reply.raw);

  reply.setHeader = (...args: any[]) => reply.raw.setHeader(...args);
  reply.writeHead = (...args: any[]) => reply.raw.writeHead(...args);
  reply.end = (...args: any[]) => reply.raw.end(...args);
});

server.route({
  method: 'GET',
  url: '/',
  schema: {
    // request needs to have a querystring with a `name` parameter
    querystring: {
      name: { type: 'string' },
    },
    // the response needs to be an object with an `hello` property of type 'string'
    response: {
      200: {
        type: 'object',
        properties: {
          hello: { type: 'string' },
        },
      },
    },
  },
  // this function is executed for every request before the handler is executed
  preHandler: withAuth<FastifyRequest, FastifyReply>((request: WithAuthProp<FastifyRequest>, reply: FastifyReply) => {
    const { sessionId } = request.auth;
    console.log({ sessionId });
    if (!sessionId) {
      reply.status(401);
      reply.send({ error: 'User could not be verified' });
    }
  }),
  // @ts-ignore
  handler: async (request, reply) => {
    return { hello: 'world' };
  },
});

const start = async () => {
  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
