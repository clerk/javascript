import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, onTestFinished } from 'vitest';

import { serveFapi } from '../../../../__tests__/feature/fake-fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileWeb3WalletsSection } from '../user-profile-web3-wallets-section';
import { signedInWallets } from './user-profile-web3-wallets.fixtures';

it('waits for the Solana picker to open before asking installed wallets to register', async () => {
  const appReady: Event[] = [];
  const onAppReady = (event: Event) => appReady.push(event);
  window.addEventListener('wallet-standard:app-ready', onAppReady);
  onTestFinished(() => window.removeEventListener('wallet-standard:app-ready', onAppReady));
  serveFapi(signedInWallets(['web3_solana_signature']));
  await renderWithClerk(<UserProfileWeb3WalletsSection />);
  const user = userEvent.setup();

  await screen.findByRole('button', { name: 'Connect Solana' });
  expect(appReady).toHaveLength(0);

  await user.click(screen.getByRole('button', { name: 'Connect Solana' }));

  await waitFor(() => expect(appReady).toHaveLength(1));
});
