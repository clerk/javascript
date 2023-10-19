import { envs } from './envs';
import { createLongRunningApps } from './longRunningApps';
import { next } from './next';
import { react } from './react';
import { remix } from './remix';

export const appConfigs = {
  envs,
  longRunningApps: createLongRunningApps(),
  next,
  react,
  remix,
} as const;
