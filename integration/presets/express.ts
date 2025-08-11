import { constants } from '../constants';
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
  .addDependency('@clerk/express', constants.E2E_CLERK_VERSION || linkPackage('express'))
  .addDependency('@clerk/clerk-js', constants.E2E_CLERK_VERSION || linkPackage('clerk-js'));

export const express = {
  vite,
} as const;
