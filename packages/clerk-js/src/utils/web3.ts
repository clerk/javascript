import type { Web3Provider } from '@clerk/shared/types';

import { clerkUnsupportedEnvironmentWarning } from '@/core/errors';

import { toHex } from './hex';
import { getInjectedWeb3Providers } from './injectedWeb3Providers';

type GetWeb3IdentifierParams = {
  provider: Web3Provider;
};

export async function getWeb3Identifier(params: GetWeb3IdentifierParams): Promise<string> {
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

type GenerateWeb3SignatureParams = GenerateSignatureParams & {
  provider: Web3Provider;
};

export async function generateWeb3Signature(params: GenerateWeb3SignatureParams): Promise<string> {
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

export async function getMetamaskIdentifier(): Promise<string> {
  return await getWeb3Identifier({ provider: 'metamask' });
}

export async function getCoinbaseWalletIdentifier(): Promise<string> {
  return await getWeb3Identifier({ provider: 'coinbase_wallet' });
}

export async function getOKXWalletIdentifier(): Promise<string> {
  return await getWeb3Identifier({ provider: 'okx_wallet' });
}

export async function getBaseIdentifier(): Promise<string> {
  return await getWeb3Identifier({ provider: 'base' });
}

type GenerateSignatureParams = {
  identifier: string;
  nonce: string;
};

export async function generateSignatureWithMetamask(params: GenerateSignatureParams): Promise<string> {
  return await generateWeb3Signature({ ...params, provider: 'metamask' });
}

export async function generateSignatureWithCoinbaseWallet(params: GenerateSignatureParams): Promise<string> {
  return await generateWeb3Signature({ ...params, provider: 'coinbase_wallet' });
}

export async function generateSignatureWithOKXWallet(params: GenerateSignatureParams): Promise<string> {
  return await generateWeb3Signature({ ...params, provider: 'okx_wallet' });
}

export async function generateSignatureWithBase(params: GenerateSignatureParams): Promise<string> {
  return await generateWeb3Signature({ ...params, provider: 'base' });
}

async function getEthereumProvider(provider: Web3Provider) {
  if (provider === 'coinbase_wallet') {
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('Coinbase Wallet');
      return null;
    }

    const createCoinbaseWalletSDK = await import('@coinbase/wallet-sdk').then(mod => mod.createCoinbaseWalletSDK);
    const sdk = createCoinbaseWalletSDK({
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
      const createBaseAccountSDK = await import('@base-org/account').then(mod => mod.createBaseAccountSDK);

      const sdk = createBaseAccountSDK({
        appName:
          (typeof window !== 'undefined' &&
            (window.Clerk as any)?.__unstable__environment?.displayConfig?.applicationName) ||
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
