import { applicationConfig } from '../models/applicationConfig.js';
import { templates } from '../templates/index.js';

const appRouter = applicationConfig()
  .setName('next-app-router')
  .useTemplate(templates['next-app-router'])
  .setEnvFormatter('public', key => `NEXT_PUBLIC_${key}`)
  .addScript('setup', 'npm ci --prefer-offline')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run start');

const appRouterTurbo = appRouter
  .clone()
  .setName('next-app-router-turbopack')
  .addScript('dev', 'npm run dev -- --turbo');

export const next = {
  appRouter,
  appRouterTurbo,
} as const;
