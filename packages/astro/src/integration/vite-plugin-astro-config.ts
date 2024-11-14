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
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `
          const configOutput = '${astroConfig.output}';

          export function isStaticOutput(forceStatic) {
            if (configOutput === 'hybrid' && forceStatic === undefined) {
              // Default page is prerendered in hybrid mode
              return true;
            }

            if (forceStatic !== undefined) {
              return forceStatic;
            }

            return configOutput === 'static';
          }
        `;
      }
    },
  };
}
