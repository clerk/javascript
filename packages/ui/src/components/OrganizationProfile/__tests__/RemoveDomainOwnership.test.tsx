import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearFetchCache } from '@/hooks/useFetch';
import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';

import { useRemoveDomainFormModel } from '../remove-domain-form.model';
import { RemoveDomainFormView } from '../remove-domain-form.view';
import { RemoveDomainForm } from '../RemoveDomainForm';
import { createFakeDomain } from './utils';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');
beforeEach(() => clearFetchCache());

async function setup(deleteEffect?: ReturnType<typeof vi.fn>) {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withOrganizations();
    f.withOrganizationDomains();
    f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
  });
  const organization = fixtures.clerk.organization!;
  const domain = createFakeDomain({ id: 'domain_1', name: 'clerk.com', organizationId: organization.id });
  domain.delete = deleteEffect || vi.fn().mockResolvedValue(domain);
  const getDomain = vi.spyOn(organization, 'getDomain').mockResolvedValue(domain);
  const getDomains = vi.spyOn(organization, 'getDomains').mockResolvedValue({ data: [domain], total_count: 1 });
  const hook = renderHook(() => useRemoveDomainFormModel('domain_1'), { wrapper });
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return { ...hook, wrapper, fixtures, domain, getDomain, getDomains };
}

describe('Remove domain ownership', () => {
  it('keeps resources private and returns a plain completion result', async () => {
    const { result, domain, getDomains } = await setup();
    const snapshot = result.current;
    domain.name = 'changed.com';
    expect(snapshot.domainName).toBe('clerk.com');
    expect(snapshot).not.toHaveProperty('domain');
    const fetches = getDomains.mock.calls.length;
    await expect(snapshot.deleteDomain()).resolves.toBe(true);
    expect(domain.delete).toHaveBeenCalledOnce();
    expect(getDomains.mock.calls.length).toBeGreaterThan(fetches);
  });

  it.each(['user', 'organization', 'session', 'client'] as const)(
    'blocks retained removal after the %s changes',
    async key => {
      const { result, domain, fixtures, getDomains } = await setup();
      const command = result.current.deleteDomain;
      const fetches = getDomains.mock.calls.length;
      vi.spyOn(fixtures.clerk, key, 'get').mockReturnValue({ ...fixtures.clerk[key]!, id: 'changed' });
      await expect(command()).resolves.toBe(false);
      expect(domain.delete).not.toHaveBeenCalled();
      expect(getDomains).toHaveBeenCalledTimes(fetches);
    },
  );

  it('does not refresh or report completion for an old scope after deletion', async () => {
    const completion = createDeferredPromise();
    const { result, domain, fixtures, getDomains } = await setup(vi.fn().mockReturnValue(completion.promise));
    const fetches = getDomains.mock.calls.length;
    const pending = result.current.deleteDomain();
    vi.spyOn(fixtures.clerk, 'organization', 'get').mockReturnValue({ ...fixtures.clerk.organization!, id: 'changed' });
    completion.resolve(domain);
    await expect(pending).resolves.toBe(false);
    expect(getDomains).toHaveBeenCalledTimes(fetches);
  });

  it('shows a cached name and reports rendered removal success only once', async () => {
    const { wrapper, domain, unmount } = await setup();
    unmount();
    const onSuccess = vi.fn();
    const { getByRole, getByText, userEvent } = render(
      <RemoveDomainForm
        domainId='domain_1'
        onSuccess={onSuccess}
        onReset={vi.fn()}
      />,
      { wrapper },
    );
    expect(getByText('The email domain clerk.com will be removed.')).toBeInTheDocument();
    await userEvent.click(getByRole('button', { name: 'Remove' }));
    expect(domain.delete).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('ignores an old rendered completion when the account changes during deletion', async () => {
    const completion = createDeferredPromise();
    const { wrapper, domain, fixtures, unmount } = await setup(vi.fn().mockReturnValue(completion.promise));
    unmount();
    const onSuccess = vi.fn();
    const props = { domainId: 'domain_1', onSuccess, onReset: vi.fn() };
    const { getByRole, userEvent, rerender } = render(<RemoveDomainForm {...props} />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Remove' }));
    const user = { ...fixtures.clerk.user!, id: 'user_second' };
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(user);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, user };
    rerender(<RemoveDomainForm {...props} />);
    await act(async () => {
      completion.resolve(domain);
      await completion.promise;
    });
    await waitFor(() => expect(getByRole('button', { name: 'Remove' })).not.toBeDisabled());
    expect(onSuccess).not.toHaveBeenCalled();
    expect(domain.delete).toHaveBeenCalledOnce();
  });

  it.each(['session', 'client', 'unmount', 'caller'] as const)(
    'does not refresh after deletion loses the %s',
    async loss => {
      const completion = createDeferredPromise();
      const { result, domain, fixtures, getDomains, unmount } = await setup(
        vi.fn().mockReturnValue(completion.promise),
      );
      const fetches = getDomains.mock.calls.length;
      let open = true;
      const pending = result.current.deleteDomain(() => open);
      expect(domain.delete).toHaveBeenCalledOnce();
      if (loss === 'unmount') {
        unmount();
      } else if (loss === 'caller') {
        open = false;
      } else {
        vi.spyOn(fixtures.clerk, loss, 'get').mockReturnValue({ ...fixtures.clerk[loss]!, id: 'changed' });
      }
      completion.resolve(domain);
      await expect(pending).resolves.toBe(false);
      expect(getDomains).toHaveBeenCalledTimes(fetches);
    },
  );

  it.each(['session', 'client', 'unmount', 'caller'] as const)(
    'ignores a late deletion error after losing the %s',
    async loss => {
      const completion = createDeferredPromise();
      const { result, fixtures, getDomains, unmount } = await setup(vi.fn().mockReturnValue(completion.promise));
      const fetches = getDomains.mock.calls.length;
      let open = true;
      const pending = result.current.deleteDomain(() => open);
      if (loss === 'unmount') {
        unmount();
      } else if (loss === 'caller') {
        open = false;
      } else {
        vi.spyOn(fixtures.clerk, loss, 'get').mockReturnValue({ ...fixtures.clerk[loss]!, id: 'changed' });
      }
      completion.reject(new Error('Old deletion failed'));
      await expect(pending).resolves.toBe(false);
      expect(getDomains).toHaveBeenCalledTimes(fetches);
    },
  );

  it('blocks a deletion when its caller is closed', async () => {
    const { result, domain } = await setup();
    await expect(result.current.deleteDomain(() => false)).resolves.toBe(false);
    expect(domain.delete).not.toHaveBeenCalled();
  });

  it('shows a read error and retries domain removal', async () => {
    const { wrapper, getDomain, domain, unmount } = await setup();
    unmount();
    clearFetchCache();
    getDomain.mockRejectedValueOnce(new Error('Domain could not be loaded')).mockResolvedValue(domain);
    const props = { domainId: 'domain_1', onSuccess: vi.fn(), onReset: vi.fn() };
    const { findByText, getByRole, userEvent } = render(<RemoveDomainForm {...props} />, { wrapper });
    expect(await findByText('Domain could not be loaded')).toBeInTheDocument();
    await userEvent.click(getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(getByRole('button', { name: 'Remove' })).toBeEnabled());
    expect(domain.delete).not.toHaveBeenCalled();
    expect(props.onSuccess).not.toHaveBeenCalled();
    expect(props.onReset).not.toHaveBeenCalled();
  });

  it.each(['session', 'client', 'unmount'] as const)(
    'blocks a domain reverification retry after losing the %s',
    async loss => {
      const effect = vi
        .fn()
        .mockRejectedValueOnce(
          new ClerkAPIResponseError('Reverification required', {
            status: 401,
            data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
          }),
        )
        .mockResolvedValue(undefined);
      const { wrapper, fixtures, getDomains, unmount } = await setup(effect);
      unmount();
      const open = vi.spyOn(fixtures.clerk, '__internal_openReverification').mockImplementation(() => undefined);
      const props = { domainId: 'domain_1', onSuccess: vi.fn(), onReset: vi.fn() };
      const view = render(<RemoveDomainForm {...props} />, { wrapper });
      const fetches = getDomains.mock.calls.length;
      await view.userEvent.click(view.getByRole('button', { name: 'Remove' }));
      await waitFor(() => expect(open).toHaveBeenCalledOnce());
      if (loss === 'unmount') {
        view.unmount();
      } else {
        vi.spyOn(fixtures.clerk, loss, 'get').mockReturnValue({ ...fixtures.clerk[loss]!, id: 'changed' });
      }
      await act(async () => {
        open.mock.calls[0][0].afterVerification!();
        await Promise.resolve();
      });
      expect(effect).toHaveBeenCalledOnce();
      expect(getDomains).toHaveBeenCalledTimes(fetches);
      expect(props.onSuccess).not.toHaveBeenCalled();
    },
  );

  it('resolves the latest domain resource before retrying reverification', async () => {
    const effect = vi.fn().mockRejectedValueOnce(
      new ClerkAPIResponseError('Reverification required', {
        status: 401,
        data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
      }),
    );
    const { result, wrapper, fixtures, domain, getDomain, unmount } = await setup(effect);
    const retryRead = result.current.retry;
    const open = vi.spyOn(fixtures.clerk, '__internal_openReverification').mockImplementation(() => undefined);
    const props = { domainId: 'domain_1', onSuccess: vi.fn(), onReset: vi.fn() };
    const view = render(<RemoveDomainForm {...props} />, { wrapper });
    await view.userEvent.click(view.getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    const replacement = { ...domain, name: 'current.com', delete: vi.fn().mockResolvedValue(undefined) };
    getDomain.mockResolvedValue(replacement);
    act(() => retryRead());
    await waitFor(() => expect(result.current.domainName).toBe('current.com'));
    await act(async () => {
      open.mock.calls[0][0].afterVerification!();
      await Promise.resolve();
    });
    await waitFor(() => expect(props.onSuccess).toHaveBeenCalledOnce());
    expect(effect).toHaveBeenCalledOnce();
    expect(replacement.delete).toHaveBeenCalledOnce();
    unmount();
  });

  it('does not refresh domains when only the removal form closes', async () => {
    const completion = createDeferredPromise();
    const { result, wrapper, domain, getDomains } = await setup(vi.fn().mockReturnValue(completion.promise));
    const onSuccess = vi.fn();
    const view = render(
      <RemoveDomainFormView
        data={result.current}
        onSuccess={onSuccess}
        onReset={vi.fn()}
      />,
      { wrapper },
    );
    const fetches = getDomains.mock.calls.length;
    await view.userEvent.click(view.getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(domain.delete).toHaveBeenCalledOnce());
    view.unmount();
    expect(result.current.canRun()).toBe(true);
    await act(async () => {
      completion.resolve(domain);
      await completion.promise;
    });
    expect(getDomains).toHaveBeenCalledTimes(fetches);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
