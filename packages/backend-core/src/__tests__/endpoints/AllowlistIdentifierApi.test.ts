import nock from 'nock';

import { AllowlistIdentifier } from '../../api/resources';
import { defaultServerAPIUrl, TestClerkAPI } from '../TestClerkApi';

afterEach(() => {
  nock.cleanAll();
});

test('getAllowlistIdentifierList() returns a list of allowlist identifiers', async () => {
  nock(defaultServerAPIUrl)
    .get('/v1/allowlist_identifiers')
    .replyWithFile(200, __dirname + '/responses/getAllowlistIdentifierList.json', {});

  const allowlistIdentifierList = await TestClerkAPI.allowlistIdentifiers.getAllowlistIdentifierList();
  expect(allowlistIdentifierList).toBeInstanceOf(Array);
  expect(allowlistIdentifierList.length).toEqual(1);
  expect(allowlistIdentifierList[0]).toBeInstanceOf(AllowlistIdentifier);
});

test('createAllowlistIdentifier() creates an allowlist identifier', async () => {
  const identifier = 'test@example.com';
  const resJSON = {
    object: 'allowlist_identifier',
    id: 'alid_randomid',
    identifier,
    created_at: 1611948436,
    updated_at: 1611948436,
  };

  nock(defaultServerAPIUrl)
    .post(
      '/v1/allowlist_identifiers',
      JSON.stringify({
        identifier,
        notify: false,
      }),
    )
    .reply(200, resJSON);

  const allowlistIdentifier = await TestClerkAPI.allowlistIdentifiers.createAllowlistIdentifier({
    identifier,
    notify: false,
  });
  expect(allowlistIdentifier).toEqual(
    new AllowlistIdentifier(resJSON.id, identifier, resJSON.created_at, resJSON.updated_at),
  );
});

test('deleteAllowlistIdentifier() deletes an allowlist identifier', async () => {
  const id = 'alid_randomid';
  const resJSON = {
    object: 'allowlist_identifier',
    id,
    identifier: 'test@example.com',
    created_at: 1611948436,
    updated_at: 1611948436,
  };

  nock(defaultServerAPIUrl).delete(`/v1/allowlist_identifiers/${id}`).reply(200, resJSON);

  const allowlistIdentifier = await TestClerkAPI.allowlistIdentifiers.deleteAllowlistIdentifier(id);
  expect(allowlistIdentifier).toEqual(
    new AllowlistIdentifier(id, resJSON.identifier, resJSON.created_at, resJSON.updated_at),
  );
});

test('deleteAllowlistIdentifier() throws an error without allowlist identifier ID', async () => {
  await expect(TestClerkAPI.allowlistIdentifiers.deleteAllowlistIdentifier('')).rejects.toThrow(
    'A valid resource ID is required.',
  );
});
