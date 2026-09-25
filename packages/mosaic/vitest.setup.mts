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
}

afterEach(() => {
  cleanup();
  frames.forEach(timeout => clearTimeout(timeout));
  frames.clear();
});
