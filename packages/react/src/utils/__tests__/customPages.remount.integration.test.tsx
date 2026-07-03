import { render, screen } from '@testing-library/react';
import React, { createElement, useEffect, useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OrganizationProfilePage } from '../../components/uiComponents';
import { useOrganizationProfileCustomPages } from '../useCustomPages';

vi.mock('@clerk/shared/utils', () => ({
  logErrorInDevMode: vi.fn(),
}));

// Per-page mount/unmount counters. A remount re-runs the mount effect.
const mounts: Record<string, number> = {};
const unmounts: Record<string, number> = {};

// Stable component type, defined once. If it remounts across a rerender it is
// because the portal wrapping it changed identity or render key.
const TrackedContent = ({ id, text }: { id: string; text: string }) => {
  useEffect(() => {
    mounts[id] = (mounts[id] ?? 0) + 1;
    return () => {
      unmounts[id] = (unmounts[id] ?? 0) + 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-once instrument; id is stable per instance
  }, []);
  return <div data-testid={`content-${id}`}>{text}</div>;
};

/**
 * Faithfully reproduces the production render path for custom pages:
 *  - useOrganizationProfileCustomPages parses children into { customPages, customPagesPortals }
 *  - clerk-js calls customPages[i].mount(node) once per logical page (by identity; here keyed by url)
 *  - CustomPortalsRenderer renders each portal via createElement(portal, { key }) using the STABLE key
 */
const Harness = ({ children, tick }: { children: React.ReactNode; tick: number }) => {
  const { customPages, customPagesPortals } = useOrganizationProfileCustomPages(children);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mountedUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    customPages.forEach(page => {
      if (page.mount && page.url && !mountedUrls.current.has(page.url)) {
        mountedUrls.current.add(page.url);
        const node = document.createElement('div');
        hostRef.current?.appendChild(node);
        page.mount(node);
      }
    });
  });

  return (
    <>
      <div
        data-tick={tick}
        ref={hostRef}
      />
      {customPagesPortals.map(({ key, portal }) => createElement(portal, { key }))}
    </>
  );
};

const makePage = (id: string, label: string, url: string, text: string) => (
  <OrganizationProfilePage
    key={id}
    label={label}
    labelIcon={<span>i</span>}
    url={url}
  >
    <TrackedContent
      id={id}
      text={text}
    />
  </OrganizationProfilePage>
);

afterEach(() => {
  for (const k of Object.keys(mounts)) {
    delete mounts[k];
  }
  for (const k of Object.keys(unmounts)) {
    delete unmounts[k];
  }
});

describe('custom pages remount behavior (integration through CustomPortalsRenderer path)', () => {
  it('does not remount custom page content when the parent rerenders', async () => {
    const { rerender } = render(<Harness tick={0}>{[makePage('p1', 'Page 1', 'page-1', 'first')]}</Harness>);

    await screen.findByText('first');
    expect(mounts['p1']).toBe(1);

    // Parent rerenders for an unrelated reason; the page content prop changes but the
    // logical page (key/label/url) is identical.
    rerender(<Harness tick={1}>{[makePage('p1', 'Page 1', 'page-1', 'second')]}</Harness>);

    await screen.findByText('second');
    expect(mounts['p1']).toBe(1);
    expect(unmounts['p1'] ?? 0).toBe(0);
  });

  it('does not remount a surviving custom page when another page is inserted before it', async () => {
    const second = makePage('second', 'Second', 'second', 'second-content');
    const first = makePage('first', 'First', 'first', 'first-content');

    const { rerender } = render(<Harness tick={0}>{[second]}</Harness>);
    await screen.findByText('second-content');
    expect(mounts['second']).toBe(1);

    // Insert a new page BEFORE the existing one.
    rerender(<Harness tick={1}>{[first, second]}</Harness>);
    await screen.findByText('first-content');

    // The surviving page keeps its stable key + portal identity, so React reconciles it as an
    // update rather than a remount.
    expect(mounts['second']).toBe(1);
    expect(unmounts['second'] ?? 0).toBe(0);
    // The newly inserted page mounts exactly once.
    expect(mounts['first']).toBe(1);
  });
});
