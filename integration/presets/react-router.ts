import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig.js';
import { templates } from '../templates/index.js';
import { linkPackage } from './utils';

const reactRouterNode = applicationConfig()
  .setName('react-router-node')
  .useTemplate(templates['react-router-node'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/react-router', constants.E2E_CLERK_VERSION || linkPackage('react-router'));

export const reactRouter = {
  reactRouterNode,
} as const;
