import { longRunningApplication } from '../models/longRunningApplication';
import { envs } from './envs';
import { next } from './next';
import { react } from './react';
import { remix } from './remix';

/**
 * A list of long-running applications that can be used in tests.
 * These are applications that are started once and then used for all tests,
 * making the tests run faster as the app doesn't need to be started for each test.
 */
const createLongRunningApps = () => {
  const configs = [
    { id: 'react.vite.withEmailCodes', config: react.vite, env: envs.withEmailCodes },
    { id: 'react.vite.withEmailLinks', config: react.vite, env: envs.withEmailLinks },
    { id: 'remix.node.withEmailCodes', config: remix.remixNode, env: envs.withEmailCodes },
    { id: 'next.appRouter.withEmailCodes', config: next.appRouter, env: envs.withEmailCodes },
  ] as const;
  const apps = configs.map(longRunningApplication);
  return {
    getById: (id: string | (typeof configs)[number]['id']) => apps.find(app => app.id === id),
  };
};

export const appConfigs = {
  envs,
  longRunningApps: createLongRunningApps(),
} as const;
