import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { renderHook } from '@/test/utils';

import { useAuthCodeRequestScopeModel } from '../auth-code-request-scope.model';

describe.each(['signIn', 'signUp'] as const)('%s code request scope', flow => {
  const setup = async () => {
    const { createFixtures } = bindCreateFixtures(flow === 'signIn' ? 'SignIn' : 'SignUp');
    const { wrapper, fixtures } = await createFixtures();
    const resource = flow === 'signIn' ? fixtures.signIn : fixtures.signUp;
    resource.id = 'attempt_1';
    const hook = renderHook(({ target }) => useAuthCodeRequestScopeModel(flow, resource, target), {
      wrapper,
      initialProps: { target: 'factor_1' },
    });
    return { ...hook, fixtures, resource };
  };

  it.each(['user', 'session', 'client', 'organization'] as const)(
    'blocks commands after the canonical %s changes before render',
    async field => {
      const { result, fixtures } = await setup();
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field], id: 'other' } as never);
      const command = vi.fn(() => Promise.resolve());
      await result.current.run(command);
      expect(command).not.toHaveBeenCalled();
    },
  );

  it('adopts the first assigned attempt ID without changing its key and rejects the next ID', async () => {
    const { result, resource, rerender } = await setup();
    resource.id = undefined;
    rerender({ target: 'factor_1' });
    const previous = result.current;
    await previous.run(() => {
      resource.id = 'attempt_assigned';
      return Promise.resolve();
    });
    rerender({ target: 'factor_1' });
    expect(result.current.requestKey).toBe(previous.requestKey);
    expect(previous.canRun()).toBe(true);
    resource.id = 'attempt_other';
    expect(previous.canRun()).toBe(false);
  });

  it('does not revive a retained command when a previous factor returns', async () => {
    const { result, rerender } = await setup();
    const previous = result.current;
    rerender({ target: 'factor_2' });
    rerender({ target: 'factor_1' });
    expect(previous.canRun()).toBe(false);
    expect(result.current.canRun()).toBe(true);
  });

  it('blocks commands from a closed card', async () => {
    const { result, unmount } = await setup();
    const previous = result.current;
    const command = vi.fn(() => Promise.resolve());
    unmount();
    await previous.run(command);
    expect(command).not.toHaveBeenCalled();
  });
});
