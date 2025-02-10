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
  const { options } = useAppearance().parsedAppearance;
  const { applicationName, branded, logoImageUrl, homeUrl } = useDisplayConfig();

  const logoProps =
    options?.logoVisibility === 'visible'
      ? {
          href: options?.logoLinkUrl || homeUrl,
          src: options?.logoImageUrl || logoImageUrl,
          alt: applicationName,
        }
      : null;

  const footerProps = {
    branded,
    helpPageUrl: options?.helpPageUrl,
    privacyPageUrl: options?.privacyPageUrl,
    termsPageUrl: options?.termsPageUrl,
  };

  return {
    logoProps,
    footerProps,
  };
}
