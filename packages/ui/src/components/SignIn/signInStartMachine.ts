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

// --- Status (discriminated union replacing screen + isSubmitting + alternativePhoneCodeProvider) ---

type IdleStatus = { tag: 'idle' };
type AltPhoneCodeStatus = { tag: 'altPhoneCode'; provider: PhoneCodeChannelData };
export type FormViewStatus = IdleStatus | AltPhoneCodeStatus;
type SubmittingStatus = { tag: 'submitting'; resumeTo: FormViewStatus };
type TicketProcessingStatus = { tag: 'ticketProcessing' };

export type SignInStartStatus = FormViewStatus | SubmittingStatus | TicketProcessingStatus;

// --- State ---

export type SignInStartState = {
  status: SignInStartStatus;
  identifierAttribute: SignInStartIdentifier;
  identifierValue: string;
  passwordValue: string;
  shouldAutofocus: boolean;
  hasSwitchedByAutofill: boolean;
  cardError: ClerkAPIError | string | undefined;
  config: SignInStartConfig;
};

// --- View model (pure projection of status for the view layer) ---

export type SignInStartViewModel =
  | { kind: 'loading' }
  | { kind: 'form' }
  | { kind: 'altPhoneCode'; provider: PhoneCodeChannelData };

export function getViewModel(state: SignInStartState): SignInStartViewModel {
  switch (state.status.tag) {
    case 'ticketProcessing':
      return { kind: 'loading' };
    case 'altPhoneCode':
      return { kind: 'altPhoneCode', provider: state.status.provider };
    case 'submitting': {
      const { resumeTo } = state.status;
      if (resumeTo.tag === 'altPhoneCode') {
        return { kind: 'altPhoneCode', provider: resumeTo.provider };
      }
      return { kind: 'form' };
    }
    case 'idle':
    default:
      return { kind: 'form' };
  }
}

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

// --- Helpers ---

export function getAltPhoneChannel(status: SignInStartStatus): PhoneCodeChannel | null {
  if (status.tag === 'altPhoneCode') return status.provider.channel;
  if (status.tag === 'submitting' && status.resumeTo.tag === 'altPhoneCode') {
    return status.resumeTo.provider.channel;
  }
  return null;
}

// --- Init ---

export function initSignInStartState(config: SignInStartConfig): SignInStartState {
  const isTicketFlow = !!config.organizationTicket;
  const isSignUpRedirect = config.clerkStatus === 'sign_up';

  return {
    status: isTicketFlow || isSignUpRedirect ? { tag: 'ticketProcessing' } : { tag: 'idle' },
    identifierAttribute: config.initialIdentifier,
    identifierValue: config.initialIdentifierValue,
    passwordValue: '',
    shouldAutofocus: !config.isMobile && !config.hasSocialOrWeb3Buttons,
    hasSwitchedByAutofill: false,
    cardError: undefined,
    config,
  };
}

// --- Shared handlers ---

function handleCommonEvent(state: SignInStartState, event: SignInStartEvent): ReducerResult | null {
  switch (event.type) {
    case 'SET_IDENTIFIER':
      return { state: { ...state, identifierValue: event.value }, effects: [] };
    case 'SET_PASSWORD':
      return { state: { ...state, passwordValue: event.value }, effects: [] };
    case 'SET_CARD_ERROR':
      return { state: { ...state, cardError: event.error }, effects: [] };
    default:
      return null;
  }
}

function handleSignInStatus(
  state: SignInStartState,
  result: SignInCreateResult,
  resumeTo: FormViewStatus,
): ReducerResult {
  const effects: SignInStartEffect[] = [];

  switch (result.status) {
    case 'needs_identifier':
      if (result.supportedFirstFactors?.some(ff => ff.strategy === 'enterprise_sso')) {
        effects.push({ type: 'ENTERPRISE_SSO_REDIRECT' });
      }
      return { state: { ...state, status: resumeTo }, effects };

    case 'needs_first_factor':
      if (!result.hasOnlyEnterpriseSSO || result.hasMultipleEnterpriseConnections) {
        effects.push({ type: 'NAVIGATE', to: 'factor-one' });
      } else {
        effects.push({ type: 'ENTERPRISE_SSO_REDIRECT' });
      }
      return { state: { ...state, status: resumeTo }, effects };

    case 'needs_second_factor':
      effects.push({ type: 'NAVIGATE', to: 'factor-two' });
      return { state: { ...state, status: resumeTo }, effects };

    case 'needs_client_trust':
      effects.push({ type: 'NAVIGATE', to: 'client-trust' });
      return { state: { ...state, status: resumeTo }, effects };

    case 'complete':
      effects.push({ type: 'SET_ACTIVE', sessionId: result.createdSessionId ?? '' });
      return { state: { ...state, status: resumeTo }, effects };

    default:
      return { state: { ...state, status: resumeTo }, effects };
  }
}

function handleSubmitError(
  state: SignInStartState,
  result: SubmitErrorResult,
  resumeTo: FormViewStatus,
): ReducerResult {
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
      alternativePhoneChannel: getAltPhoneChannel(state.status),
    });
    return { state, effects };
  }

  if (sessionAlreadyExistsError) {
    effects.push({ type: 'SET_ACTIVE_LAST_SESSION' });
    return { state: { ...state, status: resumeTo }, effects };
  }

  if (alreadySignedInError) {
    const sid = alreadySignedInError.meta?.sessionId;
    if (sid) {
      effects.push({ type: 'SET_ACTIVE_SESSION', sessionId: sid });
    }
    return { state: { ...state, status: resumeTo }, effects };
  }

  if (state.config.isCombinedFlow && accountDoesNotExistError) {
    effects.push({
      type: 'COMBINED_FLOW_TRANSFER',
      identifierType: result.identifierType,
      identifierValue: result.identifierValue,
    });
    return { state: { ...state, status: resumeTo }, effects };
  }

  effects.push({ type: 'HANDLE_FIELD_ERRORS', errors });
  return { state: { ...state, status: resumeTo }, effects };
}

function handleOAuthError(
  state: SignInStartState,
  event: { type: 'OAUTH_ERROR'; error: ClerkAPIError } | { type: 'OAUTH_ERROR_GENERIC' },
): ReducerResult {
  if (event.type === 'OAUTH_ERROR' && KNOWN_OAUTH_ERROR_CODES.has(event.error.code)) {
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
}

// --- Sub-reducers ---

function reduceIdle(state: SignInStartState, event: SignInStartEvent): ReducerResult {
  const common = handleCommonEvent(state, event);
  if (common) return common;

  switch (event.type) {
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
          status: { tag: 'altPhoneCode', provider: event.provider },
        },
        effects: [],
      };

    case 'SUBMIT':
      return {
        state: { ...state, status: { tag: 'submitting', resumeTo: { tag: 'idle' } }, cardError: undefined },
        effects: [
          {
            type: 'SIGN_IN_CREATE',
            identifier: state.identifierValue,
            password: state.passwordValue,
            alternativePhoneChannel: null,
          },
        ],
      };

    case 'TICKET_PROCESSING':
      return {
        state: { ...state, status: { tag: 'ticketProcessing' } },
        effects: [{ type: 'SIGN_IN_CREATE_TICKET', ticket: state.config.organizationTicket }],
      };

    case 'OAUTH_ERROR':
    case 'OAUTH_ERROR_GENERIC':
      return handleOAuthError(state, event);

    default:
      return { state, effects: [] };
  }
}

function reduceAltPhoneCode(
  state: SignInStartState,
  status: AltPhoneCodeStatus,
  event: SignInStartEvent,
): ReducerResult {
  const common = handleCommonEvent(state, event);
  if (common) return common;

  switch (event.type) {
    case 'CLEAR_ALT_PHONE_PROVIDER':
      return {
        state: { ...state, status: { tag: 'idle' } },
        effects: [],
      };

    case 'SUBMIT':
      return {
        state: { ...state, status: { tag: 'submitting', resumeTo: status }, cardError: undefined },
        effects: [
          {
            type: 'SIGN_IN_CREATE',
            identifier: state.identifierValue,
            password: state.passwordValue,
            alternativePhoneChannel: status.provider.channel,
          },
        ],
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

    case 'OAUTH_ERROR':
    case 'OAUTH_ERROR_GENERIC':
      return handleOAuthError(state, event);

    default:
      return { state, effects: [] };
  }
}

function reduceSubmitting(state: SignInStartState, status: SubmittingStatus, event: SignInStartEvent): ReducerResult {
  const common = handleCommonEvent(state, event);
  if (common) return common;

  switch (event.type) {
    case 'SUBMIT':
      return {
        state: { ...state, cardError: undefined },
        effects: [
          {
            type: 'SIGN_IN_CREATE',
            identifier: state.identifierValue,
            password: state.passwordValue,
            alternativePhoneChannel: getAltPhoneChannel(state.status),
          },
        ],
      };

    case 'SUBMIT_SUCCESS':
      return handleSignInStatus(state, event.result, status.resumeTo);

    case 'SUBMIT_ERROR':
      return handleSubmitError(state, event.result, status.resumeTo);

    default:
      return { state, effects: [] };
  }
}

function reduceTicketProcessing(state: SignInStartState, event: SignInStartEvent): ReducerResult {
  const common = handleCommonEvent(state, event);
  if (common) return common;

  switch (event.type) {
    case 'TICKET_PROCESSING':
      return {
        state,
        effects: [{ type: 'SIGN_IN_CREATE_TICKET', ticket: state.config.organizationTicket }],
      };

    case 'TICKET_SUCCESS':
      return handleSignInStatus(state, event.result, { tag: 'idle' });

    case 'TICKET_ERROR':
      return handleSubmitError(state, event.result, { tag: 'idle' });

    case 'TICKET_DONE':
      if (event.isRedirectingToSSO) {
        return { state, effects: [] };
      }
      return {
        state: { ...state, status: { tag: 'idle' } },
        effects: [],
      };

    default:
      return { state, effects: [] };
  }
}

// --- Main reducer ---

export function signInStartReducer(state: SignInStartState, event: SignInStartEvent): ReducerResult {
  switch (state.status.tag) {
    case 'idle':
      return reduceIdle(state, event);
    case 'altPhoneCode':
      return reduceAltPhoneCode(state, state.status, event);
    case 'submitting':
      return reduceSubmitting(state, state.status, event);
    case 'ticketProcessing':
      return reduceTicketProcessing(state, event);
  }
}
