import { toHex } from './hex';

export async function getMetamaskIdentifier(): Promise<string> {
  const ethereum = getMetamaskProvider();
  if (!ethereum) {
    return '';
  }

  // @ts-ignore
  const identifiers = await ethereum.request({
    method: 'eth_requestAccounts',
  });

  return (identifiers && identifiers[0]) || '';
}

export type GenerateSignatureParams = {
  identifier: string;
  nonce: string;
};

export async function generateSignatureWithMetamask({ identifier, nonce }: GenerateSignatureParams): Promise<string> {
  const ethereum = getMetamaskProvider();
  if (!ethereum) {
    return '';
  }

  // @ts-ignore
  const signature: string = await ethereum.request({
    method: 'personal_sign',
    params: [`0x${toHex(nonce)}`, identifier],
  });

  return signature;
}

export async function getCoinbaseIdentifier(): Promise<string> {
  const ethereum = getCoinbaseProvider();
  if (!ethereum) {
    return '';
  }

  // @ts-ignore
  const identifiers = await ethereum.request({
    method: 'eth_requestAccounts',
  });

  return (identifiers && identifiers[0]) || '';
}

export async function generateSignatureWithCoinbase({ identifier, nonce }: GenerateSignatureParams): Promise<string> {
  const ethereum = getCoinbaseProvider();
  if (!ethereum) {
    return '';
  }

  // @ts-ignore
  const signature: string = await ethereum.request({
    method: 'personal_sign',
    params: [`0x${toHex(nonce)}`, identifier],
  });

  return signature;
}

function getMetamaskProvider(): any {
  // @ts-ignore
  if (!global.ethereum) {
    return undefined;
  }

  // @ts-ignore
  if (global.ethereum.providers) {
    // @ts-ignore
    return global.ethereum.providers[1];
  }

  // @ts-ignore
  if (!global.ethereum.isMetaMask) {
    return undefined;
  }

  // @ts-ignore
  return global.ethereum;
}

function getCoinbaseProvider(): any {
  // @ts-ignore
  if (!global.ethereum) {
    return undefined;
  }

  // @ts-ignore
  if (global.ethereum.providers) {
    // @ts-ignore
    return global.ethereum.providers[0];
  }

  // @ts-ignore
  if (!global.ethereum.isCoinbaseWallet) {
    return undefined;
  }

  // @ts-ignore
  return global.ethereum;
}
