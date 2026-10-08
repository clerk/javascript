import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { FormEvent, PropsWithChildren } from 'react';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@/test/utils';
import { createFakeOrganization } from '@/ui/components/OrganizationSwitcher/__tests__/test-utils';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { useCreateOrganizationScreenController } from '../create-organization-screen.controller';
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
const defaults = (name: string) => ({ advisory: null, form: { name, slug: name.toLowerCase(), logo: null } });
const event = () => ({ preventDefault: vi.fn() }) as unknown as FormEvent;
const Card = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('task organization creation request lifecycle', () => {
  it('blocks dispatch for an inactive caller', async () => {
    const { wrapper, fixtures } = await setup();
    const { result } = renderHook(() => useCreateOrganizationScreenModel(), { wrapper });
    await result.current.create('Created organization', 'created', undefined, undefined, () => false);
    expect(fixtures.clerk.createOrganization).not.toHaveBeenCalled();
  });

  it('blocks upload and activation when the caller closes during creation', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<ReturnType<typeof organization>>();
    fixtures.clerk.createOrganization.mockReturnValueOnce(deferred.promise);
    const { result } = renderHook(() => useCreateOrganizationScreenModel(), { wrapper });
    let active = true;
    const request = result.current.create(
      'Created organization',
      'created',
      new File(['logo'], 'logo.png'),
      undefined,
      () => active,
    );
    active = false;
    const created = organization();
    await act(async () => {
      deferred.resolve(created);
      await request;
    });
    expect(created.setLogo).not.toHaveBeenCalled();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(result.current.isCreated).toBe(false);
  });

  it('blocks activation when the caller closes during logo upload', async () => {
    const { wrapper, fixtures } = await setup();
    const created = organization();
    const deferred = createDeferredPromise<typeof created>();
    fixtures.clerk.createOrganization.mockResolvedValueOnce(created);
    vi.mocked(created.setLogo).mockReturnValueOnce(deferred.promise);
    const { result } = renderHook(() => useCreateOrganizationScreenModel(), { wrapper });
    let active = true;
    const request = result.current.create(
      'Created organization',
      'created',
      new File(['logo'], 'logo.png'),
      undefined,
      () => active,
    );
    await waitFor(() => expect(created.setLogo).toHaveBeenCalledOnce());
    active = false;
    await act(async () => {
      deferred.resolve(created);
      await request;
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it.each(['fetch', 'body'] as const)('aborts a logo download after defaults change during %s', async stage => {
    const { wrapper, fixtures } = await setup();
    const created = organization();
    fixtures.clerk.createOrganization.mockResolvedValueOnce(created);
    const response = createDeferredPromise<Response>();
    const body = createDeferredPromise<Blob>();
    const blob = vi.fn(() => body.promise);
    const fetchLogo = vi.fn((_url: string, _options?: RequestInit) => response.promise);
    vi.stubGlobal('fetch', fetchLogo);
    const { result, rerender } = renderHook(({ name }) => useCreateOrganizationScreenModel(undefined, defaults(name)), {
      wrapper,
      initialProps: { name: 'First' },
    });
    const request = result.current.create('First', 'first', undefined, 'https://example.com/logo.png');
    await waitFor(() => expect(fetchLogo).toHaveBeenCalledOnce());
    if (stage === 'body') {
      await act(async () => {
        response.resolve({ blob } as unknown as Response);
        await Promise.resolve();
      });
      await waitFor(() => expect(blob).toHaveBeenCalledOnce());
    }
    const signal = fetchLogo.mock.calls[0][1]?.signal as AbortSignal;
    rerender({ name: 'Second' });
    expect(signal.aborted).toBe(true);
    await act(async () => {
      response.resolve({ blob } as unknown as Response);
      body.resolve(new Blob(['logo'], { type: 'image/png' }));
      await request;
    });
    expect(created.setLogo).not.toHaveBeenCalled();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('does not revive an old request after the redirect target changes and returns', async () => {
    const { wrapper, fixtures, props } = await setup();
    const deferred = createDeferredPromise<ReturnType<typeof organization>>();
    fixtures.clerk.createOrganization.mockReturnValueOnce(deferred.promise);
    const { result, rerender } = renderHook(() => useCreateOrganizationScreenModel(), { wrapper });
    const old = result.current;
    const request = old.create('Created organization', 'created');
    props.setProps({ redirectUrlComplete: '/second' });
    rerender();
    props.setProps({ redirectUrlComplete: '/done' });
    rerender();
    expect(result.current.scopeKey).not.toBe(old.scopeKey);
    await act(async () => {
      deferred.resolve(organization());
      await request;
    });
    await old.create('Another organization', 'another');
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('preserves typed values when defaults have the same values', async () => {
    const { wrapper } = await setup();
    const view = render(<CreateOrganizationScreen organizationCreationDefaults={defaults('First')} />, { wrapper });
    const input = screen.getByLabelText(/Name/i);
    fireEvent.change(input, { target: { value: 'Edited organization' } });
    view.rerender(<CreateOrganizationScreen organizationCreationDefaults={defaults('First')} />);
    expect(screen.getByLabelText(/Name/i)).toBe(input);
    expect(input).toHaveValue('Edited organization');
  });

  it.each(['resolve', 'reject'] as const)(
    'resets changed defaults and keeps the new form pending after an old %s',
    async outcome => {
      const { wrapper, fixtures } = await setup();
      const old = createDeferredPromise<ReturnType<typeof organization>>();
      const fresh = createDeferredPromise<ReturnType<typeof organization>>();
      fixtures.clerk.createOrganization.mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise);
      const view = render(<CreateOrganizationScreen organizationCreationDefaults={defaults('First')} />, { wrapper });
      fireEvent.submit(view.container.querySelector('form')!);
      await waitFor(() => expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce());
      view.rerender(<CreateOrganizationScreen organizationCreationDefaults={defaults('Second')} />);
      expect(screen.getByLabelText(/Name/i)).toHaveValue('Second');
      const button = screen.getByRole('button', { name: 'Continue' });
      expect(button).toBeEnabled();
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
      await waitFor(() => expect(button).toBeEnabled());
      expect(fixtures.clerk.setActive).toHaveBeenCalledOnce();
    },
  );

  it('cancels queued controller dispatch when the controller closes', async () => {
    const { wrapper, fixtures } = await setup();
    const { result, unmount } = renderHook(
      () => useCreateOrganizationScreenController(useCreateOrganizationScreenModel(), defaults('First')),
      { wrapper: ({ children }) => wrapper({ children: <Card>{children}</Card> }) },
    );
    const request = result.current.onSubmit(event());
    unmount();
    await request;
    expect(fixtures.clerk.createOrganization).not.toHaveBeenCalled();
  });

  it('shares the pending submission across rerenders', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<ReturnType<typeof organization>>();
    fixtures.clerk.createOrganization.mockReturnValueOnce(deferred.promise);
    const { result, rerender } = renderHook(
      () => useCreateOrganizationScreenController(useCreateOrganizationScreenModel(), defaults('First')),
      { wrapper: ({ children }) => wrapper({ children: <Card>{children}</Card> }) },
    );
    const request = result.current.onSubmit(event());
    expect(result.current.onSubmit(event())).toBe(request);
    rerender();
    expect(result.current.onSubmit(event())).toBe(request);
    await act(async () => {
      await Promise.resolve();
    });
    expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.resolve(organization());
      await request;
    });
  });

  it('does not clear another loading owner when removing a staged logo', async () => {
    const { wrapper } = await setup();
    const { result } = renderHook(
      () => ({
        controller: useCreateOrganizationScreenController(useCreateOrganizationScreenModel()),
        card: useCardState(),
      }),
      { wrapper: ({ children }) => wrapper({ children: <Card>{children}</Card> }) },
    );
    await act(async () => {
      await result.current.controller.onAvatarChange(new File(['logo'], 'logo.png'));
    });
    act(() => {
      result.current.card.setLoading();
    });
    act(() => {
      result.current.controller.onAvatarRemove();
    });
    expect(result.current.controller.hasAvatar).toBe(false);
    expect(result.current.card.isLoading).toBe(true);
    act(() => {
      result.current.card.setIdle();
    });
  });

  it.each([false, true])(
    'preserves rendered navigation when the SDK transition closes the form (Strict Mode: %s)',
    async strict => {
      const { wrapper, fixtures } = await setup();
      fixtures.clerk.createOrganization.mockResolvedValueOnce(organization());
      const user = fixtures.clerk.user!;
      const session = fixtures.clerk.session!;
      const component = <CreateOrganizationScreen organizationCreationDefaults={defaults('First')} />;
      const view = render(strict ? <StrictMode>{component}</StrictMode> : component, { wrapper });
      fixtures.clerk.setActive.mockImplementationOnce(async ({ navigate }) => {
        fixtures.clerk.__internal_setActiveInProgress = true;
        vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(undefined);
        vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(undefined);
        view.unmount();
        await navigate?.({ session: { ...session, user, currentTask: null }, decorateUrl: url => url });
        fixtures.clerk.__internal_setActiveInProgress = false;
      });
      fireEvent.submit(view.container.querySelector('form')!);
      await waitFor(() => expect(fixtures.router.navigate).toHaveBeenCalledWith('/done'));
      expect(fixtures.clerk.createOrganization).toHaveBeenCalledOnce();
    },
  );

  it('rejects a navigation callback after setActive has settled', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.createOrganization.mockResolvedValueOnce(organization());
    let navigate: Parameters<typeof fixtures.clerk.setActive>[0]['navigate'];
    fixtures.clerk.setActive.mockImplementationOnce(async params => {
      navigate = params.navigate;
      await Promise.resolve();
    });
    const { result } = renderHook(() => useCreateOrganizationScreenModel(), { wrapper });
    await act(async () => {
      await result.current.create('First', 'first');
    });
    await navigate?.({
      session: { ...fixtures.clerk.session!, user: fixtures.clerk.user!, currentTask: null },
      decorateUrl: url => url,
    });
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });

  it('navigates once when the activation callback is called twice before rendering', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.createOrganization.mockResolvedValueOnce(organization());
    fixtures.clerk.setActive.mockImplementationOnce(async ({ navigate }) => {
      const args = {
        session: { ...fixtures.clerk.session!, user: fixtures.clerk.user!, currentTask: null },
        decorateUrl: (url: string) => url,
      };
      await Promise.all([navigate?.(args), navigate?.(args)]);
    });
    const { result } = renderHook(() => useCreateOrganizationScreenModel(), { wrapper });
    await act(async () => {
      await result.current.create('First', 'first');
    });
    expect(fixtures.router.navigate).toHaveBeenCalledExactlyOnceWith('/done');
  });

  it('rejects old navigation when the redirect changes during the owned transition', async () => {
    const { wrapper, fixtures, props } = await setup();
    fixtures.clerk.createOrganization.mockResolvedValueOnce(organization());
    const user = fixtures.clerk.user!;
    const session = fixtures.clerk.session!;
    const activation = createDeferredPromise<void>();
    let navigate: Parameters<typeof fixtures.clerk.setActive>[0]['navigate'];
    fixtures.clerk.setActive.mockImplementationOnce(params => {
      navigate = params.navigate;
      return activation.promise;
    });
    const { result, rerender } = renderHook(() => useCreateOrganizationScreenModel(), { wrapper });
    const oldKey = result.current.scopeKey;
    const request = result.current.create('First', 'first');
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledOnce());
    fixtures.clerk.__internal_setActiveInProgress = true;
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(undefined);
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(undefined);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      user: undefined,
      session: undefined,
    };
    props.setProps({ redirectUrlComplete: '/other' });
    rerender();
    expect(result.current.scopeKey).not.toBe(oldKey);
    await act(async () => {
      await navigate?.({ session: { ...session, user, currentTask: null }, decorateUrl: url => url });
      activation.resolve();
      await request;
    });
    fixtures.clerk.__internal_setActiveInProgress = false;
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });
});
