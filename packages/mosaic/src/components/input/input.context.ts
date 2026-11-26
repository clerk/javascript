'use client';

import React from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

export const InputSizeContext = React.createContext<InputSize | undefined>(undefined);
