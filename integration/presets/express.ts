import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';

const clerkNodeLocal = `file:${process.cwd()}/packages/sdk-node`;
const vite = applicationConfig()
  .setName('express-vite')
  .useTemplate(templates['express-vite'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('setup', 'npm i --prefer-offline')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run start')
  .addDependency('@clerk/clerk-sdk-node', constants.E2E_CLERK_VERSION || clerkNodeLocal);

export const express = {
  vite,
} as const;
