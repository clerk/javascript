import { resolve } from 'node:path';

import { expect, test } from 'vitest';

import { NATIVE_MODULES, nativeModuleContractErrors, shippedNativeFunctions } from './nativeModuleContract';

const root = resolve(__dirname, '../../../../..');

test.each(NATIVE_MODULES)(
  '$spec matches $native and the latest $release release',
  ({ module, release, spec, native }) => {
    const shipped = shippedNativeFunctions(root, release, native);
    expect(nativeModuleContractErrors({ root, module, spec, native, shipped })).toEqual([]);
  },
);
