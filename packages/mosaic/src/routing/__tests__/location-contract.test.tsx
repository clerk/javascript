import { logger } from '@clerk/shared/logger';
import { act, cleanup, configure, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { normalizeBase } from '../base-path';
import type { SegmentParts } from '../location';
import { RouterAdapterProvider } from '../router-adapter';
import type { MosaicLocationOptions } from '../use-mosaic-location';
import { useRouterScope } from '../use-router';
import { useVirtualEntries, useVirtualWrite, VirtualStoreProvider } from '../virtual-store';
import type { HostUrl } from '../window-location';
import { useWindowUrl } from '../window-location';

// The contract every location mode keeps towards the components above it. A mode plugs in a
// provider, a way to read an entry and a way to write one from outside, the way a host or a modal
// host would. Inherent differences between carriers are declared in `excludes`, so a difference is
// stated here rather than discovered in a review.
interface LocationMode {
  name: string;
  routing: MosaicLocationOptions['routing'];
  Provider: ComponentType<{ initial?: Record<string, SegmentParts>; children: ReactNode }>;
  useEntry: (base: string) => SegmentParts | null;
  useOutsideWrite: () => (base: string, parts: SegmentParts | undefined) => void;
  // Leaving the page and coming back to it. `away` and `back` are handed what unmounts and mounts
  // the owner again, which is what leaving is in virtual mode; a URL mode navigates instead.
  leave: {
    away: (unmount: () => void) => void;
    back: (remount: () => void) => void;
  };
  excludes: {
    // A carrier that holds exactly one entry, such as the pathname, cannot host two bases at once.
    severalBases?: boolean;
    // A URL keeps what was written under a base until the host navigates; nothing counts owners,
    // so a base the owner moved away from keeps its entry.
    dropsOnMove?: boolean;
    // Parking keeps a hidden owner's segment in the owner. A URL mode keeps it in the URL instead.
    parks?: boolean;
    // A param's value is the host's to re-serialise, so it is read decoded and a part there cannot
    // contain a slash. The pathname and the virtual store keep one inside a part.
    slashInPart?: boolean;
  };
}

const virtual: LocationMode = {
  name: 'virtual',
  routing: 'virtual',
  Provider: VirtualStoreProvider,
  useEntry: base => useVirtualEntries().get(normalizeBase(base)) ?? null,
  useOutsideWrite: useVirtualWrite,
  leave: { away: unmount => unmount(), back: remount => remount() },
  excludes: {},
};

// What a host does: write the URL it wants and tell the page with `popstate`. The URL modes are
// read back here on their own terms rather than through the carriers under test.
const encode = (parts: SegmentParts) => parts.map(encodeURIComponent).join('/');
const decode = (raw: string): SegmentParts => (raw === '' ? [] : raw.split('/').map(decodeURIComponent));
const paramName = (prefix: string, base: string) => prefix + normalizeBase(base).slice(1).replaceAll('/', '.');
const pairValue = (body: string, key: string) => new URLSearchParams(body).get(key) ?? undefined;
const withPair = (body: string, key: string, value: string | undefined) =>
  [
    ...body.split('&').filter(pair => pair !== '' && pair.split('=')[0] !== key),
    ...(value === undefined ? [] : [`${key}=${value}`]),
  ].join('&');
const urlOf = ({ pathname, search, hash }: HostUrl) =>
  `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
const currentUrl = (): HostUrl => ({
  pathname: window.location.pathname,
  search: window.location.search.slice(1),
  hash: window.location.hash.slice(1),
});

function navigate(url: string) {
  window.history.pushState(null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

interface UrlCarrierSpec {
  entryOf: (url: HostUrl, base: string) => SegmentParts | null;
  urlWith: (url: HostUrl, base: string, parts: SegmentParts | undefined) => string;
}

function urlMode(
  routing: 'path' | 'hash' | 'query',
  { entryOf, urlWith }: UrlCarrierSpec,
  excludes: LocationMode['excludes'],
): LocationMode {
  let before = currentUrl();
  function UrlModeProvider({ initial, children }: { initial?: Record<string, SegmentParts>; children: ReactNode }) {
    useState(() => {
      for (const [base, parts] of Object.entries(initial ?? {})) {
        window.history.replaceState(null, '', urlWith(currentUrl(), base, parts));
      }
      return null;
    });
    return (
      <RouterAdapterProvider>
        <VirtualStoreProvider>{children}</VirtualStoreProvider>
      </RouterAdapterProvider>
    );
  }
  return {
    name: routing,
    routing,
    Provider: UrlModeProvider,
    useEntry: base => {
      const url = useWindowUrl(true);
      return url === undefined ? null : entryOf(url, base);
    },
    useOutsideWrite: () => (base, parts) => navigate(urlWith(currentUrl(), base, parts)),
    // Leaving is the host navigating to another page and unmounting the owner; returning is the host
    // navigating back to the owner's page, without its segment, and mounting it again.
    leave: {
      away: unmount =>
        act(() => {
          before = currentUrl();
          navigate('/elsewhere');
          unmount();
        }),
      back: remount =>
        act(() => {
          navigate(urlWith(before, '/user', undefined));
          remount();
        }),
    },
    excludes: { dropsOnMove: true, parks: true, ...excludes },
  };
}

const path = urlMode(
  'path',
  {
    entryOf: ({ pathname }, base) => {
      const root = normalizeBase(base);
      if (pathname === root) {
        return [];
      }
      return pathname.startsWith(`${root}/`) ? decode(pathname.slice(root.length + 1)) : null;
    },
    urlWith: (url, base, parts) =>
      parts === undefined
        ? '/'
        : urlOf({ ...url, pathname: parts.length ? `${normalizeBase(base)}/${encode(parts)}` : normalizeBase(base) }),
  },
  { severalBases: true },
);

function paramMode(routing: 'hash' | 'query', field: 'hash' | 'search', prefix: string) {
  return urlMode(
    routing,
    {
      entryOf: (url, base) => {
        const value = pairValue(url[field], paramName(prefix, base));
        return value === undefined ? null : value === '' ? [] : value.split('/');
      },
      urlWith: (url, base, parts) =>
        urlOf({
          ...url,
          [field]: withPair(url[field], paramName(prefix, base), parts === undefined ? undefined : encode(parts)),
        }),
    },
    { slashInPart: true },
  );
}

const modes: LocationMode[] = [virtual, path, paramMode('hash', 'hash', ''), paramMode('query', 'search', 'p.')];

beforeEach(() => window.history.replaceState(null, '', '/'));

const routes = {
  index: '',
  security: 'security',
  statement: 'billing/statement/:statementId',
} as const;

const otherRoutes = {
  general: 'general',
  members: 'members',
} as const;

afterEach(() => cleanup());

describe.each(modes)('$name location', mode => {
  describe.each([{ strict: false }, { strict: true }])('strict mode: $strict', ({ strict }) => {
    beforeEach(() => configure({ reactStrictMode: strict }));
    afterEach(() => configure({ reactStrictMode: false }));

    function Owner({ path = '/user', seen }: { path?: string; seen?: string[] }) {
      const { route, go } = useRouterScope(routes, { routing: mode.routing, path, root: 'index' });
      seen?.push(route);
      return (
        <>
          <output data-testid={`route${path}`}>{route}</output>
          <button
            type='button'
            onClick={() => go('security')}
          >
            Go to security {path}
          </button>
        </>
      );
    }

    function OtherOwner({ path = '/user' }: { path?: string }) {
      const { route, go } = useRouterScope(otherRoutes, { routing: mode.routing, path, root: 'general' });
      return (
        <>
          <output data-testid={`other${path}`}>{route}</output>
          <button
            type='button'
            onClick={() => go('members')}
          >
            Go to members {path}
          </button>
        </>
      );
    }

    function Entry({ base = '/user' }: { base?: string }) {
      return <output data-testid={`entry${base}`}>{JSON.stringify(mode.useEntry(base))}</output>;
    }

    function Outside({ base = '/user', parts }: { base?: string; parts: SegmentParts | undefined }) {
      const write = mode.useOutsideWrite();
      return (
        <button
          type='button'
          onClick={() => write(base, parts)}
        >
          Write {base} {JSON.stringify(parts ?? null)}
        </button>
      );
    }

    function Page({ initial, children }: { initial?: Record<string, SegmentParts>; children: ReactNode }) {
      return <mode.Provider initial={initial}>{children}</mode.Provider>;
    }

    const route = (path = '/user') => screen.getByTestId(`route${path}`).textContent;
    const other = (path = '/user') => screen.getByTestId(`other${path}`).textContent;
    const entry = (base = '/user') => JSON.parse(screen.getByTestId(`entry${base}`).textContent ?? 'null');
    const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }));

    it('shows the root on a fresh mount and writes nothing', () => {
      render(
        <Page>
          <Owner />
          <Entry />
        </Page>,
      );
      expect(route()).toBe('index');
      expect(entry()).toBeNull();
    });

    it('reflects a navigation in the route and the entry', () => {
      render(
        <Page>
          <Owner />
          <Entry />
        </Page>,
      );
      click('Go to security /user');
      expect(route()).toBe('security');
      expect(entry()).toEqual(['security']);
    });

    it.skipIf(mode.excludes.slashInPart)('round-trips a slash inside a param value', () => {
      const value = 'st/1';
      expect(openStatement(value)).toEqual({ shown: value, entry: ['billing', 'statement', value] });
    });

    it('round-trips any other param value through the entry', () => {
      const value = 'a %25 c+d&e=f#g?h é';
      expect(openStatement(value)).toEqual({ shown: value, entry: ['billing', 'statement', value] });
    });

    function openStatement(value: string) {
      function Statement() {
        const { route, params, go } = useRouterScope(routes, { routing: mode.routing, path: '/user', root: 'index' });
        return (
          <>
            <output data-testid='statement'>{route === 'statement' ? params.statementId : route}</output>
            <button
              type='button'
              onClick={() => go('statement', { statementId: value })}
            >
              Open statement
            </button>
          </>
        );
      }
      render(
        <Page>
          <Statement />
          <Entry />
        </Page>,
      );
      click('Open statement');
      return { shown: screen.getByTestId('statement').textContent, entry: entry() };
    }

    it('honours an entry written before mount on the first render', () => {
      const seen: string[] = [];
      render(
        <Page initial={{ '/user': ['security'] }}>
          <Owner seen={seen} />
          <Entry />
        </Page>,
      );
      expect(seen[0]).toBe('security');
      expect(entry()).toEqual(['security']);
    });

    it('redirects an unknown segment to the fallback, every time it is written', () => {
      const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
      render(
        <Page initial={{ '/user': ['nowhere'] }}>
          <Owner />
          <Entry />
          <Outside parts={['nowhere']} />
        </Page>,
      );
      expect(route()).toBe('index');
      expect(entry()).toEqual([]);

      click('Write /user ["nowhere"]');
      expect(route()).toBe('index');
      expect(entry()).toEqual([]);
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('follows a write from outside to its own base and ignores other bases', () => {
      render(
        <Page>
          <Owner />
          <Entry />
          <Outside parts={['security']} />
          <Outside
            base='/organization'
            parts={['members']}
          />
        </Page>,
      );
      click('Write /organization ["members"]');
      expect(route()).toBe('index');

      click('Write /user ["security"]');
      expect(route()).toBe('security');
    });

    it('starts fresh after leaving and returning', () => {
      const view = render(
        <Page>
          <Owner />
          <Entry />
        </Page>,
      );
      click('Go to security /user');
      expect(route()).toBe('security');

      mode.leave.away(() =>
        view.rerender(
          <Page>
            <Entry />
          </Page>,
        ),
      );
      mode.leave.back(() =>
        view.rerender(
          <Page>
            <Owner />
            <Entry />
          </Page>,
        ),
      );
      expect(route()).toBe('index');
      expect(entry()).toBeNull();
    });

    it('drops an entry written before mount once the owner leaves', () => {
      const view = render(
        <Page initial={{ '/user': ['security'] }}>
          <Owner />
          <Entry />
        </Page>,
      );
      expect(route()).toBe('security');

      mode.leave.away(() =>
        view.rerender(
          <Page initial={{ '/user': ['security'] }}>
            <Entry />
          </Page>,
        ),
      );
      expect(entry()).toBeNull();
    });

    function MovingTree({ path }: { path: string }) {
      return (
        <Page>
          <Owner path={path} />
          <Entry />
          <Entry base='/account' />
        </Page>
      );
    }

    it('starts on the root after moving to another base', () => {
      const view = render(<MovingTree path='/user' />);
      click('Go to security /user');
      expect(route()).toBe('security');

      view.rerender(<MovingTree path='/account' />);
      expect(route('/account')).toBe('index');
      expect(entry('/account')).toBeNull();
    });

    it.skipIf(mode.excludes.dropsOnMove)('leaves nothing behind under the base it moved away from', () => {
      const view = render(<MovingTree path='/user' />);
      click('Go to security /user');

      view.rerender(<MovingTree path='/account' />);
      expect(entry()).toBeNull();
    });

    it('shows the root after an outside clear while mounted', () => {
      render(
        <Page initial={{ '/user': ['security'] }}>
          <Owner />
          <Entry />
          <Outside parts={undefined} />
        </Page>,
      );
      expect(route()).toBe('security');

      click('Write /user null');
      expect(route()).toBe('index');
      expect(entry()).toBeNull();
    });

    // Needs React 19.2's Activity: a parked owner's effects stop and its state survives, and on
    // resume it restores its segment unless the base was written meanwhile. React 18 has no way to
    // produce that cycle, so this waits for a React 19 test project.
    it.skipIf(mode.excludes.parks).todo('comes back where it was after being parked and resumed');

    it('lets an outside writer clear the entry after the owner navigated', () => {
      render(
        <Page>
          <Owner />
          <Entry />
          <Outside parts={undefined} />
        </Page>,
      );
      click('Go to security /user');
      click('Write /user null');
      expect(route()).toBe('index');
      expect(entry()).toBeNull();
    });

    it('shows a page written just before the owner is replaced in the same commit', () => {
      function Replaceable({ generation }: { generation: number }) {
        const write = mode.useOutsideWrite();
        return (
          <>
            <button
              type='button'
              onClick={() => write('/user', ['security'])}
            >
              Write then replace
            </button>
            <Owner key={generation} />
          </>
        );
      }
      function Tree({ generation }: { generation: number }) {
        return (
          <Page>
            <Replaceable generation={generation} />
            <Entry />
          </Page>
        );
      }
      const view = render(<Tree generation={1} />);
      click('Go to security /user');

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Write then replace' }));
        view.rerender(<Tree generation={2} />);
      });

      expect(route()).toBe('security');
      expect(entry()).toEqual(['security']);
    });

    it('lets two owners of one base agree on the base, so neither can loop the other', () => {
      const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
      render(
        <Page initial={{ '/user': ['nowhere'] }}>
          <Owner />
          <OtherOwner />
          <Entry />
        </Page>,
      );
      expect(route()).toBe('index');
      expect(other()).toBe('general');
      expect(entry()).toEqual([]);

      click('Go to security /user');
      expect(entry()).toEqual([]);
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it.skipIf(mode.excludes.severalBases)('keeps owners of different bases independent', () => {
      render(
        <Page>
          <Owner />
          <OtherOwner path='/organization' />
          <Entry />
          <Entry base='/organization' />
        </Page>,
      );
      click('Go to security /user');
      click('Go to members /organization');
      expect(route()).toBe('security');
      expect(other('/organization')).toBe('members');
      expect(entry()).toEqual(['security']);
      expect(entry('/organization')).toEqual(['members']);
    });
  });
});
