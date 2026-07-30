import { describe, expect, it } from 'vitest';

import { IdPOAuthAccessToken } from '../IdPOAuthAccessToken';
import { type IdPOAuthAccessTokenJSON, ObjectType } from '../JSON';

describe('IdPOAuthAccessToken', () => {
  const json: IdPOAuthAccessTokenJSON = {
    object: ObjectType.IdpOAuthAccessToken,
    id: 'oat_2VTWUzvGC5UhdJCNx6xG1D98edc',
    client_id: 'client_2VTWUzvGC5UhdJCNx6xG1D98edc',
    type: 'oauth_token',
    subject: 'user_2vYVtestTESTtestTESTtestTESTtest',
    scopes: ['read:foo', 'write:bar'],
    permissions: ['things:read', 'things:write'],
    revoked: false,
    revocation_reason: null,
    expired: false,
    expiration: 1_666_648_550_000,
    created_at: 1_666_648_250_000,
    updated_at: 1_666_648_250_000,
  };

  it('reads mapped permissions from the verification response', () => {
    expect(IdPOAuthAccessToken.fromJSON(json).permissions).toEqual(['things:read', 'things:write']);
  });

  it('defaults missing permissions to an empty list', () => {
    const { permissions: _, ...jsonWithoutPermissions } = json;

    expect(IdPOAuthAccessToken.fromJSON(jsonWithoutPermissions).permissions).toEqual([]);
  });
});
