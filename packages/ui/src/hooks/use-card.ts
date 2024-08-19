import { useAppearance } from '~/contexts';

import { useDisplayConfig } from './use-display-config';

export function useCard() {
  const { layout } = useAppearance().parsedAppearance;
  const { applicationName, branded, logoImageUrl, homeUrl } = useDisplayConfig();

  const logoProps = {
    href: layout?.logoLinkUrl || homeUrl,
    src: layout?.logoImageUrl || logoImageUrl,
    alt: applicationName,
  };

  const footerProps = {
    branded,
    helpPageUrl: layout?.helpPageUrl,
    privacyPageUrl: layout?.privacyPageUrl,
    termsPageUrl: layout?.termsPageUrl,
  };

  return {
    logoProps,
    footerProps,
  };
}
