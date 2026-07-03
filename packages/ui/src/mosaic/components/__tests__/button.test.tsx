import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import type { MosaicAppearance } from '../../appearance';
import { MosaicProvider } from '../../MosaicProvider';
import { Button } from '../button';

/** Concatenates every inserted Emotion `<style>` rule (whitespace-stripped) for substring assertions. */
function insertedStyles(): string {
  return Array.from(document.querySelectorAll('style'))
    .map(el => el.textContent ?? '')
    .join('')
    .replace(/\s+/g, '');
}

describe('Mosaic Button', () => {
  it('emits data-cl-slot="button"', () => {
    render(
      <MosaicProvider>
        <Button>Hi</Button>
      </MosaicProvider>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-cl-slot', 'button');
  });

  it('exposes the size variant as data-cl-size so consumers can target it', () => {
    render(
      <MosaicProvider>
        <Button size='sm'>Small</Button>
        <Button size='md'>Medium</Button>
      </MosaicProvider>,
    );
    const [small, medium] = screen.getAllByRole('button');
    expect(small).toHaveAttribute('data-cl-size', 'sm');
    expect(medium).toHaveAttribute('data-cl-size', 'md');
  });

  it('reflects disabled as both the native attribute and data-cl-disabled', () => {
    render(
      <MosaicProvider>
        <Button disabled>Hi</Button>
      </MosaicProvider>,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-cl-disabled', '');
  });

  it('omits data-cl-disabled when enabled', () => {
    render(
      <MosaicProvider>
        <Button>Hi</Button>
      </MosaicProvider>,
    );
    expect(screen.getByRole('button')).not.toHaveAttribute('data-cl-disabled');
  });

  it('lets a scoped appearance override beat the global one', () => {
    const appearance: MosaicAppearance = {
      elements: {
        button: { color: 'rgb(0,255,0)' },
        signIn: { button: { color: 'rgb(255,0,0)' } },
      },
    };
    render(
      <MosaicProvider
        appearance={appearance}
        scope='signIn'
      >
        <Button>Hi</Button>
      </MosaicProvider>,
    );
    const styles = insertedStyles();
    expect(styles).toContain('color:rgb(255,0,0)'); // scoped red wins
    expect(styles).not.toContain('color:rgb(0,255,0)'); // global green never applied
  });

  it('applies a state-scoped appearance override via the nested attr selector', () => {
    const appearance: MosaicAppearance = {
      elements: { button: { '&[data-cl-disabled]': { opacity: 0.4 } } },
    };
    render(
      <MosaicProvider appearance={appearance}>
        <Button disabled>Hi</Button>
      </MosaicProvider>,
    );
    expect(insertedStyles()).toContain('[data-cl-disabled]{opacity:0.4');
  });

  it('degrades without an appearance: still emits the slot and pure recipe styles', () => {
    render(
      <MosaicProvider>
        <Button>Hi</Button>
      </MosaicProvider>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-cl-slot', 'button');
    expect(insertedStyles()).toContain('display:inline-flex');
  });
});
