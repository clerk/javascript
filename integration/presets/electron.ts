import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { PKGLAB } from './utils';

const vite = applicationConfig()
  .setName('electron-vite')
  .useTemplate(templates['electron-vite'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm build')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'echo noop')
  .addDependency('@clerk/electron', PKGLAB);

export const electron = {
  vite,
} as const;
