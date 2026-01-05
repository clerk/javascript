import type { SolanaWalletAdapterWallet } from '@solana/wallet-standard';

import { buildErrorThrower, ClerkRuntimeError } from '@/error';

import type { ModuleManager } from '../../moduleManager';
import type { GenerateSignature, Web3Provider } from '../../types';
import { clerkUnsupportedEnvironmentWarning } from './errors';
import { toHex } from './hex';
import { getInjectedWeb3EthProviders } from './injectedWeb3EthProviders';
import { getInjectedWeb3SolanaProviders } from './injectedWeb3SolanaProviders';

type GetWeb3IdentifierParams = {
  provider: Web3Provider;
  walletName?: string;
};

// '@solana/wallet-standard'
const StandardConnect = `standard:connect`;
const SolanaSignMessage = `solana:signMessage`;

type GenerateSignatureParams = {
  identifier: string;
  nonce: string;
};

type GenerateSolanaSignatureParams = GenerateSignatureParams & {
  walletName: string;
};

export function createWeb3(moduleManager: ModuleManager) {
  const errorThrower = buildErrorThrower({
    packageName: '@clerk/shared',
  });

  async function getWeb3Identifier(params: GetWeb3IdentifierParams): Promise<string> {
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

  const generateWeb3Signature: GenerateSignature = async (params): Promise<string> => {
    const { identifier, nonce, provider, walletName = '' } = params;
    const wallet = await getWeb3Wallet(provider, walletName);

    // TODO - core-3: Improve error handling for the case when the provider is not found
    if (!wallet) {
      // If a plugin for the requested provider is not found,
      // the flow will fail as it has been the expected behavior so far.
      return '';
    }

    if (provider === 'solana') {
      try {
        const solanaWallet = wallet as SolanaWalletAdapterWallet;
        const walletAccount = solanaWallet.accounts.find(a => a.address === identifier);
        if (!walletAccount) {
          console.warn(`Wallet account with address ${identifier} not found`);
          return '';
        }
        const signedMessages = await solanaWallet.features[SolanaSignMessage]?.signMessage({
          account: walletAccount,
          message: new TextEncoder().encode(nonce),
        });
        // Convert signature Uint8Array to base64 string
        return signedMessages?.[0]?.signature ? btoa(String.fromCharCode(...signedMessages[0].signature)) : '';
      } catch (err) {
        if (err instanceof Error && err.message.includes('User rejected the request.')) {
          throw new ClerkRuntimeError('Web3 signature request was rejected by the user.', {
            code: 'web3_signature_request_rejected',
          });
        }
        throw new ClerkRuntimeError('An error occurred while generating the Solana signature.', {
          code: 'web3_solana_signature_generation_failed',
          cause: err instanceof Error ? err : undefined,
        });
      }
    }

    return await wallet.request({
      method: 'personal_sign',
      params: [`0x${toHex(nonce)}`, identifier],
    });
  };

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

  async function getSolanaIdentifier(walletName: string): Promise<string> {
    return await getWeb3Identifier({ provider: 'solana', walletName });
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
  async function generateSignatureWithSolana(params: GenerateSolanaSignatureParams): Promise<string> {
    return await generateWeb3Signature({ ...params, provider: 'solana' });
  }

  async function getWeb3Wallet(provider: Web3Provider, walletName?: string) {
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

    if (provider === 'solana') {
      if (!walletName || walletName.length === 0) {
        errorThrower.throw('Wallet name must be provided to get Solana wallet provider');
        return;
      }
      return await getInjectedWeb3SolanaProviders().get(walletName);
    }

    return getInjectedWeb3EthProviders().get(provider);
  }

  return {
    getWeb3Identifier,
    generateWeb3Signature,
    getMetamaskIdentifier,
    getCoinbaseWalletIdentifier,
    getOKXWalletIdentifier,
    getBaseIdentifier,
    getSolanaIdentifier,
    generateSignatureWithMetamask,
    generateSignatureWithCoinbaseWallet,
    generateSignatureWithOKXWallet,
    generateSignatureWithBase,
    generateSignatureWithSolana,
  };
}
