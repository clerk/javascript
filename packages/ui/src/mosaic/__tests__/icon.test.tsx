import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import type { MosaicAppearance } from '../appearance';
import { Icon } from '../components/icon';
import { MosaicProvider } from '../MosaicProvider';

const wrap = (ui: React.ReactElement, appearance?: MosaicAppearance) =>
  render(<MosaicProvider appearance={appearance}>{ui}</MosaicProvider>);

/** Concatenates every inserted Emotion `<style>` rule (whitespace-stripped) for substring assertions. */
const insertedStyles = () =>
  Array.from(document.querySelectorAll('style'))
    .map(el => el.textContent ?? '')
    .join('')
    .replace(/\s+/g, '');

describe('Icon', () => {
  it('renders the default glyph for a known name', () => {
    const { container } = wrap(<Icon name='chevron-right' />);
    const svg = container.querySelector('svg[data-cl-slot="icon"]');
    expect(svg).not.toBeNull();
    expect(svg?.querySelector('path')).not.toBeNull();
  });

  it('renders the override element instead of the default glyph', () => {
    const appearance: MosaicAppearance = {
      icons: { 'chevron-right': <span data-testid='override' /> },
    };
    const { getByTestId, container } = wrap(<Icon name='chevron-right' />, appearance);
    expect(getByTestId('override')).not.toBeNull();
    // The default svg glyph is not rendered when overridden.
    expect(container.querySelector('svg')).toBeNull();
  });

  it('injects Mosaic styling (className) and the slot attr into the override element', () => {
    const appearance: MosaicAppearance = {
      icons: { 'chevron-right': <span data-testid='override' /> },
    };
    const { getByTestId } = wrap(
      <Icon
        name='chevron-right'
        size='lg'
      />,
      appearance,
    );
    const el = getByTestId('override');
    expect(el.className).toBeTruthy();
    expect(el.getAttribute('data-cl-slot')).toBe('icon');
  });

  it("merges the override element's own className with Mosaic's rather than clobbering it", () => {
    const appearance: MosaicAppearance = {
      icons: {
        'chevron-right': (
          <span
            data-testid='override'
            className='consumer-glyph'
          />
        ),
      },
    };
    const { getByTestId } = wrap(<Icon name='chevron-right' />, appearance);
    const el = getByTestId('override');
    expect(el.classList.contains('consumer-glyph')).toBe(true);
    // Mosaic's serialized class is applied alongside the consumer's, not in place of it.
    expect(el.classList.length).toBeGreaterThan(1);
  });

  it('forwards svg props from the Icon call site onto the override element', () => {
    const appearance: MosaicAppearance = {
      icons: { 'chevron-right': <span data-testid='override' /> },
    };
    const { getByTestId } = wrap(
      <Icon
        name='chevron-right'
        aria-label='Next'
      />,
      appearance,
    );
    expect(getByTestId('override').getAttribute('aria-label')).toBe('Next');
  });

  it('applies appearance.elements.icon styling to an overridden glyph (consistent with the built-in)', () => {
    const appearance: MosaicAppearance = {
      elements: { icon: { opacity: 0.5 } },
      icons: { 'chevron-right': <span data-testid='override' /> },
    };
    const { getByTestId } = wrap(<Icon name='chevron-right' />, appearance);
    // The override carries a serialized Mosaic class...
    expect(getByTestId('override').className).toBeTruthy();
    // ...and that class actually applies the appearance.elements.icon styling.
    expect(insertedStyles()).toContain('opacity:0.5');
  });

  it('falls through to the default when a different name is overridden', () => {
    const appearance: MosaicAppearance = {
      icons: { 'chevron-left': <span data-testid='override' /> },
    };
    const { container, queryByTestId } = wrap(<Icon name='chevron-right' />, appearance);
    expect(queryByTestId('override')).toBeNull();
    expect(container.querySelector('svg[data-cl-slot="icon"]')).not.toBeNull();
  });
});
