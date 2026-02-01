import type { ImportableModule, ModuleManager as ModuleManagerI } from '@clerk/shared/moduleManager';
import { safeImport } from '@clerk/shared/safeImport';

export class ModuleManager implements ModuleManagerI {
  #importMap = {
    '@zxcvbn-ts/core': () => safeImport(() => import('@zxcvbn-ts/core')),
    '@zxcvbn-ts/language-common': () => safeImport(() => import('@zxcvbn-ts/language-common')),
    '@base-org/account': () => safeImport(() => import('@base-org/account')),
    '@coinbase/wallet-sdk': () => safeImport(() => import('@coinbase/wallet-sdk')),
    '@stripe/stripe-js': () => safeImport(() => import('@stripe/stripe-js')),
    '@rrwebcloud/js-client': () => safeImport(() => import('@rrwebcloud/js-client')),
  } satisfies Record<ImportableModule, () => Promise<any>>;

  import(module: ImportableModule) {
    // Not typing this as any because we want to allow any type to be returned from the interface this class implements insetad of
    // defining the types twice
    return (this.#importMap[module] ? this.#importMap[module]() : Promise.resolve(undefined)) as any;
  }
}
