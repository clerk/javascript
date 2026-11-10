import { describe, test } from 'vitest';

import { OrganizationSwitcher } from '../organization-switcher/organization-switcher';
import { UserButton } from '../user-button/user-button';
import type { SwitcherProps } from './switcher';
import { Switcher } from './switcher';
import type { SwitcherMode } from './switcher.types';

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
    // @ts-expect-error -- the trigger variant only applies to the combined menu
    void ({ mode: 'user', triggerVariant: 'full' } satisfies SwitcherProps);
    // @ts-expect-error -- a user menu lists no organizations
    void ({ mode: 'user', hidePersonal: true } satisfies SwitcherProps);
    // @ts-expect-error -- a user menu lists no organizations
    void ({ mode: 'user', createOrganizationUrl: '/orgs/new' } satisfies SwitcherProps);
  });

  test('takes organization options in organization mode and rejects the rest', () => {
    void (
      <Switcher
        mode='organization'
        hidePersonal
        createOrganizationUrl='/orgs/new'
      />
    );
    // @ts-expect-error -- the trigger variant only applies to the combined menu
    void ({ mode: 'organization', triggerVariant: 'full' } satisfies SwitcherProps);
    // @ts-expect-error -- an organization menu lists no accounts
    void ({ mode: 'organization', afterSwitchSessionUrl: '/dashboard' } satisfies SwitcherProps);
  });

  test('requires a URL to navigate to the create-organization page', () => {
    // @ts-expect-error -- navigation needs a URL
    void ({ createOrganizationMode: 'navigation' } satisfies SwitcherProps);
    // @ts-expect-error -- navigation needs a URL
    void ({ mode: 'organization', createOrganizationMode: 'navigation' } satisfies SwitcherProps);
  });

  test('takes a mode chosen at runtime with the props every mode shares', () => {
    const mode = pickMode();
    void (
      <Switcher
        mode={mode}
        showTriggerLabel={false}
        customMenuItems={[]}
      />
    );
    // @ts-expect-error -- only a static combined mode takes the trigger variant
    void ({ mode, triggerVariant: 'full' } satisfies SwitcherProps);
    // @ts-expect-error -- only a static mode takes that mode's options
    void ({ mode, hidePersonal: true } satisfies SwitcherProps);
    // @ts-expect-error -- only a static mode takes that mode's options
    void ({ mode, createOrganizationMode: 'navigation' } satisfies SwitcherProps);
  });
});

describe('UserButton and OrganizationSwitcher props', () => {
  test('match their Switcher mode and take no mode of their own', () => {
    void (<UserButton afterSwitchSessionUrl='/dashboard' />);
    // @ts-expect-error -- a user menu lists no organizations
    void (<UserButton hidePersonal />);
    // @ts-expect-error -- the trigger variant only applies to the combined menu
    void (<UserButton triggerVariant='full' />);
    // @ts-expect-error -- the mode is fixed
    void (<UserButton mode='combined' />);

    void (<OrganizationSwitcher hidePersonal />);
    // @ts-expect-error -- an organization menu lists no accounts
    void (<OrganizationSwitcher afterSwitchSessionUrl='/dashboard' />);
    // @ts-expect-error -- the mode is fixed
    void (<OrganizationSwitcher mode='combined' />);
  });
});

function pickMode(): SwitcherMode {
  return 'user';
}
