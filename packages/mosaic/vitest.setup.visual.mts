import { beforeEach } from 'vitest';
import { page } from 'vitest/browser';

import './dist/styles.css';

const styles = document.createElement('style');
styles.textContent = `
  @font-face {
    font-family: 'Inter Visual';
    src: url('/fonts/InterVariable.woff2') format('woff2');
    font-style: normal;
    font-weight: 100 900;
  }
  :root {
    color-scheme: light;
    font-family: 'Inter Visual', sans-serif;
    background: light-dark(white, #171717);
    color: light-dark(black, white);
  }
  *, *::before, *::after {
    caret-color: transparent !important;
  }
  body {
    margin: 0;
    padding: 24px;
  }
`;
document.head.append(styles);

beforeEach(async () => {
  document.documentElement.style.colorScheme = 'light';
  await page.viewport(1280, 900);
  for (const weight of [400, 500, 600]) {
    const faces = await document.fonts.load(`${weight} 16px "Inter Visual"`);
    if (faces.length === 0) {
      throw new Error(`Inter Visual ${weight} failed to load`);
    }
  }
  await document.fonts.ready;
});
