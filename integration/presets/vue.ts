import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { linkPackage } from './utils';

const vite = applicationConfig()
  .setName('vue-vite')
  .useTemplate(templates['vue-vite'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm preview')
  .addDependency('@clerk/vue', constants.E2E_CLERK_JS_VERSION || linkPackage('vue'))
  .addDependency('@clerk/localizations', linkPackage('localizations'));

export const vue = {
  vite,
} as const;
