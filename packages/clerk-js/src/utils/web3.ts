import type { Web3Provider } from '@clerk/shared/types';
import type { Wallet } from '@wallet-standard/core';

import { clerkUnsupportedEnvironmentWarning } from '@/core/errors';
import { getInjectedWeb3SolanaProviders } from '@/utils/injectedWeb3SolanaProviders';

import { toHex } from './hex';
import { getInjectedWeb3EthProviders } from './injectedWeb3EthProviders';

// type InjectedWeb3Wallet = MetamaskWeb3Provider | OKXWalletWeb3Provider;
// const web3WalletProviderMap: Record<InjectedWeb3Wallet, string> = {
//   metamask: 'MetaMask',
//   okx_wallet: 'OKX Wallet',
// } as const;

type GetWeb3IdentifierParams = {
  provider: Web3Provider;
  walletName?: string;
};

export async function getWeb3Identifier(params: GetWeb3IdentifierParams): Promise<string> {
  const { provider, walletName } = params;
  const walletProvider = await getWeb3WalletProvider(provider, walletName);

  // TODO - core-3: Improve error handling for the case when the provider is not found
  if (!walletProvider) {
    // If a plugin for the requested provider is not found,
    // the flow will fail as it has been the expected behavior so far.
    return '';
  }

  if (params.provider === 'solana') {
    // Solana provider
    const identifiers = (walletProvider as Wallet).accounts;
    return (identifiers && identifiers[0].address) || '';
  }

  const identifiers = await walletProvider.request({ method: 'eth_requestAccounts' });
  // @ts-ignore -- Provider SDKs may return unknown shape; use first address if present
  return (identifiers && identifiers[0]) || '';
}

type GenerateWeb3SignatureParams = GenerateSignatureParams & {
  provider: Web3Provider;
  walletName?: string;
};

export async function generateWeb3Signature(params: GenerateWeb3SignatureParams): Promise<string> {
  const { identifier, nonce, provider } = params;

  const wallet = await getWeb3WalletProvider(provider, params?.walletName);

  // TODO - core-3: Improve error handling for the case when the provider is not found
  if (!wallet) {
    // If a plugin for the requested provider is not found,
    // the flow will fail as it has been the expected behavior so far.
    return '';
  }
  if (provider === 'solana' && 'features' in wallet && wallet.features) {
    if (!(wallet as Wallet).accounts.find(a => a.address === identifier)) {
      throw new Error(`The connected wallet does not have the specified identifier.`);
    }
    if (!wallet.features[`solana:signMessage`]) {
      throw new Error(`The connected wallet does not support signing messages on Solana.`);
    }
    const signedMessages = await wallet.features[`solana:signMessage`].signMessage({
      account: identifier,
      message: nonce,
    });
    return signedMessages[0].signature;
  }

  return await wallet.request({
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

export async function getSolanaIdentifier({ walletName }: { walletName?: string }): Promise<string> {
  return await getWeb3Identifier({ provider: 'solana', walletName });
}

type GenerateSignatureParams = {
  identifier: string;
  nonce: string;
};

type GenerateSolanaSignatureParams = GenerateSignatureParams & {
  walletName?: string;
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

export async function generateSignatureWithSolana(params: GenerateSolanaSignatureParams): Promise<string> {
  return await generateWeb3Signature({ ...params, provider: 'solana', walletName: params.walletName });
}

async function getWeb3WalletProvider(provider: Web3Provider, walletName?: string) {
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

  if (provider === 'solana') {
    if (!walletName) {
      return null;
    }
    return getInjectedWeb3SolanaProviders().get(walletName);
  }

  return getInjectedWeb3EthProviders().get(provider);
}
