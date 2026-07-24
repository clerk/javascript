import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Text, TextContext } from './text';

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
    expect(text).toHaveAttribute('data-intent', 'primary');
  });

  it('wires variant props and consumer className/style through to the element', () => {
    render(
      <Text
        size='lg'
        intent='mutedForeground'
        className='my-text'
        style={{ marginTop: '8px' }}
      >
        Body copy
      </Text>,
    );
    const text = screen.getByText('Body copy');
    expect(text).toHaveAttribute('data-size', 'lg');
    expect(text).toHaveAttribute('data-intent', 'mutedForeground');
    expect(text).toHaveClass('cl-text', 'my-text');
    expect(text).toHaveStyle({ marginTop: '8px' });
  });

  it('renders a different element through the render prop, keeping the slot props', () => {
    render(<Text render={p => <span {...p} />}>Body copy</Text>);
    const text = screen.getByText('Body copy');
    expect(text.tagName).toBe('SPAN');
    expect(text).toHaveClass('cl-text');
    expect(text).toHaveAttribute('data-size', 'sm');
  });

  it('reads defaults from TextContext, with own props winning', () => {
    render(
      <TextContext.Provider value={{ intent: 'mutedForeground', size: 'xs' }}>
        <Text size='base'>Body copy</Text>
      </TextContext.Provider>,
    );
    const text = screen.getByText('Body copy');
    expect(text).toHaveAttribute('data-intent', 'mutedForeground');
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
