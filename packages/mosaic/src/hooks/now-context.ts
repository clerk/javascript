'use client';

import { createContext } from 'react';

export const MosaicNowContext = createContext<Date | null>(null);

export const MosaicNowProvider = MosaicNowContext.Provider;
