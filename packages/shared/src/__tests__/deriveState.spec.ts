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

  it('derives the agent from the SSR initial state', () => {
    const agent = { sub: 'agent_123', type: 'agent', task_id: 'agttsk_456' };
    const result = deriveState(false, {} as Resources, { ...mockInitialState, agent } as InitialState);
    expect(result.agent).toEqual(agent);
  });

  it('drops poppy from the agent in the SSR initial state', () => {
    const agent = { sub: 'https://agent.example.com/client.json', type: 'agent', restricted: true };
    const poppy = { session_id: 'ps_1', client_id: agent.sub, user_id: 'pu_1' };
    const result = deriveState(
      false,
      {} as Resources,
      { ...mockInitialState, agent: { ...agent, poppy } } as InitialState,
    );
    expect(result.agent).toStrictEqual(agent);
  });

  it('derives the agent from the session when clerk is loaded', () => {
    const agent = { sub: 'agent_123', type: 'agent', task_id: 'agttsk_456' };
    const result = deriveState(
      true,
      { ...mockResources, session: { ...mockResources.session, agent } } as Resources,
      undefined,
    );
    expect(result.agent).toEqual(agent);
  });

  it('agent is null on a session without an agent and undefined without a session', () => {
    const withSession = deriveState(
      true,
      { ...mockResources, session: { id: 's', agent: null } } as Resources,
      undefined,
    );
    expect(withSession.agent).toBeNull();
    const withoutSession = deriveState(true, { ...mockResources, session: undefined } as Resources, undefined);
    expect(withoutSession.agent).toBeUndefined();
  });

  it('handles !clerkLoaded and undefined initialState', () => {
    const result = deriveState(false, {} as Resources, undefined);
    expect(result.userId).toBeUndefined();
    expect(result.sessionId).toBeUndefined();
    expect(result.orgId).toBeUndefined();
  });
});
