'use client';

import React from 'react';

import type { BadgeProps } from './badge';

export const BadgeContext = React.createContext<Pick<BadgeProps, 'color'>>({});
