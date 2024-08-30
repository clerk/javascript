import type { Web3Provider } from '@clerk/types';

import { toHex } from './hex';
import { injectedWeb3Providers } from './injectedWeb3Providers';
type GetWeb3IdentifierParams = {
  provider: Web3Provider;
};

export async function getWeb3Identifier(params: GetWeb3IdentifierParams) {
  const injectedProvider = injectedWeb3Providers.get(params.provider);
  if (!injectedProvider) {
    return '';
  }

  const identifiers = await injectedProvider.request({ method: 'eth_requestAccounts' });
  return (identifiers && identifiers[0]) || '';
}

type GenerateWeb3SignatureParams = {
  identifier: string;
  nonce: string;
  provider: Web3Provider;
};

export async function generateWeb3Signature(params: GenerateWeb3SignatureParams): Promise<string> {
  const { identifier, nonce, provider } = params;
  const injectedProvider = injectedWeb3Providers.get(provider);
  if (!injectedProvider) {
    return '';
  }

  return await injectedProvider.request({
    method: 'personal_sign',
    params: [`0x${toHex(nonce)}`, identifier],
  });
}

export async function getMetamaskIdentifier(): Promise<string> {
  return await getWeb3Identifier({ provider: 'metamask' });
}

export async function getCoinbaseIdentifier(): Promise<string> {
  return await getWeb3Identifier({ provider: 'coinbase' });
}

type GenerateSignatureParams = {
  identifier: string;
  nonce: string;
};

export async function generateSignatureWithMetamask({ identifier, nonce }: GenerateSignatureParams): Promise<string> {
  return await generateWeb3Signature({ identifier, nonce, provider: 'metamask' });
}

export async function generateSignatureWithCoinbase({ identifier, nonce }: GenerateSignatureParams): Promise<string> {
  return await generateWeb3Signature({ identifier, nonce, provider: 'coinbase' });
}
