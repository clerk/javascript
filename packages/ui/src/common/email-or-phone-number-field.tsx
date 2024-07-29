import type * as Common from '@clerk/elements/common';
import * as React from 'react';
import { ToggleButton } from 'react-aria-components';

import { link } from '~/primitives/link';

import { EmailField } from './email-field';
import { PhoneNumberField } from './phone-number-field';

export function EmailOrPhoneNumberField({
  className,
  name = undefined,
  labelEmail,
  labelPhoneNumber,
  hintText,
  locationBasedCountryIso,
  toggleLabelEmail,
  toggleLabelPhoneNumber,
  ...props
}: {
  labelEmail: React.ReactNode;
  labelPhoneNumber: React.ReactNode;
  hintText: React.ReactNode;
  locationBasedCountryIso: React.ComponentProps<typeof PhoneNumberField>['locationBasedCountryIso'];
  toggleLabelEmail: React.ReactNode;
  toggleLabelPhoneNumber: React.ReactNode;
} & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  const [showPhoneNumberField, setShowPhoneNumberField] = React.useState(false);

  const toggle = (
    <ToggleButton
      isSelected={showPhoneNumberField}
      onChange={setShowPhoneNumberField}
      className={link({ size: 'sm', disabled: props.disabled })}
    >
      {showPhoneNumberField ? toggleLabelEmail : toggleLabelPhoneNumber}
    </ToggleButton>
  );

  return showPhoneNumberField ? (
    <PhoneNumberField
      label={labelPhoneNumber}
      hintText={hintText}
      locationBasedCountryIso={locationBasedCountryIso}
      alternativeFieldTrigger={toggle}
      name={name}
      {...props}
    />
  ) : (
    <EmailField
      {...props}
      name={name}
      label={labelEmail}
      alternativeFieldTrigger={toggle}
    />
  );
}
