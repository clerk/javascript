import React from 'react';

// TODO: Import from shared once [JS-118] is done
export const useSafeLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
