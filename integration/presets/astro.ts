import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';
import { linkPackage } from './utils';

const astroNode = applicationConfig()
  .setName('astro-node')
  .useTemplate(templates['astro-node'])
  .setEnvFormatter('public', key => `PUBLIC_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm preview')
  .addDependency('@clerk/astro', linkPackage('astro'))
  .addDependency('@clerk/shared', linkPackage('shared'))
  .addDependency('@clerk/localizations', linkPackage('localizations'));

const astroStatic = astroNode.clone().setName('astro-hybrid').useTemplate(templates['astro-hybrid']);

export const astro = {
  node: astroNode,
  static: astroStatic,
} as const;
