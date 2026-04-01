import { astro } from './astro';
import { chromeExtension } from './chrome-extension';
import { customFlows } from './custom-flows';
import { envs, instanceKeys } from './envs';
import { expo } from './expo';
import { express } from './express';
import { fastify } from './fastify';
import { hono } from './hono';
import { createLongRunningApps } from './longRunningApps';
import { next } from './next';
import { nuxt } from './nuxt';
import { react } from './react';
import { reactRouter } from './react-router';
import { tanstack } from './tanstack';
import { vue } from './vue';

export const appConfigs = {
  chromeExtension,
  customFlows,
  envs,
  express,
  fastify,
  hono,
  longRunningApps: createLongRunningApps(),
  next,
  react,
  expo,
  astro,
  tanstack,
  nuxt,
  vue,
  reactRouter,
  secrets: {
    instanceKeys,
  },
} as const;
