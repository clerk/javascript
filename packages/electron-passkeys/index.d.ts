/** Whether this platform has a native passkey backend. */
export function isAvailable(): boolean;

export function capabilities(): {
  platformAuthenticator: boolean;
  securityKeys: boolean;
};

/**
 * Runs a WebAuthn registration ceremony.
 * `windowHandle` anchors the OS dialog; `optionsJson` is the serialized public key options.
 * Resolves with a JSON result envelope.
 */
export function createCredential(windowHandle: Buffer, optionsJson: string): Promise<string>;

/**
 * Runs a WebAuthn authentication ceremony.
 * Resolves with a JSON result envelope.
 */
export function getCredential(windowHandle: Buffer, optionsJson: string): Promise<string>;
