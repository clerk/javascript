import { act, cleanup, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { Freeze, useFrozenValue, useIsFrozen } from './freeze';

afterEach(() => {
  cleanup();
});

describe('Freeze', () => {
  it('renders children while not frozen', () => {
    render(<Freeze frozen={false}>Acme</Freeze>);

    expect(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('holds the last unfrozen children when they change while frozen', () => {
    const { rerender } = render(<Freeze frozen={false}>Acme</Freeze>);

    rerender(<Freeze frozen>Globex</Freeze>);

    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.queryByText('Globex')).toBeNull();
  });

  it('keeps holding across further updates while frozen', () => {
    const { rerender } = render(<Freeze frozen={false}>Acme</Freeze>);

    rerender(<Freeze frozen>Globex</Freeze>);
    rerender(<Freeze frozen>Initech</Freeze>);

    expect(screen.getByText('Acme')).toBeVisible();
  });

  it('renders the pending children once unfrozen', () => {
    const { rerender } = render(<Freeze frozen={false}>Acme</Freeze>);

    rerender(<Freeze frozen>Globex</Freeze>);
    rerender(<Freeze frozen={false}>Globex</Freeze>);

    expect(screen.getByText('Globex')).toBeInTheDocument();
    expect(screen.queryByText('Acme')).toBeNull();
  });

  it('holds children that render to nothing once closed', () => {
    function Harness({ item }: { item: string | null }) {
      return <Freeze frozen={item === null}>{item ? <span>{item}</span> : null}</Freeze>;
    }
    const { rerender } = render(<Harness item='Acme' />);

    rerender(<Harness item={null} />);

    expect(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('commits when the freezing update runs inside a transition', async () => {
    let setState: (s: { frozen: boolean; label: string }) => void = () => {};
    function Harness() {
      const [state, set] = React.useState({ frozen: false, label: 'Acme' });
      setState = set;
      return (
        <div>
          <span data-testid='outside'>{state.frozen ? 'closed' : 'open'}</span>
          <Freeze frozen={state.frozen}>{state.label}</Freeze>
        </div>
      );
    }
    render(<Harness />);

    await act(async () => {
      React.startTransition(() => setState({ frozen: true, label: 'Globex' }));
      await new Promise(r => setTimeout(r, 0));
    });

    // The suspend-based version stalled the whole transition here: neither the sibling nor
    // anything else in the update ever committed.
    expect(screen.getByTestId('outside').textContent).toBe('closed');
    expect(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('lets components inside keep rendering their own state', () => {
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

    expect(screen.getByText('count: 1')).toBeInTheDocument();
  });
});

describe('useIsFrozen', () => {
  it('reports the nearest Freeze', () => {
    function Reader() {
      return <span>{useIsFrozen() ? 'frozen' : 'live'}</span>;
    }
    const { rerender } = render(
      <Freeze frozen={false}>
        <Reader />
      </Freeze>,
    );
    expect(screen.getByText('live')).toBeInTheDocument();

    rerender(
      <Freeze frozen>
        <Reader />
      </Freeze>,
    );
    expect(screen.getByText('frozen')).toBeInTheDocument();
  });

  it('is false outside any Freeze', () => {
    function Reader() {
      return <span>{useIsFrozen() ? 'frozen' : 'live'}</span>;
    }
    render(<Reader />);
    expect(screen.getByText('live')).toBeInTheDocument();
  });
});

describe('useFrozenValue', () => {
  const NameContext = React.createContext('Acme');
  function Reader() {
    return <span>{useFrozenValue(React.useContext(NameContext))}</span>;
  }

  it('holds a context value read from inside the frozen subtree', () => {
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

    rerender(
      <NameContext.Provider value='Globex'>
        <Freeze frozen={false}>
          <Reader />
        </Freeze>
      </NameContext.Provider>,
    );

    expect(screen.getByText('Globex')).toBeInTheDocument();
  });

  it('holds a state update raised by the subtree itself', () => {
    let bump = () => {};
    function Counter() {
      const [count, setCount] = React.useState(0);
      bump = () => setCount(n => n + 1);
      return <span>count: {useFrozenValue(count)}</span>;
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

    rerender(
      <Freeze frozen={false}>
        <Counter />
      </Freeze>,
    );

    expect(screen.getByText('count: 1')).toBeInTheDocument();
  });

  it('passes the value through outside any Freeze', () => {
    const { rerender } = render(
      <NameContext.Provider value='Acme'>
        <Reader />
      </NameContext.Provider>,
    );
    rerender(
      <NameContext.Provider value='Globex'>
        <Reader />
      </NameContext.Provider>,
    );
    expect(screen.getByText('Globex')).toBeInTheDocument();
  });
});
