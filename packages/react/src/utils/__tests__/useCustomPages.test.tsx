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
    expect(result.current.customPagesPortals[0]).not.toBe(result.current.customPagesPortals[2]);
    expect(result.current.customPagesPortals[1]).not.toBe(result.current.customPagesPortals[3]);
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

    const secondPageContentPortal = result.current.customPagesPortals[0];
    const secondPageIconPortal = result.current.customPagesPortals[1];

    rerender({ includeFirstPage: true });

    expect(result.current.customPages).toHaveLength(2);
    expect(result.current.customPagesPortals[0]).not.toBe(secondPageContentPortal);
    expect(result.current.customPagesPortals[1]).not.toBe(secondPageIconPortal);
    expect(result.current.customPagesPortals[2]).toBe(secondPageContentPortal);
    expect(result.current.customPagesPortals[3]).toBe(secondPageIconPortal);
  });
});
