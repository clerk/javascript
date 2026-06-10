type Awaitable<T> = T | Promise<T>;

export type TokenStorage = {
  getItem: (key: string) => Awaitable<string | null>;
  setItem: (key: string, value: string) => Awaitable<void>;
  removeItem: (key: string) => Awaitable<void>;
};

export type CreateClerkBridgeOptions = {
  /**
   * Storage adapter used by the main process to persist Clerk tokens.
   */
  storage: TokenStorage;
  /**
   * Registers the custom scheme used to serve the Electron renderer from a stable origin.
   */
  renderer?: RendererSchemeOptions;
};

export type ClerkBridge = {
  /**
   * Removes IPC handlers and listeners registered by `createClerkBridge`.
   */
  cleanup: () => void;
};

export type RendererSchemeOptions = {
  /**
   * Custom scheme used for the renderer origin.
   */
  scheme: string;
  /**
   * Custom host used for the renderer origin.
   */
  host: string;
};

export type TokenCache = {
  getToken: (key: string) => Promise<string | null>;
  saveToken: (key: string, value: string) => Promise<void>;
  clearToken: (key: string) => Promise<void>;
};

export type OAuthTransport = {
  getRedirectUrl: () => Promise<string>;
  open: (url: string) => Promise<{ callbackUrl: string }>;
};

// JSON-safe WebAuthn shapes passed over Electron IPC. Binary fields are base64url strings.
type Base64UrlString = string;

export type AuthenticatorTransport = 'ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb';

export type PublicKeyCredentialDescriptorJSON = {
  type: 'public-key';
  id: Base64UrlString;
  transports?: AuthenticatorTransport[];
};

export type SerializedPublicKeyCredentialCreationOptions = {
  rp: { id: string; name: string };
  user: {
    id: Base64UrlString;
    displayName: string;
    name: string;
  };
  challenge: Base64UrlString;
  pubKeyCredParams: { type: 'public-key'; alg: number }[];
  timeout?: number;
  authenticatorSelection?: {
    authenticatorAttachment?: 'cross-platform' | 'platform';
    requireResidentKey?: boolean;
    residentKey?: 'discouraged' | 'preferred' | 'required';
    userVerification?: 'discouraged' | 'preferred' | 'required';
  };
  attestation?: 'direct' | 'enterprise' | 'indirect' | 'none';
  excludeCredentials?: PublicKeyCredentialDescriptorJSON[];
};

export type SerializedPublicKeyCredentialRequestOptions = {
  challenge: Base64UrlString;
  rpId: string;
  timeout?: number;
  userVerification?: 'discouraged' | 'preferred' | 'required';
  allowCredentials?: PublicKeyCredentialDescriptorJSON[];
};

export type RegistrationResponseJSON = {
  id: Base64UrlString;
  rawId: Base64UrlString;
  response: {
    clientDataJSON: Base64UrlString;
    attestationObject: Base64UrlString;
    transports?: AuthenticatorTransport[];
  };
  authenticatorAttachment?: 'cross-platform' | 'platform';
  type: 'public-key';
};

export type AuthenticationResponseJSON = {
  id: Base64UrlString;
  rawId: Base64UrlString;
  response: {
    clientDataJSON: Base64UrlString;
    authenticatorData: Base64UrlString;
    signature: Base64UrlString;
    userHandle?: Base64UrlString;
  };
  authenticatorAttachment?: 'cross-platform' | 'platform';
  type: 'public-key';
};

// Native error codes that the renderer maps to ClerkWebAuthnError codes.
export type PasskeyNativeErrorCode = 'cancelled' | 'invalid_rp' | 'not_supported' | 'timeout' | 'unknown';

// Keep errors inside the response; Electron loses structure when invoke promises reject.
export type PasskeyIpcResult<T> =
  | { ok: true; credential: T }
  | { ok: false; error: { code: PasskeyNativeErrorCode; message: string } };

export type PasskeyCapabilities = {
  available: boolean;
  platformAuthenticator: boolean;
  securityKeys: boolean;
};

export type PasskeyBridge = {
  create: (
    options: SerializedPublicKeyCredentialCreationOptions,
  ) => Promise<PasskeyIpcResult<RegistrationResponseJSON>>;
  get: (options: SerializedPublicKeyCredentialRequestOptions) => Promise<PasskeyIpcResult<AuthenticationResponseJSON>>;
  capabilities: () => Promise<PasskeyCapabilities>;
  electronMajor: number;
  platform: string;
};

export type SetupPasskeysMainReturn = {
  cleanup: () => void;
};
