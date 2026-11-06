import { logger } from '@clerk/shared/logger';
import { act, cleanup, configure, render, renderHook, screen, within } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';

import type { MosaicProviderProps } from '../mosaic-provider';
import { MosaicProvider } from '../mosaic-provider';
import { useRouterScope } from '../routing/use-router';
import { useVirtualSegment } from '../routing/virtual-store';
import { defineModalSurface } from './define-modal-surface';
import type { ModalContentProps, ModalHandle, ModalSurface, ModalSurfaces } from './modal.types';
import { ModalHost } from './modal-host';
import { useModal } from './use-modal';

afterEach(() => cleanup());

interface StubOptions {
  label?: string;
  page?: string;
}

function StubContent({ options }: ModalContentProps<StubOptions>) {
  return (
    <div aria-label='Stub'>
      <h2>Stub modal</h2>
      <output data-testid='options'>{JSON.stringify(options ?? null)}</output>
    </div>
  );
}

function stubSurface(id = 'stub', load = () => Promise.resolve({ default: StubContent })) {
  return defineModalSurface<StubOptions>({ id, variant: 'card', load: vi.fn(load) });
}

const flush = () =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

const readOptions = () => JSON.parse(screen.getByTestId('options').textContent ?? 'null');

function Caller<Options>({
  surface,
  onHandle,
}: {
  surface: ModalSurface<Options>;
  onHandle: (handle: ModalHandle<Options>) => void;
}) {
  onHandle(useModal(surface));
  return null;
}

function renderWithModals(
  surfaces: ModalSurfaces,
  ui: React.ReactNode,
  providerProps: Omit<MosaicProviderProps, 'children'> = {},
) {
  const wrap = (children: React.ReactNode) => (
    <MosaicProvider {...providerProps}>
      <ModalHost surfaces={surfaces}>{children}</ModalHost>
    </MosaicProvider>
  );
  const result = render(wrap(ui));
  return { ...result, rerender: (next: React.ReactNode) => result.rerender(wrap(next)) };
}

function renderCaller(surface: ModalSurface<StubOptions>, providerProps?: Omit<MosaicProviderProps, 'children'>) {
  const ref: { handle: ModalHandle<StubOptions> | undefined } = { handle: undefined };
  const result = renderWithModals(
    [surface],
    <Caller
      surface={surface}
      onHandle={h => (ref.handle = h)}
    />,
    providerProps,
  );
  return { ref, ...result };
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

describe('useModal', () => {
  it('opens and closes the surface and reports isOpen', async () => {
    const { ref } = renderCaller(stubSurface());
    await flush();

    expect(ref.handle?.isOpen).toBe(false);
    expect(screen.queryByText('Stub modal')).not.toBeInTheDocument();

    act(() => ref.handle?.open({ page: 'security' }));
    await flush();

    expect(ref.handle?.isOpen).toBe(true);
    expect(screen.getByText('Stub modal')).toBeInTheDocument();
    expect(readOptions()).toEqual({ page: 'security' });

    act(() => ref.handle?.close());
    await flush();

    expect(ref.handle?.isOpen).toBe(false);
    expect(screen.queryByText('Stub modal')).not.toBeInTheDocument();
  });

  it('closes through the dialog dismissal and updates isOpen', async () => {
    const { ref } = renderCaller(stubSurface());
    await flush();
    act(() => ref.handle?.open());
    await flush();

    act(() => {
      screen.getByRole('dialog').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    await flush();

    expect(ref.handle?.isOpen).toBe(false);
  });

  it('opens and closes each surface on its own', async () => {
    function OtherContent() {
      return <h2>Other modal</h2>;
    }
    const stub = stubSurface();
    const other = defineModalSurface<StubOptions>({
      id: 'other',
      variant: 'card',
      load: () => Promise.resolve({ default: OtherContent }),
    });
    let stubHandle: ModalHandle<StubOptions> | undefined;
    let otherHandle: ModalHandle<StubOptions> | undefined;
    renderWithModals(
      [stub, other],
      <>
        <Caller
          surface={stub}
          onHandle={h => (stubHandle = h)}
        />
        <Caller
          surface={other}
          onHandle={h => (otherHandle = h)}
        />
      </>,
    );
    await flush();

    act(() => otherHandle?.open());
    await flush();

    expect(otherHandle?.isOpen).toBe(true);
    expect(stubHandle?.isOpen).toBe(false);
    expect(screen.getByText('Other modal')).toBeInTheDocument();
    expect(screen.queryByText('Stub modal')).not.toBeInTheDocument();
  });

  it('loads the content once across preloads and opens', async () => {
    const surface = stubSurface();
    const { ref } = renderCaller(surface);
    await flush();

    expect(surface.load).not.toHaveBeenCalled();

    act(() => {
      ref.handle?.preload();
      ref.handle?.preload();
    });
    await flush();
    act(() => ref.handle?.open());
    await flush();
    act(() => ref.handle?.close());
    await flush();
    act(() => ref.handle?.open());
    await flush();

    expect(surface.load).toHaveBeenCalledTimes(1);
  });

  it('renders preloaded content as soon as it opens', async () => {
    const { ref } = renderCaller(stubSurface());
    await flush();
    act(() => ref.handle?.preload());
    await flush();

    act(() => ref.handle?.open());

    expect(screen.getByText('Stub modal')).toBeInTheDocument();
  });

  it('opens nothing until the content has loaded', async () => {
    let resolveLoad: (module: { default: typeof StubContent }) => void = () => {};
    const surface = stubSurface(
      'slow',
      () =>
        new Promise<{ default: typeof StubContent }>(resolve => {
          resolveLoad = resolve;
        }),
    );
    const { ref } = renderCaller(surface);
    await flush();

    act(() => ref.handle?.open());
    await flush();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    resolveLoad({ default: StubContent });
    await flush();

    expect(screen.getByRole('dialog')).toContainElement(screen.getByText('Stub modal'));
  });

  it('forgets the previous options when opened without any', async () => {
    const { ref } = renderCaller(stubSurface());
    await flush();

    act(() => ref.handle?.open({ label: 'first' }));
    await flush();
    expect(readOptions()).toEqual({ label: 'first' });

    act(() => ref.handle?.close());
    await flush();
    act(() => ref.handle?.open());
    await flush();

    expect(readOptions()).toBeNull();
  });

  it('stays open with its options when the caller unmounts', async () => {
    const surface = stubSurface();
    const { ref, rerender } = renderCaller(surface);
    await flush();
    act(() => ref.handle?.open({ label: 'kept', page: 'account' }));
    await flush();

    rerender(null);
    await flush();

    expect(readOptions()).toEqual({ label: 'kept', page: 'account' });
  });

  it('portals into the container it was opened with', async () => {
    const container = document.body.appendChild(document.createElement('div'));
    onTestFinished(() => container.remove());
    const { ref } = renderCaller(stubSurface());
    await flush();

    act(() => ref.handle?.open({}, container));

    expect(container).toContainElement(await screen.findByLabelText('Stub'));
  });

  it('leaves the container behind when the next caller opens without one', async () => {
    const container = document.body.appendChild(document.createElement('div'));
    onTestFinished(() => container.remove());
    const { ref } = renderCaller(stubSurface());
    await flush();
    act(() => ref.handle?.open({}, container));
    await screen.findByLabelText('Stub');
    act(() => ref.handle?.close());
    await flush();

    act(() => ref.handle?.open({}));

    expect(container).not.toContainElement(await screen.findByLabelText('Stub'));
  });

  it('shows the options of the last caller to open', async () => {
    const surface = stubSurface();
    let first: ModalHandle<StubOptions> | undefined;
    let second: ModalHandle<StubOptions> | undefined;
    renderWithModals(
      [surface],
      <>
        <Caller
          surface={surface}
          onHandle={h => (first = h)}
        />
        <Caller
          surface={surface}
          onHandle={h => (second = h)}
        />
      </>,
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
      const [page] = React.useState(options?.page);
      return <output data-testid='seeded'>{page}</output>;
    }
    const surface = stubSurface('seeded', () => Promise.resolve({ default: SeededContent }));
    const { ref } = renderCaller(surface);
    await flush();

    act(() => ref.handle?.open({ page: 'account' }));
    await flush();
    expect(screen.getByTestId('seeded')).toHaveTextContent('account');

    act(() => ref.handle?.open({ page: 'security' }));
    await flush();
    expect(screen.getByTestId('seeded')).toHaveTextContent('security');
  });

  it('shows the error inside the dialog when the content fails to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const surface = stubSurface('failing', () => Promise.reject(new Error('chunk failed')));
    let handle: ModalHandle<StubOptions> | undefined;
    renderWithModals(
      [surface],
      <>
        <p>App content</p>
        <Caller
          surface={surface}
          onHandle={h => (handle = h)}
        />
      </>,
    );
    await flush();

    act(() => handle?.open());
    await flush();

    expect(screen.getByText('App content')).toBeInTheDocument();
    const dialog = screen.getByRole('dialog', { name: 'Something went wrong. Please try again.' });
    expect(within(dialog).queryByRole('button')).not.toBeInTheDocument();
  });

  it('logs the error when the content fails to load', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const failure = new Error('chunk failed');
    const { ref } = renderCaller(stubSurface('failing-logged', () => Promise.reject(failure)));
    await flush();

    act(() => ref.handle?.preload());
    await flush();

    expect(consoleError).toHaveBeenCalledWith(expect.any(String), failure);
  });

  it('shows the load failure in the localized copy', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { ref } = renderCaller(
      stubSurface('failing', () => Promise.reject(new Error('chunk failed'))),
      {
        localization: { overrides: { errors: { generic: 'Could not open' } } },
      },
    );
    await flush();

    act(() => ref.handle?.open());
    await flush();

    expect(screen.getByRole('dialog')).toHaveTextContent('Could not open');
  });

  it('loads the content again when reopened after a failed load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let failing = true;
    const { ref } = renderCaller(
      stubSurface('flaky-reopen', () =>
        failing ? Promise.reject(new Error('chunk failed')) : Promise.resolve({ default: StubContent }),
      ),
    );
    await flush();
    act(() => ref.handle?.open());
    await flush();
    act(() => ref.handle?.close());
    await flush();

    failing = false;
    act(() => ref.handle?.open());
    await flush();

    expect(screen.getByText('Stub modal')).toBeInTheDocument();
  });

  it('loads the content on open after a failed preload', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let failing = true;
    const { ref } = renderCaller(
      stubSurface('flaky-preload', () =>
        failing ? Promise.reject(new Error('chunk failed')) : Promise.resolve({ default: StubContent }),
      ),
    );
    await flush();

    act(() => ref.handle?.preload());
    await flush();
    failing = false;
    act(() => ref.handle?.open());
    await flush();

    expect(screen.getByText('Stub modal')).toBeInTheDocument();
  });

  it('lets an error the loaded content throws reach the app', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    function BrokenContent(): React.ReactElement {
      throw new Error('profile crashed');
    }
    const surface = stubSurface('broken', () => Promise.resolve({ default: BrokenContent }));
    let handle: ModalHandle<StubOptions> | undefined;
    render(
      <AppBoundary>
        <MosaicProvider>
          <ModalHost surfaces={[surface]}>
            <Caller
              surface={surface}
              onHandle={h => (handle = h)}
            />
          </ModalHost>
        </MosaicProvider>
      </AppBoundary>,
    );
    await flush();

    act(() => handle?.open());
    await flush();

    expect(screen.getByText('App caught: profile crashed')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong. Please try again.')).not.toBeInTheDocument();
  });

  it('throws a clear error outside MosaicProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => renderHook(() => useModal(stubSurface()))).toThrow(/stub.*MosaicProvider/);
  });

  it('throws a clear error for a surface its host does not render', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const known = stubSurface('known');
    const unknown = stubSurface('unknown');

    expect(() =>
      renderWithModals(
        [known],
        <Caller
          surface={unknown}
          onHandle={() => undefined}
        />,
      ),
    ).toThrow(/unknown.*MosaicProvider/);
  });
});

describe('a modal surface that routes', () => {
  function Entry() {
    return <output data-testid='entry'>{JSON.stringify(useVirtualSegment('/modal/stub') ?? null)}</output>;
  }

  function routedSurface() {
    return defineModalSurface<StubOptions>({
      id: 'routed',
      variant: 'card',
      load: () => Promise.resolve({ default: StubContent }),
      path: '/modal/stub',
      initialParts: options => (options?.page ? options.page.split('/') : []),
    });
  }

  function renderRouted(surface = routedSurface()) {
    const ref: { handle: ModalHandle<StubOptions> | undefined } = { handle: undefined };
    renderWithModals(
      [surface],
      <>
        <Caller
          surface={surface}
          onHandle={h => (ref.handle = h)}
        />
        <Entry />
      </>,
    );
    return ref;
  }

  const entry = () => JSON.parse(screen.getByTestId('entry').textContent ?? 'null');

  it('writes an empty entry under its base when opened with no page', async () => {
    const ref = renderRouted();

    act(() => ref.handle?.open());
    await flush();

    expect(entry()).toEqual([]);
  });

  it('writes the page it was opened at', async () => {
    const ref = renderRouted();

    act(() => ref.handle?.open({ page: 'organization/general' }));
    await flush();

    expect(entry()).toEqual(['organization', 'general']);
  });

  it('clears its entry when closed, so it reopens fresh', async () => {
    const ref = renderRouted();

    act(() => ref.handle?.open({ page: 'security' }));
    await flush();
    expect(entry()).toEqual(['security']);

    act(() => ref.handle?.close());
    await flush();
    expect(entry()).toBeNull();

    act(() => ref.handle?.open());
    await flush();
    expect(entry()).toEqual([]);
  });

  describe('with content that routes', () => {
    const pages = { account: 'account', security: 'security' } as const;

    function RoutingContent({ path }: ModalContentProps<StubOptions>) {
      const { route } = useRouterScope(pages, { routing: 'virtual', path, root: 'account' });
      return <output data-testid='route'>{route}</output>;
    }

    function routingSurface() {
      return defineModalSurface<StubOptions>({
        id: 'routing',
        variant: 'card',
        load: () => Promise.resolve({ default: RoutingContent }),
        path: '/modal/stub',
        initialParts: options => (options?.page ? options.page.split('/') : []),
      });
    }

    function keepExitPending() {
      const prototype = Element.prototype as { getAnimations?: unknown };
      const original = prototype.getAnimations;
      prototype.getAnimations = () => [{ finished: new Promise<void>(() => {}) }];
      onTestFinished(() => {
        if (original) {
          prototype.getAnimations = original;
        } else {
          delete prototype.getAnimations;
        }
      });
    }

    it.each([
      { name: 'normally', strict: false },
      { name: 'in StrictMode', strict: true },
    ])('keeps the entry cleared after close, without the content redirecting it back, $name', async ({ strict }) => {
      if (strict) {
        configure({ reactStrictMode: true });
        onTestFinished(() => configure({ reactStrictMode: false }));
      }
      const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
      const ref = renderRouted(routingSurface());

      act(() => ref.handle?.open({ page: 'security' }));
      await flush();
      expect(screen.getByTestId('route').textContent).toBe('security');

      act(() => ref.handle?.close());
      await flush();
      expect(entry()).toBeNull();
      expect(warn).not.toHaveBeenCalled();
    });

    it('keeps the entry cleared for the length of the exit transition', async () => {
      keepExitPending();
      const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
      const ref = renderRouted(routingSurface());

      act(() => ref.handle?.open({ page: 'security' }));
      await flush();
      act(() => ref.handle?.close());
      await flush();

      expect(screen.getByTestId('route')).toBeInTheDocument();
      expect(entry()).toBeNull();
      expect(warn).not.toHaveBeenCalled();
    });

    it('opens at the requested page when reopened mid-exit', async () => {
      keepExitPending();
      const ref = renderRouted(routingSurface());

      act(() => ref.handle?.open());
      await flush();
      expect(entry()).toEqual([]);
      act(() => ref.handle?.close());
      await flush();
      act(() => ref.handle?.open({ page: 'security' }));
      await flush();

      expect(entry()).toEqual(['security']);
      expect(screen.getByTestId('route').textContent).toBe('security');
    });
  });

  it('hands its base to the content', async () => {
    const surface = defineModalSurface<StubOptions>({
      id: 'based',
      variant: 'card',
      load: () =>
        Promise.resolve({
          default: ({ path }: ModalContentProps<StubOptions>) => <output data-testid='base'>{path}</output>,
        }),
      path: '/modal/based',
    });
    const ref = renderRouted(surface);

    act(() => ref.handle?.open());
    await flush();

    expect(screen.getByTestId('base').textContent).toBe('/modal/based');
  });
});
