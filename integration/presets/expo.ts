import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { PKGLAB } from './utils';

const expoWeb = applicationConfig()
  .setName('expo-web')
  .useTemplate(templates['expo-web'])
  .setEnvFormatter('public', key => `EXPO_PUBLIC_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm start')
  .addDependency('@clerk/expo', PKGLAB);

export const expo = {
  expoWeb,
} as const;
