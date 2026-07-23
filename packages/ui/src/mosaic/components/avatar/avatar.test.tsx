import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Avatar } from './avatar';

describe('Mosaic Avatar', () => {
  it('applies default variants when none are passed', () => {
    render(<Avatar data-testid='avatar'>AC</Avatar>);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('cl-avatar');
    expect(avatar).toHaveAttribute('data-shape', 'circle');
    expect(avatar).toHaveAttribute('data-size', 'md');
    expect(avatar).toHaveTextContent('AC');
  });

  it('reflects shape and size as data attributes', () => {
    render(
      <Avatar
        data-testid='avatar'
        shape='square'
        size='lg'
      >
        AC
      </Avatar>,
    );
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveAttribute('data-shape', 'square');
    expect(avatar).toHaveAttribute('data-size', 'lg');
  });

  it('renders an image when src is provided instead of children', () => {
    render(
      <Avatar
        src='https://example.com/a.png'
        alt='Alex'
      >
        AC
      </Avatar>,
    );
    const img = screen.getByRole('img', { name: 'Alex' });
    expect(img).toHaveAttribute('src', 'https://example.com/a.png');
    expect(screen.queryByText('AC')).not.toBeInTheDocument();
  });

  it('wires consumer className/style through to the element', () => {
    render(
      <Avatar
        data-testid='avatar'
        className='my-avatar'
        style={{ marginTop: '8px' }}
      >
        AC
      </Avatar>,
    );
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('cl-avatar', 'my-avatar');
    expect(avatar).toHaveStyle({ marginTop: '8px' });
  });

  it('forwards arbitrary props and the ref', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Avatar
        ref={ref}
        data-testid='avatar'
        aria-label='User avatar'
      >
        AC
      </Avatar>,
    );
    const avatar = screen.getByTestId('avatar');
    expect(ref.current).toBe(avatar);
    expect(avatar).toHaveAttribute('aria-label', 'User avatar');
  });
});
