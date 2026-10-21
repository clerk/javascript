import type { BrowserContext } from '@playwright/test';

const contextTokens = new WeakMap<BrowserContext, Map<string, string>>();

export const setupTestingTokens = async ({
  context,
  frontendApiOrigin,
  token,
}: {
  context: BrowserContext;
  frontendApiOrigin: string;
  token: string;
}) => {
  const existingTokens = contextTokens.get(context);
  if (existingTokens) {
    existingTokens.set(frontendApiOrigin, token);
    return;
  }

  const tokens = new Map([[frontendApiOrigin, token]]);
  contextTokens.set(context, tokens);

  await context.route(
    url =>
      (tokens.has(url.origin) && url.pathname.startsWith('/v1/')) || url.pathname.startsWith('/v1/me/oauth/consent/'),
    async route => {
      const requestUrl = new URL(route.request().url());
      const requestToken = tokens.get(requestUrl.origin);
      if (requestToken) {
        requestUrl.searchParams.set('__clerk_testing_token', requestToken);
      }

      if (route.request().method() !== 'POST' || !requestUrl.pathname.startsWith('/v1/me/oauth/consent/')) {
        if (!requestToken) {
          return route.fallback();
        }
        return route.continue({ url: requestUrl.toString() });
      }

      const response = await route.fetch({ url: requestUrl.toString(), maxRedirects: 0 });
      const headers = response.headers();
      if (response.status() === 303 && headers.location) {
        const callback = new URL(headers.location, response.url());
        const callbackToken = tokens.get(callback.origin);
        if (callbackToken && callback.pathname === '/v1/oauth_callback') {
          callback.searchParams.set('__clerk_testing_token', callbackToken);
          headers.location = callback.toString();
        }
      }

      await route.fulfill({ response, headers });
    },
  );
};
