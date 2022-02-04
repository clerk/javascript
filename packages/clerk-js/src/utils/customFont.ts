import qs from 'qs';

export const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2';

export const WEB_SAFE_FONTS = Object.freeze([
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
]);

export function fontLoader(
  fontFamily: string,
  weights: Array<number | string> = [],
): void {
  fontFamily = fontFamily.replace(/"/g, '');

  const head = document.getElementsByTagName('head')[0];

  // Due to a known bug in document.fonts.check in Firefox and Safari
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1252821
  // we use the following hack to check if a font is already loaded or not
  if (WEB_SAFE_FONTS.includes(fontFamily)) {
    return;
  }

  if (
    !document.querySelector(
      "link[rel=preconnect][href='https://fonts.gstatic.com']",
    )
  ) {
    const hint = document.createElement('link');
    hint.rel = 'preconnect';
    hint.href = 'https://fonts.gstatic.com';
    head.appendChild(hint);
  }

  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href =
    GOOGLE_FONTS_URL +
    qs.stringify(
      {
        family:
          weights.length > 0
            ? `${fontFamily}:wght@${weights.join(';')}`
            : fontFamily,
        display: 'swap',
      },
      {
        addQueryPrefix: true,
      },
    );

  head.appendChild(link);
}
