import type * as Common from '@clerk/elements/common';
import * as React from 'react';
import { ToggleButton } from 'react-aria-components';

import { LOCALIZATION_NEEDED } from '~/constants/localizations';
import { link } from '~/primitives/link';

import { PhoneNumberField } from './phone-number-field';
import { UsernameField } from './username-field';

export function PhoneNumberOrUsernameField({
  className,
  name = undefined,
  toggleLabelPhoneNumber,
  toggleLabelUsername,
  ...props
}: {
  toggleLabelPhoneNumber: React.ReactNode;
  toggleLabelUsername: React.ReactNode;
} & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  const [showUsernameField, setShowUsernameField] = React.useState(false);

  const toggle = (
    <ToggleButton
      isSelected={showUsernameField}
      onChange={setShowUsernameField}
      className={link({ size: 'sm', disabled: props.disabled, focusVisible: 'data-attribute' })}
    >
      <span className='sr-only'>{LOCALIZATION_NEEDED.formFieldAccessibleLabel__phoneOrUsername}</span>
      {showUsernameField ? toggleLabelPhoneNumber : toggleLabelUsername}
    </ToggleButton>
  );

  return showUsernameField ? (
    <UsernameField
      {...props}
      name={name}
      alternativeFieldTrigger={toggle}
    />
  ) : (
    <PhoneNumberField
      name={name}
      alternativeFieldTrigger={toggle}
      {...props}
    />
  );
}
