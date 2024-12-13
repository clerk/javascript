import { renderHook } from '@testing-library/react';
import React from 'react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';


import { MenuAction, MenuItems, MenuLink } from '../../components/uiComponents';
import { useUserButtonCustomMenuItems } from '../useCustomMenuItems';

// Mock the logErrorInDevMode function
vi.mock('@clerk/shared', () => ({
  logErrorInDevMode: vi.fn(),
}));

describe('useUserButtonCustomMenuItems', () => {
  it('should return empty arrays when no children are provided', () => {
    const { result } = renderHook(() => useUserButtonCustomMenuItems(null));
    expect(result.current.customMenuItems).toEqual([]);
    expect(result.current.customMenuItemsPortals).toEqual([]);
  });

  it('should process valid MenuAction items', () => {
    const children = (
      <MenuItems>
        <MenuAction
          label='Custom Action'
          labelIcon={<div>Icon</div>}
          onClick={() => {}}
        />
      </MenuItems>
    );
    const { result } = renderHook(() => useUserButtonCustomMenuItems(children));
    expect(result.current.customMenuItems).toHaveLength(1);
    expect(result.current.customMenuItems[0].label).toBe('Custom Action');
    expect(result.current.customMenuItems[0].onClick).toBeDefined();
    expect(result.current.customMenuItemsPortals).toHaveLength(1);
  });

  it('should process valid MenuLink items', () => {
    const children = (
      <MenuItems>
        <MenuLink
          label='Custom Link'
          labelIcon={<div>Icon</div>}
          href='https://example.com'
        />
      </MenuItems>
    );
    const { result } = renderHook(() => useUserButtonCustomMenuItems(children));
    expect(result.current.customMenuItems).toHaveLength(1);
    expect(result.current.customMenuItems[0].label).toBe('Custom Link');
    expect(result.current.customMenuItems[0].href).toBe('https://example.com');
    expect(result.current.customMenuItemsPortals).toHaveLength(1);
  });

  it('should process reorder items', () => {
    const children = (
      <MenuItems>
        <MenuAction label='manageAccount' />
        <MenuAction label='signOut' />
      </MenuItems>
    );
    const { result } = renderHook(() => useUserButtonCustomMenuItems(children));
    expect(result.current.customMenuItems).toHaveLength(2);
    expect(result.current.customMenuItems[0].label).toBe('manageAccount');
    expect(result.current.customMenuItems[1].label).toBe('signOut');
    expect(result.current.customMenuItemsPortals).toHaveLength(0);
  });

  it('should ignore invalid children', () => {
    const children = (
      <MenuItems>
        <div>Invalid Child</div>
      </MenuItems>
    );
    const { result } = renderHook(() => useUserButtonCustomMenuItems(children));
    expect(result.current.customMenuItems).toHaveLength(0);
    expect(result.current.customMenuItemsPortals).toHaveLength(0);
  });

  it('should process MenuAction items with open attribute', () => {
    const children = (
      <MenuItems>
        <MenuAction
          label='Open Profile'
          labelIcon={<div>Icon</div>}
          open='/profile'
        />
      </MenuItems>
    );
    const { result } = renderHook(() => useUserButtonCustomMenuItems(children));
    expect(result.current.customMenuItems).toHaveLength(1);
    expect(result.current.customMenuItems[0].label).toBe('Open Profile');
    expect(result.current.customMenuItems[0].open).toBe('/profile');
    expect(result.current.customMenuItemsPortals).toHaveLength(1);
  });

  it('should prepend "/" to open attribute if not present', () => {
    const children = (
      <MenuItems>
        <MenuAction
          label='Open Settings'
          labelIcon={<div>Icon</div>}
          open='settings'
        />
      </MenuItems>
    );
    const { result } = renderHook(() => useUserButtonCustomMenuItems(children));
    expect(result.current.customMenuItems).toHaveLength(1);
    expect(result.current.customMenuItems[0].open).toBe('/settings');
  });

  it('should process valid MenuAction items and call onClick when triggered', () => {
    const mockOnClick = vi.fn();
    const children = (
      <MenuItems>
        <MenuAction
          label='Custom Action'
          labelIcon={<div>Icon</div>}
          onClick={mockOnClick}
        />
      </MenuItems>
    );
    const { result } = renderHook(() => useUserButtonCustomMenuItems(children));

    expect(result.current.customMenuItems).toHaveLength(1);

    const menuItem = result.current.customMenuItems[0];
    expect(menuItem).toBeDefined();
    expect(menuItem.label).toBe('Custom Action');
    expect(menuItem.onClick).toBeDefined();

    expect(result.current.customMenuItemsPortals).toHaveLength(1);

    if (menuItem.onClick) {
      menuItem.onClick();
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    }
  });
});
