import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { allowSpecViolation, fapiUrl, takeContractViolations, worker } from './fake-fapi';
import { fapiClient, fapiEmailAddress, fapiSamlLinking, fapiSession, fapiUser, fapiVerification } from './fapi';
import { fapiContractViolations, staleSpecGaps } from './fapi-contract';

const FAPI = 'https://clerk.example.com';

function request(method: string, path: string) {
  return new Request(`${FAPI}${path}`, { method });
}

function formRequest(method: string, path: string, body: string) {
  return new Request(`${FAPI}${path}`, {
    method,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
}

function jsonRequest(method: string, path: string, body: unknown) {
  return new Request(`${FAPI}${path}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function multipartRequest(method: string, path: string, fields: Record<string, string | File>) {
  const body = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    body.append(name, value);
  }
  return new Request(`${FAPI}${path}`, { method, body });
}

function rejected() {
  return HttpResponse.json({ errors: [{ code: 'invalid', message: 'no', long_message: 'no' }] }, { status: 422 });
}

const user = fapiUser({ id: 'user_1', email_addresses: [fapiEmailAddress({ id: 'idn_1' })] });
const client = fapiClient([fapiSession({ id: 'sess_1', user })]);

function envelope(response: unknown, status = 200) {
  return HttpResponse.json({ response, client }, { status });
}

describe('fapiContractViolations', () => {
  it('accepts a response that matches the spec', async () => {
    expect(await fapiContractViolations(request('GET', '/v1/me'), envelope(user))).toEqual([]);
  });

  it('accepts a whole client from the default builders', async () => {
    expect(await fapiContractViolations(request('GET', '/v1/client'), envelope(client))).toEqual([]);
  });

  it('rejects a field the spec does not declare', async () => {
    const violations = await fapiContractViolations(
      request('GET', '/v1/me'),
      envelope({ ...user, invented_field: true }),
    );
    expect(violations).toEqual([expect.stringContaining('invented_field')]);
  });

  it('rejects a field with the wrong type', async () => {
    const violations = await fapiContractViolations(request('GET', '/v1/me'), envelope({ ...user, first_name: 42 }));
    expect(violations).toEqual([expect.stringContaining('/response/first_name')]);
  });

  it('rejects a response missing a required field', async () => {
    const { object: _object, ...withoutObject } = user;
    const violations = await fapiContractViolations(request('GET', '/v1/me'), envelope(withoutObject));
    expect(violations).toEqual([expect.stringContaining('object')]);
  });

  it('checks a POST sent with _method against the operation it stands for', async () => {
    const deleted = { object: 'user', id: 'user_1', deleted: true };
    expect(await fapiContractViolations(request('POST', '/v1/me?_method=DELETE'), envelope(deleted))).toEqual([]);
    expect(await fapiContractViolations(request('POST', '/v1/me?_method=PATCH'), envelope(deleted))).not.toEqual([]);
  });

  it('matches path parameters and ignores a trailing slash', async () => {
    const email = fapiEmailAddress({ id: 'idn_1' });
    expect(await fapiContractViolations(request('GET', '/v1/me/email_addresses/idn_1/'), envelope(email))).toEqual([]);
  });

  it('checks a Clerk error against the error schema', async () => {
    const valid = HttpResponse.json(
      { errors: [{ code: 'not_found', message: 'gone', long_message: 'gone' }] },
      { status: 404 },
    );
    const invalid = HttpResponse.json({ errors: [{ code: 404 }] }, { status: 404 });
    expect(await fapiContractViolations(request('GET', '/v1/me'), valid)).toEqual([]);
    expect(await fapiContractViolations(request('GET', '/v1/me'), invalid)).not.toEqual([]);
  });

  it('rejects a success status the operation does not document', async () => {
    expect(await fapiContractViolations(request('GET', '/v1/me'), envelope(user, 201))).toEqual([
      expect.stringContaining('201'),
    ]);
  });

  it('checks an error status the operation does not document against the error schema', async () => {
    const valid = HttpResponse.json(
      { errors: [{ code: 'conflict', message: 'taken', long_message: 'taken' }] },
      { status: 409 },
    );
    expect(await fapiContractViolations(request('GET', '/v1/me'), valid)).toEqual([]);
    expect(await fapiContractViolations(request('GET', '/v1/me'), envelope(user, 409))).toEqual([
      expect.stringContaining('409'),
    ]);
  });

  it('rejects an endpoint the spec does not have', async () => {
    expect(await fapiContractViolations(request('GET', '/v1/me/invented'), envelope(user))).toEqual([
      expect.stringContaining('GET /v1/me/invented'),
    ]);
  });

  it('accepts a field the spec is known to be missing', async () => {
    const violations = await fapiContractViolations(
      request('GET', '/v1/me'),
      envelope({ ...user, enterprise_accounts: [] }),
    );
    expect(violations).toEqual([]);
  });

  it('accepts a field the spec is known to be missing from an inline response schema', async () => {
    const token = HttpResponse.json({ object: 'token', jwt: 'header.payload.signature' });
    expect(await fapiContractViolations(request('POST', '/v1/client/sessions/sess_1/tokens'), token)).toEqual([]);
  });

  it('accepts a field the spec is known to type too narrowly', async () => {
    const linking = fapiSamlLinking(fapiVerification('saml'));
    expect(await fapiContractViolations(request('POST', '/v1/me/external_accounts'), envelope(linking))).toEqual([]);
  });
});

describe('fapiContractViolations on the request', () => {
  const enterpriseConnection = '/v1/me/enterprise_connections/ec_1';

  it('accepts a form body that matches the spec', async () => {
    expect(await fapiContractViolations(formRequest('PATCH', '/v1/me', 'first_name=Ada'), envelope(user))).toEqual([]);
  });

  it('rejects a body field the spec does not declare', async () => {
    const violations = await fapiContractViolations(
      formRequest('PATCH', '/v1/me', 'first_name=Ada&invented_field=1'),
      envelope(user),
    );
    expect(violations).toEqual([expect.stringContaining('invented_field')]);
  });

  it('rejects a body missing a required field', async () => {
    const violations = await fapiContractViolations(
      formRequest('POST', '/v1/me/email_addresses', 'invented_field=1'),
      rejected(),
    );
    expect(violations).toEqual([expect.stringContaining('email_address')]);
  });

  it('reads form values as the types the spec declares', async () => {
    const body = 'active=true&domains=a.example&domains=b.example';
    expect(await fapiContractViolations(formRequest('PATCH', enterpriseConnection, body), rejected())).toEqual([]);
  });

  it('reads a single form value as a one-item array where the spec declares an array', async () => {
    const body = 'domains=a.example';
    expect(await fapiContractViolations(formRequest('PATCH', enterpriseConnection, body), rejected())).toEqual([]);
  });

  it('rejects a form value that is not the declared type', async () => {
    const violations = await fapiContractViolations(
      formRequest('PATCH', enterpriseConnection, 'active=maybe'),
      rejected(),
    );
    expect(violations).toEqual([expect.stringContaining('/active')]);
  });

  it('checks the body of a POST sent with _method against the operation it stands for', async () => {
    const violations = await fapiContractViolations(
      formRequest('POST', '/v1/me?_method=PATCH', 'first_name=Ada'),
      envelope(user),
    );
    expect(violations).toEqual([]);
  });

  it('rejects a body the operation does not take', async () => {
    const deleted = HttpResponse.json({ response: { object: 'user', id: 'user_1', deleted: true }, client });
    const violations = await fapiContractViolations(formRequest('POST', '/v1/me?_method=DELETE', 'x=1'), deleted);
    expect(violations).toEqual([expect.stringContaining('body')]);
  });

  it('accepts an empty body on an operation that takes none', async () => {
    const deleted = HttpResponse.json({ response: { object: 'user', id: 'user_1', deleted: true }, client });
    expect(await fapiContractViolations(formRequest('POST', '/v1/me?_method=DELETE', ''), deleted)).toEqual([]);
  });

  it('rejects a missing body the operation requires', async () => {
    const violations = await fapiContractViolations(request('POST', '/v1/me/profile_image'), rejected());
    expect(violations).toEqual([expect.stringContaining('body')]);
  });

  it('rejects a content type the operation does not take', async () => {
    const violations = await fapiContractViolations(
      jsonRequest('PATCH', '/v1/me', { first_name: 'Ada' }),
      envelope(user),
    );
    expect(violations).toEqual([expect.stringContaining('application/json')]);
  });

  it('checks a multipart body', async () => {
    const file = new File(['image'], 'avatar.png', { type: 'image/png' });
    const path = '/v1/me/profile_image';
    expect(await fapiContractViolations(multipartRequest('POST', path, { file }), rejected())).toEqual([]);
    expect(
      await fapiContractViolations(multipartRequest('POST', path, { file, invented_field: 'x' }), rejected()),
    ).toEqual([expect.stringContaining('invented_field')]);
  });

  it('checks a JSON body without reading strings as other types', async () => {
    const path = '/api_keys/ak_1';
    expect(await fapiContractViolations(jsonRequest('PATCH', path, { description: 'ci' }), rejected())).toEqual([]);
    expect(await fapiContractViolations(jsonRequest('PATCH', path, { description: 5 }), rejected())).toEqual([
      expect.stringContaining('/description'),
    ]);
  });

  it('reads an OpenAPI 3.0 exclusive minimum', async () => {
    const subject = `user_${'a'.repeat(27)}`;
    const body = (seconds: number) => ({ name: 'ci key', subject, seconds_until_expiration: seconds });
    expect(await fapiContractViolations(jsonRequest('POST', '/api_keys', body(1)), rejected())).toEqual([]);
    expect(await fapiContractViolations(jsonRequest('POST', '/api_keys', body(0)), rejected())).toEqual([
      expect.stringContaining('/seconds_until_expiration'),
    ]);
  });

  it('reads query values as the types the spec declares', async () => {
    const path = '/v1/me/organization_memberships?limit=10&offset=0&paginated=true';
    expect(await fapiContractViolations(request('GET', path), rejected())).toEqual([]);
  });

  it('rejects a query value that is not the declared type', async () => {
    const path = '/v1/me/organization_memberships?limit=ten';
    expect(await fapiContractViolations(request('GET', path), rejected())).toEqual([expect.stringContaining('/limit')]);
  });

  it('rejects a query parameter the spec does not declare', async () => {
    const violations = await fapiContractViolations(request('GET', '/v1/me?invented_param=1'), envelope(user));
    expect(violations).toEqual([expect.stringContaining('invented_param')]);
  });

  it('accepts a body field the spec is known to be missing', async () => {
    const token = HttpResponse.json({ object: 'token', jwt: 'header.payload.signature' });
    const tokens = formRequest('POST', '/v1/client/sessions/sess_1/tokens', 'tab_state=active');
    expect(await fapiContractViolations(tokens, token)).toEqual([]);
  });

  it('accepts a query parameter the spec is known to type too narrowly', async () => {
    const path = '/v1/me/organization_suggestions?status=pending&status=accepted';
    expect(await fapiContractViolations(request('GET', path), rejected())).toEqual([]);
  });

  it('accepts the transport params clerk-js adds to any request', async () => {
    const transport = [
      '__clerk_api_version=2025-11-10',
      '_clerk_js_version=6.0.0',
      '_clerk_session_id=sess_1',
      '_clerk_retry_attempt=1',
      'rotating_token_nonce=nonce',
      '__domain=satellite.example',
    ].join('&');
    expect(await fapiContractViolations(request('GET', `/v1/me?${transport}`), envelope(user))).toEqual([]);
  });
});

describe('staleSpecGaps', () => {
  it('has no known gap that the spec has since closed', () => {
    expect(staleSpecGaps()).toEqual([]);
  });

  it('reports a known gap once the spec declares the field', () => {
    const gap = { at: '#/components/schemas/Client.User', property: 'first_name', schema: {}, sentBy: 'user.go' };
    expect(staleSpecGaps([gap])).toEqual(['#/components/schemas/Client.User now declares first_name']);
  });

  it('reports a known gap whose schema left the spec', () => {
    const gap = { at: '#/components/schemas/Client.Invented', property: 'field', schema: {}, sentBy: 'user.go' };
    expect(staleSpecGaps([gap])).toEqual(['#/components/schemas/Client.Invented is no longer in the spec']);
  });

  it('reports a known gap once the spec changes the field it widens', () => {
    const gap = {
      at: '#/components/schemas/Client.User',
      property: 'first_name',
      schema: {},
      replaces: { type: 'integer' },
      sentBy: 'user.go',
    };
    expect(staleSpecGaps([gap])).toEqual(['#/components/schemas/Client.User changed first_name']);
  });
});

describe('takeContractViolations', () => {
  const invalidMe = 'GET /v1/me 200: /response must be object {"type":"object"}';

  async function fetchInvalidMe() {
    worker.use(http.get(fapiUrl('/v1/me'), () => HttpResponse.json({ response: 42, client })));
    await fetch(fapiUrl('/v1/me'));
  }

  it('reports a mocked response that does not match the spec', async () => {
    await fetchInvalidMe();
    expect(await takeContractViolations()).toEqual([invalidMe]);
  });

  it('reports a request body that does not match the spec', async () => {
    worker.use(http.post(fapiUrl('/v1/me'), () => HttpResponse.json({ response: user, client })));
    await fetch(fapiUrl('/v1/me?_method=PATCH'), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'invented_field=1',
    });
    expect(await takeContractViolations()).toEqual([expect.stringContaining('PATCH /v1/me body')]);
  });

  it('drops a violation the test allows', async () => {
    allowSpecViolation(invalidMe);
    await fetchInvalidMe();
    expect(await takeContractViolations()).toEqual([]);
  });

  it('reports an allowed violation that was never sent', async () => {
    allowSpecViolation(invalidMe);
    expect(await takeContractViolations()).toEqual([`${invalidMe} was allowed but never sent`]);
  });
});
