import type * as Common from '@clerk/elements/common';
import * as React from 'react';
import { ToggleButton } from 'react-aria-components';

import { EmailOrUsernameField } from './email-or-username-field';
import { PhoneNumberField } from './PhoneNumberField';

export function EmailOrUsernameOrPhoneNumberField({
  className,
  labelEmailOrUsername = 'Email address or username',
  labelPhoneNumber = 'Phone number',
  locationBasedCountryIso,
  toggleDescription = 'Toggle between email or username, and phone.',
  ...props
}: {
  labelEmailOrUsername?: React.ReactNode;
  labelPhoneNumber?: React.ReactNode;
  locationBasedCountryIso: React.ComponentProps<typeof PhoneNumberField>['locationBasedCountryIso'];
  toggleDescription?: string;
} & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  const [showPhoneNumberField, setShowPhoneNumberField] = React.useState(false);

  const toggle = (
    <ToggleButton
      className='-mx-0.5 px-0.5 text-accent-9 text-sm font-medium hover:underline rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-default'
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
      {...props}
    />
  ) : (
    <EmailOrUsernameField
      {...props}
      label={labelEmailOrUsername}
      alternativeFieldTrigger={toggle}
    />
  );
}
