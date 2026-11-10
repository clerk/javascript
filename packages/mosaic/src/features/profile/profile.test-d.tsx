import { describe, test } from 'vitest';

import { OrganizationProfile } from '../organization-profile/organization-profile';
import { UserProfile } from '../user-profile/user-profile';
import type { ProfileMode, ProfileProps } from './profile';
import { Profile } from './profile';

describe('Profile props', () => {
  test('takes every option in combined mode, with or without the mode', () => {
    void (
      <Profile
        path='/settings'
        additionalOAuthScopes={{ google: ['calendar'] }}
        organizationProfileProps={{ afterLeaveOrganizationUrl: '/organizations' }}
      />
    );
    void (
      <Profile
        mode='combined'
        customPages={[]}
        pageOrder={['account']}
        apiKeysProps={{ hide: true }}
        organizationProfileProps={{ pageOrder: ['members'] }}
      />
    );
  });

  test('takes account options in user mode and rejects the rest', () => {
    void (
      <Profile
        mode='user'
        path='/account'
        additionalOAuthScopes={{ google: ['calendar'] }}
      />
    );
    // @ts-expect-error -- a user profile has no organization pages
    void ({ mode: 'user', organizationProfileProps: {} } satisfies ProfileProps);
    // @ts-expect-error -- a user profile has no organization pages
    void ({ mode: 'user', afterLeaveOrganizationUrl: '/organizations' } satisfies ProfileProps);
  });

  test('takes organization options in organization mode and rejects the rest', () => {
    void (
      <Profile
        mode='organization'
        path='/team'
        afterLeaveOrganizationUrl='/organizations'
      />
    );
    // @ts-expect-error -- an organization profile has no account pages
    void ({ mode: 'organization', additionalOAuthScopes: {} } satisfies ProfileProps);
    // @ts-expect-error -- an organization profile is not combined
    void ({ mode: 'organization', organizationProfileProps: {} } satisfies ProfileProps);
  });

  test('takes leaving the organization only through the organization options when combined', () => {
    // @ts-expect-error -- a combined profile takes it in organizationProfileProps
    void ({ afterLeaveOrganizationUrl: '/organizations' } satisfies ProfileProps);
  });

  test('takes a mode chosen at runtime', () => {
    const mode = pickMode();
    void (
      <Profile
        mode={mode}
        fallback={null}
      />
    );
  });
});

describe('UserProfile and OrganizationProfile props', () => {
  test('match their Profile mode and take no mode of their own', () => {
    void (<UserProfile additionalOAuthScopes={{ google: ['calendar'] }} />);
    // @ts-expect-error -- a user profile has no organization pages
    void (<UserProfile organizationProfileProps={{}} />);
    // @ts-expect-error -- the mode is fixed
    void (<UserProfile mode='combined' />);

    void (<OrganizationProfile afterLeaveOrganizationUrl='/organizations' />);
    // @ts-expect-error -- an organization profile has no account pages
    void (<OrganizationProfile additionalOAuthScopes={{}} />);
    // @ts-expect-error -- the mode is fixed
    void (<OrganizationProfile mode='combined' />);
  });
});

function pickMode(): ProfileMode {
  return 'user';
}
