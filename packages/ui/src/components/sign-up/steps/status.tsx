import * as React from 'react';

import { LOCALIZATION_NEEDED } from '~/constants/localizations';
import { useCard } from '~/hooks/use-card';
import { useDevModeWarning } from '~/hooks/use-dev-mode-warning';
import { useLocalizations } from '~/hooks/use-localizations';
import * as Card from '~/primitives/card';
import ExclamationTrianglelg from '~/primitives/icons/exclamation-triangle-lg';
import SpinnerLg from '~/primitives/icons/spinner-lg';
import SwitchArrowslg from '~/primitives/icons/switch-arrows-lg';
import TickShieldlg from '~/primitives/icons/tick-shield-lg';
import type { VerificationStatus } from '~/types/utils';
import type { DefaultLocalizationKey } from '~/utils/make-localizable';

const signUpStatusLocalizationKeys: Record<
  VerificationStatus,
  {
    title: DefaultLocalizationKey;
    subtitle: DefaultLocalizationKey;
  }
> = {
  verified: {
    title: 'signUp.emailLink.verified.title',
    subtitle: 'signIn.emailLink.verified.subtitle',
  },
  verified_switch_tab: {
    title: 'signUp.emailLink.verified.title',
    subtitle: 'signIn.emailLink.verifiedSwitchTab.subtitle',
  },
  loading: {
    title: 'signUp.emailLink.loading.title',
    subtitle: 'signIn.emailLink.loading.subtitle',
  },
  failed: {
    title: 'signIn.emailLink.failed.title',
    subtitle: 'signIn.emailLink.failed.subtitle',
  },
  expired: {
    title: 'signIn.emailLink.expired.title',
    subtitle: 'signIn.emailLink.expired.subtitle',
  },
  client_mismatch: {
    title: 'signUp.emailLink.clientMismatch.title',
    subtitle: 'signIn.emailLink.clientMismatch.subtitle',
  },
};

type Status = keyof typeof signUpStatusLocalizationKeys;

const statusIcon: Record<Status, React.ReactElement> = {
  loading: <SpinnerLg className='mb-8 motion-safe:animate-spin motion-safe:[animation-duration:1.5s]' />,
  verified: <TickShieldlg className='mb-2 text-[#22C543]' />,
  verified_switch_tab: <SwitchArrowslg className='mb-2 text-[#747686]' />,
  expired: <ExclamationTrianglelg className='mb-2 text-[#F36B16]' />,
  failed: <ExclamationTrianglelg className='mb-2 text-[#EF4444]' />,
  client_mismatch: <ExclamationTrianglelg className='mb-2 text-[#F36B16]' />,
};

export function SignUpStatus() {
  const { t } = useLocalizations();
  const isDev = useDevModeWarning();
  const [status] = React.useState<Status>('loading');
  const { footerProps } = useCard();

  return (
    <Card.Root banner={isDev ? LOCALIZATION_NEEDED.developmentMode : null}>
      <Card.Content>
        <Card.Header>
          {statusIcon[status]}
          <Card.Title>{t(signUpStatusLocalizationKeys[status].title)}</Card.Title>
          <Card.Description>{t(signUpStatusLocalizationKeys[status].subtitle)}</Card.Description>
        </Card.Header>
        {status !== 'loading' ? (
          <Card.Body>
            <p className='text-gray-a11 text-center text-base'>{t('signIn.emailLink.unusedTab.title')}</p>
          </Card.Body>
        ) : null}
      </Card.Content>
      <Card.Footer {...footerProps} />
    </Card.Root>
  );
}
