import { constants } from '../constants.js';
import { applicationConfig } from '../models/applicationConfig.js';
import { templates } from '../templates/index.js';

const remixNode = applicationConfig()
  .setName('remix-node')
  .useTemplate(templates['remix-node'])
  .setEnvFormatter('public', key => `${key}`)
  .addScript('setup', 'npm i --prefer-offline')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addDependency('@clerk/remix', constants.E2E_CLERK_VERSION);
// .addScript('serve', 'npm run start');

export const remix = {
  remixNode,
} as const;
