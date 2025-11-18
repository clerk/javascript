import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { linkPackage } from './utils';

const nextAppRouter = applicationConfig()
  .setName('elements-next')
  .useTemplate(templates['elements-next'])
  .setEnvFormatter('public', key => `NEXT_PUBLIC_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('next', constants.E2E_NEXTJS_VERSION)
  .addDependency('react', constants.E2E_REACT_VERSION)
  .addDependency('react-dom', constants.E2E_REACT_DOM_VERSION)
  .addDependency('@clerk/nextjs', constants.E2E_CLERK_JS_VERSION || linkPackage('nextjs'))
  .addDependency('@clerk/elements', constants.E2E_CLERK_JS_VERSION || linkPackage('elements'));

export const elements = {
  nextAppRouter,
} as const;
