import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';

const clerkAstroLocal = `file:${process.cwd()}/packages/astro`;
const clerkTypesLocal = `file:${process.cwd()}/packages/types`;
const clerkLocalizationLocal = `file:${process.cwd()}/packages/localizations`;

const astroNode = applicationConfig()
  .setName('astro-node')
  .useTemplate(templates['astro-node'])
  .setEnvFormatter('public', key => `PUBLIC_${key}`)
  // When creating symlinks, the Astro vite plugin is unable to process `<script>` tags.
  // Without `--install-link`, it throws this error:
  // https://github.com/withastro/astro/blob/cb98b74881355de9ec9d90a613a3f1d27d154463/packages/astro/src/vite-plugin-astro/index.ts#L114
  .addScript('setup', 'npm i --install-links')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run preview')
  .addDependency('@clerk/astro', clerkAstroLocal)
  .addDependency('@clerk/types', clerkTypesLocal)
  .addDependency('@clerk/localizations', clerkLocalizationLocal);

const astroStatic = astroNode.clone().setName('astro-hybrid').useTemplate(templates['astro-hybrid']);

export const astro = {
  node: astroNode,
  static: astroStatic,
} as const;
