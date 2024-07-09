import type { InitialState, Resources } from '@clerk/types';

import { deriveState } from '../deriveState';

describe('deriveState', () => {
  const mockInitialState = {
    userId: 'user_2U330vGHg3llBga8Oi0fzzeNAaG',
    sessionId: 'sess_2j1R7g3AUeKMx9M23dBO0XLEQGY',
    orgId: 'org_2U330vGHg3llBga8Oi0fzzeNAaG',
  } as InitialState;

  const mockResources: Resources = {
    client: {} as Resources['client'],
    user: { id: mockInitialState.userId } as Resources['user'],
    session: { id: mockInitialState.sessionId } as Resources['session'],
    organization: { id: mockInitialState.orgId } as Resources['organization'],
  };

  it('uses SSR state when !clerkLoaded and initialState is provided', () => {
    expect(deriveState(false, {} as Resources, mockInitialState)).toEqual(mockInitialState);
  });

  it('uses CSR state when clerkLoaded', () => {
    const result = deriveState(true, mockResources, undefined);
    expect(result.userId).toBe(mockInitialState.userId);
    expect(result.orgId).toBe(mockInitialState.orgId);
  });
});
