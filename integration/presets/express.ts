import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';

const isCI = process.env.CI === 'true';

const vite = applicationConfig()
  .setName('express-vite')
  .useTemplate(templates['express-vite'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/clerk-sdk-node', constants.E2E_CLERK_VERSION || isCI ? '*' : 'link:../../packages/sdk-node');

export const express = {
  vite,
} as const;
