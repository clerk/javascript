'use client';

import type { StyleXStyles } from '@stylexjs/stylex';
import React from 'react';

import type { ButtonProps } from './button';

type ButtonDefaults = Pick<ButtonProps, 'size' | 'shape' | 'variant' | 'color' | 'disabled' | 'fullWidth'> & {
  styles?: StyleXStyles;
  sizeStyles?: StyleXStyles;
  iconStyles?: StyleXStyles;
};

export const NO_BUTTON_DEFAULTS: ButtonDefaults = {};

export const ButtonContext = React.createContext<ButtonDefaults>(NO_BUTTON_DEFAULTS);
