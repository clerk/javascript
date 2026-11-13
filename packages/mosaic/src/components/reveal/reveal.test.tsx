import * as stylex from '@stylexjs/stylex';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Reveal } from './reveal';

const atoms = stylex.create({
  spaced: { marginTop: '8px' },
});

const restores: Array<() => void> = [];

afterEach(() => {
  restores.splice(0).forEach(restore => restore());
});

function holdAnimations() {
  let finish = () => undefined as void;
  const finished = new Promise<void>(resolve => {
    finish = resolve;
  });
  const getAnimations = vi.fn(() => [{ finished }]);
  const original = Object.getOwnPropertyDescriptor(Element.prototype, 'getAnimations');
  Object.defineProperty(Element.prototype, 'getAnimations', { configurable: true, value: getAnimations });
  restores.push(() => {
    if (original) {
      Object.defineProperty(Element.prototype, 'getAnimations', original);
    } else {
      Reflect.deleteProperty(Element.prototype, 'getAnimations');
    }
  });
  return async () => {
    getAnimations.mockReturnValue([]);
    await act(async () => {
      finish();
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  };
}

async function nextFrame() {
  await act(async () => {
    await new Promise(resolve => requestAnimationFrame(resolve));
  });
}

describe('Mosaic Reveal', () => {
  it('renders no children while closed on mount', () => {
    render(
      <Reveal
        open={false}
        data-testid='reveal'
      >
        Details
      </Reveal>,
    );
    expect(screen.getByTestId('reveal')).toBeInTheDocument();
    expect(screen.queryByText('Details')).toBeNull();
  });

  it('renders its children without an enter animation when mounted open', () => {
    render(
      <Reveal
        open
        data-testid='reveal'
      >
        Details
      </Reveal>,
    );
    const root = screen.getByTestId('reveal');
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(root).toHaveAttribute('data-open');
    expect(root).not.toHaveAttribute('data-starting-style');
    expect(root.style.transition).toBe('');
  });

  it('enters from the starting style when opened after mount', () => {
    const { rerender } = render(
      <Reveal
        open={false}
        data-testid='reveal'
      >
        Details
      </Reveal>,
    );
    rerender(
      <Reveal
        open
        data-testid='reveal'
      >
        Details
      </Reveal>,
    );
    const root = screen.getByTestId('reveal');
    expect(root).toHaveAttribute('data-open');
    expect(root).toHaveAttribute('data-starting-style');
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('holds the last children, inert, through the exit, then unmounts them', async () => {
    const finish = holdAnimations();
    const { rerender } = render(
      <Reveal
        open
        data-testid='reveal'
      >
        <span>Old</span>
      </Reveal>,
    );
    await nextFrame();
    const root = screen.getByTestId('reveal');
    expect(screen.getByText('Old').closest('[inert]')).toBeNull();

    rerender(
      <Reveal
        open={false}
        data-testid='reveal'
      >
        <span>New</span>
      </Reveal>,
    );
    expect(root).toHaveAttribute('data-ending-style');
    expect(root).not.toHaveAttribute('data-open');
    expect(screen.getByText('Old').closest('[inert]')).not.toBeNull();
    expect(screen.queryByText('New')).toBeNull();

    await finish();
    expect(screen.queryByText('Old')).toBeNull();
    expect(screen.queryByText('New')).toBeNull();
    expect(root).toBeInTheDocument();
  });

  it('carries the slot class, merges xstyle and forwards the ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Reveal
        ref={ref}
        open
        data-testid='reveal'
        xstyle={atoms.spaced}
      >
        Details
      </Reveal>,
    );
    const root = screen.getByTestId('reveal');
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('cl-reveal', stylex.props(atoms.spaced).className ?? '');
  });
});
