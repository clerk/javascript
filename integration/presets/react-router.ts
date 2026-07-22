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

// A deliberately misconfigured app whose custom server returns ONE shared
// RouterContextProvider for every request (the getLoadContext footgun Clerk's docs warn
// against). Used by the cross-user isolation e2e to prove @clerk/react-router keeps each
// request's identity isolated even when the React Router context is shared across requests.
const reactRouterNodeSharedContext = applicationConfig()
  .setName('react-router-node-shared-context')
  .useTemplate(templates['react-router-node-shared-context'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/react-router', PKGLAB);

export const reactRouter = {
  reactRouterNode,
  reactRouterLibrary,
  reactRouterNodeSharedContext,
} as const;
