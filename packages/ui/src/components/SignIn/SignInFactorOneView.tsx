import type { EmailLinkFactor, SignInFactor, SignInResource } from '@clerk/shared/types';

import { ErrorCard } from '@/ui/elements/ErrorCard';
import { LoadingCard } from '@/ui/elements/LoadingCard';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';

import { localizationKeys } from '../../localization';
import type { AlternativeMethodsMode } from './AlternativeMethods';
import { AlternativeMethods } from './AlternativeMethods';
import type { EnterpriseConnection } from './SignInFactorOneEnterpriseConnections';
import { SignInFactorOneAlternativePhoneCodeCard } from './SignInFactorOneAlternativePhoneCodeCard';
import { SignInFactorOneEmailCodeCard } from './SignInFactorOneEmailCodeCard';
import { SignInFactorOneEmailLinkCard } from './SignInFactorOneEmailLinkCard';
import { SignInFactorOneEnterpriseConnectionsCard } from './SignInFactorOneEnterpriseConnections';
import { SignInFactorOneForgotPasswordCard } from './SignInFactorOneForgotPasswordCard';
import { SignInFactorOnePasskey } from './SignInFactorOnePasskey';
import { SignInFactorOnePasswordCard } from './SignInFactorOnePasswordCard';
import { SignInFactorOnePhoneCodeCard } from './SignInFactorOnePhoneCodeCard';
import { factorHasLocalStrategy } from './utils';

export type SignInFactorOneViewProps = {
  currentFactor: SignInFactor | undefined | null;
  signInStatus: string | null;

  showAllStrategies: boolean;
  showForgotPasswordStrategies: boolean;
  passwordErrorCode: 'compromised' | 'pwned' | null;

  hasAnyAlternativeStrategy: boolean;
  hasResetPasswordFactor: boolean;
  hasMultipleEnterpriseConnections: boolean;
  factorAlreadyPrepared: boolean;
  shouldAvoidPrepare: boolean;

  identifier: string | null;
  avatarUrl: string | undefined;

  enterpriseConnections: EnterpriseConnection[];

  onGoBack: () => void;
  onToggleAllStrategies: (() => void) | undefined;
  onToggleForgotPasswordStrategies: () => void;
  onSelectFactor: (factor: SignInFactor) => void;
  onFactorPrepare: () => void;
  onClearPasswordError: () => void;

  onAttemptPassword: (password: string) => Promise<void>;
  onAttemptCode: VerificationCodeCardProps['onCodeEntryFinishedAction'];
  onPrepareFirstFactor: (factor: SignInFactor) => Promise<SignInResource>;

  authenticateWithPasskey: () => Promise<void>;

  onEnterpriseSSO: (enterpriseConnectionId: string) => void;

  signIn: SignInResource;
  onEmailLinkVerificationComplete: (si: SignInResource) => Promise<void>;
  onUserLockedError: (err: unknown) => boolean;
  emailLinkRedirectUrl: string;

  alternativeMethodsMode: AlternativeMethodsMode;

  onResetPasswordBackLink: () => void;
};

export function SignInFactorOneView(props: SignInFactorOneViewProps): JSX.Element {
  if (!props.currentFactor) {
    return props.signInStatus ? (
      <ErrorCard
        cardTitle={localizationKeys('signIn.noAvailableMethods.title')}
        cardSubtitle={localizationKeys('signIn.noAvailableMethods.subtitle')}
        message={localizationKeys('signIn.noAvailableMethods.message')}
      />
    ) : (
      <LoadingCard />
    );
  }

  if (props.hasMultipleEnterpriseConnections) {
    return (
      <SignInFactorOneEnterpriseConnectionsCard
        enterpriseConnections={props.enterpriseConnections}
        onEnterpriseSSO={props.onEnterpriseSSO}
      />
    );
  }

  if (props.showAllStrategies || props.showForgotPasswordStrategies) {
    const canGoBack = factorHasLocalStrategy(props.currentFactor) && !props.passwordErrorCode;

    const toggle = props.showAllStrategies ? props.onToggleAllStrategies : props.onToggleForgotPasswordStrategies;

    const backHandler = () => {
      props.onClearPasswordError();
      toggle?.();
    };

    return (
      <AlternativeMethods
        mode={props.alternativeMethodsMode}
        onBackLinkClick={canGoBack ? backHandler : undefined}
        onFactorSelected={f => {
          props.onSelectFactor(f);
          toggle?.();
        }}
        currentFactor={props.currentFactor}
      />
    );
  }

  const codeCardProps = {
    onAttemptCode: props.onAttemptCode,
    onPrepare: props.onPrepareFirstFactor,
    onGoBack: props.onGoBack,
    identifier: props.identifier,
    avatarUrl: props.avatarUrl,
    shouldAvoidPrepare: props.shouldAvoidPrepare,
  } as const;

  switch (props.currentFactor.strategy) {
    case 'passkey':
      return (
        <SignInFactorOnePasskey
          onFactorPrepare={props.onFactorPrepare}
          onShowAlternativeMethodsClick={props.onToggleAllStrategies}
          authenticateWithPasskey={props.authenticateWithPasskey}
          onGoBack={props.onGoBack}
          identifier={props.identifier}
          avatarUrl={props.avatarUrl}
        />
      );
    case 'password':
      return (
        <SignInFactorOnePasswordCard
          onForgotPasswordMethodClick={
            props.hasResetPasswordFactor ? props.onToggleForgotPasswordStrategies : props.onToggleAllStrategies
          }
          onShowAlternativeMethodsClick={props.onToggleAllStrategies}
          onAttemptPassword={props.onAttemptPassword}
          onGoBack={props.onGoBack}
          identifier={props.identifier}
          avatarUrl={props.avatarUrl}
          hasResetPasswordFactor={props.hasResetPasswordFactor}
        />
      );
    case 'email_code':
      return (
        <SignInFactorOneEmailCodeCard
          factorAlreadyPrepared={props.factorAlreadyPrepared}
          onFactorPrepare={props.onFactorPrepare}
          factor={props.currentFactor}
          onShowAlternativeMethodsClicked={props.onToggleAllStrategies}
          {...codeCardProps}
        />
      );
    case 'phone_code':
      if (props.currentFactor.channel && props.currentFactor.channel !== 'sms') {
        return (
          <SignInFactorOneAlternativePhoneCodeCard
            factorAlreadyPrepared={props.factorAlreadyPrepared}
            onFactorPrepare={props.onFactorPrepare}
            factor={props.currentFactor}
            onChangePhoneCodeChannel={props.onSelectFactor}
            {...codeCardProps}
          />
        );
      } else {
        return (
          <SignInFactorOnePhoneCodeCard
            factorAlreadyPrepared={props.factorAlreadyPrepared}
            onFactorPrepare={props.onFactorPrepare}
            factor={props.currentFactor}
            onShowAlternativeMethodsClicked={props.onToggleAllStrategies}
            {...codeCardProps}
          />
        );
      }
    case 'email_link':
      return (
        <SignInFactorOneEmailLinkCard
          factorAlreadyPrepared={props.factorAlreadyPrepared}
          onFactorPrepare={props.onFactorPrepare}
          factor={props.currentFactor as EmailLinkFactor}
          onShowAlternativeMethodsClicked={props.onToggleAllStrategies}
          signIn={props.signIn}
          onVerificationComplete={props.onEmailLinkVerificationComplete}
          onUserLockedError={props.onUserLockedError}
          avatarUrl={props.avatarUrl}
          redirectUrl={props.emailLinkRedirectUrl}
        />
      );
    case 'reset_password_phone_code':
      return (
        <SignInFactorOneForgotPasswordCard
          factorAlreadyPrepared={props.factorAlreadyPrepared}
          onFactorPrepare={props.onFactorPrepare}
          factor={props.currentFactor}
          onShowAlternativeMethodsClicked={props.onToggleAllStrategies}
          onBackLinkClicked={props.onResetPasswordBackLink}
          cardSubtitle={localizationKeys('signIn.forgotPassword.subtitle_phone')}
          {...codeCardProps}
        />
      );
    case 'reset_password_email_code':
      return (
        <SignInFactorOneForgotPasswordCard
          factorAlreadyPrepared={props.factorAlreadyPrepared}
          onFactorPrepare={props.onFactorPrepare}
          factor={props.currentFactor}
          onShowAlternativeMethodsClicked={props.onToggleAllStrategies}
          onBackLinkClicked={props.onResetPasswordBackLink}
          cardSubtitle={localizationKeys('signIn.forgotPassword.subtitle_email')}
          {...codeCardProps}
        />
      );
    default:
      return <LoadingCard />;
  }
}
