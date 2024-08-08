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
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `
          export const astroConfig = ${JSON.stringify(astroConfig)};

          export function isStaticOutput(forceStatic) {
            if (astroConfig.output === 'hybrid' && forceStatic === undefined) {
              throw new Error('Please specify if component should be in static or server mode.');
            }

            if (forceStatic !== undefined) {
              return forceClient;
            }

            return astroConfig.output === 'static';
          }
        `;
      }
    },
  };
}
