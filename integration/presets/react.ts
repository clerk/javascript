import { constants } from '../constants';
import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';

const cra = applicationConfig()
  .setName('react-cra')
  .useTemplate(templates['react-cra'])
  .setEnvFormatter('public', key => `REACT_APP_${key}`)
  .addScript('setup', 'npm i --prefer-offline')
  .addScript('dev', 'npm run start')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run start')
  .addDependency('@clerk/clerk-react', constants.E2E_CLERK_VERSION)
  .addDependency('@clerk/themes', constants.E2E_CLERK_VERSION);

const vite = cra
  .clone()
  .setName('react-vite')
  .useTemplate(templates['react-vite'])
  .setEnvFormatter('public', key => `VITE_${key}`)
  .addScript('dev', 'npm run dev')
  .addScript('serve', 'npm run preview');

export const react = {
  cra,
  vite,
} as const;
