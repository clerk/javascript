import { applicationConfig } from '../models/applicationConfig.js';
import { templates } from '../templates/index.js';

const clerkTanStackLocal = `file:${process.cwd()}/packages/tanstack-start`;

const start = applicationConfig()
  .setName('tanstack-start-ssr')
  .useTemplate(templates['tanstack-start'])
  .setEnvFormatter('public', key => `${key}`)
  .addScript('setup', 'npm i')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run start')
  .addDependency('@clerk/tanstack-start', clerkTanStackLocal);

export const tanstack = {
  start,
} as const;
