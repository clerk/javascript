import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AvatarButton } from './avatar-button';

describe('AvatarButton', () => {
  it('renders an accessible avatar action with a stable edit treatment', () => {
    render(
      <AvatarButton
        imageUrl='avatar.png'
        name='Ada Lovelace'
      />,
    );

    const button = screen.getByRole('button', { name: 'Edit profile picture' });
    expect(button).toHaveClass('cl-avatar-button');
    expect(button).toHaveAttribute('data-shape', 'circle');
    expect(button).toHaveAttribute('data-size', 'lg');
    expect(button.querySelector('.cl-avatar')).toHaveAttribute('aria-hidden', 'true');
    expect(button.querySelector('.cl-avatar-button-edit-surface')).not.toBeNull();
  });

  it('derives fallback initials and forwards button behavior', () => {
    const onClick = vi.fn();
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <AvatarButton
        ref={ref}
        name='Ada Lovelace'
        onClick={onClick}
      />,
    );

    expect(screen.getByText('AL')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit profile picture' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
