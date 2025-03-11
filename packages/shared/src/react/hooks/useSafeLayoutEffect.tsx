import React from 'react';

/**
 * @internal
 */
export const useSafeLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
