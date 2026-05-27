import { describe, expect, it } from 'vitest';

import type { SignInStartConfig, SignInStartState, SubmitErrorResult } from '../signInStartMachine';
import {
  classifySubmitError,
  initSignInStartState,
  routeSignInStatus,
  signInStartReducer,
} from '../signInStartMachine';

const baseConfig: SignInStartConfig = {
  identifierAttributes: ['email_address'],
  initialIdentifier: 'email_address',
  initialIdentifierValue: '',
  isCombinedFlow: false,
  organizationTicket: '',
  clerkStatus: '',
  hasSocialOrWeb3Buttons: false,
  isMobile: false,
  enterpriseSSOEnabled: false,
};

function createState(overrides?: Partial<SignInStartState>): SignInStartState {
  return {
    ...initSignInStartState(baseConfig),
    ...overrides,
  };
}

describe('signInStartMachine', () => {
  describe('initSignInStartState', () => {
    it('initializes with form screen by default', () => {
      const state = initSignInStartState(baseConfig);
      expect(state.screen).toBe('form');
      expect(state.isSubmitting).toBe(false);
      expect(state.cardError).toBeUndefined();
    });

    it('initializes with loading screen when organization ticket is present', () => {
      const state = initSignInStartState({
        ...baseConfig,
        organizationTicket: 'test_ticket',
      });
      expect(state.screen).toBe('loading');
    });

    it('initializes with loading screen when clerk status is sign_up', () => {
      const state = initSignInStartState({
        ...baseConfig,
        clerkStatus: 'sign_up',
      });
      expect(state.screen).toBe('loading');
    });

    it('sets shouldAutofocus to false on mobile', () => {
      const state = initSignInStartState({ ...baseConfig, isMobile: true });
      expect(state.shouldAutofocus).toBe(false);
    });

    it('sets shouldAutofocus to false when social buttons exist', () => {
      const state = initSignInStartState({ ...baseConfig, hasSocialOrWeb3Buttons: true });
      expect(state.shouldAutofocus).toBe(false);
    });

    it('sets shouldAutofocus to true on desktop without social buttons', () => {
      const state = initSignInStartState(baseConfig);
      expect(state.shouldAutofocus).toBe(true);
    });
  });

  describe('SWITCH_IDENTIFIER', () => {
    it('cycles to next identifier attribute', () => {
      const state = createState({
        config: {
          ...baseConfig,
          identifierAttributes: ['email_address', 'phone_number'],
        },
        identifierAttribute: 'email_address',
      });
      const next = signInStartReducer(state, { type: 'SWITCH_IDENTIFIER' });
      expect(next.identifierAttribute).toBe('phone_number');
      expect(next.shouldAutofocus).toBe(true);
      expect(next.hasSwitchedByAutofill).toBe(false);
    });

    it('wraps around to first identifier', () => {
      const state = createState({
        config: {
          ...baseConfig,
          identifierAttributes: ['email_address', 'phone_number'],
        },
        identifierAttribute: 'phone_number',
      });
      const next = signInStartReducer(state, { type: 'SWITCH_IDENTIFIER' });
      expect(next.identifierAttribute).toBe('email_address');
    });
  });

  describe('AUTOFILL_PHONE_SWITCH', () => {
    it('switches to phone_number when phone is available and not already active', () => {
      const state = createState({
        config: {
          ...baseConfig,
          identifierAttributes: ['email_address', 'phone_number'],
        },
        identifierAttribute: 'email_address',
      });
      const next = signInStartReducer(state, {
        type: 'AUTOFILL_PHONE_SWITCH',
        identifierAttribute: 'phone_number',
      });
      expect(next.identifierAttribute).toBe('phone_number');
      expect(next.hasSwitchedByAutofill).toBe(true);
    });

    it('does not switch if phone_number is not in identifier attributes', () => {
      const state = createState({ identifierAttribute: 'email_address' });
      const next = signInStartReducer(state, {
        type: 'AUTOFILL_PHONE_SWITCH',
        identifierAttribute: 'phone_number',
      });
      expect(next.identifierAttribute).toBe('email_address');
    });

    it('does not switch if already switched by autofill', () => {
      const state = createState({
        config: {
          ...baseConfig,
          identifierAttributes: ['email_address', 'phone_number'],
        },
        identifierAttribute: 'email_address',
        hasSwitchedByAutofill: true,
      });
      const next = signInStartReducer(state, {
        type: 'AUTOFILL_PHONE_SWITCH',
        identifierAttribute: 'phone_number',
      });
      expect(next.identifierAttribute).toBe('email_address');
    });
  });

  describe('SELECT_ALT_PHONE_PROVIDER / CLEAR_ALT_PHONE_PROVIDER', () => {
    it('switches to alternative phone code screen', () => {
      const state = createState();
      const provider = { channel: 'whatsapp' as const, name: 'WhatsApp', iconUrl: '' };
      const next = signInStartReducer(state, {
        type: 'SELECT_ALT_PHONE_PROVIDER',
        provider: provider as any,
      });
      expect(next.screen).toBe('alternativePhoneCode');
      expect(next.alternativePhoneCodeProvider).toBe(provider);
    });

    it('clears alternative phone code provider', () => {
      const state = createState({
        screen: 'alternativePhoneCode',
        alternativePhoneCodeProvider: { channel: 'whatsapp' } as any,
      });
      const next = signInStartReducer(state, { type: 'CLEAR_ALT_PHONE_PROVIDER' });
      expect(next.screen).toBe('form');
      expect(next.alternativePhoneCodeProvider).toBeNull();
    });
  });

  describe('SUBMIT', () => {
    it('sets isSubmitting and clears error', () => {
      const state = createState({ cardError: 'previous error' });
      const next = signInStartReducer(state, { type: 'SUBMIT' });
      expect(next.isSubmitting).toBe(true);
      expect(next.cardError).toBeUndefined();
    });
  });

  describe('SUBMIT_SUCCESS', () => {
    it('clears isSubmitting', () => {
      const state = createState({ isSubmitting: true });
      const next = signInStartReducer(state, {
        type: 'SUBMIT_SUCCESS',
        result: {
          status: 'needs_first_factor',
          createdSessionId: null,
          supportedFirstFactors: [],
          hasOnlyEnterpriseSSO: false,
          hasMultipleEnterpriseConnections: false,
        },
      });
      expect(next.isSubmitting).toBe(false);
    });
  });

  describe('TICKET_PROCESSING', () => {
    it('sets loading state', () => {
      const state = createState();
      const next = signInStartReducer(state, { type: 'TICKET_PROCESSING' });
      expect(next.screen).toBe('loading');
      expect(next.isSubmitting).toBe(true);
    });
  });

  describe('TICKET_DONE', () => {
    it('stays in current state when redirecting to SSO', () => {
      const state = createState({ screen: 'loading', isSubmitting: true });
      const next = signInStartReducer(state, {
        type: 'TICKET_DONE',
        isRedirectingToSSO: true,
      });
      expect(next.screen).toBe('loading');
      expect(next.isSubmitting).toBe(true);
    });

    it('returns to form state when not redirecting', () => {
      const state = createState({ screen: 'loading', isSubmitting: true });
      const next = signInStartReducer(state, {
        type: 'TICKET_DONE',
        isRedirectingToSSO: false,
      });
      expect(next.screen).toBe('form');
      expect(next.isSubmitting).toBe(false);
    });
  });

  describe('OAUTH_ERROR', () => {
    it('sets known error on card', () => {
      const error = { code: 'oauth_access_denied', message: 'Denied', longMessage: '' };
      const state = createState();
      const next = signInStartReducer(state, {
        type: 'OAUTH_ERROR',
        error: error as any,
      });
      expect(next.cardError).toBe(error);
    });

    it('sets generic error for unknown error codes', () => {
      const error = { code: 'some_weird_error', message: 'Details', longMessage: '' };
      const state = createState();
      const next = signInStartReducer(state, {
        type: 'OAUTH_ERROR',
        error: error as any,
      });
      expect(next.cardError).toBe(
        'Unable to complete action at this time. If the problem persists please contact support.',
      );
    });
  });
});

describe('routeSignInStatus', () => {
  it('navigates to factor-one when status is needs_first_factor', () => {
    const decision = routeSignInStatus({
      status: 'needs_first_factor',
      createdSessionId: null,
      supportedFirstFactors: [],
      hasOnlyEnterpriseSSO: false,
      hasMultipleEnterpriseConnections: false,
    });
    expect(decision).toEqual({ action: 'navigate', to: 'factor-one' });
  });

  it('navigates to factor-two when status is needs_second_factor', () => {
    const decision = routeSignInStatus({
      status: 'needs_second_factor',
      createdSessionId: null,
      supportedFirstFactors: [],
      hasOnlyEnterpriseSSO: false,
      hasMultipleEnterpriseConnections: false,
    });
    expect(decision).toEqual({ action: 'navigate', to: 'factor-two' });
  });

  it('navigates to client-trust when status is needs_client_trust', () => {
    const decision = routeSignInStatus({
      status: 'needs_client_trust',
      createdSessionId: null,
      supportedFirstFactors: [],
      hasOnlyEnterpriseSSO: false,
      hasMultipleEnterpriseConnections: false,
    });
    expect(decision).toEqual({ action: 'navigate', to: 'client-trust' });
  });

  it('returns set_active when status is complete', () => {
    const decision = routeSignInStatus({
      status: 'complete',
      createdSessionId: 'sess_123',
      supportedFirstFactors: [],
      hasOnlyEnterpriseSSO: false,
      hasMultipleEnterpriseConnections: false,
    });
    expect(decision).toEqual({ action: 'set_active', sessionId: 'sess_123' });
  });

  it('redirects to enterprise SSO when only enterprise SSO factors and single connection', () => {
    const decision = routeSignInStatus({
      status: 'needs_first_factor',
      createdSessionId: null,
      supportedFirstFactors: [],
      hasOnlyEnterpriseSSO: true,
      hasMultipleEnterpriseConnections: false,
    });
    expect(decision).toEqual({ action: 'enterprise_sso_redirect' });
  });

  it('navigates to factor-one when multiple enterprise connections', () => {
    const decision = routeSignInStatus({
      status: 'needs_first_factor',
      createdSessionId: null,
      supportedFirstFactors: [],
      hasOnlyEnterpriseSSO: true,
      hasMultipleEnterpriseConnections: true,
    });
    expect(decision).toEqual({ action: 'navigate', to: 'factor-one' });
  });

  it('returns enterprise_sso_redirect when status is needs_identifier with enterprise SSO factors', () => {
    const decision = routeSignInStatus({
      status: 'needs_identifier',
      createdSessionId: null,
      supportedFirstFactors: [{ strategy: 'enterprise_sso' }] as any,
      hasOnlyEnterpriseSSO: false,
      hasMultipleEnterpriseConnections: false,
    });
    expect(decision).toEqual({ action: 'enterprise_sso_redirect' });
  });

  it('returns none for unknown status', () => {
    const decision = routeSignInStatus({
      status: 'unknown',
      createdSessionId: null,
      supportedFirstFactors: [],
      hasOnlyEnterpriseSSO: false,
      hasMultipleEnterpriseConnections: false,
    });
    expect(decision).toEqual({ action: 'none' });
  });
});

describe('classifySubmitError', () => {
  it('retries without password on invalid strategy error', () => {
    const decision = classifySubmitError(
      [{ code: 'strategy_for_user_invalid', message: '', longMessage: '' }],
      false,
      'email',
      'user@example.com',
    );
    expect(decision).toEqual({ action: 'retry_without_password' });
  });

  it('sets active last session on session_exists error', () => {
    const decision = classifySubmitError(
      [{ code: 'session_exists', message: '', longMessage: '' }],
      false,
      'email',
      'user@example.com',
    );
    expect(decision).toEqual({ action: 'set_active_last_session' });
  });

  it('sets active specific session on already_signed_in error', () => {
    const decision = classifySubmitError(
      [{ code: 'identifier_already_signed_in', message: '', longMessage: '', meta: { sessionId: 'sess_456' } }],
      false,
      'email',
      'user@example.com',
    );
    expect(decision).toEqual({ action: 'set_active_session', sessionId: 'sess_456' });
  });

  it('emits combined flow transfer when account does not exist in combined flow', () => {
    const decision = classifySubmitError(
      [{ code: 'form_identifier_not_found', message: '', longMessage: '' }],
      true,
      'email',
      'user@example.com',
    );
    expect(decision).toEqual({
      action: 'combined_flow_transfer',
      identifierType: 'email',
      identifierValue: 'user@example.com',
    });
  });

  it('does not emit combined flow transfer when not in combined flow', () => {
    const decision = classifySubmitError(
      [{ code: 'form_identifier_not_found', message: '', longMessage: '' }],
      false,
      'email',
      'user@example.com',
    );
    expect(decision.action).toBe('handle_field_errors');
  });

  it('falls through to handle_field_errors for unknown errors', () => {
    const errors = [{ code: 'some_unknown_error', message: 'Oops', longMessage: '' }];
    const decision = classifySubmitError(errors as any, false, 'email', 'user@example.com');
    expect(decision).toEqual({ action: 'handle_field_errors', errors });
  });
});
