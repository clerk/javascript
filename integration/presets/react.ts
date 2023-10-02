import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';

const cra = applicationConfig()
  .setName('react-cra')
  .useTemplate(templates['react-cra'])
  .setEnvFormatter('public', key => `REACT_APP_${key}`)
  .addScript('setup', 'npm ci --prefer-offline')
  .addScript('dev', 'npm run start')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run start');

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
