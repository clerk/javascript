import 'dotenv/config';
import Fastify from 'fastify';
import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { privateRoutes, publicRoutes } from './routes';

const server: FastifyInstance = Fastify({ logger: true });

// private routes (with clerkPlugin)
server.register(
  fp(async function (app, _opts) {
    app.register(privateRoutes);
  }),
);

// public routes (without clerkPlugin)
server.register(
  fp(async function (app, _opts) {
    app.register(publicRoutes);
  }),
);

const start = async () => {
  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
