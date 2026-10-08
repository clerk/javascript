import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, waitFor } from '@/test/utils';

import { createFakeOrganization } from '../../OrganizationSwitcher/__tests__/test-utils';
import { useCreateOrganizationFormModel } from '../create-organization-form.model';
import { CreateOrganizationForm } from '../CreateOrganizationForm';

const { createFixtures } = bindCreateFixtures('CreateOrganization');
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
const setup = () =>
  createFixtures(f => {
    f.withOrganizations();
    f.withUser({ email_addresses: ['first@clerk.com'] });
  });

const form = (navigate: (org: ReturnType<typeof organization>) => Promise<unknown>, complete = vi.fn()) => (
  <CreateOrganizationForm
    flow='default'
    skipInvitationScreen
    navigateAfterCreateOrganization={navigate}
    onComplete={complete}
  />
);

describe('organization creation ownership', () => {
  it('creates once for two submissions before rendering', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<ReturnType<typeof organization>>();
    fixtures.clerk.createOrganization.mockReturnValue(deferred.promise);
    const navigate = vi.fn().mockResolvedValue(undefined);
    const complete = vi.fn();
    const { getByLabelText, getByRole, userEvent } = render(form(navigate, complete), { wrapper });
    const input = getByLabelText(/Name/i);
    await userEvent.type(input, 'Created organization');
    const button = getByRole('button', { name: 'Create organization' });
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
    await waitFor(() => expect(complete).toHaveBeenCalledOnce());
    expect(navigate).toHaveBeenCalledExactlyOnceWith(created);
  });

  it.each(['unmount', 'actor', 'session'] as const)('does not activate a late result after %s loss', async loss => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<ReturnType<typeof organization>>();
    fixtures.clerk.createOrganization.mockReturnValue(deferred.promise);
    const navigate = vi.fn().mockResolvedValue(undefined);
    const complete = vi.fn();
    const { getByLabelText, getByRole, userEvent, unmount } = render(form(navigate, complete), { wrapper });
    await userEvent.type(getByLabelText(/Name/i), 'Created organization');
    await userEvent.click(getByRole('button', { name: 'Create organization' }));
    if (loss === 'unmount') {
      unmount();
    } else if (loss === 'actor') {
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_other' });
    } else {
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session!, id: 'session_other' });
    }
    await act(async () => {
      deferred.resolve(organization());
      await deferred.promise;
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
  });

  it.each(['unmount', 'actor', 'session'] as const)('does not complete late navigation after %s loss', async loss => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.createOrganization.mockResolvedValue(organization());
    const deferred = createDeferredPromise<void>();
    const navigate = vi.fn(() => deferred.promise);
    const complete = vi.fn();
    const { getByLabelText, getByRole, userEvent, unmount } = render(form(navigate, complete), { wrapper });
    await userEvent.type(getByLabelText(/Name/i), 'Created organization');
    await userEvent.click(getByRole('button', { name: 'Create organization' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledOnce());
    expect(complete).not.toHaveBeenCalled();
    if (loss === 'unmount') {
      unmount();
    } else if (loss === 'actor') {
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_other' });
    } else {
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session!, id: 'session_other' });
    }
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(complete).not.toHaveBeenCalled();
  });

  it('reports navigation failure and retries without creating a second organization', async () => {
    const { wrapper, fixtures } = await setup();
    const created = organization();
    fixtures.clerk.createOrganization.mockResolvedValue(created);
    const navigate = vi.fn().mockRejectedValueOnce(failure()).mockResolvedValueOnce(undefined);
    const complete = vi.fn();
    const { getByLabelText, getByRole, findByText, userEvent } = render(form(navigate, complete), { wrapper });
    await userEvent.type(getByLabelText(/Name/i), 'Created organization');
    await userEvent.click(getByRole('button', { name: 'Create organization' }));
    expect(await findByText('Please try again')).toBeVisible();
    expect(complete).not.toHaveBeenCalled();
    await userEvent.click(getByRole('button', { name: 'Create organization' }));
    await waitFor(() => expect(complete).toHaveBeenCalledOnce());
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce();
    expect(fixtures.clerk.setActive).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledTimes(2);
  });
  it('does not complete before an organization has been created', async () => {
    const { wrapper } = await setup();
    const navigate = vi.fn().mockResolvedValue(undefined);
    const complete = vi.fn();
    const { result } = renderHook(
      () =>
        useCreateOrganizationFormModel({
          flow: 'default',
          skipInvitationScreen: true,
          navigateAfterCreateOrganization: navigate,
          onComplete: complete,
        }),
      { wrapper },
    );
    await result.current.complete();
    expect(navigate).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
  });

  it('does not activate after its logo upload loses the account', async () => {
    const { wrapper, fixtures } = await setup();
    const created = organization();
    const deferred = createDeferredPromise<typeof created>();
    vi.mocked(created.setLogo).mockReturnValue(deferred.promise);
    fixtures.clerk.createOrganization.mockResolvedValue(created);
    const navigate = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(
      () =>
        useCreateOrganizationFormModel({
          flow: 'default',
          skipInvitationScreen: true,
          navigateAfterCreateOrganization: navigate,
        }),
      { wrapper },
    );
    let pending: ReturnType<typeof result.current.create>;
    act(() => {
      pending = result.current.create({
        name: 'Created organization',
        slug: 'created',
        file: new File(['logo'], 'logo.png'),
      });
    });
    await waitFor(() => expect(created.setLogo).toHaveBeenCalledOnce());
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_other' });
    await act(async () => {
      deferred.resolve(created);
      expect(await pending!).toBeNull();
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('rejects an old creation after switching away from and back to the same account', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<ReturnType<typeof organization>>();
    fixtures.clerk.createOrganization.mockReturnValue(deferred.promise);
    const { result, rerender } = renderHook(
      () =>
        useCreateOrganizationFormModel({
          flow: 'default',
          skipInvitationScreen: true,
        }),
      { wrapper },
    );
    const originalUser = fixtures.clerk.user!;
    const pending = result.current.create({ name: 'Created organization', slug: 'created' });
    const getUser = vi.spyOn(fixtures.clerk, 'user', 'get');
    const otherUser = { ...originalUser, id: 'user_other' };
    getUser.mockReturnValue(otherUser);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      user: otherUser,
    };
    rerender();
    expect(result.current.scopeKey).toContain('user_other');
    getUser.mockReturnValue(originalUser);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources,
      user: originalUser,
    };
    rerender();
    expect(result.current.scopeKey).toContain(originalUser.id);
    await act(async () => {
      deferred.resolve(organization());
      expect(await pending).toBeNull();
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('does not show an old request error in a replacement form', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<ReturnType<typeof organization>>();
    fixtures.clerk.createOrganization.mockReturnValueOnce(deferred.promise);
    const navigate = vi.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByRole, queryByText, userEvent, rerender } = render(
      <CreateOrganizationForm
        key='first'
        flow='default'
        skipInvitationScreen
        navigateAfterCreateOrganization={navigate}
      />,
      { wrapper },
    );
    await userEvent.type(getByLabelText(/Name/i), 'First organization');
    await userEvent.click(getByRole('button', { name: 'Create organization' }));
    rerender(
      <CreateOrganizationForm
        key='second'
        flow='default'
        skipInvitationScreen
        navigateAfterCreateOrganization={navigate}
      />,
    );
    await act(async () => {
      deferred.reject(failure());
      await deferred.promise.catch(() => {});
    });
    expect(getByLabelText(/Name/i)).toHaveValue('');
    expect(queryByText('Please try again')).not.toBeInTheDocument();
    await userEvent.type(getByLabelText(/Name/i), 'Second organization');
    expect(getByRole('button', { name: 'Create organization' })).toBeEnabled();
    expect(navigate).not.toHaveBeenCalled();
  });
  it.each(['success', 'failure'] as const)(
    'keeps the replacement account form pending after an old %s',
    async outcome => {
      const { wrapper, fixtures } = await setup();
      const first = createDeferredPromise<ReturnType<typeof organization>>();
      const second = createDeferredPromise<ReturnType<typeof organization>>();
      fixtures.clerk.createOrganization.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
      const navigate = vi.fn().mockResolvedValue(undefined);
      const complete = vi.fn();
      const { getByLabelText, getByRole, userEvent, rerender, queryByText } = render(form(navigate, complete), {
        wrapper,
      });
      await userEvent.type(getByLabelText(/Name/i), 'First organization');
      await userEvent.click(getByRole('button', { name: 'Create organization' }));
      const nextUser = { ...fixtures.clerk.user!, id: 'user_next' };
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(nextUser);
      fixtures.clerk.__internal_lastEmittedResources = {
        ...fixtures.clerk.__internal_lastEmittedResources!,
        user: nextUser,
      };
      rerender(form(navigate, complete));
      expect(getByLabelText(/Name/i)).toHaveValue('');
      await userEvent.type(getByLabelText(/Name/i), 'Second organization');
      const button = getByRole('button', { name: 'Create organization' });
      await userEvent.click(button);
      expect(fixtures.clerk.createOrganization).toHaveBeenCalledTimes(2);
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
      const created = { ...organization(), id: 'org_second' };
      await act(async () => {
        second.resolve(created);
        await second.promise;
      });
      await waitFor(() => expect(complete).toHaveBeenCalledOnce());
      expect(navigate).toHaveBeenCalledExactlyOnceWith(created);
      expect(fixtures.clerk.setActive).toHaveBeenCalledExactlyOnceWith({ organization: created });
    },
  );
  it('retries a failed logo upload on the same organization before activation', async () => {
    const { wrapper, fixtures } = await setup();
    const created = organization();
    vi.mocked(created.setLogo).mockRejectedValueOnce(failure()).mockResolvedValueOnce(created);
    fixtures.clerk.createOrganization.mockResolvedValue(created);
    const navigate = vi.fn().mockResolvedValue(undefined);
    const complete = vi.fn();
    const { result } = renderHook(
      () =>
        useCreateOrganizationFormModel({
          flow: 'default',
          skipInvitationScreen: true,
          navigateAfterCreateOrganization: navigate,
          onComplete: complete,
        }),
      { wrapper },
    );
    const file = new File(['logo'], 'logo.png');
    await act(async () => {
      await expect(
        result.current.create({ name: 'Created organization', slug: 'created', file }),
      ).rejects.toMatchObject({ message: 'Request failed' });
      await result.current.complete();
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
    await act(async () => {
      expect(await result.current.create({ name: 'Created organization', slug: 'created', file })).toEqual({
        skipInvitations: true,
      });
      await result.current.complete();
    });
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce();
    expect(created.setLogo).toHaveBeenCalledTimes(2);
    expect(created.setLogo).toHaveBeenNthCalledWith(1, { file });
    expect(created.setLogo).toHaveBeenNthCalledWith(2, { file });
    expect(fixtures.clerk.setActive).toHaveBeenCalledExactlyOnceWith({ organization: created });
    expect(navigate).toHaveBeenCalledExactlyOnceWith(created);
    expect(complete).toHaveBeenCalledOnce();
  });

  it('retries failed activation without repeating creation or logo upload', async () => {
    const { wrapper, fixtures } = await setup();
    const created = organization();
    vi.mocked(created.setLogo).mockResolvedValue(created);
    fixtures.clerk.createOrganization.mockResolvedValue(created);
    fixtures.clerk.setActive.mockRejectedValueOnce(failure()).mockResolvedValueOnce(undefined);
    const navigate = vi.fn().mockResolvedValue(undefined);
    const complete = vi.fn();
    const { result } = renderHook(
      () =>
        useCreateOrganizationFormModel({
          flow: 'default',
          skipInvitationScreen: true,
          navigateAfterCreateOrganization: navigate,
          onComplete: complete,
        }),
      { wrapper },
    );
    const file = new File(['logo'], 'logo.png');
    await act(async () => {
      await expect(
        result.current.create({ name: 'Created organization', slug: 'created', file }),
      ).rejects.toMatchObject({ message: 'Request failed' });
      await result.current.complete();
    });
    expect(navigate).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
    await act(async () => {
      expect(await result.current.create({ name: 'Created organization', slug: 'created', file })).toEqual({
        skipInvitations: true,
      });
      await result.current.complete();
    });
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce();
    expect(created.setLogo).toHaveBeenCalledExactlyOnceWith({ file });
    expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(2);
    expect(fixtures.clerk.setActive).toHaveBeenNthCalledWith(1, { organization: created });
    expect(fixtures.clerk.setActive).toHaveBeenNthCalledWith(2, { organization: created });
    expect(navigate).toHaveBeenCalledExactlyOnceWith(created);
    expect(complete).toHaveBeenCalledOnce();
  });

  it('permits a form retry after activation fails without creating another organization', async () => {
    const { wrapper, fixtures } = await setup();
    const created = organization();
    fixtures.clerk.createOrganization.mockResolvedValue(created);
    fixtures.clerk.setActive.mockRejectedValueOnce(failure()).mockResolvedValueOnce(undefined);
    const navigate = vi.fn().mockResolvedValue(undefined);
    const complete = vi.fn();
    const { getByLabelText, getByRole, findByText, userEvent } = render(form(navigate, complete), { wrapper });
    await userEvent.type(getByLabelText(/Name/i), 'Created organization');
    await userEvent.click(getByRole('button', { name: 'Create organization' }));
    expect(await findByText('Please try again')).toBeVisible();
    expect(navigate).not.toHaveBeenCalled();
    await userEvent.click(getByRole('button', { name: 'Create organization' }));
    await waitFor(() => expect(complete).toHaveBeenCalledOnce());
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce();
    expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledExactlyOnceWith(created);
  });

  it.each(['actor', 'session', 'unmount'] as const)('rejects a captured cancel command after %s loss', async loss => {
    const { wrapper, fixtures } = await setup();
    const cancel = vi.fn();
    const { result, unmount } = renderHook(
      () =>
        useCreateOrganizationFormModel({
          flow: 'default',
          skipInvitationScreen: true,
          onCancel: cancel,
        }),
      { wrapper },
    );
    const onCancel = result.current.onCancel;
    if (loss === 'unmount') {
      unmount();
    } else if (loss === 'actor') {
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_other' });
    } else {
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session!, id: 'session_other' });
    }
    onCancel?.();
    expect(cancel).not.toHaveBeenCalled();
  });

  it('releases completed progress before a new creation in the same source', async () => {
    const { wrapper, fixtures } = await setup();
    const first = organization();
    const second = { ...organization(), id: 'org_second' };
    fixtures.clerk.createOrganization.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    const navigate = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(
      () =>
        useCreateOrganizationFormModel({
          flow: 'default',
          skipInvitationScreen: true,
          navigateAfterCreateOrganization: navigate,
        }),
      { wrapper },
    );
    await act(async () => {
      await result.current.create({ name: 'First organization', slug: 'first' });
      await result.current.complete();
      await result.current.create({ name: 'Second organization', slug: 'second' });
      await result.current.complete();
    });
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenNthCalledWith(1, first);
    expect(navigate).toHaveBeenNthCalledWith(2, second);
  });
  it('retries the chosen logo through the form without creating another organization', async () => {
    const { wrapper, fixtures } = await setup();
    const created = organization();
    vi.mocked(created.setLogo).mockRejectedValueOnce(failure()).mockResolvedValueOnce(created);
    fixtures.clerk.createOrganization.mockResolvedValue(created);
    const navigate = vi.fn().mockResolvedValue(undefined);
    const complete = vi.fn();
    const { container, getByLabelText, getByRole, findByText, userEvent } = render(form(navigate, complete), {
      wrapper,
    });
    const file = new File(['logo'], 'logo.png', { type: 'image/png' });
    await userEvent.upload(container.querySelector<HTMLInputElement>('input[type="file"]')!, file);
    await userEvent.type(getByLabelText(/Name/i), 'Created organization');
    await userEvent.click(getByRole('button', { name: 'Create organization' }));
    expect(await findByText('Please try again')).toBeVisible();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    await userEvent.click(getByRole('button', { name: 'Create organization' }));
    await waitFor(() => expect(complete).toHaveBeenCalledOnce());
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce();
    expect(created.setLogo).toHaveBeenCalledTimes(2);
    expect(created.setLogo).toHaveBeenNthCalledWith(2, { file });
    expect(fixtures.clerk.setActive).toHaveBeenCalledExactlyOnceWith({ organization: created });
    expect(navigate).toHaveBeenCalledExactlyOnceWith(created);
  });
  it('does not reuse a partial creation in the next account', async () => {
    const { wrapper, fixtures } = await setup();
    const first = organization();
    const second = { ...organization(), id: 'org_second' };
    fixtures.clerk.createOrganization.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    fixtures.clerk.setActive.mockRejectedValueOnce(failure()).mockResolvedValueOnce(undefined);
    const navigate = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      () =>
        useCreateOrganizationFormModel({
          flow: 'default',
          skipInvitationScreen: true,
          navigateAfterCreateOrganization: navigate,
        }),
      { wrapper },
    );
    await act(async () => {
      await expect(result.current.create({ name: 'First organization', slug: 'first' })).rejects.toMatchObject({
        message: 'Request failed',
      });
    });
    const user = { ...fixtures.clerk.user!, id: 'user_second' };
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(user);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, user };
    rerender();
    await act(async () => {
      await result.current.create({ name: 'Second organization', slug: 'second' });
      await result.current.complete();
    });
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledTimes(2);
    expect(fixtures.clerk.setActive).toHaveBeenNthCalledWith(1, { organization: first });
    expect(fixtures.clerk.setActive).toHaveBeenNthCalledWith(2, { organization: second });
    expect(navigate).toHaveBeenCalledExactlyOnceWith(second);
  });

  it.each(['actor', 'session', 'unmount'] as const)('rejects a partial-creation retry after %s loss', async loss => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.createOrganization.mockResolvedValue(organization());
    fixtures.clerk.setActive.mockRejectedValueOnce(failure());
    const navigate = vi.fn().mockResolvedValue(undefined);
    const { result, unmount } = renderHook(
      () =>
        useCreateOrganizationFormModel({
          flow: 'default',
          skipInvitationScreen: true,
          navigateAfterCreateOrganization: navigate,
        }),
      { wrapper },
    );
    const create = result.current.create;
    const complete = result.current.complete;
    await act(async () => {
      await expect(create({ name: 'Created organization', slug: 'created' })).rejects.toMatchObject({
        message: 'Request failed',
      });
    });
    if (loss === 'unmount') {
      unmount();
    } else if (loss === 'actor') {
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_other' });
    } else {
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session!, id: 'session_other' });
    }
    await act(async () => {
      expect(await create({ name: 'Created organization', slug: 'created' })).toBeNull();
      await complete();
    });
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce();
    expect(fixtures.clerk.setActive).toHaveBeenCalledOnce();
    expect(navigate).not.toHaveBeenCalled();
  });
  it('locks committed details and keeps activation retry available', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withOrganizationSlug(true);
      f.withUser({ email_addresses: ['first@clerk.com'] });
    });
    const created = organization();
    vi.mocked(created.setLogo).mockResolvedValue(created);
    fixtures.clerk.createOrganization.mockResolvedValue(created);
    fixtures.clerk.setActive.mockRejectedValueOnce(failure()).mockResolvedValueOnce(undefined);
    const { container, getByLabelText, getByRole, findByText, userEvent } = render(
      form(vi.fn().mockResolvedValue(undefined)),
      { wrapper },
    );
    const name = getByLabelText(/Name/i);
    const slug = getByLabelText(/Slug/i);
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const original = new File(['logo'], 'original.png', { type: 'image/png' });
    await userEvent.upload(fileInput, original);
    await userEvent.type(name, 'Committed organization');
    await userEvent.click(getByRole('button', { name: 'Create organization' }));
    expect(await findByText('Please try again')).toBeVisible();
    expect(name).toBeDisabled();
    expect(slug).toBeDisabled();
    expect(fileInput).toBeDisabled();
    expect(getByRole('button', { name: 'Upload' })).toBeDisabled();
    expect(getByRole('button', { name: 'Remove' })).toBeDisabled();
    expect(getByRole('button', { name: 'Create organization' })).toBeEnabled();
    fireEvent.change(name, { target: { value: 'Ignored change' } });
    fireEvent.change(slug, { target: { value: 'ignored-change' } });
    fireEvent.change(fileInput, {
      target: { files: [new File(['replacement'], 'replacement.png', { type: 'image/png' })] },
    });
    expect(name).toHaveValue('Committed organization');
    expect(slug).toHaveValue('committed-organization');
    await userEvent.click(getByRole('button', { name: 'Create organization' }));
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(2));
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce();
    expect(created.setLogo).toHaveBeenCalledExactlyOnceWith({ file: original });
  });

  it('keeps details editable when creation itself fails', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withOrganizationSlug(true);
      f.withUser({ email_addresses: ['first@clerk.com'] });
    });
    fixtures.clerk.createOrganization.mockRejectedValueOnce(failure()).mockResolvedValueOnce(organization());
    const { container, getByLabelText, getByRole, findByText, userEvent } = render(
      form(vi.fn().mockResolvedValue(undefined)),
      { wrapper },
    );
    const name = getByLabelText(/Name/i);
    await userEvent.type(name, 'First attempt');
    await userEvent.click(getByRole('button', { name: 'Create organization' }));
    expect(await findByText('Please try again')).toBeVisible();
    expect(name).toBeEnabled();
    expect(getByLabelText(/Slug/i)).toBeEnabled();
    expect(container.querySelector('input[type="file"]')).toBeEnabled();
    await userEvent.clear(name);
    await userEvent.type(name, 'Second attempt');
    await userEvent.click(getByRole('button', { name: 'Create organization' }));
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledOnce());
    expect(fixtures.clerk.createOrganization).toHaveBeenLastCalledWith({
      name: 'Second attempt',
      slug: 'second-attempt',
    });
  });
});
