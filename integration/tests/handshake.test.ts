import * as http from 'node:http';

import { expect, test } from '@playwright/test';

import type { OrganizationSyncOptions } from '../../packages/backend/src/tokens/types';
import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import { generateConfig, getJwksFromSecretKey } from '../testUtils/handshake';

const PORT = 4199;

test.describe('Client handshake @generic', () => {
  test.describe.configure({ mode: 'serial' });

  let app: Application;
  const jwksServer = http.createServer(function (req, res) {
    const sk = req.headers.authorization?.replace('Bearer ', '');
    if (!sk) {
      console.log('No SK to', req.url, req.headers);
    }

    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(getJwksFromSecretKey(sk)));
    res.end();
  });
  // Strip trailing slash
  const devBrowserCookie = '__clerk_db_jwt=needstobeset;';

  test.beforeAll('setup local Clerk API mock', async () => {
    test.setTimeout(90_000); // Wait for app to be ready
    const env = appConfigs.envs.withEmailCodes
      .clone()
      .setEnvVariable('private', 'CLERK_API_URL', `http://localhost:${PORT}`);

    // Start the jwks server
    await new Promise<void>(resolve => jwksServer.listen(4199, resolve));

    app = await appConfigs.next.appRouter
      .clone()
      .addFile(
        'src/middleware.ts',
        () => `import { clerkMiddleware } from '@clerk/nextjs/server';

    export const middleware = (req, evt) => {
      const satelliteAutoSyncHeader = req.headers.get('x-satellite-auto-sync');
      return clerkMiddleware({
        publishableKey: req.headers.get("x-publishable-key"),
        secretKey: req.headers.get("x-secret-key"),
        proxyUrl: req.headers.get("x-proxy-url"),
        domain: req.headers.get("x-domain"),
        isSatellite: req.headers.get('x-satellite') === 'true',
        signInUrl: req.headers.get("x-sign-in-url"),
        satelliteAutoSync: satelliteAutoSyncHeader === null ? undefined : satelliteAutoSyncHeader === 'true',
      })(req, evt)
    };

    export const config = {
      matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
    };
    `,
      )
      .commit();

    await app.setup();
    await app.withEnv(env);
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
    await new Promise<void>(resolve => jwksServer.close(() => resolve()));
  });

  test('standard signed-in - dev', async () => {
    const config = generateConfig({ mode: 'test' });
    const { token, claims } = config.generateToken({ state: 'active' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `${devBrowserCookie} __client_uat=${clientUat}; __session=${token}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(200);
  });

  test('standard signed-in - authorization header - dev', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const { token, claims } = config.generateToken({ state: 'active' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `${devBrowserCookie} __client_uat=${clientUat};`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        Authorization: `Bearer ${token}`,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(200);
  });

  test('standard signed-in - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const { token, claims } = config.generateToken({ state: 'active' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `__client_uat=${clientUat}; __session=${token}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(200);
  });

  test('standard signed-in - authorization header - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const { token, claims } = config.generateToken({ state: 'active' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `__client_uat=${clientUat};`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        Authorization: `Bearer ${token}`,
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(200);
  });

  test('expired session token - dev', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const { token, claims } = config.generateToken({ state: 'expired' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `${devBrowserCookie} __client_uat=${clientUat}; __session=${token}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe(`https://${config.pkHost}/v1/client/handshake`);
    expect(locationUrl.searchParams.get('redirect_url')).toBe(`${app.serverUrl}/`);
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe(
      'session-token-expired-refresh-non-eligible-no-refresh-cookie',
    );
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('expired session token - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const { token, claims } = config.generateToken({ state: 'expired' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `__client_uat=${clientUat}; __session=${token}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe(`https://${config.pkHost}/v1/client/handshake`);
    expect(locationUrl.searchParams.get('redirect_url')).toBe(`${app.serverUrl}/`);
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe(
      'session-token-expired-refresh-non-eligible-no-refresh-cookie',
    );
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('expired session token - authorization header - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const { token, claims } = config.generateToken({ state: 'expired' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `__client_uat=${clientUat};`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        Authorization: `Bearer ${token}`,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe(`https://${config.pkHost}/v1/client/handshake`);
    expect(locationUrl.searchParams.get('redirect_url')).toBe(`${app.serverUrl}/`);
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe(
      'session-token-expired-refresh-non-eligible-no-refresh-cookie',
    );
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('early session token - dev', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const { token, claims } = config.generateToken({ state: 'early' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `${devBrowserCookie} __client_uat=${clientUat}; __session=${token}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe(`https://${config.pkHost}/v1/client/handshake`);
    expect(locationUrl.searchParams.get('redirect_url')).toBe(`${app.serverUrl}/`);
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe('session-token-nbf');
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('early session token - authorization header - dev', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const { token, claims } = config.generateToken({ state: 'early' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `${devBrowserCookie} __client_uat=${clientUat};`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        Authorization: `Bearer ${token}`,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe(`https://${config.pkHost}/v1/client/handshake`);
    expect(locationUrl.searchParams.get('redirect_url')).toBe(`${app.serverUrl}/`);
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe('session-token-nbf');
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('proxyUrl - dev', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const { token, claims } = config.generateToken({ state: 'expired' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `${devBrowserCookie} __client_uat=${clientUat}; __session=${token}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'X-Proxy-Url': 'https://example.com/clerk',
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe('https://example.com/clerk/v1/client/handshake');
    expect(locationUrl.searchParams.get('redirect_url')).toBe(`${app.serverUrl}/`);
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe(
      'session-token-expired-refresh-non-eligible-no-refresh-cookie',
    );
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('proxyUrl - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const { token, claims } = config.generateToken({ state: 'expired' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `__client_uat=${clientUat}; __session=${token}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'X-Proxy-Url': 'https://example.com/clerk',
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe('https://example.com/clerk/v1/client/handshake');
    expect(locationUrl.searchParams.get('redirect_url')).toBe(`${app.serverUrl}/`);
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe(
      'session-token-expired-refresh-non-eligible-no-refresh-cookie',
    );
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('domain - dev', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const { token, claims } = config.generateToken({ state: 'expired' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `${devBrowserCookie} __client_uat=${clientUat}; __session=${token}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'X-Domain': 'localhost:3000',
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe(`https://${config.pkHost}/v1/client/handshake`);
    expect(locationUrl.searchParams.get('redirect_url')).toBe(`${app.serverUrl}/`);
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe(
      'session-token-expired-refresh-non-eligible-no-refresh-cookie',
    );
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('domain - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const { token, claims } = config.generateToken({ state: 'expired' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `__client_uat=${clientUat}; __session=${token}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'X-Domain': 'example.com',
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));

    // The domain is ignored for non-satellite requests
    expect(locationUrl.hostname).not.toBe('example.com');

    expect(locationUrl.origin + locationUrl.pathname).toContain('/v1/client/handshake');
    expect(locationUrl.searchParams.get('redirect_url')).toBe(`${app.serverUrl}/`);
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe(
      'session-token-expired-refresh-non-eligible-no-refresh-cookie',
    );
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('domain - prod satellite - domain is used as the redirect url', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const { token, claims } = config.generateToken({ state: 'expired' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `__client_uat=${clientUat}; __session=${token}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'X-Satellite': 'true',
        'X-Domain': 'example.com',
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));

    // The domain is used as the redirect url
    expect(locationUrl.origin + locationUrl.pathname).toBe('https://clerk.example.com/v1/client/handshake');
  });

  test('missing session token, positive uat - dev', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `${devBrowserCookie} __client_uat=1`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe(`https://${config.pkHost}/v1/client/handshake`);
    expect(locationUrl.searchParams.get('redirect_url')).toBe(`${app.serverUrl}/`);
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe('client-uat-but-no-session-token');
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('missing session token, positive uat - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `__client_uat=1`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe(`https://${config.pkHost}/v1/client/handshake`);
    expect(locationUrl.searchParams.get('redirect_url')).toBe(`${app.serverUrl}/`);
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe('client-uat-but-no-session-token');
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('missing session token, 0 uat (indicating signed out) - dev', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `${devBrowserCookie} __client_uat=0`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(200);
  });

  test('missing session token, 0 uat (indicating signed out) - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `__client_uat=0`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(200);
  });

  test('missing session token, missing uat (indicating signed out) - dev', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        Cookie: `${devBrowserCookie}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(200);
  });

  test('missing session token, missing uat (indicating signed out) - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(200);
  });

  test('signed out satellite no sec-fetch-dest=document - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'X-Satellite': 'true',
        'X-Domain': 'example.com',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(200);
  });

  test('signed out satellite with sec-fetch-dest=document - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'X-Satellite': 'true',
        'X-Domain': 'example.com',
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe('https://clerk.example.com/v1/client/handshake');
    expect(locationUrl.searchParams.get('redirect_url')).toBe(`${app.serverUrl}/`);
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe('satellite-needs-syncing');
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('signed out satellite - dev', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'X-Satellite': 'true',
        'X-Domain': 'example.com',
        'X-Sign-In-Url': 'https://example.com/sign-in',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(200);
  });

  test('signed out satellite with satelliteAutoSync=false skips handshake - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'X-Satellite': 'true',
        'X-Domain': 'example.com',
        'X-Satellite-Auto-Sync': 'false',
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    // Should NOT redirect to handshake when satelliteAutoSync=false and no cookies
    expect(res.status).toBe(200);
  });

  test('signed out satellite with satelliteAutoSync=false triggers handshake when __clerk_synced=false - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const res = await fetch(app.serverUrl + '/?__clerk_synced=false', {
      headers: new Headers({
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'X-Satellite': 'true',
        'X-Domain': 'example.com',
        'X-Satellite-Auto-Sync': 'false',
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    // Should redirect to handshake when __clerk_synced=false is present
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe('https://clerk.example.com/v1/client/handshake');
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe('satellite-needs-syncing');
  });

  test('signed out satellite skips handshake when __clerk_synced=true (completed) - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const res = await fetch(app.serverUrl + '/?__clerk_synced=true', {
      headers: new Headers({
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'X-Satellite': 'true',
        'X-Domain': 'example.com',
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    // Should NOT redirect when __clerk_synced=true indicates sync already completed
    expect(res.status).toBe(200);
  });

  test('signed out satellite with satelliteAutoSync=true (default) triggers handshake - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'X-Satellite': 'true',
        'X-Domain': 'example.com',
        'X-Satellite-Auto-Sync': 'true',
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    // Should redirect to handshake with default/true satelliteAutoSync
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe('https://clerk.example.com/v1/client/handshake');
  });

  test('missing session token, missing uat (indicating signed out), missing devbrowser - dev', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe(`https://${config.pkHost}/v1/client/handshake`);
    expect(locationUrl.searchParams.get('redirect_url')).toBe(`${app.serverUrl}/`);
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe('dev-browser-missing');
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('redirect url - path and qs - dev', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const { token, claims } = config.generateToken({ state: 'expired' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/hello?foo=bar', {
      headers: new Headers({
        Cookie: `${devBrowserCookie} __client_uat=${clientUat}; __session=${token}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe(`https://${config.pkHost}/v1/client/handshake`);
    expect(locationUrl.searchParams.get('redirect_url')).toBe(`${app.serverUrl}/hello?foo=bar`);
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe(
      'session-token-expired-refresh-non-eligible-no-refresh-cookie',
    );
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('redirect url - path and qs - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const { token, claims } = config.generateToken({ state: 'expired' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/hello?foo=bar', {
      headers: new Headers({
        Cookie: `__client_uat=${clientUat}; __session=${token}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe(`https://${config.pkHost}/v1/client/handshake`);
    expect(locationUrl.searchParams.get('redirect_url')).toBe(`${app.serverUrl}/hello?foo=bar`);
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe(
      'session-token-expired-refresh-non-eligible-no-refresh-cookie',
    );
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('redirect url - proxy - dev', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const { token, claims } = config.generateToken({ state: 'expired' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/hello?foo=bar', {
      headers: new Headers({
        Cookie: `${devBrowserCookie} __client_uat=${clientUat}; __session=${token}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'X-Forwarded-Host': 'example.com',
        'X-Forwarded-Proto': 'https',
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe(`https://${config.pkHost}/v1/client/handshake`);
    expect(locationUrl.searchParams.get('redirect_url')).toBe('https://example.com/hello?foo=bar');
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe(
      'session-token-expired-refresh-non-eligible-no-refresh-cookie',
    );
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('redirect url - proxy - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const { token, claims } = config.generateToken({ state: 'expired' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/hello?foo=bar', {
      headers: new Headers({
        Cookie: `__client_uat=${clientUat}; __session=${token}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'X-Forwarded-Host': 'example.com',
        'X-Forwarded-Proto': 'https',
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe(`https://${config.pkHost}/v1/client/handshake`);
    expect(locationUrl.searchParams.get('redirect_url')).toBe('https://example.com/hello?foo=bar');
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe(
      'session-token-expired-refresh-non-eligible-no-refresh-cookie',
    );
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('redirect url - proxy with port - dev', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const { token, claims } = config.generateToken({ state: 'expired' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/hello?foo=bar', {
      headers: new Headers({
        Cookie: `${devBrowserCookie} __client_uat=${clientUat}; __session=${token}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'X-Forwarded-Host': 'example.com:3213',
        'X-Forwarded-Proto': 'https',
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe(`https://${config.pkHost}/v1/client/handshake`);
    expect(locationUrl.searchParams.get('redirect_url')).toBe('https://example.com:3213/hello?foo=bar');
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe(
      'session-token-expired-refresh-non-eligible-no-refresh-cookie',
    );
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('redirect url - proxy with port - prod', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const { token, claims } = config.generateToken({ state: 'expired' });
    const clientUat = claims.iat;
    const res = await fetch(app.serverUrl + '/hello?foo=bar', {
      headers: new Headers({
        Cookie: `__client_uat=${clientUat}; __session=${token}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'X-Forwarded-Host': 'example.com:3213',
        'X-Forwarded-Proto': 'https',
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe(`https://${config.pkHost}/v1/client/handshake`);
    expect(locationUrl.searchParams.get('redirect_url')).toBe('https://example.com:3213/hello?foo=bar');
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe(
      'session-token-expired-refresh-non-eligible-no-refresh-cookie',
    );
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
  });

  test('Handshake result - dev - nominal', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const { token } = config.generateToken({ state: 'active' });
    const cookiesToSet = [`__session=${token};path=/`, 'foo=bar;path=/;domain=example.com'];
    const handshake = await config.generateHandshakeToken(cookiesToSet);
    const res = await fetch(app.serverUrl + '/?__clerk_handshake=' + handshake, {
      headers: new Headers({
        Cookie: `${devBrowserCookie}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('/');
    const headers = [...res.headers.entries()];
    cookiesToSet.forEach(cookie => {
      expect(headers).toContainEqual(['set-cookie', cookie]);
    });
  });

  test('Handshake result - dev - skew - clock behind', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const { token } = config.generateToken({ state: 'early' });
    const cookiesToSet = [`__session=${token};path=/`, 'foo=bar;path=/;domain=example.com'];
    const handshake = await config.generateHandshakeToken(cookiesToSet);
    const res = await fetch(app.serverUrl + '/?__clerk_handshake=' + handshake, {
      headers: new Headers({
        Cookie: `${devBrowserCookie}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('/');
  });

  test('Handshake result - dev - skew - clock ahead', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const { token } = config.generateToken({ state: 'expired' });
    const cookiesToSet = [`__session=${token};path=/`, 'foo=bar;path=/;domain=example.com'];
    const handshake = await config.generateHandshakeToken(cookiesToSet);
    const res = await fetch(app.serverUrl + '/?__clerk_handshake=' + handshake, {
      headers: new Headers({
        Cookie: `${devBrowserCookie}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
  });

  test('Handshake result - dev - mismatched keys', async () => {
    const config = generateConfig({
      mode: 'test',
      matchedKeys: false,
    });
    const { token } = config.generateToken({ state: 'active' });
    const cookiesToSet = [`__session=${token};path=/`, 'foo=bar;path=/;domain=example.com'];
    const handshake = await config.generateHandshakeToken(cookiesToSet);
    const res = await fetch(app.serverUrl + '/?__clerk_handshake=' + handshake, {
      headers: new Headers({
        Cookie: `${devBrowserCookie}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(500);
  });

  // I don't know if we need this one? We might pass new devbrowser back in handshake
  test('Handshake result - dev - new devbrowser', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const { token } = config.generateToken({ state: 'active' });
    const cookiesToSet = [`__session=${token};path=/`, '__clerk_db_jwt=asdf;path=/'];
    const handshake = await config.generateHandshakeToken(cookiesToSet);
    const res = await fetch(app.serverUrl + '/?__clerk_handshake=' + handshake, {
      headers: new Headers({
        Cookie: `${devBrowserCookie}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('/');
    const headers = [...res.headers.entries()];
    cookiesToSet.forEach(cookie => {
      expect(headers).toContainEqual(['set-cookie', cookie]);
    });
  });

  test('External visit - new devbrowser', async () => {
    const config = generateConfig({
      mode: 'test',
    });
    const res = await fetch(app.serverUrl + '/?__clerk_db_jwt=asdf', {
      headers: new Headers({
        Cookie: `${devBrowserCookie}`,
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
    const locationUrl = new URL(res.headers.get('location'));
    expect(locationUrl.origin + locationUrl.pathname).toBe(`https://${config.pkHost}/v1/client/handshake`);
    expect(locationUrl.searchParams.get('redirect_url')).toBe(`${app.serverUrl}/`);
    expect(locationUrl.searchParams.get('__clerk_hs_reason')).toBe('dev-browser-sync');
    expect(locationUrl.searchParams.has('__clerk_api_version')).toBe(true);
    expect(locationUrl.searchParams.get('suffixed_cookies')).toBe('false');
    expect(locationUrl.searchParams.get('__clerk_db_jwt')).toBe('asdf');
  });

  test('Handshake result - prod - nominal', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const { token } = config.generateToken({ state: 'active' });
    const cookiesToSet = [`__session=${token};path=/`, 'foo=bar;path=/;domain=example.com'];
    const handshake = await config.generateHandshakeToken(cookiesToSet);
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        Cookie: `__clerk_handshake=${handshake}`,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(200);
    const headers = [...res.headers.entries()];
    cookiesToSet.forEach(cookie => {
      expect(headers).toContainEqual(['set-cookie', cookie]);
    });
  });

  test('Handshake result - prod - skew - clock behind', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const { token } = config.generateToken({ state: 'early' });
    const cookiesToSet = [`__session=${token};path=/`, 'foo=bar;path=/;domain=example.com'];
    const handshake = await config.generateHandshakeToken(cookiesToSet);
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        Cookie: `__clerk_handshake=${handshake}`,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(200);
  });

  test('Handshake result - prod - session token expired and handshake stale', async () => {
    const config = generateConfig({
      mode: 'live',
    });
    const { token: currentSessionToken, claims } = config.generateToken({ state: 'expired' });
    const { token } = config.generateToken({ state: 'expired' });
    const cookiesToSet = [`__session=${token};path=/`, 'foo=bar;path=/;domain=example.com'];
    const handshake = await config.generateHandshakeToken(cookiesToSet);
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        Cookie: `__clerk_handshake=${handshake};__session=${currentSessionToken};__client_uat=${claims.iat}`,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(307);
  });

  test('Handshake result - prod - mismatched keys', async () => {
    const config = generateConfig({
      mode: 'live',
      matchedKeys: false,
    });
    const { token } = config.generateToken({ state: 'active' });
    const cookiesToSet = [`__session=${token};path=/`, 'foo=bar;path=/;domain=example.com'];
    const handshake = await config.generateHandshakeToken(cookiesToSet);
    const res = await fetch(app.serverUrl + '/', {
      headers: new Headers({
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,
        Cookie: `__clerk_handshake=${handshake}`,
        'Sec-Fetch-Dest': 'document',
      }),
      redirect: 'manual',
    });
    expect(res.status).toBe(200);
  });
});

test.describe('Client handshake with organization activation @nextjs', () => {
  test.describe.configure({ mode: 'parallel' });

  const devBrowserCookie = '__clerk_db_jwt=needstobeset;';

  const jwksServer = http.createServer(function (req, res) {
    const sk = req.headers.authorization?.replace('Bearer ', '');
    if (!sk) {
      console.log('No SK to', req.url, req.headers);
    }

    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(getJwksFromSecretKey(sk)));
    res.end();
  });

  let app: Application;

  test.beforeAll('setup local jwks server', async () => {
    test.setTimeout(90_000); // Wait for app to be ready
    // Start the jwks server
    await new Promise<void>(resolve => jwksServer.listen(0, resolve));
    const address = jwksServer.address();
    const port = typeof address === 'string' ? 0 : address?.port;
    app = await startAppWithOrganizationSyncOptions(`http://localhost:${port}`);
  });

  test.afterAll('setup local Clerk API mock', async () => {
    await app.teardown();
    return new Promise<void>(resolve => jwksServer.close(() => resolve()));
  });

  type TestCase = {
    name: string;
    when: When;
    then: Then;
  };
  type When = {
    // With this initial state...
    initialAuthState: 'active' | 'expired' | 'early';
    initialSessionClaims: Map<string, string>;

    // When the customer app specifies these orgSyncOptions to middleware...
    orgSyncOptions: OrganizationSyncOptions;

    // And a request arrives to the app at this path...
    appRequestPath: string;

    // With a token specified in...
    tokenAppearsIn: 'header' | 'cookie';

    // And the Sec-fetch-dest header is...
    secFetchDestHeader: string | null;
  };

  type Then = {
    // A handshake should (or should not) occur:
    expectStatus: number;

    // The middleware should redirect to fapi with this query param value:
    fapiOrganizationIdParamValue: string | null;
  };

  const cookieAuthCases: TestCase[] = [
    // ---------------- Session active vs expired tests ----------------
    // Note: it would be possible to run _every_ test with both active and expired initial states
    //       and expect the same results, but we're avoiding that to save some test execution time.
    {
      name: 'Expired session, no org in session, but org a requested by ID => attempts to activate org A',
      when: {
        initialAuthState: 'expired',
        initialSessionClaims: new Map<string, string>([
          // Intentionally empty
        ]),
        orgSyncOptions: {
          organizationPatterns: ['/organizations-by-id/:id'],
        },
        appRequestPath: '/organizations-by-id/org_a',
        tokenAppearsIn: 'cookie',
        secFetchDestHeader: 'document',
      },
      then: {
        expectStatus: 307,
        fapiOrganizationIdParamValue: 'org_a',
      },
    },
    {
      name: 'Active session, no org in session, but org a requested by ID => attempts to activate org A',
      when: {
        initialAuthState: 'active',
        initialSessionClaims: new Map<string, string>([
          // Intentionally empty
        ]),
        orgSyncOptions: {
          organizationPatterns: ['/organizations-by-id/:id'],
        },
        appRequestPath: '/organizations-by-id/org_a',
        tokenAppearsIn: 'cookie',
        secFetchDestHeader: 'document',
      },
      then: {
        expectStatus: 307,
        fapiOrganizationIdParamValue: 'org_a',
      },
    },

    // ---------------- Header-based auth tests ----------------
    // Header-based auth requests come from non-browser actors, which don't have the __client cookie.
    // Handshaking depends on a redirect that includes that __client cookie, so we should not handshake
    // for this auth method, even if there's an org mismatch
    {
      name: 'Header-based auth should not handshake with active auth',
      when: {
        initialAuthState: 'active',
        initialSessionClaims: new Map<string, string>([
          // Intentionally empty
        ]),
        orgSyncOptions: {
          organizationPatterns: ['/organizations-by-id/:id'],
        },
        appRequestPath: '/organizations-by-id/org_a',
        tokenAppearsIn: 'header',
        secFetchDestHeader: null,
      },
      then: {
        expectStatus: 200,
        fapiOrganizationIdParamValue: null,
      },
    },
    {
      name: 'Header-based auth should not handshake with expired auth',
      when: {
        initialAuthState: 'expired',
        initialSessionClaims: new Map<string, string>([
          // Intentionally empty
        ]),
        orgSyncOptions: {
          organizationPatterns: ['/organizations-by-id/:id'],
        },
        appRequestPath: '/organizations-by-id/org_a',
        tokenAppearsIn: 'header',
        secFetchDestHeader: null,
      },
      then: {
        expectStatus: 307, // Should redirect to sign-in
        fapiOrganizationIdParamValue: null,
      },
    },

    // ---------------- Existing session active org tests ----------------
    {
      name: 'Active session, org A active in session, but org B is requested by ID => attempts to activate org B',
      when: {
        initialAuthState: 'active',
        initialSessionClaims: new Map<string, string>([['org_id', 'org_a']]),
        orgSyncOptions: {
          organizationPatterns: ['/organizations-by-id/:id', '/organizations-by-id/:id/(.*)'],
        },
        appRequestPath: '/organizations-by-id/org_b',
        tokenAppearsIn: 'cookie',
        secFetchDestHeader: 'document',
      },
      then: {
        expectStatus: 307,
        fapiOrganizationIdParamValue: 'org_b',
      },
    },
    {
      name: 'Active session, no active org in session, but org B is requested by slug => attempts to activate org B',
      when: {
        initialAuthState: 'active',
        initialSessionClaims: new Map<string, string>([
          // Intentionally empty
        ]),
        orgSyncOptions: {
          organizationPatterns: [
            '/organizations-by-id/:id',
            '/organizations-by-id/:id/(.*)',
            '/organizations-by-slug/:slug',
            '/organizations-by-slug/:id/(.*)',
          ],
        },
        appRequestPath: '/organizations-by-slug/bcorp',
        tokenAppearsIn: 'cookie',
        secFetchDestHeader: 'document',
      },
      then: {
        expectStatus: 307,
        fapiOrganizationIdParamValue: 'bcorp',
      },
    },
    {
      name: 'Active session, org a in session, but *an org B subresource* is requested by slug => attempts to activate org B',
      when: {
        initialAuthState: 'active',
        initialSessionClaims: new Map<string, string>([['org_id', 'org_a']]),
        orgSyncOptions: {
          organizationPatterns: [
            '/organizations-by-slug/:slug',
            '/organizations-by-slug/:id/(.*)',
            '/organizations-by-id/:id',
            '/organizations-by-id/:id/(.*)',
          ],
        },
        appRequestPath: '/organizations-by-slug/bcorp/settings',
        tokenAppearsIn: 'cookie',
        secFetchDestHeader: 'document',
      },
      then: {
        expectStatus: 307,
        fapiOrganizationIdParamValue: 'bcorp',
      },
    },
    {
      // This case ensures that, for the prototypical nextjs app, we permanent redirect before attempting the handshake logic.
      // If this wasn't the case, we'd need to recommend adding an additional pattern with a trailing slash to our docs.
      name: 'When org A is active in a signed-out session but an org B is requested by ID with a trailing slash, permanent redirects to the non-slash route without error.',
      when: {
        initialAuthState: 'expired',
        initialSessionClaims: new Map<string, string>([['org_id', 'org_a']]),
        orgSyncOptions: {
          organizationPatterns: ['/organizations-by-id/:id', '/organizations-by-id/:id/(.*)'],
        },
        appRequestPath: '/organizations-by-id/org_b/',
        tokenAppearsIn: 'cookie',
        secFetchDestHeader: 'document',
      },
      then: {
        expectStatus: 308, // Handshake never 308's - this points to `/organizations-by-id/org_b` (no trailing slash)
        fapiOrganizationIdParamValue: null,
      },
    },

    // ---------------- Personal account tests ----------------
    {
      name: 'Active session, org a in session, but *the personal account* is requested => attempts to activate PWS',
      when: {
        initialAuthState: 'active',
        initialSessionClaims: new Map<string, string>([['org_id', 'org_a']]),
        orgSyncOptions: {
          organizationPatterns: [
            '/organizations-by-id/:id',
            '/organizations-by-id/:id/(.*)',
            '/organizations-by-slug/:slug',
            '/organizations-by-slug/:id/(.*)',
          ],
          personalAccountPatterns: ['/personal-account', '/personal-account/(.*)'],
        },
        appRequestPath: '/personal-account',
        tokenAppearsIn: 'cookie',
        secFetchDestHeader: 'document',
      },
      then: {
        expectStatus: 307,
        fapiOrganizationIdParamValue: '', // <-- Empty string indicates personal account
      },
    },

    // ---------------- No activation required tests ----------------
    {
      name: 'Active session, nothing session, and the personal account is requested => nothing to activate!',
      when: {
        initialAuthState: 'active',
        initialSessionClaims: new Map<string, string>([
          // Intentionally empty
        ]),
        orgSyncOptions: {
          organizationPatterns: ['/organizations-by-slug/:slug', '/organizations-by-slug/:id/(.*)'],
          personalAccountPatterns: ['/personal-account', '/personal-account/(.*)'],
        },
        appRequestPath: '/personal-account',
        tokenAppearsIn: 'cookie',
        secFetchDestHeader: 'document',
      },
      then: {
        expectStatus: 200,
        fapiOrganizationIdParamValue: null,
      },
    },
    {
      name: 'Active session, org a active in session, and org a is requested => nothing to activate!',
      when: {
        initialAuthState: 'active',
        initialSessionClaims: new Map<string, string>([['org_id', 'org_a']]),
        orgSyncOptions: {
          organizationPatterns: ['/organizations-by-id/:id', '/organizations-by-id/:id/(.*)'],
          personalAccountPatterns: ['/personal-account', '/personal-account/(.*)'],
        },
        appRequestPath: '/organizations-by-id/org_a',
        tokenAppearsIn: 'cookie',
        secFetchDestHeader: 'document',
      },
      then: {
        expectStatus: 200,
        fapiOrganizationIdParamValue: null,
      },
    },
    {
      name: 'Expired session, org A active in session, but org B is requested by ID => attempts to activate org B',
      when: {
        initialAuthState: 'expired',
        initialSessionClaims: new Map<string, string>([['org_id', 'org_a']]),
        orgSyncOptions: {
          organizationPatterns: ['/organizations-by-id/:id', '/organizations-by-id/:id/(.*)'],
        },
        appRequestPath: '/organizations-by-id/org_b',
        tokenAppearsIn: 'cookie',
        secFetchDestHeader: 'document',
      },
      then: {
        expectStatus: 307,
        fapiOrganizationIdParamValue: 'org_b',
      },
    },
    {
      name: 'Expired session, no active org in session, but org B is requested by slug => attempts to activate org B',
      when: {
        initialAuthState: 'expired',
        initialSessionClaims: new Map<string, string>([]),
        orgSyncOptions: {
          organizationPatterns: [
            '/organizations-by-id/:id',
            '/organizations-by-id/:id/(.*)',
            '/organizations-by-slug/:slug',
            '/organizations-by-slug/:id/(.*)',
          ],
        },
        appRequestPath: '/organizations-by-slug/bcorp',
        tokenAppearsIn: 'cookie',
        secFetchDestHeader: 'document',
      },
      then: {
        expectStatus: 307,
        fapiOrganizationIdParamValue: 'bcorp',
      },
    },
    {
      name: 'Expired session, org A in session, but *an org B* is requested by slug => attempts to activate org B',
      when: {
        initialAuthState: 'expired',
        initialSessionClaims: new Map<string, string>([['org_id', 'org_a']]),
        orgSyncOptions: {
          organizationPatterns: [
            '/organizations-by-slug/:slug',
            '/organizations-by-slug/:id/(.*)',
            '/organizations-by-id/:id',
            '/organizations-by-id/:id/(.*)',
          ],
        },
        appRequestPath: '/organizations-by-slug/bcorp/settings',
        tokenAppearsIn: 'cookie',
        secFetchDestHeader: 'document',
      },
      then: {
        expectStatus: 307,
        fapiOrganizationIdParamValue: 'bcorp',
      },
    },
    {
      name: 'Expired session, org A in session, but *the personal account* is requested => attempts to activate personal account',
      when: {
        initialAuthState: 'expired',
        initialSessionClaims: new Map<string, string>([['org_id', 'org_a']]),
        orgSyncOptions: {
          organizationPatterns: [
            '/organizations-by-id/:id',
            '/organizations-by-id/:id/(.*)',
            '/organizations-by-slug/:slug',
            '/organizations-by-slug/:id/(.*)',
          ],
          personalAccountPatterns: ['/personal-account', '/personal-account/(.*)'],
        },
        appRequestPath: '/personal-account',
        tokenAppearsIn: 'cookie',
        secFetchDestHeader: 'document',
      },
      then: {
        expectStatus: 307,
        fapiOrganizationIdParamValue: '', // <-- Empty string indicates personal account
      },
    },
    {
      name: 'Expired session, org A in session, and org A is requested => still handshakes to refresh session',
      when: {
        initialAuthState: 'expired',
        initialSessionClaims: new Map<string, string>([['org_id', 'org_a']]),
        orgSyncOptions: {
          organizationPatterns: ['/organizations-by-id/:id', '/organizations-by-id/:id/(.*)'],
          personalAccountPatterns: ['/personal-account', '/personal-account/(.*)'],
        },
        appRequestPath: '/organizations-by-id/org_a',
        tokenAppearsIn: 'cookie',
        secFetchDestHeader: 'document',
      },
      then: {
        expectStatus: 307,
        fapiOrganizationIdParamValue: 'org_a', // Same org, but still handshakes to refresh the expired token
      },
    },
    {
      // NOTE(izaak): Would we prefer 500ing in this case?
      name: 'No config => nothing to activate, return 200',
      when: {
        initialAuthState: 'active',
        initialSessionClaims: new Map<string, string>([['org_id', 'org_a']]),
        orgSyncOptions: null,
        appRequestPath: '/organizations-by-id/org_a',
        tokenAppearsIn: 'cookie',
        secFetchDestHeader: 'document',
      },
      then: {
        expectStatus: 200,
        fapiOrganizationIdParamValue: null,
      },
    },

    // ---------------- Invalid permutation tests ----------------
    {
      name: 'Invalid config => ignore it and return 200',
      when: {
        initialAuthState: 'active',
        initialSessionClaims: new Map<string, string>([['org_id', 'org_a']]),
        orgSyncOptions: {
          organizationPatterns: ['i am not valid config'],
        },
        appRequestPath: '/organizations-by-id/org_a',
        tokenAppearsIn: 'cookie',
        secFetchDestHeader: 'document',
      },
      then: {
        expectStatus: 200,
        fapiOrganizationIdParamValue: null,
      },
    },
  ];

  for (const testCase of cookieAuthCases) {
    test(`${testCase.name}`, async () => {
      const config = generateConfig({
        mode: 'test',
      });
      // Create a new map with an org_id key
      const { token, claims } = config.generateToken({
        state: testCase.when.initialAuthState, // <-- Critical
        extraClaims: testCase.when.initialSessionClaims,
      });

      const headers = new Headers({
        'X-Publishable-Key': config.pk,
        'X-Secret-Key': config.sk,

        // NOTE(izaak): To avoid needing to start a server with every test, we're passing in
        // organization options to the app via a header.
        'x-organization-sync-options': JSON.stringify(testCase.when.orgSyncOptions),
      });

      if (testCase.when.secFetchDestHeader) {
        headers.set('Sec-Fetch-Dest', testCase.when.secFetchDestHeader);
      }

      switch (testCase.when.tokenAppearsIn) {
        case 'cookie':
          headers.set('Cookie', `${devBrowserCookie} __client_uat=${claims.iat}; __session=${token}`);
          break;
        case 'header':
          headers.set('Authorization', `Bearer ${token}`);
          break;
      }

      const res = await fetch(app.serverUrl + testCase.when.appRequestPath, {
        headers: headers,
        redirect: 'manual',
      });

      if (testCase.name === 'Header-based auth should not handshake with expired auth') {
        console.log(testCase.name);
        console.log(res.headers.get('x-clerk-auth-status'));
        console.log(res.headers.get('x-clerk-auth-reason'));
      }

      expect(res.status).toBe(testCase.then.expectStatus);
      const redirectSearchParams = new URLSearchParams(res.headers.get('location'));
      expect(redirectSearchParams.get('organization_id')).toBe(testCase.then.fapiOrganizationIdParamValue);
    });
  }
});

test.describe('Client handshake with an organization activation avoids infinite loops @nextjs', () => {
  const devBrowserCookie = '__clerk_db_jwt=needstobeset;';

  const jwksServer = http.createServer(function (req, res) {
    const sk = req.headers.authorization?.replace('Bearer ', '');
    if (!sk) {
      console.log('No SK to', req.url, req.headers);
    }

    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(getJwksFromSecretKey(sk)));
    res.end();
  });

  // define app as an application
  let thisApp: Application;

  test.beforeAll('setup local jwks server', async () => {
    test.setTimeout(90_000); // Wait for app to be ready
    // Start the jwks server
    await new Promise<void>(resolve => jwksServer.listen(0, resolve));
    const address = jwksServer.address();
    const port = typeof address === 'string' ? 0 : address?.port;
    thisApp = await startAppWithOrganizationSyncOptions(`http://localhost:${port}`);
  });

  test.afterAll('setup local Clerk API mock', async () => {
    await thisApp.teardown();
    return new Promise<void>(resolve => jwksServer.close(() => resolve()));
  });

  // -------------- Test begin ------------

  const config = generateConfig({
    mode: 'test',
  });

  const organizationSyncOptions = {
    organizationPatterns: ['/organizations-by-id/:id', '/organizations-by-id/:id/(.*)'],
    personalAccountPatterns: ['/personal-account', '/personal-account/(.*)'],
  };

  test('Sets the redirect loop tracking cookie', async () => {
    // Create a new map with an org_id key
    const { token, claims } = config.generateToken({
      state: 'active',
      extraClaims: new Map<string, string>([]),
    });

    const headers = new Headers({
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      'Sec-Fetch-Dest': 'document',
      'x-organization-sync-options': JSON.stringify(organizationSyncOptions),
    });
    headers.set('Cookie', `${devBrowserCookie} __client_uat=${claims.iat}; __session=${token}`);

    const res = await fetch(thisApp.serverUrl + '/organizations-by-id/org_a', {
      headers: headers,
      redirect: 'manual',
    });

    expect(res.status).toBe(307);
    const redirectSearchParams = new URLSearchParams(res.headers.get('location'));
    expect(redirectSearchParams.get('organization_id')).toBe('org_a');

    // read the set-cookie directives
    const setCookie = res.headers.get('set-cookie');

    expect(setCookie).toContain(`__clerk_redirect_count=1`); // <-- Critical
  });

  test('Ignores organization config when being redirected to', async () => {
    // Create a new map with an org_id key
    const { token, claims } = config.generateToken({
      state: 'active', // Must be active - handshake logic only runs once session is determined to be active
      extraClaims: new Map<string, string>([]),
    });

    const headers = new Headers({
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      'Sec-Fetch-Dest': 'document',
      'x-organization-sync-options': JSON.stringify(organizationSyncOptions),
    });

    // Critical cookie: __clerk_redirect_count
    headers.set(
      'Cookie',
      `${devBrowserCookie} __client_uat=${claims.iat}; __session=${token}; __clerk_redirect_count=3`,
    );

    const res = await fetch(thisApp.serverUrl + '/organizations-by-id/org_a', {
      headers: headers,
      redirect: 'manual',
    });

    expect(res.status).toBe(200);
    const redirectSearchParams = new URLSearchParams(res.headers.get('location'));
    expect(redirectSearchParams.get('organization_id')).toBe(null);

    expect(res.headers.get('set-cookie')).toBe(null);
  });
});

/**
 * Start the nextjs sample app with the given organization sync options
 * organization sync options can be passed to the app via the
 * "x-organization-sync-options" header
 */
const startAppWithOrganizationSyncOptions = async (clerkAPIUrl: string): Promise<Application> => {
  const env = appConfigs.envs.withEmailCodes.clone().setEnvVariable('private', 'CLERK_API_URL', clerkAPIUrl);
  const middlewareFile = `import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

    const isProtectedRoute = createRouteMatcher(['/organizations(.*)'])

    export const middleware = (req, evt) => {
      const orgSyncOptions = req.headers.get("x-organization-sync-options")
      return clerkMiddleware(async (auth, req) => {
        if (isProtectedRoute(req) && !(await auth()).userId) {
          (await auth()).redirectToSignIn()
        }
      }, {
        publishableKey: req.headers.get("x-publishable-key"),
        secretKey: req.headers.get("x-secret-key"),
        proxyUrl: req.headers.get("x-proxy-url"),
        domain: req.headers.get("x-domain"),
        isSatellite: req.headers.get('x-satellite') === 'true',
        signInUrl: req.headers.get("x-sign-in-url"),

        // Critical
        organizationSyncOptions: JSON.parse(req.headers.get("x-organization-sync-options")),

      })(req, evt)
    };
    export const config = {
      matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
    };
    `;

  const app = await appConfigs.next.appRouter
    .clone()
    .addFile('src/middleware.ts', () => middlewareFile)
    .commit();

  await app.setup();
  await app.withEnv(env);
  await app.dev();
  return app;
};
