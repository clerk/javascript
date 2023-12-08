// @ts-ignore ignore types
import * as http from 'http';
import { generateConfig, getJwksFromSecretKey } from './handshakeTestConfigs';

const urlArg = process.argv.find(x => x.startsWith('--url='))?.replace('--url=', '');
if (!urlArg) {
  throw new Error('Must pass URL like: --url=http://localhost:4011');
}

// Strip trailing slash
const url = new URL(urlArg).origin;
const devBrowserCookie = '__clerk_db_jwt=needstobeset;';
const devBrowserQuery = '&__clerk_db_jwt=needstobeset';

//create a server object:
const server = http.createServer(function (req, res) {
  const sk = req.headers.authorization?.replace('Bearer ', '');
  if (!sk) {
    console.log('No SK to', req.url, req.headers);
  }

  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(getJwksFromSecretKey(sk))); //write a response to the client
  res.end(); //end the response
});

beforeAll(() => {
  console.log(
    'Starting jwks service on 127.0.0.1:4199.\nMake sure the framework has CLERK_API_URL set to http://localhost:4199',
  );
  server.listen(4199);

  console.log('Running tests against ', url);
});

afterAll(() => {
  server.close();
  setImmediate(function () {
    server.emit('close');
  });
});

test('Test standard signed-in - dev', async () => {
  const config = generateConfig({
    mode: 'test',
  });
  const { token, claims } = config.generateToken({ state: 'active' });
  const clientUat = claims.iat;
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `${devBrowserCookie} __client_uat=${clientUat}; __session=${token}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
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
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `${devBrowserCookie} __client_uat=${clientUat};`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      Authorization: `Bearer ${token}`,
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
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `__client_uat=${clientUat}; __session=${token}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
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
  const res = await fetch(url + '/', {
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
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `${devBrowserCookie} __client_uat=${clientUat}; __session=${token}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe(
    `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(`${url}/`)}${devBrowserQuery}`,
  );
});

test('Test expired session token - prod', async () => {
  const config = generateConfig({
    mode: 'live',
  });
  const { token, claims } = config.generateToken({ state: 'expired' });
  const clientUat = claims.iat;
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `__client_uat=${clientUat}; __session=${token}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe(
    `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(`${url}/`)}`,
  );
});

test('Test expired session token - authorization header - prod', async () => {
  const config = generateConfig({
    mode: 'live',
  });
  const { token, claims } = config.generateToken({ state: 'expired' });
  const clientUat = claims.iat;
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `__client_uat=${clientUat};`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      Authorization: `Bearer ${token}`,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe(
    `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(`${url}/`)}`,
  );
});

test('Test early session token - dev', async () => {
  const config = generateConfig({
    mode: 'test',
  });
  const { token, claims } = config.generateToken({ state: 'early' });
  const clientUat = claims.iat;
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `${devBrowserCookie} __client_uat=${clientUat}; __session=${token}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe(
    `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(`${url}/`)}${devBrowserQuery}`,
  );
});

test('Test early session token - authorization header - dev', async () => {
  const config = generateConfig({
    mode: 'test',
  });
  const { token, claims } = config.generateToken({ state: 'early' });
  const clientUat = claims.iat;
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `${devBrowserCookie} __client_uat=${clientUat};`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      Authorization: `Bearer ${token}`,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe(
    `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(`${url}/`)}${devBrowserQuery}`,
  );
});

test('Test proxyUrl - dev', async () => {
  const config = generateConfig({
    mode: 'test',
  });
  const { token, claims } = config.generateToken({ state: 'expired' });
  const clientUat = claims.iat;
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `${devBrowserCookie} __client_uat=${clientUat}; __session=${token}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      'X-Proxy-Url': 'https://example.com/clerk',
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe(
    `https://example.com/clerk/v1/client/handshake?redirect_url=${encodeURIComponent(`${url}/`)}${devBrowserQuery}`,
  );
});

test('Test proxyUrl - prod', async () => {
  const config = generateConfig({
    mode: 'live',
  });
  const { token, claims } = config.generateToken({ state: 'expired' });
  const clientUat = claims.iat;
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `__client_uat=${clientUat}; __session=${token}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      'X-Proxy-Url': 'https://example.com/clerk',
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe(
    `https://example.com/clerk/v1/client/handshake?redirect_url=${encodeURIComponent(`${url}/`)}`,
  );
});

test('Test domain - dev', async () => {
  const config = generateConfig({
    mode: 'test',
  });
  const { token, claims } = config.generateToken({ state: 'expired' });
  const clientUat = claims.iat;
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `${devBrowserCookie} __client_uat=${clientUat}; __session=${token}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      'X-Domain': 'localhost:3000',
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe(
    `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(`${url}/`)}${devBrowserQuery}`,
  );
});

test('Test domain - prod', async () => {
  const config = generateConfig({
    mode: 'live',
  });
  const { token, claims } = config.generateToken({ state: 'expired' });
  const clientUat = claims.iat;
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `__client_uat=${clientUat}; __session=${token}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      'X-Domain': 'example.com',
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe(
    `https://clerk.example.com/v1/client/handshake?redirect_url=${encodeURIComponent(`${url}/`)}`,
  );
});

test('Test missing session token, positive uat - dev', async () => {
  const config = generateConfig({
    mode: 'test',
  });
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `${devBrowserCookie} __client_uat=1`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe(
    `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(`${url}/`)}${devBrowserQuery}`,
  );
});

test('Test missing session token, positive uat - prod', async () => {
  const config = generateConfig({
    mode: 'live',
  });
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `__client_uat=1`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe(
    `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(`${url}/`)}`,
  );
});

test('Test missing session token, 0 uat (indicating signed out) - dev', async () => {
  const config = generateConfig({
    mode: 'test',
  });
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `${devBrowserCookie} __client_uat=0`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(200);
});

test('Test missing session token, 0 uat (indicating signed out) - prod', async () => {
  const config = generateConfig({
    mode: 'live',
  });
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `__client_uat=0`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(200);
});

test('Test missing session token, missing uat (indicating signed out) - dev', async () => {
  const config = generateConfig({
    mode: 'test',
  });
  const res = await fetch(url + '/', {
    headers: new Headers({
      Cookie: `${devBrowserCookie}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(200);
});

test('Test missing session token, missing uat (indicating signed out) - prod', async () => {
  const config = generateConfig({
    mode: 'live',
  });
  const res = await fetch(url + '/', {
    headers: new Headers({
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(200);
});

test('Test signed out satellite no sec-fetch-dest=document - prod', async () => {
  const config = generateConfig({
    mode: 'live',
  });
  const res = await fetch(url + '/', {
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
  const res = await fetch(url + '/', {
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
    `https://clerk.example.com/v1/client/handshake?redirect_url=${encodeURIComponent(url + '/')}`,
  );
});

test('Test signed out satellite - dev', async () => {
  const config = generateConfig({
    mode: 'test',
  });
  const res = await fetch(url + '/', {
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
  const res = await fetch(url + '/', {
    headers: new Headers({
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(200);
});

test('Test redirect url - path and qs - dev', async () => {
  const config = generateConfig({
    mode: 'test',
  });
  const { token, claims } = config.generateToken({ state: 'expired' });
  const clientUat = claims.iat;
  const res = await fetch(url + '/hello?foo=bar', {
    headers: new Headers({
      Cookie: `${devBrowserCookie} __client_uat=${clientUat}; __session=${token}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe(
    `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(
      `${url}/`,
    )}hello%3Ffoo%3Dbar${devBrowserQuery}`,
  );
});

test('Test redirect url - path and qs - prod', async () => {
  const config = generateConfig({
    mode: 'live',
  });
  const { token, claims } = config.generateToken({ state: 'expired' });
  const clientUat = claims.iat;
  const res = await fetch(url + '/hello?foo=bar', {
    headers: new Headers({
      Cookie: `__client_uat=${clientUat}; __session=${token}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe(
    `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(`${url}/`)}hello%3Ffoo%3Dbar`,
  );
});

test('Test redirect url - proxy - dev', async () => {
  const config = generateConfig({
    mode: 'test',
  });
  const { token, claims } = config.generateToken({ state: 'expired' });
  const clientUat = claims.iat;
  const res = await fetch(url + '/hello?foo=bar', {
    headers: new Headers({
      Cookie: `${devBrowserCookie} __client_uat=${clientUat}; __session=${token}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      'X-Forwarded-Host': 'example.com',
      'X-Forwarded-Proto': 'https',
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
  const res = await fetch(url + '/hello?foo=bar', {
    headers: new Headers({
      Cookie: `__client_uat=${clientUat}; __session=${token}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      'X-Forwarded-Host': 'example.com',
      'X-Forwarded-Proto': 'https',
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
  const res = await fetch(url + '/hello?foo=bar', {
    headers: new Headers({
      Cookie: `${devBrowserCookie} __client_uat=${clientUat}; __session=${token}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      'X-Forwarded-Host': 'example.com:3213',
      'X-Forwarded-Proto': 'https',
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
  const res = await fetch(url + '/hello?foo=bar', {
    headers: new Headers({
      Cookie: `__client_uat=${clientUat}; __session=${token}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      'X-Forwarded-Host': 'example.com:3213',
      'X-Forwarded-Proto': 'https',
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
  const handshake = btoa(JSON.stringify(cookiesToSet));
  const res = await fetch(url + '/?__clerk_handshake=' + handshake, {
    headers: new Headers({
      Cookie: `${devBrowserCookie}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
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
  const handshake = btoa(JSON.stringify(cookiesToSet));
  const res = await fetch(url + '/?__clerk_handshake=' + handshake, {
    headers: new Headers({
      Cookie: `${devBrowserCookie}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
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
  const handshake = btoa(JSON.stringify(cookiesToSet));
  const res = await fetch(url + '/?__clerk_handshake=' + handshake, {
    headers: new Headers({
      Cookie: `${devBrowserCookie}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
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
  const handshake = btoa(JSON.stringify(cookiesToSet));
  const res = await fetch(url + '/?__clerk_handshake=' + handshake, {
    headers: new Headers({
      Cookie: `${devBrowserCookie}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
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
  const handshake = btoa(JSON.stringify(cookiesToSet));
  const res = await fetch(url + '/?__clerk_handshake=' + handshake, {
    headers: new Headers({
      Cookie: `${devBrowserCookie}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
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
  const res = await fetch(url + '/?__clerk_db_jwt=asdf', {
    headers: new Headers({
      Cookie: `${devBrowserCookie}`,
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe(
    `https://${config.pkHost}/v1/client/handshake?redirect_url=${encodeURIComponent(`${url}/`)}&__clerk_db_jwt=asdf`,
  );
});

test('Handshake result - prod - nominal', async () => {
  const config = generateConfig({
    mode: 'live',
  });
  const { token } = config.generateToken({ state: 'active' });
  const cookiesToSet = [`__session=${token};path=/`, 'foo=bar;path=/;domain=example.com'];
  const handshake = btoa(JSON.stringify(cookiesToSet));
  const res = await fetch(url + '/', {
    headers: new Headers({
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      Cookie: `__clerk_handshake=${handshake}`,
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
  const handshake = btoa(JSON.stringify(cookiesToSet));
  const res = await fetch(url + '/', {
    headers: new Headers({
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      Cookie: `__clerk_handshake=${handshake}`,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(500);
});

test('Handshake result - prod - skew - clock ahead', async () => {
  const config = generateConfig({
    mode: 'live',
  });
  const { token } = config.generateToken({ state: 'expired' });
  const cookiesToSet = [`__session=${token};path=/`, 'foo=bar;path=/;domain=example.com'];
  const handshake = btoa(JSON.stringify(cookiesToSet));
  const res = await fetch(url + '/', {
    headers: new Headers({
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      Cookie: `__clerk_handshake=${handshake}`,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(500);
});

test('Handshake result - prod - mismatched keys', async () => {
  const config = generateConfig({
    mode: 'live',
    matchedKeys: false,
  });
  const { token } = config.generateToken({ state: 'active' });
  const cookiesToSet = [`__session=${token};path=/`, 'foo=bar;path=/;domain=example.com'];
  const handshake = btoa(JSON.stringify(cookiesToSet));
  const res = await fetch(url + '/', {
    headers: new Headers({
      'X-Publishable-Key': config.pk,
      'X-Secret-Key': config.sk,
      Cookie: `__clerk_handshake=${handshake}`,
    }),
    redirect: 'manual',
  });
  expect(res.status).toBe(500);
});
