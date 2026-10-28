import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { allowSpecViolation, fapiUrl, takeContractViolations, worker } from './fake-fapi';
import { fapiClient, fapiEmailAddress, fapiSamlLinking, fapiSession, fapiUser, fapiVerification } from './fapi';
import { fapiContractViolations, staleSpecGaps } from './fapi-contract';

const FAPI = 'https://clerk.example.com';

function request(method: string, path: string) {
  return new Request(`${FAPI}${path}`, { method });
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
