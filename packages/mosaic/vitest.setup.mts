import '@testing-library/jest-dom/vitest';

import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';

configure({ asyncUtilTimeout: 5000 });

const frames = new Map<number, ReturnType<typeof setTimeout>>();
let nextFrame = 0;

if (typeof window !== 'undefined') {
  window.requestAnimationFrame = callback => {
    const handle = ++nextFrame;
    frames.set(
      handle,
      setTimeout(() => {
        frames.delete(handle);
        callback(performance.now());
      }, 0),
    );
    return handle;
  };

  window.cancelAnimationFrame = handle => {
    clearTimeout(frames.get(handle));
    frames.delete(handle);
  };

  Object.defineProperties(document.documentElement, {
    clientWidth: { configurable: true, value: 1024 },
    clientHeight: { configurable: true, value: 768 },
  });
  Element.prototype.getBoundingClientRect = () => new DOMRect(0, 0, 24, 24);
}

afterEach(() => {
  cleanup();
  frames.forEach(timeout => clearTimeout(timeout));
  frames.clear();
});
