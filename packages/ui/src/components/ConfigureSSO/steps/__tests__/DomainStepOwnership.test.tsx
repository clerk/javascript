import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

vi.mock('../../elements/Wizard/WizardContext', () => ({
  useWizard: () => ({ goNext: vi.fn(), goPrev: vi.fn(), isFirstStep: true, isLastStep: false }),
}));

import { useOrganizationDomainsStepController } from '../organization-domains-step.controller';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');
const setup = async () => {
  const { wrapper: Fixture } = await createFixtures();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{children}</CardStateProvider>
    </Fixture>
  );
  const request = createDeferredPromise<void>();
  const model = {
    scopeKey: 'first',
    canRun: vi.fn(() => true),
    createDomain: vi.fn(() => request.promise),
    toggleDomain: vi.fn(() => request.promise),
    prepareDomainOwnershipVerification: vi.fn(() => request.promise),
  };
  const hook = renderHook(props => useOrganizationDomainsStepController(props), { wrapper, initialProps: model });
  return { ...hook, model, request };
};
const failure = () =>
  new ClerkAPIResponseError('Request failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Request failed', long_message: 'Please try again' }],
  });

describe('SSO domain step request ownership', () => {
  it('blocks duplicate verification for one domain while allowing another domain', async () => {
    const { result, model, request } = await setup();
    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => {
      first = result.current.handlePrepareOwnershipVerification('first');
      void result.current.handlePrepareOwnershipVerification('first');
      second = result.current.handlePrepareOwnershipVerification('second');
    });
    expect(model.prepareDomainOwnershipVerification.mock.calls).toEqual([['first'], ['second']]);
    await act(async () => {
      request.resolve();
      await Promise.all([first, second]);
    });
  });

  it('does not let an earlier dialog close a newer removal dialog', async () => {
    const { result } = await setup();
    act(() => result.current.selectDomainForRemoval({ name: 'one.com', remove: vi.fn().mockResolvedValue(undefined) }));
    const earlierClose = result.current.closeRemoveDialog;
    act(() => result.current.closeRemoveDialog());
    act(() => result.current.selectDomainForRemoval({ name: 'two.com', remove: vi.fn().mockResolvedValue(undefined) }));
    act(() => earlierClose());
    expect(result.current.domainToRemove?.name).toBe('two.com');
  });

  it('releases selection loading after canonical owner loss', async () => {
    const { result, model, request } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.handleToggleDomain('one.com', true);
    });
    model.canRun.mockReturnValue(false);
    await act(async () => {
      request.reject(failure());
      await completion;
    });
    expect(result.current.isUpdatingDomains).toBe(false);
    expect(result.current.error).toBeUndefined();
    model.canRun.mockReturnValue(true);
    model.toggleDomain.mockResolvedValueOnce();
    await act(async () => result.current.handleToggleDomain('one.com', true));
    expect(model.toggleDomain).toHaveBeenCalledTimes(2);
  });

  it('starts one selection write for two calls before render', async () => {
    const { result, model, request } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.handleToggleDomain('one.com', true);
      void result.current.handleToggleDomain('two.com', true);
    });
    expect(model.toggleDomain).toHaveBeenCalledTimes(1);
    await act(async () => {
      request.resolve();
      await completion;
    });
    expect(result.current.isUpdatingDomains).toBe(false);
  });

  it('keeps a newer selection request pending and discards an earlier error', async () => {
    const { result, model, request, rerender } = await setup();
    let earlier!: Promise<void>;
    act(() => {
      earlier = result.current.handleToggleDomain('one.com', true);
    });
    const next = createDeferredPromise<void>();
    model.toggleDomain.mockReturnValueOnce(next.promise);
    rerender({ ...model, scopeKey: 'second' });
    let current!: Promise<void>;
    act(() => {
      current = result.current.handleToggleDomain('two.com', true);
    });
    await act(async () => {
      request.reject(failure());
      await earlier;
    });
    expect(result.current.error).toBeUndefined();
    expect(result.current.isUpdatingDomains).toBe(true);
    await act(async () => {
      next.resolve();
      await current;
    });
    expect(result.current.isUpdatingDomains).toBe(false);
  });

  it('shows a current error and permits retry', async () => {
    const { result, model, request } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.handleCreateDomain('one.com');
    });
    await act(async () => {
      request.reject(failure());
      await completion;
    });
    expect(result.current.error).toBeTruthy();
    model.createDomain.mockResolvedValueOnce();
    await act(async () => result.current.handleCreateDomain('one.com'));
    expect(result.current.error).toBeUndefined();
    expect(model.createDomain).toHaveBeenCalledTimes(2);
  });

  it('blocks retained commands after closure', async () => {
    const { result, unmount, model } = await setup();
    const retained = result.current;
    unmount();
    await retained.handleCreateDomain('one.com');
    await retained.handleToggleDomain('one.com', true);
    expect(model.createDomain).not.toHaveBeenCalled();
    expect(model.toggleDomain).not.toHaveBeenCalled();
  });

  it('resets the removal dialog on a connection change', async () => {
    const { result, rerender, model } = await setup();
    act(() => result.current.selectDomainForRemoval({ name: 'one.com', remove: vi.fn().mockResolvedValue(undefined) }));
    rerender({ ...model, scopeKey: 'second' });
    expect(result.current.domainToRemove).toBeNull();
  });

  it('blocks commands after canonical owner loss without render', async () => {
    const { result, model } = await setup();
    model.canRun.mockReturnValue(false);
    await result.current.handleCreateDomain('one.com');
    await result.current.handleToggleDomain('one.com', true);
    expect(model.createDomain).not.toHaveBeenCalled();
    expect(model.toggleDomain).not.toHaveBeenCalled();
  });
});
