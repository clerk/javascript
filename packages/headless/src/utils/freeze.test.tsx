import { act, cleanup, render, screen } from '@testing-library/react';
import * as React from 'react';
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

  it('holds a state update raised by the subtree itself', () => {
    let bump = () => {};
    function Counter() {
      const [count, setCount] = React.useState(0);
      bump = () => setCount(n => n + 1);
      return <span>count: {count}</span>;
    }

    const { rerender } = render(
      <Freeze frozen={false}>
        <Counter />
      </Freeze>,
    );
    rerender(
      <Freeze frozen>
        <Counter />
      </Freeze>,
    );

    act(() => bump());

    expect(screen.getByText('count: 0')).toBeInTheDocument();
  });

  it('holds a context change read from inside the frozen subtree', () => {
    const NameContext = React.createContext('Acme');
    function Reader() {
      return <span>{React.useContext(NameContext)}</span>;
    }

    const { rerender } = render(
      <NameContext.Provider value='Acme'>
        <Freeze frozen={false}>
          <Reader />
        </Freeze>
      </NameContext.Provider>,
    );
    rerender(
      <NameContext.Provider value='Globex'>
        <Freeze frozen>
          <Reader />
        </Freeze>
      </NameContext.Provider>,
    );

    expect(screen.getByText('Acme')).toBeInTheDocument();
  });
});
