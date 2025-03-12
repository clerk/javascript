import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { linkPackage } from './utils';

const router = applicationConfig()
  .setName('tanstack-router')
  .useTemplate(templates['tanstack-router'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/tanstack-react-start', linkPackage('tanstack-react-start'));

const start = applicationConfig()
  .setName('tanstack-react-start')
  .useTemplate(templates['tanstack-react-start'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/tanstack-react-start', linkPackage('tanstack-react-start'));

export const tanstack = {
  start,
  router,
} as const;
