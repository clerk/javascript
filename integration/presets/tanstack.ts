import { applicationConfig } from '../models/applicationConfig.js';
import { templates } from '../templates/index.js';

const clerkTanStackLocal = `file:${process.cwd()}/packages/tanstack-start`;

const router = applicationConfig()
  .setName('tanstack-router')
  .useTemplate(templates['tanstack-router'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  // `--install-links` ensures that the @clerk/tanstack-start is installed as a regular dependancie instead of creating symlink
  // please do not remove this flag as it's going to break the setup
  .addScript('setup', 'npm i --install-links')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run start')
  .addDependency('@clerk/tanstack-start', clerkTanStackLocal);

const start = applicationConfig()
  .setName('tanstack-start')
  .useTemplate(templates['tanstack-start'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  // `--install-links` ensures that the @clerk/tanstack-start is installed as a regular dependancie instead of creating symlink
  // please do not remove this flag as it's going to break the setup
  .addScript('setup', 'npm i --install-links')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run start')
  .addDependency('@clerk/tanstack-start', clerkTanStackLocal);

export const tanstack = {
  start,
  router,
} as const;
