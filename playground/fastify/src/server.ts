import 'dotenv/config';
import Fastify from 'fastify';
import { clerkPlugin, getAuth } from '@clerk/fastify';
import type { FastifyInstance } from 'fastify';

const server: FastifyInstance = Fastify({ logger: true });

server.register(clerkPlugin);

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
  handler: async (request, _reply) => {
    const auth = getAuth(request);
    console.log('====auth===', auth);
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
