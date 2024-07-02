import { astro } from './astro';
import { elements } from './elements';
import { expo } from './expo';
import { envs, instanceKeys } from './envs';
import { express } from './express';
import { createLongRunningApps } from './longRunningApps';
import { next } from './next';
import { react } from './react';
import { remix } from './remix';

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
  secrets: {
    instanceKeys,
  },
} as const;
