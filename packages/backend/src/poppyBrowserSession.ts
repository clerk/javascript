import { isClerkAPIResponseError } from '@clerk/shared/error';
import { parse, serialize } from 'cookie';

import type { ClerkClient } from './index';

const joinCookie = '__Host-poppy_join';
const sessionCookie = '__Host-poppy_session';
const completionCookie = '__Host-poppy_complete';
const noStore = { 'Cache-Control': 'no-store' };
const browserSignInScope = 'poppy:browser-sign-in';
const htmlHeaders = {
  ...noStore,
  'Content-Type': 'text/html; charset=utf-8',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'none'",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Referrer-Policy': 'no-referrer',
};
const cookieOptions = { path: '/', httpOnly: true, secure: true, sameSite: 'strict' } as const;
const protocolErrors = new Set(['invalid_request', 'invalid_session', 'session_ended', 'version_unsupported']);

type Options = {
  clerkClient: Pick<ClerkClient, 'poppy'> & Partial<Pick<ClerkClient, 'authenticateRequest'>>;
  browserSessionEndpoint: string;
  redirectTo?: string;
};

function errorPage(status: number, retryAfter?: number) {
  const headers = new Headers(htmlHeaders);
  if (retryAfter !== undefined) {
    headers.set('Retry-After', String(retryAfter));
  }
  return new Response('<!doctype html><title>Connection failed</title><p>Start the connection again.</p>', {
    status,
    headers,
  });
}

async function readBody(request: Request, contentType: string, limit = 4096) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== contentType || !request.body) {
    return null;
  }
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let result = '';
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return result + decoder.decode();
      }
      length += value.byteLength;
      if (length > limit) {
        void reader.cancel().catch(() => undefined);
        return null;
      }
      result += decoder.decode(value, { stream: true });
    }
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export function parsePoppyCookie(value: string | undefined) {
  if (!value) {
    return null;
  }
  const [encodedEndpoint, token, extra] = value.split('|');
  if (extra !== undefined || !token || !/^[A-Za-z0-9]{40}$/.test(token)) {
    return null;
  }
  try {
    const endpoint = new URL(decodeURIComponent(encodedEndpoint));
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
      return null;
    }
    return { endpoint: endpoint.href, token };
  } catch {
    return null;
  }
}

export function createPoppyBrowserSessionHandler(options: Options) {
  const { poppy } = options.clerkClient;
  const endpoint = new URL(options.browserSessionEndpoint);
  if (
    endpoint.protocol !== 'https:' ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash ||
    !/^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(endpoint.pathname) ||
    endpoint.href !== options.browserSessionEndpoint
  ) {
    throw new Error('Expected a canonical HTTPS browser Session endpoint.');
  }
  const redirect = new URL(options.redirectTo ?? '/', endpoint);
  if (redirect.origin !== endpoint.origin || redirect.username || redirect.password) {
    throw new Error('The browser Session redirect must stay on the Company origin.');
  }
  const authorizePath = endpoint.pathname + '/authorize';
  const matches = (request: Request, path: string) => {
    const url = new URL(request.url);
    return url.origin === endpoint.origin && url.pathname === path;
  };

  return {
    async get(request: Request) {
      if (!matches(request, endpoint.pathname)) {
        return errorPage(400);
      }
      try {
        const { code, browser_join_secret, expires_in, cookie_suffix } = await poppy.issueBrowserCode(endpoint.href);
        if (!/^bc_[A-Za-z0-9]{40}$/.test(code)) {
          return errorPage(502);
        }
        return new Response(
          '<!doctype html><title>Connect this browser</title><h1>Connect this browser</h1>' +
            `<form method="post" action="${endpoint.pathname}"><input type="hidden" name="code" value="${code}">` +
            '<button>Continue</button></form>',
          {
            headers: {
              ...htmlHeaders,
              'Set-Cookie': serialize(joinCookie, `${browser_join_secret}.${cookie_suffix}`, {
                ...cookieOptions,
                maxAge: expires_in,
              }),
            },
          },
        );
      } catch (error) {
        if (isClerkAPIResponseError(error) && error.status === 429) {
          return errorPage(429, error.retryAfter);
        }
        return errorPage(isClerkAPIResponseError(error) && error.status === 404 ? 404 : 502);
      }
    },

    async authorize(request: Request) {
      if (!matches(request, authorizePath)) {
        return Response.json({ error: 'invalid_request' }, { status: 400, headers: noStore });
      }
      const poppySessionJwt = request.headers.get('poppy-session');
      if (!poppySessionJwt) {
        return Response.json({ error: 'invalid_session' }, { status: 400, headers: noStore });
      }
      const version = request.headers.get('poppy-version');
      if (version !== '0.4') {
        return Response.json({ error: 'version_unsupported' }, { status: 400, headers: noStore });
      }
      const authorization = request.headers.get('authorization');
      const accessToken = authorization?.match(/^Bearer ([A-Za-z0-9._~+/=-]+)$/i)?.[1];
      if (authorization !== null && !accessToken) {
        return new Response(null, {
          status: 401,
          headers: { ...noStore, 'WWW-Authenticate': 'Bearer error="invalid_token"' },
        });
      }
      const body = await readBody(request, 'application/json');
      let code = '';
      if (body !== null) {
        try {
          const value: unknown = JSON.parse(body)?.code;
          if (typeof value === 'string') {
            code = value;
          }
        } catch {
          code = '';
        }
      }
      try {
        await poppy.authorizeBrowserCode(endpoint.href, code, version, poppySessionJwt, accessToken);
        return new Response(null, { status: 204, headers: noStore });
      } catch (error) {
        if (isClerkAPIResponseError(error)) {
          const code = error.errors[0]?.code;
          if (code && error.status === 400 && protocolErrors.has(code)) {
            return Response.json({ error: code }, { status: 400, headers: noStore });
          }
          if (code === 'invalid_token' && error.status === 401) {
            return new Response(null, {
              status: 401,
              headers: { ...noStore, 'WWW-Authenticate': 'Bearer error="invalid_token"' },
            });
          }
          if (code === 'insufficient_scope' && error.status === 403) {
            return new Response(null, {
              status: 403,
              headers: {
                ...noStore,
                'WWW-Authenticate': `Bearer error="insufficient_scope", scope="${browserSignInScope}"`,
              },
            });
          }
          if (error.status === 429) {
            const headers = new Headers(noStore);
            if (error.retryAfter !== undefined) {
              headers.set('Retry-After', String(error.retryAfter));
            }
            return new Response(null, { status: 429, headers });
          }
          if (error.status === 404) {
            return new Response(null, { status: 404, headers: noStore });
          }
        }
        return new Response(null, { status: 502, headers: noStore });
      }
    },

    async post(request: Request) {
      if (!matches(request, endpoint.pathname)) {
        return errorPage(400);
      }
      const body = await readBody(request, 'application/x-www-form-urlencoded');
      const codes = body === null ? [] : new URLSearchParams(body).getAll('code');
      if (codes.length !== 1 || !codes[0]) {
        return errorPage(400);
      }
      const cookies = parse(request.headers.get('cookie') ?? '');
      const [browserSecret, suffix] = (cookies[joinCookie] ?? '').split('.');
      try {
        const { browser_token, expires_in, completion_url, cookie_suffix } = await poppy.redeemBrowserCode(
          endpoint.href,
          codes[0],
          browserSecret ?? '',
          parsePoppyCookie(cookies[sessionCookie])?.token,
          (suffix && /^[A-Za-z0-9]+$/.test(suffix) ? cookies[`__session_${suffix}`] : undefined) ?? cookies.__session,
        );
        const headers = new Headers({
          ...noStore,
          Location: completion_url ? endpoint.href + '/complete' : redirect.href,
        });
        if (completion_url) {
          if (completion_url !== poppy.browserCompletionUrl || !cookie_suffix) {
            return errorPage(502);
          }
          for (const name of [
            '__session',
            `__session_${cookie_suffix}`,
            `__refresh_${cookie_suffix}`,
            '__client_uat',
            `__client_uat_${cookie_suffix}`,
          ]) {
            headers.append('Set-Cookie', serialize(name, '', { path: '/', secure: true, sameSite: 'lax', maxAge: 0 }));
          }
          headers.append(
            'Set-Cookie',
            serialize(completionCookie, browser_token, {
              ...cookieOptions,
              sameSite: 'lax',
              path: '/',
              maxAge: 60,
            }),
          );
        }
        headers.append(
          'Set-Cookie',
          serialize(sessionCookie, `${encodeURIComponent(endpoint.href)}|${browser_token}`, {
            ...cookieOptions,
            maxAge: expires_in,
          }),
        );
        headers.append('Set-Cookie', serialize(joinCookie, '', { ...cookieOptions, maxAge: 0 }));
        return new Response(null, { status: 303, headers });
      } catch (error) {
        const status = isClerkAPIResponseError(error) ? error.status : undefined;
        return errorPage(status === 400 || status === 404 ? status : 502);
      }
    },

    async complete(request: Request) {
      if (request.method !== 'GET' || !matches(request, endpoint.pathname + '/complete')) {
        return errorPage(400);
      }
      const browserToken = parse(request.headers.get('cookie') ?? '')[completionCookie];
      if (!browserToken || !/^[A-Za-z0-9]{40}$/.test(browserToken)) {
        return errorPage(400);
      }
      try {
        const current = await poppy.readBrowserSession(endpoint.href, browserToken);
        if (!current.account) {
          return errorPage(400);
        }
        const { handshake } = await poppy.takeBrowserHandshake(endpoint.href, browserToken);
        if (handshake) {
          if (!options.clerkClient.authenticateRequest) {
            return errorPage(502);
          }
          const headers = new Headers(request.headers);
          headers.delete('authorization');
          headers.set('cookie', `__clerk_handshake=${handshake}`);
          const state = await options.clerkClient.authenticateRequest(new Request(request.url, { headers }));
          if (!state.isAuthenticated || state.toAuth().sessionId !== current.account.session_id) {
            return errorPage(502);
          }
          const responseHeaders = new Headers({ ...noStore, Location: redirect.href });
          for (const cookie of state.headers.getSetCookie()) {
            responseHeaders.append('Set-Cookie', cookie);
          }
          responseHeaders.append(
            'Set-Cookie',
            serialize(completionCookie, '', {
              ...cookieOptions,
              sameSite: 'lax',
              path: '/',
              maxAge: 0,
            }),
          );
          return new Response(null, { status: 303, headers: responseHeaders });
        }
        const action = poppy.browserCompletionUrl;
        return new Response(
          '<!doctype html><title>Connecting</title><p>Connecting this browser.</p>' +
            `<form method="post" action="${action}"><input type="hidden" name="endpoint" value="${endpoint.href}">` +
            `<input type="hidden" name="browser_token" value="${browserToken}"><button>Continue</button></form>` +
            '<script>document.forms[0].submit()</script>',
          {
            headers: {
              ...htmlHeaders,
              'Referrer-Policy': 'origin',
              'Content-Security-Policy': `default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self' ${new URL(action).origin}; script-src 'sha256-ePniVEkSivX/c7XWBGafqh8tSpiRrKiqYeqbG7N1TOE='`,
            },
          },
        );
      } catch {
        return errorPage(502);
      }
    },

    async signOut(request: Request) {
      const origin = new URL(request.url).origin;
      if (request.method !== 'POST' || origin !== endpoint.origin || request.headers.get('origin') !== origin) {
        return errorPage(400);
      }
      const token = parsePoppyCookie(parse(request.headers.get('cookie') ?? '')[sessionCookie])?.token;
      if (token) {
        try {
          await poppy.signOutBrowserSession(endpoint.href, token);
        } catch {
          return errorPage(502);
        }
      }
      return new Response(null, { status: 303, headers: { ...noStore, Location: redirect.href } });
    },

    async getSession(headers: Pick<Headers, 'get'>) {
      const token = parsePoppyCookie(parse(headers.get('cookie') ?? '')[sessionCookie])?.token;
      if (!token) {
        return null;
      }
      try {
        return await poppy.readBrowserSession(endpoint.href, token);
      } catch (error) {
        if (isClerkAPIResponseError(error) && (error.status === 400 || error.status === 404)) {
          return null;
        }
        throw new Error('Could not read the Poppy browser Session.');
      }
    },
  };
}
