import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { expect, test } from 'vitest';

import { NATIVE_BRIDGE_VERSION } from '../../constants';
import { NATIVE_MODULES, nativeModuleContractErrors, shippedNativeFunctions } from './nativeModuleContract';

const root = resolve(__dirname, '../../../../..');

test.each(NATIVE_MODULES)('$spec matches $native and every $release release', ({ module, release, spec, native }) => {
  const releases = shippedNativeFunctions(root, release, native);
  expect(nativeModuleContractErrors({ root, module, spec, native, releases })).toEqual([]);
});

test.each(NATIVE_MODULES.filter(({ module }) => module === 'ClerkExpo'))(
  '$native exports the bridge version @clerk/expo expects',
  ({ native }) => {
    const source = readFileSync(join(root, native), 'utf8');
    expect(source.match(/Constant\("bridgeVersion"\)\s*\{\s*(\d+)\s*\}/)?.[1]).toBe(String(NATIVE_BRIDGE_VERSION));
  },
);
