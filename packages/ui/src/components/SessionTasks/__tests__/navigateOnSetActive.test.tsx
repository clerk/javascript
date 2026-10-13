import type { SessionResource } from '@clerk/shared/types';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';
import { SessionTasksContext, useSessionTasksContext } from '@/ui/contexts/components/SessionTasks';

const { createFixtures } = bindCreateFixtures('SignIn');

const NavigateToNextTask = ({ redirectUrlComplete }: { redirectUrlComplete: string }) => {
  const { navigateOnSetActive } = useSessionTasksContext();
  useEffect(() => {
    void navigateOnSetActive({
      session: { currentTask: { key: 'force-enterprise-sso' } } as SessionResource,
      redirectUrlComplete,
      decorateUrl: url => url,
    });
  }, [navigateOnSetActive, redirectUrlComplete]);
  return null;
};

describe('navigateOnSetActive', () => {
  it("sends the next task to the flow's destination, not back to the task that just finished", async () => {
    const { wrapper, fixtures } = await createFixtures(f =>
      f.withUser({ email_addresses: ['bart@gmail.com'], tasks: [{ key: 'force-enterprise-sso' }] }),
    );
    vi.spyOn(fixtures.clerk, 'buildSignInUrl').mockImplementation(
      (options?: { redirectUrl?: string }) =>
        `http://localhost/sign-in?redirect_url=${encodeURIComponent(options?.redirectUrl ?? 'http://localhost/sign-in/tasks/choose-organization')}`,
    );

    render(
      <SessionTasksContext.Provider value={{ redirectUrlComplete: 'http://localhost/dashboard' }}>
        <NavigateToNextTask redirectUrlComplete='http://localhost/dashboard' />
      </SessionTasksContext.Provider>,
      { wrapper },
    );

    await waitFor(() => expect(fixtures.router.navigate).toHaveBeenCalled());
    const nextTaskUrl = new URL(fixtures.router.navigate.mock.calls[0][0]);
    expect(nextTaskUrl.pathname + nextTaskUrl.hash).toBe('/sign-in#/tasks/force-enterprise-sso');
    expect(nextTaskUrl.searchParams.get('redirect_url')).toBe('http://localhost/dashboard');
  });
});
