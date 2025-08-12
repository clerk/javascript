export const mockTokens = {
  api_key: 'ak_LCWGdaM8mv8K4PC/57IICZQXAeWfCgF30DZaFXHoGn9=',
  oauth_token: 'oat_8XOIucKvqHVr5tYP123456789abcdefghij',
  m2m_token: 'mt_8XOIucKvqHVr5tYP123456789abcdefghij',
} as const;

export const mockVerificationResults = {
  api_key: {
    id: 'ak_ey966f1b1xf93586b2debdcadb0b3bd1',
    type: 'api_key',
    name: 'my-api-key',
    subject: 'user_2vYVtestTESTtestTESTtestTESTtest',
    claims: { foo: 'bar' },
    scopes: ['read:foo', 'write:bar'],
    revoked: false,
    revocationReason: null,
    expired: false,
    expiration: null,
    createdBy: null,
    creationReason: null,
    secondsUntilExpiration: null,
    createdAt: 1745354860746,
    updatedAt: 1745354860746,
  },
  oauth_token: {
    id: 'oat_2VTWUzvGC5UhdJCNx6xG1D98edc',
    clientId: 'client_2VTWUzvGC5UhdJCNx6xG1D98edc',
    type: 'oauth:access_token',
    name: 'GitHub OAuth',
    subject: 'user_2vYVtestTESTtestTESTtestTESTtest',
    scopes: ['read:foo', 'write:bar'],
    revoked: false,
    revocationReason: null,
    expired: false,
    expiration: null,
    createdAt: 1744928754551,
    updatedAt: 1744928754551,
  },
  m2m_token: {
    id: 'm2m_ey966f1b1xf93586b2debdcadb0b3bd1',
    subject: 'mch_2vYVtestTESTtestTESTtestTESTtest',
    scopes: ['mch_1xxxxx', 'mch_2xxxxx'],
    claims: { foo: 'bar' },
    revoked: false,
    revocationReason: null,
    expired: false,
    expiration: null,
    creationReason: null,
    createdAt: 1745185445567,
    updatedAt: 1745185445567,
  },
};

export const mockMachineAuthResponses = {
  api_key: {
    endpoint: 'https://api.clerk.test/api_keys/verify',
    errorMessage: 'API key not found',
  },
  oauth_token: {
    endpoint: 'https://api.clerk.test/oauth_applications/access_tokens/verify',
    errorMessage: 'OAuth token not found',
  },
  m2m_token: {
    endpoint: 'https://api.clerk.test/m2m_tokens/verify',
    errorMessage: 'Machine token not found',
  },
} as const;
