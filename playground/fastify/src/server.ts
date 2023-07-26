import './loadEnv';

import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { privateRoutes, publicRoutes } from './routes';
import FastifyView from '@fastify/view';
import * as ejs from 'ejs';

const server: FastifyInstance = Fastify({ logger: true });

// ejs view engine to render templates
server.register(FastifyView, { engine: { ejs } });

// private routes (with clerkPlugin)
server.register(privateRoutes);

// public routes (without clerkPlugin)
server.register(publicRoutes);

const start = async () => {
  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
