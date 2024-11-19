import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig.js';
import { templates } from '../templates/index.js';

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
  .addDependency('@clerk/nextjs', constants.E2E_CLERK_VERSION || '*')
  .addDependency('@clerk/elements', constants.E2E_CLERK_VERSION || '*');

export const elements = {
  nextAppRouter,
} as const;
