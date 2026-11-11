import { logger } from '@clerk/shared/logger';
import { act, cleanup, configure, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { normalizeBase } from '../base-path';
import type { SegmentParts } from '../location';
import type { MosaicLocationOptions } from '../use-mosaic-location';
import { useRouterScope } from '../use-router';
import { useVirtualEntries, useVirtualWrite, VirtualStoreProvider } from '../virtual-store';

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
  excludes: {
    // A carrier that holds exactly one entry, such as the pathname, cannot host two bases at once.
    severalBases?: boolean;
  };
}

const virtual: LocationMode = {
  name: 'virtual',
  routing: 'virtual',
  Provider: VirtualStoreProvider,
  useEntry: base => useVirtualEntries().get(normalizeBase(base)) ?? null,
  useOutsideWrite: useVirtualWrite,
  excludes: {},
};

const modes: LocationMode[] = [virtual];

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
          <button onClick={() => go('security')}>Go to security {path}</button>
        </>
      );
    }

    function OtherOwner({ path = '/user' }: { path?: string }) {
      const { route, go } = useRouterScope(otherRoutes, { routing: mode.routing, path, root: 'general' });
      return (
        <>
          <output data-testid={`other${path}`}>{route}</output>
          <button onClick={() => go('members')}>Go to members {path}</button>
        </>
      );
    }

    function Entry({ base = '/user' }: { base?: string }) {
      return <output data-testid={`entry${base}`}>{JSON.stringify(mode.useEntry(base))}</output>;
    }

    function Outside({ base = '/user', parts }: { base?: string; parts: SegmentParts | undefined }) {
      const write = mode.useOutsideWrite();
      return (
        <button onClick={() => write(base, parts)}>
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

      view.rerender(
        <Page>
          <Entry />
        </Page>,
      );
      view.rerender(
        <Page>
          <Owner />
          <Entry />
        </Page>,
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

      view.rerender(
        <Page initial={{ '/user': ['security'] }}>
          <Entry />
        </Page>,
      );
      expect(entry()).toBeNull();
    });

    it('starts on the root after moving to another base, leaving nothing behind', () => {
      function Tree({ path }: { path: string }) {
        return (
          <Page>
            <Owner path={path} />
            <Entry />
            <Entry base='/account' />
          </Page>
        );
      }
      const view = render(<Tree path='/user' />);
      click('Go to security /user');
      expect(route()).toBe('security');

      view.rerender(<Tree path='/account' />);
      expect(route('/account')).toBe('index');
      expect(entry('/account')).toBeNull();
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
    it.todo('comes back where it was after being parked and resumed');

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
            <button onClick={() => write('/user', ['security'])}>Write then replace</button>
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
