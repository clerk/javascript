import { act, render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { atom } from '../atom';
import { createI18n } from '../create-i18n';
import type { RichText } from '../message-format';
import { messageFormat } from '../message-format';
import { Message, useMessage, useStore } from './index';

const rich = (tpl: string): RichText => {
  const marker = messageFormat(tpl);
  return marker.fn('en', marker.template);
};

const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

describe('useStore', () => {
  it('returns the current value and re-renders on change', () => {
    const $a = atom(1);
    const { result } = renderHook(() => useStore($a));

    expect(result.current).toBe(1);
    act(() => $a.set(2));
    expect(result.current).toBe(2);
  });

  it('uses the ssr snapshot for the server render path', () => {
    const $a = atom('client');
    const { result } = renderHook(() => useStore($a, { ssr: () => 'server' }));
    // jsdom renders on the client, so the client snapshot wins after hydration.
    expect(result.current).toBe('client');
  });

  // Regression: subscribe/getSnapshot must be referentially stable. When they were
  // re-created each render (`$store.listen.bind($store)`), useSyncExternalStore
  // re-subscribed on every commit, re-entering the nanostores scheduler and
  // looping ("Maximum update depth exceeded"). These cover the failure modes.
  describe('does not loop (stable subscribe/getSnapshot)', () => {
    const setup = () => {
      const $locale = atom('en');
      const $overrides = atom<Record<string, Record<string, unknown>>>({});
      const i18n = createI18n($locale, {
        get: (l: string): Record<string, Record<string, string>> => (l === 'fr' ? { common: { hi: 'Bonjour' } } : {}),
        overrides: $overrides,
      });
      const $msg = i18n('common', { hi: 'Hello' });
      const C = () => React.createElement('span', null, useStore($msg).hi);
      return { $locale, $overrides, C };
    };

    it('renders a computed message store under StrictMode', () => {
      const { C } = setup();
      render(React.createElement(React.StrictMode, null, React.createElement(C)));
      expect(screen.getByText('Hello')).toBeTruthy();
    });

    it('updates when overrides change', () => {
      const { $overrides, C } = setup();
      render(React.createElement(C));
      act(() => $overrides.set({ common: { hi: 'Hey' } }));
      expect(screen.getByText('Hey')).toBeTruthy();
    });

    it('updates when the locale is toggled to a lazily-fetched one', async () => {
      const { $locale, C } = setup();
      render(React.createElement(C));
      await act(async () => {
        $locale.set('fr');
        await flush();
      });
      expect(screen.getByText('Bonjour')).toBeTruthy();
    });
  });
});

describe('<Message>', () => {
  it('substitutes values and renders markup components', () => {
    const { container } = render(
      <Message
        of={rich('Read the {#link}terms{/link}, {$name}')}
        values={{ name: 'Sam' }}
        components={{ link: c => <a href='/terms'>{c}</a> }}
      />,
    );
    expect(container.innerHTML).toBe('Read the <a href="/terms">terms</a>, Sam');
  });

  it('renders standalone markup', () => {
    const { container } = render(
      <Message
        of={rich('a{#br/}b')}
        components={{ br: () => <br /> }}
      />,
    );
    expect(container.innerHTML).toBe('a<br>b');
  });

  it('renders nested markup', () => {
    const { container } = render(
      <Message
        of={rich('{#b}{#i}x{/i}{/b}')}
        components={{ b: c => <b>{c}</b>, i: c => <i>{c}</i> }}
      />,
    );
    expect(container.innerHTML).toBe('<b><i>x</i></b>');
  });

  it('inlines children when a markup component is missing', () => {
    const { container } = render(<Message of={rich('a {#b}x{/b} b')} />);
    expect(container.innerHTML).toBe('a x b');
  });

  it('skips a stray close tag with no matching open', () => {
    const { container } = render(<Message of={rich('a{/b}c')} />);
    expect(container.innerHTML).toBe('ac');
  });

  it('renders nothing for standalone markup without a component', () => {
    const { container } = render(<Message of={rich('a{#br/}b')} />);
    expect(container.innerHTML).toBe('ab');
  });

  it('renders markup nested three levels deep', () => {
    const { container } = render(
      <Message
        of={rich('{#a}{#b}{#c}x{/c}{/b}{/a}')}
        components={{ a: c => <em>{c}</em>, b: c => <b>{c}</b>, c: c => <code>{c}</code> }}
      />,
    );
    expect(container.innerHTML).toBe('<em><b><code>x</code></b></em>');
  });
});

describe('useMessage', () => {
  it('returns the same React nodes as <Message>', () => {
    const message = rich('Hi {#b}{$name}{/b}');
    const { result } = renderHook(() =>
      useMessage(message, { values: { name: 'Sam' }, components: { b: c => <b>{c}</b> } }),
    );
    const { container } = render(<>{result.current}</>);
    expect(container.innerHTML).toBe('Hi <b>Sam</b>');
  });
});
