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

    rerender(
      <Freeze frozen={false}>
        <Counter />
      </Freeze>,
    );

    expect(screen.getByText('count: 1')).toBeInTheDocument();
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

    rerender(
      <NameContext.Provider value='Globex'>
        <Freeze frozen={false}>
          <Reader />
        </Freeze>
      </NameContext.Provider>,
    );

    expect(screen.getByText('Globex')).toBeInTheDocument();
  });

  describe('inside a transition', () => {
    function Harness() {
      const [frozen, setFrozen] = React.useState(false);
      const [label, setLabel] = React.useState('Acme');
      return (
        <>
          <output>{frozen ? 'frozen' : 'live'}</output>
          <button
            type='button'
            onClick={() =>
              React.startTransition(() => {
                setFrozen(true);
                setLabel('Globex');
              })
            }
          >
            freeze
          </button>
          <button
            type='button'
            onClick={() => React.startTransition(() => setFrozen(false))}
          >
            thaw
          </button>
          <button
            type='button'
            onClick={() => React.startTransition(() => setLabel('Initech'))}
          >
            relabel
          </button>
          <Freeze frozen={frozen}>{label}</Freeze>
        </>
      );
    }

    it('holds the frame from before the flip, and lets the transition commit around it', async () => {
      render(<Harness />);

      await act(() => screen.getByText('freeze').click());
      expect(screen.getByRole('status').textContent).toBe('frozen');
      expect(screen.getByText('Acme')).toBeInTheDocument();
      expect(screen.queryByText('Globex')).toBeNull();

      await act(() => screen.getByText('relabel').click());
      expect(screen.getByText('Acme')).toBeInTheDocument();
      expect(screen.queryByText('Initech')).toBeNull();

      await act(() => screen.getByText('thaw').click());
      expect(screen.getByText('Initech')).toBeInTheDocument();
    });
  });

  describe('under scheduling', () => {
    function Child({ label, onEffect }: { label: string; onEffect: (label: string) => void }) {
      React.useEffect(() => {
        onEffect(label);
      }, [label, onEffect]);
      return <span>{label}</span>;
    }

    function Scheduled({ onEffect, strict = false }: { onEffect?: (label: string) => void; strict?: boolean }) {
      const [frozen, setFrozen] = React.useState(false);
      const [label, setLabel] = React.useState('Acme');
      const [tick, setTick] = React.useState(0);
      const noteEffect = React.useCallback((value: string) => onEffect?.(value), [onEffect]);
      const tree = (
        <>
          <output>
            {frozen ? 'frozen' : 'live'}:{tick}
          </output>
          <button
            type='button'
            onClick={() =>
              React.startTransition(() => {
                setFrozen(true);
                setLabel('Globex');
              })
            }
          >
            freeze later
          </button>
          <button
            type='button'
            onClick={() => React.startTransition(() => setFrozen(false))}
          >
            thaw later
          </button>
          <button
            type='button'
            onClick={() => setFrozen(true)}
          >
            freeze now
          </button>
          <button
            type='button'
            onClick={() => setFrozen(false)}
          >
            thaw now
          </button>
          <button
            type='button'
            onClick={() => setLabel('Initech')}
          >
            relabel now
          </button>
          <button
            type='button'
            onClick={() => setTick(value => value + 1)}
          >
            tick
          </button>
          <Freeze frozen={frozen}>
            <Child
              label={label}
              onEffect={noteEffect}
            />
          </Freeze>
        </>
      );
      return strict ? <React.StrictMode>{tree}</React.StrictMode> : tree;
    }

    const click = (name: string) => act(() => screen.getByText(name).click());
    const status = () => screen.getByRole('status').textContent;

    it('does not run the effects of the frame it holds back', async () => {
      const effects: string[] = [];
      render(<Scheduled onEffect={label => effects.push(label)} />);
      effects.length = 0;

      await click('freeze later');
      expect(status()).toBe('frozen:0');
      expect(screen.getByText('Acme')).toBeInTheDocument();
      expect(effects).toEqual([]);

      await click('thaw later');
      expect(screen.getByText('Globex')).toBeInTheDocument();
      expect(effects).toEqual(['Globex']);
    });

    it('releases a hold whose transition was thawed before it committed', async () => {
      render(<Scheduled />);

      await act(async () => {
        screen.getByText('freeze later').click();
        await Promise.resolve();
        screen.getByText('thaw now').click();
      });

      expect(status()).toBe('live:0');
      expect(screen.getByText('Globex')).toBeVisible();
    });

    it('keeps the transition alive through an unrelated sync update while it is pending', async () => {
      render(<Scheduled />);

      await act(async () => {
        screen.getByText('freeze later').click();
        await Promise.resolve();
        screen.getByText('tick').click();
      });

      expect(status()).toBe('frozen:1');
      expect(screen.getByText('Acme')).toBeInTheDocument();
      expect(screen.queryByText('Globex')).toBeNull();

      await click('thaw later');
      expect(screen.getByText('Globex')).toBeVisible();
    });

    it('holds the frame committed by a thaw when frozen again right after it', async () => {
      render(<Scheduled />);
      await click('freeze now');

      await click('thaw now');
      await click('relabel now');
      expect(screen.getByText('Initech')).toBeVisible();

      await click('freeze now');
      await click('freeze later');

      expect(status()).toBe('frozen:0');
      expect(screen.getByText('Initech')).toBeInTheDocument();
      expect(screen.queryByText('Globex')).toBeNull();
    });

    it('does not commit a thaw that is re-frozen in the same update', async () => {
      render(<Scheduled />);
      await click('freeze now');

      await act(() => {
        screen.getByText('thaw now').click();
        screen.getByText('relabel now').click();
        screen.getByText('freeze now').click();
      });

      expect(status()).toBe('frozen:0');
      expect(screen.getByText('Acme')).toBeInTheDocument();
      expect(screen.queryByText('Initech')).toBeNull();
    });

    it('holds the frame from before a transition flip under StrictMode too', async () => {
      render(<Scheduled strict />);

      await click('freeze later');
      expect(status()).toBe('frozen:0');
      expect(screen.getByText('Acme')).toBeInTheDocument();
      expect(screen.queryByText('Globex')).toBeNull();

      await click('thaw now');
      expect(screen.getByText('Globex')).toBeVisible();
    });

    it('can unmount while holding', async () => {
      const { unmount } = render(<Scheduled />);
      await click('freeze later');
      expect(() => unmount()).not.toThrow();
    });

    it('keeps an inner hold while the outer thaws', async () => {
      function Nested() {
        const [outer, setOuter] = React.useState(false);
        const [inner, setInner] = React.useState(false);
        const [label, setLabel] = React.useState('Acme');
        return (
          <>
            <button
              type='button'
              onClick={() => setInner(true)}
            >
              freeze inner
            </button>
            <button
              type='button'
              onClick={() => setOuter(true)}
            >
              freeze outer
            </button>
            <button
              type='button'
              onClick={() => {
                setOuter(false);
                setLabel('Globex');
              }}
            >
              thaw outer and relabel
            </button>
            <Freeze frozen={outer}>
              <Freeze frozen={inner}>{label}</Freeze>
            </Freeze>
          </>
        );
      }
      render(<Nested />);

      await click('freeze inner');
      await click('freeze outer');
      await click('thaw outer and relabel');

      expect(screen.getByText('Acme')).toBeInTheDocument();
      expect(screen.queryByText('Globex')).toBeNull();
    });
  });
});
