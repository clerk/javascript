import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig.js';
import { templates } from '../templates/index.js';

const remixNode = applicationConfig()
  .setName('remix-node')
  .useTemplate(templates['remix-node'])
  .setEnvFormatter('public', key => `${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/remix', constants.E2E_CLERK_VERSION || '*');

export const remix = {
  remixNode,
} as const;
