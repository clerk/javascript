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
 *
 * @returns {{
 *   logoProps: {
 *     href: string;
 *     src: string;
 *     alt: string;
 *   };
 *   footerProps: {
 *     branded: boolean;
 *     helpPageUrl: string | undefined;
 *     privacyPageUrl: string | undefined;
 *     termsPageUrl: string | undefined;
 *   };
 * }}
 */

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
