import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Skeleton, SkeletonContext } from './skeleton';

describe('Skeleton', () => {
  it('draws text as a text bone and hides it from assistive technology', () => {
    render(<Skeleton data-testid='bone'>Chrome on macOS</Skeleton>);

    const bone = screen.getByTestId('bone');
    expect(bone).toHaveClass('cl-skeleton');
    expect(bone).toHaveAttribute('data-text', '');
    expect(bone).not.toHaveAttribute('data-shape');
    expect(bone).toHaveAttribute('aria-hidden', 'true');
    expect(bone).toHaveTextContent('Chrome on macOS');
  });

  it('wraps an element in a block bone with a shape', () => {
    render(
      <Skeleton
        data-testid='bone'
        shape='circle'
      >
        <button type='button'>Edit</button>
      </Skeleton>,
    );

    const bone = screen.getByTestId('bone');
    expect(bone).not.toHaveAttribute('data-text');
    expect(bone).toHaveAttribute('data-shape', 'circle');
    expect(bone.querySelector('button')).not.toBeNull();
  });

  it('renders its children as-is when not shown', () => {
    render(<Skeleton show={false}>Chrome on macOS</Skeleton>);

    expect(screen.getByText('Chrome on macOS')).not.toHaveClass('cl-skeleton');
    expect(document.querySelector('.cl-skeleton')).toBeNull();
  });

  it('follows the nearest skeleton container, and lets show override it', () => {
    render(
      <SkeletonContext.Provider value={false}>
        <Skeleton>Hidden name</Skeleton>
        <Skeleton
          show
          data-testid='forced'
        >
          Forced
        </Skeleton>
      </SkeletonContext.Provider>,
    );

    expect(screen.getByText('Hidden name')).not.toHaveClass('cl-skeleton');
    expect(screen.getByTestId('forced')).toHaveClass('cl-skeleton');
  });

  it('holds space without drawing a bone when not visible', () => {
    render(
      <Skeleton
        data-testid='bone'
        visible={false}
      >
        <button type='button'>Edit</button>
      </Skeleton>,
    );

    expect(screen.getByTestId('bone')).not.toHaveAttribute('data-visible');
  });

  it('takes an explicit size when it has no children', () => {
    render(
      <Skeleton
        data-testid='bone'
        width={48}
        height='1rem'
      />,
    );

    const style = screen.getByTestId('bone').getAttribute('style') ?? '';
    expect(style).toContain('48px');
    expect(style).toContain('1rem');
  });
});
