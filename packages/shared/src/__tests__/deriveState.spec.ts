import { describe, expect, it } from 'vitest';

import { deriveState } from '../deriveState';
import type { InitialState, Resources } from '../types';

describe('deriveState', () => {
  const mockInitialState = {
    userId: 'user_2U330vGHg3llBga8Oi0fzzeNAaG',
    sessionId: 'sess_2j1R7g3AUeKMx9M23dBO0XLEQGY',
    orgId: 'org_2U330vGHg3llBga8Oi0fzzeNAaG',
  } as InitialState;

  const mockResources = {
    client: {},
    user: { id: mockInitialState.userId },
    session: { id: mockInitialState.sessionId },
    organization: { id: mockInitialState.orgId },
  } as Resources;

  it('uses SSR state when !clerkLoaded and initialState is provided', () => {
    expect(deriveState(false, {} as Resources, mockInitialState)).toEqual(mockInitialState);
  });

  it('uses CSR state when clerkLoaded', () => {
    const result = deriveState(true, mockResources, undefined);
    expect(result.userId).toBe(mockInitialState.userId);
    expect(result.sessionId).toBe(mockInitialState.sessionId);
    expect(result.orgId).toBe(mockInitialState.orgId);
  });

  it('handles !clerkLoaded and undefined initialState', () => {
    const result = deriveState(false, {} as Resources, undefined);
    expect(result.userId).toBeUndefined();
    expect(result.sessionId).toBeUndefined();
    expect(result.orgId).toBeUndefined();
  });
});
