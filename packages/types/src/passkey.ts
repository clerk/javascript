import type { ClerkResource } from './resource';

export interface PublicKeyOptions extends PublicKeyCredentialCreationOptions {}

export interface PasskeyResource extends ClerkResource {
  id: string;
  credentialId: string | null;
  publicKey: string | null;
  challenge: string;
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  rp: {
    id: string;
  };
  pubKeyCredParams: { type: 'public-key'; alg: number }[];
  hints: string[];
  attestation: 'none';
  authenticatorSelection: Record<string, unknown>;
  excludeCredentials: {
    id: string;
    transports?: ('ble' | 'hybrid' | 'internal' | 'nfc' | 'usb')[];
    type: 'public-key';
  }[];
}
