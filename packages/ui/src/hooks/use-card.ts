import { useAppearance } from '~/contexts';

import { useDisplayConfig } from './use-display-config';

/**
 * Access card rendering values for the `<Card.Logo />` and `<Card.Footer />`
 * based on the display config and parsed appearance.
 *
 * @example
 * ```tsx
 * import { useCard } from './use-card';
 *
 * function MyCardComponent() {
 *   const { logoProps, footerProps } = useCard();
 *
 *   return (
 *     <Card>
 *       <Card.Logo {...logoProps} />
 *       <Card.Footer {...footerProps} />
 *     </Card>
 *   );
 * }
 * ```
 */

export function useCard() {
  const { layout } = useAppearance().parsedAppearance;
  const { applicationName, branded, logoImageUrl, homeUrl } = useDisplayConfig();

  const logoProps =
    layout?.logoVisibility === 'visible'
      ? {
          href: layout?.logoLinkUrl || homeUrl,
          src: layout?.logoImageUrl || logoImageUrl,
          alt: applicationName,
        }
      : null;

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
