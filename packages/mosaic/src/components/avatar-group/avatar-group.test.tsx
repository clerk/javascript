import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Avatar } from '../avatar';
import { AvatarGroup } from '.';

function Member({ size }: { size?: 'xs' | 'lg' }) {
  return (
    <Avatar.Root
      data-testid='member'
      size={size}
    >
      <Avatar.Fallback>AB</Avatar.Fallback>
    </Avatar.Root>
  );
}

describe('Mosaic AvatarGroup', () => {
  it('renders a group that reflects its size and shape', () => {
    render(
      <AvatarGroup.Root
        aria-label='Members'
        size='sm'
        shape='square'
      >
        <Member />
      </AvatarGroup.Root>,
    );
    const group = screen.getByRole('group', { name: 'Members' });
    expect(group).toHaveClass('cl-avatar-group');
    expect(group).toHaveAttribute('data-size', 'sm');
    expect(group).toHaveAttribute('data-shape', 'square');
  });

  it('defaults to medium circles', () => {
    render(
      <AvatarGroup.Root aria-label='Members'>
        <Member />
      </AvatarGroup.Root>,
    );
    const group = screen.getByRole('group', { name: 'Members' });
    expect(group).toHaveAttribute('data-size', 'md');
    expect(group).toHaveAttribute('data-shape', 'circle');
  });

  it('sets the default size and shape of every avatar inside it', () => {
    render(
      <AvatarGroup.Root
        size='sm'
        shape='square'
      >
        <Member />
        <Member />
      </AvatarGroup.Root>,
    );
    for (const member of screen.getAllByTestId('member')) {
      expect(member).toHaveAttribute('data-size', 'sm');
      expect(member).toHaveAttribute('data-shape', 'square');
    }
  });

  it('lets an avatar’s own size win over the group default', () => {
    render(
      <AvatarGroup.Root size='sm'>
        <Member size='lg' />
      </AvatarGroup.Root>,
    );
    expect(screen.getByTestId('member')).toHaveAttribute('data-size', 'lg');
  });

  it('shows the overflow count, named for assistive tech', () => {
    render(
      <AvatarGroup.Root
        size='sm'
        shape='square'
      >
        <Member />
        <AvatarGroup.Overflow count={3} />
      </AvatarGroup.Root>,
    );
    const overflow = screen.getByRole('img', { name: '3 more' });
    expect(overflow).toHaveTextContent('+3');
    expect(overflow).toHaveClass('cl-avatar-group-overflow');
    expect(overflow).toHaveAttribute('data-size', 'sm');
    expect(overflow).toHaveAttribute('data-shape', 'square');
  });

  it('takes a label template and custom content for the overflow', () => {
    render(
      <AvatarGroup.Root>
        <AvatarGroup.Overflow
          count={12}
          label='{count} other members'
        >
          12+
        </AvatarGroup.Overflow>
      </AvatarGroup.Root>,
    );
    expect(screen.getByRole('img', { name: '12 other members' })).toHaveTextContent('12+');
  });

  it('renders no overflow when nothing is left over', () => {
    render(
      <AvatarGroup.Root>
        <Member />
        <AvatarGroup.Overflow count={0} />
      </AvatarGroup.Root>,
    );
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    expect(document.querySelector('.cl-avatar-group-overflow')).toBeNull();
  });

  it('composes the overflow onto a button', () => {
    render(
      <AvatarGroup.Root>
        <Member />
        <AvatarGroup.Overflow
          count={5}
          render={<button type='button' />}
        />
      </AvatarGroup.Root>,
    );
    const button = screen.getByRole('button', { name: '5 more' });
    expect(button).toHaveClass('cl-avatar-group-overflow');
    expect(button).toHaveTextContent('+5');
  });

  it('throws when the overflow is rendered outside <AvatarGroup.Root>', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AvatarGroup.Overflow count={2} />)).toThrow(/must be rendered inside <AvatarGroup.Root>/);
  });

  it('forwards its ref to the group element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <AvatarGroup.Root
        ref={ref}
        aria-label='Members'
      >
        <Member />
      </AvatarGroup.Root>,
    );
    expect(ref.current).toBe(screen.getByRole('group', { name: 'Members' }));
  });
});
