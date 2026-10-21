import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { expect, type Page, test } from '@playwright/test';

import { setupOAuthTestingToken } from '../testUtils/setupOAuthTestingToken';

test.describe('OAuth testing tokens @nextjs', () => {
  let provider: Server;
  let app: Server;
  let providerOrigin: string;
  let appOrigin: string;
  let consentPosts: string[];
  let consentTokens: (string | null)[];

  test.beforeAll(async () => {
    app = createServer((request, response) => {
      response.setHeader('Content-Type', 'text/plain');
      response.end(JSON.stringify({ url: request.url, method: request.method }));
    }).listen(0, '127.0.0.1');
    provider = createServer((request, response) => {
      response.setHeader('Content-Type', 'text/plain');
      const url = new URL(request.url || '/', providerOrigin);
      if (request.method === 'POST' && url.pathname.startsWith('/v1/me/oauth/consent/')) {
        let body = '';
        request.on('data', chunk => {
          body += chunk;
        });
        request.on('end', () => {
          consentPosts.push(body);
          consentTokens.push(url.searchParams.get('__clerk_testing_token'));
          response.writeHead(Number(url.searchParams.get('status') || 303), {
            location: url.searchParams.get('callback') || '/',
            'set-cookie': ['consent=accepted; Path=/', 'provider=authorized; Path=/'],
            'x-consent-response': 'preserved',
          });
          response.end('Consent accepted');
        });
      } else {
        response.end(JSON.stringify({ url: request.url, method: request.method }));
      }
    }).listen(0, '127.0.0.1');
    await Promise.all([once(app, 'listening'), once(provider, 'listening')]);
    appOrigin = `http://127.0.0.1:${(app.address() as AddressInfo).port}`;
    providerOrigin = `http://127.0.0.1:${(provider.address() as AddressInfo).port}`;
  });

  test.beforeEach(async ({ context }) => {
    consentPosts = [];
    consentTokens = [];
    await setupOAuthTestingToken({ context, frontendApiOrigin: appOrigin, token: 'app-testing-token' });
  });

  test.afterAll(async () => {
    await Promise.all([app, provider].map(server => new Promise<void>(resolve => server?.close(() => resolve()))));
  });

  const consent = async (targetPage: Page, callback: URL, status = 303) => {
    const action = new URL('/v1/me/oauth/consent/authorization', providerOrigin);
    action.searchParams.set('callback', callback.toString());
    action.searchParams.set('status', String(status));
    await targetPage.goto(providerOrigin);
    await targetPage.setContent(
      '<form method="post"><input name="consent" value="allow"><button>Allow</button></form>',
    );
    await targetPage.locator('form').evaluate((form, url) => (form.action = url), action.toString());
    const [response] = await Promise.all([
      targetPage.waitForResponse(response => response.request().method() === 'POST'),
      targetPage.getByRole('button', { name: 'Allow' }).click(),
    ]);
    await targetPage.waitForLoadState();
    return response;
  };

  test('delivers the token on the browser callback while preserving the consent redirect', async ({
    page,
    context,
  }) => {
    const callback = new URL('/v1/oauth_callback?code=auth-code&state=a%2Bb%2F%3D&iss=provider', appOrigin);
    const response = await consent(page, callback);

    expect(response.status()).toBe(303);
    expect(response.headers()['x-consent-response']).toBe('preserved');
    expect(consentPosts).toEqual(['consent=allow']);
    expect(consentTokens).toEqual([null]);
    const received = JSON.parse((await page.locator('body').textContent()) || '{}');
    expect(received.method).toBe('GET');
    expect(Object.fromEntries(new URL(received.url, appOrigin).searchParams)).toEqual({
      code: 'auth-code',
      state: 'a+b/=',
      iss: 'provider',
      __clerk_testing_token: 'app-testing-token',
    });
    expect((await context.cookies(providerOrigin)).map(cookie => cookie.name).sort()).toEqual(['consent', 'provider']);
  });

  for (const [name, getCallback] of [
    ['another origin', () => new URL('/v1/oauth_callback?code=auth-code', providerOrigin)],
    ['another path', () => new URL('/sso-callback?code=auth-code', appOrigin)],
    ['a callback subpath', () => new URL('/v1/oauth_callback/other?code=auth-code', appOrigin)],
  ] as const) {
    test(`does not send the token to ${name}`, async ({ page }) => {
      const callback = getCallback();
      await consent(page, callback);
      expect(page.url()).toBe(callback.toString());
    });
  }

  test('preserves non-303 responses', async ({ page }) => {
    const callback = new URL('/v1/oauth_callback?code=auth-code', appOrigin);
    const response = await consent(page, callback, 200);
    expect(response.status()).toBe(200);
    expect(response.headers().location).toBe(callback.toString());
    await expect(page.locator('body')).toHaveText('Consent accepted');
  });

  test('passes consent GET requests through', async ({ page }) => {
    await page.goto(`${providerOrigin}/v1/me/oauth/consent/authorization`);
    expect(consentPosts).toEqual([]);
    expect(JSON.parse((await page.locator('body').textContent()) || '{}').method).toBe('GET');
  });

  test('uses the destination instance token when pages share a context', async ({ page, context }) => {
    await setupOAuthTestingToken({ context, frontendApiOrigin: providerOrigin, token: 'other-app-token' });
    const newPage = await context.newPage();
    await consent(newPage, new URL('/v1/oauth_callback', appOrigin));
    expect(new URL(newPage.url()).searchParams.get('__clerk_testing_token')).toBe('app-testing-token');
    expect(consentTokens).toEqual(['other-app-token']);

    await consent(page, new URL('/v1/oauth_callback', providerOrigin));
    expect(new URL(page.url()).searchParams.get('__clerk_testing_token')).toBe('other-app-token');
  });

  test('uses the latest token without replaying consent when setup repeats', async ({ page, context }) => {
    await setupOAuthTestingToken({ context, frontendApiOrigin: appOrigin, token: 'new-app-token' });
    await consent(page, new URL('/v1/oauth_callback', appOrigin));
    expect(new URL(page.url()).searchParams.get('__clerk_testing_token')).toBe('new-app-token');
    expect(consentPosts).toHaveLength(1);
  });
});
