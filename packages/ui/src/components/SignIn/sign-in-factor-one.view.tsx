import { ErrorCard } from '@/ui/elements/ErrorCard';
import { LoadingCard } from '@/ui/elements/LoadingCard';

import { localizationKeys } from '../../localization';
import { AlternativeMethods } from './AlternativeMethods';
import type { useSignInFactorOneController } from './sign-in-factor-one.controller';
import { SignInFactorOneAlternativePhoneCodeCard } from './SignInFactorOneAlternativePhoneCodeCard';
import { SignInFactorOneEmailCodeCard } from './SignInFactorOneEmailCodeCard';
import { SignInFactorOneEmailLinkCard } from './SignInFactorOneEmailLinkCard';
import { SignInFactorOneEnterpriseConnections } from './SignInFactorOneEnterpriseConnections';
import { SignInFactorOneForgotPasswordCard } from './SignInFactorOneForgotPasswordCard';
import { SignInFactorOnePasskey } from './SignInFactorOnePasskey';
import { SignInFactorOnePasswordCard } from './SignInFactorOnePasswordCard';
import { SignInFactorOnePhoneCodeCard } from './SignInFactorOnePhoneCodeCard';
import { SignInFactorOneSSOBypass } from './SignInFactorOneSSOBypass';

export const SignInFactorOneView = (controller: ReturnType<typeof useSignInFactorOneController>): JSX.Element => {
  const { currentFactor } = controller;

  if (!currentFactor) {
    return controller.status ? (
      <ErrorCard
        cardTitle={localizationKeys('signIn.noAvailableMethods.title')}
        cardSubtitle={localizationKeys('signIn.noAvailableMethods.subtitle')}
        message={localizationKeys('signIn.noAvailableMethods.message')}
      />
    ) : (
      <LoadingCard />
    );
  }

  if (controller.ssoBypassFactor) {
    return <SignInFactorOneSSOBypass bypassFactor={controller.ssoBypassFactor} />;
  }

  /**
   * Prompt to choose between a list of enterprise connections as supported first factors
   * @experimental
   */
  if (controller.hasMultipleEnterpriseConnections) {
    return <SignInFactorOneEnterpriseConnections />;
  }

  if (controller.showAlternativeMethods) {
    // Password errors are not recoverable by re-entering the password, so we hide the back button
    return (
      <AlternativeMethods
        mode={controller.alternativeMethodsMode}
        onBackLinkClick={controller.canGoBack ? controller.onAlternativeMethodsBack : undefined}
        onFactorSelected={controller.onAlternativeFactorSelected}
        currentFactor={currentFactor}
      />
    );
  }

  if (!currentFactor) {
    return <LoadingCard />;
  }

  switch (currentFactor.strategy) {
    case 'passkey':
      return (
        <SignInFactorOnePasskey
          onFactorPrepare={controller.onFactorPrepare}
          onShowAlternativeMethodsClick={controller.onShowAlternativeMethods}
        />
      );
    case 'password':
      return (
        <SignInFactorOnePasswordCard
          onForgotPasswordMethodClick={controller.onForgotPasswordMethod}
          onShowAlternativeMethodsClick={controller.onShowAlternativeMethods}
          onPasswordError={controller.onPasswordError}
        />
      );
    case 'email_code':
      return (
        <SignInFactorOneEmailCodeCard
          factorAlreadyPrepared={controller.factorAlreadyPrepared}
          onFactorPrepare={controller.onFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={controller.onShowAlternativeMethods}
        />
      );
    case 'phone_code':
      if (currentFactor.channel && currentFactor.channel !== 'sms') {
        // Alternative phone code provider (e.g. WhatsApp)
        return (
          <SignInFactorOneAlternativePhoneCodeCard
            factorAlreadyPrepared={controller.factorAlreadyPrepared}
            onFactorPrepare={controller.onFactorPrepare}
            factor={currentFactor}
            onChangePhoneCodeChannel={controller.onChangePhoneCodeChannel}
          />
        );
      } else {
        // SMS
        return (
          <SignInFactorOnePhoneCodeCard
            factorAlreadyPrepared={controller.factorAlreadyPrepared}
            onFactorPrepare={controller.onFactorPrepare}
            factor={currentFactor}
            onShowAlternativeMethodsClicked={controller.onShowAlternativeMethods}
          />
        );
      }

    case 'email_link':
      return (
        <SignInFactorOneEmailLinkCard
          factorAlreadyPrepared={controller.factorAlreadyPrepared}
          onFactorPrepare={controller.onFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={controller.onShowAlternativeMethods}
        />
      );
    case 'reset_password_phone_code':
      return (
        <SignInFactorOneForgotPasswordCard
          factorAlreadyPrepared={controller.factorAlreadyPrepared}
          onFactorPrepare={controller.onFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={controller.onShowAlternativeMethods}
          onBackLinkClicked={controller.onResetPasswordBack}
          cardSubtitle={localizationKeys('signIn.forgotPassword.subtitle_phone')}
        />
      );

    case 'reset_password_email_code':
      return (
        <SignInFactorOneForgotPasswordCard
          factorAlreadyPrepared={controller.factorAlreadyPrepared}
          onFactorPrepare={controller.onFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={controller.onShowAlternativeMethods}
          onBackLinkClicked={controller.onResetPasswordBack}
          cardSubtitle={localizationKeys('signIn.forgotPassword.subtitle_email')}
        />
      );
    default:
      return <LoadingCard />;
  }
};
