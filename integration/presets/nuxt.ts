import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';

const clerkNuxtLocal = `file:${process.cwd()}/packages/nuxt`;

const nuxtNode = applicationConfig()
  .setName('nuxt-node')
  .useTemplate(templates['nuxt-node'])
  .setEnvFormatter('public', key => `NUXT_PUBLIC_${key}`)
  .addScript('setup', 'npm i')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run preview')
  .addDependency('@clerk/nuxt', clerkNuxtLocal);

export const nuxt = {
  node: nuxtNode,
} as const;
