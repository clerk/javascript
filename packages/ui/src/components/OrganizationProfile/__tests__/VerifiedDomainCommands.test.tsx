import { createDeferredPromise } from '@clerk/shared/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearFetchCache } from '@/hooks/useFetch';
import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';

import { useVerifiedDomainFormModel } from '../verified-domain-form.model';
import { VerifiedDomainForm } from '../VerifiedDomainForm';
import { createFakeDomain } from './utils';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

beforeEach(() => clearFetchCache());

async function setup() {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withOrganizations();
    f.withOrganizationDomains();
    f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
  });
  const organization = fixtures.clerk.organization!;
  const domain = createFakeDomain({
    id: 'domain_1',
    name: 'clerk.com',
    organizationId: organization.id,
    verification: { status: 'verified', strategy: 'email_code', attempts: 0, expiresAt: new Date() },
    totalPendingInvitations: 2,
    totalPendingSuggestions: 7,
  });
  domain.updateEnrollmentMode = vi.fn().mockResolvedValue(domain);
  const getDomain = vi.spyOn(organization, 'getDomain').mockResolvedValue(domain);
  const getDomains = vi.spyOn(organization, 'getDomains').mockResolvedValue({ data: [domain], total_count: 1 });
  const hook = renderHook(() => useVerifiedDomainFormModel('domain_1'), { wrapper });
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return { ...hook, wrapper, fixtures, domain, getDomain, getDomains };
}

describe('Verified domain command ownership', () => {
  it.each(['user', 'session', 'client'] as const)('resets form selections when the %s changes', async key => {
    const { wrapper, fixtures, unmount } = await setup();
    unmount();
    const props = { domainId: 'domain_1', onSuccess: vi.fn(), onReset: vi.fn() };
    const { getByRole, userEvent, rerender } = render(<VerifiedDomainForm {...props} />, { wrapper });
    const checkbox = getByRole('checkbox');
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    const resource = { ...fixtures.clerk[key]!, id: 'changed' };
    vi.spyOn(fixtures.clerk, key, 'get').mockReturnValue(resource);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      [key]: resource,
    };
    rerender(<VerifiedDomainForm {...props} />);
    await waitFor(() => expect(getByRole('checkbox')).not.toBeChecked());
    expect(props.onSuccess).not.toHaveBeenCalled();
    expect(props.onReset).not.toHaveBeenCalled();
  });

  it('copies domain data and discards the SDK update result', async () => {
    const { result, domain, getDomain, getDomains } = await setup();
    const snapshot = result.current.domain;
    domain.name = 'changed.com';
    domain.totalPendingSuggestions = 100;
    expect(snapshot).toMatchObject({ name: 'clerk.com', totalPendingInvitations: 2, totalPendingSuggestions: 7 });
    expect(snapshot).not.toHaveProperty('updateEnrollmentMode');
    const previousFetches = getDomains.mock.calls.length;
    await expect(result.current.updateEnrollmentMode('automatic_invitation', true)).resolves.toBe(true);
    expect(domain.updateEnrollmentMode).toHaveBeenCalledExactlyOnceWith({
      enrollmentMode: 'automatic_invitation',
      deletePending: true,
    });
    expect(getDomains.mock.calls.length).toBeGreaterThan(previousFetches);
    expect(getDomain).toHaveBeenCalledWith({ domainId: 'domain_1' });
  });

  it.each(['user', 'organization', 'session', 'client'] as const)(
    'blocks a retained update after the %s changes',
    async key => {
      const { result, fixtures, domain, getDomains } = await setup();
      const command = result.current.updateEnrollmentMode;
      const previousFetches = getDomains.mock.calls.length;
      vi.spyOn(fixtures.clerk, key, 'get').mockReturnValue({ ...fixtures.clerk[key]!, id: 'changed' });
      await expect(command('automatic_invitation', false)).resolves.toBe(false);
      expect(domain.updateEnrollmentMode).not.toHaveBeenCalled();
      expect(getDomains).toHaveBeenCalledTimes(previousFetches);
    },
  );

  it('does not refresh or report success after the scope changes during mutation', async () => {
    const { result, fixtures, domain, getDomains } = await setup();
    const completion = createDeferredPromise<typeof domain>();
    vi.mocked(domain.updateEnrollmentMode).mockReturnValue(completion.promise);
    const previousFetches = getDomains.mock.calls.length;
    const pending = result.current.updateEnrollmentMode('manual_invitation', true);
    vi.spyOn(fixtures.clerk, 'organization', 'get').mockReturnValue({
      ...fixtures.clerk.organization!,
      id: 'org_second',
    });
    completion.resolve(domain);
    await expect(pending).resolves.toBe(false);
    expect(getDomains).toHaveBeenCalledTimes(previousFetches);
  });

  it('uses a different fetch cache when the account changes', async () => {
    const { result, fixtures, domain, getDomain, rerender } = await setup();
    const scope = result.current.scope;
    const user = { ...fixtures.clerk.user!, id: 'user_second' };
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(user);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, user };
    getDomain.mockResolvedValue({ ...domain, name: 'new-account.com' });
    rerender();
    expect(result.current.scope).not.toBe(scope);
    expect(result.current.domain).toBeNull();
    await waitFor(() => expect(result.current.domain?.name).toBe('new-account.com'));
    expect(getDomain).toHaveBeenCalledTimes(2);
  });

  it.each(['session', 'client', 'unmount', 'caller'] as const)(
    'does not refresh after losing the %s during an update',
    async loss => {
      const { result, fixtures, domain, getDomains, unmount } = await setup();
      const completion = createDeferredPromise<typeof domain>();
      vi.mocked(domain.updateEnrollmentMode).mockReturnValue(completion.promise);
      const previousFetches = getDomains.mock.calls.length;
      let open = true;
      const pending = result.current.updateEnrollmentMode('manual_invitation', true, () => open);
      expect(domain.updateEnrollmentMode).toHaveBeenCalledOnce();
      if (loss === 'unmount') {
        unmount();
      } else if (loss === 'caller') {
        open = false;
      } else {
        vi.spyOn(fixtures.clerk, loss, 'get').mockReturnValue({ ...fixtures.clerk[loss]!, id: 'changed' });
      }
      completion.resolve(domain);
      await expect(pending).resolves.toBe(false);
      expect(getDomains).toHaveBeenCalledTimes(previousFetches);
    },
  );

  it.each(['session', 'client', 'unmount', 'caller'] as const)(
    'ignores update errors after losing the %s',
    async loss => {
      const { result, fixtures, domain, getDomains, unmount } = await setup();
      const completion = createDeferredPromise<typeof domain>();
      vi.mocked(domain.updateEnrollmentMode).mockReturnValue(completion.promise);
      const previousFetches = getDomains.mock.calls.length;
      let open = true;
      const pending = result.current.updateEnrollmentMode('manual_invitation', true, () => open);
      if (loss === 'unmount') {
        unmount();
      } else if (loss === 'caller') {
        open = false;
      } else {
        vi.spyOn(fixtures.clerk, loss, 'get').mockReturnValue({ ...fixtures.clerk[loss]!, id: 'changed' });
      }
      completion.reject(new Error('Old update failed'));
      await expect(pending).resolves.toBe(false);
      expect(getDomains).toHaveBeenCalledTimes(previousFetches);
    },
  );

  it('blocks retained commands after unmount', async () => {
    const { result, domain, unmount } = await setup();
    const update = result.current.updateEnrollmentMode;
    unmount();
    await expect(update('automatic_invitation', false)).resolves.toBe(false);
    expect(domain.updateEnrollmentMode).not.toHaveBeenCalled();
  });

  it('invalidates a retained command when a session changes and returns', async () => {
    const { result, fixtures, domain, rerender } = await setup();
    const update = result.current.updateEnrollmentMode;
    const original = fixtures.clerk.session!;
    const session = { ...original, id: 'session_second' };
    const getter = vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(session);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, session };
    rerender();
    getter.mockReturnValue(original);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources,
      session: original,
    };
    rerender();
    await expect(update('automatic_invitation', false)).resolves.toBe(false);
    expect(domain.updateEnrollmentMode).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await expect(result.current.updateEnrollmentMode('automatic_invitation', false)).resolves.toBe(true);
    expect(domain.updateEnrollmentMode).toHaveBeenCalledOnce();
  });

  it('shows a failed read and retries without resetting the form', async () => {
    const { wrapper, getDomain, domain, unmount } = await setup();
    unmount();
    clearFetchCache();
    getDomain.mockRejectedValueOnce(new Error('Domain could not be loaded')).mockResolvedValue(domain);
    const props = { domainId: 'domain_1', onSuccess: vi.fn(), onReset: vi.fn() };
    const { findByText, getByRole, userEvent } = render(<VerifiedDomainForm {...props} />, { wrapper });
    expect(await findByText('Domain could not be loaded')).toBeInTheDocument();
    expect(props.onReset).not.toHaveBeenCalled();
    await userEvent.click(getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(getByRole('checkbox')).toBeInTheDocument());
    expect(props.onReset).not.toHaveBeenCalled();
    expect(props.onSuccess).not.toHaveBeenCalled();
  });

  it('does not replace a new session read with an old session result', async () => {
    const { wrapper, fixtures, getDomain, domain, unmount } = await setup();
    unmount();
    clearFetchCache();
    const first = createDeferredPromise<typeof domain>();
    getDomain.mockReturnValueOnce(first.promise).mockResolvedValue({ ...domain, name: 'current.com' });
    const hook = renderHook(() => useVerifiedDomainFormModel('domain_1'), { wrapper });
    await waitFor(() => expect(getDomain).toHaveBeenCalledTimes(2));
    const session = { ...fixtures.clerk.session!, id: 'session_second' };
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(session);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, session };
    hook.rerender();
    await waitFor(() => expect(hook.result.current.domain?.name).toBe('current.com'));
    await act(async () => {
      first.resolve({ ...domain, name: 'old.com' });
      await first.promise;
    });
    await new Promise(resolve => setTimeout(resolve, 5));
    expect(hook.result.current.domain?.name).toBe('current.com');
  });
});
