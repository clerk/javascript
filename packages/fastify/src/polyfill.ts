import type { FastifyInstance, FastifyReply } from 'fastify';

export const polyfillServerResponseMethods = (instance: FastifyInstance) => {
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
