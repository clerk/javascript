import type { Attributes, EnvironmentResource, SignUpResource } from '@clerk/types';
import { UserSettingsResource } from '@clerk/types';
import { FieldState } from 'ui/common';

export type ActiveIdentifier = 'emailAddress' | 'phoneNumber' | null | undefined;

export type FieldKeys = 'emailAddress' | 'phoneNumber' | 'username' | 'firstName' | 'lastName' | 'password' | 'ticket';

export type FormState<T> = {
  [key in FieldKeys]: FieldState<T>;
};

export type Field = {
  enabled: boolean;
  required: boolean;
  showAsDisabled?: boolean;
};

export type Fields = {
  [key in FieldKeys]: Field;
};

type FieldDeterminationProps = {
  environment: EnvironmentResource;
  activeCommIdentifierType?: ActiveIdentifier;
  hasTicket?: boolean;
  hasEmail?: boolean;
  signUp?: SignUpResource | undefined;
};

export function determineActiveFields({
  environment,
  activeCommIdentifierType,
  hasTicket = false,
  hasEmail = false,
}: FieldDeterminationProps): Fields {
  const { userSettings } = environment;
  const { attributes } = userSettings;

  return {
    emailAddress: getEmailAddressField(attributes, hasTicket, hasEmail, activeCommIdentifierType),
    phoneNumber: getPhoneNumberField(attributes, hasTicket, activeCommIdentifierType),
    username: getUserNameField(attributes),
    firstName: getFirstNameField(attributes),
    lastName: getLastNameField(attributes),
    password: getPasswordField(attributes),
    ticket: getTicketField(hasTicket),
  };
}

// If continuing with an existing sign-up, show only fields absolutely necessary to minimize fiction
export function minimizeFieldsForExistingSignup(fields: Fields, signUp: SignUpResource) {
  if (signUp) {
    const hasVerifiedEmail = signUp.verifications?.emailAddress?.status == 'verified';
    const hasVerifiedPhone = signUp.verifications?.phoneNumber?.status == 'verified';
    const hasVerifiedExternalAccount = signUp.verifications?.externalAccount?.status == 'verified';
    const hasVerifiedWeb3Wallet = signUp.verifications?.web3Wallet?.status == 'verified';

    if (hasVerifiedEmail) {
      fields.emailAddress.enabled = false;
    }

    if (hasVerifiedPhone) {
      fields.phoneNumber.enabled = false;
    }

    if (hasVerifiedExternalAccount || hasVerifiedWeb3Wallet) {
      fields.password.enabled = false;
    }

    if (signUp.firstName) {
      fields.firstName.enabled = false;
    }

    if (signUp.lastName) {
      fields.lastName.enabled = false;
    }

    if (signUp.username) {
      fields.username.enabled = false;
    }

    // Remove any non-required fields
    Object.entries(fields).forEach(([k, v]) => {
      if (!v.required) {
        // @ts-ignore
        fields[k].enabled = false;
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

// TODO revisit when attributes.email_address.required becomes effective
function getEmailAddressField(
  attributes: Attributes,
  hasTicket: boolean,
  hasEmail: boolean,
  activeCommIdentifierType: ActiveIdentifier,
): Field {
  const enabled =
    (!hasTicket || (hasTicket && hasEmail)) &&
    attributes.email_address.enabled &&
    attributes.email_address.used_for_first_factor &&
    activeCommIdentifierType == 'emailAddress';

  return {
    enabled: enabled,
    required: enabled, // as far as the FE is concerned the email address is required, if enabled
    showAsDisabled: hasTicket && hasEmail,
  };
}

// TODO revisit when attributes.phone_number.required becomes effective
function getPhoneNumberField(
  attributes: Attributes,
  hasTicket: boolean,
  activeCommIdentifierType: ActiveIdentifier,
): Field {
  const enabled =
    !hasTicket &&
    attributes.phone_number.enabled &&
    attributes.phone_number.used_for_first_factor &&
    activeCommIdentifierType == 'phoneNumber';

  return {
    enabled: enabled,
    required: enabled, // as far as the FE is concerned the phone number is required, if enabled
  };
}

function getUserNameField(attributes: Attributes): Field {
  return {
    enabled: attributes.username.enabled,
    required: attributes.username.required,
  };
}

function getFirstNameField(attributes: Attributes): Field {
  return {
    enabled: attributes.first_name.enabled,
    required: attributes.first_name.required,
  };
}

function getLastNameField(attributes: Attributes): Field {
  return {
    enabled: attributes.last_name.enabled,
    required: attributes.last_name.required,
  };
}

function getPasswordField(attributes: Attributes): Field {
  return {
    enabled: attributes.password.enabled,
    required: attributes.password.required,
  };
}

function getTicketField(hasTicket: boolean): Field {
  return {
    enabled: hasTicket,
    required: hasTicket,
  };
}
