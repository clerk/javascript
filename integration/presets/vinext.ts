import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { linkPackage } from './utils';

const app = applicationConfig()
  .setName('vinext-app')
  .useTemplate(templates['vinext-app'])
  .setEnvFormatter('public', key => `NEXT_PUBLIC_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/nextjs', linkPackage('nextjs'))
  .addDependency('@clerk/shared', linkPackage('shared'));

export const vinext = { app } as const;
