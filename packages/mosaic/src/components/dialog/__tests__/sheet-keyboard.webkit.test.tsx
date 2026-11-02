import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { Card } from '../../card';
import { Dialog } from '../dialog';

const KEYBOARD = 336;

class FakeViewport extends EventTarget {
  width = window.innerWidth;
  height = window.innerHeight;
  offsetTop = 0;
  offsetLeft = 0;
  scale = 1;
}

let viewport: FakeViewport;

beforeEach(async () => {
  await page.viewport(375, 667);
  viewport = new FakeViewport();
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
});

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, 'visualViewport');
});

describe('sheet with the on-screen keyboard in WebKit', () => {
  it.each([0, 150])('keeps the title and the actions reachable in the visible band (pan %ipx)', async pan => {
    render(<Sheet spacer={500} />);
    await settle();

    await keyboard({ open: true, pan });

    expectReachable();
  });

  it('keeps the title and the actions reachable when the content grows with the keyboard up', async () => {
    const { rerender } = render(<Sheet spacer={0} />);
    await settle();
    await keyboard({ open: true, pan: 150 });

    rerender(<Sheet spacer={400} />);
    await settle();

    expectReachable();
  });

  it('scrolls the focused field above the keyboard once it opens', async () => {
    render(<Sheet spacer={500} />);
    await settle();
    const field = screen.getByRole('textbox', { name: 'New' });
    field.focus({ preventScroll: true });

    await keyboard({ open: true });

    await expect.poll(() => field.getBoundingClientRect().bottom).toBeLessThanOrEqual(band().bottom);
    expect(field.getBoundingClientRect().top).toBeGreaterThanOrEqual(band().top);
  });

  it('leaves the sheet alone when a pinch zoom shrinks the visible band', async () => {
    render(<Sheet spacer={0} />);
    await settle();

    viewport.scale = 2;
    await keyboard({ open: true });

    expect(getComputedStyle(document.documentElement).getPropertyValue('--_cl-keyboard-inset')).toBe('0px');
  });
});

function Sheet({ spacer }: { spacer: number }) {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Popup>
        <Card.Root elevation='overlay'>
          <Card.Header>
            <Card.Title>Change password</Card.Title>
          </Card.Header>
          <input aria-label='Current' />
          <div style={{ height: spacer }} />
          <input aria-label='New' />
          <button type='submit'>Save</button>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

async function keyboard({ open, pan = 0 }: { open: boolean; pan?: number }) {
  viewport.height = window.innerHeight - (open ? KEYBOARD : 0);
  viewport.offsetTop = pan;
  viewport.dispatchEvent(new Event('resize'));
  viewport.dispatchEvent(new Event('scroll'));
  await settle();
}

async function settle() {
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
  await Promise.all(document.getAnimations().map(animation => animation.finished));
}

function band() {
  return { top: viewport.offsetTop, bottom: viewport.offsetTop + viewport.height };
}

function expectReachable() {
  const popup = document.querySelector('.cl-dialog-popup');
  expect(popup).toBeInstanceOf(HTMLElement);
  if (!(popup instanceof HTMLElement)) {
    return;
  }
  popup.scrollTop = 0;
  expect(screen.getByText('Change password').getBoundingClientRect().top).toBeGreaterThanOrEqual(band().top);
  popup.scrollTop = popup.scrollHeight;
  expect(screen.getByRole('button', { name: 'Save' }).getBoundingClientRect().bottom).toBeLessThanOrEqual(
    band().bottom,
  );
}
