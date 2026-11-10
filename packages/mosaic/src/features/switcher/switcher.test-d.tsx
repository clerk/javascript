import { describe, test } from 'vitest';

import { OrganizationSwitcher } from '../organization-switcher/organization-switcher';
import { UserButton } from '../user-button/user-button';
import { Switcher } from './switcher';

describe('Switcher props', () => {
  test('takes every option in combined mode, with or without the mode', () => {
    void (
      <Switcher
        triggerVariant='condensed'
        hidePersonal
        afterSwitchSessionUrl='/dashboard'
      />
    );
    void (
      <Switcher
        mode='combined'
        triggerVariant='full'
        createOrganizationUrl='/orgs/new'
        signInUrl='/sign-in'
      />
    );
  });

  test('takes account options in user mode and rejects the rest', () => {
    void (
      <Switcher
        mode='user'
        afterSwitchSessionUrl='/dashboard'
        signInUrl='/sign-in'
      />
    );
    void (
      <Switcher
        mode='user'
        // @ts-expect-error -- the trigger variant only applies to the combined menu
        triggerVariant='full'
      />
    );
    void (
      <Switcher
        mode='user'
        // @ts-expect-error -- a user menu lists no organizations
        hidePersonal
      />
    );
    void (
      <Switcher
        mode='user'
        // @ts-expect-error -- a user menu lists no organizations
        createOrganizationUrl='/orgs/new'
      />
    );
  });

  test('takes organization options in organization mode and rejects the rest', () => {
    void (
      <Switcher
        mode='organization'
        hidePersonal
        createOrganizationUrl='/orgs/new'
      />
    );
    void (
      <Switcher
        mode='organization'
        // @ts-expect-error -- the trigger variant only applies to the combined menu
        triggerVariant='full'
      />
    );
    void (
      <Switcher
        mode='organization'
        // @ts-expect-error -- an organization menu lists no accounts
        afterSwitchSessionUrl='/dashboard'
      />
    );
  });
});

describe('UserButton and OrganizationSwitcher props', () => {
  test('match their Switcher mode and take no mode of their own', () => {
    void (<UserButton afterSwitchSessionUrl='/dashboard' />);
    // @ts-expect-error a user menu lists no organizations
    void (<UserButton hidePersonal />);
    // @ts-expect-error the trigger variant only applies to the combined menu
    void (<UserButton triggerVariant='full' />);
    // @ts-expect-error the mode is fixed
    void (<UserButton mode='combined' />);

    void (<OrganizationSwitcher hidePersonal />);
    // @ts-expect-error an organization menu lists no accounts
    void (<OrganizationSwitcher afterSwitchSessionUrl='/dashboard' />);
    // @ts-expect-error the mode is fixed
    void (<OrganizationSwitcher mode='combined' />);
  });
});
