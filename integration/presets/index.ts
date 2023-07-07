import { longRunningApplication } from '../adapters/longRunningApplication';
import { instances } from './envs';
import { next } from './next';
import { react } from './react';

export const appConfigs = {
  next,
  react,
  instances,
} as const;

export const longRunningApps = {
  next: {
    // appRouterAllEnabled: longRunningApplication(next.appRouter, instances.allEnabled),
    // appRouterEmailLink: longRunningApplication(next.appRouter, instances.withEmailLinks),
  },
  react: {
    viteAllEnabled: longRunningApplication('all-enabled', react.vite, instances.allEnabled),
    viteEmailLink: longRunningApplication('email-link', react.vite, instances.withEmailLinks),
  },
};
