import type { Web3Provider } from '@clerk/types';

import { toHex } from './hex';
import { injectedWeb3Providers } from './injectedWeb3Providers';
type GetWeb3IdentifierParams = {
  provider: Web3Provider;
};

// injection order: metamask, coinbase
// global.etherem -> coinbase
// injectedProvider(metamask), will use metamask wallet
// generateWeb3Signature(), will use coinbase wallet
//                      neds to be generateWeb3Signature({provider: metamask}) instead

export async function getWeb3Identifier(params: GetWeb3IdentifierParams) {
  const injectedProvider = injectedWeb3Providers.get(params.provider);
  if (!injectedProvider) {
    // TODO: discuss what happens if a plugin for the requested provider is not found in the system
    //do we simply return '' or fall back to another plugin?
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
    // TODO: discuss what happens if a plugin for the requested provider is not found in the system
    //do we simply return '' or fall back to another plugin?
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
