import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook } from '@/test/utils';

import { useOrganizationProfileFormModel } from '../profile-form.model';
import { ProfileForm } from '../ProfileForm';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');
async function setup() {
  return createFixtures(f => {
    f.withOrganizations();
    f.withOrganizationSlug(true);
    f.withUser({
      email_addresses: ['first@clerk.com'],
      organization_memberships: [
        { name: 'First organization', slug: 'first', role: 'admin', image_url: 'https://example.com/logo.png' },
      ],
    });
  });
}
const failure = () =>
  new ClerkAPIResponseError('Request failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Request failed', long_message: 'Please try again' }],
  });

describe('organization profile form ownership', () => {
  it.each(['user', 'session', 'client', 'organization'] as const)(
    'rejects captured commands after %s changes',
    async key => {
      const { wrapper, fixtures } = await setup();
      const callbacks = { onSuccess: vi.fn(), onReset: vi.fn() };
      const { result } = renderHook(() => useOrganizationProfileFormModel(callbacks), { wrapper });
      const model = result.current;
      if (model.status !== 'ready') {
        throw new Error('Expected ready profile');
      }
      const organization = fixtures.clerk.organization!;
      vi.spyOn(fixtures.clerk, key, 'get').mockReturnValue({ ...fixtures.clerk[key], id: 'replacement' } as any);
      await model.update({ name: 'Changed' });
      await model.setLogo(null);
      await model.complete();
      model.onReset();
      expect(organization.update).not.toHaveBeenCalled();
      expect(organization.setLogo).not.toHaveBeenCalled();
      expect(callbacks.onSuccess).not.toHaveBeenCalled();
      expect(callbacks.onReset).not.toHaveBeenCalled();
    },
  );

  it.each(['details', 'logo'] as const)('does not complete a late %s update after source closure', async kind => {
    const { wrapper, fixtures } = await setup();
    const callbacks = { onSuccess: vi.fn(), onReset: vi.fn() };
    const deferred = createDeferredPromise<any>();
    const method = kind === 'details' ? fixtures.clerk.organization!.update : fixtures.clerk.organization!.setLogo;
    method.mockReturnValue(deferred.promise);
    const { result, unmount } = renderHook(() => useOrganizationProfileFormModel(callbacks), { wrapper });
    const model = result.current;
    if (model.status !== 'ready') {
      throw new Error('Expected ready profile');
    }
    const request = kind === 'details' ? model.update({ name: 'Changed' }) : model.setLogo(null);
    unmount();
    deferred.resolve(fixtures.clerk.organization);
    await request;
    expect(callbacks.onSuccess).not.toHaveBeenCalled();
  });

  it('starts one details update for two submissions before rendering', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<any>();
    fixtures.clerk.organization!.update.mockReturnValue(deferred.promise);
    const callbacks = { onSuccess: vi.fn(), onReset: vi.fn() };
    const { getByLabelText, userEvent } = render(<ProfileForm {...callbacks} />, { wrapper });
    const name = getByLabelText(/^name/i);
    await userEvent.clear(name);
    await userEvent.type(name, 'Changed');
    const form = name.closest('form')!;
    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    expect(fixtures.clerk.organization!.update).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.resolve(fixtures.clerk.organization);
      await deferred.promise;
    });
    expect(callbacks.onSuccess).toHaveBeenCalledOnce();
  });

  it.each(['success', 'failure'] as const)('resets name, slug, and errors during an old %s', async outcome => {
    const { wrapper, fixtures } = await setup();
    const callbacks = { onSuccess: vi.fn(), onReset: vi.fn() };
    const deferred = createDeferredPromise<any>();
    fixtures.clerk.organization!.update.mockReturnValue(deferred.promise);
    const { getByLabelText, queryByText, rerender, userEvent } = render(<ProfileForm {...callbacks} />, { wrapper });
    const name = getByLabelText(/^name/i);
    await userEvent.clear(name);
    await userEvent.type(name, 'Changed');
    fireEvent.submit(name.closest('form')!);
    const replacement = {
      ...fixtures.clerk.organization!,
      id: 'replacement',
      name: 'Second organization',
      slug: 'second',
    };
    vi.spyOn(fixtures.clerk, 'organization', 'get').mockReturnValue(replacement);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources,
      organization: replacement,
    };
    rerender(<ProfileForm {...callbacks} />);
    expect(getByLabelText(/^name/i)).toHaveValue('Second organization');
    expect(getByLabelText(/^slug/i)).toHaveValue('second');
    await act(async () => {
      if (outcome === 'success') {
        deferred.resolve(replacement);
      } else {
        deferred.reject(failure());
      }
      await deferred.promise.catch(() => {});
    });
    expect(getByLabelText(/^name/i)).toHaveValue('Second organization');
    expect(queryByText('Please try again')).not.toBeInTheDocument();
    expect(callbacks.onSuccess).not.toHaveBeenCalled();
  });

  it('rejects an old command after leaving and returning to the same organization', async () => {
    const { wrapper, fixtures } = await setup();
    const callbacks = { onSuccess: vi.fn(), onReset: vi.fn() };
    const original = fixtures.clerk.organization!;
    const getter = vi.spyOn(fixtures.clerk, 'organization', 'get');
    const { result, rerender } = renderHook(() => useOrganizationProfileFormModel(callbacks), { wrapper });
    const oldModel = result.current;
    if (oldModel.status !== 'ready') {
      throw new Error('Expected ready profile');
    }
    const replacement = { ...original, id: 'replacement' };
    getter.mockReturnValue(replacement);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources,
      organization: replacement,
    };
    rerender();
    getter.mockReturnValue(original);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources,
      organization: original,
    };
    rerender();
    await oldModel.update({ name: 'Stale' });
    expect(original.update).not.toHaveBeenCalled();
  });
});
