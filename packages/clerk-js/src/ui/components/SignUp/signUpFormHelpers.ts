import { camelToSnake } from '@clerk/shared/underscore';
import type { Attributes, SignUpResource, UserSettingsResource } from '@clerk/types';

import type { FieldState } from '../../common';

/**
 * ActiveIdentifier denotes which one of the email address or phone number takes priority when enabled
 */
export type ActiveIdentifier = 'emailAddress' | 'phoneNumber' | null | undefined;

const FieldKeys = [
  'emailAddress',
  'phoneNumber',
  'username',
  'firstName',
  'lastName',
  'password',
  'ticket',
  'legalAccepted',
] as const;
export type FieldKey = (typeof FieldKeys)[number];

export type FormState<T> = {
  [key in FieldKey]: FieldState<T>;
};

export type Field = {
  disabled?: boolean;
  /**
   * Denotes if the corresponding input is required to be filled
   */
  required: boolean;
};

export type Fields = {
  [key in FieldKey]: Field | undefined;
};

type FieldDeterminationProps = {
  attributes: Attributes;
  activeCommIdentifierType?: ActiveIdentifier;
  hasTicket?: boolean;
  hasEmail?: boolean;
  signUp?: SignUpResource | undefined;
  isProgressiveSignUp: boolean;
  legalConsentRequired?: boolean;
};

export function determineActiveFields(fieldProps: FieldDeterminationProps): Fields {
  return FieldKeys.reduce((fields: Fields, fieldKey: FieldKey) => {
    const field = getField(fieldKey, fieldProps);
    if (field) {
      fields[fieldKey] = field;
    }
    return fields;
  }, {} as Fields);
}

// If continuing with an existing sign-up, show only fields absolutely necessary to minimize fiction
export function minimizeFieldsForExistingSignup(fields: Fields, signUp: SignUpResource) {
  if (signUp) {
    const hasEmailFilled = !!signUp.emailAddress;
    const hasVerifiedEmail = signUp.verifications?.emailAddress?.status === 'verified';
    const hasVerifiedPhone = signUp.verifications?.phoneNumber?.status === 'verified';
    const hasVerifiedExternalAccount = signUp.verifications?.externalAccount?.status === 'verified';
    const hasVerifiedWeb3Wallet = signUp.verifications?.web3Wallet?.status === 'verified';
    const hasLegalAccepted = signUp.legalAcceptedAt !== null;

    if (hasEmailFilled && hasVerifiedEmail) {
      delete fields.emailAddress;
    }

    if (hasVerifiedPhone) {
      delete fields.phoneNumber;
    }

    if (hasVerifiedExternalAccount || hasVerifiedWeb3Wallet) {
      delete fields.password;
    }

    if (signUp.firstName) {
      delete fields.firstName;
    }

    if (signUp.lastName) {
      delete fields.lastName;
    }

    if (signUp.username) {
      delete fields.username;
    }

    if (hasLegalAccepted) {
      delete fields.legalAccepted;
    }

    // Hide any non-required fields
    Object.entries(fields).forEach(([k, v]) => {
      if (v && !v.required) {
        delete fields[k as FieldKey];
      }
    });
  }
}

export const getInitialActiveIdentifier = (attributes: Attributes, isProgressiveSignUp: boolean): ActiveIdentifier => {
  if (emailOrPhone(attributes, isProgressiveSignUp)) {
    // If we are in the case of Email OR Phone, email takes priority
    return 'emailAddress';
  }

  const { email_address, phone_number } = attributes;

  if (email_address.enabled && isProgressiveSignUp ? email_address.required : email_address.used_for_first_factor) {
    return 'emailAddress';
  }

  if (phone_number.enabled && isProgressiveSignUp ? phone_number.required : phone_number.used_for_first_factor) {
    return 'phoneNumber';
  }

  return null;
};

export function showFormFields(userSettings: UserSettingsResource): boolean {
  const { authenticatableSocialStrategies, web3FirstFactors } = userSettings;

  return userSettings.hasValidAuthFactor || (!authenticatableSocialStrategies.length && !web3FirstFactors.length);
}

export function emailOrPhone(attributes: Attributes, isProgressiveSignUp: boolean) {
  const { email_address, phone_number } = attributes;

  if (isProgressiveSignUp) {
    return email_address.enabled && phone_number.enabled && !email_address.required && !phone_number.required;
  }

  return email_address.used_for_first_factor && phone_number.used_for_first_factor;
}

function getField(fieldKey: FieldKey, fieldProps: FieldDeterminationProps): Field | undefined {
  switch (fieldKey) {
    case 'emailAddress':
      return getEmailAddressField(fieldProps);
    case 'phoneNumber':
      return getPhoneNumberField(fieldProps);
    case 'password':
      return getPasswordField(fieldProps.attributes);
    case 'ticket':
      return getTicketField(fieldProps.hasTicket);
    case 'legalAccepted':
      return getLegalAcceptedField(fieldProps.legalConsentRequired);
    case 'username':
    case 'firstName':
    case 'lastName':
      return getGenericField(fieldKey, fieldProps.attributes);
    default:
      return;
  }
}

function getEmailAddressField({
  attributes,
  hasTicket,
  hasEmail,
  activeCommIdentifierType,
  isProgressiveSignUp,
}: FieldDeterminationProps): Field | undefined {
  if (isProgressiveSignUp) {
    // If there is no ticket, or there is a ticket along with an email, and email address is enabled,
    // we have to show it in the SignUp form
    const show = (!hasTicket || (hasTicket && hasEmail)) && attributes.email_address.enabled;

    if (!show) {
      return;
    }

    // If we are in the case of Email OR Phone, determine if the initial input has to be the email address
    // based on the active identifier type.
    if (emailOrPhone(attributes, isProgressiveSignUp) && activeCommIdentifierType !== 'emailAddress') {
      return;
    }

    return {
      required: attributes.email_address.required,
      disabled: !!hasTicket && !!hasEmail,
    };
  }

  const show =
    (!hasTicket || (hasTicket && hasEmail)) &&
    attributes.email_address.enabled &&
    attributes.email_address.used_for_first_factor &&
    activeCommIdentifierType === 'emailAddress';

  if (!show) {
    return;
  }

  return {
    required: true, // as far as the FE is concerned the email address is required, if shown
    disabled: !!hasTicket && !!hasEmail,
  };
}

function getPhoneNumberField({
  attributes,
  hasTicket,
  activeCommIdentifierType,
  isProgressiveSignUp,
}: FieldDeterminationProps): Field | undefined {
  if (isProgressiveSignUp) {
    // If there is no ticket and phone number is enabled, we have to show it in the SignUp form
    const show = attributes.phone_number.enabled;

    if (!show) {
      return;
    }

    // If we are in the case of Email OR Phone, determine if the initial input has to be the phone number
    // based on the active identifier type.
    if (emailOrPhone(attributes, isProgressiveSignUp) && activeCommIdentifierType !== 'phoneNumber') {
      return;
    }

    return {
      required: attributes.phone_number.required,
    };
  }

  const show =
    !hasTicket &&
    attributes.phone_number.enabled &&
    attributes.phone_number.used_for_first_factor &&
    activeCommIdentifierType === 'phoneNumber';

  if (!show) {
    return;
  }

  return {
    required: true, // as far as the FE is concerned the phone number is required, if shown
  };
}

// Currently, password is always enabled so only show if required
function getPasswordField(attributes: Attributes): Field | undefined {
  const show = attributes.password.enabled && attributes.password.required;

  if (!show) {
    return;
  }

  return {
    required: attributes.password.required,
  };
}

function getTicketField(hasTicket?: boolean): Field | undefined {
  if (!hasTicket) {
    return;
  }

  return {
    required: true,
  };
}

function getLegalAcceptedField(legalConsentRequired?: boolean): Field | undefined {
  if (!legalConsentRequired) {
    return;
  }

  return {
    required: true,
  };
}

function getGenericField(fieldKey: FieldKey, attributes: Attributes): Field | undefined {
  const attrKey = camelToSnake(fieldKey);

  // @ts-expect-error - TS doesn't know that the key exists
  if (!attributes[attrKey].enabled) {
    return;
  }

  return {
    // @ts-expect-error - TS doesn't know that the key exists
    required: attributes[attrKey].required,
  };
}
