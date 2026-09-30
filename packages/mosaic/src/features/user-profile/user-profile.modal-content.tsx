import React from 'react';

import type { UserProfileModalContentProps } from './user-profile.modal.types';
import type { UserProfilePages } from './user-profile.types';
import { UserProfileView } from './user-profile.view';

const DEMO_PAGES: UserProfilePages = {
  account: {
    name: 'Preston Booth',
    firstName: 'Preston',
    lastName: 'Booth',
    username: 'preston',
    emails: [{ id: 'email_1', value: 'preston@clerk.dev', isDefault: true, isVerified: true }],
    phones: [{ id: 'phone_1', value: '+1 801-888-8181', isDefault: true, isVerified: true }],
  },
  security: {
    hasPassword: true,
    devices: [
      {
        id: 'device_1',
        name: 'Macbook Pro',
        type: 'desktop',
        isCurrent: true,
        browser: 'Chrome',
        lastActive: 'Just now',
      },
    ],
  },
};

export default function UserProfileModalContent({ config, payload }: UserProfileModalContentProps): React.ReactElement {
  const [activePage, setActivePage] = React.useState(payload?.page ?? 'account');

  return (
    <UserProfileView
      activePage={activePage}
      pages={DEMO_PAGES}
      customPages={config.customPages}
      pageOrder={config.pageOrder}
      onPageChange={setActivePage}
    />
  );
}
