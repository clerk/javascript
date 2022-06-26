import { FontFamily } from '@clerk/types';

const GOOGLE_FONTS_API_URL = 'https://fonts.googleapis.com';
const GOOGLE_FONTS_CDN_URL = 'https://fonts.gstatic.com';

/**
 * Fonts that can be safely used without loading
 */
const WEB_SAFE_FONTS = Object.freeze([
  'Arial',
  'Brush Script MT',
  'Courier New',
  'Garamond',
  'Georgia',
  'Helvetica',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
] as const);

export const loadFont = (font: FontFamily | undefined) => {
  if (
    !font ||
    WEB_SAFE_FONTS.includes(font as any) ||
    localFontIsAlreadyLoaded(font) ||
    localFontIsAlreadyRegistered(font)
  ) {
    return;
  }
  loadGoogleFont(font);
};

export const preconnectToGoogleFontsCdn = () => {
  if (!isBrowser()) {
    return;
  }

  if (document.querySelector(`link[rel=preconnect][href='${GOOGLE_FONTS_CDN_URL}']`)) {
    return;
  }

  const createLink = () => {
    const hint = document.createElement('link');
    hint.rel = 'preconnect';
    hint.href = GOOGLE_FONTS_CDN_URL;
    return hint;
  };

  document.head.appendChild(createLink());
  const crossoriginLink = createLink();
  crossoriginLink.setAttribute('crossorigin', '');
  document.head.appendChild(crossoriginLink);
};

const loadGoogleFont = (font: string, weights: string[] = ['400', '500', '600']) => {
  if (!isBrowser()) {
    return;
  }

  const url = new URL(GOOGLE_FONTS_API_URL + '/css2');
  url.searchParams.set('family', weights.length > 0 ? `${font}:wght@${weights.join(';')}` : font);
  url.searchParams.set('display', 'swap');
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url.href;
  link.onerror = () => {};

  if (document.querySelector(`link[rel='${link.rel}'][href='${link.href}'][type='${link.type}']`)) {
    return;
  }

  document.head.appendChild(link);
};

const localFontIsAlreadyRegistered = (str: string) => {
  if (!isBrowser()) {
    return;
  }
  return !![...document.fonts.values()].find(v => v.family === str);
};

const localFontIsAlreadyLoaded = (str: string) => {
  if (!isBrowser()) {
    return;
  }
  return document.fonts.check('1rem ' + str);
};

const isBrowser = () => typeof window !== 'undefined' && typeof window.document !== 'undefined';
