import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { linkPackage } from './utils';

const vite = applicationConfig()
  .setName('express-vite')
  .useTemplate(templates['express-vite'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/express', linkPackage('express', 'integration'))
  .addDependency('@clerk/clerk-js', linkPackage('clerk-js', 'integration'))
  .addDependency('@clerk/ui', linkPackage('ui', 'integration'));

export const express = {
  vite,
} as const;
