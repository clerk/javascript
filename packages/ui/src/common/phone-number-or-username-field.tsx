import type * as Common from '@clerk/elements/common';
import * as React from 'react';
import { ToggleButton } from 'react-aria-components';

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
    <ToggleButton
      className='text-accent-9 focus-visible:ring-default -mx-0.5 rounded-sm px-0.5 text-sm font-medium outline-none hover:underline focus-visible:ring-2'
      isSelected={showUsernameField}
      onChange={setShowUsernameField}
    >
      <span className='sr-only'>{toggleDescription}</span>
      {showUsernameField ? 'Use phone' : 'Use username'}
    </ToggleButton>
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
