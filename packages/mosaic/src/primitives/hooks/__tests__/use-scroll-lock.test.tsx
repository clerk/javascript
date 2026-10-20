import { cleanup, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { Dialog } from '../../dialog';
import { Drawer } from '../../drawer';
import { Select } from '../../select';

const overlays: Array<[string, (open: boolean) => ReactElement]> = [
  [
    'dialog',
    open => (
      <Dialog.Root open={open}>
        <Dialog.Portal>
          <Dialog.Viewport>
            <Dialog.Popup initialFocus={false}>
              <div data-testid='content' />
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    ),
  ],
  [
    'drawer',
    open => (
      <Drawer.Root open={open}>
        <Drawer.Portal>
          <Drawer.Viewport>
            <Drawer.Popup>
              <div data-testid='content' />
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    ),
  ],
  [
    'select',
    open => (
      <Select.Root open={open}>
        <Select.Trigger />
        <Select.Portal>
          <Select.Positioner>
            <Select.Popup>
              <div data-testid='content' />
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    ),
  ],
];

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(document.documentElement, 'clientWidth');
  document.documentElement.removeAttribute('style');
  document.body.removeAttribute('style');
});

describe.each(overlays)('%s scroll lock', (_name, renderOverlay) => {
  it('locks the page and keeps the scrollbar gutter, then restores both on close', async () => {
    showScrollbar(15);
    const { rerender } = render(renderOverlay(true));
    await screen.findByTestId('content');

    expect(document.body.style.overflowY).toBe('hidden');
    expect(document.documentElement.style.scrollbarGutter).toBe('stable');

    rerender(renderOverlay(false));

    expect(document.body.style.cssText).toBe('');
    expect(document.documentElement.style.cssText).toBe('');
  });

  it('locks the page without reserving a gutter when the page shows no scrollbar', async () => {
    showScrollbar(0);
    const { rerender } = render(renderOverlay(true));
    await screen.findByTestId('content');

    expect(document.body.style.overflowY).toBe('hidden');
    expect(document.documentElement.style.scrollbarGutter).toBe('');

    rerender(renderOverlay(false));

    expect(document.body.style.cssText).toBe('');
  });

  it('locks <html> instead of <body> when <html> is the element that scrolls', async () => {
    document.documentElement.style.overflowY = 'auto';
    const { rerender } = render(renderOverlay(true));
    await screen.findByTestId('content');

    expect(document.documentElement.style.overflowY).toBe('hidden');
    expect(document.body.style.overflowY).toBe('');

    rerender(renderOverlay(false));

    expect(document.documentElement.style.overflowY).toBe('auto');
  });

  it('leaves a lock another library already holds alone', async () => {
    document.body.style.overflowY = 'hidden';
    const { rerender } = render(renderOverlay(true));
    await screen.findByTestId('content');

    expect(document.documentElement.style.scrollbarGutter).toBe('');

    rerender(renderOverlay(false));

    expect(document.body.style.overflowY).toBe('hidden');
  });
});

describe('select in a dialog', () => {
  it('unlocks the page once the dialog closes', async () => {
    function App(props: { open: boolean }) {
      return (
        <Dialog.Root open={props.open}>
          <Dialog.Portal>
            <Dialog.Viewport>
              <Dialog.Popup initialFocus={false}>{overlays[2][1](props.open)}</Dialog.Popup>
            </Dialog.Viewport>
          </Dialog.Portal>
        </Dialog.Root>
      );
    }
    const { rerender } = render(<App open />);
    await screen.findByTestId('content');

    expect(document.body.style.overflowY).toBe('hidden');

    rerender(<App open={false} />);

    expect(document.body.style.cssText).toBe('');
  });
});

function showScrollbar(width: number): void {
  Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    value: window.innerWidth - width,
  });
}
