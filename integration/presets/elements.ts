import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig.js';
import { templates } from '../templates/index.js';

const clerkNextjsLocal = `file:${process.cwd()}/packages/nextjs`;
const clerkElementsLocal = `file:${process.cwd()}/packages/elements`;

const nextAppRouter = applicationConfig()
  .setName('elements-next')
  .useTemplate(templates['elements-next'])
  .setEnvFormatter('public', key => `NEXT_PUBLIC_${key}`)
  .addScript('setup', 'npm i')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run start')
  .addDependency('next', constants.E2E_NEXTJS_VERSION)
  .addDependency('@clerk/nextjs', constants.E2E_CLERK_VERSION || clerkNextjsLocal)
  .addDependency('@clerk/elements', constants.E2E_CLERK_VERSION || clerkElementsLocal);

export const elements = {
  nextAppRouter,
} as const;
