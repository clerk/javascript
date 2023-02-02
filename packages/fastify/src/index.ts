import { createClerkClient } from '@clerk/clerk-sdk-node';
import type { FastifyPluginCallback } from 'fastify';

const clerkClient = createClerkClient({});

export const plugin: FastifyPluginCallback = (instance, opts, done) => {
  instance.decorate('auth', {});
  instance.get('/', (request, reply) => {
    console.log(clerkClient);
    console.log(request.url);
    reply.serialize({ hello: 'there' });
  });
  done();
};
