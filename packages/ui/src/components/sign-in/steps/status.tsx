import { LOCALIZATION_NEEDED } from '~/constants/localizations';
import { useAppearance } from '~/hooks/use-appearance';
import { useDevModeWarning } from '~/hooks/use-dev-mode-warning';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useLocalizations } from '~/hooks/use-localizations';
import * as Card from '~/primitives/card';
import { Spinner } from '~/primitives/spinner';

const signInLocalizationKeys = {
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

export function SignInStatus({
  status,
  loading = false,
}: {
  status: keyof typeof signInLocalizationKeys;
  loading?: boolean;
}) {
  const { t } = useLocalizations();
  const { branded } = useDisplayConfig();
  const { layout } = useAppearance();
  const isDev = useDevModeWarning();

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
          {/* @ts-ignore - TODO: fix type */}
          <Card.Title>{t(signInLocalizationKeys[status].title)}</Card.Title>
          {/* @ts-ignore - TODO: fix type */}
          <Card.Description>{t(signInLocalizationKeys[status].subtitle)}</Card.Description>
        </Card.Header>
        <Card.Body>
          <div className='flex flex-col items-center justify-center gap-y-4'>
            {loading ? (
              <Spinner>Loading…</Spinner>
            ) : (
              <>
                {/* TODO: Implement status icons */}
                <div className='bg-gray-2 size-24 shrink-0 rounded-full' />
                <p className='text-gray-a11 text-base'>{t('signIn.emailLink.unusedTab.title')}</p>
              </>
            )}
          </div>
        </Card.Body>
      </Card.Content>
      <Card.Footer {...cardFooterProps} />
    </Card.Root>
  );
}
