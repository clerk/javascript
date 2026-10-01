import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileConnectedAccountsSectionView } from '../user-profile-connected-accounts-section/user-profile-connected-accounts-section.view';
import { UserProfileProfilePanelView } from '../user-profile-profile-panel.view';

describe('connected account removal focus', () => {
  it('keeps the final account confirmation mounted until removal settles', async () => {
    const user = userEvent.setup();
    const titleRef = createRef<HTMLDivElement>();
    const removal = createDeferredPromise();
    const onRemove = () => removal.promise;
    const { rerender } = render(
      <MosaicProvider>
        <UserProfileProfilePanelView
          titleRef={titleRef}
          connectedAccountsSlot={
            <UserProfileConnectedAccountsSectionView
              accounts={[{ id: 'github', provider: 'GitHub' }]}
              fallbackFocus={() => titleRef.current}
              onRemove={onRemove}
            />
          }
        />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Manage GitHub' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));

    rerender(
      <MosaicProvider>
        <UserProfileProfilePanelView
          titleRef={titleRef}
          connectedAccountsSlot={
            <UserProfileConnectedAccountsSectionView
              accounts={[]}
              fallbackFocus={() => titleRef.current}
              onRemove={onRemove}
            />
          }
        />
      </MosaicProvider>,
    );
    expect(screen.queryByRole('heading', { name: 'Connected accounts' })).not.toBeInTheDocument();
    expect(screen.getByRole('alertdialog', { name: 'Remove connected account' })).toBeInTheDocument();

    await act(async () => {
      removal.resolve();
      await removal.promise;
    });
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Account', level: 2 })).toBeVisible();
    await waitFor(() => expect(document.activeElement).toHaveTextContent(/^Account$/));
  });
});
