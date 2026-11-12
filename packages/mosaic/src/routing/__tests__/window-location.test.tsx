import { act, render, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it } from 'vitest';

import { readWindowUrl, useWindowUrl, writeWindowUrl } from '../window-location';

beforeEach(() => window.history.replaceState(null, '', '/'));

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

  it('follows its own writes without an event', () => {
    const { result } = renderHook(() => useWindowUrl(true));
    act(() => writeWindowUrl('/user?p.user=security', false));
    expect(result.current).toEqual({ pathname: '/user', search: 'p.user=security', hash: '' });
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
  it('pushes or replaces, keeping the history state', () => {
    window.history.replaceState({ host: 'data' }, '', '/');
    const length = window.history.length;

    writeWindowUrl('/user', false);
    expect(window.history.length).toBe(length + 1);
    expect(window.history.state).toEqual({ host: 'data' });

    writeWindowUrl('/user/security', true);
    expect(window.history.length).toBe(length + 1);
    expect(window.location.pathname).toBe('/user/security');
    expect(window.history.state).toEqual({ host: 'data' });
  });

  it('drops the Next.js App Router marker so Next applies the write', () => {
    window.history.replaceState({ __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: ['tree'] }, '', '/');

    writeWindowUrl('/user', false);
    expect(window.history.state).toEqual({ __PRIVATE_NEXTJS_INTERNALS_TREE: ['tree'] });

    writeWindowUrl('/user/security', true);
    expect(window.history.state).toEqual({ __PRIVATE_NEXTJS_INTERNALS_TREE: ['tree'] });
  });
});
