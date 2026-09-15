import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Text, TextContext } from './text';

const atoms = stylex.create({
  spaced: { marginTop: '8px' },
});

describe('Mosaic Text', () => {
  it('renders a p with its children', () => {
    render(<Text>Body copy</Text>);
    const text = screen.getByText('Body copy');
    expect(text.tagName).toBe('P');
  });

  it('applies default variants when none are passed', () => {
    render(<Text>Body copy</Text>);
    const text = screen.getByText('Body copy');
    expect(text).toHaveClass('cl-text');
    expect(text).toHaveAttribute('data-size', 'sm');
    expect(text).toHaveAttribute('data-color', 'primary');
  });

  it('wires variant props and xstyle atoms through to the element', () => {
    render(
      <Text
        size='lg'
        color='neutral'
        xstyle={atoms.spaced}
      >
        Body copy
      </Text>,
    );
    const text = screen.getByText('Body copy');
    expect(text).toHaveAttribute('data-size', 'lg');
    expect(text).toHaveAttribute('data-color', 'neutral');
    expect(text).toHaveClass('cl-text', stylex.props(atoms.spaced).className ?? '');
  });

  it('merges a className carried by the render element instead of clobbering the slot class', () => {
    render(<Text render={<span className='from-source' />}>Body copy</Text>);
    expect(screen.getByText('Body copy')).toHaveClass('cl-text', 'from-source');
  });

  it('renders a different element through the render prop, keeping the slot props', () => {
    render(<Text render={p => <span {...p} />}>Body copy</Text>);
    const text = screen.getByText('Body copy');
    expect(text.tagName).toBe('SPAN');
    expect(text).toHaveClass('cl-text');
    expect(text).toHaveAttribute('data-size', 'sm');
  });

  it('clones an element passed to the render prop, keeping the slot props', () => {
    render(<Text render={<span lang='en' />}>Body copy</Text>);
    const text = screen.getByText('Body copy');
    expect(text.tagName).toBe('SPAN');
    expect(text).toHaveClass('cl-text');
    expect(text).toHaveAttribute('data-size', 'sm');
    expect(text).toHaveAttribute('lang', 'en');
  });

  it('reads defaults from TextContext, with own props winning', () => {
    render(
      <TextContext.Provider value={{ color: 'neutral', size: 'xs' }}>
        <Text size='base'>Body copy</Text>
      </TextContext.Provider>,
    );
    const text = screen.getByText('Body copy');
    expect(text).toHaveAttribute('data-color', 'neutral');
    expect(text).toHaveAttribute('data-size', 'base');
  });

  it('forwards arbitrary props and the ref', () => {
    const ref = React.createRef<HTMLParagraphElement>();
    render(
      <Text
        ref={ref}
        role='alert'
      >
        Body copy
      </Text>,
    );
    const text = screen.getByRole('alert');
    expect(ref.current).toBe(text);
  });
});
