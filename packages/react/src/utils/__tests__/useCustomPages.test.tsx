import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { OrganizationProfilePage } from '../../components/uiComponents';
import { useOrganizationProfileCustomPages } from '../useCustomPages';

vi.mock('@clerk/shared', () => ({
  logErrorInDevMode: vi.fn(),
}));

describe('useOrganizationProfileCustomPages', () => {
  it('uses separate portals for duplicate non-keyed custom pages', () => {
    const children = [
      React.createElement(
        OrganizationProfilePage,
        {
          label: 'Duplicate',
          labelIcon: <div>First icon</div>,
          url: 'duplicate',
        },
        <div>First content</div>,
      ),
      React.createElement(
        OrganizationProfilePage,
        {
          label: 'Duplicate',
          labelIcon: <div>Second icon</div>,
          url: 'duplicate',
        },
        <div>Second content</div>,
      ),
    ];

    const { result } = renderHook(() => useOrganizationProfileCustomPages(children));

    expect(result.current.customPages).toHaveLength(2);
    expect(result.current.customPagesPortals).toHaveLength(4);
    // Duplicate (same label+url, no key) pages get distinct portal identities...
    expect(result.current.customPagesPortals[0].portal).not.toBe(result.current.customPagesPortals[2].portal);
    expect(result.current.customPagesPortals[1].portal).not.toBe(result.current.customPagesPortals[3].portal);
    // ...and distinct stable render keys.
    const keys = result.current.customPagesPortals.map(p => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('keeps portal identity with the logical custom page when inserting before it', () => {
    const firstPage = (
      <OrganizationProfilePage
        key='first'
        label='First page'
        labelIcon={<div>First icon</div>}
        url='first'
      >
        <div>First content</div>
      </OrganizationProfilePage>
    );
    const secondPage = (
      <OrganizationProfilePage
        key='second'
        label='Second page'
        labelIcon={<div>Second icon</div>}
        url='second'
      >
        <div>Second content</div>
      </OrganizationProfilePage>
    );
    const makeChildren = (includeFirstPage: boolean) => (includeFirstPage ? [firstPage, secondPage] : [secondPage]);

    const { result, rerender } = renderHook(
      ({ includeFirstPage }) => useOrganizationProfileCustomPages(makeChildren(includeFirstPage)),
      {
        initialProps: { includeFirstPage: false },
      },
    );

    const secondPageContentPortal = result.current.customPagesPortals[0].portal;
    const secondPageContentKey = result.current.customPagesPortals[0].key;
    const secondPageIconPortal = result.current.customPagesPortals[1].portal;
    const secondPageIconKey = result.current.customPagesPortals[1].key;

    rerender({ includeFirstPage: true });

    expect(result.current.customPages).toHaveLength(2);
    expect(result.current.customPagesPortals[0].portal).not.toBe(secondPageContentPortal);
    expect(result.current.customPagesPortals[1].portal).not.toBe(secondPageIconPortal);
    // The second page keeps BOTH its portal identity and its stable render key when it moves
    // position, so CustomPortalsRenderer reconciles it as an update instead of a remount.
    expect(result.current.customPagesPortals[2].portal).toBe(secondPageContentPortal);
    expect(result.current.customPagesPortals[2].key).toBe(secondPageContentKey);
    expect(result.current.customPagesPortals[3].portal).toBe(secondPageIconPortal);
    expect(result.current.customPagesPortals[3].key).toBe(secondPageIconKey);
  });
});
