import type { Web3Provider } from '@clerk/types';

import { toHex } from './hex';

type GetWeb3IdentifierParams = {
  provider: Web3Provider;
};

export async function getWeb3Identifier(_: GetWeb3IdentifierParams): Promise<string> {
  // @ts-ignore
  if (!global.ethereum) {
    // Do nothing when ethereum doesn't exist.
    return '';
  }

  // @ts-ignore
  const identifiers = await global.ethereum.request({
    method: 'eth_requestAccounts',
  });

  return (identifiers && identifiers[0]) || '';
}

type GenerateWeb3SignatureParams = {
  identifier: string;
  nonce: string;
  provider: Web3Provider;
};

export async function generateWeb3Signature({ identifier, nonce }: GenerateWeb3SignatureParams): Promise<string> {
  // @ts-ignore
  if (!global.ethereum) {
    // Do nothing when ethereum doesn't exist.
    return '';
  }

  // @ts-ignore
  return await global.ethereum.request({
    method: 'personal_sign',
    params: [`0x${toHex(nonce)}`, identifier],
  });
}

export async function getMetamaskIdentifier(): Promise<string> {
  return await getWeb3Identifier({ provider: 'metamask' });
}

type GenerateSignatureParams = {
  identifier: string;
  nonce: string;
};

export async function generateSignatureWithMetamask({ identifier, nonce }: GenerateSignatureParams): Promise<string> {
  return await generateWeb3Signature({ identifier, nonce, provider: 'metamask' });
}
