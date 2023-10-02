import { applicationConfig } from '../models/applicationConfig.js';
import { templates } from '../templates/index.js';

const remixNode = applicationConfig()
  .setName('remix-node')
  .useTemplate(templates['remix-node'])
  .setEnvFormatter('public', key => `${key}`)
  .addScript('setup', 'npm ci --prefer-offline')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build');
// .addScript('serve', 'npm run start');

export const remix = {
  remixNode,
} as const;
