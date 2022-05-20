import React from 'react';

import { css, PrimitiveProps } from '../styledSystem';

const stylesWithTheme = css(theme => ({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  minWidth: theme.sizes.$96,
  // paddingRight: theme.sizes.$8,
  // paddingLeft: theme.sizes.$8,
  // paddingTop: theme.sizes.$10,
  // paddingBottom: theme.sizes.$10,
  py: theme.sizes.$10,
  px: theme.sizes.$8,
  borderRadius: theme.radii.$2xl,
  boxShadow: theme.shadows.$boxShadow1,
}));

// const stylesWithCssObject = css({
//   backgroundColor: 'fuchsia',
// });

export const CardPrimitive = (props: PrimitiveProps<'div'>): JSX.Element => {
  return (
    <div
      css={stylesWithTheme}
      {...props}
    />
  );
};

// import { styled } from "../designSystem";
//
// const Card = styled("div", {
//   boxSizing: "border-box",
//   display: "flex",
//   flexDirection: "column",
//   px: "$8",
//   py: "$10",
//   minWidth: "$96",
//   borderRadius: "$2xl",
//   boxShadow: "$boxShadow1",
// });
//
// Card.displayName = "CardPrimitive";
//
// export { Card };
