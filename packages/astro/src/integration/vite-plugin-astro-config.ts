import type { AstroConfig } from 'astro';

type VitePlugin = Required<AstroConfig['vite']>['plugins'][number];

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
