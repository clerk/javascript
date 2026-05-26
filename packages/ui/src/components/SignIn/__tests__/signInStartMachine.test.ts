import { describe, expect, it } from 'vitest';

import type { SignInStartConfig, SignInStartState, SubmitErrorResult } from '../signInStartMachine';
import { initSignInStartState, signInStartReducer } from '../signInStartMachine';

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

  describe('SET_IDENTIFIER', () => {
    it('updates identifier value', () => {
      const state = createState();
      const { state: next, effects } = signInStartReducer(state, {
        type: 'SET_IDENTIFIER',
        value: 'user@example.com',
      });
      expect(next.identifierValue).toBe('user@example.com');
      expect(effects).toEqual([]);
    });
  });

  describe('SET_PASSWORD', () => {
    it('updates password value', () => {
      const state = createState();
      const { state: next, effects } = signInStartReducer(state, {
        type: 'SET_PASSWORD',
        value: 'secret123',
      });
      expect(next.passwordValue).toBe('secret123');
      expect(effects).toEqual([]);
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
      const { state: next } = signInStartReducer(state, { type: 'SWITCH_IDENTIFIER' });
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
      const { state: next } = signInStartReducer(state, { type: 'SWITCH_IDENTIFIER' });
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
      const { state: next } = signInStartReducer(state, {
        type: 'AUTOFILL_PHONE_SWITCH',
        value: '+1234567890',
      });
      expect(next.identifierAttribute).toBe('phone_number');
      expect(next.identifierValue).toBe('+1234567890');
      expect(next.hasSwitchedByAutofill).toBe(true);
    });

    it('does not switch if phone_number is not in identifier attributes', () => {
      const state = createState({ identifierAttribute: 'email_address' });
      const { state: next } = signInStartReducer(state, {
        type: 'AUTOFILL_PHONE_SWITCH',
        value: '+1234567890',
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
      const { state: next } = signInStartReducer(state, {
        type: 'AUTOFILL_PHONE_SWITCH',
        value: '+1234567890',
      });
      expect(next.identifierAttribute).toBe('email_address');
    });
  });

  describe('SELECT_ALT_PHONE_PROVIDER / CLEAR_ALT_PHONE_PROVIDER', () => {
    it('switches to alternative phone code screen', () => {
      const state = createState();
      const provider = { channel: 'whatsapp' as const, name: 'WhatsApp', iconUrl: '' };
      const { state: next } = signInStartReducer(state, {
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
      const { state: next } = signInStartReducer(state, { type: 'CLEAR_ALT_PHONE_PROVIDER' });
      expect(next.screen).toBe('form');
      expect(next.alternativePhoneCodeProvider).toBeNull();
    });
  });

  describe('SUBMIT', () => {
    it('sets isSubmitting and clears error', () => {
      const state = createState({
        identifierValue: 'user@example.com',
        cardError: 'previous error',
      });
      const { state: next, effects } = signInStartReducer(state, { type: 'SUBMIT' });
      expect(next.isSubmitting).toBe(true);
      expect(next.cardError).toBeUndefined();
      expect(effects).toHaveLength(1);
      expect(effects[0].type).toBe('SIGN_IN_CREATE');
    });

    it('emits SIGN_IN_CREATE effect with identifier and password', () => {
      const state = createState({
        identifierValue: 'user@example.com',
        passwordValue: 'secret123',
      });
      const { effects } = signInStartReducer(state, { type: 'SUBMIT' });
      expect(effects[0]).toEqual({
        type: 'SIGN_IN_CREATE',
        identifier: 'user@example.com',
        password: 'secret123',
        alternativePhoneChannel: null,
      });
    });
  });

  describe('SUBMIT_SUCCESS', () => {
    it('navigates to factor-one when status is needs_first_factor', () => {
      const state = createState({ isSubmitting: true });
      const { state: next, effects } = signInStartReducer(state, {
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
      expect(effects).toEqual([{ type: 'NAVIGATE', to: 'factor-one' }]);
    });

    it('navigates to factor-two when status is needs_second_factor', () => {
      const state = createState({ isSubmitting: true });
      const { effects } = signInStartReducer(state, {
        type: 'SUBMIT_SUCCESS',
        result: {
          status: 'needs_second_factor',
          createdSessionId: null,
          supportedFirstFactors: [],
          hasOnlyEnterpriseSSO: false,
          hasMultipleEnterpriseConnections: false,
        },
      });
      expect(effects).toEqual([{ type: 'NAVIGATE', to: 'factor-two' }]);
    });

    it('navigates to client-trust when status is needs_client_trust', () => {
      const state = createState({ isSubmitting: true });
      const { effects } = signInStartReducer(state, {
        type: 'SUBMIT_SUCCESS',
        result: {
          status: 'needs_client_trust',
          createdSessionId: null,
          supportedFirstFactors: [],
          hasOnlyEnterpriseSSO: false,
          hasMultipleEnterpriseConnections: false,
        },
      });
      expect(effects).toEqual([{ type: 'NAVIGATE', to: 'client-trust' }]);
    });

    it('emits SET_ACTIVE when status is complete', () => {
      const state = createState({ isSubmitting: true });
      const { effects } = signInStartReducer(state, {
        type: 'SUBMIT_SUCCESS',
        result: {
          status: 'complete',
          createdSessionId: 'sess_123',
          supportedFirstFactors: [],
          hasOnlyEnterpriseSSO: false,
          hasMultipleEnterpriseConnections: false,
        },
      });
      expect(effects).toEqual([{ type: 'SET_ACTIVE', sessionId: 'sess_123' }]);
    });

    it('redirects to enterprise SSO when only enterprise SSO factors and single connection', () => {
      const state = createState({ isSubmitting: true });
      const { effects } = signInStartReducer(state, {
        type: 'SUBMIT_SUCCESS',
        result: {
          status: 'needs_first_factor',
          createdSessionId: null,
          supportedFirstFactors: [],
          hasOnlyEnterpriseSSO: true,
          hasMultipleEnterpriseConnections: false,
        },
      });
      expect(effects).toEqual([{ type: 'ENTERPRISE_SSO_REDIRECT' }]);
    });

    it('navigates to factor-one when multiple enterprise connections', () => {
      const state = createState({ isSubmitting: true });
      const { effects } = signInStartReducer(state, {
        type: 'SUBMIT_SUCCESS',
        result: {
          status: 'needs_first_factor',
          createdSessionId: null,
          supportedFirstFactors: [],
          hasOnlyEnterpriseSSO: true,
          hasMultipleEnterpriseConnections: true,
        },
      });
      expect(effects).toEqual([{ type: 'NAVIGATE', to: 'factor-one' }]);
    });

    it('emits ENTERPRISE_SSO_REDIRECT when status is needs_identifier with enterprise SSO factors', () => {
      const state = createState({ isSubmitting: true });
      const { effects } = signInStartReducer(state, {
        type: 'SUBMIT_SUCCESS',
        result: {
          status: 'needs_identifier',
          createdSessionId: null,
          supportedFirstFactors: [{ strategy: 'enterprise_sso' }] as any,
          hasOnlyEnterpriseSSO: false,
          hasMultipleEnterpriseConnections: false,
        },
      });
      expect(effects).toEqual([{ type: 'ENTERPRISE_SSO_REDIRECT' }]);
    });
  });

  describe('SUBMIT_ERROR', () => {
    it('retries without password on invalid strategy error', () => {
      const state = createState({ identifierValue: 'user@example.com' });
      const result: SubmitErrorResult = {
        errors: [{ code: 'strategy_for_user_invalid', message: '', longMessage: '' }],
        identifierType: 'email',
        identifierValue: 'user@example.com',
      };
      const { effects } = signInStartReducer(state, { type: 'SUBMIT_ERROR', result });
      expect(effects).toHaveLength(1);
      expect(effects[0].type).toBe('SIGN_IN_CREATE_WITHOUT_PASSWORD');
    });

    it('sets active last session on session_exists error', () => {
      const state = createState();
      const result: SubmitErrorResult = {
        errors: [{ code: 'session_exists', message: '', longMessage: '' }],
        identifierType: 'email',
        identifierValue: 'user@example.com',
      };
      const { effects } = signInStartReducer(state, { type: 'SUBMIT_ERROR', result });
      expect(effects).toEqual([{ type: 'SET_ACTIVE_LAST_SESSION' }]);
    });

    it('sets active specific session on already_signed_in error', () => {
      const state = createState();
      const result: SubmitErrorResult = {
        errors: [
          {
            code: 'identifier_already_signed_in',
            message: '',
            longMessage: '',
            meta: { sessionId: 'sess_456' },
          },
        ],
        identifierType: 'email',
        identifierValue: 'user@example.com',
      };
      const { effects } = signInStartReducer(state, { type: 'SUBMIT_ERROR', result });
      expect(effects).toEqual([{ type: 'SET_ACTIVE_SESSION', sessionId: 'sess_456' }]);
    });

    it('emits combined flow transfer when account does not exist in combined flow', () => {
      const state = createState({
        config: { ...baseConfig, isCombinedFlow: true },
      });
      const result: SubmitErrorResult = {
        errors: [{ code: 'form_identifier_not_found', message: '', longMessage: '' }],
        identifierType: 'email',
        identifierValue: 'user@example.com',
      };
      const { effects } = signInStartReducer(state, { type: 'SUBMIT_ERROR', result });
      expect(effects).toEqual([
        { type: 'COMBINED_FLOW_TRANSFER', identifierType: 'email', identifierValue: 'user@example.com' },
      ]);
    });

    it('does not emit combined flow transfer when not in combined flow', () => {
      const state = createState();
      const result: SubmitErrorResult = {
        errors: [{ code: 'form_identifier_not_found', message: '', longMessage: '' }],
        identifierType: 'email',
        identifierValue: 'user@example.com',
      };
      const { effects } = signInStartReducer(state, { type: 'SUBMIT_ERROR', result });
      expect(effects[0].type).toBe('HANDLE_FIELD_ERRORS');
    });

    it('falls through to HANDLE_FIELD_ERRORS for unknown errors', () => {
      const state = createState();
      const errors = [{ code: 'some_unknown_error', message: 'Oops', longMessage: '' }];
      const result: SubmitErrorResult = {
        errors: errors as any,
        identifierType: 'email',
        identifierValue: 'user@example.com',
      };
      const { effects } = signInStartReducer(state, { type: 'SUBMIT_ERROR', result });
      expect(effects).toEqual([{ type: 'HANDLE_FIELD_ERRORS', errors }]);
    });
  });

  describe('OAUTH_ERROR', () => {
    it('sets known error on card', () => {
      const error = { code: 'oauth_access_denied', message: 'Denied', longMessage: '' };
      const state = createState();
      const { state: next, effects } = signInStartReducer(state, {
        type: 'OAUTH_ERROR',
        error: error as any,
      });
      expect(next.cardError).toBe(error);
      expect(effects).toEqual([{ type: 'RESET_SIGN_IN' }]);
    });

    it('sets generic error for unknown error codes', () => {
      const error = { code: 'some_weird_error', message: 'Details', longMessage: '' };
      const state = createState();
      const { state: next, effects } = signInStartReducer(state, {
        type: 'OAUTH_ERROR',
        error: error as any,
      });
      expect(next.cardError).toBe(
        'Unable to complete action at this time. If the problem persists please contact support.',
      );
      expect(effects).toEqual([{ type: 'RESET_SIGN_IN' }]);
    });
  });

  describe('TICKET_PROCESSING', () => {
    it('sets loading state and emits ticket create effect', () => {
      const state = createState({
        config: { ...baseConfig, organizationTicket: 'test_ticket' },
      });
      const { state: next, effects } = signInStartReducer(state, { type: 'TICKET_PROCESSING' });
      expect(next.screen).toBe('loading');
      expect(next.isSubmitting).toBe(true);
      expect(effects).toEqual([{ type: 'SIGN_IN_CREATE_TICKET', ticket: 'test_ticket' }]);
    });
  });

  describe('TICKET_DONE', () => {
    it('stays in loading state when redirecting to SSO', () => {
      const state = createState({ screen: 'loading', isSubmitting: true });
      const { state: next } = signInStartReducer(state, {
        type: 'TICKET_DONE',
        isRedirectingToSSO: true,
      });
      expect(next.screen).toBe('loading');
      expect(next.isSubmitting).toBe(true);
    });

    it('returns to form state when not redirecting', () => {
      const state = createState({ screen: 'loading', isSubmitting: true });
      const { state: next } = signInStartReducer(state, {
        type: 'TICKET_DONE',
        isRedirectingToSSO: false,
      });
      expect(next.screen).toBe('form');
      expect(next.isSubmitting).toBe(false);
    });
  });
});
