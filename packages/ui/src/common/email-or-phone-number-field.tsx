import type * as Common from '@clerk/elements/common';
import * as React from 'react';
import { ToggleButton } from 'react-aria-components';

import { link } from '~/primitives/link';

import { EmailField } from './email-field';
import { PhoneNumberField } from './phone-number-field';

export function EmailOrPhoneNumberField({
  className,
  name = undefined,
  toggleLabelEmail,
  toggleLabelPhoneNumber,
  ...props
}: {
  /**
   * **Note:** this prop is required as the translation differs between `signIn` and `signUp`
   */
  toggleLabelEmail: React.ReactNode;
  /**
   * **Note:** this prop is required as the translation differs between `signIn` and `signUp`
   */
  toggleLabelPhoneNumber: React.ReactNode;
} & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  const [showPhoneNumberField, setShowPhoneNumberField] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const toggle = (
    <ToggleButton
      isSelected={showPhoneNumberField}
      onChange={isSelected => {
        setShowPhoneNumberField(isSelected);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 0);
      }}
      className={link({ size: 'sm', disabled: props.disabled })}
    >
      {showPhoneNumberField ? toggleLabelEmail : toggleLabelPhoneNumber}
    </ToggleButton>
  );

  return showPhoneNumberField ? (
    <PhoneNumberField
      alternativeFieldTrigger={toggle}
      name={name}
      {...props}
      ref={inputRef}
    />
  ) : (
    <EmailField
      {...props}
      name={name}
      alternativeFieldTrigger={toggle}
      ref={inputRef}
    />
  );
}
