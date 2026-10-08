import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, waitFor } from '@/test/utils';
import { createFakeOrganization } from '@/ui/components/OrganizationSwitcher/__tests__/test-utils';

import { useCreateOrganizationScreenModel } from '../create-organization-screen.model';
import { CreateOrganizationScreen } from '../CreateOrganizationScreen';

const { createFixtures } = bindCreateFixtures('TaskChooseOrganization');
const organization = () =>
  createFakeOrganization({
    id: 'org_created',
    name: 'Created organization',
    slug: 'created',
    membersCount: 1,
    pendingInvitationsCount: 0,
    adminDeleteEnabled: false,
    maxAllowedMemberships: 3,
  });
const failure = () =>
  new ClerkAPIResponseError('Request failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Request failed', long_message: 'Please try again' }],
  });
async function setup() {
  const result = await createFixtures(f => {
    f.withOrganizations();
    f.withForceOrganizationSelection();
    f.withUser({
      email_addresses: ['first@clerk.com'],
      create_organization_enabled: true,
      tasks: [{ key: 'choose-organization' }],
    });
  });
  result.props.setProps({ redirectUrlComplete: '/done' });
  return result;
}

afterEach(() => vi.unstubAllGlobals());

describe('task organization creation ownership', () => {
  it('starts one creation for two submissions before rendering', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<ReturnType<typeof organization>>();
    fixtures.clerk.createOrganization.mockReturnValue(deferred.promise);
    const { getByLabelText, getByRole, userEvent } = render(<CreateOrganizationScreen />, { wrapper });
    const input = getByLabelText(/Name/i);
    await userEvent.type(input, 'Created organization');
    const button = getByRole('button', { name: 'Continue' });
    act(() => {
      fireEvent.submit(input.closest('form')!);
      fireEvent.submit(input.closest('form')!);
    });
    await waitFor(() => expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce());
    expect(button).toBeDisabled();
    const created = organization();
    await act(async () => {
      deferred.resolve(created);
      await deferred.promise;
    });
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledOnce());
    expect(fixtures.clerk.setActive).toHaveBeenCalledWith(expect.objectContaining({ organization: created }));
  });

  it.each(['unmount', 'actor', 'session'] as const)(
    'does not activate after a pending creation loses its %s',
    async loss => {
      const { wrapper, fixtures } = await setup();
      const deferred = createDeferredPromise<ReturnType<typeof organization>>();
      fixtures.clerk.createOrganization.mockReturnValue(deferred.promise);
      const { result, unmount } = renderHook(useCreateOrganizationScreenModel, { wrapper });
      const pending = result.current.create('Created organization', 'created');
      if (loss === 'unmount') {
        unmount();
      } else if (loss === 'actor') {
        vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_other' });
      } else {
        vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session!, id: 'session_other' });
      }
      await act(async () => {
        deferred.resolve(organization());
        await pending;
      });
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    },
  );

  it('aborts a default-logo fetch when its source closes', async () => {
    const { wrapper, fixtures } = await setup();
    const created = organization();
    fixtures.clerk.createOrganization.mockResolvedValue(created);
    const deferred = createDeferredPromise<Response>();
    const fetchLogo = vi.fn((_url: string, _options?: RequestInit) => deferred.promise);
    vi.stubGlobal('fetch', fetchLogo);
    const { result, unmount } = renderHook(useCreateOrganizationScreenModel, { wrapper });
    const pending = result.current.create('Created organization', 'created', undefined, 'https://example.com/logo.png');
    await waitFor(() => expect(fetchLogo).toHaveBeenCalledOnce());
    const signal = fetchLogo.mock.calls[0][1]?.signal as AbortSignal;
    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => {
      deferred.resolve(new Response(new Blob(['logo'])));
      await pending;
    });
    expect(created.setLogo).not.toHaveBeenCalled();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('continues activation when the default logo fetch fails', async () => {
    const { wrapper, fixtures } = await setup();
    const created = organization();
    fixtures.clerk.createOrganization.mockResolvedValue(created);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Logo unavailable')));
    const { result } = renderHook(useCreateOrganizationScreenModel, { wrapper });
    await act(async () => {
      await result.current.create('Created organization', 'created', undefined, 'https://example.com/logo.png');
    });
    expect(created.setLogo).not.toHaveBeenCalled();
    expect(fixtures.clerk.setActive).toHaveBeenCalledWith(expect.objectContaining({ organization: created }));
  });

  it('preserves SDK navigation after the expected transition closes the source', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.createOrganization.mockResolvedValue(organization());
    const originalUser = fixtures.clerk.user!;
    const originalSession = fixtures.clerk.session!;
    const { result, unmount } = renderHook(useCreateOrganizationScreenModel, { wrapper });
    fixtures.clerk.setActive.mockImplementationOnce(async ({ navigate }) => {
      fixtures.clerk.__internal_setActiveInProgress = true;
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(undefined);
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(undefined);
      unmount();
      await navigate?.({
        session: { ...originalSession, user: originalUser, currentTask: null },
        decorateUrl: url => url,
      });
      fixtures.clerk.__internal_setActiveInProgress = false;
    });
    await act(async () => {
      await result.current.create('Created organization', 'created');
    });
    expect(fixtures.router.navigate).toHaveBeenCalledWith('/done');
  });

  it('rejects navigation when the source closed before the SDK transition', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.createOrganization.mockResolvedValue(organization());
    const originalUser = fixtures.clerk.user!;
    const originalSession = fixtures.clerk.session!;
    const { result, unmount } = renderHook(useCreateOrganizationScreenModel, { wrapper });
    fixtures.clerk.setActive.mockImplementationOnce(async ({ navigate }) => {
      unmount();
      fixtures.clerk.__internal_setActiveInProgress = true;
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(undefined);
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(undefined);
      await navigate?.({
        session: { ...originalSession, user: originalUser, currentTask: null },
        decorateUrl: url => url,
      });
      fixtures.clerk.__internal_setActiveInProgress = false;
    });
    await act(async () => {
      await result.current.create('Created organization', 'created');
    });
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });

  it('reports a live failure and permits a retry', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.createOrganization.mockRejectedValueOnce(failure()).mockResolvedValueOnce(organization());
    const { getByLabelText, getByRole, findByText, userEvent } = render(<CreateOrganizationScreen />, { wrapper });
    await userEvent.type(getByLabelText(/Name/i), 'Created organization');
    await userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(await findByText('Please try again')).toBeVisible();
    await userEvent.click(getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledOnce());
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledTimes(2);
  });
  it('keeps navigation ownership while hooks render the SDK transition', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.createOrganization.mockResolvedValue(organization());
    const originalUser = fixtures.clerk.user!;
    const originalSession = fixtures.clerk.session!;
    const { result, rerender } = renderHook(() => useCreateOrganizationScreenModel(), { wrapper });
    const initialScope = result.current.scopeKey;
    fixtures.clerk.setActive.mockImplementationOnce(async ({ navigate }) => {
      fixtures.clerk.__internal_setActiveInProgress = true;
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(undefined);
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(undefined);
      fixtures.clerk.__internal_lastEmittedResources = {
        ...fixtures.clerk.__internal_lastEmittedResources!,
        user: undefined,
        session: undefined,
      };
      rerender();
      expect(result.current.scopeKey).toBe(initialScope);
      await navigate?.({
        session: { ...originalSession, user: originalUser, currentTask: null },
        decorateUrl: url => url,
      });
      fixtures.clerk.__internal_setActiveInProgress = false;
    });
    await act(async () => {
      await result.current.create('Created organization', 'created');
    });
    expect(fixtures.router.navigate).toHaveBeenCalledWith('/done');
  });

  it.each(['session', 'actor'] as const)('rejects navigation for a different callback %s', async mismatch => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.createOrganization.mockResolvedValue(organization());
    const callbackSession = {
      ...fixtures.clerk.session!,
      user: fixtures.clerk.user!,
      currentTask: null,
      ...(mismatch === 'session' ? { id: 'session_other' } : { user: { ...fixtures.clerk.user!, id: 'user_other' } }),
    };
    fixtures.clerk.setActive.mockImplementationOnce(async ({ navigate }) => {
      await navigate?.({ session: callbackSession, decorateUrl: url => url });
    });
    const { result } = renderHook(() => useCreateOrganizationScreenModel(), { wrapper });
    await act(async () => {
      await result.current.create('Created organization', 'created');
    });
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });

  it.each(['success', 'failure'] as const)(
    'does not affect a replacement account form after an old %s',
    async outcome => {
      const { wrapper, fixtures } = await setup();
      const first = createDeferredPromise<ReturnType<typeof organization>>();
      const second = createDeferredPromise<ReturnType<typeof organization>>();
      fixtures.clerk.createOrganization.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
      const { getByLabelText, getByRole, queryByText, userEvent, rerender } = render(<CreateOrganizationScreen />, {
        wrapper,
      });
      await userEvent.type(getByLabelText(/Name/i), 'First organization');
      await userEvent.click(getByRole('button', { name: 'Continue' }));
      const user = { ...fixtures.clerk.user!, id: 'user_second' };
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(user);
      fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, user };
      rerender(<CreateOrganizationScreen />);
      expect(getByLabelText(/Name/i)).toHaveValue('');
      await userEvent.type(getByLabelText(/Name/i), 'Second organization');
      const button = getByRole('button', { name: 'Continue' });
      await userEvent.click(button);
      await act(async () => {
        if (outcome === 'success') {
          first.resolve(organization());
        } else {
          first.reject(failure());
        }
        await first.promise.catch(() => {});
      });
      expect(button).toBeDisabled();
      expect(queryByText('Please try again')).not.toBeInTheDocument();
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
      await act(async () => {
        second.resolve({ ...organization(), id: 'org_second' });
        await second.promise;
      });
      await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledOnce());
      expect(button).toBeEnabled();
    },
  );
  it('retries failed activation through the form with the same organization', async () => {
    const { wrapper, fixtures } = await setup();
    const created = organization();
    fixtures.clerk.createOrganization.mockResolvedValue(created);
    fixtures.clerk.setActive.mockRejectedValueOnce(failure()).mockResolvedValueOnce(undefined);
    const { getByLabelText, getByRole, findByText, userEvent } = render(<CreateOrganizationScreen />, { wrapper });
    await userEvent.type(getByLabelText(/Name/i), 'Created organization');
    await userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(await findByText('Please try again')).toBeVisible();
    await userEvent.click(getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(2));
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce();
    expect(fixtures.clerk.setActive).toHaveBeenNthCalledWith(1, expect.objectContaining({ organization: created }));
    expect(fixtures.clerk.setActive).toHaveBeenNthCalledWith(2, expect.objectContaining({ organization: created }));
  });

  it.each(['success', 'failure'] as const)(
    'does not repeat a logo upload after its %s when activation is retried',
    async outcome => {
      const { wrapper, fixtures } = await setup();
      const created = organization();
      if (outcome === 'success') {
        vi.mocked(created.setLogo).mockResolvedValue(created);
      } else {
        vi.mocked(created.setLogo).mockRejectedValue(failure());
      }
      fixtures.clerk.createOrganization.mockResolvedValue(created);
      fixtures.clerk.setActive.mockRejectedValueOnce(failure()).mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useCreateOrganizationScreenModel(), { wrapper });
      const file = new File(['logo'], 'logo.png', { type: 'image/png' });
      await act(async () => {
        await expect(result.current.create('Created organization', 'created', file)).rejects.toMatchObject({
          message: 'Request failed',
        });
        await result.current.create('Created organization', 'created', file);
      });
      expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce();
      expect(created.setLogo).toHaveBeenCalledExactlyOnceWith({ file });
      expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(2);
    },
  );

  it('does not download a default logo again on activation retry', async () => {
    const { wrapper, fixtures } = await setup();
    const created = organization();
    fixtures.clerk.createOrganization.mockResolvedValue(created);
    fixtures.clerk.setActive.mockRejectedValueOnce(failure()).mockResolvedValueOnce(undefined);
    const blob = new Blob(['logo'], { type: 'image/png' });
    const fetchLogo = vi.fn().mockResolvedValue({ blob: vi.fn().mockResolvedValue(blob) });
    vi.stubGlobal('fetch', fetchLogo);
    const { result } = renderHook(() => useCreateOrganizationScreenModel(), { wrapper });
    await act(async () => {
      await expect(
        result.current.create('Created organization', 'created', undefined, 'https://example.com/logo.png'),
      ).rejects.toMatchObject({ message: 'Request failed' });
      await result.current.create('Created organization', 'created', undefined, 'https://example.com/logo.png');
    });
    expect(fetchLogo).toHaveBeenCalledOnce();
    expect(created.setLogo).toHaveBeenCalledOnce();
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce();
    expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(2);
  });

  it.each(['actor', 'session', 'client', 'unmount'] as const)(
    'rejects a partial-creation retry after %s loss',
    async loss => {
      const { wrapper, fixtures } = await setup();
      fixtures.clerk.createOrganization.mockResolvedValue(organization());
      fixtures.clerk.setActive.mockRejectedValueOnce(failure());
      const { result, unmount } = renderHook(() => useCreateOrganizationScreenModel(), { wrapper });
      const create = result.current.create;
      await act(async () => {
        await expect(create('Created organization', 'created')).rejects.toMatchObject({ message: 'Request failed' });
      });
      if (loss === 'unmount') {
        unmount();
      } else if (loss === 'actor') {
        vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_other' });
      } else if (loss === 'session') {
        vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session!, id: 'session_other' });
      } else {
        vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({ ...fixtures.clerk.client, id: 'client_other' });
      }
      await act(async () => {
        await create('Created organization', 'created');
      });
      expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce();
      expect(fixtures.clerk.setActive).toHaveBeenCalledOnce();
    },
  );

  it('does not reuse partial creation after switching away from and back to the same account', async () => {
    const { wrapper, fixtures } = await setup();
    const first = organization();
    const second = { ...organization(), id: 'org_second' };
    fixtures.clerk.createOrganization.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    fixtures.clerk.setActive.mockRejectedValueOnce(failure()).mockResolvedValueOnce(undefined);
    const { result, rerender } = renderHook(() => useCreateOrganizationScreenModel(), { wrapper });
    await act(async () => {
      await expect(result.current.create('First organization', 'first')).rejects.toMatchObject({
        message: 'Request failed',
      });
    });
    const original = fixtures.clerk.user!;
    const getUser = vi.spyOn(fixtures.clerk, 'user', 'get');
    const next = { ...original, id: 'user_other' };
    getUser.mockReturnValue(next);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, user: next };
    rerender();
    expect(result.current.scopeKey).toContain('user_other');
    getUser.mockReturnValue(original);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources,
      user: original,
    };
    rerender();
    await act(async () => {
      await result.current.create('Second organization', 'second');
    });
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledTimes(2);
    expect(fixtures.clerk.setActive).toHaveBeenNthCalledWith(1, expect.objectContaining({ organization: first }));
    expect(fixtures.clerk.setActive).toHaveBeenNthCalledWith(2, expect.objectContaining({ organization: second }));
  });

  it('releases successful progress before the next creation in the same source', async () => {
    const { wrapper, fixtures } = await setup();
    const first = organization();
    const second = { ...organization(), id: 'org_second' };
    fixtures.clerk.createOrganization.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    const { result } = renderHook(() => useCreateOrganizationScreenModel(), { wrapper });
    await act(async () => {
      await result.current.create('First organization', 'first');
      await result.current.create('Second organization', 'second');
    });
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledTimes(2);
    expect(fixtures.clerk.setActive).toHaveBeenNthCalledWith(1, expect.objectContaining({ organization: first }));
    expect(fixtures.clerk.setActive).toHaveBeenNthCalledWith(2, expect.objectContaining({ organization: second }));
  });
  it('locks committed details and keeps activation retry available', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withOrganizationSlug(true);
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['first@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });
    const created = organization();
    vi.mocked(created.setLogo).mockResolvedValue(created);
    fixtures.clerk.createOrganization.mockResolvedValue(created);
    fixtures.clerk.setActive.mockRejectedValueOnce(failure()).mockResolvedValueOnce(undefined);
    const { container, getByLabelText, getByRole, findByText, userEvent } = render(<CreateOrganizationScreen />, {
      wrapper,
    });
    const name = getByLabelText(/Name/i);
    const slug = getByLabelText(/Slug/i);
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const original = new File(['logo'], 'original.png', { type: 'image/png' });
    await userEvent.upload(fileInput, original);
    await userEvent.type(name, 'Committed organization');
    await userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(await findByText('Please try again')).toBeVisible();
    expect(name).toBeDisabled();
    expect(slug).toBeDisabled();
    expect(fileInput).toBeDisabled();
    expect(getByRole('button', { name: 'Upload' })).toBeDisabled();
    expect(getByRole('button', { name: 'Remove' })).toBeDisabled();
    expect(getByRole('button', { name: 'Continue' })).toBeEnabled();
    fireEvent.change(name, { target: { value: 'Ignored change' } });
    fireEvent.change(slug, { target: { value: 'ignored-change' } });
    fireEvent.change(fileInput, {
      target: { files: [new File(['replacement'], 'replacement.png', { type: 'image/png' })] },
    });
    expect(name).toHaveValue('Committed organization');
    expect(slug).toHaveValue('committed-organization');
    await userEvent.click(getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(2));
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce();
    expect(created.setLogo).toHaveBeenCalledExactlyOnceWith({ file: original });
  });

  it('keeps details editable when creation itself fails', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withOrganizationSlug(true);
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['first@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });
    fixtures.clerk.createOrganization.mockRejectedValueOnce(failure()).mockResolvedValueOnce(organization());
    const { container, getByLabelText, getByRole, findByText, userEvent } = render(<CreateOrganizationScreen />, {
      wrapper,
    });
    const name = getByLabelText(/Name/i);
    await userEvent.type(name, 'First attempt');
    await userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(await findByText('Please try again')).toBeVisible();
    expect(name).toBeEnabled();
    expect(getByLabelText(/Slug/i)).toBeEnabled();
    expect(container.querySelector('input[type="file"]')).toBeEnabled();
    await userEvent.clear(name);
    await userEvent.type(name, 'Second attempt');
    await userEvent.click(getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledOnce());
    expect(fixtures.clerk.createOrganization).toHaveBeenLastCalledWith({
      name: 'Second attempt',
      slug: 'second-attempt',
    });
  });
});
