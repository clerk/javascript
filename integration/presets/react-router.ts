import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { linkPackage } from './utils';

const reactRouterNode = applicationConfig()
  .setName('react-router-node')
  .useTemplate(templates['react-router-node'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/react-router', constants.E2E_CLERK_JS_VERSION || linkPackage('react-router'));

const reactRouterLibrary = applicationConfig()
  .setName('react-router-library')
  .useTemplate(templates['react-router-library'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm preview')
  .addDependency('@clerk/react-router', constants.E2E_CLERK_JS_VERSION || linkPackage('react-router'));

export const reactRouter = {
  reactRouterNode,
  reactRouterLibrary,
} as const;
