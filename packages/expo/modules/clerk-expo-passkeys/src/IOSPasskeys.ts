import {
  SerializedPublicKeyCredentialCreationOptions,
  SerializedPublicKeyCredentialRequestOptions,
} from './ClerkExpoPasskeys.types';
import ClerkExpoPasskeys from './ClerkExpoPasskeysModule';

export class IOSPasskeys {
  public static async create(credentials: SerializedPublicKeyCredentialCreationOptions) {
    try {
      const response = await ClerkExpoPasskeys.create(
        credentials.challenge,
        credentials.rp.id,
        credentials.user.id,
        credentials.user.displayName,
      );
      return { publicKeyCredential: response, error: null };
    } catch (error) {
      return { publicKeyCredential: null, error };
    }
  }

  public static async get(credentials: SerializedPublicKeyCredentialRequestOptions) {
    try {
      const response = await ClerkExpoPasskeys.get(credentials.challenge, credentials.rpId);
      return { publicKeyCredential: response, error: null };
    } catch (error) {
      return { publicKeyCredential: null, error };
    }
  }

  public static async autofill(credentials: SerializedPublicKeyCredentialRequestOptions) {
    try {
      const response = await ClerkExpoPasskeys.autofill(credentials.challenge, credentials.rpId);
      return { publicKeyCredential: response, error: null };
    } catch (error) {
      return { publicKeyCredential: null, error };
    }
  }
}
