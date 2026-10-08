'use client';

import type { ReactElement } from 'react';

import type { SwitcherProps } from '../switcher/switcher';
import { Switcher } from '../switcher/switcher';
import type { OrganizationSwitcherModelOptions } from '../switcher/switcher.model';
import type { SwitcherMenuProps } from '../switcher/switcher.types';
import type { SwitcherTriggerProps } from '../switcher/switcher.view';

export type OrganizationSwitcherProps = OrganizationSwitcherModelOptions &
  SwitcherTriggerProps &
  SwitcherMenuProps &
  Pick<SwitcherProps, 'organizationProfileProps' | 'fallback'>;

export function OrganizationSwitcher(props: OrganizationSwitcherProps = {}): ReactElement {
  return (
    <Switcher
      {...props}
      mode='organization'
    />
  );
}
