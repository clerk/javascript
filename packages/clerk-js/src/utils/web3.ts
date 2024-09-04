import type { Web3Provider } from '@clerk/types';

import { toHex } from './hex';
import { getInjectedWeb3Providers } from './injectedWeb3Providers';

type GetWeb3IdentifierParams = {
  provider: Web3Provider;
};

export async function getWeb3Identifier(params: GetWeb3IdentifierParams): Promise<string> {
  const { provider } = params;
  const ethereum = await getEthereumProvider(provider);
  if (!ethereum) {
    // If a plugin for the requested provider is not found,
    // the flow will fail as it has been the expected behavior so far.
    return '';
  }

  const identifiers = await ethereum.request({ method: 'eth_requestAccounts' });
  // @ts-ignore
  return (identifiers && identifiers[0]) || '';
}

type GenerateWeb3SignatureParams = {
  identifier: string;
  nonce: string;
  provider: Web3Provider;
};

export async function generateWeb3Signature(params: GenerateWeb3SignatureParams): Promise<string> {
  const { identifier, nonce, provider } = params;
  const ethereum = await getEthereumProvider(provider);
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

type GenerateSignatureParams = {
  identifier: string;
  nonce: string;
};

export async function generateSignatureWithMetamask({ identifier, nonce }: GenerateSignatureParams): Promise<string> {
  return await generateWeb3Signature({ identifier, nonce, provider: 'metamask' });
}

export async function generateSignatureWithCoinbaseWallet({
  identifier,
  nonce,
}: GenerateSignatureParams): Promise<string> {
  return await generateWeb3Signature({ identifier, nonce, provider: 'coinbase_wallet' });
}

async function getEthereumProvider(provider: Web3Provider) {
  if (provider === 'coinbase_wallet') {
    const CoinbaseWalletSDK = await import('@coinbase/wallet-sdk').then(mod => mod.CoinbaseWalletSDK);
    const sdk = new CoinbaseWalletSDK({});
    return sdk.makeWeb3Provider({ options: 'all' });
  }

  const injectedWeb3Providers = getInjectedWeb3Providers();
  return injectedWeb3Providers.get(provider);
}
