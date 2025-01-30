import type { InitialState, Resources } from '@clerk/types';

import { deriveState } from '../deriveState';

describe('deriveState', () => {
  const mockSessionClaims = {
    sid: 'sess_2j1R7g3AUeKMx9M23dBO0XLEQGY',
    sub: 'user_2U330vGHg3llBga8Oi0fzzeNAaG',
    org_id: 'org_2U330vGHg3llBga8Oi0fzzeNAaG',
  } as InitialState['sessionClaims'];

  const mockInitialState = {
    userId: mockSessionClaims.sub,
    orgId: mockSessionClaims.org_id,
    sessionId: mockSessionClaims.sid,
    sessionClaims: mockSessionClaims,
  } as InitialState;

  const mockResources = {
    client: {},
    user: { id: mockInitialState.userId },
    organization: { id: mockInitialState.orgId },
    session: {
      id: mockInitialState.sessionId,
      lastActiveToken: { jwt: { claims: mockSessionClaims } },
    },
  } as Resources;

  it('uses SSR state when !clerkLoaded and initialState is provided', () => {
    expect(deriveState(false, {} as Resources, mockInitialState)).toEqual(mockInitialState);
  });

  it('uses CSR state when clerkLoaded', () => {
    const result = deriveState(true, mockResources, undefined);
    expect(result.userId).toBe(mockInitialState.userId);
    expect(result.sessionId).toBe(mockInitialState.sessionId);
    expect(result.orgId).toBe(mockInitialState.orgId);
    expect(result.sessionClaims?.sid).toBe(mockInitialState.sessionId);
    expect(result.sessionClaims?.sub).toBe(mockInitialState.userId);
    expect(result.sessionClaims?.org_id).toBe(mockInitialState.orgId);
  });

  it('handles !clerkLoaded and undefined initialState', () => {
    const result = deriveState(false, {} as Resources, undefined);
    expect(result.userId).toBeUndefined();
    expect(result.sessionId).toBeUndefined();
    expect(result.orgId).toBeUndefined();
    expect(result.sessionClaims).toBeUndefined();
  });
});
