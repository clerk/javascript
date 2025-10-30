import type { Attributes, SignUpResource, UserSettingsResource } from '@clerk/shared/types';
import { camelToSnake } from '@clerk/shared/underscore';

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
  attributes: Partial<Attributes>;
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

export const getInitialActiveIdentifier = (
  attributes: Partial<Attributes>,
  isProgressiveSignUp: boolean,
  initialValues?: { phoneNumber?: string | null; emailAddress?: string | null },
): ActiveIdentifier => {
  if (initialValues?.emailAddress) {
    return 'emailAddress';
  }
  if (initialValues?.phoneNumber) {
    return 'phoneNumber';
  }

  if (emailOrPhone(attributes, isProgressiveSignUp)) {
    // If we are in the case of Email OR Phone, email takes priority
    return 'emailAddress';
  }

  const { email_address, phone_number } = attributes;

  if (email_address?.enabled && isProgressiveSignUp ? email_address.required : email_address?.used_for_first_factor) {
    return 'emailAddress';
  }

  if (phone_number?.enabled && isProgressiveSignUp ? phone_number.required : phone_number?.used_for_first_factor) {
    return 'phoneNumber';
  }

  return null;
};

export function showFormFields(userSettings: UserSettingsResource): boolean {
  const { authenticatableSocialStrategies, web3FirstFactors } = userSettings;

  return userSettings.hasValidAuthFactor || (!authenticatableSocialStrategies.length && !web3FirstFactors.length);
}

export function emailOrPhone(attributes: Partial<Attributes>, isProgressiveSignUp: boolean) {
  const { email_address, phone_number } = attributes;

  return Boolean(
    isProgressiveSignUp
      ? email_address?.enabled && phone_number?.enabled && !email_address.required && !phone_number.required
      : email_address?.used_for_first_factor && phone_number?.used_for_first_factor,
  );
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
    const show = (!hasTicket || (hasTicket && hasEmail)) && attributes.email_address?.enabled;

    if (!show) {
      return;
    }

    // If we are in the case of Email OR Phone, determine if the initial input has to be the email address
    // based on the active identifier type.
    if (emailOrPhone(attributes, isProgressiveSignUp) && activeCommIdentifierType !== 'emailAddress') {
      return;
    }

    const { emailShouldBeRequired } = determineRequiredIdentifier(attributes);

    return {
      required: emailShouldBeRequired,
      disabled: !!hasTicket && !!hasEmail,
    };
  }

  const show =
    (!hasTicket || (hasTicket && hasEmail)) &&
    attributes.email_address?.enabled &&
    attributes.email_address?.used_for_first_factor &&
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
    const show = attributes.phone_number?.enabled;

    if (!show) {
      return;
    }

    // If we are in the case of Email OR Phone, determine if the initial input has to be the phone number
    // based on the active identifier type.
    if (emailOrPhone(attributes, isProgressiveSignUp) && activeCommIdentifierType !== 'phoneNumber') {
      return;
    }

    const { phoneShouldBeRequired } = determineRequiredIdentifier(attributes);

    return {
      required: phoneShouldBeRequired,
    };
  }

  const show =
    !hasTicket &&
    attributes.phone_number?.enabled &&
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
function getPasswordField(attributes: Partial<Attributes>): Field | undefined {
  const show = attributes.password?.enabled && attributes.password.required;

  if (!show) {
    return;
  }

  return {
    required: Boolean(attributes.password?.required),
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

function getGenericField(fieldKey: FieldKey, attributes: Partial<Attributes>): Field | undefined {
  const attrKey = camelToSnake(fieldKey);

  // @ts-expect-error - TS doesn't know that the key exists
  if (!attributes[attrKey]?.enabled) {
    return;
  }

  return {
    // @ts-expect-error - TS doesn't know that the key exists
    required: attributes[attrKey]?.required,
  };
}

type Outcome = 'email' | 'phone' | 'username' | 'mirrorServer' | 'none';

type SignUpAttributeField = {
  enabled: boolean;
  required: boolean;
  firstFactor: boolean;
};

type Context = {
  passwordRequired: boolean;
  email: SignUpAttributeField;
  phone: SignUpAttributeField;
  username: SignUpAttributeField;
};

const outcomePredicates: Record<Outcome, ((ctx: Context) => boolean)[]> = {
  mirrorServer: [
    // If password is not required, then field requirements are determined by the server.
    ctx => !ctx.passwordRequired,
    // If any of the identifiers are already required by the server, then we don't need to do anything.
    ctx => ctx.email.required || ctx.phone.required || (ctx.username.required && ctx.username.firstFactor),
  ],
  none: [
    // If none of the identifiers are enabled, then none can be required.
    ctx => !ctx.email.enabled && !ctx.phone.enabled && !ctx.username.enabled,
  ],
  email: [
    // If email is the only enabled identifier, it should be required.
    ctx => ctx.email.enabled && !ctx.phone.enabled && !ctx.username.enabled,
    // If email is enabled but not required, and phone is enabled and not required, then email should be required.
    ctx => ctx.email.enabled && !ctx.email.required && ctx.phone.enabled && !ctx.phone.required,
    // If username is a first factor but not required, email can be used as an alternative.
    ctx => ctx.username.firstFactor && !ctx.username.required && ctx.email.enabled && !ctx.email.required,
    // If username is required but not a first factor, and both email and phone are enabled, then email is a valid identifier.
    ctx => ctx.username.required && !ctx.username.firstFactor && ctx.email.enabled && ctx.phone.enabled,
  ],
  phone: [
    ctx => ctx.phone.enabled && !ctx.email.required && !ctx.phone.required,
    // If username is a first factor but not required, phone can be used as an alternative.
    ctx => ctx.username.firstFactor && !ctx.username.required && ctx.phone.enabled && !ctx.phone.required,
    // If phone is the only first factor, it should be required.
    ctx => ctx.phone.firstFactor && !ctx.email.firstFactor && !ctx.username.firstFactor,
    // If username is required but not a first factor, and both email and phone are enabled, then phone is a valid identifier.
    ctx => ctx.username.required && !ctx.username.firstFactor && ctx.phone.enabled && ctx.email.enabled,
    // If email is not enabled, but phone and username are, phone should be available.
    ctx => !ctx.email.enabled && ctx.phone.enabled && ctx.username.enabled,
  ],
  username: [
    // If username is the only first factor, it should be required.
    ctx => ctx.username.enabled && ctx.username.firstFactor && !ctx.email.enabled && !ctx.phone.enabled,
    // If username is required but not a first factor, and both email and phone are enabled, it should be required.
    ctx => ctx.username.required && !ctx.username.firstFactor && ctx.email.enabled && ctx.phone.enabled,
  ],
};

/**
 * When password is required, we need to ensure at least one identifier
 * (email, phone, or username) is also required
 */
export function determineRequiredIdentifier(attributes: Partial<Attributes>): {
  emailShouldBeRequired: boolean;
  phoneShouldBeRequired: boolean;
  usernameShouldBeRequired: boolean;
} {
  const ctx = {
    passwordRequired: Boolean(attributes.password?.enabled && attributes.password.required),
    email: {
      enabled: Boolean(attributes.email_address?.enabled),
      required: Boolean(attributes.email_address?.required),
      firstFactor: Boolean(attributes.email_address?.used_for_first_factor),
    },
    phone: {
      enabled: Boolean(attributes.phone_number?.enabled),
      required: Boolean(attributes.phone_number?.required),
      firstFactor: Boolean(attributes.phone_number?.used_for_first_factor),
    },
    username: {
      enabled: Boolean(attributes.username?.enabled),
      required: Boolean(attributes.username?.required),
      firstFactor: Boolean(attributes.username?.used_for_first_factor),
    },
  };

  const outcomeMet = (outcome: Outcome) => outcomePredicates[outcome].some(predicate => predicate(ctx));

  if (outcomeMet('mirrorServer')) {
    return {
      emailShouldBeRequired: ctx.email.required,
      phoneShouldBeRequired: ctx.phone.required,
      usernameShouldBeRequired: ctx.username.required,
    };
  }

  if (outcomeMet('none')) {
    return {
      emailShouldBeRequired: false,
      phoneShouldBeRequired: false,
      usernameShouldBeRequired: false,
    };
  }

  const emailShouldBeRequired = outcomeMet('email');
  const phoneShouldBeRequired = outcomeMet('phone');
  const usernameShouldBeRequired = outcomeMet('username');

  // If password is required and no identifier is enabled, then email is the default.
  if (ctx.passwordRequired && !emailShouldBeRequired && !phoneShouldBeRequired && !usernameShouldBeRequired) {
    return {
      emailShouldBeRequired: true,
      phoneShouldBeRequired: false,
      usernameShouldBeRequired: false,
    };
  }

  return {
    emailShouldBeRequired,
    phoneShouldBeRequired,
    usernameShouldBeRequired,
  };
}
