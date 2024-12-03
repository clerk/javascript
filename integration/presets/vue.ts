import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';

const vite = applicationConfig()
  .setName('vue-vite')
  .useTemplate(templates['vue-vite'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm preview')
  .addDependency('@clerk/vue', '*');

export const vue = {
  vite,
} as const;
