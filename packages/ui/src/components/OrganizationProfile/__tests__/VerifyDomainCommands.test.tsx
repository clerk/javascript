import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearFetchCache } from '@/hooks/useFetch';
import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { useVerifiedDomainFormModel } from '../verified-domain-form.model';
import { useVerifyDomainFormController } from '../verify-domain-form.controller';
import { useVerifyDomainFormModel } from '../verify-domain-form.model';
import { VerifyDomainFormView } from '../verify-domain-form.view';
import { VerifyDomainForm } from '../VerifyDomainForm';
import { createFakeDomain } from './utils';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');
beforeEach(() => clearFetchCache());

async function setup(completion?: Promise<unknown>) {
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
    verification: { status: 'unverified', strategy: 'email_code', attempts: 0, expiresAt: new Date() },
  });
  domain.prepareAffiliationVerification = vi.fn().mockImplementation(() => completion || Promise.resolve(domain));
  domain.attemptAffiliationVerification = vi
    .fn()
    .mockImplementation(
      () => completion || Promise.resolve({ ...domain, verification: { ...domain.verification!, status: 'verified' } }),
    );
  const getDomain = vi.spyOn(organization, 'getDomain').mockResolvedValue(domain);
  vi.spyOn(organization, 'getDomains').mockResolvedValue({ data: [domain], total_count: 1 });
  const hook = renderHook(() => useVerifyDomainFormModel('domain_1', false), { wrapper });
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return { ...hook, wrapper, fixtures, domain, getDomain };
}

describe('Domain verification command boundaries', () => {
  it('updates the private cache before enrollment reads the verified domain', async () => {
    const { result, wrapper } = await setup();
    const enrollment = renderHook(() => useVerifiedDomainFormModel('domain_1'), { wrapper });
    expect(enrollment.result.current.domain?.isVerified).toBe(false);
    await act(() => result.current.attempt('123456'));
    expect(enrollment.result.current.domain?.isVerified).toBe(true);
  });

  it('copies display values and discards SDK verification results', async () => {
    const { result, domain } = await setup();
    const snapshot = result.current;
    domain.name = 'changed.com';
    expect(snapshot.domainName).toBe('clerk.com');
    expect(snapshot).not.toHaveProperty('domain');
    await expect(snapshot.prepare('admin@clerk.com')).resolves.toBe(true);
    await expect(snapshot.attempt('123456')).resolves.toBe(true);
    expect(domain.prepareAffiliationVerification).toHaveBeenCalledExactlyOnceWith({
      affiliationEmailAddress: 'admin@clerk.com',
    });
    expect(domain.attemptAffiliationVerification).toHaveBeenCalledExactlyOnceWith({ code: '123456' });
  });

  it.each(['user', 'organization', 'session', 'client'] as const)(
    'blocks retained commands after the %s changes',
    async key => {
      const { result, domain, fixtures } = await setup();
      const commands = result.current;
      vi.spyOn(fixtures.clerk, key, 'get').mockReturnValue({ ...fixtures.clerk[key]!, id: 'changed' });
      await expect(commands.prepare('admin@clerk.com')).resolves.toBe(false);
      await expect(commands.attempt('123456')).resolves.toBeUndefined();
      expect(domain.prepareAffiliationVerification).not.toHaveBeenCalled();
      expect(domain.attemptAffiliationVerification).not.toHaveBeenCalled();
    },
  );

  it('withholds late command results after the scope changes', async () => {
    const completion = createDeferredPromise();
    const { result, domain, fixtures } = await setup(completion.promise);
    const preparing = result.current.prepare('admin@clerk.com');
    const attempting = result.current.attempt('123456');
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'changed' });
    completion.resolve(domain);
    await expect(preparing).resolves.toBe(false);
    await expect(attempting).resolves.toBeUndefined();
  });

  it('resets a rendered email prefix when the account changes', async () => {
    const { wrapper, fixtures, unmount } = await setup();
    unmount();
    const props = { domainId: 'domain_1', skipToVerified: false, onSuccess: vi.fn(), onReset: vi.fn() };
    const { getByRole, userEvent, rerender } = render(<VerifyDomainForm {...props} />, { wrapper });
    const input = getByRole('textbox');
    await userEvent.type(input, 'old-prefix');
    expect(input).toHaveValue('old-prefix');
    const user = { ...fixtures.clerk.user!, id: 'user_second' };
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(user);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, user };
    rerender(<VerifyDomainForm {...props} />);
    await waitFor(() => expect(getByRole('textbox')).toHaveValue(''));
    expect(props.onSuccess).not.toHaveBeenCalled();
  });

  it.each(['session', 'client', 'unmount'] as const)(
    'does not write verification results after losing the %s',
    async loss => {
      const completion = createDeferredPromise();
      const { result, domain, fixtures, unmount } = await setup(completion.promise);
      const preparing = result.current.prepare('admin@clerk.com');
      const attempting = result.current.attempt('123456');
      expect(domain.prepareAffiliationVerification).toHaveBeenCalledOnce();
      expect(domain.attemptAffiliationVerification).toHaveBeenCalledOnce();
      if (loss === 'unmount') {
        unmount();
      } else {
        vi.spyOn(fixtures.clerk, loss, 'get').mockReturnValue({ ...fixtures.clerk[loss]!, id: 'changed' });
      }
      completion.resolve({ ...domain, name: 'late.com' });
      await expect(preparing).resolves.toBe(false);
      await expect(attempting).resolves.toBeUndefined();
    },
  );

  it('shares the verified result with a newly mounted enrollment form after an account switch', async () => {
    const { result, wrapper, fixtures, getDomain, rerender } = await setup();
    const user = { ...fixtures.clerk.user!, id: 'user_second' };
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(user);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, user };
    rerender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => result.current.attempt('123456'));
    const fetches = getDomain.mock.calls.length;
    const enrollment = renderHook(() => useVerifiedDomainFormModel('domain_1'), { wrapper });
    expect(enrollment.result.current.domain?.isVerified).toBe(true);
    expect(getDomain).toHaveBeenCalledTimes(fetches);
  });

  it.each(['prepare', 'attempt'] as const)('blocks %s when its caller is already closed', async action => {
    const { result, domain } = await setup();
    if (action === 'prepare') {
      await expect(result.current.prepare('admin@clerk.com', () => false)).resolves.toBe(false);
    } else {
      await expect(result.current.attempt('123456', () => false)).resolves.toBeUndefined();
    }
    expect(domain.prepareAffiliationVerification).not.toHaveBeenCalled();
    expect(domain.attemptAffiliationVerification).not.toHaveBeenCalled();
  });

  it.each(['prepare', 'attempt'] as const)('does not cache a late %s result after its caller closes', async action => {
    const { result, domain } = await setup();
    const completion = createDeferredPromise<typeof domain>();
    vi.mocked(domain.prepareAffiliationVerification).mockReturnValue(completion.promise);
    vi.mocked(domain.attemptAffiliationVerification).mockReturnValue(completion.promise);
    let open = true;
    const pending =
      action === 'prepare'
        ? result.current.prepare('admin@clerk.com', () => open)
        : result.current.attempt('123456', () => open);
    open = false;
    await act(async () => {
      completion.resolve({ ...domain, name: 'late.com' });
      await pending;
    });
    expect(result.current.domainName).toBe('clerk.com');
    await expect(pending).resolves.toBe(action === 'prepare' ? false : undefined);
  });

  it.each(['prepare', 'attempt'] as const)(
    'invalidates retained %s commands after skipping and returning',
    async action => {
      const { wrapper, domain, unmount } = await setup();
      unmount();
      const hook = renderHook(({ skip }) => useVerifyDomainFormModel('domain_1', skip), {
        wrapper,
        initialProps: { skip: false },
      });
      const retained = hook.result.current;
      hook.rerender({ skip: true });
      hook.rerender({ skip: false });
      if (action === 'prepare') {
        await expect(retained.prepare('admin@clerk.com')).resolves.toBe(false);
      } else {
        await expect(retained.attempt('123456')).resolves.toBeUndefined();
      }
      expect(domain.prepareAffiliationVerification).not.toHaveBeenCalled();
      expect(domain.attemptAffiliationVerification).not.toHaveBeenCalled();
    },
  );

  it('does not cache a preparation result when only its controller closes', async () => {
    const { result, domain, wrapper: Fixture } = await setup();
    const completion = createDeferredPromise<typeof domain>();
    vi.mocked(domain.prepareAffiliationVerification).mockReturnValue(completion.promise);
    const onSuccess = vi.fn();
    const wrapper = ({ children }: PropsWithChildren) => (
      <Fixture>
        <CardStateProvider>{children}</CardStateProvider>
      </Fixture>
    );
    const controller = renderHook(() => useVerifyDomainFormController(result.current, false, onSuccess), { wrapper });
    act(() => controller.result.current.emailField.setValue('admin'));
    let pending!: Promise<void>;
    act(() => {
      pending = controller.result.current.onSubmitPrepare();
    });
    await waitFor(() => expect(domain.prepareAffiliationVerification).toHaveBeenCalledOnce());
    controller.unmount();
    expect(result.current.canRun()).toBe(true);
    await act(async () => {
      completion.resolve({ ...domain, name: 'late.com' });
      await pending;
    });
    expect(result.current.domainName).toBe('clerk.com');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows a read error and retries the verification form', async () => {
    const { wrapper, domain, getDomain, unmount } = await setup();
    unmount();
    clearFetchCache();
    getDomain.mockRejectedValueOnce(new Error('Domain read failed')).mockResolvedValue(domain);
    const props = { domainId: 'domain_1', skipToVerified: false, onSuccess: vi.fn(), onReset: vi.fn() };
    const { findByText, getByRole, userEvent } = render(<VerifyDomainForm {...props} />, { wrapper });
    expect(await findByText('Domain read failed')).toBeInTheDocument();
    await userEvent.click(getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(getByRole('textbox')).toBeInTheDocument());
    expect(props.onReset).not.toHaveBeenCalled();
    expect(props.onSuccess).not.toHaveBeenCalled();
  });

  it('keeps the code step after an invalid code and advances to enrollment after retry', async () => {
    const { wrapper, domain, unmount } = await setup();
    unmount();
    vi.mocked(domain.attemptAffiliationVerification)
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Code invalid', {
          status: 422,
          data: [{ code: 'domain_code_invalid', message: 'Code invalid' }],
        }),
      )
      .mockResolvedValue({ ...domain, verification: { ...domain.verification!, status: 'verified' } });
    const props = { domainId: 'domain_1', skipToVerified: false, onSuccess: vi.fn(), onReset: vi.fn() };
    const { getByRole, getByLabelText, findByText, userEvent } = render(<VerifyDomainForm {...props} />, { wrapper });
    await userEvent.type(getByRole('textbox'), 'admin');
    await userEvent.click(getByRole('button', { name: 'Save' }));
    const input = await waitFor(() => getByLabelText('Enter verification code'));
    await userEvent.type(input, '123456');
    expect(await findByText(/Code invalid/)).toBeInTheDocument();
    await waitFor(() => expect(input).toHaveValue(''));
    expect(getByLabelText('Enter verification code')).toBeInTheDocument();
    await userEvent.type(input, '654321');
    await waitFor(() => expect(getByRole('radio', { name: /No automatic enrollment/ })).toBeInTheDocument());
    expect(domain.attemptAffiliationVerification).toHaveBeenCalledTimes(2);
    expect(props.onSuccess).not.toHaveBeenCalled();
    expect(props.onReset).not.toHaveBeenCalled();
  });

  it('permits Back after an ignored result with the real OTP control', async () => {
    const { result, wrapper: Fixture } = await setup();
    const model = { ...result.current, attempt: vi.fn().mockResolvedValue(undefined) };
    const onSuccess = vi.fn();
    const View = () => (
      <VerifyDomainFormView
        controller={useVerifyDomainFormController(model, false, onSuccess)}
        domainId='domain_1'
        onSuccess={onSuccess}
        onReset={vi.fn()}
      />
    );
    const wrapper = ({ children }: PropsWithChildren) => (
      <Fixture>
        <CardStateProvider>{children}</CardStateProvider>
      </Fixture>
    );
    const { getByRole, getByLabelText, userEvent } = render(<View />, { wrapper });
    await userEvent.type(getByRole('textbox'), 'admin');
    await userEvent.click(getByRole('button', { name: 'Save' }));
    const input = await waitFor(() => getByLabelText('Enter verification code'));
    await userEvent.type(input, '123456');
    await waitFor(() => expect(model.attempt).toHaveBeenCalledOnce());
    const back = getByRole('button', { name: 'Cancel' });
    await waitFor(() => expect(back).toBeEnabled());
    await userEvent.click(back);
    await waitFor(() => expect(getByRole('textbox')).toHaveValue('admin'));
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
