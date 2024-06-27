import type * as Common from '@clerk/elements/common';
import * as React from 'react';
import { ToggleButton } from 'react-aria-components';

import { linkButton } from '~/primitives/link-button';

import { EmailOrUsernameField } from './email-or-username-field';
import { PhoneNumberField } from './phone-number-field';

export function EmailOrUsernameOrPhoneNumberField({
  className,
  name = undefined,
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
      isSelected={showPhoneNumberField}
      onChange={setShowPhoneNumberField}
      className={linkButton({ size: 'sm', disabled: props.disabled })}
    >
      <span className='sr-only'>{toggleDescription}</span>
      {showPhoneNumberField ? 'Use email or username' : 'Use phone'}
    </ToggleButton>
  );

  return showPhoneNumberField ? (
    <PhoneNumberField
      label={labelPhoneNumber}
      name={name}
      locationBasedCountryIso={locationBasedCountryIso}
      alternativeFieldTrigger={toggle}
      required={requiredPhoneNumber}
      {...props}
    />
  ) : (
    <EmailOrUsernameField
      {...props}
      name={name}
      label={labelEmailOrUsername}
      alternativeFieldTrigger={toggle}
      required={requiredEmailOrUsername}
    />
  );
}
