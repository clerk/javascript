'use client';

import React from 'react';

import type { XStyle } from '../../props';
import type { AvatarProps } from './avatar';

type AvatarDefaults = Pick<AvatarProps, 'size' | 'shape'> & {
  styles?: XStyle;
};

export const AvatarContext = React.createContext<AvatarDefaults>({});
