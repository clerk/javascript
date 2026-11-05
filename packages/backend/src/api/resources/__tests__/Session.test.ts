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
    it('sets agent and keeps actor when the actor has type "agent"', () => {
      const actor = { sub: 'agent_1', type: 'agent', task_id: 'task_1' };
      const session = Session.fromJSON({ ...baseJSON, actor } as SessionJSON);

      expect(session.actor).toEqual(actor);
      expect(session.agent).toEqual(actor);
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
