import React from 'react';

type ElementProps = {
  div: React.HTMLAttributes<HTMLDivElement>;
  input: React.HTMLAttributes<HTMLInputElement>;
  button: React.HTMLAttributes<HTMLButtonElement>;
  heading: React.HTMLAttributes<HTMLHeadingElement>;
  p: React.HTMLAttributes<HTMLParagraphElement>;
};

export type PrimitiveProps<HtmlT extends keyof ElementProps, Props = {}> = ElementProps[HtmlT] & Props;
