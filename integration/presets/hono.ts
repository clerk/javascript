import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { linkPackage } from './utils';

const vite = applicationConfig()
  .setName('hono-vite')
  .useTemplate(templates['hono-vite'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/hono', linkPackage('hono'))
  .addDependency('@clerk/clerk-js', linkPackage('clerk-js'))
  .addDependency('@clerk/ui', linkPackage('ui'));

export const hono = {
  vite,
} as const;
