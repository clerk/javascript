import * as http from 'node:http';

import { expect, test } from '@playwright/test';

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

  test('Test standard signed-in - dev', async () => {
    const config = generateConfig({
      mode: 'test',
    });
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

  test('Test standard signed-in - authorization header - dev', async () => {
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

  test('Test standard signed-in - prod', async () => {
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

  test('Test standard signed-in - authorization header - prod', async () => {
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

  test('Test expired session token - dev', async () => {
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
      )}${devBrowserQuery}`,
    );
  });

  test('Test expired session token - prod', async () => {
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
      `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(`${app.serverUrl}/`)}`,
    );
  });

  test('Test expired session token - authorization header - prod', async () => {
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
      `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(`${app.serverUrl}/`)}`,
    );
  });

  test('Test early session token - dev', async () => {
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
      )}${devBrowserQuery}`,
    );
  });

  test('Test early session token - authorization header - dev', async () => {
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
      )}${devBrowserQuery}`,
    );
  });

  test('Test proxyUrl - dev', async () => {
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
      )}${devBrowserQuery}`,
    );
  });

  test('Test proxyUrl - prod', async () => {
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
      `https://example.com/clerk/v1/client/handshake?redirect_url=${encodeURIComponent(`${app.serverUrl}/`)}`,
    );
  });

  test('Test domain - dev', async () => {
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
      )}${devBrowserQuery}`,
    );
  });

  test('Test domain - prod', async () => {
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
      `https://clerk.example.com/v1/client/handshake?redirect_url=${encodeURIComponent(`${app.serverUrl}/`)}`,
    );
  });

  test('Test missing session token, positive uat - dev', async () => {
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
      )}${devBrowserQuery}`,
    );
  });

  test('Test missing session token, positive uat - prod', async () => {
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
      `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(`${app.serverUrl}/`)}`,
    );
  });

  test('Test missing session token, 0 uat (indicating signed out) - dev', async () => {
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

  test('Test missing session token, 0 uat (indicating signed out) - prod', async () => {
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

  test('Test missing session token, missing uat (indicating signed out) - dev', async () => {
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

  test('Test missing session token, missing uat (indicating signed out) - prod', async () => {
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

  test('Test signed out satellite no sec-fetch-dest=document - prod', async () => {
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

  test('Test signed out satellite with sec-fetch-dest=document - prod', async () => {
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
      `https://clerk.example.com/v1/client/handshake?redirect_url=${encodeURIComponent(app.serverUrl + '/')}`,
    );
  });

  test('Test signed out satellite - dev', async () => {
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

  test('Test missing session token, missing uat (indicating signed out), missing devbrowser - dev', async () => {
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
      `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(`${app.serverUrl}/`)}`,
    );
  });

  test('Test redirect url - path and qs - dev', async () => {
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
      )}hello%3Ffoo%3Dbar${devBrowserQuery}`,
    );
  });

  test('Test redirect url - path and qs - prod', async () => {
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
      )}hello%3Ffoo%3Dbar`,
    );
  });

  test('Test redirect url - proxy - dev', async () => {
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
      `https://${config.pkHost}/v1/client/handshake?redirect_url=https%3A%2F%2Fexample.com%2Fhello%3Ffoo%3Dbar${devBrowserQuery}`,
    );
  });

  test('Test redirect url - proxy - prod', async () => {
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
      `https://${config.pkHost}/v1/client/handshake?redirect_url=https%3A%2F%2Fexample.com%2Fhello%3Ffoo%3Dbar`,
    );
  });

  test('Test redirect url - proxy with port - dev', async () => {
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
      `https://${config.pkHost}/v1/client/handshake?redirect_url=https%3A%2F%2Fexample.com%3A3213%2Fhello%3Ffoo%3Dbar${devBrowserQuery}`,
    );
  });

  test('Test redirect url - proxy with port - prod', async () => {
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
      `https://${config.pkHost}/v1/client/handshake?redirect_url=https%3A%2F%2Fexample.com%3A3213%2Fhello%3Ffoo%3Dbar`,
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
      )}&__clerk_db_jwt=asdf`,
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
