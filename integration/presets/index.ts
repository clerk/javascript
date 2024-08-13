import { astro } from './astro';
import { elements } from './elements';
import { envs, instanceKeys } from './envs';
import { expo } from './expo';
import { express } from './express';
import { createLongRunningApps } from './longRunningApps';
import { next } from './next';
import { react } from './react';
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
  secrets: {
    instanceKeys,
  },
} as const;
