import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { VerificationLinkCard } from '@/ui/elements/VerificationLinkCard';

import { EmailLinkStatusCard } from '../../common';
import { Flow, localizationKeys } from '../../customizables';
import type { SignInEmailLinkVariant } from './sign-in-email-link.model';

export type SignInEmailLinkViewProps = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  variant: SignInEmailLinkVariant;
  status: 'verified_switch_tab' | null;
  safeIdentifier: string;
  profileImageUrl: string | undefined;
  showClientTrustNotice?: boolean;
  showNewDeviceNotice: boolean;
  onResend: () => void;
};

export function SignInEmailLinkView(props: SignInEmailLinkViewProps) {
  if (props.status) {
    return (
      <EmailLinkStatusCard
        title={localizationKeys('signIn.emailLink.verifiedSwitchTab.titleNewTab')}
        subtitle={localizationKeys('signIn.emailLink.verifiedSwitchTab.subtitleNewTab')}
        status={props.status}
      />
    );
  }

  return (
    <Flow.Part part='emailLink'>
      <VerificationLinkCard
        cardTitle={localizationKeys(props.variant === 'first' ? 'signIn.emailLink.title' : 'signIn.emailLinkMfa.title')}
        cardSubtitle={
          props.variant === 'first'
            ? localizationKeys('signIn.emailLink.subtitle')
            : localizationKeys('signIn.emailLinkMfa.subtitle')
        }
        cardNotice={
          props.variant === 'second' && (props.showClientTrustNotice || props.showNewDeviceNotice)
            ? localizationKeys('signIn.newDeviceVerificationNotice')
            : undefined
        }
        formTitle={props.variant === 'first' ? localizationKeys('signIn.emailLink.formTitle') : undefined}
        formSubtitle={
          props.variant === 'first'
            ? localizationKeys('signIn.emailLink.formSubtitle')
            : localizationKeys('signIn.emailLinkMfa.formSubtitle')
        }
        resendButton={
          props.variant === 'first'
            ? localizationKeys('signIn.emailLink.resendButton')
            : localizationKeys('signIn.emailLinkMfa.resendButton')
        }
        identityPreviewEditButtonAriaLabel={localizationKeys('identityPreviewEditButton__emailAddress')}
        onResendCodeClicked={props.onResend}
        safeIdentifier={props.safeIdentifier}
        profileImageUrl={props.profileImageUrl}
        onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      />
    </Flow.Part>
  );
}
