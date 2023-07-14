import { longRunningApplication } from '../adapters/longRunningApplication';
import { instances } from './envs';
import { next } from './next';
import { react } from './react';
import { remix } from './remix';

export const longRunningApps = {
  next: {
    // appRouterAllEnabled: longRunningApplication(next.appRouter, instances.allEnabled),
    // appRouterEmailLink: longRunningApplication(next.appRouter, instances.withEmailLinks),
  },
  react: {
    viteAllEnabled: longRunningApplication('all-enabled', react.vite, instances.allEnabled),
    viteEmailLink: longRunningApplication('email-link', react.vite, instances.withEmailLinks),
  },
  remix: {
    remixNode: longRunningApplication('remix-node', remix.remixNode, instances.allEnabled),
    // remixNodeEmailLink: longRunningApplication('remix-node', remix.remixNode, instances.withEmailLinks),
  },
};

export const appConfigs = {
  next,
  react,
  instances,
  remix,
  longRunning: longRunningApps,
} as const;
