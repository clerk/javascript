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
  .addDependency('@clerk/backend', linkPackage('backend'))
  .addDependency('@clerk/shared', linkPackage('shared'))
  .addDependency('@clerk/localizations', linkPackage('localizations'))
  // Resolutions ensure the tarball's transitive dependencies use our local packages
  .addResolution('@clerk/backend', linkPackage('backend'))
  .addResolution('@clerk/shared', linkPackage('shared'));

const astroStatic = astroNode.clone().setName('astro-hybrid').useTemplate(templates['astro-hybrid']);

export const astro = {
  node: astroNode,
  static: astroStatic,
} as const;
