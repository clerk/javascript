import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { PKGLAB } from './utils';

const vite = applicationConfig()
  .setName('chrome-extension-vite')
  .useTemplate(templates['chrome-extension-vite'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm build')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'echo noop')
  .addDependency('@clerk/chrome-extension', PKGLAB)
  .addDependency('@clerk/clerk-js', PKGLAB)
  .addDependency('@clerk/ui', PKGLAB);

export const chromeExtension = {
  vite,
} as const;
