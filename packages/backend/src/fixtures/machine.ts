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

// Valid OAuth access token JWT with typ: "at+jwt"
// Header: {"alg":"RS256","kid":"ins_2GIoQhbUpy0hX7B2cVkuTMinXoD","typ":"at+jwt"}
// Payload: {"client_id":"client_2VTWUzvGC5UhdJCNx6xG1D98edc","sub":"user_2vYVtestTESTtestTESTtestTESTtest","jti":"oat_2xKa9Bgv7NxMRDFyQw8LpZ3cTmU1vHjE","iat":1666648250,"exp":1666648550,"scope":"read:foo write:bar"}
// Signed with signingJwks, verifiable with mockJwks
export const mockSignedOAuthAccessTokenJwt =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yR0lvUWhiVXB5MGhYN0IyY1ZrdVRNaW5Yb0QiLCJ0eXAiOiJhdCtqd3QifQ.eyJhenAiOiJodHRwczovL2FjY291bnRzLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsImV4cCI6MTY2NjY0ODU1MCwiaWF0IjoxNjY2NjQ4MjUwLCJpc3MiOiJodHRwczovL2NsZXJrLm9hdXRoLmV4YW1wbGUudGVzdCIsIm5iZiI6MTY2NjY0ODI0MCwic2lkIjoic2Vzc18yR2JEQjRlbk5kQ2E1dlMxenBDM1h6Zzl0SzkiLCJzdWIiOiJ1c2VyXzJ2WVZ0ZXN0VEVTVHRlc3RURVNUdGVzdFRFU1R0ZXN0IiwiY2xpZW50X2lkIjoiY2xpZW50XzJWVFdVenZHQzVVaGRKQ054NnhHMUQ5OGVkYyIsInNjb3BlIjoicmVhZDpmb28gd3JpdGU6YmFyIiwianRpIjoib2F0XzJ4S2E5Qmd2N054TVJERnlRdzhMcFozY1RtVTF2SGpFIn0.Wgw5L2u0nGkxF9Y-5Dje414UEkxq2Fu3_VePeh1-GehCugi0eIXV-QyiXp1ba4pxWWbCfIC_hihzKjwnVb5wrhzqyw8FJpvnvtrHEjt-zSijpS7WlO7ScJDY-PE8zgH-CICnS2CKYSkP3Rbzka9XY_Z6ieUzmBSFdA_0K8pQOdDHv70y04dnL1CjL6XToncnvezioL388Y1UTqlhll8b2Pm4EI7rGdHVKzLcKnKoYpgsBPZLmO7qGPJ5BkHvmg3gOSkmIiziFaEZkoXvjbvEUAt5qEqzaADSaFP6QhRYNtr1s4OD9uj0SK6QaoZTj69XYFuNMNnm7zN_WxvPBMTq9g';

// Valid OAuth access token JWT with typ: "application/at+jwt"
// Header: {"alg":"RS256","kid":"ins_2GIoQhbUpy0hX7B2cVkuTMinXoD","typ":"application/at+jwt"}
// Payload: {"client_id":"client_2VTWUzvGC5UhdJCNx6xG1D98edc","sub":"user_2vYVtestTESTtestTESTtestTESTtest","jti":"oat_2xKa9Bgv7NxMRDFyQw8LpZ3cTmU1vHjE","iat":1666648250,"exp":1666648550,"scope":"read:foo write:bar"}
// Signed with signingJwks, verifiable with mockJwks
export const mockSignedOAuthAccessTokenJwtApplicationTyp =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yR0lvUWhiVXB5MGhYN0IyY1ZrdVRNaW5Yb0QiLCJ0eXAiOiJhcHBsaWNhdGlvbi9hdCtqd3QifQ.eyJhenAiOiJodHRwczovL2FjY291bnRzLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsImV4cCI6MTY2NjY0ODU1MCwiaWF0IjoxNjY2NjQ4MjUwLCJpc3MiOiJodHRwczovL2NsZXJrLm9hdXRoLmV4YW1wbGUudGVzdCIsIm5iZiI6MTY2NjY0ODI0MCwic2lkIjoic2Vzc18yR2JEQjRlbk5kQ2E1dlMxenBDM1h6Zzl0SzkiLCJzdWIiOiJ1c2VyXzJ2WVZ0ZXN0VEVTVHRlc3RURVNUdGVzdFRFU1R0ZXN0IiwiY2xpZW50X2lkIjoiY2xpZW50XzJWVFdVenZHQzVVaGRKQ054NnhHMUQ5OGVkYyIsInNjb3BlIjoicmVhZDpmb28gd3JpdGU6YmFyIiwianRpIjoib2F0XzJ4S2E5Qmd2N054TVJERnlRdzhMcFozY1RtVTF2SGpFIn0.GPTvB4doScjzQD0kRMhMebVDREjwcrMWK73OP_kFc3pl0gST29BlWrKMBi8wRxoSJBc2ukO10BPhGxnh15PxCNLyk6xQFWhFBA7XpVxY4T_VHPDU5FEOocPQuqcqZ4cA1GDJST-BH511fxoJnv4kfha46IvQiUMvWCacIj_w12qfZigeb208mTDIeoJQtlYb-sD9u__CVvB4uZOqGb0lIL5-cCbhMPFg-6GQ2DhZ-Eq5tw7oyO6lPrsAaFN9u-59SLvips364ieYNpgcr9Dbo5PDvUSltqxoIXTDFo4esWw6XwUjnGfqCh34LYAhv_2QF2U0-GASBEn4GK-Wfv3wXg';
