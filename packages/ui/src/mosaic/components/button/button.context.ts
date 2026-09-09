'use client';

import React from 'react';

import type { ButtonProps } from './button';

export const ButtonContext = React.createContext<
  Pick<ButtonProps, 'size' | 'shape' | 'variant' | 'color' | 'disabled'>
>({});
