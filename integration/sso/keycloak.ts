import { randomUUID } from 'node:crypto';

import type { Page } from '@playwright/test';

export class Keycloak {
  readonly realm = `e2e-${randomUUID()}`;
  readonly domain = `${this.realm}.clerk.test`;
  readonly email = `alice@${this.domain}`;
  readonly password = randomUUID();

  async signIn(page: Page, email = this.email) {
    await page.locator('#username').fill(email);
    await page.locator('#password').fill(this.password);
    await page.locator('#kc-login').click();
  }

  constructor(
    readonly baseUrl: string,
    private readonly adminPassword: string,
  ) {}

  private async admin(path: string, method: string, body?: unknown) {
    const tokenResponse = await fetch(`${this.baseUrl}/realms/master/protocol/openid-connect/token`, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: 'admin-cli',
        username: 'e2e-admin',
        password: this.adminPassword,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!tokenResponse.ok) {
      throw new Error(`Keycloak admin login failed (${tokenResponse.status}).`);
    }
    const { access_token: token } = await tokenResponse.json();
    const response = await fetch(`${this.baseUrl}/admin/realms${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok && !(method === 'DELETE' && response.status === 404)) {
      throw new Error(`Keycloak ${method} ${path} failed (${response.status}): ${await response.text()}`);
    }
    return response.status === 200 ? response.json() : undefined;
  }

  async createRealm(realm: string) {
    await this.admin('', 'POST', {
      realm,
      enabled: true,
      sslRequired: 'none',
      verifyEmail: false,
      registrationAllowed: false,
    });
  }

  async deleteRealm(realm: string) {
    await this.admin(`/${encodeURIComponent(realm)}`, 'DELETE');
  }

  async createUser(realm: string, email: string, password: string) {
    await this.admin(`/${encodeURIComponent(realm)}/users`, 'POST', {
      username: email,
      email,
      emailVerified: true,
      enabled: true,
      firstName: 'Alice',
      lastName: 'Keycloak',
      requiredActions: [],
      credentials: [{ type: 'password', value: password, temporary: false }],
    });
  }

  async createSamlClient(realm: string, entityId: string | undefined, acsUrl: string | undefined) {
    if (!entityId || !acsUrl) {
      throw new Error('A SAML client requires an entity ID and an ACS URL.');
    }
    await this.admin(`/${encodeURIComponent(realm)}/clients`, 'POST', {
      clientId: entityId,
      protocol: 'saml',
      enabled: true,
      redirectUris: [acsUrl],
      attributes: {
        'saml.assertion.signature': 'true',
        'saml.server.signature': 'true',
        'saml.client.signature': 'false',
        'saml.force.post.binding': 'true',
        'saml.signature.algorithm': 'RSA_SHA256',
        saml_name_id_format: 'email',
        saml_force_name_id_format: 'true',
      },
      protocolMappers: [
        ['email', 'email'],
        ['email', 'mail'],
        ['firstName', 'firstName'],
        ['lastName', 'lastName'],
      ].map(([property, attribute]) => ({
        name: attribute,
        protocol: 'saml',
        protocolMapper: 'saml-user-property-mapper',
        config: {
          'user.attribute': property,
          'attribute.name': attribute,
          'attribute.nameformat': 'Basic',
        },
      })),
    });
  }

  async metadata(realm: string) {
    const response = await fetch(`${this.baseUrl}/realms/${encodeURIComponent(realm)}/protocol/saml/descriptor`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new Error(`Keycloak metadata failed (${response.status}).`);
    }
    return response.text();
  }
}
