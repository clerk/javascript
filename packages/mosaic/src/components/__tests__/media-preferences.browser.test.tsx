import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type {} from '@vitest/browser-playwright';
import { afterEach, describe, expect, it } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';

import { Button } from '../button';
import { Drawer } from '../drawer';

afterEach(async () => {
  cleanup();
  await cdp().send('Emulation.setEmulatedMedia', { features: [] });
  await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false });
});

describe('on a device without hover', () => {
  it('a link button shows no underline after the pointer lands on it', async () => {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
    expect(matchMedia('(hover: hover)').matches).toBe(false);
    render(<Button variant='link'>Learn more</Button>);
    const button = screen.getByRole('button', { name: 'Learn more' });

    await userEvent.hover(button);

    expect(getComputedStyle(button).textDecorationColor).toBe('rgba(0, 0, 0, 0)');
  });
});

describe('with reduced motion', () => {
  it('opens the drawer at its resting position from the first frame', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    const startingTranslates: string[] = [];
    const observer = new MutationObserver(() => {
      const popup = document.querySelector<HTMLElement>('.cl-drawer-popup[data-starting-style]');
      if (popup) {
        startingTranslates.push(getComputedStyle(popup).translate);
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true });

    render(
      <Drawer.Root>
        <Drawer.Trigger>Open</Drawer.Trigger>
        <Drawer.Popup>
          <Drawer.Title>Filters</Drawer.Title>
        </Drawer.Popup>
      </Drawer.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const sheet = await screen.findByRole('dialog', { name: 'Filters' });
    await waitFor(() => expect(sheet).not.toHaveAttribute('data-starting-style'));
    observer.disconnect();

    expect(startingTranslates.length).toBeGreaterThan(0);
    expect(new Set(startingTranslates)).toEqual(new Set([getComputedStyle(sheet).translate]));
  });
});
