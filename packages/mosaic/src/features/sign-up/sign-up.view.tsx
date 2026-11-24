import {
  AuthActionBlocked,
  AuthAlternativeChannel,
  AuthEmailLink,
  AuthEmailLinkStatus,
  AuthEnterpriseConnections,
  AuthLoading,
  AuthStartOver,
  AuthWallets,
} from '../../blocks/auth';
import { verificationResend } from '../../blocks/verification';
import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import { useMessages } from '../../localization';
import type { SignUpViewProps } from './sign-up.types';
import { SignUpDetailsStep } from './sign-up-details/sign-up-details';
import { SignUpLegalConsentField } from './sign-up-details/sign-up-legal-consent';
import { SignUpRestricted } from './sign-up-restricted/sign-up-restricted';

export function SignUpView(props: SignUpViewProps) {
  const m = useMessages('signUp');
  const { applicationName, logo } = props;

  return (
    <Card.Root
      align='center'
      renderBranding={props.renderBranding}
    >
      <Flow.Root
        value={props.screen}
        state={props}
      >
        {({
          start,
          continue: continueDetails,
          verifyEmail,
          verifyPhone,
          restricted,
          actionBlocked,
          startOver,
          alternativePhone,
          verifyEmailLink,
          emailLinkStatus,
          enterpriseConnections,
          wallets,
          protectCheck,
          taskChooseOrganization,
        }) => (
          <>
            <Flow.Step ids={['start']}>
              <SignUpDetailsStep
                {...start}
                logo={logo}
              />
            </Flow.Step>

            <Flow.Step ids={['continue']}>
              <SignUpDetailsStep
                {...continueDetails}
                logo={logo}
              />
            </Flow.Step>

            <Flow.Step ids={['verifyEmail', 'continueVerifyEmail']}>{verifyEmail}</Flow.Step>

            <Flow.Step ids={['verifyPhone', 'continueVerifyPhone']}>{verifyPhone}</Flow.Step>

            <Flow.Step ids={['restricted']}>
              <SignUpRestricted
                {...restricted}
                waitlist={false}
                logo={logo}
              />
            </Flow.Step>

            <Flow.Step ids={['waitlist']}>
              <SignUpRestricted
                {...restricted}
                waitlist
                logo={logo}
              />
            </Flow.Step>

            <Flow.Step ids={['actionBlocked']}>
              <AuthActionBlocked
                messages={m.actionBlocked}
                details={actionBlocked}
              />
            </Flow.Step>

            <Flow.Step ids={['startOver']}>
              <AuthStartOver
                messages={m.startOver}
                {...startOver}
              />
            </Flow.Step>

            <Flow.Step ids={['taskChooseOrganization']}>{taskChooseOrganization}</Flow.Step>

            <Flow.Step ids={['loading']}>
              <AuthLoading messages={{ loading: m.loading }} />
            </Flow.Step>

            <Flow.Step ids={['alternativePhone']}>
              {alternativePhone ? (
                <AuthAlternativeChannel
                  messages={{
                    title: m.alternativePhone.title,
                    description: m.alternativePhone.description,
                    fieldLabel: m.alternativePhone.label,
                    phonePlaceholder: m.form.phonePlaceholder,
                    selectedCountry: m.form.selectedCountry,
                    chooseCountry: m.form.chooseCountry,
                    searchCountries: m.form.searchCountries,
                    countrySearchPlaceholder: m.form.countrySearchPlaceholder,
                    noCountries: m.form.noCountries,
                    secondaryActionLabel: m.useAnotherMethod,
                    primaryActionLabel: m.submit,
                    pendingLabel: m.verifying,
                  }}
                  channel={alternativePhone.channel}
                  applicationName={applicationName}
                  logo={logo}
                  form={alternativePhone.form}
                  globalErrorMessage={alternativePhone.globalErrorMessage}
                  isPending={alternativePhone.isPending}
                  isDisabled={alternativePhone.isDisabled}
                  onSubmit={alternativePhone.onSubmit}
                  onCancel={alternativePhone.onCancel}
                >
                  {alternativePhone.legalConsent ? (
                    <SignUpLegalConsentField
                      form={alternativePhone.form}
                      consent={alternativePhone.legalConsent}
                      disabled={alternativePhone.isDisabled}
                    />
                  ) : null}
                </AuthAlternativeChannel>
              ) : null}
            </Flow.Step>

            <Flow.Step ids={['verifyEmailLink']}>
              {verifyEmailLink ? (
                <AuthEmailLink
                  messages={{
                    title: m.verifyEmailLink.title,
                    description: m.verifyEmailLink.description,
                    editIdentifier: m.editIdentifier,
                    secondaryActionLabel: m.useAnotherMethod,
                  }}
                  identifier={verifyEmailLink.identifier}
                  onEditIdentifier={verifyEmailLink.onEditIdentifier}
                  globalErrorMessage={verifyEmailLink.globalErrorMessage}
                  isPending={verifyEmailLink.isPending}
                  resend={verificationResend(m.verifyEmailLink, {
                    onResend: verifyEmailLink.onResend,
                    canResend: verifyEmailLink.canResend,
                    remainingSeconds: verifyEmailLink.resendRemainingSeconds,
                  })}
                />
              ) : null}
            </Flow.Step>

            <Flow.Step ids={['emailLinkStatus']}>
              {emailLinkStatus ? (
                <AuthEmailLinkStatus
                  messages={m.emailLinkStatus}
                  status={emailLinkStatus.status}
                  globalErrorMessage={emailLinkStatus.globalErrorMessage}
                />
              ) : null}
            </Flow.Step>

            <Flow.Step ids={['enterpriseConnections']}>
              {enterpriseConnections ? (
                <AuthEnterpriseConnections
                  messages={{
                    title: m.enterpriseConnections.title,
                    description: m.enterpriseConnections.description,
                    pendingLabel: m.enterpriseConnections.pending,
                  }}
                  logo={logo}
                  connections={enterpriseConnections.options}
                  globalErrorMessage={enterpriseConnections.globalErrorMessage}
                  pendingConnectionId={enterpriseConnections.pendingConnectionId}
                  onSelectConnection={enterpriseConnections.onSelectConnection}
                />
              ) : null}
            </Flow.Step>

            <Flow.Step ids={['wallets']}>
              {wallets ? (
                <AuthWallets
                  messages={{ ...m.wallets, backButton: m.back, pendingLabel: m.verifying, loading: m.loading }}
                  wallets={wallets.options}
                  globalErrorMessage={wallets.globalErrorMessage}
                  pendingWalletId={wallets.pendingWalletId}
                  isDisabled={wallets.isDisabled}
                  onSelectWallet={wallets.onSelectWallet}
                  onBack={wallets.onBack}
                />
              ) : null}
            </Flow.Step>

            <Flow.Step ids={['protectCheck', 'continueProtectCheck']}>{protectCheck}</Flow.Step>
          </>
        )}
      </Flow.Root>
    </Card.Root>
  );
}
