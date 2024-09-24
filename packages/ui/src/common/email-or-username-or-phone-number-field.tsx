import type * as Common from '@clerk/elements/common';
import * as React from 'react';
import { ToggleButton } from 'react-aria-components';

import { LOCALIZATION_NEEDED } from '~/constants/localizations';
import { useFocusInput } from '~/hooks/use-focus-input';
import { link } from '~/primitives/link';

import { EmailOrUsernameField } from './email-or-username-field';
import { PhoneNumberField } from './phone-number-field';

export function EmailOrUsernameOrPhoneNumberField({
  className,
  name = undefined,
  toggleLabelEmailOrUsername,
  toggleLabelPhoneNumber,
  ...props
}: {
  /**
   * **Note:** this prop is required as the translation differs between `signIn` and `signUp`
   */
  toggleLabelEmailOrUsername: React.ReactNode;
  /**
   * **Note:** this prop is required as the translation differs between `signIn` and `signUp`
   */
  toggleLabelPhoneNumber: React.ReactNode;
} & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  const [showPhoneNumberField, setShowPhoneNumberField] = React.useState(false);

  const [inputRef, setInputFocus] = useFocusInput();

  const toggle = (
    <ToggleButton
      isSelected={showPhoneNumberField}
      onChange={isSelected => {
        setShowPhoneNumberField(isSelected);
        setInputFocus();
      }}
      className={link({ size: 'sm', disabled: props.disabled, focusVisible: 'data-attribute' })}
    >
      <span className='sr-only'>{LOCALIZATION_NEEDED.formFieldAccessibleLabel__emailOrUsernameOrPhone}</span>
      {showPhoneNumberField ? toggleLabelEmailOrUsername : toggleLabelPhoneNumber}
    </ToggleButton>
  );

  return showPhoneNumberField ? (
    <PhoneNumberField
      name={name}
      alternativeFieldTrigger={toggle}
      {...props}
      ref={inputRef}
    />
  ) : (
    <EmailOrUsernameField
      {...props}
      name={name}
      alternativeFieldTrigger={toggle}
      ref={inputRef}
    />
  );
}
