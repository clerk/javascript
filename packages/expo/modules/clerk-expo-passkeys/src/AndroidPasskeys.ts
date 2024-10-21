import {
  SerializedPublicKeyCredentialCreationOptions,
  SerializedPublicKeyCredentialRequestOptions,
} from './ClerkExpoPasskeys.types';
import ClerkExpoPasskeys from './ClerkExpoPasskeysModule';

export class AndroidPasskeys {
  public static async create(credentials: SerializedPublicKeyCredentialCreationOptions) {
    try {
      const response = await ClerkExpoPasskeys.create(JSON.stringify(credentials));
      return { publicKeyCredential: JSON.parse(response), error: null };
    } catch (error) {
      return { publicKeyCredential: null, error };
    }
  }

  public static async get(credentials: SerializedPublicKeyCredentialRequestOptions) {
    try {
      const response = await ClerkExpoPasskeys.get(JSON.stringify(credentials));
      return { publicKeyCredential: JSON.parse(response), error: null };
    } catch (error) {
      return { publicKeyCredential: null, error };
    }
  }

  public static async autofill() {
    throw new Error('Autofill is not supported');
  }
}
