import type { RequestFunction } from '../request';

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

export type PoppyCredential = { type: 'session'; token: string };

export class PoppyAPI {
  constructor(
    private readonly request: RequestFunction,
    private readonly artifactRequest: RequestFunction,
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
}
