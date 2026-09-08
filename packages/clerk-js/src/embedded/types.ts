import type { ClerkOptions, ClientJSONSnapshot, EnvironmentJSONSnapshot } from '@clerk/shared/types';

import type { NativeBiometricCapability } from './biometricCredentials';
import type { NativeCrypto } from './nativeCrypto';
import type { NativeStorage } from './nativeStorage';

export const EMBEDDED_PROTOCOL_VERSION = 1;

export interface EmbeddedState {
  protocolVersion: number;
  generation: string;
  revision: number;
  status: string;
  client: ClientJSONSnapshot | null;
  environment: EnvironmentJSONSnapshot | null;
  clientToken: string;
  tokenEvent?: { sequence: number; sessionId: string; jwt: string };
}

export interface EmbeddedHost {
  storage?: NativeStorage;
  crypto?: NativeCrypto;
  biometricCredential?: NativeBiometricCapability;
  getToken(): Promise<string>;
  saveToken(token: string): Promise<void>;
  getCachedResources(): Promise<{ client: ClientJSONSnapshot | null; environment: EnvironmentJSONSnapshot | null }>;
  saveCachedResources(resources: {
    client: ClientJSONSnapshot | null;
    environment: EnvironmentJSONSnapshot | null;
  }): Promise<void>;
  publish(state: EmbeddedState): void;
  commitState?(state: EmbeddedState): Promise<void>;
}

export interface EmbeddedOptions {
  protocolVersion: number;
  generation: string;
  publishableKey: string;
  sdkVersion: string;
  options?: ClerkOptions & { proxyUrl?: string };
}

export interface EmbeddedInvocation {
  receiver: { kind: string; id?: string; collection?: string; scope?: string; listedKind?: string };
  method: string;
  arguments?: unknown[];
}

export interface EmbeddedError {
  kind: 'api' | 'offline' | 'runtime' | 'resolution' | 'javascript';
  code?: string;
  message: string;
  errors: unknown[];
  status?: number;
  clerkTraceId?: string;
  stage?: string;
  nativeError?: unknown;
}
