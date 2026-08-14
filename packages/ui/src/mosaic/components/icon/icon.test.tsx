import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import type { MosaicIconOverrides } from '../../icons/overrides';
import { MosaicProvider } from '../../MosaicProvider';
import { Icon } from './icon';

const wrap = (ui: React.ReactElement, icons?: MosaicIconOverrides) =>
  render(<MosaicProvider icons={icons}>{ui}</MosaicProvider>);

const override: MosaicIconOverrides = { 'chevron-right': <span data-testid='override' /> };

describe('Mosaic Icon', () => {
  it('renders the default glyph for a known name', () => {
    const { container } = wrap(<Icon name='chevron-right' />);
    const svg = container.querySelector('svg.cl-icon');
    expect(svg).not.toBeNull();
    expect(svg?.querySelector('path')).not.toBeNull();
  });

  it('applies the default size when none is passed', () => {
    const { container } = wrap(<Icon name='chevron-right' />);
    expect(container.querySelector('svg')).toHaveAttribute('data-size', 'md');
  });

  it('wires the size variant and consumer className/style through to the element', () => {
    const { container } = wrap(
      <Icon
        name='chevron-right'
        size='lg'
        className='my-icon'
        style={{ marginTop: '8px' }}
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('data-size', 'lg');
    expect(svg).toHaveClass('cl-icon', 'my-icon');
    expect(svg).toHaveStyle({ marginTop: '8px' });
  });

  it('emits no placement attribute when the icon is not placed', () => {
    const { container } = wrap(<Icon name='chevron-right' />);
    expect(container.querySelector('svg')).not.toHaveAttribute('data-icon');
  });

  it('reflects placement as data-icon so a container can select on it', () => {
    const { container } = wrap(
      <Icon
        name='chevron-right'
        placement='inline-end'
      />,
    );
    expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'inline-end');
  });

  it('does not leak the placement prop itself to the DOM', () => {
    const { container } = wrap(
      <Icon
        name='chevron-right'
        placement='inline-start'
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('data-icon', 'inline-start');
    expect(svg).not.toHaveAttribute('placement');
  });

  it('reflects placement on an override element too', () => {
    const { getByTestId } = wrap(
      <Icon
        name='chevron-right'
        placement='inline-end'
      />,
      override,
    );
    expect(getByTestId('override')).toHaveAttribute('data-icon', 'inline-end');
  });

  it('renders the override element instead of the default glyph', () => {
    const { getByTestId, container } = wrap(<Icon name='chevron-right' />, override);
    expect(getByTestId('override')).not.toBeNull();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('applies the same slot class and size variant to an override as to the built-in glyph', () => {
    const { getByTestId } = wrap(
      <Icon
        name='chevron-right'
        size='lg'
      />,
      override,
    );
    const el = getByTestId('override');
    expect(el).toHaveClass('cl-icon');
    expect(el).toHaveAttribute('data-size', 'lg');
  });

  it("merges the override element's own className rather than clobbering it", () => {
    const { getByTestId } = wrap(
      <Icon
        name='chevron-right'
        className='call-site'
      />,
      {
        'chevron-right': (
          <span
            data-testid='override'
            className='consumer-glyph'
          />
        ),
      },
    );
    expect(getByTestId('override')).toHaveClass('cl-icon', 'call-site', 'consumer-glyph');
  });

  it('forwards svg props from the Icon call site onto the override element', () => {
    const { getByTestId } = wrap(
      <Icon
        name='chevron-right'
        aria-label='Next'
      />,
      override,
    );
    expect(getByTestId('override')).toHaveAttribute('aria-label', 'Next');
  });

  it('falls through to the default when a different name is overridden', () => {
    const { container, queryByTestId } = wrap(<Icon name='chevron-right' />, {
      'chevron-left': <span data-testid='override' />,
    });
    expect(queryByTestId('override')).toBeNull();
    expect(container.querySelector('svg.cl-icon')).not.toBeNull();
  });

  it('forwards arbitrary props and the ref to the built-in glyph', () => {
    const ref = React.createRef<SVGSVGElement>();
    const { container } = wrap(
      <Icon
        ref={ref}
        name='chevron-right'
        aria-label='Next'
      />,
    );
    const svg = container.querySelector('svg');
    expect(ref.current).toBe(svg);
    expect(svg).toHaveAttribute('aria-label', 'Next');
  });
});
