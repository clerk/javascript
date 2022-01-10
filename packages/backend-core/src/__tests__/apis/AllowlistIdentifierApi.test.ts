import nock from 'nock';

import { AllowlistIdentifier } from '../../api/resources';
import { TestBackendAPIClient } from '../TestBackendAPI';

test('getAllowlistIdentifierList() returns a list of allowlist identifiers', async () => {
  nock('https://api.clerk.dev')
    .get('/v1/allowlist_identifiers')
    .replyWithFile(
      200,
      __dirname + '/responses/getAllowlistIdentifierList.json',
      {}
    );

  const allowlistIdentifierList =
    await TestBackendAPIClient.allowlistIdentifiers.getAllowlistIdentifierList();
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

  nock('https://api.clerk.dev')
    .post(
      '/v1/allowlist_identifiers',
      JSON.stringify({
        identifier,
        notify: false,
      })
    )
    .reply(200, resJSON);

  const allowlistIdentifier =
    await TestBackendAPIClient.allowlistIdentifiers.createAllowlistIdentifier({
      identifier,
      notify: false,
    });
  expect(allowlistIdentifier).toEqual(
    new AllowlistIdentifier({
      id: resJSON.id,
      identifier,
      createdAt: resJSON.created_at,
      updatedAt: resJSON.updated_at,
    })
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

  nock('https://api.clerk.dev')
    .delete(`/v1/allowlist_identifiers/${id}`)
    .reply(200, resJSON);

  const allowlistIdentifier =
    await TestBackendAPIClient.allowlistIdentifiers.deleteAllowlistIdentifier(
      id
    );
  expect(allowlistIdentifier).toEqual(
    new AllowlistIdentifier({
      id,
      identifier: resJSON.identifier,
      createdAt: resJSON.created_at,
      updatedAt: resJSON.updated_at,
    })
  );
});

test('deleteAllowlistIdentifier() throws an error without allowlist identifier ID', async () => {
  await expect(
    TestBackendAPIClient.allowlistIdentifiers.deleteAllowlistIdentifier('')
  ).rejects.toThrow('A valid ID is required.');
});
