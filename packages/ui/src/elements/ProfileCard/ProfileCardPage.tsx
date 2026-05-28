import type { PropsWithChildren } from 'react';

import { Col, descriptors } from '../../customizables';
import { mqu } from '../../styledSystem';

type ProfileCardPageProps = PropsWithChildren<{
  /**
   * Whether the page should bleed past the standard padding by applying matching
   * negative inline margins, so children render flush with the scroll-gutter / card border.
   * @default false
   */
  bleeding?: boolean;
}>;

export const ProfileCardPage = ({ children, bleeding = false }: ProfileCardPageProps) => {
  return (
    <Col
      elementDescriptor={descriptors.profilePageContent}
      sx={theme => ({
        paddingTop: theme.space.$7,
        paddingBottom: theme.space.$7,
        paddingInlineStart: theme.space.$8,
        paddingInlineEnd: theme.space.$6,
        [mqu.sm]: {
          padding: `${theme.space.$8} ${theme.space.$5}`,
        },
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
