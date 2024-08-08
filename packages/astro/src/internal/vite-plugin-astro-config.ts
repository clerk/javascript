import type { AstroConfig } from 'astro';
import type { ViteUserConfig } from 'astro/config';

type ExtractPluginOption<T> = T extends (infer U)[] ? U : never;

export function vitePluginAstroConfig(astroConfig: AstroConfig): ExtractPluginOption<NonNullable<ViteUserConfig['plugins']>> {
  const virtualModuleId = 'virtual:astro/config';
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
        return `export default ${JSON.stringify(astroConfig)}`;
      }
    }
  };
}
