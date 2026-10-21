import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';

import type { UserProfileModalOptions } from '../features/user-profile/user-profile.modal.types';
import { MosaicProvider } from '../mosaic-provider';
import { createModalHook } from './create-modal-hook';
import type { ModalContentProps, ModalHandle } from './modal.types';
import { ModalHost } from './modal-host';

afterEach(() => cleanup());

type StubOptions = UserProfileModalOptions & {
  label?: string;
  tone?: string;
};

function StubContent({ options }: ModalContentProps<StubOptions>) {
  return (
    <div aria-label='Stub'>
      <h2>Stub modal</h2>
      <output data-testid='options'>{JSON.stringify(options)}</output>
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

const readOptions = () => JSON.parse(screen.getByTestId('options').textContent ?? 'null');

function Caller({
  useModal,
  onHandle,
}: {
  useModal: () => ModalHandle<StubOptions>;
  onHandle: (handle: ModalHandle<StubOptions>) => void;
}) {
  const handle = useModal();
  onHandle(handle);
  return null;
}

class AppBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    return this.state.error ? <p>App caught: {this.state.error.message}</p> : this.props.children;
  }
}

describe('createModalHook', () => {
  it('opens and closes the surface and reports isOpen', async () => {
    const { useStubModal } = createStubModal();
    let handle: ModalHandle<StubOptions> | undefined;
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
    expect(readOptions()).toEqual({ page: 'security' });

    act(() => handle?.close());
    await flush();

    expect(handle?.isOpen).toBe(false);
    expect(screen.queryByText('Stub modal')).not.toBeInTheDocument();
  });

  it('closes through the dialog dismissal and updates isOpen', async () => {
    const { useStubModal } = createStubModal();
    let handle: ModalHandle<StubOptions> | undefined;
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
    let handle: ModalHandle<StubOptions> | undefined;
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
    let handle: ModalHandle<StubOptions> | undefined;
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

  it('opens a fresh copy of the options each time', async () => {
    const { useStubModal } = createStubModal();
    let handle: ModalHandle<StubOptions> | undefined;
    render(
      <MosaicProvider>
        <Caller
          useModal={useStubModal}
          onHandle={h => (handle = h)}
        />
      </MosaicProvider>,
    );
    await flush();

    act(() => handle?.open({ label: 'first' }));
    await flush();
    expect(readOptions()).toEqual({ label: 'first' });

    act(() => handle?.close());
    await flush();
    act(() => handle?.open());
    await flush();

    expect(readOptions()).toEqual({});
  });

  it('stays open with its options when the caller unmounts', async () => {
    const { useStubModal } = createStubModal();
    let handle: ModalHandle<StubOptions> | undefined;
    const { rerender } = render(
      <MosaicProvider>
        <Caller
          useModal={useStubModal}
          onHandle={h => (handle = h)}
        />
      </MosaicProvider>,
    );
    await flush();
    act(() => handle?.open({ label: 'kept', page: 'account' }));
    await flush();

    rerender(<MosaicProvider>{null}</MosaicProvider>);
    await flush();

    expect(readOptions()).toEqual({ label: 'kept', page: 'account' });
  });

  it('portals into the container it was opened with', async () => {
    const container = document.body.appendChild(document.createElement('div'));
    onTestFinished(() => container.remove());
    const { useStubModal } = createStubModal();
    let handle: ModalHandle<StubOptions> | undefined;
    render(
      <MosaicProvider>
        <Caller
          useModal={useStubModal}
          onHandle={h => (handle = h)}
        />
      </MosaicProvider>,
    );
    await flush();

    act(() => handle?.open({}, container));

    expect(container).toContainElement(await screen.findByLabelText('Stub'));
  });

  it('leaves the container behind when the next caller opens without one', async () => {
    const container = document.body.appendChild(document.createElement('div'));
    onTestFinished(() => container.remove());
    const { useStubModal } = createStubModal();
    let handle: ModalHandle<StubOptions> | undefined;
    render(
      <MosaicProvider>
        <Caller
          useModal={useStubModal}
          onHandle={h => (handle = h)}
        />
      </MosaicProvider>,
    );
    await flush();
    act(() => handle?.open({}, container));
    await screen.findByLabelText('Stub');
    act(() => handle?.close());
    await flush();

    act(() => handle?.open({}));

    expect(container).not.toContainElement(await screen.findByLabelText('Stub'));
  });

  it('shallow-merges provider defaults under the options it was opened with', async () => {
    let handle: ModalHandle<StubOptions> | undefined;
    const useWithDefaults = createModalHook<StubOptions>(
      { id: 'stub-defaults', variant: 'card', load: () => Promise.resolve({ default: StubContent }) },
      () => ({ label: 'default', tone: 'neutral' }),
    );
    render(
      <MosaicProvider>
        <Caller
          useModal={useWithDefaults}
          onHandle={h => (handle = h)}
        />
      </MosaicProvider>,
    );
    await flush();
    act(() => handle?.open({ label: 'caller' }));
    await flush();

    expect(readOptions()).toEqual({ label: 'caller', tone: 'neutral' });
  });

  it.todo('reads defaults from a public MosaicProvider prop once the modal API is public');

  it('reads defaults from the modal host', async () => {
    const { useStubModal } = createStubModal();
    let handle: ModalHandle<StubOptions> | undefined;
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

    expect(readOptions()).toEqual({ pageOrder: ['security'] });
  });

  it('shows the options of the last caller to open', async () => {
    const { useStubModal } = createStubModal();
    let first: ModalHandle<StubOptions> | undefined;
    let second: ModalHandle<StubOptions> | undefined;
    render(
      <MosaicProvider>
        <Caller
          useModal={useStubModal}
          onHandle={h => (first = h)}
        />
        <Caller
          useModal={useStubModal}
          onHandle={h => (second = h)}
        />
      </MosaicProvider>,
    );
    await flush();

    act(() => first?.open({ label: 'first', page: 'one' }));
    await flush();
    act(() => second?.open({ label: 'second', page: 'two' }));
    await flush();

    expect(readOptions()).toEqual({ label: 'second', page: 'two' });
    expect(first?.isOpen).toBe(true);
    expect(screen.getAllByText('Stub modal')).toHaveLength(1);
  });

  it('re-seeds the content when opened again while open', async () => {
    function SeededContent({ options }: ModalContentProps<StubOptions>) {
      const [page] = React.useState(options.page);
      return <output data-testid='seeded'>{page}</output>;
    }
    const useSeededModal = createModalHook(
      { id: 'seeded', variant: 'card', load: () => Promise.resolve({ default: SeededContent }) },
      defaults => defaults.userProfile ?? {},
    );
    let handle: ModalHandle<StubOptions> | undefined;
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

  it('keeps a host default when the options leave that key undefined', async () => {
    const { useStubModal } = createStubModal();
    let handle: ModalHandle<StubOptions> | undefined;
    render(
      <ModalHost defaults={{ userProfile: { pageOrder: ['security'] } }}>
        <Caller
          useModal={useStubModal}
          onHandle={h => (handle = h)}
        />
      </ModalHost>,
    );
    await flush();

    act(() => handle?.open({ pageOrder: undefined, label: 'caller' }));
    await flush();

    expect(readOptions()).toEqual({ pageOrder: ['security'], label: 'caller' });
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
    let handle: ModalHandle<StubOptions> | undefined;
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

  it('lets an error the loaded content throws reach the app', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    function BrokenContent(): React.ReactElement {
      throw new Error('profile crashed');
    }
    const useBrokenModal = createModalHook(
      { id: 'broken', variant: 'card', load: () => Promise.resolve({ default: BrokenContent }) },
      defaults => defaults.userProfile ?? {},
    );
    let handle: ModalHandle<StubOptions> | undefined;
    render(
      <AppBoundary>
        <MosaicProvider>
          <Caller
            useModal={useBrokenModal}
            onHandle={h => (handle = h)}
          />
        </MosaicProvider>
      </AppBoundary>,
    );
    await flush();

    act(() => handle?.open());
    await flush();

    expect(screen.getByText('App caught: profile crashed')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
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
    let handle: ModalHandle<StubOptions> | undefined;
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
