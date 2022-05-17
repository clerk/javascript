import { camelToSnake } from '@clerk/shared/utils';
import type { Attributes, SignUpResource } from '@clerk/types';
import { UserSettingsResource } from '@clerk/types';
import { FieldState } from 'ui/common';

export type ActiveIdentifier = 'emailAddress' | 'phoneNumber' | null | undefined;

const FieldKeys = ['emailAddress', 'phoneNumber', 'username', 'firstName', 'lastName', 'password', 'ticket'];
export type FieldKey = typeof FieldKeys[number];

export type FormState<T> = {
  [key in FieldKey]: FieldState<T>;
};

export type Field = {
  disabled?: boolean;
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
};

export function determineActiveFields(fieldProps: FieldDeterminationProps): Fields {
  return FieldKeys.reduce((fields: Fields, fieldKey: string) => {
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
    const hasVerifiedEmail = signUp.verifications?.emailAddress?.status == 'verified';
    const hasVerifiedPhone = signUp.verifications?.phoneNumber?.status == 'verified';
    const hasVerifiedExternalAccount = signUp.verifications?.externalAccount?.status == 'verified';
    const hasVerifiedWeb3Wallet = signUp.verifications?.web3Wallet?.status == 'verified';

    if (hasVerifiedEmail) {
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

    // Hide any non-required fields
    Object.entries(fields).forEach(([k, v]) => {
      if (v && !v.required) {
        // @ts-ignore
        delete fields[k];
      }
    });
  }
}

// TODO revisit when attributes.email_address.required becomes effective
// TODO revisit when attributes.phone_number.required becomes effective
export const getInitialActiveIdentifier = (attributes: Attributes): ActiveIdentifier => {
  if (attributes.email_address.enabled && attributes.email_address.used_for_first_factor) {
    return 'emailAddress';
  }

  if (attributes.phone_number.enabled && attributes.phone_number.used_for_first_factor) {
    return 'phoneNumber';
  }

  return null;
};

export function showFormFields(userSettings: UserSettingsResource): boolean {
  const { socialProviderStrategies, web3FirstFactors } = userSettings;

  return userSettings.hasValidAuthFactor || (!socialProviderStrategies.length && !web3FirstFactors.length);
}

export function emailOrPhoneUsedForFF(attributes: Attributes) {
  return attributes.email_address.used_for_first_factor && attributes.phone_number.used_for_first_factor;
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
    case 'username':
    case 'firstName':
    case 'lastName':
      return getGenericField(fieldKey, fieldProps.attributes);
    default:
      return;
  }
}

// TODO revisit when attributes.email_address.required becomes effective
function getEmailAddressField({
  attributes,
  hasTicket,
  hasEmail,
  activeCommIdentifierType,
}: FieldDeterminationProps): Field | undefined {
  const show =
    (!hasTicket || (hasTicket && hasEmail)) &&
    attributes.email_address.enabled &&
    attributes.email_address.used_for_first_factor &&
    activeCommIdentifierType == 'emailAddress';

  if (!show) {
    return;
  }

  return {
    required: true, // as far as the FE is concerned the email address is required, if shown
    disabled: !!hasTicket && !!hasEmail,
  };
}

// TODO revisit when attributes.phone_number.required becomes effective
function getPhoneNumberField({
  attributes,
  hasTicket,
  activeCommIdentifierType,
}: FieldDeterminationProps): Field | undefined {
  const show =
    !hasTicket &&
    attributes.phone_number.enabled &&
    attributes.phone_number.used_for_first_factor &&
    activeCommIdentifierType == 'phoneNumber';

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

function getGenericField(fieldKey: FieldKey, attributes: Attributes): Field | undefined {
  const attrKey = camelToSnake(fieldKey);

  // @ts-ignore
  if (!attributes[attrKey].enabled) {
    return;
  }

  return {
    // @ts-ignore
    required: attributes[attrKey].required,
  };
}
