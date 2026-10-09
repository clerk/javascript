import { Clerk } from '@clerk/clerk-js';
import { ClerkContextProvider } from '@clerk/shared/react';
import { act, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { vi } from 'vitest';

import type { MosaicLocalization } from '../../localization';
import { MosaicProvider } from '../../mosaic-provider';
import { PUBLISHABLE_KEY } from './fake-fapi';

export async function renderWithClerk(
  ui: ReactElement,
  options?: Parameters<Clerk['load']>[0],
  localization?: MosaicLocalization,
) {
  const clerk = new Clerk(PUBLISHABLE_KEY);
  const navigate = vi.fn((_to: string) => Promise.resolve());

  const wrap = (element: ReactElement) => (
    <ClerkContextProvider
      clerk={clerk}
      clerkStatus={clerk.status}
    >
      <MosaicProvider localization={localization}>{element}</MosaicProvider>
    </ClerkContextProvider>
  );
  let current = ui;
  const view = render(wrap(current));
  await act(() => clerk.load({ routerPush: to => navigate(to), routerReplace: to => navigate(to), ...options }));
  view.rerender(wrap(current));

  return {
    ...view,
    clerk,
    navigate,
    rerender: (element: ReactElement) => {
      current = element;
      view.rerender(wrap(current));
    },
  };
}
