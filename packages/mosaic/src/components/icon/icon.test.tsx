import * as stylex from '@stylexjs/stylex';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import type { MosaicIconOverrides } from '../../icons/overrides';
import { MosaicProvider } from '../../MosaicProvider';
import { space } from '../../tokens.stylex';
import { Banner } from '../banner';
import { Icon } from './icon';

const containerStyles = stylex.create({
  lineBox: { height: '1lh' },
  mdHeight: { height: space['4'] },
});

const wrap = (ui: React.ReactElement, icons?: MosaicIconOverrides) =>
  render(<MosaicProvider icons={icons}>{ui}</MosaicProvider>);

const override: MosaicIconOverrides = { 'chevron-right': <span data-testid='override' /> };

describe('Mosaic Icon', () => {
  it.each([
    ['neutral', 'information-circle'],
    ['warning', 'exclamation-circle'],
    ['negative', 'exclamation-circle'],
  ] as const)('applies the canonical %s icon override in a banner', (color, name) => {
    const { getByTestId } = wrap(<Banner.Root color={color}>Notice</Banner.Root>, {
      [name]: <svg data-testid='canonical-icon' />,
    });

    expect(getByTestId('canonical-icon')).toHaveClass('cl-icon', 'cl-banner-icon');
    expect(getByTestId('canonical-icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([
    'api',
    'application-2',
    'arrow-bottom-top',
    'arrow-compress',
    'arrow-dots',
    'arrow-down',
    'arrow-down-circle',
    'arrow-down-left',
    'arrow-left',
    'arrow-left-right',
    'arrow-right',
    'arrow-up',
    'arrow-up-circle',
    'arrow-up-left',
    'arrow-up-right',
    'block',
    'bolt',
    'building',
    'calendar',
    'checkmark',
    'checkmark-circle',
    'checkmark-small',
    'chevron-double-left',
    'chevron-double-right',
    'chevron-down',
    'chevron-left',
    'chevron-right',
    'chevron-up',
    'chevron-up-down',
    'clipboard',
    'clock',
    'cloud',
    'cog-6-teeth',
    'columns',
    'credit-card',
    'devices',
    'document',
    'dollar',
    'dotted-square',
    'download',
    'duplicate',
    'ellipsis-horizontal',
    'ellipsis-horizontal-circle',
    'ellipsis-vertical',
    'enterprise-connections',
    'envelope',
    'exclamation-circle',
    'export',
    'eye',
    'eye-slash',
    'face-scan',
    'filter',
    'fingerprint',
    'flag',
    'globe',
    'grip',
    'information-circle',
    'key',
    'link',
    'lock',
    'log-out',
    'magnifying-glass',
    'minus',
    'minus-circle',
    'numbers',
    'passkey-added',
    'pen',
    'phone',
    'plus',
    'question-mark-circle',
    'receipt-bill',
    'rotate-anti-clockwise',
    'rotate-left-right',
    'route',
    'shield',
    'shield-check',
    'shield-close',
    'sidebar',
    'spinner',
    'support',
    'trash',
    'user-circle',
    'user-circle-plus',
    'users',
    'x',
    'x-circle',
  ] as const)('renders the %s icon with scalable, inherited-color artwork', name => {
    const ref = React.createRef<SVGSVGElement>();
    const { container } = wrap(
      <Icon
        name={name}
        ref={ref}
        size='sm'
        aria-label={name}
      />,
    );
    const svg = container.querySelector('svg.cl-icon');

    expect(svg).toHaveAttribute('viewBox', '0 0 16 16');
    expect(svg).toHaveAttribute('data-size', 'sm');
    expect(svg).toHaveAttribute('aria-label', name);
    expect(svg).not.toHaveAttribute('width');
    expect(svg).not.toHaveAttribute('height');
    expect(ref.current).toBe(svg);
    expect(svg?.querySelector('path')).not.toBeNull();
    expect(svg?.querySelector('[fill="currentColor"], [stroke="currentColor"]')).not.toBeNull();
    expect(svg?.querySelector('[id]')).toBeNull();
    for (const element of container.querySelectorAll('[fill], [stroke]')) {
      for (const attribute of ['fill', 'stroke']) {
        const paint = element.getAttribute(attribute);
        if (paint !== null) {
          expect(['none', 'currentColor']).toContain(paint);
        }
      }
    }
  });

  it('renders the API glyph with inherited color and a forwarded ref', () => {
    const ref = React.createRef<SVGSVGElement>();
    const { container } = wrap(
      <Icon
        name='api'
        size='lg'
        aria-label='API'
        ref={ref}
      />,
    );
    const svg = container.querySelector('svg.cl-icon');

    expect(svg).toHaveAttribute('viewBox', '0 0 16 16');
    expect(svg).toHaveAttribute('data-size', 'lg');
    expect(svg).toHaveAttribute('aria-label', 'API');
    expect(svg?.querySelector('[fill="currentColor"], [stroke="currentColor"]')).not.toBeNull();
    expect(ref.current).toBe(svg);
  });

  it('renders the default glyph for a known name', () => {
    const { container } = wrap(<Icon name='chevron-right' />);
    const svg = container.querySelector('svg.cl-icon');
    expect(svg).not.toBeNull();
    expect(svg?.querySelector('path')).not.toBeNull();
  });

  it.each(['security-phone', 'security-lock-square', 'security-passkey'] as const)(
    'renders the %s glyph on its 18px canvas',
    name => {
      const { container } = wrap(<Icon name={name} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('viewBox', '0 0 18 18');
      expect(svg?.querySelector('path')).toHaveAttribute('fill', 'currentColor');
    },
  );

  it.each([
    ['device-phone', ['#646464', '#646464', '#343434', '#575757', 'black', 'black']],
    ['device-laptop', ['black', '#575757', 'black', '#444444', 'black']],
  ] as const)('preserves the supplied %s palette', (name, palette) => {
    const { container } = wrap(<Icon name={name} />);
    const paths = Array.from(container.querySelectorAll('path'));

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 18 18');
    expect(paths.map(path => path.getAttribute('fill'))).toEqual(palette);
  });

  it('applies the default size when none is passed', () => {
    const { container } = wrap(<Icon name='chevron-right' />);
    expect(container.querySelector('svg')).toHaveAttribute('data-size', 'md');
  });

  it('wires the size variant and xstyle atoms through to the element', () => {
    const { container } = wrap(
      <Icon
        name='chevron-right'
        size='lg'
        xstyle={containerStyles.lineBox}
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('data-size', 'lg');
    expect(svg).toHaveClass('cl-icon', stylex.props(containerStyles.lineBox).className ?? '');
  });

  it('lets a container xstyle override the size atoms instead of stacking a second class', () => {
    const { container } = wrap(
      <Icon
        name='chevron-right'
        xstyle={containerStyles.lineBox}
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass(stylex.props(containerStyles.lineBox).className ?? '');
    expect(svg).not.toHaveClass(stylex.props(containerStyles.mdHeight).className ?? '');
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
        xstyle={containerStyles.lineBox}
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
    expect(getByTestId('override')).toHaveClass(
      'cl-icon',
      stylex.props(containerStyles.lineBox).className ?? '',
      'consumer-glyph',
    );
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
