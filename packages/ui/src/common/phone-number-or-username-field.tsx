import type * as Common from '@clerk/elements/common';
import * as React from 'react';
import { ToggleButton } from 'react-aria-components';

import { link } from '~/primitives/link';

import { PhoneNumberField } from './phone-number-field';
import { UsernameField } from './username-field';

export function PhoneNumberOrUsernameField({
  className,
  name = undefined,
  labelPhoneNumber,
  labelUsername,
  hintText,
  locationBasedCountryIso,
  toggleLabelPhoneNumber,
  toggleLabelUsername,
  toggleDescription,
  ...props
}: {
  labelUsername: React.ReactNode;
  labelPhoneNumber: React.ReactNode;
  hintText: React.ReactNode;
  locationBasedCountryIso: React.ComponentProps<typeof PhoneNumberField>['locationBasedCountryIso'];
  toggleLabelPhoneNumber: React.ReactNode;
  toggleLabelUsername: React.ReactNode;
  toggleDescription: React.ReactNode;
} & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  const [showUsernameField, setShowUsernameField] = React.useState(false);

  const toggle = (
    <ToggleButton
      isSelected={showUsernameField}
      onChange={setShowUsernameField}
      className={link({ size: 'sm', disabled: props.disabled, focusVisible: 'data-attribute' })}
    >
      <span className='sr-only'>{toggleDescription}</span>
      {showUsernameField ? toggleLabelPhoneNumber : toggleLabelUsername}
    </ToggleButton>
  );

  return showUsernameField ? (
    <UsernameField
      {...props}
      name={name}
      label={labelUsername}
      hintText={hintText}
      alternativeFieldTrigger={toggle}
    />
  ) : (
    <PhoneNumberField
      name={name}
      label={labelPhoneNumber}
      hintText={hintText}
      locationBasedCountryIso={locationBasedCountryIso}
      alternativeFieldTrigger={toggle}
      {...props}
    />
  );
}
