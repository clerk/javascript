import { render } from '@testing-library/vue';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';

import { clerkPlugin } from '../../plugin';
import { useAuth } from '../useAuth';

vi.mock('@clerk/shared/loadClerkJsScript', () => ({
  loadClerkJSScript: () => new Promise(() => {}),
  loadClerkUIScript: () => new Promise(() => {}),
}));

describe('useAuth', () => {
  it('exposes the agent from the initial state', () => {
    const agent = { sub: 'agt_1', type: 'agent', task_id: 'agttsk_1' };
    let auth: ReturnType<typeof useAuth> | undefined;

    const Component = defineComponent(() => {
      auth = useAuth();
      return () => null;
    });

    render(Component, {
      global: {
        plugins: [
          [
            clerkPlugin,
            {
              publishableKey: 'pk_test_xxx',
              initialState: {
                sessionId: 'sess_1',
                sessionStatus: 'active',
                sessionClaims: { __raw: '', exp: 1, iat: 1, iss: '', nbf: 1, sid: 'sess_1', sub: 'user_1' },
                userId: 'user_1',
                agent,
              },
            },
          ],
        ],
      },
    });

    expect(auth?.agent.value).toEqual(agent);
  });
});
