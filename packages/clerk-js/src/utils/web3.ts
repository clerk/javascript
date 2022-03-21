import { toHex } from './hex';

export async function getMetamaskIdentifier(): Promise<string> {
  // @ts-ignore
  if (!global.ethereum) {
    // Do nothing when ethereum doesn't exist. We might revise this in the future
    // to offer an Install Metamask prompt to our users.
    return '';
  }

  // @ts-ignore
  const identifiers = await global.ethereum.request({
    method: 'eth_requestAccounts',
  });

  return (identifiers && identifiers[0]) || '';
}

export type GenerateSignatureParams = {
  identifier: string;
  nonce: string;
};

export async function generateSignatureWithMetamask({ identifier, nonce }: GenerateSignatureParams): Promise<string> {
  // @ts-ignore
  if (!global.ethereum) {
    // Do nothing when ethereum doesn't exist. We might revise this in the future
    // to offer an Install Metamask prompt to our users.
    return '';
  }

  // @ts-ignore
  const signature: string = await global.ethereum.request({
    method: 'personal_sign',
    params: [`0x${toHex(nonce)}`, identifier],
  });

  return signature;
}
