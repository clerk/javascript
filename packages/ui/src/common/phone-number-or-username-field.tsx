import type * as Common from '@clerk/elements/common';
import * as React from 'react';

import { LinkToggleButton } from '~/primitives/link-button';

import { PhoneNumberField } from './phone-number-field';
import { UsernameField } from './username-field';

export function PhoneNumberOrUsernameField({
  className,
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
    <LinkToggleButton
      isSelected={showUsernameField}
      onChange={setShowUsernameField}
      size='sm'
    >
      <span className='sr-only'>{toggleDescription}</span>
      {showUsernameField ? 'Use phone' : 'Use username'}
    </LinkToggleButton>
  );

  return showUsernameField ? (
    <UsernameField
      {...props}
      label={labelUsername}
      alternativeFieldTrigger={toggle}
    />
  ) : (
    <PhoneNumberField
      label={labelPhoneNumber}
      locationBasedCountryIso={locationBasedCountryIso}
      alternativeFieldTrigger={toggle}
      {...props}
    />
  );
}
