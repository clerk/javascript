import { Clerk } from '@clerk/clerk-js';

// Type-only import: the passkeys module is only bundled when the app imports
// `@clerk/electron/passkeys` itself.
import type { PasskeySupport } from '../passkeys';

const CLERK_CLIENT_JWT_KEY = '__clerk_client_jwt';

type ClerkInstance = InstanceType<typeof Clerk>;

let cached: { instance: ClerkInstance; publishableKey: string } | null = null;

function attachPasskeys(clerk: ClerkInstance, passkeys: PasskeySupport): void {
  clerk.__internal_createPublicCredentials = passkeys.create;
  clerk.__internal_getPublicCredentials = passkeys.get;
  clerk.__internal_isWebAuthnSupported = passkeys.isSupported;
  clerk.__internal_isWebAuthnAutofillSupported = passkeys.isAutoFillSupported;
  clerk.__internal_isWebAuthnPlatformAuthenticatorSupported = passkeys.isPlatformAuthenticatorSupported;
}

export function createClerkInstance(publishableKey: string, passkeys?: PasskeySupport): ClerkInstance {
  if (cached?.publishableKey === publishableKey) {
    if (passkeys) {
      attachPasskeys(cached.instance, passkeys);
    }
    return cached.instance;
  }

  const clerk = new Clerk(publishableKey);

  if (passkeys) {
    attachPasskeys(clerk, passkeys);
  }

  clerk.__internal_onBeforeRequest(async request => {
    request.credentials = 'omit';
    request.url?.searchParams.append('_is_native', '1');
    // request.url?.searchParams.append('_electron_sdk_version', PACKAGE_VERSION);

    const token = await window.__clerk_internal_electron?.tokenCache.getToken(CLERK_CLIENT_JWT_KEY);
    if (token) {
      const headers = new Headers(request.headers);
      headers.set('Authorization', `Bearer ${token}`);
      request.headers = headers;
    }
  });

  clerk.__internal_onAfterResponse(async (_request, response) => {
    const authorization = (response as Response).headers.get('Authorization');
    if (!authorization) {
      return;
    }

    const token = authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : authorization;
    await window.__clerk_internal_electron?.tokenCache.saveToken(CLERK_CLIENT_JWT_KEY, token);
  });

  cached = { instance: clerk, publishableKey };
  return clerk;
}
