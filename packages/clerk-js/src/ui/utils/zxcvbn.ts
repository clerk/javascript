import type { Options, ZxcvbnResult } from '@zxcvbn-ts/core';

import { loadScript } from '../../utils';

export type zxcvbnFN = (password: string, userInputs?: (string | number)[]) => ZxcvbnResult;

declare global {
  export interface Window {
    zxcvbnts: {
      core: {
        zxcvbn: zxcvbnFN;
        zxcvbnOptions: {
          setOptions: (options: Partial<Options>) => void;
        };
      };
      'language-common'?: {
        dictionary: Options['dictionary'];
        adjacencyGraphs: Options['graphs'];
      };
    };
  }
}

export const loadZxcvbn = () => {
  return Promise.all([
    loadScript('https://cdn.jsdelivr.net/npm/@zxcvbn-ts/core@2.2.1/dist/zxcvbn-ts.min.js', {
      globalObject: window.zxcvbnts,
    }),
    loadScript('https://cdn.jsdelivr.net/npm/@zxcvbn-ts/language-common@2.0.1/dist/zxcvbn-ts.min.js', {
      globalObject: window.zxcvbnts,
    }),
  ]).then(() => {
    const core = window.zxcvbnts.core;
    const zxcvbnCommonPackage = window.zxcvbnts['language-common'];
    core.zxcvbnOptions.setOptions({
      dictionary: {
        ...zxcvbnCommonPackage?.dictionary,
      },
      graphs: zxcvbnCommonPackage?.adjacencyGraphs,
    });
    return core.zxcvbn;
  });
};
