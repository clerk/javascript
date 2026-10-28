// @vitest-environment node
import { Clerk } from '@clerk/clerk-js';
import { ClerkContextProvider } from '@clerk/shared/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import type { MosaicRouter } from '../use-mosaic-router';
import { useMosaicRouter } from '../use-mosaic-router';

function CaptureRouter({ onRouter }: { onRouter: (router: MosaicRouter) => void }) {
  onRouter(useMosaicRouter());
  return null;
}

function renderRouterOnServer() {
  const clerk = new Clerk(`pk_test_${btoa('clerk.example.com$')}`);
  let captured: MosaicRouter | undefined;
  renderToString(
    <ClerkContextProvider
      clerk={clerk}
      clerkStatus={clerk.status}
    >
      <CaptureRouter onRouter={router => (captured = router)} />
    </ClerkContextProvider>,
  );
  if (!captured) {
    throw new Error('Router was not rendered');
  }
  return captured;
}

describe('Mosaic router on the server', () => {
  it('returns empty search params when there is no window', () => {
    const router = renderRouterOnServer();
    expect(router.getSearchParams().toString()).toBe('');
  });

  it('returns empty search params when the window has no location', () => {
    const router = renderRouterOnServer();
    vi.stubGlobal('window', {});
    expect(router.getSearchParams().toString()).toBe('');
  });
});
