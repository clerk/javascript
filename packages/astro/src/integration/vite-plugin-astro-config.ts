import type { AstroConfig } from 'astro';

type VitePlugin = Required<AstroConfig['vite']>['plugins'][number];

/**
 * This Vite module exports a `isStaticOutput` function that is imported inside our control components
 * to determine which components to use depending on the Astro config output option.
 *
 * @param {AstroConfig} astroConfig - The Astro configuration object
 * @returns {VitePlugin} A Vite plugin
 */
export function vitePluginAstroConfig(astroConfig: AstroConfig): VitePlugin {
  const virtualModuleId = 'virtual:@clerk/astro/config';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'vite-plugin-astro-config',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    config(config) {
      // While Astro processes <script> tags by default, our control components
      // which uses <script> tags and imports nanostores will not be processed by Astro.
      // This ensures @clerk/astro/client is properly processed and bundled,
      // resolving runtime import issues in these components.
      config.optimizeDeps?.include?.push('@clerk/astro/client');
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `
          export const astroConfig = ${JSON.stringify(astroConfig)};

          export function isStaticOutput(forceStatic) {
            if (astroConfig.output === 'hybrid' && forceStatic === undefined) {
              // Default page is prerendered in hybrid mode
              return true;
            }

            if (forceStatic !== undefined) {
              return forceStatic;
            }

            return astroConfig.output === 'static';
          }
        `;
      }
    },
  };
}
