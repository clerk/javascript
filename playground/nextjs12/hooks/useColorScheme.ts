import { useEffect, useState } from 'react';

export const PREFERENCES = {
  DARK: 'dark',
  LIGHT: 'light',
  NONE: 'no-preference',
} as const;

export const values = [PREFERENCES.DARK, PREFERENCES.LIGHT, PREFERENCES.NONE];

// @ts-ignore
export const makeQuery = pref => `(prefers-color-scheme: ${pref})`;

// @ts-ignore
export const matchPreference = pref => typeof window !== 'undefined' && window.matchMedia(makeQuery(pref));

// @ts-ignore
export const getPreference = preferences =>
  preferences
    // @ts-ignore
    .map(value => ({
      preference: value,
      matchMedia: matchPreference(value),
    }))
    // @ts-ignore
    .filter(pref => pref.matchMedia.matches)[0];

// @ts-ignore
export const attachListener = (pref, setScheme) => {
  // @ts-ignore
  let unbind;
  const listener = () => {
    const newPref = getPreference(values);
    setScheme(newPref.preference);
    pref.matchMedia.removeListener(listener);
    // recursion
    // NOTE: we need to attach a new listener to ensure it fires on next change
    unbind = attachListener(newPref, setScheme);
  };
  pref.matchMedia.addListener(listener);
  return () => {
    // @ts-ignore
    if (unbind) {
      // @ts-ignore
      unbind();
    } else {
      pref.matchMedia.removeListener(listener);
    }
  };
};

// NOTE: outside hook to avoid this value recomputing
const initialPreference = getPreference(values);

export const useColorScheme = (): { scheme: typeof PREFERENCES[keyof typeof PREFERENCES] } => {
  // if (typeof window !== 'undefined' && !('matchMedia' in window)) {
  //   // can not detect
  //   return { scheme: PREFERENCES.NONE };
  // }
  const [scheme, setScheme] = useState(initialPreference ? initialPreference.preference : PREFERENCES.NONE);

  useEffect(() => {
    if (!initialPreference) return;
    return attachListener(initialPreference, setScheme);
  }, []);

  return { scheme };
};
