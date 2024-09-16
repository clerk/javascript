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
  const devBrowserQuery = '&__clerk_db_jwt=needstobeset';

  test.beforeAll('setup local Clerk API mock', async () => {
    const env = appConfigs.envs.withEmailCodes
      .clone()
      .setEnvVariable('private', 'CLERK_API_URL', `http://localhost:${PORT}`);

    // Start the jwks server
    await new Promise<void>(resolve => jwksServer.listen(4199, resolve));

    app = await appConfigs.next.appRouter
      .clone()
      .addFile(
        'src/middleware.ts',
        () => `import { authMiddleware } from '@clerk/nextjs/server';

    // Set the paths that don't require the user to be signed in
    const publicPaths = ['/', /^(\\/(sign-in|sign-up|app-dir|custom)\\/*).*$/];

    export const middleware = (req, evt) => {
      return authMiddleware({
        publicRoutes: publicPaths,
        publishableKey: req.headers.get("x-publishable-key"),
        secretKey: req.headers.get("x-secret-key"),
        proxyUrl: req.headers.get("x-proxy-url"),
        domain: req.headers.get("x-domain"),
        isSatellite: req.headers.get('x-satellite') === 'true',
        signInUrl: req.headers.get("x-sign-in-url"),
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
    expect(res.headers.get('location')).toBe(
      `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(
        `${app.serverUrl}/`,
      )}&suffixed_cookies=false${devBrowserQuery}`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(
        `${app.serverUrl}/`,
      )}&suffixed_cookies=false`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(
        `${app.serverUrl}/`,
      )}&suffixed_cookies=false`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(
        `${app.serverUrl}/`,
      )}&suffixed_cookies=false${devBrowserQuery}`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(
        `${app.serverUrl}/`,
      )}&suffixed_cookies=false${devBrowserQuery}`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://example.com/clerk/v1/client/handshake?redirect_url=${encodeURIComponent(
        `${app.serverUrl}/`,
      )}&suffixed_cookies=false${devBrowserQuery}`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://example.com/clerk/v1/client/handshake?redirect_url=${encodeURIComponent(
        `${app.serverUrl}/`,
      )}&suffixed_cookies=false`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(
        `${app.serverUrl}/`,
      )}&suffixed_cookies=false${devBrowserQuery}`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://clerk.example.com/v1/client/handshake?redirect_url=${encodeURIComponent(
        `${app.serverUrl}/`,
      )}&suffixed_cookies=false`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(
        `${app.serverUrl}/`,
      )}&suffixed_cookies=false${devBrowserQuery}`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(
        `${app.serverUrl}/`,
      )}&suffixed_cookies=false`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://clerk.example.com/v1/client/handshake?redirect_url=${encodeURIComponent(
        app.serverUrl + '/',
      )}&suffixed_cookies=false`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(
        `${app.serverUrl}/`,
      )}&suffixed_cookies=false`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(
        `${app.serverUrl}/`,
      )}hello%3Ffoo%3Dbar&suffixed_cookies=false${devBrowserQuery}`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(
        `${app.serverUrl}/`,
      )}hello%3Ffoo%3Dbar&suffixed_cookies=false`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://${config.pkHost}/v1/client/handshake?redirect_url=https%3A%2F%2Fexample.com%2Fhello%3Ffoo%3Dbar&suffixed_cookies=false${devBrowserQuery}`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://${config.pkHost}/v1/client/handshake?redirect_url=https%3A%2F%2Fexample.com%2Fhello%3Ffoo%3Dbar&suffixed_cookies=false`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://${config.pkHost}/v1/client/handshake?redirect_url=https%3A%2F%2Fexample.com%3A3213%2Fhello%3Ffoo%3Dbar&suffixed_cookies=false${devBrowserQuery}`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://${config.pkHost}/v1/client/handshake?redirect_url=https%3A%2F%2Fexample.com%3A3213%2Fhello%3Ffoo%3Dbar&suffixed_cookies=false`,
    );
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
    expect(res.headers.get('location')).toBe(
      `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(
        `${app.serverUrl}/`,
      )}&suffixed_cookies=false&__clerk_db_jwt=asdf`,
    );
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

// TODO(izaak): revert: test.describe('Client handshake with organization activation @nextjs', () => {
test.describe('Client handshake with organization activation', () => {
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

  test.beforeAll('setup local jwks server', async () => {
    // Start the jwks server
    await new Promise<void>(resolve => jwksServer.listen(0, resolve));
  });

  test.afterAll('setup local Clerk API mock', async () => {
    return new Promise<void>(resolve => jwksServer.close(() => resolve()));
  });

  const start = async (orgSyncOptions: OrganizationSyncOptions): Promise<Application> => {
    const env = appConfigs.envs.withEmailCodes
      .clone()
      .setEnvVariable('private', 'CLERK_API_URL', `http://localhost:${jwksServer.address().port}`);

    const middlewareFile = `import { authMiddleware } from '@clerk/nextjs/server';
    // Set the paths that don't require the user to be signed in
    const publicPaths = ['/', /^(\\/(sign-in|sign-up|app-dir|custom)\\/*).*$/];
    export const middleware = (req, evt) => {
      return authMiddleware({
        publicRoutes: publicPaths,
        publishableKey: req.headers.get("x-publishable-key"),
        secretKey: req.headers.get("x-secret-key"),
        proxyUrl: req.headers.get("x-proxy-url"),
        domain: req.headers.get("x-domain"),
        isSatellite: req.headers.get('x-satellite') === 'true',
        signInUrl: req.headers.get("x-sign-in-url"),

        // Critical
        organizationSync: ${JSON.stringify(orgSyncOptions)}

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

  const end = async (app: Application): Promise<void> => {
    await app.teardown();
  };

  type testCase = {
    name: string;
    when: when;
    then: then;
  };
  type when = {
    // With this initial state...
    initialAuthState: 'active' | 'expired' | 'early';
    initialSessionClaims: Map<string, string>;

    // When the customer app specifies these orgSyncOptions to middleware...
    orgSyncOptions: OrganizationSyncOptions;

    // And a request arrives to the app at this path...
    appRequestPath: string;
  };

  type then = {
    // A handshake should (or should not) occur:
    expectStatus: number;

    // The middleware should redirect to fapi with this query param value:
    fapiOrganizationIdParamValue: string | null;
  };

  const cookieAuthCases: testCase[] = [
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
      },
      then: {
        expectStatus: 307,
        fapiOrganizationIdParamValue: 'org_a',
      },
    },

    // ---------------- Existing session active org tests ----------------
    {
      name: 'Active session, org A active in session, but org B is requested by ID => attempts to activate org B',
      when: {
        initialAuthState: 'active',
        initialSessionClaims: new Map<string, string>([['org_id', 'org_a']]),
        orgSyncOptions: {
          organizationPatterns: ['/organizations-by-id/:id', '/organizations-by-id/:id/*splat'],
        },
        appRequestPath: '/organizations-by-id/org_b',
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
            '/organizations-by-id/:id/*splat',
            '/organizations-by-slug/:slug',
            '/organizations-by-slug/:id/*splat',
          ],
        },
        appRequestPath: '/organizations-by-slug/bcorp',
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
            '/organizations-by-slug/:id/*splat',
            '/organizations-by-id/:id',
            '/organizations-by-id/:id/*splat',
          ],
        },
        appRequestPath: '/organizations-by-slug/bcorp/settings',
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
          organizationPatterns: ['/organizations-by-id/:id', '/organizations-by-id/:id/*splat'],
        },
        appRequestPath: '/organizations-by-id/org_b/',
      },
      then: {
        expectStatus: 308, // Handshake never 308's - this points to `/organizations-by-id/org_b` (no trailing slash)
        fapiOrganizationIdParamValue: null,
      },
    },

    // ---------------- Personal workspace tests ----------------
    {
      name: 'Active session, org a in session, but *the personal workspace* is requested => attempts to activate PWS',
      when: {
        initialAuthState: 'active',
        initialSessionClaims: new Map<string, string>([['org_id', 'org_a']]),
        orgSyncOptions: {
          organizationPatterns: [
            '/organizations-by-id/:id',
            '/organizations-by-id/:id/*splat',
            '/organizations-by-slug/:slug',
            '/organizations-by-slug/:id/*splat',
          ],
          personalWorkspacePatterns: ['/personal-workspace', '/personal-workspace/*splat'],
        },
        appRequestPath: '/personal-workspace',
      },
      then: {
        expectStatus: 307,
        fapiOrganizationIdParamValue: '', // <-- Empty string indicates personal workspace
      },
    },

    // ---------------- No activation required tests ----------------
    {
      name: 'Active session, nothing session, and the personal workspace is requested => nothing to activate!',
      when: {
        initialAuthState: 'active',
        initialSessionClaims: new Map<string, string>([
          // Intentionally empty
        ]),
        orgSyncOptions: {
          organizationPatterns: ['/organizations-by-slug/:slug', '/organizations-by-slug/:id/*splat'],
          personalWorkspacePatterns: ['/personal-workspace', '/personal-workspace/*splat'],
        },
        appRequestPath: '/personal-workspace',
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
          organizationPatterns: ['/organizations-by-id/:id', '/organizations-by-id/:id/*splat'],
          personalWorkspacePatterns: ['/personal-workspace', '/personal-workspace/*splat'],
        },
        appRequestPath: '/organizations-by-id/org_a',
      },
      then: {
        expectStatus: 200,
        fapiOrganizationIdParamValue: null,
      },
    },
    {
      // NOTE(izaak): Would we prefer 500ing in this case?
      name: 'Invalid config => ignore it and return 200',
      when: {
        initialAuthState: 'active',
        initialSessionClaims: new Map<string, string>([['org_id', 'org_a']]),
        orgSyncOptions: {
          organizationPatterns: ['i am not valid config'],
        },
        appRequestPath: '/organizations-by-id/org_a',
      },
      then: {
        expectStatus: 200,
        fapiOrganizationIdParamValue: null,
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
      },
      then: {
        expectStatus: 200,
        fapiOrganizationIdParamValue: null,
      },
    },
  ];

  for (const testCase of cookieAuthCases) {
    ['Cookie', 'Authorization'].forEach(authHeader => {
      test(`${authHeader} auth: ${testCase.name}`, async () => {
        const app = await start(testCase.when.orgSyncOptions);

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
          'Sec-Fetch-Dest': 'document',
        });
        switch (authHeader) {
          case 'Cookie':
            headers.set('Cookie', `${devBrowserCookie} __client_uat=${claims.iat}; __session=${token}`);
            break;
          case 'Authorization':
            headers.set('Authorization', `Bearer ${token}`);
            break;
        }

        const res = await fetch(app.serverUrl + testCase.when.appRequestPath, {
          headers: headers,
          redirect: 'manual',
        });

        expect(res.status).toBe(testCase.then.expectStatus);
        const redirectSearchParams = new URLSearchParams(res.headers.get('location'));
        expect(redirectSearchParams.get('organization_id')).toBe(testCase.then.fapiOrganizationIdParamValue);

        await end(app);
      });
    });
  }
});

test.describe('Client handshake with an organization activation avoids infinite loops @nextjs', () => {
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

  // define app as an application
  let thisApp: Application;

  test.beforeAll('setup local jwks server', async () => {
    // Start the jwks server
    await new Promise<void>(resolve => jwksServer.listen(0, resolve));

    thisApp = await start({
      organizationPatterns: ['/organizations-by-id/:id', '/organizations-by-id/:id/*splat'],
      personalWorkspacePatterns: ['/personal-workspace', '/personal-workspace/*splat'],
    });
  });

  test.afterAll('setup local Clerk API mock', async () => {
    await end(thisApp);
    return new Promise<void>(resolve => jwksServer.close(() => resolve()));
  });

  const start = async (orgSyncOptions: OrganizationSyncOptions): Promise<Application> => {
    const env = appConfigs.envs.withEmailCodes
      .clone()
      .setEnvVariable('private', 'CLERK_API_URL', `http://localhost:${jwksServer.address().port}`);

    const middlewareFile = `import { authMiddleware } from '@clerk/nextjs/server';
    // Set the paths that don't require the user to be signed in
    const publicPaths = ['/', /^(\\/(sign-in|sign-up|app-dir|custom)\\/*).*$/];
    export const middleware = (req, evt) => {
      return authMiddleware({
        publicRoutes: publicPaths,
        publishableKey: req.headers.get("x-publishable-key"),
        secretKey: req.headers.get("x-secret-key"),
        proxyUrl: req.headers.get("x-proxy-url"),
        domain: req.headers.get("x-domain"),
        isSatellite: req.headers.get('x-satellite') === 'true',
        signInUrl: req.headers.get("x-sign-in-url"),

        // Critical
        organizationSync: ${JSON.stringify(orgSyncOptions)}

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

  const end = async (app: Application): Promise<void> => {
    await app.teardown();
  };

  // -------------- Test begin ------------

  const config = generateConfig({
    mode: 'test',
  });

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
    });

    // Critical cookie: __clerk_redirect_count
    headers.set(
      'Cookie',
      `${devBrowserCookie} __client_uat=${claims.iat}; __session=${token}; __clerk_redirect_count=1`,
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
