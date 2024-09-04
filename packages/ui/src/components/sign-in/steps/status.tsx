import * as React from 'react';

import { LOCALIZATION_NEEDED } from '~/constants/localizations';
import { useAppearance } from '~/contexts';
import { useDevModeWarning } from '~/hooks/use-dev-mode-warning';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useLocalizations } from '~/hooks/use-localizations';
import * as Card from '~/primitives/card';
import * as Icon from '~/primitives/icon';
import type { VerificationStatus } from '~/types/utils';
import type { DefaultLocalizationKey } from '~/utils/make-localizable';

const signInStatusLocalizationKeys: Record<
  VerificationStatus,
  {
    title: DefaultLocalizationKey;
    subtitle: DefaultLocalizationKey;
  }
> = {
  verified: {
    title: 'signIn.emailLink.verified.title',
    subtitle: 'signIn.emailLink.verified.subtitle',
  },
  verified_switch_tab: {
    title: 'signIn.emailLink.verified.title',
    subtitle: 'signIn.emailLink.verifiedSwitchTab.subtitle',
  },
  loading: {
    title: 'signIn.emailLink.loading.title',
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
    title: 'signIn.emailLink.clientMismatch.title',
    subtitle: 'signIn.emailLink.clientMismatch.subtitle',
  },
};

type Status = keyof typeof signInStatusLocalizationKeys;

const statusIcon: Record<Status, React.ReactElement> = {
  loading: (
    <Icon.SpinnerLg
      size='lg'
      className='mb-8 motion-safe:animate-spin motion-safe:[animation-duration:1.5s]'
    />
  ),
  verified: (
    <Icon.TickShieldlg
      size='lg'
      className='text-gray-11 mb-2'
    />
  ),
  verified_switch_tab: (
    <Icon.SwitchArrowslg
      size='lg'
      className='text-gray-11 mb-2'
    />
  ),
  expired: (
    <Icon.ExclamationTrianglelg
      size='lg'
      className='mb-2 text-[#F36B16]'
    />
  ),
  failed: (
    <Icon.ExclamationTrianglelg
      size='lg'
      className='mb-2 text-[#EF4444]'
    />
  ),
  client_mismatch: (
    <Icon.ExclamationTrianglelg
      size='lg'
      className='mb-2 text-[#F36B16]'
    />
  ),
};

export function SignInStatus() {
  const { t } = useLocalizations();
  const { branded } = useDisplayConfig();
  const { layout } = useAppearance().parsedAppearance;
  const isDev = useDevModeWarning();
  const [status] = React.useState<Status>('loading');

  const cardFooterProps = {
    branded,
    helpPageUrl: layout?.helpPageUrl,
    privacyPageUrl: layout?.privacyPageUrl,
    termsPageUrl: layout?.termsPageUrl,
  };

  return (
    <Card.Root banner={isDev ? LOCALIZATION_NEEDED.developmentMode : null}>
      <Card.Content>
        <Card.Header>
          {statusIcon[status]}
          <Card.Title>{t(signInStatusLocalizationKeys[status].title)}</Card.Title>
          <Card.Description>{t(signInStatusLocalizationKeys[status].subtitle)}</Card.Description>
        </Card.Header>
        {status !== 'loading' ? (
          <Card.Body>
            <p className='text-gray-a11 text-center text-base'>{t('signIn.emailLink.unusedTab.title')}</p>
          </Card.Body>
        ) : null}
      </Card.Content>
      <Card.Footer {...cardFooterProps} />
    </Card.Root>
  );
}
