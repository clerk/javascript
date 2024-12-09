import { astro } from './astro';
import { elements } from './elements';
import { envs, instanceKeys } from './envs';
import { expo } from './expo';
import { express } from './express';
import { createLongRunningApps } from './longRunningApps';
import { next } from './next';
import { nuxt } from './nuxt';
import { react } from './react';
import { reactRouter } from './react-router';
import { remix } from './remix';
import { tanstack } from './tanstack';

export const appConfigs = {
  envs,
  express,
  longRunningApps: createLongRunningApps(),
  next,
  react,
  remix,
  elements,
  expo,
  astro,
  tanstack,
  nuxt,
  reactRouter,
  secrets: {
    instanceKeys,
  },
} as const;
