import { act, render, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { markSettled, readWindowUrl, useWindowUrl, writeWindowUrl } from '../window-location';

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  markSettled();
});

describe('readWindowUrl', () => {
  it('reads the raw URL without the leading ? and #', () => {
    window.history.replaceState(null, '', '/a%20b?x=%2F#y=1');
    expect(readWindowUrl()).toEqual({ pathname: '/a%20b', search: 'x=%2F', hash: 'y=1' });
  });

  it('returns the same object while the URL is unchanged', () => {
    const first = readWindowUrl();
    expect(readWindowUrl()).toBe(first);
    window.history.replaceState(null, '', '/other');
    expect(readWindowUrl()).not.toBe(first);
  });
});

describe('useWindowUrl', () => {
  it('follows popstate and hashchange', () => {
    const { result } = renderHook(() => useWindowUrl(true));
    expect(result.current?.pathname).toBe('/');

    act(() => {
      window.history.pushState(null, '', '/user');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current?.pathname).toBe('/user');

    act(() => {
      window.history.pushState(null, '', '/user#p=1');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current?.hash).toBe('p=1');
  });

  it('follows a same-document navigation the Navigation API reports, a microtask later', async () => {
    const navigation = new EventTarget();
    Object.defineProperty(window, 'navigation', { value: navigation, configurable: true });
    try {
      const { result, unmount } = renderHook(() => useWindowUrl(true));
      await act(async () => {
        window.history.pushState({ __NA: true }, '', '/page#.tabs=settings');
        navigation.dispatchEvent(new Event('currententrychange'));
        await Promise.resolve();
      });
      expect(result.current?.hash).toBe('.tabs=settings');
      unmount();
    } finally {
      Reflect.deleteProperty(window, 'navigation');
    }
  });

  it('follows its own writes without an event', () => {
    const { result } = renderHook(() => useWindowUrl(true));
    act(() => writeWindowUrl('/user?.user=security', false));
    expect(result.current).toEqual({ pathname: '/user', search: '.user=security', hash: '' });
  });

  it('reads nothing and does not re-render when disabled', () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useWindowUrl(false);
    });
    act(() => writeWindowUrl('/user', false));
    expect(result.current).toBeUndefined();
    expect(renders).toBe(1);
  });

  it('reads nothing on the server', () => {
    function Probe() {
      return <output>{JSON.stringify(useWindowUrl(true) ?? null)}</output>;
    }
    expect(renderToString(<Probe />)).toBe('<output>null</output>');
    const { container } = render(<Probe />);
    expect(container.textContent).toBe(JSON.stringify({ pathname: '/', search: '', hash: '' }));
  });
});

describe('writeWindowUrl', () => {
  // This is necessary because Next and possibly other frameworks don't patch
  // history.pushState/replaceState until an effect, so we need to guarantee we
  // don't write until after that has happened
  it('builds a parked write when it lands, from the URL as it is then', async () => {
    vi.resetModules();
    const fresh = await import('../window-location');
    window.history.replaceState(null, '', '/page?a=1');

    fresh.writeWindowUrl(() => `${window.location.pathname}${window.location.search}&.user=security`, true);
    fresh.writeWindowUrl(() => `${window.location.pathname}${window.location.search}&.org=members`, true);
    window.history.replaceState(null, '', '/page?a=1&host=2');

    fresh.markSettled();
    expect(window.location.search).toBe('?a=1&host=2&.user=security&.org=members');
  });

  it('refuses a parked write that resolves to another origin when it lands', async () => {
    vi.resetModules();
    const fresh = await import('../window-location');
    const { logger: freshLogger } = await import('@clerk/shared/logger');
    const warn = vi.spyOn(freshLogger, 'warnOnce').mockImplementation(() => {});
    window.history.replaceState(null, '', '/page');

    fresh.writeWindowUrl(() => '//evil.example/x', false);
    fresh.markSettled();
    expect(window.location.pathname).toBe('/page');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('another origin'));
    warn.mockRestore();
  });

  it('parks writes until the page has settled, then lands them in order', async () => {
    vi.resetModules();
    const fresh = await import('../window-location');
    window.history.replaceState(null, '', '/');
    const length = window.history.length;

    fresh.writeWindowUrl('/user', false);
    fresh.writeWindowUrl('/user/security', true);
    expect(window.location.pathname).toBe('/');
    expect(window.history.length).toBe(length);

    fresh.markSettled();
    expect(window.location.pathname).toBe('/user/security');
    expect(window.history.length).toBe(length + 1);

    fresh.writeWindowUrl('/user/account', true);
    expect(window.location.pathname).toBe('/user/account');
  });

  it('writes no history state, so a host router keeps its bookkeeping off entries it did not make', () => {
    window.history.replaceState({ host: 'data', idx: 3 }, '', '/');
    const length = window.history.length;

    writeWindowUrl('/user', false);
    expect(window.history.length).toBe(length + 1);
    expect(window.history.state).toBeNull();

    writeWindowUrl('/user/security', true);
    expect(window.history.length).toBe(length + 1);
    expect(window.location.pathname).toBe('/user/security');
    expect(window.history.state).toBeNull();
  });
});
