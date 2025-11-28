import type { GenerateSignature, Web3Provider } from '@clerk/shared/types';
import type { SolanaWalletAdapterWallet } from '@solana/wallet-standard';

import { clerkUnsupportedEnvironmentWarning } from '@/core/errors';
import { errorThrower } from '@/utils/errorThrower';
import { getInjectedWeb3SolanaProviders } from '@/utils/injectedWeb3SolanaProviders';

import { toHex } from './hex';
import { getInjectedWeb3EthProviders } from './injectedWeb3EthProviders';

type GetWeb3IdentifierParams = {
  provider: Web3Provider;
  walletName?: string;
};

// '@solana/wallet-standard'
const StandardConnect = `standard:connect`;
const SolanaSignMessage = `solana:signMessage`;

export async function getWeb3Identifier(params: GetWeb3IdentifierParams): Promise<string> {
  const { provider, walletName } = params;
  const walletProvider = await getWeb3Wallet(provider, walletName);

  // TODO - core-3: Improve error handling for the case when the provider is not found
  if (!walletProvider) {
    // If a plugin for the requested provider is not found,
    // the flow will fail as it has been the expected behavior so far.
    return '';
  }

  if (provider === 'solana') {
    const identifiers = await walletProvider.features[StandardConnect].connect();
    return (identifiers && identifiers.accounts[0].address) || '';
  }

  // Ethereum providers
  const identifiers = await walletProvider.request({ method: 'eth_requestAccounts' });
  // @ts-ignore -- Provider SDKs may return unknown shape; use first address if present
  return (identifiers && identifiers[0]) || '';
}

export const generateWeb3Signature: GenerateSignature = async (params): Promise<string> => {
  const { identifier, nonce, provider, walletName = '' } = params;
  const wallet = await getWeb3Wallet(provider, walletName);

  // TODO - core-3: Improve error handling for the case when the provider is not found
  if (!wallet) {
    // If a plugin for the requested provider is not found,
    // the flow will fail as it has been the expected behavior so far.
    return '';
  }

  if (provider === 'solana') {
    const bs58 = await import('bs58').then(mod => mod.default);
    const walletAccount = (wallet as SolanaWalletAdapterWallet).accounts.find(a => a.address === identifier);
    if (!walletAccount) {
      console.warn(`Wallet account with address ${identifier} not found`);
      return '';
    }
    const signedMessages = await (wallet as SolanaWalletAdapterWallet).features[SolanaSignMessage]?.signMessage({
      account: walletAccount,
      message: new TextEncoder().encode(nonce),
    });
    if (!signedMessages || signedMessages.length === 0) {
      console.warn('No signed messages returned from wallet');
      return '';
    }
    return bs58.encode(signedMessages[0].signature);
  }

  return await wallet.request({
    method: 'personal_sign',
    params: [`0x${toHex(nonce)}`, identifier],
  });
};

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
  return await getWeb3Identifier({ provider: 'solana', walletName });
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

export async function generateSignatureWithSolana(params: GenerateSignatureParams): Promise<string> {
  return await generateWeb3Signature({ ...params, provider: 'solana' });
}

async function getWeb3Wallet(provider: Web3Provider, walletName?: string) {
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
    if (!walletName || walletName.length === 0) {
      errorThrower.throw('Wallet name must be provided to get Solana wallet provider');
      return;
    }
    return await getInjectedWeb3SolanaProviders().get(walletName);
  }

  return getInjectedWeb3EthProviders().get(provider);
}
