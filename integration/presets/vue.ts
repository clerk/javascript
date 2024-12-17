import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';

const isCI = process.env.CI === 'true';

const vite = applicationConfig()
  .setName('vue-vite')
  .useTemplate(templates['vue-vite'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm preview')
  .addDependency('@clerk/vue', isCI ? '*' : 'link:../../packages/vue');

export const vue = {
  vite,
} as const;
