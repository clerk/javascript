import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Icon } from './icon';
import { IconFrame } from './icon-frame';

const atoms = stylex.create({
  tinted: { backgroundColor: 'rgb(255, 0, 0)' },
});

describe('Mosaic IconFrame', () => {
  it('renders its children in a span by default', () => {
    render(<IconFrame>Framed</IconFrame>);
    const frame = screen.getByText('Framed');
    expect(frame.tagName).toBe('SPAN');
    expect(frame).toHaveClass('cl-icon-frame');
    expect(frame).toHaveAttribute('data-bordered', '');
    expect(frame).not.toHaveAttribute('data-filled');
    expect(frame).toHaveAttribute('data-size', 'xl');
  });

  it('reflects its treatment and size', () => {
    render(
      <IconFrame
        bordered={false}
        filled
        size='sm'
      >
        Framed
      </IconFrame>,
    );
    const frame = screen.getByText('Framed');
    expect(frame).not.toHaveAttribute('data-bordered');
    expect(frame).toHaveAttribute('data-filled', '');
    expect(frame).toHaveAttribute('data-size', 'sm');
  });

  it('composes with an Icon', () => {
    const { container } = render(
      <IconFrame>
        <Icon name='check' />
      </IconFrame>,
    );
    const frame = container.querySelector('.cl-icon-frame');
    expect(frame).toContainElement(container.querySelector('svg.cl-icon'));
  });

  it('forwards native span props and the ref', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <IconFrame
        ref={ref}
        data-testid='frame'
        aria-label='Status icon'
      />,
    );
    const frame = screen.getByTestId('frame');
    expect(ref.current).toBe(frame);
    expect(frame).toHaveAttribute('aria-label', 'Status icon');
  });

  it('merges xstyle atoms after the slot atoms', () => {
    render(
      <IconFrame
        data-testid='frame'
        xstyle={atoms.tinted}
      />,
    );
    const frame = screen.getByTestId('frame');
    expect(frame).toHaveClass('cl-icon-frame', stylex.props(atoms.tinted).className ?? '');
  });

  it('merges a className carried by the render element instead of clobbering the slot class', () => {
    render(
      <IconFrame
        data-testid='frame'
        render={<div className='from-source' />}
      />,
    );
    expect(screen.getByTestId('frame')).toHaveClass('cl-icon-frame', 'from-source');
  });

  it('renders a custom element via render, keeping styles and props', () => {
    render(
      <IconFrame
        data-testid='frame'
        // eslint-disable-next-line jsx-a11y/anchor-has-content -- IconFrame injects the children into the rendered anchor.
        render={<a href='/status' />}
      >
        Status
      </IconFrame>,
    );
    const frame = screen.getByRole('link', { name: 'Status' });
    expect(frame.tagName).toBe('A');
    expect(frame).toHaveAttribute('href', '/status');
    expect(frame).toHaveAttribute('data-testid', 'frame');
    expect(frame).toHaveClass('cl-icon-frame');
  });
});
