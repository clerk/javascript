import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';

// const clerkAstroLocal = `file:${process.cwd()}/packages/astro`;
// const clerkTypesLocal = `file:${process.cwd()}/packages/types`;
// const clerkLocalizationLocal = `file:${process.cwd()}/packages/localizations`;

const astroNode = applicationConfig()
  .setName('astro-node')
  .useTemplate(templates['astro-node'])
  .setEnvFormatter('public', key => `PUBLIC_ASTRO_APP_${key}`)
  .addScript('setup', 'npm i')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run preview')
  .addDependency('@clerk/astro', '0.0.1-canary.ve8a2af5')
  .addDependency('@clerk/types', '4.6.1')
  .addDependency('@clerk/localizations', '2.4.6');

export const astro = {
  node: astroNode,
};
