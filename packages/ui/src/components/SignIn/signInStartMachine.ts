import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import type { ClerkAPIError, PhoneCodeChannel, PhoneCodeChannelData, SignInFactor } from '@clerk/shared/types';

import type { SignInStartIdentifier } from '../../common/constants';

// --- Config (immutable, derived from environment/context at init) ---

export type SignInStartConfig = {
  identifierAttributes: SignInStartIdentifier[];
  initialIdentifier: SignInStartIdentifier;
  initialIdentifierValue: string;
  isCombinedFlow: boolean;
  organizationTicket: string;
  clerkStatus: string;
  hasSocialOrWeb3Buttons: boolean;
  isMobile: boolean;
  enterpriseSSOEnabled: boolean;
};

// --- State ---

export type SignInStartState = {
  screen: 'form' | 'loading' | 'alternativePhoneCode';
  identifierAttribute: SignInStartIdentifier;
  identifierValue: string;
  passwordValue: string;
  shouldAutofocus: boolean;
  hasSwitchedByAutofill: boolean;
  alternativePhoneCodeProvider: PhoneCodeChannelData | null;
  cardError: ClerkAPIError | string | undefined;
  isSubmitting: boolean;
  config: SignInStartConfig;
};

// --- Result from API calls (serializable subset the reducer needs) ---

export type SignInCreateResult = {
  status: string;
  createdSessionId: string | null;
  supportedFirstFactors: SignInFactor[] | null;
  hasOnlyEnterpriseSSO: boolean;
  hasMultipleEnterpriseConnections: boolean;
};

export type SubmitErrorResult = {
  errors: ClerkAPIError[];
  identifierType: 'tel' | 'text' | 'email';
  identifierValue: string;
};

// --- Events ---

export type SignInStartEvent =
  | { type: 'SET_IDENTIFIER'; value: string }
  | { type: 'SET_PASSWORD'; value: string }
  | { type: 'SWITCH_IDENTIFIER' }
  | { type: 'AUTOFILL_PHONE_SWITCH'; value: string }
  | { type: 'SELECT_ALT_PHONE_PROVIDER'; provider: PhoneCodeChannelData }
  | { type: 'CLEAR_ALT_PHONE_PROVIDER' }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_SUCCESS'; result: SignInCreateResult }
  | { type: 'SUBMIT_ERROR'; result: SubmitErrorResult }
  | { type: 'TICKET_PROCESSING' }
  | { type: 'TICKET_SUCCESS'; result: SignInCreateResult }
  | { type: 'TICKET_ERROR'; result: SubmitErrorResult }
  | { type: 'TICKET_DONE'; isRedirectingToSSO: boolean }
  | { type: 'OAUTH_ERROR'; error: ClerkAPIError }
  | { type: 'OAUTH_ERROR_GENERIC' }
  | { type: 'SET_CARD_ERROR'; error: ClerkAPIError | string | undefined };

// --- Effects (declarative side-effect descriptors) ---

export type SignInStartEffect =
  | { type: 'SIGN_IN_CREATE'; identifier: string; password: string; alternativePhoneChannel: PhoneCodeChannel | null }
  | { type: 'SIGN_IN_CREATE_TICKET'; ticket: string }
  | { type: 'NAVIGATE'; to: string; searchParams?: Record<string, string> }
  | { type: 'SET_ACTIVE'; sessionId: string }
  | { type: 'SET_ACTIVE_LAST_SESSION' }
  | { type: 'SET_ACTIVE_SESSION'; sessionId: string }
  | { type: 'ENTERPRISE_SSO_REDIRECT' }
  | { type: 'COMBINED_FLOW_TRANSFER'; identifierType: 'tel' | 'text' | 'email'; identifierValue: string }
  | { type: 'RESET_SIGN_IN' }
  | { type: 'NAVIGATE_SIGN_UP'; searchParams?: Record<string, string> }
  | { type: 'PASSKEY_AUTOFILL' }
  | { type: 'HANDLE_FIELD_ERRORS'; errors: ClerkAPIError[] }
  | { type: 'SIGN_IN_CREATE_WITHOUT_PASSWORD'; identifier: string; alternativePhoneChannel: PhoneCodeChannel | null };

export type ReducerResult = {
  state: SignInStartState;
  effects: SignInStartEffect[];
};

// --- Known OAuth error codes that should be shown to the user ---

const KNOWN_OAUTH_ERROR_CODES = new Set([
  ERROR_CODES.NOT_ALLOWED_TO_SIGN_UP,
  ERROR_CODES.OAUTH_ACCESS_DENIED,
  ERROR_CODES.NOT_ALLOWED_ACCESS,
  ERROR_CODES.SAML_USER_ATTRIBUTE_MISSING,
  ERROR_CODES.OAUTH_EMAIL_DOMAIN_RESERVED_BY_SAML,
  ERROR_CODES.USER_LOCKED,
  ERROR_CODES.EXTERNAL_ACCOUNT_NOT_FOUND,
  ERROR_CODES.SIGN_UP_MODE_RESTRICTED,
  ERROR_CODES.SIGN_UP_MODE_RESTRICTED_WAITLIST,
  ERROR_CODES.ENTERPRISE_SSO_USER_ATTRIBUTE_MISSING,
  ERROR_CODES.ENTERPRISE_SSO_EMAIL_ADDRESS_DOMAIN_MISMATCH,
  ERROR_CODES.ENTERPRISE_SSO_HOSTED_DOMAIN_MISMATCH,
  ERROR_CODES.SAML_EMAIL_ADDRESS_DOMAIN_MISMATCH,
  ERROR_CODES.ORGANIZATION_MEMBERSHIP_QUOTA_EXCEEDED_FOR_SSO,
  ERROR_CODES.CAPTCHA_INVALID,
  ERROR_CODES.FRAUD_DEVICE_BLOCKED,
  ERROR_CODES.FRAUD_ACTION_BLOCKED,
  ERROR_CODES.SIGNUP_RATE_LIMIT_EXCEEDED,
  ERROR_CODES.USER_BANNED,
  ERROR_CODES.USER_DEACTIVATED,
]);

const PASSWORD_RECOVERY_CODES = new Set([
  ERROR_CODES.INVALID_STRATEGY_FOR_USER,
  ERROR_CODES.FORM_PASSWORD_INCORRECT,
  ERROR_CODES.FORM_PASSWORD_PWNED,
]);

const ACCOUNT_NOT_EXIST_CODES = new Set([
  ERROR_CODES.INVITATION_ACCOUNT_NOT_EXISTS,
  ERROR_CODES.FORM_IDENTIFIER_NOT_FOUND,
]);

// --- Reducer ---

export function initSignInStartState(config: SignInStartConfig): SignInStartState {
  const isTicketFlow = !!config.organizationTicket;
  const isSignUpRedirect = config.clerkStatus === 'sign_up';

  return {
    screen: isTicketFlow || isSignUpRedirect ? 'loading' : 'form',
    identifierAttribute: config.initialIdentifier,
    identifierValue: config.initialIdentifierValue,
    passwordValue: '',
    shouldAutofocus: !config.isMobile && !config.hasSocialOrWeb3Buttons,
    hasSwitchedByAutofill: false,
    alternativePhoneCodeProvider: null,
    cardError: undefined,
    isSubmitting: false,
    config,
  };
}

function handleSignInStatus(state: SignInStartState, result: SignInCreateResult): ReducerResult {
  const effects: SignInStartEffect[] = [];

  switch (result.status) {
    case 'needs_identifier':
      if (result.supportedFirstFactors?.some(ff => ff.strategy === 'enterprise_sso')) {
        effects.push({ type: 'ENTERPRISE_SSO_REDIRECT' });
      }
      return { state: { ...state, isSubmitting: false }, effects };

    case 'needs_first_factor':
      if (!result.hasOnlyEnterpriseSSO || result.hasMultipleEnterpriseConnections) {
        effects.push({ type: 'NAVIGATE', to: 'factor-one' });
      } else {
        effects.push({ type: 'ENTERPRISE_SSO_REDIRECT' });
      }
      return { state: { ...state, isSubmitting: false }, effects };

    case 'needs_second_factor':
      effects.push({ type: 'NAVIGATE', to: 'factor-two' });
      return { state: { ...state, isSubmitting: false }, effects };

    case 'needs_client_trust':
      effects.push({ type: 'NAVIGATE', to: 'client-trust' });
      return { state: { ...state, isSubmitting: false }, effects };

    case 'complete':
      effects.push({ type: 'SET_ACTIVE', sessionId: result.createdSessionId ?? '' });
      return { state: { ...state, isSubmitting: false }, effects };

    default:
      return { state: { ...state, isSubmitting: false }, effects };
  }
}

function handleSubmitError(state: SignInStartState, result: SubmitErrorResult): ReducerResult {
  const { errors } = result;
  const effects: SignInStartEffect[] = [];

  const instantPasswordError = errors.find(e => PASSWORD_RECOVERY_CODES.has(e.code));
  const sessionAlreadyExistsError = errors.find(e => e.code === ERROR_CODES.SESSION_EXISTS);
  const alreadySignedInError = errors.find(e => e.code === 'identifier_already_signed_in');
  const accountDoesNotExistError = errors.find(e => ACCOUNT_NOT_EXIST_CODES.has(e.code));

  if (instantPasswordError) {
    effects.push({
      type: 'SIGN_IN_CREATE_WITHOUT_PASSWORD',
      identifier: state.identifierValue,
      alternativePhoneChannel: state.alternativePhoneCodeProvider?.channel || null,
    });
    return { state, effects };
  }

  if (sessionAlreadyExistsError) {
    effects.push({ type: 'SET_ACTIVE_LAST_SESSION' });
    return { state: { ...state, isSubmitting: false }, effects };
  }

  if (alreadySignedInError) {
    const sid = alreadySignedInError.meta?.sessionId;
    if (sid) {
      effects.push({ type: 'SET_ACTIVE_SESSION', sessionId: sid });
    }
    return { state: { ...state, isSubmitting: false }, effects };
  }

  if (state.config.isCombinedFlow && accountDoesNotExistError) {
    effects.push({
      type: 'COMBINED_FLOW_TRANSFER',
      identifierType: result.identifierType,
      identifierValue: result.identifierValue,
    });
    return { state: { ...state, isSubmitting: false }, effects };
  }

  effects.push({ type: 'HANDLE_FIELD_ERRORS', errors });
  return { state: { ...state, isSubmitting: false }, effects };
}

export function signInStartReducer(state: SignInStartState, event: SignInStartEvent): ReducerResult {
  switch (event.type) {
    case 'SET_IDENTIFIER':
      return {
        state: { ...state, identifierValue: event.value },
        effects: [],
      };

    case 'SET_PASSWORD':
      return {
        state: { ...state, passwordValue: event.value },
        effects: [],
      };

    case 'SWITCH_IDENTIFIER': {
      const attrs = state.config.identifierAttributes;
      const currentIndex = attrs.indexOf(state.identifierAttribute);
      const nextAttribute = attrs[(currentIndex + 1) % attrs.length];
      return {
        state: {
          ...state,
          identifierAttribute: nextAttribute,
          shouldAutofocus: true,
          hasSwitchedByAutofill: false,
        },
        effects: [],
      };
    }

    case 'AUTOFILL_PHONE_SWITCH': {
      if (
        state.config.identifierAttributes.includes('phone_number') &&
        state.identifierAttribute !== 'phone_number' &&
        !state.hasSwitchedByAutofill
      ) {
        return {
          state: {
            ...state,
            identifierAttribute: 'phone_number',
            identifierValue: event.value,
            shouldAutofocus: true,
            hasSwitchedByAutofill: true,
          },
          effects: [],
        };
      }
      return { state, effects: [] };
    }

    case 'SELECT_ALT_PHONE_PROVIDER':
      return {
        state: {
          ...state,
          screen: 'alternativePhoneCode',
          alternativePhoneCodeProvider: event.provider,
        },
        effects: [],
      };

    case 'CLEAR_ALT_PHONE_PROVIDER':
      return {
        state: {
          ...state,
          screen: 'form',
          alternativePhoneCodeProvider: null,
        },
        effects: [],
      };

    case 'SUBMIT': {
      return {
        state: { ...state, isSubmitting: true, cardError: undefined },
        effects: [
          {
            type: 'SIGN_IN_CREATE',
            identifier: state.identifierValue,
            password: state.passwordValue,
            alternativePhoneChannel: state.alternativePhoneCodeProvider?.channel || null,
          },
        ],
      };
    }

    case 'SUBMIT_SUCCESS':
      return handleSignInStatus(state, event.result);

    case 'SUBMIT_ERROR':
      return handleSubmitError(state, event.result);

    case 'TICKET_PROCESSING':
      return {
        state: { ...state, screen: 'loading', isSubmitting: true },
        effects: [{ type: 'SIGN_IN_CREATE_TICKET', ticket: state.config.organizationTicket }],
      };

    case 'TICKET_SUCCESS':
      return handleSignInStatus(state, event.result);

    case 'TICKET_ERROR':
      return handleSubmitError(state, event.result);

    case 'TICKET_DONE': {
      if (event.isRedirectingToSSO) {
        return { state, effects: [] };
      }
      return {
        state: { ...state, screen: 'form', isSubmitting: false },
        effects: [],
      };
    }

    case 'OAUTH_ERROR':
      if (KNOWN_OAUTH_ERROR_CODES.has(event.error.code)) {
        return {
          state: { ...state, cardError: event.error },
          effects: [{ type: 'RESET_SIGN_IN' }],
        };
      }
      return {
        state: {
          ...state,
          cardError: 'Unable to complete action at this time. If the problem persists please contact support.',
        },
        effects: [{ type: 'RESET_SIGN_IN' }],
      };

    case 'OAUTH_ERROR_GENERIC':
      return {
        state: {
          ...state,
          cardError: 'Unable to complete action at this time. If the problem persists please contact support.',
        },
        effects: [{ type: 'RESET_SIGN_IN' }],
      };

    case 'SET_CARD_ERROR':
      return {
        state: { ...state, cardError: event.error },
        effects: [],
      };

    default:
      return { state, effects: [] };
  }
}
