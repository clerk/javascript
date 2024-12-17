import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';

const isCI = process.env.CI === 'true';

const astroNode = applicationConfig()
  .setName('astro-node')
  .useTemplate(templates['astro-node'])
  .setEnvFormatter('public', key => `PUBLIC_${key}`)
  .addScript('setup', 'pnpm install')
  .addScript('dev', 'pnpm dev')
  .addScript('build', 'pnpm build')
  .addScript('serve', 'pnpm preview')
  .addDependency('@clerk/astro', isCI ? '*' : 'link:../../packages/astro')
  .addDependency('@clerk/types', isCI ? '*' : 'link:../../packages/types')
  .addDependency('@clerk/localizations', isCI ? '*' : 'link:../../packages/localizations');

const astroStatic = astroNode.clone().setName('astro-hybrid').useTemplate(templates['astro-hybrid']);

export const astro = {
  node: astroNode,
  static: astroStatic,
} as const;
