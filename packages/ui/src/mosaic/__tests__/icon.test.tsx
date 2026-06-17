import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import type { MosaicAppearance } from '../appearance';
import { Icon } from '../components/icon';
import { MosaicProvider } from '../MosaicProvider';

const wrap = (ui: React.ReactElement, appearance?: MosaicAppearance) =>
  render(<MosaicProvider appearance={appearance}>{ui}</MosaicProvider>);

describe('Icon', () => {
  it('renders the default glyph for a known name', () => {
    const { container } = wrap(<Icon name='chevron-right' />);
    const svg = container.querySelector('svg[data-cl-slot="icon"]');
    expect(svg).not.toBeNull();
    expect(svg?.querySelector('path')).not.toBeNull();
  });

  it('renders the override instead of the default glyph', () => {
    const appearance: MosaicAppearance = {
      icons: { 'chevron-right': props => <span {...props} data-testid='override' /> },
    };
    const { getByTestId, container } = wrap(<Icon name='chevron-right' />, appearance);
    expect(getByTestId('override')).not.toBeNull();
    // The default svg glyph is not rendered when overridden.
    expect(container.querySelector('svg')).toBeNull();
  });

  it('applies Mosaic styling (className) and the slot attr to the override', () => {
    const appearance: MosaicAppearance = {
      icons: { 'chevron-right': props => <span {...props} data-testid='override' /> },
    };
    const { getByTestId } = wrap(<Icon name='chevron-right' size='lg' />, appearance);
    const el = getByTestId('override');
    expect(el.className).toBeTruthy();
    expect(el.getAttribute('data-cl-slot')).toBe('icon');
  });

  it('applies appearance.elements.icon styling to an overridden glyph (consistent with the built-in)', () => {
    const appearance: MosaicAppearance = {
      elements: { icon: { opacity: 0.5 } },
      icons: { 'chevron-right': props => <span {...props} data-testid='override' /> },
    };
    const { getByTestId } = wrap(<Icon name='chevron-right' />, appearance);
    expect(getByTestId('override').className).toBeTruthy();
  });

  it('falls through to the default when a different name is overridden', () => {
    const appearance: MosaicAppearance = {
      icons: { 'chevron-left': props => <span {...props} data-testid='override' /> },
    };
    const { container, queryByTestId } = wrap(<Icon name='chevron-right' />, appearance);
    expect(queryByTestId('override')).toBeNull();
    expect(container.querySelector('svg[data-cl-slot="icon"]')).not.toBeNull();
  });
});
