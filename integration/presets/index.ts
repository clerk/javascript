import { astro } from './astro';
import { customFlows } from './custom-flows';
import { envs, instanceKeys } from './envs';
import { expo } from './expo';
import { express } from './express';
import { createLongRunningApps } from './longRunningApps';
import { next } from './next';
import { nuxt } from './nuxt';
import { react } from './react';
import { reactRouter } from './react-router';
import { tanstack } from './tanstack';
import { vue } from './vue';

export const appConfigs = {
  customFlows,
  envs,
  express,
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
