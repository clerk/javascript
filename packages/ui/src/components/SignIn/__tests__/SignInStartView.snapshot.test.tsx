import { SIGN_UP_MODES } from '@clerk/shared/internal/clerk-js/constants';
import { describe, expect, it, vi } from 'vitest';

import { renderForSnapshot } from '@/test/render-for-snapshot';
import type { FormControlState } from '@/ui/utils/useFormControl';

import { initSignInStartState } from '../signInStartMachine';
import type { SignInStartViewProps } from '../SignInStartView';
import { SignInStartView } from '../SignInStartView';
import type { SignInStartViewConfig } from '../useSignInStartFlow';

const noop = () => {};
const noopAsync = () => Promise.resolve();

function stubFormControl<Id extends string>(id: Id, value = ''): FormControlState<Id> {
  const base = {
    id,
    name: id,
    value,
    onChange: noop as any,
    onBlur: noop as any,
    onFocus: noop as any,
    feedback: '',
    feedbackType: 'info' as const,
    setError: noop as any,
    setWarning: noop as any,
    setSuccess: noop as any,
    setInfo: noop as any,
    setHasPassedComplexity: noop as any,
    clearFeedback: noop,
    hasPassedComplexity: false,
    isFocused: false,
    setValue: noop as any,
    setChecked: noop as any,
    checked: false,
    type: 'text' as const,
    label: { key: `formFieldLabel__${id}` } as any,
    placeholder: { key: `formFieldInputPlaceholder__${id}` } as any,
    isRequired: true,
    props: {} as any,
  };
  base.props = { ...base };
  return base as any;
}

const baseConfig: SignInStartViewConfig = {
  identifierAttributes: ['email_address'],
  currentIdentifier: {
    label: { key: 'formFieldLabel__emailAddress' } as any,
    placeholder: { key: 'formFieldInputPlaceholder__emailAddress' } as any,
    type: 'email',
  } as any,
  nextIdentifier: undefined as any,
  standardFormAttributes: ['email_address'],
  passwordBasedInstance: false,
  hasSocialOrWeb3Buttons: false,
  showAlternativePhoneCodeProviders: false,
  showPasskeyButton: false,
  isWebSupported: false,
  isCombinedFlow: false,
  signUpMode: SIGN_UP_MODES.PUBLIC,
  signUpUrl: '/sign-up',
  waitlistUrl: '/waitlist',
  isWebAuthnAutofillSupported: false,
  isIdentifierLastAuthenticationStrategy: false,
};

const machineConfig = {
  identifierAttributes: ['email_address' as const],
  initialIdentifier: 'email_address' as const,
  initialIdentifierValue: '',
  isCombinedFlow: false,
  organizationTicket: '',
  clerkStatus: '',
  hasSocialOrWeb3Buttons: false,
  isMobile: false,
  enterpriseSSOEnabled: false,
};

function createProps(overrides?: Partial<SignInStartViewProps>): SignInStartViewProps {
  return {
    state: initSignInStartState(machineConfig),
    dispatch: vi.fn(),
    config: baseConfig,
    identifierField: stubFormControl('identifier'),
    phoneIdentifierField: stubFormControl('identifier'),
    instantPasswordField: stubFormControl('password'),
    authenticateWithPasskey: vi.fn().mockResolvedValue(undefined),
    signUpUrlWithAuth: '/sign-up',
    waitlistUrlWithAuth: '/waitlist',
    ...overrides,
  };
}

describe('SignInStartView snapshots', () => {
  it('renders loading screen', () => {
    const props = createProps({
      state: initSignInStartState({ ...machineConfig, organizationTicket: 'ticket_123' }),
    });
    const { container } = renderForSnapshot(<SignInStartView {...props} />);
    expect(container).toMatchSnapshot();
  });

  it('renders email form', () => {
    const { container } = renderForSnapshot(<SignInStartView {...createProps()} />);
    expect(container).toMatchSnapshot();
  });

  it('renders with password field', () => {
    const props = createProps({
      config: { ...baseConfig, passwordBasedInstance: true },
    });
    const { container } = renderForSnapshot(<SignInStartView {...props} />);
    expect(container).toMatchSnapshot();
  });

  it('renders combined flow', () => {
    const props = createProps({
      config: { ...baseConfig, isCombinedFlow: true },
    });
    const { container } = renderForSnapshot(<SignInStartView {...props} />);
    expect(container).toMatchSnapshot();
  });

  it('renders waitlist mode', () => {
    const props = createProps({
      config: { ...baseConfig, signUpMode: SIGN_UP_MODES.WAITLIST },
    });
    const { container } = renderForSnapshot(<SignInStartView {...props} />);
    expect(container).toMatchSnapshot();
  });

  it('renders restricted mode (no sign-up link)', () => {
    const props = createProps({
      config: { ...baseConfig, signUpMode: SIGN_UP_MODES.RESTRICTED },
    });
    const { container } = renderForSnapshot(<SignInStartView {...props} />);
    expect(container).toMatchSnapshot();
  });

  it('renders with card error', () => {
    const props = createProps({
      state: {
        ...initSignInStartState(machineConfig),
        cardError: 'Something went wrong',
      },
    });
    const { container } = renderForSnapshot(<SignInStartView {...props} />);
    expect(container).toMatchSnapshot();
  });

  it('renders with passkey button', () => {
    const props = createProps({
      config: { ...baseConfig, showPasskeyButton: true, isWebSupported: true },
    });
    const { container } = renderForSnapshot(<SignInStartView {...props} />);
    expect(container).toMatchSnapshot();
  });
});
