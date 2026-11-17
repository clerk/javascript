import { act, cleanup, configure, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';

import { defineModalSurface } from '../../modals/define-modal-surface';
import { ModalHost } from '../../modals/modal-host';
import type { MosaicRouting } from '../router-adapter';
import { RouterAdapterProvider } from '../router-adapter';
import type { MosaicRoutingMode } from '../use-mosaic-location';
import { useRouterScope } from '../use-router';
import { VirtualStoreProvider } from '../virtual-store';

beforeEach(() => window.history.replaceState(null, '', '/'));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const url = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

const flush = () =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

const routes = { index: '', security: 'security' } as const;

function Owner({ routing }: { routing: MosaicRoutingMode }) {
  const { route } = useRouterScope(routes, { routing, path: '/user', root: 'index' });
  return <output data-testid='route'>{route}</output>;
}

function Page({ routing = {}, children }: { routing?: MosaicRouting; children: ReactNode }) {
  return (
    <RouterAdapterProvider {...routing}>
      <VirtualStoreProvider>{children}</VirtualStoreProvider>
    </RouterAdapterProvider>
  );
}

const linkedModal = defineModalSurface({
  id: 'linked',
  variant: 'card',
  load: () => Promise.resolve({ default: () => <h2>Linked modal</h2> }),
});

describe('a link in the query string', () => {
  it('is left alone in query mode, where it is the entry', async () => {
    window.history.replaceState(null, '', '/page?.user=security&a=1');
    const replaceState = vi.spyOn(window.history, 'replaceState');
    render(
      <Page>
        <Owner routing='query' />
      </Page>,
    );
    await flush();

    expect(screen.getByTestId('route').textContent).toBe('security');
    expect(url()).toBe('/page?.user=security&a=1');
    expect(replaceState).not.toHaveBeenCalled();
  });

  it('is left in the URL while nothing owns its base', async () => {
    window.history.replaceState(null, '', '/page?.user=security');
    render(
      <Page>
        <p>Page</p>
      </Page>,
    );
    await flush();

    expect(url()).toBe('/page?.user=security');
  });

  it('is removed once in StrictMode', async () => {
    configure({ reactStrictMode: true });
    onTestFinished(() => configure({ reactStrictMode: false }));
    window.history.replaceState(null, '', '/page?.user=security&a=1');
    const replaceState = vi.spyOn(window.history, 'replaceState');
    render(
      <Page>
        <Owner routing='virtual' />
      </Page>,
    );
    await flush();

    expect(screen.getByTestId('route').textContent).toBe('security');
    expect(url()).toBe('/page?a=1');
    expect(replaceState).toHaveBeenCalledTimes(1);
  });

  it("drops Next's history marker and keeps the rest of the state when it is removed", async () => {
    window.history.replaceState({ __NA: true, router: 'state' }, '', '/page?.user=security');
    render(
      <Page>
        <Owner routing='virtual' />
      </Page>,
    );
    await flush();

    expect(url()).toBe('/page');
    expect(window.history.state).toEqual({ router: 'state' });
  });

  it('is removed through a history patch that a parent installs while mounting', async () => {
    window.history.replaceState(null, '', '/page?.user=security');
    const patched = vi.fn();
    function PatchesHistoryOnMount({ children }: { children: ReactNode }) {
      useEffect(() => {
        const original = window.history.replaceState.bind(window.history);
        window.history.replaceState = (state, unused, next) => {
          patched(String(next));
          original(state, unused, next);
        };
        return () => {
          window.history.replaceState = original;
        };
      }, []);
      return children;
    }

    render(
      <PatchesHistoryOnMount>
        <Page>
          <Owner routing='virtual' />
        </Page>
      </PatchesHistoryOnMount>,
    );
    await flush();

    expect(patched).toHaveBeenCalledTimes(1);
    expect(url()).toBe('/page');
  });

  it.each([
    { name: 'virtual', routing: {}, after: '/page?a=1' },
    { name: 'hash', routing: { modals: 'hash' }, after: '/page?a=1#.modal.linked=' },
  ] satisfies { name: string; routing: MosaicRouting; after: string }[])(
    'opens a modal through the modal host in $name mode',
    async ({ routing, after }) => {
      window.history.replaceState(null, '', '/page?.modal.linked=&a=1');
      render(
        <Page routing={routing}>
          <ModalHost surfaces={[linkedModal]}>
            <p>Page</p>
          </ModalHost>
        </Page>,
      );
      await flush();

      expect(await screen.findByRole('heading', { name: 'Linked modal' })).toBeInTheDocument();
      expect(url()).toBe(after);
    },
  );
});
