import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { linkPackage } from './utils';

const expoWeb = applicationConfig()
  .setName('expo-web')
  .useTemplate(templates['expo-web'])
  .setEnvFormatter('public', key => `EXPO_PUBLIC_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/expo', linkPackage('expo'));

export const expo = {
  expoWeb,
} as const;
