import { logger } from '@clerk/shared/logger';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MosaicRouting } from '../router-adapter';
import { RouterAdapterProvider } from '../router-adapter';
import { MosaicRoutingScope } from '../routing-scope';
import type { MosaicLocationOptions } from '../use-mosaic-location';
import { useReturnUrl, useRouterScope } from '../use-router';
import { useVirtualEntries, VirtualStoreProvider } from '../virtual-store';

beforeEach(() => window.history.replaceState(null, '', '/page?q=a+b#top'));
afterEach(() => vi.restoreAllMocks());

const routes = {
  account: 'account',
  security: 'security',
  statement: 'billing/statement/:statementId',
} as const;

const url = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;
const relative = (href: string) => href.slice(window.location.origin.length);

function Scope({ options, children }: { options: MosaicLocationOptions; children: ReactNode }) {
  const { scope } = useRouterScope(routes, { ...options, root: 'account' });
  return <MosaicRoutingScope scope={scope}>{children}</MosaicRoutingScope>;
}

function renderReturnUrl(options: MosaicLocationOptions | undefined, routing: MosaicRouting = {}) {
  return renderHook(() => ({ returnUrl: useReturnUrl(routes), entries: useVirtualEntries() }), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <RouterAdapterProvider {...routing}>
        <VirtualStoreProvider>{options ? <Scope options={options}>{children}</Scope> : children}</VirtualStoreProvider>
      </RouterAdapterProvider>
    ),
  });
}

describe('useReturnUrl', () => {
  it('adds the query link for the scope in virtual mode, and changes nothing else', () => {
    const { result } = renderReturnUrl({ routing: 'virtual', path: '/user' });

    expect(result.current.returnUrl('security')).toBe(`${window.location.origin}/page?q=a+b&.user=security#top`);
    expect(url()).toBe('/page?q=a+b#top');
    expect(result.current.entries.size).toBe(0);
  });

  it.each([
    { routing: 'query', at: '/page?q=a+b#top', returned: '/page?q=a+b&.user=security#top' },
    { routing: 'hash', at: '/page?q=a+b#top', returned: '/page?q=a+b#top&.user=security' },
    { routing: 'path', at: '/user?q=a+b#top', returned: '/user/security?q=a+b#top' },
  ] as const)('writes the entry into the URL in $routing mode without navigating', ({ routing, at, returned }) => {
    window.history.replaceState(null, '', at);
    const { result } = renderReturnUrl({ routing, path: '/user' });

    expect(relative(result.current.returnUrl('security'))).toBe(returned);
    expect(url()).toBe(at);
  });

  it('replaces an entry the URL already has', () => {
    window.history.replaceState(null, '', '/page?.user=account&q=1');
    const { result } = renderReturnUrl({ routing: 'query', path: '/user' });

    expect(relative(result.current.returnUrl('security'))).toBe('/page?.user=security&q=1');
  });

  it('uses the base of the scope it is under', () => {
    const { result } = renderReturnUrl({ routing: 'virtual', path: '/modal/user' });

    expect(relative(result.current.returnUrl('account'))).toBe('/page?q=a+b&.modal.user=account#top');
  });

  it('names the link in virtual mode with the provider’s query prefix', () => {
    const { result } = renderReturnUrl({ routing: 'virtual', path: '/user' }, { keyPrefix: { query: 'app' } });

    expect(relative(result.current.returnUrl('security'))).toBe('/page?q=a+b&app.user=security#top');
  });

  it('builds the parts of a route with params', () => {
    const { result } = renderReturnUrl({ routing: 'virtual', path: '/user' });

    expect(relative(result.current.returnUrl('statement', { statementId: 'st 1' }))).toBe(
      '/page?q=a+b&.user=billing/statement/st%201#top',
    );
  });

  it('starts from the page as it is when it is called', () => {
    const { result } = renderReturnUrl({ routing: 'virtual', path: '/user' });
    window.history.replaceState(null, '', '/elsewhere');

    expect(relative(result.current.returnUrl('security'))).toBe('/elsewhere?.user=security');
  });

  it('returns the page as it is outside a scope', () => {
    const { result } = renderReturnUrl(undefined);

    expect(result.current.returnUrl('security')).toBe(`${window.location.origin}/page?q=a+b#top`);
  });

  it('returns the page as it is, with a warning, for a part that cannot be carried', () => {
    const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    const { result } = renderReturnUrl({ routing: 'virtual', path: '/user' });

    expect(relative(result.current.returnUrl('statement', { statementId: 'a/b' }))).toBe('/page?q=a+b#top');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[Clerk]'));
  });

  it.each(['100%', 'two words', 'a+b', 'a&b', 'a=b', 'a#b', 'a?b', 'åäö', '%2F'])(
    'comes back as the same parts through a virtual owner for %s',
    async statementId => {
      const { result, unmount } = renderReturnUrl({ routing: 'virtual', path: '/user' });
      window.history.replaceState(null, '', relative(result.current.returnUrl('statement', { statementId })));
      unmount();

      const returned = renderReturnUrl({ routing: 'virtual', path: '/user' });
      await act(async () => {
        await Promise.resolve();
      });

      expect(returned.result.current.entries.get('/user')).toEqual(['billing', 'statement', statementId]);
      expect(url()).toBe('/page?q=a+b#top');
    },
  );
});
