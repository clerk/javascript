import type { PropsWithChildren } from 'react';

import { Col } from '../../customizables';
import { mqu } from '../../styledSystem';

type ProfileCardPageProps = PropsWithChildren<{
  /**
   * Use this for pages that manage their own layout/padding
   */
  noPadding?: boolean;
}>;

/**
 * Per-page padding wrapper rendered inside `ProfileCardContent`
 *
 * Each routed page inside `UserProfile` / `OrganizationProfile` should wrap its content
 * in this component
 */
export const ProfileCardPage = ({ children, noPadding }: ProfileCardPageProps) => {
  if (noPadding) {
    return <>{children}</>;
  }

  return (
    <Col
      sx={theme => ({
        paddingTop: theme.space.$7,
        paddingBottom: theme.space.$7,
        paddingInlineStart: theme.space.$8,
        paddingInlineEnd: theme.space.$6, //smaller because of stable scrollbar gutter on the parent
        [mqu.sm]: {
          padding: `${theme.space.$8} ${theme.space.$5}`,
        },
      })}
    >
      {children}
    </Col>
  );
};
