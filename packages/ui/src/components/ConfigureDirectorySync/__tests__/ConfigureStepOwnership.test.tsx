import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook, waitFor } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useConfigureStepController } from '../steps/configure-step.controller';
import type { useConfigureStepModel } from '../steps/configure-step.model';

const { next } = vi.hoisted(() => ({ next: vi.fn() }));
vi.mock('../../ConfigureSSO/elements/Wizard', async original => ({
  ...(await original<typeof import('../../ConfigureSSO/elements/Wizard')>()),
  useWizard: () => ({ goNext: next }),
}));
const { createFixtures } = bindCreateFixtures('ConfigureDirectorySync');
const failure = () =>
  new ClerkAPIResponseError('Request failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Request failed', long_message: 'Request failed' }],
  });
const setup = async (isPull = false, empty = false) => {
  const { wrapper: Fixture } = await createFixtures();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{children}</CardStateProvider>
    </Fixture>
  );
  const rotation = createDeferredPromise<void>();
  const creation = createDeferredPromise<void>();
  const submission = createDeferredPromise<boolean>();
  const rotate = vi.fn(() => rotation.promise);
  const create = vi.fn(() => creation.promise);
  const submit = vi.fn(() => submission.promise);
  const canRun = vi.fn(() => true);
  const model: ReturnType<typeof useConfigureStepModel> = {
    requestKey: 'connection_1',
    directoryKey: empty ? 'no_directory' : 'directory_1',
    canRun,
    directory: empty ? null : { endpointUrl: 'https://example.com/scim' },
    canProvision: true,
    createDirectory: create,
    rotateToken: rotate,
    isPull,
    credentials: {
      canContinue: true,
      submit,
      fileName: null,
      subjectEmail: '',
      fileError: null,
      isConfigured: true,
      setSubjectEmail: vi.fn(),
      selectFile: vi.fn(() => Promise.resolve()),
    },
    connection: { name: 'Acme', active: true, domains: [] },
    providerName: undefined,
    instructions: [],
    revealedToken: null,
    tokenPlaceholder: '',
  };
  const hook = renderHook(({ data }) => ({ controller: useConfigureStepController(data), card: useCardState() }), {
    wrapper,
    initialProps: { data: model },
  });
  return { ...hook, model, rotation, creation, submission, rotate, create, submit, canRun };
};

beforeEach(() => next.mockClear());

describe('Directory Sync configure step ownership', () => {
  it('does not create another directory when one already exists', async () => {
    const { result, create } = await setup();
    await result.current.controller.retryCreateDirectory();
    expect(create).not.toHaveBeenCalled();
  });
  it('starts only one rotation before render', async () => {
    const { result, rotate, rotation } = await setup();
    let completion: unknown;
    act(() => {
      completion = result.current.controller.generateToken();
      void result.current.controller.generateToken();
    });
    expect(rotate).toHaveBeenCalledTimes(1);
    await act(async () => {
      rotation.resolve();
      await completion;
    });
  });

  it('does not navigate after a credential submit finishes after unmount', async () => {
    const { result, unmount, submission } = await setup(true);
    let completion: unknown;
    act(() => {
      completion = result.current.controller.onContinue();
    });
    unmount();
    submission.resolve(true);
    await completion;
    await Promise.resolve();
    expect(next).not.toHaveBeenCalled();
  });

  it('does not navigate after the directory changes during submission', async () => {
    const { result, model, rerender, submission } = await setup(true);
    let completion: unknown;
    act(() => {
      completion = result.current.controller.onContinue();
    });
    rerender({ data: { ...model, directoryKey: 'directory_2' } });
    await act(async () => {
      submission.resolve(true);
      await completion;
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks retained actions after unmount', async () => {
    const { result, unmount, rotate, create } = await setup();
    const retained = result.current.controller;
    unmount();
    await retained.generateToken();
    await retained.retryCreateDirectory();
    await retained.onContinue();
    expect(rotate).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('releases old loading on directory replacement without settling a later rotation', async () => {
    const { result, model, rerender, rotation, rotate } = await setup();
    let earlier: unknown;
    act(() => {
      earlier = result.current.controller.generateToken();
    });
    rerender({ data: { ...model, directoryKey: 'directory_2' } });
    expect(result.current.card.isLoading).toBe(false);
    const current = createDeferredPromise<void>();
    rotate.mockReturnValueOnce(current.promise);
    let completion: unknown;
    act(() => {
      completion = result.current.controller.generateToken();
    });
    await act(async () => {
      rotation.resolve();
      await earlier;
    });
    expect(result.current.card.isLoading).toBe(true);
    await act(async () => {
      current.resolve();
      await completion;
    });
    expect(result.current.card.isLoading).toBe(false);
  });

  it('blocks commands and navigation when source ownership is lost before render', async () => {
    const { result, canRun, rotate, create } = await setup();
    canRun.mockReturnValue(false);
    await result.current.controller.generateToken();
    await result.current.controller.retryCreateDirectory();
    await result.current.controller.onContinue();
    expect(rotate).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('discards an old error when source ownership changes and releases loading', async () => {
    const { result, canRun, rotation } = await setup();
    let completion: unknown;
    act(() => {
      completion = result.current.controller.generateToken();
    });
    canRun.mockReturnValue(false);
    await act(async () => {
      rotation.reject(failure());
      await completion;
    });
    expect(result.current.card.error).toBeUndefined();
    expect(result.current.card.isLoading).toBe(false);
  });

  it('preserves the create request across its own directory appearance', async () => {
    const { result, model, rerender, creation, create } = await setup(false, true);
    expect(create).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.card.isLoading).toBe(true));
    rerender({
      data: { ...model, directoryKey: 'directory_1', directory: { endpointUrl: 'https://example.com/scim' } },
    });
    expect(result.current.card.isLoading).toBe(true);
    await act(async () => {
      creation.resolve();
      await creation.promise;
    });
    expect(result.current.card.isLoading).toBe(false);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('starts automatic creation for a new connection', async () => {
    const { model, rerender, creation, create } = await setup(false, true);
    await act(async () => {
      creation.resolve();
      await creation.promise;
    });
    create.mockResolvedValueOnce();
    act(() => {
      rerender({ data: { ...model, requestKey: 'connection_2', directoryKey: 'no_directory_2' } });
    });
    await waitFor(() => expect(create).toHaveBeenCalledTimes(2));
  });

  it('clears instructions for a new connection and blocks an old toggle', async () => {
    const { result, model, rerender } = await setup();
    const retained = result.current.controller;
    act(() => retained.toggleInstructions());
    rerender({ data: { ...model, requestKey: 'connection_2', directoryKey: 'directory_2' } });
    expect(result.current.controller.isInstructionsOpen).toBe(false);
    act(() => retained.toggleInstructions());
    expect(result.current.controller.isInstructionsOpen).toBe(false);
  });

  it('shows a current API error and permits retry', async () => {
    const { result, rotation, rotate } = await setup();
    let completion: unknown;
    act(() => {
      completion = result.current.controller.generateToken();
    });
    await act(async () => {
      rotation.reject(failure());
      await completion;
    });
    expect(result.current.card.error).toBe('Request failed');
    rotate.mockResolvedValueOnce();
    await act(async () => {
      await result.current.controller.generateToken();
    });
    expect(result.current.card.error).toBeUndefined();
    expect(rotate).toHaveBeenCalledTimes(2);
  });
});
