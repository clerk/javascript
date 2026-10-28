import type { Web3Strategy } from '@clerk/shared/types';
import type { WindowAppReadyEventAPI } from '@wallet-standard/core';

import type { FakeFapiSeed } from '../../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnvironment, fapiSession, type FapiUser, fapiUser } from '../../../../__tests__/feature/fapi';

export function web3Environment(firstFactors: readonly Web3Strategy[]) {
  const base = fapiEnvironment();
  return fapiEnvironment({
    user_settings: {
      attributes: {
        ...base.user_settings.attributes,
        web3_wallet: {
          ...base.user_settings.attributes.web3_wallet,
          enabled: true,
          used_for_first_factor: true,
          first_factors: [...firstFactors],
        },
      },
    },
  });
}

export function signedInWallets(
  firstFactors: readonly Web3Strategy[],
  user: Partial<FapiUser> = {},
  overrides: FakeFapiSeed = {},
): FakeFapiSeed {
  return {
    environment: web3Environment(firstFactors),
    client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1', ...user }) })]),
    ...overrides,
  };
}

export function registerWallets(...wallets: Array<Parameters<WindowAppReadyEventAPI['register']>[0]>) {
  const unregister: Array<() => void> = [];
  const register = (api: WindowAppReadyEventAPI) => unregister.push(...wallets.map(wallet => api.register(wallet)));
  const onAppReady = (event: Event & { detail?: WindowAppReadyEventAPI }) => {
    if (event.detail) {
      register(event.detail);
    }
  };
  window.addEventListener('wallet-standard:app-ready', onAppReady);
  window.dispatchEvent(new CustomEvent('wallet-standard:register-wallet', { detail: register }));
  return () => {
    window.removeEventListener('wallet-standard:app-ready', onAppReady);
    unregister.forEach(remove => remove());
  };
}
