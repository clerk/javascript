export const userPayload = (email: string) => ({
  schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
  userName: email,
  externalId: email,
  active: true,
  name: { givenName: 'Alice', familyName: 'Keycloak' },
  emails: [{ value: email, primary: true, type: 'work' }],
});

export const patchPayload = (operations: Array<Record<string, unknown>>) => ({
  schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
  Operations: operations,
});

export class Scim {
  constructor(
    readonly url: string,
    readonly token: string,
  ) {}

  async request(path: string, method = 'GET', body?: unknown) {
    const response = await fetch(`${this.url.replace(/\/$/, '')}/${path}`, {
      method,
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/scim+json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      throw new Error(`SCIM event ${method} ${path} failed (${response.status}).`);
    }
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null };
  }
}
