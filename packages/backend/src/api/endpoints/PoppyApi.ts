import { runtime } from '../../runtime';
import type { RequestFunction } from '../request';

const browserSessions = '/v1/poppy/browser_sessions';

export const poppyCookies = {
  browser: '__Host-poppy_session',
  join: '__Host-poppy_join',
  ticket: '__Host-poppy_ticket',
} as const;

export type PoppyBrowserSession = {
  session_id: string;
  client_id: string;
  user_id: string;
  agent_id?: string;
  account?: { user_id: string; scopes: string[]; session_id: string };
};

export type PoppyMetadata = Record<string, unknown> & {
  organization: { name: string; domain: string };
  auth: { issuer: string; scopes: Record<string, string> };
};

export type PoppyOptions = {
  /**
   * Absolute HTTPS URL on the application origin for the Poppy-defined browser join.
   * Clerk serves the join form here and derives Poppy's `/authorize` path and Clerk's `/callback` path from it.
   * Next.js middleware also advertises this URL in discovery; mount `PoppyCallbackPage` at the callback path.
   */
  browserSessionEndpoint: string;
  /**
   * Clerk-defined destination after a successful browser join. Signed-in joins visit the
   * callback first to activate the Clerk session. Accepts a path or URL on the endpoint's origin.
   * @default '/'
   */
  redirectTo?: string;
};

export type PoppyCredential = { type: 'browser'; endpoint: string; token: string } | { type: 'session'; token: string };

export class PoppyAPI {
  constructor(
    private readonly request: RequestFunction,
    private readonly artifactRequest: RequestFunction,
    private readonly frontendApi?: string,
  ) {}

  public async getMetadata() {
    const artifact = await this.artifactRequest<{ object: 'artifact'; data: PoppyMetadata }>({
      method: 'GET',
      path: '/artifacts/well-known-poppy',
    });
    return artifact.data;
  }

  public resolveSession(credential: PoppyCredential) {
    return this.request<PoppyBrowserSession>({
      method: 'POST',
      path: '/poppy/browser_sessions/resolve',
      bodyParams: { credential },
    });
  }

  public async proxyBrowserRequest(request: Request, options: PoppyOptions) {
    if (!this.frontendApi) {
      throw new Error('A valid Clerk publishable key is required for Poppy browser sessions.');
    }
    const endpoint = new URL(options.browserSessionEndpoint);
    const incoming = new URL(request.url);
    const headers = new Headers(Array.from(request.headers));
    headers.delete('host');
    headers.delete('content-length');
    headers.set('accept-encoding', 'identity');
    headers.set('Clerk-Poppy-Endpoint', endpoint.href);
    headers.set('Clerk-Poppy-Redirect', new URL(options.redirectTo ?? '/', endpoint).href);
    const body = request.method === 'POST' ? await request.arrayBuffer() : undefined;
    const response = await runtime.fetch(
      `https://${this.frontendApi}${browserSessions}${incoming.pathname === endpoint.pathname + '/authorize' ? '/authorize' : ''}`,
      {
        method: request.method,
        headers: Object.fromEntries(headers),
        body,
        redirect: 'manual',
      },
    );
    const responseHeaders = new Headers(Array.from(response.headers));
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  }
}
