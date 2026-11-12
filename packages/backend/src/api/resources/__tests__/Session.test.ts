import { describe, expect, it } from 'vitest';

import type { SessionJSON } from '../JSON';
import { Session } from '../Session';

const baseJSON = {
  object: 'session',
  id: 'sess_1',
  client_id: 'client_1',
  user_id: 'user_1',
  status: 'active',
  last_active_at: 1,
  expire_at: 2,
  abandon_at: 3,
  created_at: 4,
  updated_at: 5,
} as const;

describe('Session', () => {
  describe('fromJSON', () => {
    it('sets agent to only sub, type, task_id and restricted and keeps the full actor when the actor has type "agent"', () => {
      const actor = { sub: 'agent_1', type: 'agent', task_id: 'task_1', restricted: true };
      const session = Session.fromJSON({ ...baseJSON, actor } as SessionJSON);

      expect(session.actor).toEqual(actor);
      expect(session.agent).toStrictEqual({ sub: 'agent_1', type: 'agent', task_id: 'task_1', restricted: true });
    });

    it('leaves agent task_id undefined when an agent actor has no task_id', () => {
      const actor = { sub: 'agent_1', type: 'agent' };
      const session = Session.fromJSON({ ...baseJSON, actor } as SessionJSON);

      expect(session.actor).toEqual(actor);
      expect(session.agent).toStrictEqual({ sub: 'agent_1', type: 'agent', task_id: undefined, restricted: false });
    });

    it.each([
      ['a number', { sub: 42, type: 'agent', task_id: 'task_1' }],
      ['missing', { type: 'agent', task_id: 'task_1' }],
      ['an empty string', { sub: '', type: 'agent', task_id: 'task_1' }],
    ])('sets agent sub to an empty string when the agent actor sub is %s', (_, actor) => {
      const session = Session.fromJSON({ ...baseJSON, actor } as unknown as SessionJSON);

      expect(session.actor).toEqual(actor);
      expect(session.agent).toStrictEqual({ sub: '', type: 'agent', task_id: 'task_1', restricted: false });
    });

    it('sets actor and a null agent for an impersonation session', () => {
      const actor = { sub: 'user_2' };
      const session = Session.fromJSON({ ...baseJSON, actor } as SessionJSON);

      expect(session.actor).toEqual(actor);
      expect(session.agent).toBeNull();
    });

    it('sets a null actor and a null agent when there is no actor', () => {
      const session = Session.fromJSON({ ...baseJSON, actor: null } as SessionJSON);

      expect(session.actor).toBeNull();
      expect(session.agent).toBeNull();
    });
  });
});
