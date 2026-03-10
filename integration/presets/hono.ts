import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { PKGLAB } from './utils';

const vite = applicationConfig()
  .setName('hono-vite')
  .useTemplate(templates['hono-vite'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/hono', PKGLAB)
  .addDependency('@clerk/clerk-js', PKGLAB)
  .addDependency('@clerk/ui', PKGLAB);

export const hono = {
  vite,
} as const;
