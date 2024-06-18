import type * as Common from '@clerk/elements/common';
import * as React from 'react';
import { ToggleButton } from 'react-aria-components';

import { linkButton } from '~/primitives/link-button';

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
      isSelected={showPhoneNumberField}
      onChange={setShowPhoneNumberField}
      className={linkButton({ size: 'sm', disabled: props.disabled })}
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
