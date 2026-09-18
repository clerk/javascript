'use client';

import type { StyleXStyles } from '@stylexjs/stylex';
import React from 'react';

import type { ButtonProps } from './button';

export const ButtonContext = React.createContext<
  Pick<ButtonProps, 'size' | 'shape' | 'variant' | 'color' | 'disabled'> & {
    styles?: StyleXStyles;
    sizeStyles?: StyleXStyles;
    iconStyles?: StyleXStyles;
  }
>({});
