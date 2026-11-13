export interface AuthFlowProvider {
  id: string;
  name: string;
  iconUrl: string;
}

export interface AuthFlowValues {
  identifier: string;
  phoneNumber: string;
  password: string;
  code: string;
  backupCode: string;
  firstName: string;
  lastName: string;
  username: string;
  newPassword: string;
  confirmPassword: string;
  signOutOfOtherSessions: boolean;
  legalAccepted: boolean;
}

export interface AuthFlowSubmitEvent {
  preventDefault: () => void;
}

export interface AuthFlowActionBlockedDetails {
  title?: string;
  description?: string;
  linkUrl?: string;
  linkText?: string;
  traceId?: string;
}

export type AuthFlowEmailLinkStatus =
  | 'loading'
  | 'signed-in'
  | 'signed-in-other-tab'
  | 'transferable'
  | 'expired'
  | 'failed'
  | 'client-mismatch';

export interface AuthFlowCodeStep {
  kind: 'code';
  purpose:
    | 'first-factor'
    | 'second-factor'
    | 'client-trust'
    | 'sso-bypass'
    | 'reset-password'
    | 'verify-email'
    | 'verify-phone';
  channel: 'email' | 'phone' | 'totp';
  identifier?: string;
  provider?: string;
  resetting?: boolean;
}

export interface AuthFlowEmailLinkState {
  status: AuthFlowEmailLinkStatus;
  flow: 'sign-in' | 'sign-up';
}
