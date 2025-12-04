import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { linkPackage } from './utils';

const cra = applicationConfig()
  .setName('react-cra')
  .useTemplate(templates['react-cra'])
  .setEnvFormatter('public', key => `REACT_APP_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm start')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/react', linkPackage('react', 'integration'))
  .addDependency('@clerk/shared', linkPackage('shared', 'integration'))
  .addDependency('@clerk/ui', linkPackage('ui', 'integration'));

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
