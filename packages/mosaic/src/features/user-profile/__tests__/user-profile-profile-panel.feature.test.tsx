import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEmailAddress, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileEmailSection } from '../user-profile-email-section/user-profile-email-section';
import { UserProfileProfilePanel } from '../user-profile-profile-panel';
import { UserProfileProfileSection } from '../user-profile-profile-section/user-profile-profile-section';

const email = fapiEmailAddress({ id: 'idn_1', email_address: 'alice@example.com' });
const alice = fapiUser({
  id: 'user_1',
  first_name: 'Alice',
  last_name: 'Smith',
  email_addresses: [email],
  primary_email_address_id: 'idn_1',
});

function sectionHeadings() {
  return screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent);
}

describe('UserProfileProfilePanel', () => {
  it('renders the account sections the instance enables', async () => {
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]) });
    await renderWithClerk(<UserProfileProfilePanel />);

    expect(screen.getByRole('heading', { level: 2, name: 'Account' })).toBeInTheDocument();
    expect(sectionHeadings()).toEqual(['Profile', 'Email', 'Danger zone']);
  });

  it('renders only the sections passed as children, in their order', async () => {
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]) });
    await renderWithClerk(
      <UserProfileProfilePanel>
        <UserProfileEmailSection />
        <UserProfileProfileSection />
      </UserProfileProfilePanel>,
    );

    expect(sectionHeadings()).toEqual(['Email', 'Profile']);
  });

  it('keeps the panel title when every child section is hidden', async () => {
    serveFapi({ client: fapiClient() });
    await renderWithClerk(<UserProfileProfilePanel />);

    expect(screen.getByRole('heading', { level: 2, name: 'Account' })).toBeInTheDocument();
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
  });
});
