import type * as Common from '@clerk/elements/common';
import * as React from 'react';
import { ToggleButton } from 'react-aria-components';

import { EmailField } from './EmailField';
import { PhoneNumberField } from './PhoneNumberField';

export function EmailOrPhoneNumberField({
  className,
  labelEmail = 'Email address',
  labelPhoneNumber = 'Phone number',
  locationBasedCountryIso,
  toggleDescription = 'Toggle between email and phone.',
  ...props
}: {
  labelEmail?: React.ReactNode;
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
      {showPhoneNumberField ? 'Use email' : 'Use phone'}
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
    <EmailField
      {...props}
      label={labelEmail}
      alternativeFieldTrigger={toggle}
    />
  );
}
