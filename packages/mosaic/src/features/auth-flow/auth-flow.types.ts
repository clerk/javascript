export interface AuthFlowValues {
  identifier: string;
  emailAddress: string;
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
