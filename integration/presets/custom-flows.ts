import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { PKGLAB } from './utils';

const reactVite = applicationConfig()
  .setName('custom-flows-react-vite')
  .useTemplate(templates['custom-flows-react-vite'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm preview')
  .addDependency('@clerk/react', PKGLAB)
  .addDependency('@clerk/shared', PKGLAB)
  .addDependency('@clerk/ui', PKGLAB);

export const customFlows = {
  reactVite,
} as const;
