import type { ZxcvbnResult } from '@clerk/types';

export type zxcvbnFN = (password: string, userInputs?: (string | number)[]) => ZxcvbnResult;

export const loadZxcvbn = async () => {
  const { core, languageCommon } = await loadLib();
  const { zxcvbnOptions, zxcvbn } = core;
  const { dictionary, adjacencyGraphs } = languageCommon;
  zxcvbnOptions.setOptions({
    dictionary: {
      ...dictionary,
    },
    graphs: adjacencyGraphs,
  });
  return zxcvbn;
};

// We can only dynamically import zxcvbn in the browser.
// On the headless variant we need to require it, and
// this is because import() uses the document object
// which is not available in Expo or other native environments.
const loadLib = async () => {
  let core;
  let languageCommon;
  if (__IS_NATIVE__) {
    core = require('@zxcvbn-ts/core');
    languageCommon = require('@zxcvbn-ts/language-common');
  } else {
    core = await import('@zxcvbn-ts/core');
    languageCommon = await import('@zxcvbn-ts/language-common');
  }
  return { core, languageCommon };
};
