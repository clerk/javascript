import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';

const cra = applicationConfig()
  .setName('react-cra')
  .useTemplate(templates['react-cra'])
  .setEnvFormatter('public', key => `REACT_APP_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm start')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/clerk-react', constants.E2E_CLERK_VERSION || '*')
  .addDependency('@clerk/themes', constants.E2E_CLERK_VERSION || '*');

const vite = cra
  .clone()
  .setName('react-vite')
  .useTemplate(templates['react-vite'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('dev', 'pnpm dev')
  .addScript('serve', 'pnpm preview');

export const react = {
  cra,
  vite,
} as const;
