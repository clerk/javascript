import { createContext, type PropsWithChildren, useContext } from 'react';

import { Col } from '../../customizables';
import { mqu } from '../../styledSystem';

const ProfileCardPagePaddingContext = createContext(true);

export const ProfileCardPagePaddingProvider = ProfileCardPagePaddingContext.Provider;

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

export const ProfileCardPage = ({ children, padding, bleeding = false }: ProfileCardPageProps) => {
  const defaultPadding = useContext(ProfileCardPagePaddingContext);
  const shouldPad = padding ?? defaultPadding;
  if (!shouldPad && !bleeding) {
    return <>{children}</>;
  }

  return (
    <Col
      sx={theme => ({
        ...(shouldPad && {
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
