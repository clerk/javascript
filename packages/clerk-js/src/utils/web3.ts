import type { InjectedWeb3ProviderChain, Wallet, Web3Provider } from '@clerk/shared/types';

import { clerkUnsupportedEnvironmentWarning } from '@/core/errors';

import { toHex } from './hex';
import { getInjectedWeb3Providers } from './injectedWeb3Providers';

// type InjectedWeb3Wallet = MetamaskWeb3Provider | OKXWalletWeb3Provider;
// const web3WalletProviderMap: Record<InjectedWeb3Wallet, string> = {
//   metamask: 'MetaMask',
//   okx_wallet: 'OKX Wallet',
// } as const;

type GetWeb3IdentifierParams = GetWeb3EthIdentifierParams | GetWeb3SolanaIdentifierParams;

type GetWeb3EthIdentifierParams = {
  provider: Exclude<Web3Provider, 'solana'>;
  chain?: Exclude<InjectedWeb3ProviderChain, 'solana'>;
};

type GetWeb3SolanaIdentifierParams = {
  provider: string;
  chain: 'solana';
};

export async function getWeb3Identifier(params: GetWeb3IdentifierParams): Promise<string> {
  const walletProvider = await getWeb3WalletProvider(params.provider, params?.chain);

  // TODO - core-3: Improve error handling for the case when the provider is not found
  if (!walletProvider) {
    // If a plugin for the requested provider is not found,
    // the flow will fail as it has been the expected behavior so far.
    return '';
  }

  if (params.chain === 'solana') {
    // Solana provider
    const address = (walletProvider as Wallet).accounts[0]?.address;
    if (address) {
      return address;
    }
    return '';
  }

  const identifiers = walletProvider.accounts;
  // @ts-ignore -- Provider SDKs may return unknown shape; use first address if present
  return (identifiers && identifiers[0]) || '';
}

type GenerateWeb3SignatureParams = GenerateSignatureParams & {
  provider: string;
  chain?: InjectedWeb3ProviderChain;
};

export async function generateWeb3Signature(params: GenerateWeb3SignatureParams): Promise<string> {
  const { identifier, nonce, provider } = params;

  const wallet = await getWeb3WalletProvider(provider, params?.chain);

  // TODO - core-3: Improve error handling for the case when the provider is not found
  if (!wallet) {
    // If a plugin for the requested provider is not found,
    // the flow will fail as it has been the expected behavior so far.
    return '';
  }
  if (params.chain === 'solana' && 'features' in wallet && wallet.features) {
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

export async function getSolanaIdentifier(walletName: string): Promise<string> {
  return await getWeb3Identifier({ provider: walletName, chain: 'solana' });
}

type GenerateSignatureParams = {
  identifier: string;
  nonce: string;
};

type GenerateSolanaSignatureParams = GenerateSignatureParams & {
  walletName: string;
};

export async function generateSignatureWithMetamask(params: GenerateSignatureParams): Promise<string> {
  return await generateWeb3Signature({ ...params, provider: 'MetaMask' });
}

export async function generateSignatureWithCoinbaseWallet(params: GenerateSignatureParams): Promise<string> {
  return await generateWeb3Signature({ ...params, provider: 'coinbase_wallet' });
}

export async function generateSignatureWithOKXWallet(params: GenerateSignatureParams): Promise<string> {
  return await generateWeb3Signature({ ...params, provider: 'OKX Wallet' });
}

export async function generateSignatureWithBase(params: GenerateSignatureParams): Promise<string> {
  return await generateWeb3Signature({ ...params, provider: 'base' });
}

export async function generateSignatureWithSolana(params: GenerateSolanaSignatureParams): Promise<string> {
  return await generateWeb3Signature({ ...params, chain: 'solana', provider: params.walletName });
}

async function getWeb3WalletProvider(provider: string, chain?: InjectedWeb3ProviderChain) {
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

  return getInjectedWeb3Providers().get(provider, chain);
}
