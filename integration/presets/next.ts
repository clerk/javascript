import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { linkPackage } from './utils';

const appRouter = applicationConfig()
  .setName('next-app-router')
  .useTemplate(templates['next-app-router'])
  .setEnvFormatter('public', key => `NEXT_PUBLIC_${key}`)
  .addScript('setup', constants.E2E_NPM_FORCE ? 'pnpm install --force' : 'pnpm install')
  .addScript('dev', constants.E2E_NEXTJS_VERSION === '13' ? 'pnpm dev:webpack' : 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('next', constants.E2E_NEXTJS_VERSION)
  .addDependency('react', constants.E2E_REACT_VERSION)
  .addDependency('react-dom', constants.E2E_REACT_DOM_VERSION)
  .addDependency('@clerk/nextjs', constants.E2E_CLERK_JS_VERSION || linkPackage('nextjs'))
  .addDependency('@clerk/shared', linkPackage('shared'))
  .addDependency('@clerk/ui', linkPackage('ui'));

const appRouterTurbo = appRouter.clone().setName('next-app-router-turbopack').addScript('dev', 'pnpm dev');

const appRouterQuickstart = appRouter
  .clone()
  .setName('next-app-router-quickstart')
  .useTemplate(templates['next-app-router-quickstart']);

const appRouterAPWithClerkNextLatest = appRouterQuickstart.clone().setName('next-app-router-ap-clerk-next-latest');

const appRouterQuickstartV6 = appRouter
  .clone()
  .setName('next-app-router-quickstart-v6')
  .useTemplate(templates['next-app-router-quickstart-v6']);

const appRouterAPWithClerkNextV6 = appRouterQuickstartV6
  .clone()
  .setName('next-app-router-ap-clerk-next-v6')
  .addDependency('@clerk/nextjs', '6');

const cacheComponents = applicationConfig()
  .setName('next-cache-components')
  .useTemplate(templates['next-cache-components'])
  .setEnvFormatter('public', key => `NEXT_PUBLIC_${key}`)
  .addScript('setup', constants.E2E_NPM_FORCE ? 'pnpm install --force' : 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/nextjs', constants.E2E_CLERK_JS_VERSION || linkPackage('nextjs'))
  .addDependency('@clerk/shared', linkPackage('shared'));

export const next = {
  appRouter,
  appRouterTurbo,
  appRouterQuickstart,
  appRouterAPWithClerkNextLatest,
  appRouterAPWithClerkNextV6,
  appRouterQuickstartV6,
  cacheComponents,
} as const;
