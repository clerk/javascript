import { applicationConfig } from '../models/applicationConfig.js';
import { templates } from '../templates/index.js';

const clerkTanStackLocal = `file:${process.cwd()}/packages/tanstack-start`;

const router = applicationConfig()
  .setName('tanstack-start-ssr')
  .useTemplate(templates['tanstack-start'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'npm i --install-links')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run start')
  .addDependency('@clerk/tanstack-start', clerkTanStackLocal);

const start = applicationConfig().clone().setName('tanstack-router').useTemplate(templates['tanstack-router']);

export const tanstack = {
  start,
  router,
} as const;
