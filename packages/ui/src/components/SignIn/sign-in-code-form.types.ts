import type {
  CodePreparationCommands,
  CodeSubmissionCommands,
  CodeVerificationRecovery,
} from '../../common/code-verification.types';
import type { VerificationCodeCardProps } from '../../elements/VerificationCodeCard';
import type { SignInFactorOneCodeFormProps } from './SignInFactorOneCodeForm';
import type { SignInFactorTwoCodeFormProps } from './SignInFactorTwoCodeForm';

type SignInCodeCommands = CodeSubmissionCommands & {
  getErrorRecovery: (error: unknown) => CodeVerificationRecovery | undefined;
  safeIdentifier: string | null | undefined;
  profileImageUrl: string | undefined;
};

export type SignInFactorOneCodeData = SignInCodeCommands &
  CodePreparationCommands & {
    goBack: () => Promise<unknown>;
  };

export type SignInFactorTwoCodeData = SignInCodeCommands & {
  showNewDeviceVerificationNotice: boolean;
  resettingPassword: boolean;
  prepareFactor: (() => Promise<void>) | undefined;
  signInAsDifferentUser: () => Promise<unknown>;
};

type CodeCardActions = {
  action: VerificationCodeCardProps['onCodeEntryFinishedAction'];
  prepare: (() => void | Promise<void>) | undefined;
  safeIdentifier: string | null | undefined;
  profileImageUrl: string | undefined;
};

export type SignInFactorOneCodeViewProps = Omit<
  SignInFactorOneCodeFormProps,
  'factor' | 'factorAlreadyPrepared' | 'onFactorPrepare'
> &
  CodeCardActions & { goBack: () => Promise<unknown> };

export type SignInFactorTwoCodeViewProps = Pick<
  SignInFactorTwoCodeFormProps,
  'cardTitle' | 'cardSubtitle' | 'resendButton' | 'inputLabel' | 'onShowAlternativeMethodsClicked'
> &
  CodeCardActions & {
    cardNotice: VerificationCodeCardProps['cardNotice'];
    onDifferentAccountClicked: () => Promise<unknown>;
    resettingPassword: boolean;
  };
