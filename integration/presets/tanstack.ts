import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { linkPackage } from './utils';

const reactRouter = applicationConfig()
  .setName('tanstack-react-router')
  .useTemplate(templates['tanstack-react-router'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/tanstack-react-start', linkPackage('tanstack-react-start'));

const reactStart = applicationConfig()
  .setName('tanstack-react-start')
  .useTemplate(templates['tanstack-react-start'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/tanstack-react-start', linkPackage('tanstack-react-start'));

export const tanstack = {
  reactStart,
  reactRouter,
} as const;
