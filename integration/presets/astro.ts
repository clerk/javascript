import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';

const clerkAstroLocal = `file:${process.cwd()}/packages/astro`;
const clerkTypesLocal = `file:${process.cwd()}/packages/types`;
const clerkLocalizationLocal = `file:${process.cwd()}/packages/localizations`;

const astroNode = applicationConfig()
  .setName('astro-node')
  .useTemplate(templates['astro-node'])
  .setEnvFormatter('public', key => `PUBLIC_${key}`)
  .addScript('setup', 'npm i')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run preview')
  .addDependency('@clerk/astro', clerkAstroLocal)
  .addDependency('@clerk/types', clerkTypesLocal)
  .addDependency('@clerk/localizations', clerkLocalizationLocal);

export const astro = {
  node: astroNode,
};
