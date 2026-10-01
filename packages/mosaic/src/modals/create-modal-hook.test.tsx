import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { UserProfileModalConfig } from '../features/user-profile/user-profile.modal.types';
import { MosaicProvider } from '../MosaicProvider';
import { createModalHook } from './create-modal-hook';
import type { ModalContentProps, ModalHandle } from './modal.types';
import { ModalHost } from './modal-host';

afterEach(() => cleanup());

type StubConfig = UserProfileModalConfig & {
  label?: string;
  tone?: string;
};

interface StubPayload {
  page?: string;
}

function StubContent({ config, payload }: ModalContentProps<StubConfig, StubPayload>) {
  return (
    <div aria-label='Stub'>
      <h2>Stub modal</h2>
      <output data-testid='config'>{JSON.stringify(config)}</output>
      <output data-testid='payload'>{JSON.stringify(payload ?? null)}</output>
    </div>
  );
}

function createStubModal() {
  const load = vi.fn(() => Promise.resolve({ default: StubContent }));
  const useStubModal = createModalHook({ id: 'stub', variant: 'card', load }, defaults => defaults.userProfile ?? {});
  return { load, useStubModal };
}

const flush = () =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

const readConfig = () => JSON.parse(screen.getByTestId('config').textContent ?? 'null');
const readPayload = () => JSON.parse(screen.getByTestId('payload').textContent ?? 'null');

function Caller({
  useModal,
  config,
  onHandle,
}: {
  useModal: (config?: StubConfig) => ModalHandle<StubPayload>;
  config?: StubConfig;
  onHandle: (handle: ModalHandle<StubPayload>) => void;
}) {
  const handle = useModal(config);
  onHandle(handle);
  return null;
}

describe('createModalHook', () => {
  it('opens and closes the surface and reports isOpen', async () => {
    const { useStubModal } = createStubModal();
    let handle: ModalHandle<StubPayload> | undefined;
    render(
      <MosaicProvider>
        <Caller
          useModal={useStubModal}
          onHandle={h => (handle = h)}
        />
      </MosaicProvider>,
    );
    await flush();

    expect(handle?.isOpen).toBe(false);
    expect(screen.queryByText('Stub modal')).not.toBeInTheDocument();

    act(() => handle?.open({ page: 'security' }));
    await flush();

    expect(handle?.isOpen).toBe(true);
    expect(screen.getByText('Stub modal')).toBeInTheDocument();
    expect(readPayload()).toEqual({ page: 'security' });

    act(() => handle?.close());
    await flush();

    expect(handle?.isOpen).toBe(false);
    expect(screen.queryByText('Stub modal')).not.toBeInTheDocument();
  });

  it('closes through the dialog dismissal and updates isOpen', async () => {
    const { useStubModal } = createStubModal();
    let handle: ModalHandle<StubPayload> | undefined;
    render(
      <MosaicProvider>
        <Caller
          useModal={useStubModal}
          onHandle={h => (handle = h)}
        />
      </MosaicProvider>,
    );
    await flush();
    act(() => handle?.open());
    await flush();

    act(() => {
      screen.getByRole('dialog').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    await flush();

    expect(handle?.isOpen).toBe(false);
  });

  it('loads the content once across preloads and opens', async () => {
    const { load, useStubModal } = createStubModal();
    let handle: ModalHandle<StubPayload> | undefined;
    render(
      <MosaicProvider>
        <Caller
          useModal={useStubModal}
          onHandle={h => (handle = h)}
        />
      </MosaicProvider>,
    );
    await flush();

    expect(load).not.toHaveBeenCalled();

    act(() => {
      handle?.preload();
      handle?.preload();
    });
    await flush();
    act(() => handle?.open());
    await flush();
    act(() => handle?.close());
    await flush();
    act(() => handle?.open());
    await flush();

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('renders preloaded content without a suspense fallback', async () => {
    const { useStubModal } = createStubModal();
    let handle: ModalHandle<StubPayload> | undefined;
    render(
      <MosaicProvider>
        <Caller
          useModal={useStubModal}
          onHandle={h => (handle = h)}
        />
      </MosaicProvider>,
    );
    await flush();
    act(() => handle?.preload());
    await flush();

    act(() => handle?.open());

    expect(screen.getByText('Stub modal')).toBeInTheDocument();
  });

  it('passes the latest caller config to the open modal', async () => {
    const { useStubModal } = createStubModal();
    let handle: ModalHandle<StubPayload> | undefined;
    const { rerender } = render(
      <MosaicProvider>
        <Caller
          useModal={useStubModal}
          config={{ label: 'first' }}
          onHandle={h => (handle = h)}
        />
      </MosaicProvider>,
    );
    await flush();
    act(() => handle?.open());
    await flush();

    expect(readConfig()).toEqual({ label: 'first' });

    rerender(
      <MosaicProvider>
        <Caller
          useModal={useStubModal}
          config={{ label: 'second' }}
          onHandle={h => (handle = h)}
        />
      </MosaicProvider>,
    );
    await flush();

    expect(readConfig()).toEqual({ label: 'second' });
  });

  it('keeps the last config when the caller unmounts while open', async () => {
    const { useStubModal } = createStubModal();
    let handle: ModalHandle<StubPayload> | undefined;
    const { rerender } = render(
      <MosaicProvider>
        <Caller
          useModal={useStubModal}
          config={{ label: 'kept' }}
          onHandle={h => (handle = h)}
        />
      </MosaicProvider>,
    );
    await flush();
    act(() => handle?.open({ page: 'account' }));
    await flush();

    rerender(<MosaicProvider>{null}</MosaicProvider>);
    await flush();

    expect(readConfig()).toEqual({ label: 'kept' });
    expect(readPayload()).toEqual({ page: 'account' });
  });

  it('shallow-merges provider defaults under the caller config', async () => {
    let handle: ModalHandle<StubPayload> | undefined;
    const useWithDefaults = createModalHook<StubConfig, StubPayload>(
      { id: 'stub-defaults', variant: 'card', load: () => Promise.resolve({ default: StubContent }) },
      () => ({ label: 'default', tone: 'neutral' }),
    );
    render(
      <MosaicProvider>
        <Caller
          useModal={useWithDefaults}
          config={{ label: 'caller' }}
          onHandle={h => (handle = h)}
        />
      </MosaicProvider>,
    );
    await flush();
    act(() => handle?.open());
    await flush();

    expect(readConfig()).toEqual({ label: 'caller', tone: 'neutral' });
  });

  it.todo('reads defaults from a public MosaicProvider prop once the modal API is public');

  it('reads defaults from the modal host', async () => {
    const { useStubModal } = createStubModal();
    let handle: ModalHandle<StubPayload> | undefined;
    render(
      <ModalHost defaults={{ userProfile: { pageOrder: ['security'] } }}>
        <Caller
          useModal={useStubModal}
          onHandle={h => (handle = h)}
        />
      </ModalHost>,
    );
    await flush();
    act(() => handle?.open());
    await flush();

    expect(readConfig()).toEqual({ pageOrder: ['security'] });
  });

  it('uses the config and payload of the last caller to open', async () => {
    const { useStubModal } = createStubModal();
    let first: ModalHandle<StubPayload> | undefined;
    let second: ModalHandle<StubPayload> | undefined;
    render(
      <MosaicProvider>
        <Caller
          useModal={useStubModal}
          config={{ label: 'first' }}
          onHandle={h => (first = h)}
        />
        <Caller
          useModal={useStubModal}
          config={{ label: 'second' }}
          onHandle={h => (second = h)}
        />
      </MosaicProvider>,
    );
    await flush();

    act(() => first?.open({ page: 'one' }));
    await flush();
    act(() => second?.open({ page: 'two' }));
    await flush();

    expect(readConfig()).toEqual({ label: 'second' });
    expect(readPayload()).toEqual({ page: 'two' });
    expect(first?.isOpen).toBe(true);
    expect(screen.getAllByText('Stub modal')).toHaveLength(1);
  });

  it('re-seeds the content when opened again while open', async () => {
    function SeededContent({ payload }: ModalContentProps<StubConfig, StubPayload>) {
      const [page] = React.useState(payload?.page);
      return <output data-testid='seeded'>{page}</output>;
    }
    const useSeededModal = createModalHook(
      { id: 'seeded', variant: 'card', load: () => Promise.resolve({ default: SeededContent }) },
      defaults => defaults.userProfile ?? {},
    );
    let handle: ModalHandle<StubPayload> | undefined;
    render(
      <MosaicProvider>
        <Caller
          useModal={useSeededModal}
          onHandle={h => (handle = h)}
        />
      </MosaicProvider>,
    );
    await flush();

    act(() => handle?.open({ page: 'account' }));
    await flush();
    expect(screen.getByTestId('seeded')).toHaveTextContent('account');

    act(() => handle?.open({ page: 'security' }));
    await flush();
    expect(screen.getByTestId('seeded')).toHaveTextContent('security');
  });

  it('keeps a host default when the caller leaves that key undefined', async () => {
    const { useStubModal } = createStubModal();
    let handle: ModalHandle<StubPayload> | undefined;
    render(
      <ModalHost defaults={{ userProfile: { pageOrder: ['security'] } }}>
        <Caller
          useModal={useStubModal}
          config={{ pageOrder: undefined, label: 'caller' }}
          onHandle={h => (handle = h)}
        />
      </ModalHost>,
    );
    await flush();

    act(() => handle?.open());
    await flush();

    expect(readConfig()).toEqual({ pageOrder: ['security'], label: 'caller' });
  });

  it('shows a retry inside the dialog when the content fails to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let failing = true;
    const load = vi.fn(() =>
      failing ? Promise.reject(new Error('chunk failed')) : Promise.resolve({ default: StubContent }),
    );
    const useFlakyModal = createModalHook(
      { id: 'flaky', variant: 'card', load },
      defaults => defaults.userProfile ?? {},
    );
    let handle: ModalHandle<StubPayload> | undefined;
    render(
      <MosaicProvider>
        <p>App content</p>
        <Caller
          useModal={useFlakyModal}
          onHandle={h => (handle = h)}
        />
      </MosaicProvider>,
    );
    await flush();

    act(() => handle?.open());
    await flush();

    expect(screen.getByText('App content')).toBeInTheDocument();
    expect(screen.queryByText('Stub modal')).not.toBeInTheDocument();

    failing = false;
    act(() => screen.getByRole('button', { name: 'Try again' }).click());
    await flush();

    expect(screen.getByText('Stub modal')).toBeInTheDocument();
  });

  it('loads the content on open after a failed preload', async () => {
    let failing = true;
    const load = vi.fn(() =>
      failing ? Promise.reject(new Error('chunk failed')) : Promise.resolve({ default: StubContent }),
    );
    const useFlakyModal = createModalHook(
      { id: 'flaky-preload', variant: 'card', load },
      defaults => defaults.userProfile ?? {},
    );
    let handle: ModalHandle<StubPayload> | undefined;
    render(
      <MosaicProvider>
        <Caller
          useModal={useFlakyModal}
          onHandle={h => (handle = h)}
        />
      </MosaicProvider>,
    );
    await flush();

    act(() => handle?.preload());
    await flush();
    failing = false;
    act(() => handle?.open());
    await flush();

    expect(screen.getByText('Stub modal')).toBeInTheDocument();
  });

  it('throws a clear error outside MosaicProvider', () => {
    const { useStubModal } = createStubModal();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => renderHook(() => useStubModal())).toThrow(/stub.*MosaicProvider/);
  });
});
