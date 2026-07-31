import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Freeze } from './freeze';

afterEach(() => {
  cleanup();
});

describe('Freeze', () => {
  it('renders children while not frozen', () => {
    render(<Freeze frozen={false}>Acme</Freeze>);

    expect(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('holds the committed DOM when children change while frozen', () => {
    const { rerender } = render(<Freeze frozen={false}>Acme</Freeze>);

    rerender(<Freeze frozen>Globex</Freeze>);

    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.queryByText('Globex')).toBeNull();
  });

  it('keeps the held DOM visible', () => {
    const { rerender } = render(<Freeze frozen={false}>Acme</Freeze>);

    rerender(<Freeze frozen>Globex</Freeze>);

    expect(screen.getByText('Acme')).toBeVisible();
  });

  it('keeps the held DOM visible across further updates while frozen', () => {
    const { rerender } = render(<Freeze frozen={false}>Acme</Freeze>);

    rerender(<Freeze frozen>Globex</Freeze>);
    rerender(<Freeze frozen>Initech</Freeze>);

    expect(screen.getByText('Acme')).toBeVisible();
  });

  it('commits the pending children once unfrozen', () => {
    const { rerender } = render(<Freeze frozen={false}>Acme</Freeze>);

    rerender(<Freeze frozen>Globex</Freeze>);
    rerender(<Freeze frozen={false}>Globex</Freeze>);

    expect(screen.getByText('Globex')).toBeInTheDocument();
    expect(screen.queryByText('Acme')).toBeNull();
  });

  it('holds state updates raised from inside the frozen subtree', () => {
    function Counter({ count }: { count: number }) {
      return <span>count: {count}</span>;
    }

    const { rerender } = render(
      <Freeze frozen={false}>
        <Counter count={0} />
      </Freeze>,
    );

    rerender(
      <Freeze frozen>
        <Counter count={1} />
      </Freeze>,
    );

    expect(screen.getByText('count: 0')).toBeInTheDocument();
  });
});
