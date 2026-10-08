import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { renderHook, waitFor } from '@/test/utils';
import { createFakeUserOrganizationMembership } from '@/ui/components/OrganizationSwitcher/__tests__/test-utils';

import { useChooseOrganizationScreenModel } from '../choose-organization-screen.model';

const { createFixtures } = bindCreateFixtures('TaskChooseOrganization');
async function setup() {
  const result = await createFixtures(f => {
    f.withOrganizations();
    f.withForceOrganizationSelection();
    f.withUser({ email_addresses: ['first@clerk.com'], tasks: [{ key: 'choose-organization' }] });
  });
  result.props.setProps({ redirectUrlComplete: '/done' });
  const membership = createFakeUserOrganizationMembership({
    id: 'mem_1',
    organization: {
      id: 'org_1',
      name: 'First organization',
      slug: 'first',
      membersCount: 1,
      pendingInvitationsCount: 0,
      adminDeleteEnabled: false,
      maxAllowedMemberships: 3,
    },
  });
  result.fixtures.clerk.user?.getOrganizationMemberships.mockResolvedValue({ data: [membership], total_count: 1 });
  const hook = renderHook(useChooseOrganizationScreenModel, { wrapper: result.wrapper });
  await waitFor(() => expect(hook.result.current.memberships).toHaveLength(1));
  return { ...result, ...hook, membership };
}

const failure = () =>
  new ClerkAPIResponseError('Request failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Request failed', long_message: 'Please try again' }],
  });

describe('task organization membership ownership', () => {
  it.each(['user', 'session', 'client'] as const)('rejects a captured activation after %s changes', async key => {
    const { result, fixtures } = await setup();
    const activate = result.current.memberships[0].activate;
    vi.spyOn(fixtures.clerk, key, 'get').mockReturnValue({ ...fixtures.clerk[key], id: 'replacement' } as any);
    await expect(activate()).resolves.toBe('inactive');
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('starts one activation before React renders again', async () => {
    const { result, fixtures, membership } = await setup();
    const deferred = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValue(deferred.promise);
    const first = result.current.memberships[0].activate();
    await expect(result.current.memberships[0].activate()).resolves.toBe('inactive');
    expect(fixtures.clerk.setActive).toHaveBeenCalledOnce();
    expect(fixtures.clerk.setActive).toHaveBeenCalledWith(
      expect.objectContaining({ organization: membership.organization }),
    );
    deferred.resolve();
    await expect(first).resolves.toBe('success');
  });

  it.each([false, true])('allows navigation after closure only for the SDK transition (%s)', async transition => {
    const { result, fixtures, unmount } = await setup();
    const originalSession = fixtures.clerk.session!;
    const originalUser = fixtures.clerk.user!;
    const deferred = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValue(deferred.promise);
    const request = result.current.memberships[0].activate();
    const { navigate } = fixtures.clerk.setActive.mock.calls[0][0];
    if (transition) {
      fixtures.clerk.__internal_setActiveInProgress = true;
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(undefined);
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(undefined);
    }
    unmount();
    await navigate({
      session: { ...originalSession, user: originalUser, currentTask: null },
      decorateUrl: (url: string) => url,
    });
    expect(fixtures.router.navigate).toHaveBeenCalledTimes(transition ? 1 : 0);
    deferred.resolve();
    await expect(request).resolves.toBe('inactive');
  });

  it('preserves navigation through a rendered SDK transition', async () => {
    const { result, fixtures, rerender, unmount } = await setup();
    const originalSession = fixtures.clerk.session!;
    const originalUser = fixtures.clerk.user!;
    const deferred = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValue(deferred.promise);
    const request = result.current.memberships[0].activate();
    const { navigate } = fixtures.clerk.setActive.mock.calls[0][0];
    fixtures.clerk.__internal_setActiveInProgress = true;
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(undefined);
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(undefined);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources,
      user: undefined,
      session: undefined,
    };
    rerender();
    unmount();
    await navigate({
      session: { ...originalSession, user: originalUser, currentTask: null },
      decorateUrl: (url: string) => url,
    });
    expect(fixtures.router.navigate).toHaveBeenCalledWith('/done');
    deferred.resolve();
    await request;
  });

  it.each(['user', 'session'] as const)('rejects a mismatched callback %s', async key => {
    const { result, fixtures } = await setup();
    const originalSession = fixtures.clerk.session!;
    const originalUser = fixtures.clerk.user!;
    const deferred = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValue(deferred.promise);
    const request = result.current.memberships[0].activate();
    const { navigate } = fixtures.clerk.setActive.mock.calls[0][0];
    await navigate({
      session: {
        ...originalSession,
        id: key === 'session' ? 'replacement' : originalSession.id,
        user: { ...originalUser, id: key === 'user' ? 'replacement' : originalUser.id },
        currentTask: null,
      },
      decorateUrl: (url: string) => url,
    });
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
    deferred.resolve();
    await request;
  });

  it('suppresses a late failure after source closure', async () => {
    const { result, fixtures, unmount } = await setup();
    const deferred = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValue(deferred.promise);
    const request = result.current.memberships[0].activate();
    unmount();
    deferred.reject(failure());
    await expect(request).resolves.toBe('inactive');
  });

  it('keeps a live failure available for the controller', async () => {
    const { result, fixtures } = await setup();
    const error = failure();
    fixtures.clerk.setActive.mockRejectedValue(error);
    await expect(result.current.memberships[0].activate()).resolves.toEqual({ error });
  });
});
