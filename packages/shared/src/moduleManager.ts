/* eslint-disable @typescript-eslint/consistent-type-imports */

export type ImportableModuleToTypeMap = {
  '@zxcvbn-ts/core': typeof import('@zxcvbn-ts/core');
  '@zxcvbn-ts/language-common': typeof import('@zxcvbn-ts/language-common');
  '@base-org/account': typeof import('@base-org/account');
  '@coinbase/wallet-sdk': typeof import('@coinbase/wallet-sdk');
  '@stripe/stripe-js': typeof import('@stripe/stripe-js');
};

export type ImportableModule = keyof ImportableModuleToTypeMap;

export interface ModuleManager {
  import: <T extends ImportableModule>(module: T) => Promise<ImportableModuleToTypeMap[T] | undefined>;
}

const store = new WeakMap<object, ModuleManager>();

export function getModuleManager(clerkInstance: object): ModuleManager | undefined {
  return store.get(clerkInstance);
}

export function setModuleManager(clerkInstance: object, mm: ModuleManager): void {
  store.set(clerkInstance, mm);
}
