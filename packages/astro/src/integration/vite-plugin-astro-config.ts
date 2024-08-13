import type { AstroConfig } from 'astro';
import type { ViteUserConfig } from 'astro/config';

type ExtractPluginOption<T> = T extends (infer U)[] ? U : never;

export function vitePluginAstroConfig(
  astroConfig: AstroConfig,
): ExtractPluginOption<NonNullable<ViteUserConfig['plugins']>> {
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
      // This is necessary because it does not work in dev mode without pre-bundling.
      // We use it in our CSR control components.
      config.optimizeDeps?.include?.push('@clerk/astro/client');
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `
          export const astroConfig = ${JSON.stringify(astroConfig)};

          export function isStaticOutput(forceStatic) {
            if (astroConfig.output === 'hybrid' && forceStatic === undefined) {
              return 'server';
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
