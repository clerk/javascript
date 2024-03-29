import type { ZxcvbnResult } from '@clerk/types';

export type zxcvbnFN = (password: string, userInputs?: (string | number)[]) => ZxcvbnResult;

export const loadZxcvbn = () => {
  return loadLib().then(([coreModule, languageCommonModule]) => {
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

// We can only dynamically import zxcvbn in the browser.
// On the headless variant we need to require it, and
// this is because import() uses the document object
// which is not available in Expo or other native environments.
const loadLib = () => {
  let core;
  let languageCommon;
  if (__IS_NATIVE__) {
    core = require('@zxcvbn-ts/core');
    languageCommon = require('@zxcvbn-ts/language-common');
  } else {
    core = import('@zxcvbn-ts/core');
    languageCommon = import('@zxcvbn-ts/language-common');
  }
  return Promise.all([core, languageCommon]);
};
