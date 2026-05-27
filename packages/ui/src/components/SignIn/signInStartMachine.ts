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
  | { type: 'SWITCH_IDENTIFIER' }
  | { type: 'AUTOFILL_PHONE_SWITCH'; identifierAttribute: 'phone_number' }
  | { type: 'SELECT_ALT_PHONE_PROVIDER'; provider: PhoneCodeChannelData }
  | { type: 'CLEAR_ALT_PHONE_PROVIDER' }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_SUCCESS'; result: SignInCreateResult }
  | { type: 'SUBMIT_ERROR' }
  | { type: 'TICKET_PROCESSING' }
  | { type: 'TICKET_SUCCESS'; result: SignInCreateResult }
  | { type: 'TICKET_ERROR' }
  | { type: 'TICKET_DONE'; isRedirectingToSSO: boolean }
  | { type: 'OAUTH_ERROR'; error: ClerkAPIError }
  | { type: 'OAUTH_ERROR_GENERIC' }
  | { type: 'SET_CARD_ERROR'; error: ClerkAPIError | string | undefined };

// --- Side-effect decision types (pure functions, testable) ---

export type StatusRouteDecision =
  | { action: 'navigate'; to: string }
  | { action: 'set_active'; sessionId: string }
  | { action: 'enterprise_sso_redirect' }
  | { action: 'none' };

export type SubmitErrorDecision =
  | { action: 'retry_without_password' }
  | { action: 'set_active_last_session' }
  | { action: 'set_active_session'; sessionId: string }
  | { action: 'combined_flow_transfer'; identifierType: 'tel' | 'text' | 'email'; identifierValue: string }
  | { action: 'handle_field_errors'; errors: ClerkAPIError[] };

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

export function isKnownOAuthErrorCode(code: string): boolean {
  return KNOWN_OAUTH_ERROR_CODES.has(code as any);
}

// --- Pure decision functions (testable without reducer) ---

export function routeSignInStatus(result: SignInCreateResult): StatusRouteDecision {
  switch (result.status) {
    case 'needs_identifier':
      if (result.supportedFirstFactors?.some(ff => ff.strategy === 'enterprise_sso')) {
        return { action: 'enterprise_sso_redirect' };
      }
      return { action: 'none' };

    case 'needs_first_factor':
      if (!result.hasOnlyEnterpriseSSO || result.hasMultipleEnterpriseConnections) {
        return { action: 'navigate', to: 'factor-one' };
      }
      return { action: 'enterprise_sso_redirect' };

    case 'needs_second_factor':
      return { action: 'navigate', to: 'factor-two' };

    case 'needs_client_trust':
      return { action: 'navigate', to: 'client-trust' };

    case 'complete':
      return { action: 'set_active', sessionId: result.createdSessionId ?? '' };

    default:
      return { action: 'none' };
  }
}

export function classifySubmitError(
  errors: ClerkAPIError[],
  isCombinedFlow: boolean,
  identifierType: 'tel' | 'text' | 'email',
  identifierValue: string,
): SubmitErrorDecision {
  const instantPasswordError = errors.find(e => PASSWORD_RECOVERY_CODES.has(e.code as any));
  const sessionAlreadyExistsError = errors.find(e => e.code === (ERROR_CODES.SESSION_EXISTS as string));
  const alreadySignedInError = errors.find(e => e.code === 'identifier_already_signed_in');
  const accountDoesNotExistError = errors.find(e => ACCOUNT_NOT_EXIST_CODES.has(e.code as any));

  if (instantPasswordError) {
    return { action: 'retry_without_password' };
  }

  if (sessionAlreadyExistsError) {
    return { action: 'set_active_last_session' };
  }

  if (alreadySignedInError) {
    const sid = alreadySignedInError.meta?.sessionId;
    if (sid) {
      return { action: 'set_active_session', sessionId: sid };
    }
  }

  if (isCombinedFlow && accountDoesNotExistError) {
    return { action: 'combined_flow_transfer', identifierType, identifierValue };
  }

  return { action: 'handle_field_errors', errors };
}

// --- Reducer (pure state transitions, no effects) ---

export function initSignInStartState(config: SignInStartConfig): SignInStartState {
  const isTicketFlow = !!config.organizationTicket;
  const isSignUpRedirect = config.clerkStatus === 'sign_up';

  return {
    screen: isTicketFlow || isSignUpRedirect ? 'loading' : 'form',
    identifierAttribute: config.initialIdentifier,
    shouldAutofocus: !config.isMobile && !config.hasSocialOrWeb3Buttons,
    hasSwitchedByAutofill: false,
    alternativePhoneCodeProvider: null,
    cardError: undefined,
    isSubmitting: false,
    config,
  };
}

export function signInStartReducer(state: SignInStartState, event: SignInStartEvent): SignInStartState {
  switch (event.type) {
    case 'SWITCH_IDENTIFIER': {
      const attrs = state.config.identifierAttributes;
      const currentIndex = attrs.indexOf(state.identifierAttribute);
      const nextAttribute = attrs[(currentIndex + 1) % attrs.length];
      return {
        ...state,
        identifierAttribute: nextAttribute,
        shouldAutofocus: true,
        hasSwitchedByAutofill: false,
      };
    }

    case 'AUTOFILL_PHONE_SWITCH': {
      if (
        state.config.identifierAttributes.includes('phone_number') &&
        state.identifierAttribute !== 'phone_number' &&
        !state.hasSwitchedByAutofill
      ) {
        return {
          ...state,
          identifierAttribute: 'phone_number',
          shouldAutofocus: true,
          hasSwitchedByAutofill: true,
        };
      }
      return state;
    }

    case 'SELECT_ALT_PHONE_PROVIDER':
      return {
        ...state,
        screen: 'alternativePhoneCode',
        alternativePhoneCodeProvider: event.provider,
      };

    case 'CLEAR_ALT_PHONE_PROVIDER':
      return {
        ...state,
        screen: 'form',
        alternativePhoneCodeProvider: null,
      };

    case 'SUBMIT':
      return { ...state, isSubmitting: true, cardError: undefined };

    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false };

    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false };

    case 'TICKET_PROCESSING':
      return { ...state, screen: 'loading', isSubmitting: true };

    case 'TICKET_SUCCESS':
      return { ...state, isSubmitting: false };

    case 'TICKET_ERROR':
      return { ...state, isSubmitting: false };

    case 'TICKET_DONE':
      if (event.isRedirectingToSSO) {
        return state;
      }
      return { ...state, screen: 'form', isSubmitting: false };

    case 'OAUTH_ERROR':
      if (isKnownOAuthErrorCode(event.error.code)) {
        return { ...state, cardError: event.error };
      }
      return {
        ...state,
        cardError: 'Unable to complete action at this time. If the problem persists please contact support.',
      };

    case 'OAUTH_ERROR_GENERIC':
      return {
        ...state,
        cardError: 'Unable to complete action at this time. If the problem persists please contact support.',
      };

    case 'SET_CARD_ERROR':
      return { ...state, cardError: event.error };

    default:
      return state;
  }
}
