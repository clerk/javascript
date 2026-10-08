import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, renderHook, waitFor } from '@/test/utils';

import { useAddDomainFormModel } from '../add-domain-form.model';
import { AddDomainForm } from '../AddDomainForm';
import { createFakeDomain } from './utils';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');
async function setup() {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withOrganizations();
    f.withOrganizationDomains();
    f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
  });
  const organization = fixtures.clerk.organization!;
  const domain = createFakeDomain({ id: 'domain_1', name: 'clerk.com', organizationId: organization.id });
  const createDomain = vi.spyOn(organization, 'createDomain').mockResolvedValue(domain);
  const getDomains = vi.spyOn(organization, 'getDomains').mockResolvedValue({ data: [], total_count: 0 });
  const hook = renderHook(() => useAddDomainFormModel(), { wrapper });
  await waitFor(() => expect(getDomains).toHaveBeenCalledOnce());
  return { ...hook, wrapper, fixtures, domain, createDomain, getDomains };
}

describe('Add domain command boundaries', () => {
  it('returns a copied domain result and refreshes the current query', async () => {
    const { result, domain, createDomain, getDomains } = await setup();
    const fetches = getDomains.mock.calls.length;
    const created = await result.current.createDomain('clerk.com');
    expect(created).toEqual({ id: 'domain_1', isVerified: false });
    domain.id = 'changed';
    expect(created!.id).toBe('domain_1');
    expect(createDomain).toHaveBeenCalledExactlyOnceWith('clerk.com');
    expect(getDomains.mock.calls.length).toBeGreaterThan(fetches);
    await expect(result.current.refreshDomains()).resolves.toBe(true);
    expect(result.current).not.toHaveProperty('organization');
    expect(result.current).not.toHaveProperty('domains');
  });

  it.each(['user', 'organization'] as const)('blocks retained creation and refresh after the %s changes', async key => {
    const { result, fixtures, createDomain, getDomains } = await setup();
    const commands = result.current;
    const fetches = getDomains.mock.calls.length;
    vi.spyOn(fixtures.clerk, key, 'get').mockReturnValue({ ...fixtures.clerk[key]!, id: 'changed' });
    await expect(commands.createDomain('clerk.com')).resolves.toBeUndefined();
    await expect(commands.refreshDomains()).resolves.toBe(false);
    expect(createDomain).not.toHaveBeenCalled();
    expect(getDomains).toHaveBeenCalledTimes(fetches);
  });

  it('does not refresh or return a created domain from a previous scope', async () => {
    const { result, fixtures, createDomain, getDomains, domain } = await setup();
    const completion = createDeferredPromise();
    createDomain.mockReturnValue(completion.promise as Promise<typeof domain>);
    const fetches = getDomains.mock.calls.length;
    const pending = result.current.createDomain('clerk.com');
    vi.spyOn(fixtures.clerk, 'organization', 'get').mockReturnValue({ ...fixtures.clerk.organization!, id: 'changed' });
    completion.resolve(domain);
    await expect(pending).resolves.toBeUndefined();
    expect(getDomains).toHaveBeenCalledTimes(fetches);
  });

  it('clears a rendered domain name when the active account changes', async () => {
    const { wrapper, fixtures, unmount } = await setup();
    unmount();
    const props = { onSuccess: vi.fn(), onReset: vi.fn() };
    const { getByRole, userEvent, rerender } = render(<AddDomainForm {...props} />, { wrapper });
    const input = getByRole('textbox');
    await userEvent.type(input, 'old.com');
    expect(input).toHaveValue('old.com');
    const user = { ...fixtures.clerk.user!, id: 'user_second' };
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(user);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, user };
    rerender(<AddDomainForm {...props} />);
    expect(getByRole('textbox')).toHaveValue('');
  });
});
