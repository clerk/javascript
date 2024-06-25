import type * as Common from '@clerk/elements/common';
import * as React from 'react';
import { ToggleButton } from 'react-aria-components';

import { linkButton } from '~/primitives/link-button';

import { PhoneNumberField } from './phone-number-field';
import { UsernameField } from './username-field';

export function PhoneNumberOrUsernameField({
  className,
  name = undefined,
  labelPhoneNumber = 'Phone number',
  labelUsername = 'Username',
  locationBasedCountryIso,
  toggleDescription = 'Toggle between phone and username.',
  ...props
}: {
  labelUsername?: React.ReactNode;
  labelPhoneNumber?: React.ReactNode;
  locationBasedCountryIso: React.ComponentProps<typeof PhoneNumberField>['locationBasedCountryIso'];
  toggleDescription?: string;
} & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  const [showUsernameField, setShowUsernameField] = React.useState(false);

  const toggle = (
    <ToggleButton
      isSelected={showUsernameField}
      onChange={setShowUsernameField}
      className={linkButton({ size: 'sm', disabled: props.disabled })}
    >
      <span className='sr-only'>{toggleDescription}</span>
      {showUsernameField ? 'Use phone' : 'Use username'}
    </ToggleButton>
  );

  return showUsernameField ? (
    <UsernameField
      {...props}
      name={name}
      label={labelUsername}
      alternativeFieldTrigger={toggle}
    />
  ) : (
    <PhoneNumberField
      name={name}
      label={labelPhoneNumber}
      locationBasedCountryIso={locationBasedCountryIso}
      alternativeFieldTrigger={toggle}
      {...props}
    />
  );
}
