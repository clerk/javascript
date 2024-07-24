import type * as Common from '@clerk/elements/common';
import * as React from 'react';
import { ToggleButton } from 'react-aria-components';

import { link } from '~/primitives/link';

import { EmailOrUsernameField } from './email-or-username-field';
import { PhoneNumberField } from './phone-number-field';

export function EmailOrUsernameOrPhoneNumberField({
  className,
  name = undefined,
  labelEmailOrUsername = 'Email address or username',
  labelPhoneNumber = 'Phone number',
  toggleLabelEmailOrUsername = 'Use email or username',
  toggleLabelPhoneNumber = 'Use phone',
  locationBasedCountryIso,
  toggleDescription = 'Toggle between email or username, and phone.',
  ...props
}: {
  labelEmailOrUsername?: React.ReactNode;
  labelPhoneNumber?: React.ReactNode;
  toggleLabelEmailOrUsername?: string;
  toggleLabelPhoneNumber?: string;
  locationBasedCountryIso: React.ComponentProps<typeof PhoneNumberField>['locationBasedCountryIso'];
  toggleDescription?: string;
} & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  const [showPhoneNumberField, setShowPhoneNumberField] = React.useState(false);

  const toggle = (
    <ToggleButton
      isSelected={showPhoneNumberField}
      onChange={setShowPhoneNumberField}
      className={link({ size: 'sm', disabled: props.disabled, focusVisible: 'data-attribute' })}
    >
      <span className='sr-only'>{toggleDescription}</span>
      {showPhoneNumberField ? toggleLabelEmailOrUsername : toggleLabelPhoneNumber}
    </ToggleButton>
  );

  return showPhoneNumberField ? (
    <PhoneNumberField
      label={labelPhoneNumber}
      name={name}
      locationBasedCountryIso={locationBasedCountryIso}
      alternativeFieldTrigger={toggle}
      {...props}
    />
  ) : (
    <EmailOrUsernameField
      {...props}
      name={name}
      label={labelEmailOrUsername}
      alternativeFieldTrigger={toggle}
    />
  );
}
