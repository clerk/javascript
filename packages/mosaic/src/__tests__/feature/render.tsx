import { Clerk } from '@clerk/clerk-js';
import { ClerkContextProvider } from '@clerk/shared/react';
import { act, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { vi } from 'vitest';

import type { MosaicProfile } from '../../features/profile-pages/use-mosaic-profile';
import type { MosaicExperimental } from '../../hooks/use-mosaic-experimental';
import type { MosaicLocalization } from '../../localization';
import { MosaicProvider } from '../../mosaic-provider';
import { publishableKey } from './fake-fapi';

export async function renderWithClerk(
  ui: ReactElement,
  options?: Parameters<Clerk['load']>[0],
  localization?: MosaicLocalization,
  experimental?: MosaicExperimental,
  profile?: MosaicProfile,
) {
  const clerk = new Clerk(publishableKey());
  const navigate = vi.fn((_to: string) => Promise.resolve());

  const wrap = (element: ReactElement) => (
    <ClerkContextProvider
      clerk={clerk}
      clerkStatus={clerk.status}
    >
      <MosaicProvider
        localization={localization}
        experimental={experimental}
        profile={profile}
      >
        {element}
      </MosaicProvider>
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
