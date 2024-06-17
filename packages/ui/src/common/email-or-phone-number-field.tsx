import type * as Common from '@clerk/elements/common';
import * as React from 'react';
import { ToggleButton } from 'react-aria-components';

import { EmailField } from './email-field';
import { PhoneNumberField } from './phone-number-field';

export function EmailOrPhoneNumberField({
  className,
  labelEmail = 'Email address',
  labelPhoneNumber = 'Phone number',
  locationBasedCountryIso,
  requiredEmail,
  requiredPhoneNumber,
  toggleDescription = 'Toggle between email and phone.',
  ...props
}: {
  labelEmail?: React.ReactNode;
  labelPhoneNumber?: React.ReactNode;
  locationBasedCountryIso: React.ComponentProps<typeof PhoneNumberField>['locationBasedCountryIso'];
  requiredEmail?: boolean;
  requiredPhoneNumber?: boolean;
  toggleDescription?: string;
} & Omit<React.ComponentProps<typeof Common.Input>, 'required' | 'type'>) {
  const [showPhoneNumberField, setShowPhoneNumberField] = React.useState(false);

  const toggle = (
    <ToggleButton
      className='text-accent-9 focus-visible:ring-default -mx-0.5 rounded-sm px-0.5 text-sm font-medium outline-none hover:underline focus-visible:ring-2'
      isSelected={showPhoneNumberField}
      onChange={setShowPhoneNumberField}
    >
      <span className='sr-only'>{toggleDescription}</span>
      {showPhoneNumberField ? 'Use email' : 'Use phone'}
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
    <EmailField
      {...props}
      label={labelEmail}
      alternativeFieldTrigger={toggle}
      required={requiredEmail}
    />
  );
}
