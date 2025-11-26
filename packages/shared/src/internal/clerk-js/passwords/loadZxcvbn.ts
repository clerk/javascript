import type { ModuleManager } from '@/moduleManager';
import type { ZxcvbnResult } from '@/types';

export type zxcvbnFN = (password: string, userInputs?: (string | number)[]) => ZxcvbnResult;

export const createLoadZxcvbn = (moduleManager: ModuleManager) => {
  const loadZxcvbn = () => {
    return Promise.all([
      moduleManager.import('@zxcvbn-ts/core'),
      moduleManager.import('@zxcvbn-ts/language-common'),
    ]).then(([coreModule, languageCommonModule]) => {
      if (!coreModule || !languageCommonModule) {
        throw new Error('Failed to load zxcvbn modules');
      }
      const { zxcvbnOptions, zxcvbn } = coreModule;
      const { dictionary, adjacencyGraphs } = languageCommonModule;
      zxcvbnOptions.setOptions({
        dictionary: {
          ...dictionary,
        },
        graphs: adjacencyGraphs,
      });
      return zxcvbn;
    });
  };

  return { loadZxcvbn };
};
