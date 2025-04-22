export const mockApiKey = 'api_key_LCWGdaM8mv8K4PC/57IICZQXAeWfCgF30DZaFXHoGn9=';
export const mockOauthToken = 'oauth_access_8XOIucKvqHVr5tYP123456789abcdefghij';
export const mockMachineToken = 'm2m_8XOIucKvqHVr5tYP123456789abcdefghij';

export const mockMachineAuthResponses = {
  api_key: {
    endpoint: 'https://api.clerk.test/v1/api_keys/verify',
    successResponse: {
      object: 'api_key',
      id: 'api_key_ey966f1b1xf93586b2debdcadb0b3bd1',
      type: 'api_key',
      name: 'my-api-key',
      subject: 'user_2vYVtestTESTtestTESTtestTESTtest',
      claims: { foo: 'bar' },
    },
    errorMessage: 'API key not found',
  },
  oauth_token: {
    endpoint: 'https://api.clerk.test/v1/oauth_applications/access_tokens/verify',
    successResponse: {
      object: 'clerk_idp_oauth_access_token',
      id: 'oauth_access_ey966f1b1xf93586b2debdcadb0b3bd1',
      type: 'oauth_token',
      name: 'my-oauth-token',
      subject: 'user_2vYVtestTESTtestTESTtestTESTtest',
      claims: { foo: 'bar' },
    },
    errorMessage: 'OAuth token not found',
  },
  machine_token: {
    endpoint: 'https://api.clerk.test/v1/m2m_tokens/verify',
    successResponse: {
      object: 'machine_token',
      id: 'm2m_ey966f1b1xf93586b2debdcadb0b3bd1',
      name: 'my-machine-token',
      subject: 'user_2vYVtestTESTtestTESTtestTESTtest',
      claims: { foo: 'bar' },
    },
    errorMessage: 'Machine token not found',
  },
};

export const tokenMap = {
  api_key: mockApiKey,
  oauth_token: mockOauthToken,
  machine_token: mockMachineToken,
};
