import { act, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { RouterAdapterProvider } from '../router-adapter';
import { useRouterScope } from '../use-router';
import { VirtualStoreProvider } from '../virtual-store';

const routes = { index: '', security: 'security' } as const;

function PatchesHistoryOnMount({ onReplace, children }: { onReplace: (url: string) => void; children: ReactNode }) {
  useEffect(() => {
    const original = window.history.replaceState.bind(window.history);
    window.history.replaceState = (state, unused, url) => {
      onReplace(String(url));
      original(state, unused, url);
    };
    return () => {
      window.history.replaceState = original;
    };
  }, [onReplace]);
  return children;
}

function Owner() {
  const { route } = useRouterScope(routes, { routing: 'hash', path: '/user', root: 'index' });
  return <output>{route}</output>;
}

describe('a correction made in the first commit', () => {
  it('lands after a history patch an ancestor installs in its own first effect', async () => {
    window.history.replaceState(null, '', '/#.user=nowhere');
    const onReplace = vi.fn();

    render(
      <PatchesHistoryOnMount onReplace={onReplace}>
        <RouterAdapterProvider>
          <VirtualStoreProvider>
            <Owner />
          </VirtualStoreProvider>
        </RouterAdapterProvider>
      </PatchesHistoryOnMount>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('index');

    await act(async () => {
      await Promise.resolve();
    });
    expect(onReplace).toHaveBeenCalledTimes(1);
    expect(window.location.hash).toBe('#.user=');
  });
});
