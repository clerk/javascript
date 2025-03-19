import { useMemo, useRef, useState } from 'react';
import type { SignInStartIdentifier } from 'ui/common/constants';

import { useSignInContext } from '../../../../ui//contexts/components';
import { useEnvironment } from '../../../../ui//contexts/EnvironmentContext';
import { isMobileDevice } from '../../../../ui//utils/isMobileDevice';
import { getIdentifierControlDisplayValues, groupIdentifiers } from '../../../../ui/common/constants';
import { useFormControl } from '../../../../ui/utils/useFormControl';

export const useIdentifierField = () => {
  const { userSettings } = useEnvironment();
  const signInContext = useSignInContext();
  const web3FirstFactors = userSettings.web3FirstFactors;
  const authenticatableSocialStrategies = userSettings.authenticatableSocialStrategies;
  const hasSocialOrWeb3Buttons = !!authenticatableSocialStrategies.length || !!web3FirstFactors.length;
  const [shouldAutofocus, setShouldAutofocus] = useState(!isMobileDevice() && !hasSocialOrWeb3Buttons);
  const hasSwitchedByAutofillRef = useRef(false);
  const identifierAttributes = useMemo<SignInStartIdentifier[]>(
    () => groupIdentifiers(userSettings.enabledFirstFactorIdentifiers),
    [userSettings.enabledFirstFactorIdentifiers],
  );
  const initialValues: Record<SignInStartIdentifier, string | undefined> = useMemo(
    () => ({
      email_address: signInContext.initialValues?.emailAddress,
      email_address_username: signInContext.initialValues?.emailAddress || signInContext.initialValues?.username,
      username: signInContext.initialValues?.username,
      phone_number: signInContext.initialValues?.phoneNumber,
    }),
    [signInContext.initialValues],
  );

  const onlyPhoneNumberInitialValueExists =
    !!initialValues?.phone_number && !(initialValues.email_address || initialValues.username);
  const shouldStartWithPhoneNumberIdentifier =
    onlyPhoneNumberInitialValueExists && identifierAttributes.includes('phone_number');
  const [identifierAttribute, setIdentifierAttribute] = useState<SignInStartIdentifier>(
    shouldStartWithPhoneNumberIdentifier ? 'phone_number' : identifierAttributes[0] || '',
  );

  const { currentIdentifier, nextIdentifier } = getIdentifierControlDisplayValues(
    identifierAttributes,
    identifierAttribute,
  );

  const textIdentifierField = useFormControl(
    'identifier',
    initialValues[identifierAttribute] || '',
    {
      ...currentIdentifier,
      isRequired: true,
      transformer: value => value.trim(),
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        if (
          value.startsWith('+') &&
          identifierAttributes.includes('phone_number') &&
          !hasSwitchedByAutofillRef.current
        ) {
          hasSwitchedByAutofillRef.current = true;

          phoneIdentifierField.setValue(value);
          setIdentifierAttribute('phone_number');
          setShouldAutofocus(true);
          return initialValues[identifierAttribute] || '';
        }

        return undefined;
      },
    },
    'sign-in-start',
  );

  const phoneIdentifierField = useFormControl(
    'identifier',
    initialValues['phone_number'] || '',
    {
      ...currentIdentifier,
      isRequired: true,
    },
    'sign-in-start',
  );

  const identifierField = identifierAttribute === 'phone_number' ? phoneIdentifierField : textIdentifierField;

  const switchToNextIdentifier = () => {
    setIdentifierAttribute(
      i => identifierAttributes[(identifierAttributes.indexOf(i) + 1) % identifierAttributes.length],
    );
    setShouldAutofocus(true);
    hasSwitchedByAutofillRef.current = false;
  };

  return {
    nextIdentifier,
    identifierField,
    switchToNextIdentifier,
    shouldAutofocus,
  };
};
