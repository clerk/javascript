import { logger } from '@clerk/shared/logger';
import { act, render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useLayoutEffect } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MosaicLocation } from '../location';
import type { MosaicRouting, RouterAdapter } from '../router-adapter';
import { RouterAdapterProvider } from '../router-adapter';
import type { MosaicLocationOptions } from '../use-mosaic-location';
import { useMosaicLocation } from '../use-mosaic-location';
import { VirtualStoreProvider } from '../virtual-store';

beforeEach(() => window.history.replaceState(null, '', '/'));
afterEach(() => vi.restoreAllMocks());

const warnings = () => vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});

function wrapperWith(routing: MosaicRouting = {}) {
  return ({ children }: { children: ReactNode }) => (
    <RouterAdapterProvider {...routing}>
      <VirtualStoreProvider>{children}</VirtualStoreProvider>
    </RouterAdapterProvider>
  );
}

function useLocationAt(options: MosaicLocationOptions) {
  const location = useMosaicLocation(options);
  return { location, parts: location.useSegmentParts() };
}

function renderLocation(options: MosaicLocationOptions, routing?: MosaicRouting) {
  return renderHook(() => useLocationAt(options), { wrapper: wrapperWith(routing) });
}

const url = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;
const at = (next: string) => window.history.replaceState(null, '', next);
const awkward = ['100%', 'two words', 'a+b', 'a&b', 'a=b', 'a#b', 'a?b', 'åäö', '%2F', 'a%2Fb'];

interface CarrierCase {
  routing: 'path' | 'hash' | 'query';
  // A URL with the entry ['billing', 'st/1'] under '/user', and other things the host keeps.
  seeded: string;
  // The same URL with the entry written as ['security'].
  written: string;
  // The same URL with the entry cleared.
  cleared: string;
  // A URL whose entry under '/user' has a malformed escape; only the pathname, which Mosaic decodes
  // itself, has a defined reading for one.
  malformed?: string;
  // A URL without an entry under '/user'.
  elsewhere: string;
}

const carriers: CarrierCase[] = [
  {
    routing: 'path',
    seeded: '/user/billing/st%2F1?q=a+b#top',
    written: '/user/security?q=a+b#top',
    cleared: '/user?q=a+b#top',
    malformed: '/user/%E0%A4%A',
    elsewhere: '/users/security',
  },
  {
    routing: 'query',
    seeded: '/page?q=a+b&p.user=billing/st%2F1&z#top',
    written: '/page?q=a+b&p.user=security&z#top',
    cleared: '/page?q=a+b&z#top',
    elsewhere: '/page?p.users=security&user=security',
  },
  {
    routing: 'hash',
    seeded: '/page?q=a+b#top&user=billing/st%2F1&z',
    written: '/page?q=a+b#top&user=security&z',
    cleared: '/page?q=a+b#top&z',
    elsewhere: '/page#p.user=security',
  },
];

// What the seeded entry reads as: the pathname keeps an encoded slash inside its part, a param's
// value comes back decoded and split, the way the host hands it over.
const seededParts = (routing: CarrierCase['routing']) =>
  routing === 'path' ? ['billing', 'st/1'] : ['billing', 'st', '1'];

describe.each(carriers)('$routing location', ({ routing, seeded, written, cleared, malformed, elsewhere }) => {
  const options: MosaicLocationOptions = { routing, path: '/user' };

  it('reads its entry from the URL', () => {
    at(seeded);
    const { result } = renderLocation(options);
    expect(result.current.parts).toEqual(seededParts(routing));
  });

  it('reads no entry where the URL has none for its base', () => {
    at(elsewhere);
    const { result } = renderLocation(options);
    expect(result.current.parts).toBeUndefined();
  });

  it.skipIf(malformed === undefined)('reads a malformed escape as no parts', () => {
    at(malformed ?? '/');
    const { result } = renderLocation(options);
    expect(result.current.parts).toEqual([]);
  });

  it('pushes a write and keeps the rest of the URL', () => {
    at(seeded);
    const { result } = renderLocation(options);
    const length = window.history.length;

    act(() => result.current.location.write(['security']));

    expect(url()).toBe(written);
    expect(window.history.length).toBe(length + 1);
    expect(result.current.parts).toEqual(['security']);
  });

  it('replaces when asked to', () => {
    at(seeded);
    const { result } = renderLocation(options);
    const length = window.history.length;

    act(() => result.current.location.write(['security'], { replace: true }));

    expect(url()).toBe(written);
    expect(window.history.length).toBe(length);
  });

  it('clears by replacing', () => {
    at(seeded);
    const { result } = renderLocation(options);
    const length = window.history.length;

    act(() => result.current.location.clear());

    expect(url()).toBe(cleared);
    expect(window.history.length).toBe(length);
  });

  it.each(awkward)('round-trips %j as one part', value => {
    const { result } = renderLocation(options);

    act(() => result.current.location.write(['billing', value]));

    expect(result.current.parts).toEqual(['billing', value]);
  });

  it('follows the browser going back', () => {
    at(seeded);
    const { result } = renderLocation(options);

    act(() => {
      at(written);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current.parts).toEqual(['security']);
  });

  it('keeps the same parts while its entry is unchanged', () => {
    at(seeded);
    const { result } = renderLocation(options);
    const first = result.current.parts;

    act(() => {
      window.history.pushState(null, '', `${seeded}x`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current.parts).toBe(first);
  });

  it('owns nothing and leaves the URL alone', () => {
    at(seeded);
    const { result } = renderLocation(options);
    const release = result.current.location.own();
    release();
    expect(url()).toBe(seeded);
  });

  it('renders no entry on the server without an adapter', () => {
    at(seeded);
    function Probe() {
      const location = useMosaicLocation(options);
      return <output>{JSON.stringify(location.useSegmentParts() ?? null)}</output>;
    }
    expect(renderToString(wrapperWith()({ children: <Probe /> }))).toBe('<output>null</output>');
  });
});

describe('the pathname', () => {
  it('keeps an encoded slash inside a part, since it splits before it decodes', () => {
    const { result } = renderLocation({ routing: 'path', path: '/user' });
    act(() => result.current.location.write(['billing', 'st/1']));
    expect(url()).toBe('/user/billing/st%2F1');
    expect(result.current.parts).toEqual(['billing', 'st/1']);
  });
});

describe.each(['query', 'hash'] as const)('a %s param', routing => {
  const seed = (value: string) => at(routing === 'query' ? `/page?p.user=${value}` : `/page#user=${value}`);

  it('reads its value decoded, as the host serialises it', () => {
    seed('organization%2Fgeneral');
    expect(renderLocation({ routing, path: '/user' }).result.current.parts).toEqual(['organization', 'general']);
    seed('two+words');
    expect(renderLocation({ routing, path: '/user' }).result.current.parts).toEqual(['two words']);
  });

  it('refuses a part with a slash, which the host would not keep apart', () => {
    const warn = warnings();
    seed('security');
    const { result } = renderLocation({ routing, path: '/user' });

    act(() => result.current.location.write(['billing', 'st/1']));

    expect(result.current.parts).toEqual(['security']);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('a part cannot contain "/"'));
  });
});

describe('the base', () => {
  it('reads the pathname exactly at the base as the empty entry, and writes it for no parts', () => {
    at('/user?q=1');
    const { result } = renderLocation({ routing: 'path', path: '/user/' });
    expect(result.current.parts).toEqual([]);

    act(() => result.current.location.write(['security']));
    act(() => result.current.location.write([]));
    expect(url()).toBe('/user?q=1');
  });

  it('writes the root pathname for no parts under the root', () => {
    at('/security');
    const { result } = renderLocation({ routing: 'path', path: '/' });
    expect(result.current.parts).toEqual(['security']);

    act(() => result.current.location.write([]));
    expect(url()).toBe('/');
  });

  it('matches a base with spaces against its encoded form', () => {
    at('/my%20profile/security');
    const { result } = renderLocation({ routing: 'path', path: '/my profile' });
    expect(result.current.parts).toEqual(['security']);
  });

  it('matches a base with characters a browser leaves raw in a pathname', () => {
    at('/org:x/a+b/security');
    const { result } = renderLocation({ routing: 'path', path: '/org:x/a+b' });
    expect(result.current.parts).toEqual(['security']);

    act(() => result.current.location.write(['general']));
    expect(url()).toBe('/org:x/a+b/general');
  });

  it('reads one trailing slash as the same pathname', () => {
    at('/user/security/');
    const { result } = renderLocation({ routing: 'path', path: '/user' });
    expect(result.current.parts).toEqual(['security']);

    at('/user/');
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.parts).toEqual([]);
  });

  it('refuses a part of . or .. in the pathname, which would leave the segment', () => {
    const warn = warnings();
    at('/user/security');
    const { result } = renderLocation({ routing: 'path', path: '/user' });

    act(() => result.current.location.write(['billing', '..']));
    act(() => result.current.location.write(['.']));

    expect(url()).toBe('/user/security');
    expect(result.current.parts).toEqual(['security']);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"billing/.." was not navigated to'));
  });

  it.each([[['billing', '']], [['', 'billing']], [['billing', '', 'x']]])(
    'refuses the empty part in %j in the pathname, which reads back as a doubled or trailing slash',
    parts => {
      const warn = warnings();
      at('/user/security');
      const { result } = renderLocation({ routing: 'path', path: '/user' });

      act(() => result.current.location.write(parts));

      expect(url()).toBe('/user/security');
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('an empty part'));
    },
  );

  it('refuses a leading empty part under the root, which would write a pathname naming another host', () => {
    const warn = warnings();
    at('/security');
    const { result } = renderLocation({ routing: 'path', path: '/' });

    act(() => result.current.location.write(['', 'evil.com']));

    expect(url()).toBe('/security');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"/evil.com" was not navigated to: an empty part'));
  });

  it('warns once for a base the pathname cannot hold', () => {
    const warn = warnings();
    renderLocation({ routing: 'path', path: '/a?b' });
    renderLocation({ routing: 'path', path: '/user/../x' });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"/a?b" cannot be routed under'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"/user/../x" cannot be routed under'));
  });

  it('clears to the pathname it was given instead of the base', () => {
    at('/page/modal/user/security?q=1');
    const { result } = renderLocation({ routing: 'path', path: '/page/modal/user', clearedPath: '/page' });
    expect(result.current.parts).toEqual(['security']);

    act(() => result.current.location.clear());

    expect(url()).toBe('/page?q=1');
    expect(result.current.parts).toBeUndefined();
  });

  it('warns when the hash key would be empty', () => {
    const warn = warnings();
    at('/#security');
    renderLocation({ routing: 'hash', path: '/' });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Hash routing with an empty key prefix'));
  });

  it('names a nested base with dots, and takes the prefix from the provider', () => {
    at('/?app.modal.user=security#modal.user=members');
    const query = renderLocation({ routing: 'query', path: '/modal/user' }, { keyPrefix: { query: 'app.' } });
    const hash = renderLocation({ routing: 'hash', path: '/modal/user' });
    expect(query.result.current.parts).toEqual(['security']);
    expect(hash.result.current.parts).toEqual(['members']);
  });

  it('keeps two bases in one query string apart', () => {
    const { result } = renderHook(
      () => [useLocationAt({ routing: 'query', path: '/user' }), useLocationAt({ routing: 'query', path: '/org' })],
      { wrapper: wrapperWith() },
    );
    act(() => result.current[0]?.location.write(['security']));
    act(() => result.current[1]?.location.write(['members']));
    act(() => result.current[0]?.location.clear());

    expect(url()).toBe('/?p.org=members');
    expect(result.current[0]?.parts).toBeUndefined();
    expect(result.current[1]?.parts).toEqual(['members']);
  });
});

describe('on a page whose pathname starts with //', () => {
  const page = (rest: string) => `${window.location.origin}//evil.com/x${rest}`;

  it.each(['query', 'hash'] as const)('refuses a %s write that would leave the origin', routing => {
    const warn = warnings();
    at(page(''));
    const { result } = renderLocation({ routing, path: '/user' });

    act(() => result.current.location.write(['security']));

    expect(url()).toBe('//evil.com/x');
    expect(result.current.parts).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('resolves to another origin'));
  });

  it.each([
    ['query', '?p.user=security'],
    ['hash', '#user=security'],
  ] as const)('refuses a %s clear rather than throwing', (routing, entry) => {
    const warn = warnings();
    at(page(entry));
    const { result } = renderLocation({ routing, path: '/user' });
    expect(result.current.parts).toEqual(['security']);

    expect(() => act(() => result.current.location.clear())).not.toThrow();

    expect(url()).toBe(`//evil.com/x${entry}`);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"//evil.com/x" was not navigated to'));
  });

  it('hands the host router no URL on another origin', () => {
    warnings();
    const push = vi.fn<(next: string) => void>();
    const { result } = renderLocation(
      { routing: 'query', path: '/user' },
      { adapter: { usePathname: () => '//evil.com/x', push } },
    );

    act(() => result.current.location.write(['security']));

    expect(push).not.toHaveBeenCalled();
  });
});

describe('with an adapter', () => {
  function hostRouter(initial: { pathname: string; search: string; hash: string }) {
    const host = { ...initial };
    return {
      host,
      adapter: {
        usePathname: () => host.pathname,
        useSearchParams: () => host.search,
        useHash: () => host.hash,
        push: vi.fn<(next: string) => void>(),
        replace: vi.fn<(next: string) => void>(),
      },
    };
  }

  it('takes the query string as URLSearchParams, as Next hands it over', () => {
    const adapter: RouterAdapter = { useSearchParams: () => new URLSearchParams('p.user=organization/general') };
    const { result } = renderLocation({ routing: 'query', path: '/user' }, { adapter });
    expect(result.current.parts).toEqual(['organization', 'general']);
  });

  it("reads the window when the pathname hook returns null, as Next's Pages Router can", () => {
    at('/user/security');
    const push = vi.fn<(next: string) => void>();
    const { result } = renderLocation(
      { routing: 'path', path: '/user' },
      { adapter: { usePathname: () => null, push } },
    );
    expect(result.current.parts).toEqual(['security']);

    act(() => result.current.location.write(['billing']));
    expect(push).toHaveBeenCalledWith('/user/billing');
  });

  it('reads the host router instead of the window', () => {
    at('/user/security');
    const { adapter } = hostRouter({ pathname: '/user/members', search: '?p.user=general', hash: '#user=billing' });
    const read = (routing: MosaicLocationOptions['routing']) =>
      renderLocation({ routing, path: '/user' }, { adapter }).result.current.parts;

    expect(read('path')).toEqual(['members']);
    expect(read('query')).toEqual(['general']);
    expect(read('hash')).toEqual(['billing']);
  });

  it('navigates through the host router with a URL built from its reads', () => {
    const { adapter } = hostRouter({ pathname: '/page', search: 'q=1&p.user=x', hash: 'top' });
    const { result } = renderLocation({ routing: 'query', path: '/user' }, { adapter });

    act(() => result.current.location.write(['security']));
    act(() => result.current.location.clear());

    expect(adapter.push).toHaveBeenCalledWith('/page?q=1&p.user=security#top');
    expect(adapter.replace).toHaveBeenCalledWith('/page?q=1#top');
    expect(url()).toBe('/');
  });

  it('starts a write without push or replace from the window, which has what the host adds around the pathname', () => {
    at('/docs/page?q=1');
    const { result } = renderLocation({ routing: 'query', path: '/user' }, { adapter: { usePathname: () => '/page' } });

    act(() => result.current.location.write(['security']));
    expect(url()).toBe('/docs/page?q=1&p.user=security');
  });

  it('starts a write from the host as this commit rendered it, even from a layout effect', () => {
    const host = { pathname: '/a' };
    const push = vi.fn<(next: string) => void>();
    function Probe({ go }: { go: boolean }) {
      const location = useMosaicLocation({ routing: 'query', path: '/user' });
      useLayoutEffect(() => {
        if (go) {
          location.write(['security']);
        }
      }, [go, location]);
      return null;
    }
    const tree = (go: boolean) => (
      <RouterAdapterProvider adapter={{ usePathname: () => host.pathname, push }}>
        <VirtualStoreProvider>
          <Probe go={go} />
        </VirtualStoreProvider>
      </RouterAdapterProvider>
    );
    const { rerender } = render(tree(false));
    host.pathname = '/b';
    rerender(tree(true));
    expect(push).toHaveBeenCalledWith('/b?p.user=security');
  });

  it('keeps its location while the host re-renders with a new adapter object', () => {
    const { host } = hostRouter({ pathname: '/user/members', search: '', hash: '' });
    const push = vi.fn<(next: string) => void>();
    const { result, rerender } = renderHook(
      ({ tick }: { tick: number }) => {
        void tick;
        return useLocationAt({ routing: 'path', path: '/user' });
      },
      {
        initialProps: { tick: 0 },
        wrapper: ({ children }) => (
          <RouterAdapterProvider adapter={{ usePathname: () => host.pathname, push: url => push(url) }}>
            <VirtualStoreProvider>{children}</VirtualStoreProvider>
          </RouterAdapterProvider>
        ),
      },
    );
    const first = result.current.location;

    rerender({ tick: 1 });
    expect(result.current.location).toBe(first);

    act(() => result.current.location.write(['security']));
    expect(push).toHaveBeenCalledWith('/user/security');
  });

  it('keeps the hooks of the first adapter and warns when a later one has others', () => {
    const warn = warnings();
    at('/user/security');
    function Probe() {
      const location = useMosaicLocation({ routing: 'path', path: '/user' });
      return <output>{JSON.stringify(location.useSegmentParts())}</output>;
    }
    const tree = (adapter: RouterAdapter) => (
      <RouterAdapterProvider adapter={adapter}>
        <VirtualStoreProvider>
          <Probe />
        </VirtualStoreProvider>
      </RouterAdapterProvider>
    );
    const { container, rerender } = render(tree({ usePathname: () => '/user/members' }));
    expect(container.textContent).toBe('["members"]');

    rerender(tree({}));
    expect(container.textContent).toBe('["members"]');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('changed which hooks it has'));
  });

  it('falls back to the window for each method it does not have', () => {
    at('/page?q=1#top');
    const push = vi.fn<(next: string) => void>();
    const { result } = renderLocation(
      { routing: 'path', path: '/user' },
      { adapter: { usePathname: () => '/user/members', push } },
    );
    expect(result.current.parts).toEqual(['members']);

    act(() => result.current.location.write(['security']));
    expect(push).toHaveBeenCalledWith('/user/security?q=1#top');

    act(() => result.current.location.write(['general'], { replace: true }));
    expect(url()).toBe('/user/general?q=1#top');
  });
});

describe('the mode', () => {
  it('is fixed on the first render and warns when it changes without a remount', () => {
    const warn = warnings();
    at('/user/security');
    const initialProps: { routing: MosaicLocationOptions['routing'] } = { routing: 'path' };
    const { result, rerender } = renderHook(
      ({ routing }: { routing: MosaicLocationOptions['routing'] }) => useLocationAt({ routing, path: '/user' }),
      { initialProps, wrapper: wrapperWith() },
    );
    expect(result.current.parts).toEqual(['security']);

    rerender({ routing: 'virtual' });
    expect(result.current.parts).toEqual(['security']);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"routing" changed from "path" to "virtual"'));
  });
});

describe('virtual mode', () => {
  it('keeps its location across the page navigating', () => {
    const { result } = renderLocation({ routing: 'virtual', path: '/user' });
    const first: MosaicLocation = result.current.location;

    act(() => {
      window.history.pushState(null, '', '/elsewhere');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current.location).toBe(first);
  });
});
