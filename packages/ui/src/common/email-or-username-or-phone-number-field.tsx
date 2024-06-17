import type * as Common from '@clerk/elements/common';
import * as React from 'react';
import { ToggleButton } from 'react-aria-components';

import { EmailOrUsernameField } from './email-or-username-field';
import { PhoneNumberField } from './phone-number-field';

export function EmailOrUsernameOrPhoneNumberField({
  className,
  labelEmailOrUsername = 'Email address or username',
  labelPhoneNumber = 'Phone number',
  locationBasedCountryIso,
  requiredEmailOrUsername,
  requiredPhoneNumber,
  toggleDescription = 'Toggle between email or username, and phone.',
  ...props
}: {
  labelEmailOrUsername?: React.ReactNode;
  labelPhoneNumber?: React.ReactNode;
  locationBasedCountryIso: React.ComponentProps<typeof PhoneNumberField>['locationBasedCountryIso'];
  requiredEmailOrUsername?: boolean;
  requiredPhoneNumber?: boolean;
  toggleDescription?: string;
} & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  const [showPhoneNumberField, setShowPhoneNumberField] = React.useState(false);

  const toggle = (
    <ToggleButton
      className='text-accent-9 focus-visible:ring-default -mx-0.5 rounded-sm px-0.5 text-sm font-medium outline-none hover:underline focus-visible:ring-2'
      isSelected={showPhoneNumberField}
      onChange={setShowPhoneNumberField}
    >
      <span className='sr-only'>{toggleDescription}</span>
      {showPhoneNumberField ? 'Use email or username' : 'Use phone'}
    </ToggleButton>
  );

  return showPhoneNumberField ? (
    <PhoneNumberField
      label={labelPhoneNumber}
      locationBasedCountryIso={locationBasedCountryIso}
      alternativeFieldTrigger={toggle}
      required={requiredPhoneNumber}
      {...props}
    />
  ) : (
    <EmailOrUsernameField
      {...props}
      label={labelEmailOrUsername}
      alternativeFieldTrigger={toggle}
      required={requiredEmailOrUsername}
    />
  );
}
