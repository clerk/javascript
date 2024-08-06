import { useGetHelp } from '~/components/sign-in/hooks/use-get-help';
import { useAppearance } from '~/hooks/use-appearance';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useEnvironment } from '~/hooks/use-environment';
import { useLocalizations } from '~/hooks/use-localizations';
import { useSupportEmail } from '~/hooks/use-support-email';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import * as Icon from '~/primitives/icon';
import { LinkButton } from '~/primitives/link';

export function SignInGetHelp() {
  const { t } = useLocalizations();
  const { applicationName, branded, logoImageUrl, homeUrl } = useDisplayConfig();
  const { isDevelopmentOrStaging } = useEnvironment();
  const { layout } = useAppearance();
  const isDev = isDevelopmentOrStaging();
  const supportEmail = useSupportEmail();
  const { setShowHelp } = useGetHelp();

  const cardFooterProps = {
    branded,
    helpPageUrl: layout?.helpPageUrl,
    privacyPageUrl: layout?.privacyPageUrl,
    termsPageUrl: layout?.termsPageUrl,
  };

  return (
    <Card.Root>
      <Card.Content>
        <Card.Header>
          {logoImageUrl ? (
            <Card.Logo
              href={homeUrl}
              src={logoImageUrl}
              alt={applicationName}
            />
          ) : null}
          <Card.Title>{t('signIn.alternativeMethods.getHelp.title')}</Card.Title>
          <Card.Description>{t('signIn.alternativeMethods.getHelp.content')}</Card.Description>
        </Card.Header>
        <Card.Actions>
          <Button
            onClick={() => {
              window.location.href = `mailto:${supportEmail}`;
            }}
            iconEnd={<Icon.CaretRightLegacy />}
          >
            Email support
          </Button>

          <LinkButton onClick={() => setShowHelp(false)}>{t('backButton')}</LinkButton>
        </Card.Actions>
        {isDev ? <Card.Banner>Development mode</Card.Banner> : null}
      </Card.Content>
      <Card.Footer {...cardFooterProps} />
    </Card.Root>
  );
}
