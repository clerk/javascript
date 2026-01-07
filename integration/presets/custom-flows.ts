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
  .addDependency('@clerk/react', linkPackage('react'))
  .addDependency('@clerk/shared', linkPackage('shared'))
  .addDependency('@clerk/ui', linkPackage('ui'));

export const customFlows = {
  reactVite,
} as const;
