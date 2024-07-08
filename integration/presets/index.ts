import { elements } from './elements';
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
  secrets: {
    instanceKeys,
  },
} as const;
