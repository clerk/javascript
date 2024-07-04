import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';

const clerkExpoLocal = `file:${process.cwd()}/packages/expo`;

const expoWeb = applicationConfig()
  .setName('expo-web')
  .useTemplate(templates['expo-web'])
  .setEnvFormatter('public', key => `EXPO_PUBLIC_${key}`)
  .addScript('setup', 'npm i')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run start')
  .addDependency('@clerk/clerk-expo', clerkExpoLocal);

export const expo = {
  expoWeb,
} as const;
