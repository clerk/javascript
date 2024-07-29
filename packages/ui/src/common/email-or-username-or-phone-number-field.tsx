import type * as Common from '@clerk/elements/common';
import * as React from 'react';
import { ToggleButton } from 'react-aria-components';

import { link } from '~/primitives/link';

import { EmailOrUsernameField } from './email-or-username-field';
import { PhoneNumberField } from './phone-number-field';

export function EmailOrUsernameOrPhoneNumberField({
  className,
  name = undefined,
  labelEmailOrUsername,
  labelPhoneNumber,
  hintText,
  toggleLabelEmailOrUsername,
  toggleLabelPhoneNumber,
  locationBasedCountryIso,
  toggleDescription,
  ...props
}: {
  labelEmailOrUsername: React.ReactNode;
  labelPhoneNumber: React.ReactNode;
  hintText: string;
  toggleLabelEmailOrUsername: React.ReactNode;
  toggleLabelPhoneNumber: React.ReactNode;
  locationBasedCountryIso: React.ComponentProps<typeof PhoneNumberField>['locationBasedCountryIso'];
  toggleDescription: React.ReactNode;
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
      hintText={hintText}
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
