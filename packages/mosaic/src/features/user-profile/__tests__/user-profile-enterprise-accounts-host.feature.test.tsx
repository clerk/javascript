import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileEnterpriseAccountsSection } from '../user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section';
import { UserProfileProfilePanelView } from '../user-profile-profile-panel.view';
import { UserProfileWeb3WalletsSectionView } from '../user-profile-web3-wallets-section.view';
import { enterpriseAccountSeed } from './enterprise-accounts.fixtures';

it('places the connected enterprise section before Web3 wallets in the profile host', async () => {
  serveFapi(enterpriseAccountSeed());
  await renderWithClerk(
    <UserProfileProfilePanelView
      name='Jane Doe'
      username=''
      emails={[]}
      phones={[]}
      enterpriseAccountsSlot={<UserProfileEnterpriseAccountsSection />}
      web3WalletsSlot={
        <UserProfileWeb3WalletsSectionView
          wallets={[{ id: 'wallet_1', provider: 'MetaMask', address: '0x1234', isVerified: true }]}
        />
      }
    />,
  );
  const enterprise = await screen.findByRole('group', { name: 'Enterprise accounts' });
  const wallets = screen.getByRole('group', { name: 'Web3 wallets' });
  expect(enterprise.compareDocumentPosition(wallets) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
