import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { VisuallyHidden } from './visually-hidden';

describe('Mosaic VisuallyHidden', () => {
  it('renders a span with its children', () => {
    render(<VisuallyHidden>Saved</VisuallyHidden>);
    const hidden = screen.getByText('Saved');
    expect(hidden.tagName).toBe('SPAN');
    expect(hidden).toHaveClass('cl-visually-hidden');
  });

  it('renders a different element through the render prop, keeping the slot props', () => {
    render(<VisuallyHidden render={props => <div {...props} />}>Saved</VisuallyHidden>);
    const hidden = screen.getByText('Saved');
    expect(hidden.tagName).toBe('DIV');
    expect(hidden).toHaveClass('cl-visually-hidden');
  });

  it('clones an element passed to the render prop, keeping the slot props', () => {
    render(<VisuallyHidden render={<h1 lang='en' />}>Saved</VisuallyHidden>);
    const hidden = screen.getByRole('heading', { name: 'Saved' });
    expect(hidden).toHaveClass('cl-visually-hidden');
    expect(hidden).toHaveAttribute('lang', 'en');
  });

  it('forwards arbitrary props and the ref', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <VisuallyHidden
        ref={ref}
        role='status'
        aria-live='polite'
        className='my-hidden'
      >
        Saved
      </VisuallyHidden>,
    );
    const hidden = screen.getByRole('status');
    expect(ref.current).toBe(hidden);
    expect(hidden).toHaveAttribute('aria-live', 'polite');
    expect(hidden).toHaveClass('cl-visually-hidden', 'my-hidden');
  });
});
