import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { serveFapi } from '../../../../__tests__/feature/fake-fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileProfilePanel } from '../../user-profile-profile-panel';
import { enterpriseAccountSeed } from './enterprise-accounts.fixtures';

it('renders the enterprise section in the default profile panel before the danger zone', async () => {
  serveFapi(enterpriseAccountSeed());
  await renderWithClerk(<UserProfileProfilePanel />);
  const enterprise = await screen.findByRole('group', { name: 'Enterprise accounts' });
  const danger = screen.getByRole('heading', { name: 'Danger zone' });
  expect(enterprise.compareDocumentPosition(danger) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
