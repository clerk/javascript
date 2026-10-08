import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { FormEvent, PropsWithChildren } from 'react';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@/test/utils';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { createFakeOrganization } from '../../OrganizationSwitcher/__tests__/test-utils';
import { useCreateOrganizationFormController } from '../create-organization-form.controller';
import { useCreateOrganizationFormModel } from '../create-organization-form.model';
import type { CreateOrganizationFormData } from '../create-organization-form.types';
import { CreateOrganizationFormView } from '../create-organization-form.view';
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
const input = { name: 'Created organization', slug: 'created' };
const event = () => ({ preventDefault: vi.fn() }) as unknown as FormEvent;
const Card = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);

describe('organization creation request lifecycle', () => {
  it('blocks retained commands when the client changes before rendering', async () => {
    const { wrapper, fixtures } = await setup();
    const cancel = vi.fn();
    const { result } = renderHook(
      () => useCreateOrganizationFormModel({ flow: 'default', skipInvitationScreen: true, onCancel: cancel }),
      { wrapper },
    );
    const old = result.current;
    vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({ ...fixtures.clerk.client, id: 'client_other' });
    expect(await old.create(input)).toBeNull();
    await old.complete();
    old.onCancel?.();
    expect(fixtures.clerk.createOrganization).not.toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();
  });

  it.each(['resolve', 'reject'] as const)('discards a pending creation after client drift: %s', async outcome => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<ReturnType<typeof organization>>();
    fixtures.clerk.createOrganization.mockReturnValueOnce(deferred.promise);
    const { result } = renderHook(
      () => useCreateOrganizationFormModel({ flow: 'default', skipInvitationScreen: true }),
      { wrapper },
    );
    const request = result.current.create(input);
    vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({ ...fixtures.clerk.client, id: 'client_other' });
    await act(async () => {
      if (outcome === 'resolve') {
        deferred.resolve(organization());
      } else {
        deferred.reject(failure());
      }
      expect(await request).toBeNull();
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('blocks dispatch when its caller is inactive', async () => {
    const { wrapper, fixtures } = await setup();
    const { result } = renderHook(
      () => useCreateOrganizationFormModel({ flow: 'default', skipInvitationScreen: true }),
      { wrapper },
    );
    expect(await result.current.create(input, () => false)).toBeNull();
    expect(fixtures.clerk.createOrganization).not.toHaveBeenCalled();
  });

  it('does not upload or activate when the caller leaves during creation', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<ReturnType<typeof organization>>();
    fixtures.clerk.createOrganization.mockReturnValueOnce(deferred.promise);
    const { result } = renderHook(
      () => useCreateOrganizationFormModel({ flow: 'default', skipInvitationScreen: true }),
      { wrapper },
    );
    let active = true;
    const request = result.current.create({ ...input, file: new File(['logo'], 'logo.png') }, () => active);
    active = false;
    const created = organization();
    await act(async () => {
      deferred.resolve(created);
      expect(await request).toBeNull();
    });
    expect(created.setLogo).not.toHaveBeenCalled();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(result.current.isCreated).toBe(false);
  });

  it('does not activate when the caller leaves during logo upload', async () => {
    const { wrapper, fixtures } = await setup();
    const created = organization();
    fixtures.clerk.createOrganization.mockResolvedValueOnce(created);
    const deferred = createDeferredPromise<typeof created>();
    vi.mocked(created.setLogo).mockReturnValueOnce(deferred.promise);
    const { result } = renderHook(
      () => useCreateOrganizationFormModel({ flow: 'default', skipInvitationScreen: true }),
      { wrapper },
    );
    let active = true;
    const request = result.current.create({ ...input, file: new File(['logo'], 'logo.png') }, () => active);
    await waitFor(() => expect(created.setLogo).toHaveBeenCalledOnce());
    active = false;
    await act(async () => {
      deferred.resolve(created);
      expect(await request).toBeNull();
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('does not complete after its caller leaves during navigation', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.createOrganization.mockResolvedValueOnce(organization());
    const deferred = createDeferredPromise<void>();
    const navigate = vi.fn(() => deferred.promise);
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
    await act(async () => {
      await result.current.create(input);
    });
    await result.current.complete(() => false);
    expect(navigate).not.toHaveBeenCalled();
    let active = true;
    const request = result.current.complete(() => active);
    active = false;
    await act(async () => {
      deferred.resolve();
      await request;
    });
    expect(complete).not.toHaveBeenCalled();
  });

  it('does not revive old progress when configuration changes and returns', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<ReturnType<typeof organization>>();
    fixtures.clerk.createOrganization.mockReturnValueOnce(deferred.promise);
    const { result, rerender } = renderHook(
      ({ skip }) => useCreateOrganizationFormModel({ flow: 'default', skipInvitationScreen: skip }),
      { wrapper, initialProps: { skip: true } },
    );
    const old = result.current;
    const request = old.create(input);
    rerender({ skip: false });
    rerender({ skip: true });
    expect(result.current.scopeKey).not.toBe(old.scopeKey);
    await act(async () => {
      deferred.resolve(organization());
      expect(await request).toBeNull();
    });
    expect(await old.create(input)).toBeNull();
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('uses the latest completion callback without resetting same-source progress', async () => {
    const { wrapper, fixtures } = await setup();
    const created = organization();
    fixtures.clerk.createOrganization.mockResolvedValueOnce(created);
    const first = vi.fn().mockResolvedValue(undefined);
    const second = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ navigate }) =>
        useCreateOrganizationFormModel({
          flow: 'default',
          skipInvitationScreen: true,
          navigateAfterCreateOrganization: navigate,
        }),
      { wrapper, initialProps: { navigate: first } },
    );
    const oldKey = result.current.scopeKey;
    await act(async () => {
      await result.current.create(input);
    });
    rerender({ navigate: second });
    expect(result.current.scopeKey).toBe(oldKey);
    await act(async () => {
      await result.current.complete();
    });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledExactlyOnceWith(created);
  });

  it('cancels a queued controller submission on unmount', async () => {
    const { wrapper, fixtures } = await setup();
    const { result, unmount } = renderHook(
      () =>
        useCreateOrganizationFormController(
          useCreateOrganizationFormModel({ flow: 'default', skipInvitationScreen: true }),
        ),
      { wrapper: ({ children }) => wrapper({ children: <Card>{children}</Card> }) },
    );
    act(() => {
      result.current.onChangeName({ target: { value: 'Created organization' } } as never);
    });
    const request = result.current.onSubmit(event());
    unmount();
    await request;
    expect(fixtures.clerk.createOrganization).not.toHaveBeenCalled();
  });

  it.each([false, true])('keeps Form.Root as the loading owner during creation (Strict Mode: %s)', async strict => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<ReturnType<typeof organization>>();
    fixtures.clerk.createOrganization.mockReturnValueOnce(deferred.promise);
    const complete = vi.fn();
    const component = (
      <CreateOrganizationForm
        flow='default'
        skipInvitationScreen
        onComplete={complete}
      />
    );
    const view = render(strict ? <StrictMode>{component}</StrictMode> : component, { wrapper });
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Created organization' } });
    const button = screen.getByRole('button', { name: 'Create organization' });
    const form = view.container.querySelector('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    await waitFor(() => expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce());
    expect(button).toBeDisabled();
    await act(async () => {
      deferred.resolve(organization());
      await deferred.promise;
    });
    await waitFor(() => expect(complete).toHaveBeenCalledOnce());
    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it.each(['resolve', 'reject'] as const)(
    'resets a changed configuration and preserves the new request after an old %s',
    async outcome => {
      const { wrapper, fixtures } = await setup();
      const old = createDeferredPromise<ReturnType<typeof organization>>();
      const fresh = createDeferredPromise<ReturnType<typeof organization>>();
      fixtures.clerk.createOrganization.mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise);
      const complete = vi.fn();
      const view = render(
        <CreateOrganizationForm
          flow='default'
          skipInvitationScreen
          onComplete={complete}
        />,
        { wrapper },
      );
      fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Old organization' } });
      fireEvent.submit(view.container.querySelector('form')!);
      await waitFor(() => expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce());
      view.rerender(
        <CreateOrganizationForm
          flow='organizationList'
          skipInvitationScreen
          onComplete={complete}
        />,
      );
      expect(screen.getByLabelText(/Name/i)).toHaveValue('');
      fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Fresh organization' } });
      const button = screen.getByRole('button', { name: 'Create organization' });
      fireEvent.submit(view.container.querySelector('form')!);
      await waitFor(() => expect(fixtures.clerk.createOrganization).toHaveBeenCalledTimes(2));
      await act(async () => {
        if (outcome === 'resolve') {
          old.resolve(organization());
        } else {
          old.reject(failure());
        }
        await old.promise.catch(() => {});
      });
      expect(button).toBeDisabled();
      expect(screen.queryByText('Please try again')).not.toBeInTheDocument();
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
      await act(async () => {
        fresh.resolve(organization());
        await fresh.promise;
      });
      await waitFor(() => expect(complete).toHaveBeenCalledOnce());
    },
  );

  it('releases its completion token on unmount without releasing a later request', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.createOrganization.mockResolvedValueOnce(organization());
    const deferred = createDeferredPromise<void>();
    const navigate = vi.fn(() => deferred.promise);
    const complete = vi.fn();
    let model: CreateOrganizationFormData;
    let controller: ReturnType<typeof useCreateOrganizationFormController>;
    let card: ReturnType<typeof useCardState>;
    const Commands = ({ model }: { model: CreateOrganizationFormData }) => {
      controller = useCreateOrganizationFormController(model);
      return null;
    };
    const Host = withCardStateProvider(({ show }: { show: boolean }) => {
      model = useCreateOrganizationFormModel({
        flow: 'default',
        skipInvitationScreen: true,
        navigateAfterCreateOrganization: navigate,
        onComplete: complete,
      });
      card = useCardState();
      return show ? <Commands model={model} /> : null;
    });
    const view = render(<Host show />, { wrapper });
    await act(async () => {
      await model.create(input);
    });
    let request: Promise<void>;
    act(() => {
      request = controller.onComplete();
      expect(controller.onComplete()).toBe(request);
    });
    await waitFor(() => expect(navigate).toHaveBeenCalledOnce());
    expect(card!.isLoading).toBe(true);
    view.rerender(<Host show={false} />);
    expect(card!.isLoading).toBe(false);
    let release: (() => void) | undefined;
    act(() => {
      release = card.beginRequest();
    });
    expect(release).toBeDefined();
    await act(async () => {
      deferred.resolve();
      await request;
    });
    expect(card!.isLoading).toBe(true);
    expect(complete).not.toHaveBeenCalled();
    act(() => {
      release!();
    });
    expect(card!.isLoading).toBe(false);
  });

  it('does not clear another loading owner when removing a staged logo', async () => {
    const { wrapper } = await setup();
    const { result } = renderHook(
      () => {
        const model = useCreateOrganizationFormModel({ flow: 'default', skipInvitationScreen: true });
        return { controller: useCreateOrganizationFormController(model), card: useCardState() };
      },
      { wrapper: ({ children }) => wrapper({ children: <Card>{children}</Card> }) },
    );
    act(() => {
      result.current.controller.setFile(new File(['logo'], 'logo.png'));
    });
    act(() => {
      result.current.card.setLoading();
    });
    act(() => {
      result.current.controller.onAvatarRemove();
    });
    expect(result.current.controller.file).toBeNull();
    expect(result.current.card.isLoading).toBe(true);
    act(() => {
      result.current.card.setIdle();
    });
  });

  it('shows completion failure on the success page and permits retry', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.createOrganization.mockResolvedValueOnce(organization());
    const navigate = vi.fn().mockRejectedValueOnce(failure()).mockResolvedValueOnce(undefined);
    const complete = vi.fn();
    let model: CreateOrganizationFormData;
    let controller: ReturnType<typeof useCreateOrganizationFormController>;
    const Content = withCardStateProvider(({ model }: { model: CreateOrganizationFormData }) => {
      controller = useCreateOrganizationFormController(model);
      return <CreateOrganizationFormView {...controller} />;
    });
    const Host = () => {
      model = useCreateOrganizationFormModel({
        flow: 'default',
        skipInvitationScreen: false,
        navigateAfterCreateOrganization: navigate,
        onComplete: complete,
      });
      return <Content model={model} />;
    };
    render(<Host />, { wrapper });
    await act(async () => {
      await model.create(input);
    });
    act(() => {
      controller.onInviteSuccess();
    });
    act(() => {
      controller.onInviteSuccess();
    });
    const button = screen.getByRole('button', { name: 'Finish' });
    fireEvent.click(button);
    expect(await screen.findByText('Please try again')).toBeVisible();
    expect(button).toBeEnabled();
    fireEvent.click(button);
    await waitFor(() => expect(complete).toHaveBeenCalledOnce());
    expect(navigate).toHaveBeenCalledTimes(2);
  });
});
