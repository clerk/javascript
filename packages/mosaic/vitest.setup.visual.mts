import { beforeEach } from 'vitest';
import { page } from 'vitest/browser';

import './dist/styles.css';

const styles = document.createElement('style');
styles.textContent = `
  :root {
    color-scheme: light;
    font-family: Arial, sans-serif;
    background: light-dark(white, #171717);
    color: light-dark(black, white);
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
  await document.fonts.ready;
});
