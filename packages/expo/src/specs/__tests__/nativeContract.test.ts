import { resolve } from 'node:path';

import { expect, test } from 'vitest';

import { NATIVE_MODULES, nativeModuleContractErrors } from './nativeModuleContract';
import shippedNativeApi from './shipped-native-api.json';

const root = resolve(__dirname, '../../../../..');

test.each(NATIVE_MODULES)(
  '$spec matches $native and the shipped $platform binary',
  ({ module, platform, spec, native }) => {
    const shipped = shippedNativeApi[module][platform];
    expect(nativeModuleContractErrors({ root, module, spec, native, shipped })).toEqual([]);
  },
);
