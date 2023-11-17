import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig.js';
import { templates } from '../templates/index.js';

const clerkRemixLocal = `file:${process.cwd()}/packages/remix`;
const remixNode = applicationConfig()
  .setName('remix-node')
  .useTemplate(templates['remix-node'])
  .setEnvFormatter('public', key => `${key}`)
  .addScript('setup', 'npm i --prefer-offline')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run start')
  .addDependency('@clerk/remix', constants.E2E_CLERK_VERSION || clerkRemixLocal);

export const remix = {
  remixNode,
} as const;
