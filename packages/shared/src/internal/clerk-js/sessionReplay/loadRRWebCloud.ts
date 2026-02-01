import type { ModuleManager } from '@/moduleManager';

export type RRWebCloudModule = typeof import('@rrwebcloud/js-client');

export const createLoadRRWebCloud = (moduleManager: ModuleManager) => {
  const loadRRWebCloud = (): Promise<RRWebCloudModule> => {
    return moduleManager.import('@rrwebcloud/js-client').then(module => {
      if (!module) {
        throw new Error('Failed to load @rrwebcloud/js-client module');
      }
      return module;
    });
  };

  return { loadRRWebCloud };
};
