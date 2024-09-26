import * as React from 'react';
import { mergeProps } from 'react-aria';

export interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const Icon = React.forwardRef<SVGSVGElement, IconProps & { children: React.ReactElement }>(
  function Icon(props, ref) {
    const { children, 'aria-label': ariaLabel, 'aria-hidden': ariaHidden, ...restProps } = props;
    return React.cloneElement(children, {
      ...mergeProps(children.props, restProps),
      ref,
      width: '1em',
      height: '1em',
      fill: 'none',
      focusable: 'false',
      'aria-label': ariaLabel,
      'aria-hidden': ariaLabel ? ariaHidden || undefined : true,
      role: 'img',
    });
  },
);
