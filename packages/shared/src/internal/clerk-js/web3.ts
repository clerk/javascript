import type { ModuleManager } from '../../moduleManager';
import type { Web3Provider } from '../../types';
import { clerkUnsupportedEnvironmentWarning } from './errors';
import { toHex } from './hex';
import { getInjectedWeb3Providers } from './injectedWeb3Providers';

type GetWeb3IdentifierParams = {
  provider: Web3Provider;
};

type GenerateWeb3SignatureParams = GenerateSignatureParams & {
  provider: Web3Provider;
};

type GenerateSignatureParams = {
  identifier: string;
  nonce: string;
};

export function createWeb3(moduleManager: ModuleManager) {
  async function getWeb3Identifier(params: GetWeb3IdentifierParams): Promise<string> {
    const { provider } = params;
    const ethereum = await getEthereumProvider(provider);

    // TODO - core-3: Improve error handling for the case when the provider is not found
    if (!ethereum) {
      // If a plugin for the requested provider is not found,
      // the flow will fail as it has been the expected behavior so far.
      return '';
    }

    const identifiers = await ethereum.request({ method: 'eth_requestAccounts' });
    // @ts-ignore -- Provider SDKs may return unknown shape; use first address if present
    return (identifiers && identifiers[0]) || '';
  }

  async function generateWeb3Signature(params: GenerateWeb3SignatureParams): Promise<string> {
    const { identifier, nonce, provider } = params;
    const ethereum = await getEthereumProvider(provider);

    // TODO - core-3: Improve error handling for the case when the provider is not found
    if (!ethereum) {
      // If a plugin for the requested provider is not found,
      // the flow will fail as it has been the expected behavior so far.
      return '';
    }

    return await ethereum.request({
      method: 'personal_sign',
      params: [`0x${toHex(nonce)}`, identifier],
    });
  }

  async function getMetamaskIdentifier(): Promise<string> {
    return await getWeb3Identifier({ provider: 'metamask' });
  }

  async function getCoinbaseWalletIdentifier(): Promise<string> {
    return await getWeb3Identifier({ provider: 'coinbase_wallet' });
  }

  async function getOKXWalletIdentifier(): Promise<string> {
    return await getWeb3Identifier({ provider: 'okx_wallet' });
  }

  async function getBaseIdentifier(): Promise<string> {
    return await getWeb3Identifier({ provider: 'base' });
  }

  async function generateSignatureWithMetamask(params: GenerateSignatureParams): Promise<string> {
    return await generateWeb3Signature({ ...params, provider: 'metamask' });
  }

  async function generateSignatureWithCoinbaseWallet(params: GenerateSignatureParams): Promise<string> {
    return await generateWeb3Signature({ ...params, provider: 'coinbase_wallet' });
  }

  async function generateSignatureWithOKXWallet(params: GenerateSignatureParams): Promise<string> {
    return await generateWeb3Signature({ ...params, provider: 'okx_wallet' });
  }

  async function generateSignatureWithBase(params: GenerateSignatureParams): Promise<string> {
    return await generateWeb3Signature({ ...params, provider: 'base' });
  }

  async function getEthereumProvider(provider: Web3Provider) {
    if (provider === 'coinbase_wallet') {
      if (__BUILD_DISABLE_RHC__) {
        clerkUnsupportedEnvironmentWarning('Coinbase Wallet');
        return null;
      }

      const coinbaseModule = await moduleManager.import('@coinbase/wallet-sdk');
      if (!coinbaseModule) {
        return null;
      }
      const sdk = coinbaseModule.createCoinbaseWalletSDK({
        preference: {
          options: 'all',
        },
      });
      return sdk.getProvider();
    }
    if (provider === 'base') {
      if (__BUILD_DISABLE_RHC__) {
        clerkUnsupportedEnvironmentWarning('Base');
        return null;
      }

      try {
        const baseModule = await moduleManager.import('@base-org/account');
        if (!baseModule) {
          return null;
        }

        const sdk = baseModule.createBaseAccountSDK({
          appName:
            (typeof window !== 'undefined' &&
              // @ts-expect-error missing types
              (window.Clerk as any)?.__internal_environment?.displayConfig?.applicationName) ||
            (typeof document !== 'undefined' && document.title) ||
            'Web3 Application',
        });
        return sdk.getProvider();
      } catch {
        return null;
      }
    }

    return getInjectedWeb3Providers().get(provider);
  }

  return {
    getWeb3Identifier,
    generateWeb3Signature,
    getMetamaskIdentifier,
    getCoinbaseWalletIdentifier,
    getOKXWalletIdentifier,
    getBaseIdentifier,
    generateSignatureWithMetamask,
    generateSignatureWithCoinbaseWallet,
    generateSignatureWithOKXWallet,
    generateSignatureWithBase,
  };
}
