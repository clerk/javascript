import { describe, expect, it } from 'vitest';

import { ClerkAPIError } from '../errors/clerkApiError';
import { errorToJSON } from '../errors/parseError';
import type { ClerkAPIErrorJSON } from '../types/errors';

describe('Clerk Connect error meta', () => {
  const json: ClerkAPIErrorJSON = {
    code: 'connection_reauthorization_required',
    message: 'Connection needs reauthorization',
    long_message: 'Reauthorize the connection.',
    meta: {
      connection_id: 'con_1',
      connection_status: 'disconnected',
      missing_scopes: ['repo'],
      scopes_not_allowed: ['admin'],
      connector: 'github',
      available_expires_in: 3600,
    },
  };

  const expected = {
    connectionId: 'con_1',
    connectionStatus: 'disconnected',
    missingScopes: ['repo'],
    scopesNotAllowed: ['admin'],
    connector: 'github',
    availableExpiresIn: 3600,
  };

  it('camelizes the Connect fields', () => {
    expect(new ClerkAPIError(json).meta).toMatchObject(expected);
  });

  it('survives a snapshot round trip', () => {
    expect(new ClerkAPIError(errorToJSON(new ClerkAPIError(json))).meta).toMatchObject(expected);
  });
});
