import { useGetHelp } from '~/components/sign-in/hooks/use-get-help';
import { LOCALIZATION_NEEDED } from '~/constants/localizations';
import { useAppearance } from '~/contexts';
import { useDevModeWarning } from '~/hooks/use-dev-mode-warning';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useLocalizations } from '~/hooks/use-localizations';
import { useSupportEmail } from '~/hooks/use-support-email';
import { Button } from '~/primitives/button';
import * as Card from '~/primitives/card';
import CaretRightLegacySm from '~/primitives/icons/caret-right-legacy-sm';
import { LinkButton } from '~/primitives/link';

export function SignInGetHelp() {
  const { t } = useLocalizations();
  const { applicationName, branded, logoImageUrl, homeUrl } = useDisplayConfig();
  const { layout } = useAppearance().parsedAppearance;
  const isDev = useDevModeWarning();
  const supportEmail = useSupportEmail();
  const { setShowHelp } = useGetHelp();

  const cardLogoProps = {
    href: layout?.logoLinkUrl || homeUrl,
    src: layout?.logoImageUrl || logoImageUrl,
    alt: applicationName,
  };
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
          <Card.Logo {...cardLogoProps} />
          <Card.Title>{t('signIn.alternativeMethods.getHelp.title')}</Card.Title>
          <Card.Description>{t('signIn.alternativeMethods.getHelp.content')}</Card.Description>
        </Card.Header>
        <Card.Actions>
          <Button
            onClick={() => {
              window.location.href = `mailto:${supportEmail}`;
            }}
            iconEnd={<CaretRightLegacySm />}
          >
            Email support
          </Button>

          <LinkButton onClick={() => setShowHelp(false)}>{t('backButton')}</LinkButton>
        </Card.Actions>
      </Card.Content>
      <Card.Footer {...cardFooterProps} />
    </Card.Root>
  );
}
