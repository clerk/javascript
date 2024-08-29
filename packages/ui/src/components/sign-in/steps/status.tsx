import { cx } from 'cva';
import * as React from 'react';

import { LOCALIZATION_NEEDED } from '~/constants/localizations';
import { useAppearance } from '~/hooks/use-appearance';
import { useDevModeWarning } from '~/hooks/use-dev-mode-warning';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useLocalizations } from '~/hooks/use-localizations';
import * as Card from '~/primitives/card';
import * as Icon from '~/primitives/icon';
import type { DefaultLocalizationKey } from '~/utils/make-localizable';

const signInLocalizationKeys: Record<
  string,
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

type Status = keyof typeof signInLocalizationKeys;

const ExclamationTriangle = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(function ExclamationTriangle(
  { className, ...props },
  ref,
) {
  return (
    <svg
      ref={ref}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 48 48'
      className={cx('size-10', className)}
      aria-hidden
      {...props}
    >
      <path
        fill='currentColor'
        fillRule='evenodd'
        d='M18.982 8.798c2.23-3.861 7.806-3.861 10.034 0l14.2 24.613c2.228 3.861-.56 8.688-5.018 8.688H9.8c-4.458 0-7.244-4.827-5.016-8.688L18.98 8.798h.002ZM24 18.928a1.448 1.448 0 0 1 1.448 1.449v7.24a1.448 1.448 0 0 1-2.896 0v-7.24A1.448 1.448 0 0 1 24 18.929Zm0 15.929a1.448 1.448 0 1 0 0-2.896 1.448 1.448 0 0 0 0 2.896Z'
        clipRule='evenodd'
      />
    </svg>
  );
});

const Spinner = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(function Spinner(
  { className, ...props },
  ref,
) {
  return (
    <svg
      ref={ref}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 48 48'
      className={cx('size-10 motion-safe:animate-spin motion-safe:[animation-duration:1.5s]', className)}
      aria-label='loading'
      {...props}
    >
      <path
        fill='currentColor'
        d='M33.484 39.884c.425.711.195 1.638-.546 2.008a20 20 0 0 1-20.45-34.247c.678-.477 1.603-.24 2.028.471.425.711.187 1.627-.484 2.113a17 17 0 0 0 17.363 29.078c.746-.36 1.665-.134 2.09.577Z'
      />
    </svg>
  );
});

const statusIcon: Record<Status, React.ReactElement> = {
  loading: <Spinner className='mb-8' />,
  verified: <Icon.TickShieldLegacy />,
  verified_switch_tab: <Icon.SwitchArrowsLegacy />,
  expired: <ExclamationTriangle className='mb-2 text-[#F36B16]' />,
  failed: <ExclamationTriangle className='mb-2 text-[#EF4444]' />,
  client_mismatch: <ExclamationTriangle className='mb-2 text-[#F36B16]' />,
};

export function SignInStatus() {
  const { t } = useLocalizations();
  const { branded } = useDisplayConfig();
  const { layout } = useAppearance();
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
          <Card.Title>{t(signInLocalizationKeys[status].title)}</Card.Title>
          <Card.Description>{t(signInLocalizationKeys[status].subtitle)}</Card.Description>
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
