import type { ZxcvbnResult } from '@zxcvbn-ts/core';

export type zxcvbnFN = (password: string, userInputs?: (string | number)[]) => ZxcvbnResult;

export const loadZxcvbn = () => {
  return Promise.all([import('@zxcvbn-ts/core'), import('@zxcvbn-ts/language-common')]).then(
    ([coreModule, languageCommonModule]) => {
      const { zxcvbnOptions, zxcvbn } = coreModule;
      const { dictionary, adjacencyGraphs } = languageCommonModule;
      zxcvbnOptions.setOptions({
        dictionary: {
          ...dictionary,
        },
        graphs: adjacencyGraphs,
      });
      return zxcvbn;
    },
  );
};
