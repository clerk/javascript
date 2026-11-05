import type { SessionWithActivitiesJSON } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { SessionWithActivities } from '../SessionWithActivities';

const build = (actor: SessionWithActivitiesJSON['actor']) =>
  new SessionWithActivities(
    {
      object: 'session',
      id: 'sess_1',
      status: 'active',
      user: null,
      actor,
      latest_activity: {},
      expire_at: 1,
      abandon_at: 2,
      last_active_at: 3,
    } as unknown as SessionWithActivitiesJSON,
    '/me/sessions',
  );

describe('SessionWithActivities', () => {
  it('sets agent and keeps actor when the actor has type "agent"', () => {
    const actor = { sub: 'agent_1', type: 'agent', task_id: 'task_1' };
    const session = build(actor as SessionWithActivitiesJSON['actor']);

    expect(session.actor).toEqual(actor);
    expect(session.agent).toEqual(actor);
  });

  it('sets actor and a null agent for an impersonation session', () => {
    const actor = { sub: 'user_2' };
    const session = build(actor);

    expect(session.actor).toEqual(actor);
    expect(session.agent).toBeNull();
  });

  it('sets a null actor and a null agent when there is no actor', () => {
    const session = build(null);

    expect(session.actor).toBeNull();
    expect(session.agent).toBeNull();
  });
});
