import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';

const clerkVueLocal = `file:${process.cwd()}/packages/vue`;

const vite = applicationConfig()
  .setName('vue-vite')
  .useTemplate(templates['vue-vite'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run preview')
  .addDependency('@clerk/vue', clerkVueLocal);

export const vue = {
  vite,
} as const;
