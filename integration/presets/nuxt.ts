import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { linkPackage } from './utils';

const nuxtNode = applicationConfig()
  .setName('nuxt-node')
  .useTemplate(templates['nuxt-node'])
  .setEnvFormatter('public', key => `NUXT_PUBLIC_${key}`)
  .setEnvFormatter('private', key => `NUXT_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm preview')
  .addDependency('@clerk/nuxt', constants.E2E_CLERK_JS_VERSION || linkPackage('nuxt'));

export const nuxt = {
  node: nuxtNode,
} as const;
