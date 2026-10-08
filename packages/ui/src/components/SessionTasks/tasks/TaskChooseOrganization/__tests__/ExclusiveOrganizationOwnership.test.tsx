import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';

import { TaskChooseOrganization } from '..';
import { useTaskChooseOrganizationModel } from '../task-choose-organization.model';

const { createFixtures } = bindCreateFixtures('TaskChooseOrganization');
async function setup() {
  const result = await createFixtures(f => {
    f.withOrganizations();
    f.withForceOrganizationSelection();
    f.withUser({
      email_addresses: ['first@clerk.com'],
      create_organization_enabled: true,
      tasks: [{ key: 'choose-organization' }],
      organization_memberships: [{ id: 'org_exclusive', name: 'Exclusive', exclusive_membership: true }],
    });
  });
  result.props.setProps({ redirectUrlComplete: '/done' });
  return result;
}

const failure = () =>
  new ClerkAPIResponseError('Request failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Request failed', long_message: 'Please try again' }],
  });

describe('exclusive task organization ownership', () => {
  it('activates once and falls back to the form after a live failure', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValue(deferred.promise);
    const { findByRole } = render(<TaskChooseOrganization />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledOnce());
    await act(async () => {
      deferred.reject(failure());
      await Promise.resolve();
    });
    expect(await findByRole('textbox', { name: /name/i })).toBeInTheDocument();
    expect(fixtures.clerk.setActive).toHaveBeenCalledOnce();
  });

  it.each(['user', 'session', 'client'] as const)('rejects a captured command after %s changes', async resource => {
    const { wrapper, fixtures } = await setup();
    const { result } = renderHook(useTaskChooseOrganizationModel, { wrapper });
    const activate = result.current.activateExclusiveOrganization;
    const signOut = result.current.signOut;
    const previous = fixtures.clerk[resource];
    vi.spyOn(fixtures.clerk, resource, 'get').mockReturnValue({ ...previous, id: 'replacement' } as any);
    await activate();
    await signOut();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(fixtures.clerk.signOut).not.toHaveBeenCalled();
  });

  it.each([false, true])('allows navigation after closure only for the SDK transition (%s)', async transition => {
    const { wrapper, fixtures } = await setup();
    const originalSession = fixtures.clerk.session!;
    const originalUser = fixtures.clerk.user!;
    const deferred = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValue(deferred.promise);
    const { result, unmount } = renderHook(useTaskChooseOrganizationModel, { wrapper });
    const request = result.current.activateExclusiveOrganization();
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
    await request;
  });

  it.each(['user', 'session'] as const)('rejects navigation for a different callback %s', async resource => {
    const { wrapper, fixtures } = await setup();
    const originalSession = fixtures.clerk.session!;
    const originalUser = fixtures.clerk.user!;
    const deferred = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValue(deferred.promise);
    const { result } = renderHook(useTaskChooseOrganizationModel, { wrapper });
    const request = result.current.activateExclusiveOrganization();
    const { navigate } = fixtures.clerk.setActive.mock.calls[0][0];
    await navigate({
      session: {
        ...originalSession,
        id: resource === 'session' ? 'replacement' : originalSession.id,
        user: { ...originalUser, id: resource === 'user' ? 'replacement' : originalUser.id },
        currentTask: null,
      },
      decorateUrl: (url: string) => url,
    });
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
    deferred.resolve();
    await request;
  });

  it('starts a new activation after the rendered account changes', async () => {
    const { wrapper, fixtures } = await setup();
    const first = createDeferredPromise<void>();
    const second = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { rerender, queryByRole } = render(<TaskChooseOrganization />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledOnce());
    const replacement = { ...fixtures.clerk.user!, id: 'replacement' };
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(replacement);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources,
      user: replacement,
    };
    rerender(<TaskChooseOrganization />);
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(2));
    await act(async () => {
      first.reject(failure());
      await Promise.resolve();
    });
    expect(queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
    await act(async () => {
      second.resolve();
      await second.promise;
    });
  });

  it('suppresses a failure after the source closes', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValue(deferred.promise);
    const { result, unmount } = renderHook(useTaskChooseOrganizationModel, { wrapper });
    const request = result.current.activateExclusiveOrganization();
    unmount();
    deferred.reject(failure());
    await expect(request).resolves.toBeUndefined();
  });
});
