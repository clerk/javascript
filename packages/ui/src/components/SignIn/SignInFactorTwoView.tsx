import type { EmailLinkFactor, SignInFactor, SignInResource } from '@clerk/shared/types';

import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { LoadingCard } from '@/ui/elements/LoadingCard';

import { SignInFactorTwoAlternativeMethods } from './SignInFactorTwoAlternativeMethods';
import { SignInFactorTwoBackupCodeCard } from './SignInFactorTwoBackupCodeCard';
import { SignInFactorTwoEmailCodeCard } from './SignInFactorTwoEmailCodeCard';
import { SignInFactorTwoEmailLinkCard } from './SignInFactorTwoEmailLinkCard';
import { SignInFactorTwoPhoneCodeCard } from './SignInFactorTwoPhoneCodeCard';
import { SignInFactorTwoTOTPCard } from './SignInFactorTwoTOTPCard';

export type SignInFactorTwoViewProps = {
  currentFactor: SignInFactor | undefined | null;

  showAllStrategies: boolean;
  factorAlreadyPrepared: boolean;

  isResettingPassword: boolean;
  showNewDeviceVerificationNotice: boolean;
  showClientTrustNotice?: boolean;

  avatarUrl: string | undefined;

  onToggleAllStrategies: () => void;
  onSelectFactor: (factor: SignInFactor) => void;
  onFactorPrepare: () => void;

  onAttemptCode: VerificationCodeCardProps['onCodeEntryFinishedAction'];
  onAttemptBackupCode: (code: string) => Promise<void>;
  onPrepareSecondFactor: (factor: SignInFactor) => Promise<SignInResource>;

  signIn: SignInResource;
  onEmailLinkVerificationComplete: (si: SignInResource) => Promise<void>;
  onUserLockedError: (err: unknown) => boolean;
  emailLinkRedirectUrl: string;
  isNewDevice: boolean;
};

export function SignInFactorTwoView(props: SignInFactorTwoViewProps): JSX.Element {
  if (!props.currentFactor) {
    return <LoadingCard />;
  }

  if (props.showAllStrategies) {
    return (
      <SignInFactorTwoAlternativeMethods
        onBackLinkClick={props.onToggleAllStrategies}
        onFactorSelected={props.onSelectFactor}
      />
    );
  }

  const codeCardProps = {
    onAttemptCode: props.onAttemptCode,
    avatarUrl: props.avatarUrl,
    isResettingPassword: props.isResettingPassword,
    showNewDeviceVerificationNotice: props.showNewDeviceVerificationNotice,
  } as const;

  switch (props.currentFactor.strategy) {
    case 'phone_code':
      return (
        <SignInFactorTwoPhoneCodeCard
          showClientTrustNotice={props.showClientTrustNotice}
          factorAlreadyPrepared={props.factorAlreadyPrepared}
          onFactorPrepare={props.onFactorPrepare}
          factor={props.currentFactor}
          onShowAlternativeMethodsClicked={props.onToggleAllStrategies}
          onPrepareSecondFactor={props.onPrepareSecondFactor as (factor: any) => Promise<SignInResource>}
          {...codeCardProps}
        />
      );
    case 'totp':
      return (
        <SignInFactorTwoTOTPCard
          factorAlreadyPrepared={props.factorAlreadyPrepared}
          onFactorPrepare={props.onFactorPrepare}
          factor={props.currentFactor}
          onShowAlternativeMethodsClicked={props.onToggleAllStrategies}
          {...codeCardProps}
        />
      );
    case 'backup_code':
      return (
        <SignInFactorTwoBackupCodeCard
          onShowAlternativeMethodsClicked={props.onToggleAllStrategies}
          onAttemptBackupCode={props.onAttemptBackupCode}
          isResettingPassword={props.isResettingPassword}
        />
      );
    case 'email_code':
      return (
        <SignInFactorTwoEmailCodeCard
          showClientTrustNotice={props.showClientTrustNotice}
          factorAlreadyPrepared={props.factorAlreadyPrepared}
          onFactorPrepare={props.onFactorPrepare}
          factor={props.currentFactor}
          onShowAlternativeMethodsClicked={props.onToggleAllStrategies}
          onPrepareSecondFactor={props.onPrepareSecondFactor as (factor: any) => Promise<SignInResource>}
          {...codeCardProps}
        />
      );
    case 'email_link':
      return (
        <SignInFactorTwoEmailLinkCard
          factorAlreadyPrepared={props.factorAlreadyPrepared}
          onFactorPrepare={props.onFactorPrepare}
          factor={props.currentFactor as EmailLinkFactor}
          onShowAlternativeMethodsClicked={props.onToggleAllStrategies}
          showClientTrustNotice={props.showClientTrustNotice}
          signIn={props.signIn}
          onVerificationComplete={props.onEmailLinkVerificationComplete}
          onUserLockedError={props.onUserLockedError}
          avatarUrl={props.avatarUrl}
          redirectUrl={props.emailLinkRedirectUrl}
          isNewDevice={props.isNewDevice}
        />
      );
    default:
      return <LoadingCard />;
  }
}
