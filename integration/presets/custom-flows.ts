import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { linkPackage } from './utils';

const reactVite = applicationConfig()
  .setName('custom-flows-react-vite')
  .useTemplate(templates['custom-flows-react-vite'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm preview')
  .addDependency('@clerk/react', constants.E2E_CLERK_JS_VERSION || linkPackage('react'))
  .addDependency('@clerk/themes', constants.E2E_CLERK_JS_VERSION || linkPackage('themes'));

export const customFlows = {
  reactVite,
} as const;
