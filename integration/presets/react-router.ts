import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { PKGLAB } from './utils';

const reactRouterNode = applicationConfig()
  .setName('react-router-node')
  .useTemplate(templates['react-router-node'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/react-router', PKGLAB);

const reactRouterLibrary = applicationConfig()
  .setName('react-router-library')
  .useTemplate(templates['react-router-library'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm preview')
  .addDependency('@clerk/react-router', PKGLAB);

export const reactRouter = {
  reactRouterNode,
  reactRouterLibrary,
} as const;
