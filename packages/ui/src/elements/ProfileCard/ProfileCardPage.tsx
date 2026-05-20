import type { PropsWithChildren } from 'react';

import { Col } from '../../customizables';
import { mqu } from '../../styledSystem';

type ProfileCardPageProps = PropsWithChildren<{
  /**
   * Whether to apply the standard per-page padding.
   * @default true
   */
  padding?: boolean;
  /**
   * Whether the page should bleed past the standard padding by applying matching
   * negative inline margins, so children render flush with the scroll-gutter / card border.
   * @default false
   */
  bleeding?: boolean;
}>;

/**
 * Per-page padding wrapper rendered inside `ProfileCardContent`
 *
 * Each routed page inside `UserProfile` / `OrganizationProfile` should wrap its content
 * in this component
 */
export const ProfileCardPage = ({ children, padding = true, bleeding = false }: ProfileCardPageProps) => {
  if (!padding && !bleeding) {
    return <>{children}</>;
  }

  return (
    <Col
      sx={theme => ({
        ...(padding && {
          paddingTop: theme.space.$7,
          paddingBottom: theme.space.$7,
          paddingInlineStart: theme.space.$8,
          paddingInlineEnd: theme.space.$6, //smaller because of stable scrollbar gutter on the parent
          [mqu.sm]: {
            padding: `${theme.space.$8} ${theme.space.$5}`,
          },
        }),
        ...(bleeding && {
          marginInlineStart: `calc(${theme.space.$8} * -1)`,
          marginInlineEnd: `calc(${theme.space.$6} * -1)`,
          [mqu.sm]: {
            marginInline: `calc(${theme.space.$5} * -1)`,
          },
        }),
      })}
    >
      {children}
    </Col>
  );
};
