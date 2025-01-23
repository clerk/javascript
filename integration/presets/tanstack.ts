import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates/index';
import { linkPackage } from './utils';

const router = applicationConfig()
  .setName('tanstack-router')
  .useTemplate(templates['tanstack-router'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/tanstack-start', linkPackage('tanstack-start'));

const start = applicationConfig()
  .setName('tanstack-start')
  .useTemplate(templates['tanstack-start'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/tanstack-start', linkPackage('tanstack-start'));

export const tanstack = {
  start,
  router,
} as const;
