import { applicationConfig } from '../models/applicationConfig.js';
import { templates } from '../templates/index.js';

const clerkTanStackLocal = `file:${process.cwd()}/packages/tanstack-start`;

const router = applicationConfig()
  .setName('tanstack-router')
  .useTemplate(templates['tanstack-router'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/tanstack-start', clerkTanStackLocal);

const start = applicationConfig()
  .setName('tanstack-start')
  .useTemplate(templates['tanstack-start'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/tanstack-start', clerkTanStackLocal);

export const tanstack = {
  start,
  router,
} as const;
