// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import * as Drawer from './parts';

// These render on the server, where `window` does not exist. A part that reads
// `window` during render (rather than in an effect) crashes the whole server
// render, so every drawer configuration must be SSR-safe.
describe('Drawer SSR (no window)', () => {
  it('has no window in this environment', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders a plain drawer on the server', () => {
    expect(() =>
      renderToString(
        <Drawer.Root open>
          <Drawer.Portal>
            <Drawer.Viewport>
              <Drawer.Popup>hi</Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>,
      ),
    ).not.toThrow();
  });

  // Regression: `useSnapPoints` computed the resting offset from `window.innerHeight`
  // during render, which threw `ReferenceError: window is not defined` on the server.
  it('renders a drawer with snapPoints on the server', () => {
    expect(() =>
      renderToString(
        <Drawer.Root
          open
          snapPoints={[0.5, 1]}
        >
          <Drawer.Portal>
            <Drawer.Viewport>
              <Drawer.Popup>hi</Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>,
      ),
    ).not.toThrow();
  });
});
