import { Clerk } from '@clerk/clerk-js';

const CLERK_CLIENT_JWT_KEY = '__clerk_client_jwt';

type ClerkInstance = InstanceType<typeof Clerk>;

let cached: { instance: ClerkInstance; publishableKey: string } | null = null;

export function createClerkInstance(publishableKey: string): ClerkInstance {
  if (cached?.publishableKey === publishableKey) {
    return cached.instance;
  }

  const clerk = new Clerk(publishableKey);

  clerk.__internal_onBeforeRequest(async request => {
    request.credentials = 'omit';
    request.url?.searchParams.append('_is_native', '1');

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
