export type LocalBiometricCredential = {
  id: string;
  localKeyId: string;
  userId: string;
  appIdentifier: string;
  identifierHint?: string;
  policy: string;
  createdAt: number;
  updatedAt: number;
};

export type NativeBiometricSelection = { credentials?: LocalBiometricCredential[]; reason?: string };

type NativeBiometricRequest =
  | { operation: 'context' | 'records' | 'dispose' }
  | { operation: 'candidates'; id?: string; identifierHint?: string; userID?: string }
  | { operation: 'createKey'; policy: string }
  | { operation: 'sign'; clientData: string; localKeyId: string; reason?: string }
  | { operation: 'save' | 'remove'; credential: LocalBiometricCredential }
  | { operation: 'removeById'; id: string }
  | { operation: 'deleteKey'; localKeyId: string };

type NativeBiometricResponses = {
  context: { platform: string; appIdentifier: string | null };
  candidates: NativeBiometricSelection;
  records: LocalBiometricCredential[];
  createKey: { localKeyId: string; publicKeyJWK: string; algorithm: string; policy: string };
  sign: { clientData: string; signature: string; algorithm: string };
  save: null;
  remove: null;
  removeById: null;
  deleteKey: null;
  dispose: null;
};

export type NativeBiometricCapability = <Request extends NativeBiometricRequest>(
  request: Request,
) => Promise<NativeBiometricResponses[Request['operation']]>;
